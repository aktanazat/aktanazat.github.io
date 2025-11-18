import { useState, useEffect, useCallback, useRef } from 'react'

// types.ts
export interface ReactorState {
  // Core Status
  controlRodPosition: number // 0-100% (100% = Fully Inserted)
  fuelTemp: number // Celsius
  coolantTemp: number // Celsius
  pressure: number // MPa
  neutronFlux: number // 0-100% power nominal
  xenonLevel: number // Poison level
  
  // Systems
  coolantPumpSpeed: number // 0-100%
  turbineSpeed: number // RPM
  gridLoad: number // MW
  outputMw: number // MW
  
  // New: Thermal Cycle
  steamPressure: number // MPa
  condenserTemp: number // Celsius
  feedwaterFlow: number // %
  
  // New: Environmental
  ambientTemp: number // Celsius
  coolingTowerEfficiency: number // %
  
  // Alarms & Status
  isScrammed: boolean
  alarms: string[]
  status: 'SHUTDOWN' | 'STARTUP' | 'CRITICAL' | 'POWER_OPS' | 'TRIPPED'
  
  // Abstract Core Model (Grid of 4 quadrants)
  coreRegions: {
      id: number
      temp: number
      power: number
      flux: number
  }[]
}

export interface SimulationParams {
  tickRate: number // ms
}

const INITIAL_STATE: ReactorState = {
  controlRodPosition: 100,
  fuelTemp: 25,
  coolantTemp: 25,
  pressure: 0.1,
  neutronFlux: 0,
  xenonLevel: 0,
  coolantPumpSpeed: 0,
  turbineSpeed: 0,
  gridLoad: 0,
  outputMw: 0,
  
  steamPressure: 0.1,
  condenserTemp: 20,
  feedwaterFlow: 0,
  
  ambientTemp: 20,
  coolingTowerEfficiency: 100,

  isScrammed: false,
  alarms: [],
  status: 'SHUTDOWN',
  
  coreRegions: [
      { id: 1, temp: 25, power: 0, flux: 0 },
      { id: 2, temp: 25, power: 0, flux: 0 },
      { id: 3, temp: 25, power: 0, flux: 0 },
      { id: 4, temp: 25, power: 0, flux: 0 },
  ]
}

// Constants
const MAX_PRESSURE = 16
const OPERATING_PRESSURE = 15.5
const BASE_XENON_DECAY = 0.001
const XENON_PRODUCTION_RATE = 0.005
const XENON_BURNUP_RATE = 0.0001

export function useReactorSimulation({ tickRate = 100 }: SimulationParams = { tickRate: 100 }) {
  const [state, setState] = useState<ReactorState>(INITIAL_STATE)
  const stateRef = useRef(state)
  
  useEffect(() => {
    stateRef.current = state
  }, [state])

  const tick = useCallback(() => {
    const s = stateRef.current
    let newState = { ...s }

    // --- 1. Neutronics (Simplified Point Kinetics with Core Regions) ---
    
    const rodReactivity = (50 - s.controlRodPosition) * 0.05 
    const tempFeedback = (s.fuelTemp - 300) * -0.0001 
    const xenonFeedback = s.xenonLevel * -0.01
    const totalReactivity = rodReactivity + tempFeedback + xenonFeedback

    // Power change rate
    let powerChange = s.neutronFlux * totalReactivity * 0.1
    
    // Startup source
    if (s.neutronFlux < 0.1 && s.controlRodPosition < 80 && !s.isScrammed) {
      powerChange += 0.05
    }

    if (s.isScrammed) {
        newState.neutronFlux = s.neutronFlux * 0.9
    } else {
        newState.neutronFlux = Math.max(0, Math.min(120, s.neutronFlux + powerChange))
    }

    // Xenon
    const xenonProd = newState.neutronFlux * XENON_PRODUCTION_RATE
    const xenonDecay = s.xenonLevel * BASE_XENON_DECAY
    const xenonBurn = s.xenonLevel * newState.neutronFlux * XENON_BURNUP_RATE
    newState.xenonLevel = Math.max(0, s.xenonLevel + xenonProd - xenonDecay - xenonBurn)

    // Update Core Regions (Slight variation for "realism")
    newState.coreRegions = s.coreRegions.map((r, i) => {
        // Random variation per region
        const variation = 1 + (Math.random() * 0.02 - 0.01)
        const regionFlux = newState.neutronFlux * variation
        const regionHeatGen = regionFlux * 5.0
        const heatTransfer = (r.temp - s.coolantTemp) * 0.2
        
        let newTemp = r.temp + (regionHeatGen - heatTransfer) * 0.1
        // Ambient loss
        newTemp -= (newTemp - 25) * 0.001
        
        return {
            ...r,
            flux: regionFlux,
            power: regionFlux, // simplified
            temp: newTemp
        }
    })
    
    // Average fuel temp from regions
    newState.fuelTemp = newState.coreRegions.reduce((acc, r) => acc + r.temp, 0) / 4

    // --- 2. Thermodynamics & Primary Loop ---
    
    const heatTransferToCoolant = (newState.fuelTemp - s.coolantTemp) * 0.2 * (s.coolantPumpSpeed > 0 ? 1 : 0.1)
    
    // Heat removal by Steam Gen (Secondary Loop)
    // Proportional to T_primary - T_steam and Feedwater flow
    const heatRemovalBySteamGen = (s.coolantTemp - 100) * 0.15 * (s.coolantPumpSpeed / 100)
    
    newState.coolantTemp = s.coolantTemp + (heatTransferToCoolant - heatRemovalBySteamGen) * 0.05
    
    // Ambient cooling
    newState.fuelTemp -= (newState.fuelTemp - 25) * 0.001
    newState.coolantTemp -= (newState.coolantTemp - 25) * 0.001
    
    // Pressure Control (Pressurizer simplified)
    const targetPressure = (newState.coolantTemp / 300) * 15 
    newState.pressure = s.pressure + (targetPressure - s.pressure) * 0.02

    // --- 3. Secondary Loop (Steam Cycle) ---
    
    // Steam pressure follows Primary Temp but lags
    const targetSteamPressure = (newState.coolantTemp / 320) * 8 // 8 MPa secondary
    newState.steamPressure = s.steamPressure + (targetSteamPressure - s.steamPressure) * 0.01
    
    // Condenser
    // Efficiency drops if ambient temp is high
    const coolingEff = Math.max(0.5, 1 - (s.ambientTemp - 20) * 0.01)
    newState.coolingTowerEfficiency = coolingEff * 100
    newState.condenserTemp = s.ambientTemp + (newState.outputMw * 0.05) / coolingEff

    // --- 4. Turbine / Electrical ---
    if (newState.steamPressure > 2) {
      const targetRPM = (newState.steamPressure / 8) * 1800 
      newState.turbineSpeed = s.turbineSpeed + (targetRPM - s.turbineSpeed) * 0.01
    } else {
      newState.turbineSpeed = s.turbineSpeed * 0.99 
    }

    // Generator Output
    newState.outputMw = (newState.turbineSpeed / 1800) * newState.neutronFlux * 10 * (coolingEff)

    // --- 5. Alarms & Trips ---
    const newAlarms = []
    if (newState.fuelTemp > 2000) newAlarms.push('CORE MELT RISK')
    if (newState.pressure > MAX_PRESSURE) newAlarms.push('PRI OVERPRESSURE')
    if (newState.neutronFlux > 110) newAlarms.push('OVERPOWER')
    if (newState.xenonLevel > 50) newAlarms.push('XENON POISONING')
    if (newState.condenserTemp > 80) newAlarms.push('CONDENSER HOT')
    
    newState.alarms = newAlarms

    // Auto-Scram
    if (newState.fuelTemp > 2200 || newState.pressure > 17 || newState.condenserTemp > 95) {
      if (!newState.isScrammed) {
          newState.isScrammed = true
          newState.controlRodPosition = 100
          newState.status = 'TRIPPED'
          newState.alarms.push('AUTO SCRAM')
      }
    }

    // Status logic
    if (!newState.isScrammed) {
        if (newState.neutronFlux > 1) newState.status = 'CRITICAL'
        if (newState.outputMw > 100) newState.status = 'POWER_OPS'
        if (newState.neutronFlux < 1 && newState.coolantPumpSpeed > 0) newState.status = 'STARTUP'
        if (newState.controlRodPosition === 100) newState.status = 'SHUTDOWN'
    }

    setState(newState)
  }, [])

  useEffect(() => {
    const interval = setInterval(tick, tickRate)
    return () => clearInterval(interval)
  }, [tick, tickRate])

  // Actions
  const setRodPosition = (val: number) => {
    if (state.isScrammed) return
    setState(prev => ({ ...prev, controlRodPosition: Math.max(0, Math.min(100, val)) }))
  }

  const setPumpSpeed = (val: number) => {
    setState(prev => ({ ...prev, coolantPumpSpeed: Math.max(0, Math.min(100, val)) }))
  }
  
  const setFeedwaterFlow = (val: number) => {
      setState(prev => ({ ...prev, feedwaterFlow: val }))
  }

  const scram = () => {
    setState(prev => ({ 
        ...prev, 
        isScrammed: true, 
        controlRodPosition: 100, 
        status: 'TRIPPED',
        alarms: [...prev.alarms, 'MANUAL SCRAM'] 
    }))
  }

  const reset = () => {
    setState(INITIAL_STATE)
  }

  return {
    state,
    actions: {
      setRodPosition,
      setPumpSpeed,
      setFeedwaterFlow,
      scram,
      reset
    }
  }
}

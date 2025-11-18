import { useState, useEffect, useCallback, useRef } from 'react'

// types.ts
export interface ReactorState {
  // Core Status
  controlRodPosition: number // 0-100% (100% = Fully Inserted)
  fuelTemp: number // Celsius
  coolantTemp: number // Celsius
  pressure: number // MPa
  neutronFlux: number // Logarithmic scale usually, but 0-100% power for simplicity
  xenonLevel: number // Poison level (arbitrary units, > 50 hinders restart)
  
  // Systems
  coolantPumpSpeed: number // 0-100%
  turbineSpeed: number // RPM
  gridLoad: number // MW
  outputMw: number // MW
  
  // Alarms & Status
  isScrammed: boolean
  alarms: string[]
  status: 'SHUTDOWN' | 'STARTUP' | 'CRITICAL' | 'POWER_OPS' | 'TRIPPED'
}

export interface SimulationParams {
  tickRate: number // ms
}

const INITIAL_STATE: ReactorState = {
  controlRodPosition: 100,
  fuelTemp: 25,
  coolantTemp: 25,
  pressure: 0.1, // Atmospheric
  neutronFlux: 0,
  xenonLevel: 0,
  coolantPumpSpeed: 0,
  turbineSpeed: 0,
  gridLoad: 0,
  outputMw: 0,
  isScrammed: false,
  alarms: [],
  status: 'SHUTDOWN',
}

// Constants for physics
const MAX_PRESSURE = 16 // MPa
const BASE_XENON_DECAY = 0.001
const XENON_PRODUCTION_RATE = 0.005
const XENON_BURNUP_RATE = 0.0001

export function useReactorSimulation({ tickRate = 100 }: SimulationParams = { tickRate: 100 }) {
  const [state, setState] = useState<ReactorState>(INITIAL_STATE)
  const stateRef = useRef(state)
  
  // Keep ref in sync for the interval closure
  useEffect(() => {
    stateRef.current = state
  }, [state])

  const tick = useCallback(() => {
    const s = stateRef.current
    
    let newState = { ...s }

    // --- 1. Neutronics (Simplified Point Kinetics) ---
    
    const rodReactivity = (50 - s.controlRodPosition) * 0.05 
    const tempFeedback = (s.fuelTemp - 300) * -0.0001 
    const xenonFeedback = s.xenonLevel * -0.01 // Xenon poison negative reactivity
    const totalReactivity = rodReactivity + tempFeedback + xenonFeedback

    // Power change rate
    let powerChange = s.neutronFlux * totalReactivity * 0.1
    
    // Startup source term
    if (s.neutronFlux < 0.1 && s.controlRodPosition < 80 && !s.isScrammed) {
      powerChange += 0.05
    }

    if (s.isScrammed) {
        // Immediate drop
        newState.neutronFlux = s.neutronFlux * 0.9
    } else {
        newState.neutronFlux = Math.max(0, Math.min(120, s.neutronFlux + powerChange))
    }

    // Xenon Dynamics (Simplified)
    // Production proportional to flux (Iodine decay simplified to direct)
    const xenonProd = newState.neutronFlux * XENON_PRODUCTION_RATE
    // Decay is constant
    const xenonDecay = s.xenonLevel * BASE_XENON_DECAY
    // Burnup proportional to flux * xenon
    const xenonBurn = s.xenonLevel * newState.neutronFlux * XENON_BURNUP_RATE
    
    newState.xenonLevel = Math.max(0, s.xenonLevel + xenonProd - xenonDecay - xenonBurn)

    // --- 2. Thermodynamics ---
    const heatGen = newState.neutronFlux * 5.0
    const heatTransferToCoolant = (s.fuelTemp - s.coolantTemp) * 0.2
    
    newState.fuelTemp = s.fuelTemp + (heatGen - heatTransferToCoolant) * 0.1

    const heatRemovalBySteamGen = (s.coolantTemp - 100) * 0.15 * (s.coolantPumpSpeed / 100)
    newState.coolantTemp = s.coolantTemp + (heatTransferToCoolant - heatRemovalBySteamGen) * 0.05

    // Ambient cooling
    newState.fuelTemp -= (newState.fuelTemp - 25) * 0.001
    newState.coolantTemp -= (newState.coolantTemp - 25) * 0.001

    // --- 3. Hydrodynamics ---
    const targetPressure = (newState.coolantTemp / 300) * 15 
    newState.pressure = s.pressure + (targetPressure - s.pressure) * 0.02

    // --- 4. Turbine / Electrical ---
    if (newState.pressure > 5) {
      const targetRPM = (newState.pressure / 15) * 1800 
      newState.turbineSpeed = s.turbineSpeed + (targetRPM - s.turbineSpeed) * 0.01
    } else {
      newState.turbineSpeed = s.turbineSpeed * 0.99 
    }

    newState.outputMw = (newState.turbineSpeed / 1800) * newState.neutronFlux * 10

    // --- 5. Alarms & Trips ---
    const newAlarms = []
    if (newState.fuelTemp > 2000) newAlarms.push('CORE MELT RISK')
    if (newState.pressure > MAX_PRESSURE) newAlarms.push('OVERPRESSURE')
    if (newState.neutronFlux > 110) newAlarms.push('OVERPOWER')
    if (newState.xenonLevel > 50) newAlarms.push('XENON POISONING')
    
    newState.alarms = newAlarms

    // Auto-Scram
    if (newState.fuelTemp > 2200 || newState.pressure > 17) {
      newState.isScrammed = true
      newState.controlRodPosition = 100
      newState.status = 'TRIPPED'
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
      scram,
      reset
    }
  }
}

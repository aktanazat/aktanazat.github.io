import { useState, useEffect, useCallback, useRef } from 'react'

// Constants
const MAX_PRESSURE = 16
const OPERATING_PRESSURE = 15.5
const BASE_XENON_DECAY = 0.001
const XENON_PRODUCTION_RATE = 0.005
const XENON_BURNUP_RATE = 0.0001

// --- Config Types ---
export type ReactorType = 'PWR' | 'RBMK' | 'BWR'
export type ScenarioType = 'NORMAL' | 'TMI_ACCIDENT' | 'CHERNOBYL_RUN' | 'XENON_PIT'

export interface SimulationConfig {
    type: ReactorType
    scenario: ScenarioType
    difficulty: string
    coldStart: boolean
    manualSync: boolean // New: Synchroscope
    chemicalShim: boolean // New: Boron
}

export interface ReactorState {
  // Core Status
  controlRodPosition: number // 0-100% (100% = Fully Inserted)
  fuelTemp: number // Celsius
  coolantTemp: number // Celsius
  pressure: number // MPa
  neutronFlux: number // 0-120% power nominal
  xenonLevel: number // Poison level
  boronConcentration: number // ppm (New)
  
  // Systems
  coolantPumpSpeed: number // 0-100%
  turbineSpeed: number // RPM
  gridLoad: number // MW
  outputMw: number // MW
  
  // Electrical / Grid (New)
  gridFreq: number // Hz (60.00)
  turbineFreq: number // Hz
  gridPhase: number // 0-360
  turbinePhase: number // 0-360
  breakerOpen: boolean
  
  // Thermal Cycle
  steamPressure: number // MPa
  condenserTemp: number // Celsius
  feedwaterFlow: number // %
  
  // Environmental
  ambientTemp: number // Celsius
  coolingTowerEfficiency: number // %
  
  // Alarms & Status
  isScrammed: boolean
  alarms: string[]
  status: 'SHUTDOWN' | 'STARTUP' | 'CRITICAL' | 'POWER_OPS' | 'TRIPPED' | 'MELTDOWN'
  
  // Core Model (Expanded Grid of 3x3 = 9 regions for better visuals)
  coreRegions: {
      id: number
      temp: number
      power: number
      flux: number
  }[]

  // Config (stored in state)
  config: SimulationConfig

  // Historical Data
  history: {
      flux: number[]
      fuelTemp: number[]
      pressure: number[]
  }
}

export interface SimulationParams {
  tickRate: number // ms
  initialConfig?: SimulationConfig
}

// Helper to generate regions
const generateRegions = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: i + 1,
        temp: 25,
        power: 0,
        flux: 0
    }))
}

const DEFAULT_CONFIG: SimulationConfig = {
    type: 'PWR',
    scenario: 'NORMAL',
    difficulty: 'NORMAL',
    coldStart: false,
    manualSync: false,
    chemicalShim: false
}

const INITIAL_STATE: ReactorState = {
  controlRodPosition: 100,
  fuelTemp: 25,
  coolantTemp: 25,
  pressure: 0.1,
  neutronFlux: 0,
  xenonLevel: 0,
  boronConcentration: 1000, // Initial boron
  coolantPumpSpeed: 0,
  turbineSpeed: 0,
  gridLoad: 0,
  outputMw: 0,
  
  gridFreq: 60.00,
  turbineFreq: 0,
  gridPhase: 0,
  turbinePhase: 0,
  breakerOpen: true,
  
  steamPressure: 0.1,
  condenserTemp: 20,
  feedwaterFlow: 0,
  
  ambientTemp: 20,
  coolingTowerEfficiency: 100,

  isScrammed: false,
  alarms: [],
  status: 'SHUTDOWN',
  
  coreRegions: generateRegions(9), // 3x3 Grid

  config: DEFAULT_CONFIG,

  history: {
      flux: new Array(60).fill(0),
      fuelTemp: new Array(60).fill(25),
      pressure: new Array(60).fill(0.1)
  }
}

export function useReactorSimulation({ tickRate = 100, initialConfig }: SimulationParams = { tickRate: 100 }) {
  const [state, setState] = useState<ReactorState>(() => {
      if (!initialConfig) return INITIAL_STATE
      
      // Apply Scenario Logic at Initialization
      let s = { ...INITIAL_STATE, config: initialConfig }
      
      // If Cold Start is checked, force everything to 0/Ambient regardless of scenario
      if (initialConfig.coldStart) {
          s.controlRodPosition = 100
          s.neutronFlux = 0
          s.coolantPumpSpeed = 0
          s.feedwaterFlow = 0
          s.fuelTemp = 25
          s.coolantTemp = 25
          s.pressure = 0.1
          s.steamPressure = 0.1
          s.turbineSpeed = 0
          s.outputMw = 0
          s.status = 'SHUTDOWN'
          s.coreRegions = generateRegions(9)
          s.breakerOpen = true
          return s
      }

      // Otherwise, apply scenario presets
      if (initialConfig.scenario === 'CHERNOBYL_RUN') {
          s.neutronFlux = 50
          s.controlRodPosition = 20 // Dangerously withdrawn
          s.xenonLevel = 80 // High poison
          s.fuelTemp = 300
          s.coolantTemp = 280
          s.pressure = 6.5
          s.status = 'CRITICAL'
          s.coreRegions.forEach(r => r.temp = 300)
          s.breakerOpen = false // Already connected? Or maybe not for test
      }
      
      if (initialConfig.scenario === 'TMI_ACCIDENT') {
           s.neutronFlux = 95
           s.controlRodPosition = 10
           s.fuelTemp = 320
           s.pressure = 10
           s.coolantPumpSpeed = 100
           s.feedwaterFlow = 100
           s.status = 'POWER_OPS'
           s.coreRegions.forEach(r => r.temp = 320)
           s.breakerOpen = false // Connected
           s.turbineSpeed = 1800
      }

      if (initialConfig.scenario === 'XENON_PIT') {
          s.isScrammed = true
          s.controlRodPosition = 100
          s.xenonLevel = 95 // Very high
          s.status = 'TRIPPED'
          s.breakerOpen = true
      }

      return s
  })
  
  const stateRef = useRef(state)
  
  useEffect(() => {
    stateRef.current = state
  }, [state])

  const tick = useCallback(() => {
    const s = stateRef.current
    let newState = { ...s }

    // --- DIFFICULTY MODIFIERS ---
    let heatAccumulationFactor = 0.1
    let meltdownThreshold = 2800
    let scramThreshold = 2400

    if (s.config.difficulty === 'TRAINEE') {
        heatAccumulationFactor = 0.05 // Slower heating
        meltdownThreshold = 3500 // Harder to melt
        scramThreshold = 2200 // Earlier auto-scram (safer)
    } else if (s.config.difficulty === 'VETERAN') {
        heatAccumulationFactor = 0.2 // Fast transients
        meltdownThreshold = 2600
        scramThreshold = 2600 // Late auto-scram (requires manual intervention)
    }

    // --- 1. Neutronics & Physics Coefficients ---
    
    // Default coefficients (PWR - Safe)
    let voidCoeff = -0.0001 // Negative void coeff (Temp increase -> Power decrease)
    let rodWorth = 0.05
    
    // RBMK - Unstable Logic
    if (s.config.type === 'RBMK') {
        // Positive void coefficient at low power / high void fraction
        // In scenario "CHERNOBYL_RUN", this is exacerbated
        if (s.neutronFlux < 40) {
            voidCoeff = 0.0008 // VERY STRONG POSITIVE FEEDBACK
        } else {
            voidCoeff = -0.00005 
        }
        rodWorth = 0.02 // Slow graphite rods
    }

    const rodReactivity = (50 - s.controlRodPosition) * rodWorth
    const tempFeedback = (s.fuelTemp - 300) * voidCoeff
    const xenonFeedback = s.xenonLevel * -0.01
    
    // Boron (Chemical Shim)
    let boronReactivity = 0
    if (s.config.chemicalShim) {
        // 1000 ppm = -5% reactivity approx
        boronReactivity = (s.boronConcentration / 1000) * -0.05
    }

    const totalReactivity = rodReactivity + tempFeedback + xenonFeedback + boronReactivity

    // Power change rate
    let powerChange = s.neutronFlux * totalReactivity * heatAccumulationFactor
    
    // Startup source
    if (s.neutronFlux < 0.1 && s.controlRodPosition < 80 && !s.isScrammed) {
      powerChange += 0.05
    }

    // TMI Scenario Logic: Pressure relief valve stuck open
    // Logic: Loss of pressure -> boiling -> voids -> poor heat transfer
    if (s.config.scenario === 'TMI_ACCIDENT' && !s.config.coldStart) {
        // Artificial pressure drop simulating stuck valve
        if (s.pressure > 4) {
             newState.pressure -= 0.05 * (s.pressure / 10)
        }
        
        // Loss of inventory affects cooling efficiency
        // If pressure drops too low, coolant turns to steam voids -> poor heat transfer
        if (s.pressure < 8 && s.neutronFlux > 10) {
             // Heat is NOT removed efficiently
             // This simulates the core uncovery
             heatAccumulationFactor *= 1.5 
        }
    }

    if (s.isScrammed) {
        newState.neutronFlux = s.neutronFlux * 0.9
    } else {
        let maxFlux = 200
        if (s.config.scenario === 'CHERNOBYL_RUN') maxFlux = 500 // Power excursion allowed
        newState.neutronFlux = Math.max(0, Math.min(maxFlux, s.neutronFlux + powerChange))
    }

    // Xenon Dynamics
    const xenonProd = newState.neutronFlux * XENON_PRODUCTION_RATE
    const xenonDecay = s.xenonLevel * BASE_XENON_DECAY
    const xenonBurn = s.xenonLevel * newState.neutronFlux * XENON_BURNUP_RATE
    newState.xenonLevel = Math.max(0, s.xenonLevel + xenonProd - xenonDecay - xenonBurn)

    // Update Core Regions (9 Regions)
    newState.coreRegions = s.coreRegions.map((r, i) => {
        // Hotspots logic for RBMK/Chernobyl
        let variation = 1 + (Math.random() * 0.02 - 0.01)
        
        if (s.config.type === 'RBMK' && s.controlRodPosition < 10) {
             // Bottom of core power surge 
             if (i > 6) variation += 0.5 
        }

        const regionFlux = newState.neutronFlux * variation
        const regionHeatGen = regionFlux * 5.0
        const heatTransfer = (r.temp - s.coolantTemp) * 0.2
        
        let newTemp = r.temp + (regionHeatGen - heatTransfer) * heatAccumulationFactor
        // Ambient loss
        newTemp -= (newTemp - 25) * 0.001
        
        return {
            ...r,
            flux: regionFlux,
            power: regionFlux,
            temp: newTemp
        }
    })
    
    // Average fuel temp
    newState.fuelTemp = newState.coreRegions.reduce((acc, r) => acc + r.temp, 0) / newState.coreRegions.length

    // --- 2. Thermodynamics & Primary Loop ---
    
    const heatTransferToCoolant = (newState.fuelTemp - s.coolantTemp) * 0.2 * (s.coolantPumpSpeed > 0 ? 1 : 0.1)
    const heatRemovalBySteamGen = (s.coolantTemp - 100) * 0.15 * (s.coolantPumpSpeed / 100)
    
    newState.coolantTemp = s.coolantTemp + (heatTransferToCoolant - heatRemovalBySteamGen) * 0.05
    
    // Ambient cooling
    newState.fuelTemp -= (newState.fuelTemp - 25) * 0.001
    newState.coolantTemp -= (newState.coolantTemp - 25) * 0.001
    
    // Pressure Control
    const targetPressure = (newState.coolantTemp / 300) * 15 
    newState.pressure = s.pressure + (targetPressure - s.pressure) * 0.02

    // --- 3. Secondary Loop ---
    const targetSteamPressure = (newState.coolantTemp / 320) * 8 
    newState.steamPressure = s.steamPressure + (targetSteamPressure - s.steamPressure) * 0.01
    
    const coolingEff = Math.max(0.5, 1 - (s.ambientTemp - 20) * 0.01)
    newState.coolingTowerEfficiency = coolingEff * 100
    newState.condenserTemp = s.ambientTemp + (newState.outputMw * 0.05) / coolingEff

    // --- 4. Turbine / Electrical / Synchroscope ---
    
    // Turbine Speed Logic
    if (newState.steamPressure > 2) {
      // Target RPM based on steam pressure (simplified governor)
      const targetRPM = (newState.steamPressure / 8) * 1800 
      newState.turbineSpeed = s.turbineSpeed + (targetRPM - s.turbineSpeed) * 0.01
    } else {
      newState.turbineSpeed = s.turbineSpeed * 0.99 
    }

    // Frequency Calculation (RPM / 30 for 60Hz at 1800)
    newState.turbineFreq = newState.turbineSpeed / 30
    
    // Phase Calculation (Integral of frequency difference)
    // If turbine is faster, phase advances
    const freqDiff = newState.turbineFreq - s.gridFreq
    newState.turbinePhase = (s.turbinePhase + freqDiff * 360 * (tickRate / 1000)) % 360
    if (newState.turbinePhase < 0) newState.turbinePhase += 360

    // Generator Output Logic
    if (!s.breakerOpen) {
        // Locked to grid
        newState.turbineSpeed = 1800 // Grid forces sync
        newState.turbineFreq = 60
        newState.turbinePhase = 0 // Synced
        
        // Load follows flux/steam
        newState.outputMw = (newState.neutronFlux * 10) * coolingEff
    } else {
        newState.outputMw = 0
    }

    // --- 5. Alarms & Trips ---
    const newAlarms = []
    if (newState.fuelTemp > 2000) newAlarms.push('CORE TEMP HIGH')
    if (newState.pressure > MAX_PRESSURE) newAlarms.push('PRI OVERPRESSURE')
    if (newState.neutronFlux > 110) newAlarms.push('OVERPOWER')
    if (newState.xenonLevel > 50) newAlarms.push('XENON POISONING')
    
    // Meltdown Logic
    if (newState.fuelTemp > meltdownThreshold) {
        newState.status = 'MELTDOWN'
        newAlarms.push('CORE MELTDOWN IMMINENT')
    }
    
    newState.alarms = newAlarms

    // Auto-Scram (Only works if not disabled in scenarios like Chernobyl?)
    if ((newState.fuelTemp > scramThreshold || newState.pressure > 17) && !newState.isScrammed && newState.status !== 'MELTDOWN') {
          // In Chernobyl scenario, auto-scram might be "disabled" or delayed for realism?
          // For now, we'll keep it but make it harder to reach in that mode by relying on user action.
          if (s.config.scenario !== 'CHERNOBYL_RUN') {
            newState.isScrammed = true
            newState.controlRodPosition = 100
            newState.status = 'TRIPPED'
            newState.alarms.push('AUTO SCRAM')
            newState.breakerOpen = true // Trip turbine
          } else {
              // In Chernobyl run, scramming might actually CAUSE the explosion (positive scram effect not fully modeled but implies danger)
              if (!newState.isScrammed) newAlarms.push('SCRAM REQUIRED')
          }
    }

    // Status logic
    if (!newState.isScrammed && newState.status !== 'MELTDOWN') {
        if (newState.neutronFlux > 1) newState.status = 'CRITICAL'
        if (newState.outputMw > 100) newState.status = 'POWER_OPS'
        if (newState.neutronFlux < 1 && newState.coolantPumpSpeed > 0) newState.status = 'STARTUP'
        if (newState.controlRodPosition === 100) newState.status = 'SHUTDOWN'
    }

    // Update History
    if (!newState.history) newState.history = { flux: [], fuelTemp: [], pressure: [] }
    
    const prevFlux = s.history?.flux || new Array(60).fill(0)
    const prevTemp = s.history?.fuelTemp || new Array(60).fill(25)
    const prevPress = s.history?.pressure || new Array(60).fill(0.1)

    newState.history.flux = [...prevFlux.slice(1), newState.neutronFlux]
    newState.history.fuelTemp = [...prevTemp.slice(1), newState.fuelTemp]
    newState.history.pressure = [...prevPress.slice(1), newState.pressure]

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

  const setBoronConcentration = (val: number) => {
      setState(prev => ({ ...prev, boronConcentration: Math.max(0, val) }))
  }

  const toggleBreaker = () => {
      setState(prev => {
          // If trying to close
          if (prev.breakerOpen) {
              // Check sync if manual mode is on
              if (prev.config.manualSync) {
                  const phaseDiff = Math.abs(prev.turbinePhase) // 0 is target
                  const freqDiff = Math.abs(prev.turbineFreq - prev.gridFreq)
                  
                  // Allow small margin
                  if (phaseDiff > 20 || freqDiff > 0.5) {
                      // BAD SYNC -> TRIP
                      return {
                          ...prev,
                          isScrammed: true,
                          controlRodPosition: 100,
                          status: 'TRIPPED',
                          alarms: [...prev.alarms, 'BAD SYNC - TURBINE TRIP']
                      }
                  }
              }
              return { ...prev, breakerOpen: false }
          } else {
              // Opening breaker
              return { ...prev, breakerOpen: true }
          }
      })
  }

  const scram = () => {
    setState(prev => ({ 
        ...prev, 
        isScrammed: true, 
        controlRodPosition: 100, 
        status: 'TRIPPED',
        breakerOpen: true,
        alarms: [...prev.alarms, 'MANUAL SCRAM'] 
    }))
  }

  const reset = () => {
      // Should ideally reset with same config, but this simple reset goes to default
      // Use window.location.reload for full reset or complex logic
      setState(INITIAL_STATE) 
  }

  return {
    state,
    actions: {
      setRodPosition,
      setPumpSpeed,
      setFeedwaterFlow,
      setBoronConcentration,
      toggleBreaker,
      scram,
      reset
    }
  }
}

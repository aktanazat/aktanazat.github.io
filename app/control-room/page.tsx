"use client"

import React, { useEffect, useState } from 'react'
import { useReactorSimulation, SimulationConfig, ReactorType, ScenarioType } from '@/lib/simulation/reactor-engine'
import { ReactorMap } from '@/components/control-room/reactor-map'
import { PlantOverview } from '@/components/control-room/plant-overview'
import { CoreView } from '@/components/control-room/core-view'
import { OperatorManual } from '@/components/control-room/operator-manual'
import { LiveGraph } from '@/components/control-room/live-graph'
import { MissionSetup } from '@/components/control-room/mission-setup'
import { ReactorHall } from '@/components/control-room/reactor-hall'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Zap, Thermometer, Activity, Wind } from 'lucide-react'

// --- Sub-component for the Active Simulation ---
// This ensures the hook is re-initialized whenever the component mounts with a new config
function ActiveSimulation({ config, onAbort }: { config: SimulationConfig, onAbort: () => void }) {
    const { state, actions } = useReactorSimulation({ 
        tickRate: 100,
        initialConfig: config
    })
    
    const [logs, setLogs] = useState<string[]>([])
    const [manualPage, setManualPage] = useState(0)

    // Terminal Effect for Logs
    useEffect(() => {
        if (state.alarms.length > 0) {
            const newLog = `[${new Date().toLocaleTimeString()}] CRITICAL: ${state.alarms[state.alarms.length - 1]}`
            setLogs(prev => [...prev.slice(-4), newLog])
        }
    }, [state.alarms])

    const getStatusColor = (status: string) => {
        switch (status) {
          case 'SHUTDOWN': return 'bg-zinc-600 text-zinc-100'
          case 'STARTUP': return 'bg-cyan-600 text-cyan-50 shadow-[0_0_10px_rgba(8,145,178,0.5)]'
          case 'CRITICAL': return 'bg-amber-600 text-amber-50 shadow-[0_0_10px_rgba(217,119,6,0.5)]'
          case 'POWER_OPS': return 'bg-emerald-600 text-emerald-50 shadow-[0_0_10px_rgba(5,150,105,0.5)]'
          case 'TRIPPED': return 'bg-red-600 text-red-50 animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.7)]'
          case 'MELTDOWN': return 'bg-red-950 text-red-500 animate-bounce shadow-[0_0_30px_rgba(220,38,38,1)]'
          default: return 'bg-zinc-600'
        }
    }

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-100 p-4 sm:p-6 font-sans selection:bg-cyan-900 selection:text-cyan-50">
            {/* Background Grid Effect */}
            <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 z-0" />

            <header className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-white/10 pb-4">
                <div className="mb-4 sm:mb-0">
                    <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-white/5 border border-white/10 rounded-sm">
                            <Zap className="text-cyan-400 w-5 h-5" />
                        </div>
                        <span className="uppercase tracking-[0.2em] text-zinc-100 text-lg sm:text-xl">A.T.L.A.S. Control</span>
                    </h1>
                    <p className="text-zinc-500 text-xs tracking-widest mt-1 font-mono pl-14">
                        UNIT 01 // {config.type} REACTOR // {config.scenario.replace('_', ' ')}
                    </p>
                </div>
                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <Badge variant="outline" className={`rounded-sm border-0 px-4 py-1 font-mono tracking-wider ${getStatusColor(state.status)}`}>
                        {state.status}
                    </Badge>
                    <div className="text-right">
                        <div className="text-3xl font-light tracking-tighter text-white tabular-nums">
                            {state.outputMw.toFixed(1)} <span className="text-zinc-500 text-sm font-normal">MW</span>
                        </div>
                        <div className="text-[10px] tracking-widest text-cyan-500/80 uppercase font-medium">Net Output</div>
                    </div>
                </div>
            </header>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT COLUMN - CONTROLS */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Reactivity Control Panel */}
                    <Card className="bg-[#0A0A0A]/80 border-white/10 backdrop-blur-sm rounded-sm shadow-2xl">
                        <CardHeader className="pb-2 border-b border-white/5">
                            <CardTitle className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-medium flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full" /> Reactivity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-6">
                            <div className="space-y-4">
                                <div className="flex justify-between text-xs tracking-wider">
                                    <span className="text-zinc-400">ROD INSERTION</span>
                                    <span className="text-cyan-400 font-mono">{state.controlRodPosition.toFixed(1)}%</span>
                                </div>
                                <Slider 
                                    value={[state.controlRodPosition]} 
                                    max={100} 
                                    step={0.1}
                                    onValueChange={(v) => actions.setRodPosition(v[0])}
                                    className="py-2 [&_.bg-primary]:bg-cyan-500 [&_.border-primary]:border-cyan-500"
                                />
                                <div className="flex justify-between text-[10px] text-zinc-600 font-mono tracking-widest uppercase">
                                    <span>0% (MAX POWER)</span>
                                    <span>100% (SCRAM)</span>
                                </div>
                            </div>
                            
                            <Button 
                                variant="destructive" 
                                className="w-full bg-red-950/30 hover:bg-red-900/50 border border-red-900/50 text-red-500 hover:text-red-400 tracking-widest text-xs h-12 rounded-sm transition-all duration-300 uppercase font-medium"
                                onClick={actions.scram}
                                disabled={state.isScrammed}
                            >
                                Initiate Manual SCRAM
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Cooling System Panel */}
                    <Card className="bg-[#0A0A0A]/80 border-white/10 backdrop-blur-sm rounded-sm">
                        <CardHeader className="pb-2 border-b border-white/5">
                            <CardTitle className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-medium flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Hydraulics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs tracking-wider">
                                    <span className="text-zinc-400">PRIMARY PUMPS</span>
                                    <span className="text-emerald-400 font-mono">{state.coolantPumpSpeed.toFixed(1)}%</span>
                                </div>
                                <Slider 
                                    value={[state.coolantPumpSpeed]} 
                                    max={100} 
                                    step={1}
                                    onValueChange={(v) => actions.setPumpSpeed(v[0])}
                                    className="[&_.bg-primary]:bg-emerald-500 [&_.border-primary]:border-emerald-500"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-xs tracking-wider">
                                    <span className="text-zinc-400">FEEDWATER FLOW</span>
                                    <span className="text-blue-400 font-mono">{state.feedwaterFlow.toFixed(1)}%</span>
                                </div>
                                <Slider 
                                    value={[state.feedwaterFlow]} 
                                    max={100} 
                                    step={1}
                                    onValueChange={(v) => actions.setFeedwaterFlow(v[0])}
                                    className="[&_.bg-primary]:bg-blue-500 [&_.border-primary]:border-blue-500"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Alarms Panel */}
                    <Card className="bg-[#0A0A0A]/80 border-white/10 backdrop-blur-sm rounded-sm overflow-hidden">
                        <CardHeader className="pb-2 border-b border-white/5 bg-black/20">
                            <CardTitle className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-medium flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${state.alarms.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-zinc-600'}`} /> 
                                System Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="h-[150px] w-full bg-black p-4 font-mono text-[10px] leading-relaxed overflow-hidden flex flex-col justify-end">
                                {state.alarms.length === 0 && logs.length === 0 ? (
                                    <div className="text-emerald-400 flex items-center gap-2">
                                        <span>&gt;</span> SYSTEM NORMAL. MONITORING ACTIVE.
                                    </div>
                                ) : (
                                    <>
                                        {logs.map((log, i) => (
                                            <div key={i} className="text-zinc-500">
                                                <span className="text-zinc-700 mr-2">&gt;</span>{log}
                                            </div>
                                        ))}
                                        {state.alarms.map((alarm, i) => (
                                            <div key={`alarm-${i}`} className="text-red-500 animate-pulse font-bold">
                                                <span className="mr-2">&gt;&gt;</span>ALERT: {alarm}
                                            </div>
                                        ))}
                                        <div className="w-2 h-4 bg-emerald-500/50 animate-pulse mt-1" />
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* CENTER COLUMN - VISUALIZATION */}
                <div className="lg:col-span-6 space-y-6">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="w-full bg-black/40 border border-white/10 p-1 rounded-sm h-12 mb-6">
                            <TabsTrigger value="overview" className="flex-1 h-full rounded-sm data-[state=active]:bg-white/10 data-[state=active]:text-zinc-100 text-zinc-500 text-xs uppercase tracking-widest font-medium transition-all">Overview</TabsTrigger>
                            <TabsTrigger value="core" className="flex-1 h-full rounded-sm data-[state=active]:bg-white/10 data-[state=active]:text-zinc-100 text-zinc-500 text-xs uppercase tracking-widest font-medium transition-all">Core Grid</TabsTrigger>
                            <TabsTrigger value="systems" className="flex-1 h-full rounded-sm data-[state=active]:bg-white/10 data-[state=active]:text-zinc-100 text-zinc-500 text-xs uppercase tracking-widest font-medium transition-all">Schematic</TabsTrigger>
                            <TabsTrigger value="hall" className="flex-1 h-full rounded-sm data-[state=active]:bg-white/10 data-[state=active]:text-zinc-100 text-zinc-500 text-xs uppercase tracking-widest font-medium transition-all">Reactor Hall</TabsTrigger>
                        </TabsList>

                        <div className="bg-[#050505] border border-white/10 rounded-sm overflow-hidden shadow-2xl relative group">
                            {/* Decorative corners */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/50" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/50" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500/50" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/50" />
                            
                            <TabsContent value="overview" className="m-0">
                                <PlantOverview 
                                    reactorStatus={state.status}
                                    coreTemp={state.fuelTemp}
                                    primaryPressure={state.pressure}
                                    coolantFlow={state.coolantPumpSpeed}
                                    steamPressure={state.steamPressure}
                                    turbineSpeed={state.turbineSpeed}
                                    outputMw={state.outputMw}
                                    condenserTemp={state.condenserTemp}
                                    coolingEff={state.coolingTowerEfficiency}
                                />
                            </TabsContent>

                            <TabsContent value="core" className="m-0 p-6 bg-[#080808]">
                                <div className="h-[500px] flex items-center justify-center">
                                    <CoreView 
                                        regions={state.coreRegions}
                                        controlRodPosition={state.controlRodPosition}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="systems" className="m-0 bg-[#080808]">
                                <ReactorMap 
                                    coolantFlow={state.coolantPumpSpeed}
                                    controlRodLevel={state.controlRodPosition}
                                    coreTemp={state.fuelTemp}
                                    turbineSpeed={state.turbineSpeed}
                                />
                            </TabsContent>

                            <TabsContent value="hall" className="m-0 bg-[#080808]">
                                <div className="h-[500px]">
                                    <ReactorHall 
                                        type={config.type}
                                        flux={state.neutronFlux}
                                        temp={state.fuelTemp}
                                        waterLevel={100}
                                    />
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>

                    <div className="grid grid-cols-3 gap-4">
                        <Card className="bg-[#0A0A0A]/80 border-white/10 backdrop-blur-sm rounded-sm hover:border-white/20 transition-colors">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Thermometer className="text-amber-500 h-4 w-4" />
                                    <span className="text-zinc-500 text-[10px] uppercase tracking-widest">Core Temp</span>
                                </div>
                                <div className="text-2xl font-light text-white mb-2 tabular-nums">{state.fuelTemp.toFixed(0)}<span className="text-sm text-zinc-600 ml-1">°C</span></div>
                                <Progress value={(state.fuelTemp / 2800) * 100} className="h-1 bg-zinc-800 [&_.bg-primary]:bg-amber-500" />
                            </CardContent>
                        </Card>
                        <Card className="bg-[#0A0A0A]/80 border-white/10 backdrop-blur-sm rounded-sm hover:border-white/20 transition-colors">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Activity className="text-cyan-500 h-4 w-4" />
                                    <span className="text-zinc-500 text-[10px] uppercase tracking-widest">Pri. Press</span>
                                </div>
                                <div className="text-2xl font-light text-white mb-2 tabular-nums">{state.pressure.toFixed(2)}<span className="text-sm text-zinc-600 ml-1">MPa</span></div>
                                <Progress value={(state.pressure / 18) * 100} className="h-1 bg-zinc-800 [&_.bg-primary]:bg-cyan-500" />
                            </CardContent>
                        </Card>
                        <Card className="bg-[#0A0A0A]/80 border-white/10 backdrop-blur-sm rounded-sm hover:border-white/20 transition-colors">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Wind className="text-purple-500 h-4 w-4" />
                                    <span className="text-zinc-500 text-[10px] uppercase tracking-widest">Sec. Press</span>
                                </div>
                                <div className="text-2xl font-light text-white mb-2 tabular-nums">{state.steamPressure.toFixed(2)}<span className="text-sm text-zinc-600 ml-1">MPa</span></div>
                                <Progress value={(state.steamPressure / 10) * 100} className="h-1 bg-zinc-800 [&_.bg-primary]:bg-purple-500" />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* RIGHT COLUMN - MANUAL & METRICS */}
                <div className="lg:col-span-3 space-y-6">
                    <Tabs defaultValue="manual" className="w-full">
                        <TabsList className="w-full bg-black/40 border border-white/10 p-1 rounded-sm h-10 mb-4">
                            <TabsTrigger value="manual" className="flex-1 h-full rounded-sm data-[state=active]:bg-white/10 data-[state=active]:text-zinc-100 text-xs uppercase tracking-widest font-medium transition-all text-zinc-400">Protocol</TabsTrigger>
                            <TabsTrigger value="stats" className="flex-1 h-full rounded-sm data-[state=active]:bg-white/10 data-[state=active]:text-zinc-100 text-xs uppercase tracking-widest font-medium transition-all text-zinc-400">Telemetry</TabsTrigger>
                        </TabsList>
                        <TabsContent value="manual">
                            <div className="h-[600px]">
                                <OperatorManual page={manualPage} setPage={setManualPage} />
                            </div>
                        </TabsContent>
                        <TabsContent value="stats">
                            <Card className="bg-[#0A0A0A]/80 border-white/10 backdrop-blur-sm rounded-sm h-[600px] overflow-y-auto custom-scrollbar">
                                <CardContent className="space-y-6 pt-6">
                                    <div className="space-y-4">
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Live Trends</div>
                                        <LiveGraph 
                                            data={state.history.flux} 
                                            color="#fbbf24" 
                                            label="Flux" 
                                            max={120}
                                        />
                                        <LiveGraph 
                                            data={state.history.fuelTemp} 
                                            color="#ef4444" 
                                            label="Core Temp" 
                                            max={2500}
                                        />
                                    </div>

                                    <div className="border-t border-white/10 my-4" />

                                    {[
                                        { label: "Neutron Flux", value: state.neutronFlux.toFixed(2), unit: "%", color: "text-amber-400" },
                                        { label: "Coolant Temp", value: state.coolantTemp.toFixed(0), unit: "°C", color: "text-cyan-400" },
                                        { label: "Turbine Speed", value: state.turbineSpeed.toFixed(0), unit: "RPM", color: "text-emerald-400" },
                                        { label: "Xenon Conc.", value: state.xenonLevel.toFixed(1), unit: "rel", color: state.xenonLevel > 50 ? "text-red-500" : "text-purple-400" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-end border-b border-white/5 pb-2">
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{item.label}</span>
                                            <span className={`font-mono text-lg ${item.color}`}>{item.value}<span className="text-xs text-zinc-600 ml-1">{item.unit}</span></span>
                                        </div>
                                    ))}
                                    
                                    <div className="pt-4">
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-4">Efficiency Metrics</div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-white/5 rounded-sm border border-white/5">
                                                <div className="text-[10px] text-zinc-500 mb-1">CONDENSER</div>
                                                <div className={`font-mono ${state.condenserTemp > 80 ? 'text-red-400' : 'text-white'}`}>{state.condenserTemp.toFixed(0)}°C</div>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-sm border border-white/5">
                                                <div className="text-[10px] text-zinc-500 mb-1">TOWER EFF</div>
                                                <div className="font-mono text-white">{state.coolingTowerEfficiency.toFixed(0)}%</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                    
                    <Button variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-sm tracking-widest uppercase text-xs h-12 transition-colors" onClick={onAbort}>
                        Abort Mission (Return to Menu)
                    </Button>
                </div>
            </div>
        </div>
    )
}

// --- Main Page Component ---
export default function ControlRoomPage() {
  const [config, setConfig] = useState<SimulationConfig | undefined>(undefined)

  if (!config) {
      return <MissionSetup onStart={setConfig} />
  }

  return <ActiveSimulation config={config} onAbort={() => setConfig(undefined)} />
}

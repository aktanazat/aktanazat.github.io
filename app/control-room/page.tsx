"use client"

import React from 'react'
import { useReactorSimulation } from '@/lib/simulation/reactor-engine'
import { ReactorMap } from '@/components/control-room/reactor-map'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Zap, Thermometer, Activity, Wind, Power, BookOpen } from 'lucide-react'

export default function ControlRoomPage() {
  const { state, actions } = useReactorSimulation()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SHUTDOWN': return 'bg-gray-500'
      case 'STARTUP': return 'bg-blue-500'
      case 'CRITICAL': return 'bg-yellow-500'
      case 'POWER_OPS': return 'bg-green-500'
      case 'TRIPPED': return 'bg-red-600 animate-pulse'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-mono">
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="text-yellow-500" />
            NPP CONTROL SIMULATOR
          </h1>
          <p className="text-slate-500 text-sm">UNIT 1 - PRESSURIZED WATER REACTOR</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className={`${getStatusColor(state.status)} text-white border-none px-4 py-1`}>
            {state.status}
          </Badge>
          <div className="text-right">
             <div className="text-2xl font-bold text-green-400">{state.outputMw.toFixed(1)} MW</div>
             <div className="text-xs text-slate-500">NET OUTPUT</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN - CONTROLS */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-slate-900 border-slate-800 text-slate-200">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-slate-400">Reactivity Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>CONTROL RODS</span>
                  <span className="text-blue-400">{state.controlRodPosition.toFixed(1)}% INSERTED</span>
                </div>
                <Slider 
                  value={[state.controlRodPosition]} 
                  max={100} 
                  step={0.1}
                  onValueChange={(v) => actions.setRodPosition(v[0])}
                  className="py-2"
                />
                <div className="text-xs text-slate-600 flex justify-between">
                   <span>WITHDRAW (POWER UP)</span>
                   <span>INSERT (SCRAM)</span>
                </div>
              </div>
              
              <Button 
                variant="destructive" 
                className="w-full bg-red-900 hover:bg-red-800 border-2 border-red-700 text-red-100"
                onClick={actions.scram}
                disabled={state.isScrammed}
              >
                MANUAL SCRAM
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-slate-200">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-slate-400">Cooling System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>PRIMARY PUMPS</span>
                  <span className="text-blue-400">{state.coolantPumpSpeed.toFixed(1)}%</span>
                </div>
                <Slider 
                  value={[state.coolantPumpSpeed]} 
                  max={100} 
                  step={1}
                  onValueChange={(v) => actions.setPumpSpeed(v[0])}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-slate-200">
             <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wider text-slate-400">Alarms</CardTitle>
             </CardHeader>
             <CardContent>
                <ScrollArea className="h-[150px] w-full rounded border border-slate-800 bg-black p-2">
                   {state.alarms.length === 0 ? (
                       <div className="text-green-500 text-xs">ALL SYSTEMS NOMINAL</div>
                   ) : (
                       state.alarms.map((alarm, i) => (
                           <div key={i} className="text-red-500 text-xs font-bold animate-pulse mb-1">
                               [ALARM] {alarm}
                           </div>
                       ))
                   )}
                </ScrollArea>
             </CardContent>
          </Card>
        </div>

        {/* CENTER COLUMN - VISUALIZATION */}
        <div className="lg:col-span-6 space-y-6">
           <ReactorMap 
              coolantFlow={state.coolantPumpSpeed}
              controlRodLevel={state.controlRodPosition}
              coreTemp={state.fuelTemp}
              turbineSpeed={state.turbineSpeed}
           />

           <div className="grid grid-cols-2 gap-4">
              <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                          <Thermometer className="text-orange-500 h-4 w-4" />
                          <span className="text-slate-400 text-xs">CORE TEMP</span>
                      </div>
                      <div className="text-2xl font-bold">{state.fuelTemp.toFixed(0)}°C</div>
                      <Progress value={(state.fuelTemp / 2800) * 100} className="h-2 mt-2 bg-slate-800" />
                  </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                          <Activity className="text-blue-500 h-4 w-4" />
                          <span className="text-slate-400 text-xs">PRESSURE</span>
                      </div>
                      <div className="text-2xl font-bold">{state.pressure.toFixed(2)} MPa</div>
                      <Progress value={(state.pressure / 18) * 100} className="h-2 mt-2 bg-slate-800" />
                  </CardContent>
              </Card>
           </div>
        </div>

        {/* RIGHT COLUMN - MANUAL & METRICS */}
        <div className="lg:col-span-3 space-y-6">
           <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-900">
                 <TabsTrigger value="manual">Manual</TabsTrigger>
                 <TabsTrigger value="stats">Stats</TabsTrigger>
              </TabsList>
              <TabsContent value="manual">
                 <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-4 text-sm text-slate-300 space-y-4 h-[500px] overflow-y-auto">
                       <div>
                          <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                             <BookOpen className="h-4 w-4" /> OPERATOR MANUAL
                          </h3>
                          <p className="text-xs text-slate-500 mb-4">Follow these procedures strictly.</p>
                       </div>

                       <div className="space-y-2">
                          <h4 className="text-blue-400 font-bold text-xs uppercase">Phase 1: Cold Startup</h4>
                          <ol className="list-decimal list-inside text-xs space-y-1 text-slate-400">
                             <li>Verify all control rods are fully inserted (100%).</li>
                             <li>Start Primary Coolant Pumps. Set to at least 50%.</li>
                             <li>Wait for coolant circulation to stabilize.</li>
                          </ol>
                       </div>

                       <div className="space-y-2">
                          <h4 className="text-blue-400 font-bold text-xs uppercase">Phase 2: Criticality</h4>
                          <ol className="list-decimal list-inside text-xs space-y-1 text-slate-400">
                             <li>Slowly withdraw control rods (decrease insertion %).</li>
                             <li>Monitor Neutron Flux. Warning: Reaction is exponential.</li>
                             <li>Target criticality at ~40-50% rod insertion.</li>
                          </ol>
                       </div>

                       <div className="space-y-2">
                          <h4 className="text-blue-400 font-bold text-xs uppercase">Phase 3: Power Generation</h4>
                          <ol className="list-decimal list-inside text-xs space-y-1 text-slate-400">
                             <li>Allow core temp to rise to ~300°C.</li>
                             <li>Pressure will rise. Turbine spins up at >5 MPa.</li>
                             <li>Sync turbine speed (simulated auto-sync).</li>
                             <li>Adjust rods to maintain steady temp/power.</li>
                          </ol>
                       </div>
                       
                       <div className="mt-4 p-2 bg-red-950/30 border border-red-900/50 rounded text-xs">
                          <span className="text-red-500 font-bold">EMERGENCY:</span> If Core Temp exceeds 2000°C or Pressure exceeds 16 MPa, hit MANUAL SCRAM immediately.
                       </div>
                    </CardContent>
                 </Card>
              </TabsContent>
              <TabsContent value="stats">
                 <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="space-y-4 pt-6">
                       <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">NEUTRON FLUX</span>
                          <span className="font-mono">{state.neutronFlux.toFixed(2)}%</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">COOLANT TEMP</span>
                          <span className="font-mono">{state.coolantTemp.toFixed(0)}°C</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">TURBINE RPM</span>
                          <span className="font-mono">{state.turbineSpeed.toFixed(0)}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">XENON LEVEL</span>
                          <span className={`font-mono ${state.xenonLevel > 50 ? 'text-red-500' : 'text-slate-300'}`}>
                             {state.xenonLevel.toFixed(1)}
                          </span>
                       </div>
                    </CardContent>
                 </Card>
              </TabsContent>
           </Tabs>
           
           <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-slate-400" onClick={actions.reset}>
              RESET SIMULATION
           </Button>
        </div>
      </div>
    </div>
  )
}


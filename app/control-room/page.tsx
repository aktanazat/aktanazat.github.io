"use client"

import React from 'react'
import { useReactorSimulation } from '@/lib/simulation/reactor-engine'
import { ReactorMap } from '@/components/control-room/reactor-map'
import { PlantOverview } from '@/components/control-room/plant-overview'
import { CoreView } from '@/components/control-room/core-view'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Zap, Thermometer, Activity, Wind, Power, BookOpen, Droplets } from 'lucide-react'

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

              {/* New: Feedwater Control */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>FEEDWATER FLOW</span>
                  <span className="text-cyan-400">{state.feedwaterFlow.toFixed(1)}%</span>
                </div>
                <Slider 
                  value={[state.feedwaterFlow]} 
                  max={100} 
                  step={1}
                  onValueChange={(v) => actions.setFeedwaterFlow(v[0])}
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
           <Tabs defaultValue="overview" className="w-full">
             <TabsList className="grid w-full grid-cols-3 bg-slate-900 mb-4">
                <TabsTrigger value="overview">Plant Overview</TabsTrigger>
                <TabsTrigger value="core">Core Grid</TabsTrigger>
                <TabsTrigger value="systems">Primary Loop</TabsTrigger>
             </TabsList>

             <TabsContent value="overview">
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

             <TabsContent value="core">
                <div className="h-[500px] bg-slate-900 rounded-xl border border-slate-800 p-4">
                   <CoreView 
                      regions={state.coreRegions}
                      controlRodPosition={state.controlRodPosition}
                   />
                </div>
             </TabsContent>

             <TabsContent value="systems">
                <ReactorMap 
                   coolantFlow={state.coolantPumpSpeed}
                   controlRodLevel={state.controlRodPosition}
                   coreTemp={state.fuelTemp}
                   turbineSpeed={state.turbineSpeed}
                />
             </TabsContent>
           </Tabs>

           <div className="grid grid-cols-3 gap-4">
              <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                          <Thermometer className="text-orange-500 h-4 w-4" />
                          <span className="text-slate-400 text-xs">CORE AVG</span>
                      </div>
                      <div className="text-2xl font-bold">{state.fuelTemp.toFixed(0)}°C</div>
                  </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                          <Activity className="text-blue-500 h-4 w-4" />
                          <span className="text-slate-400 text-xs">P-PRESSURE</span>
                      </div>
                      <div className="text-2xl font-bold">{state.pressure.toFixed(2)} MPa</div>
                  </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                          <Wind className="text-slate-400 h-4 w-4" />
                          <span className="text-slate-400 text-xs">S-PRESSURE</span>
                      </div>
                      <div className="text-2xl font-bold">{state.steamPressure.toFixed(2)} MPa</div>
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
                          <h4 className="text-blue-400 font-bold text-xs uppercase">Phase 1: Startup</h4>
                          <ol className="list-decimal list-inside text-xs space-y-1 text-slate-400">
                             <li>Ensure Feedwater Flow > 20%.</li>
                             <li>Start Primary Pumps (50%+).</li>
                             <li>Withdraw Rods slowly to criticality.</li>
                          </ol>
                       </div>

                       <div className="space-y-2">
                          <h4 className="text-blue-400 font-bold text-xs uppercase">Phase 2: Power Ops</h4>
                          <ol className="list-decimal list-inside text-xs space-y-1 text-slate-400">
                             <li>Maintain Core Temp ~300-320°C.</li>
                             <li>Keep Pressurizer Pressure ~15.5 MPa.</li>
                             <li>Monitor Steam Pressure (Target 8 MPa).</li>
                             <li>Ensure Condenser Temp stays low (Feedwater).</li>
                          </ol>
                       </div>
                       
                       <div className="mt-4 p-2 bg-red-950/30 border border-red-900/50 rounded text-xs">
                          <span className="text-red-500 font-bold">TRIP CRITERIA:</span>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>Core Temp {'>'} 2200°C</li>
                              <li>Primary Pressure {'>'} 17 MPa</li>
                              <li>Condenser Temp {'>'} 95°C</li>
                          </ul>
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
                       <div className="border-t border-slate-800 my-2"></div>
                       <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">CONDENSER</span>
                          <span className={`font-mono ${state.condenserTemp > 80 ? 'text-red-500' : 'text-slate-300'}`}>
                             {state.condenserTemp.toFixed(0)}°C
                          </span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">TOWER EFF</span>
                          <span className="font-mono">{state.coolingTowerEfficiency.toFixed(0)}%</span>
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

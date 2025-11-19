import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { motion } from 'framer-motion'
import { AlertTriangle, FileText, Info, PowerOff, Settings2 } from 'lucide-react'

export type ReactorType = 'PWR' | 'RBMK' | 'BWR'
export type ScenarioType = 'NORMAL' | 'TMI_ACCIDENT' | 'CHERNOBYL_RUN' | 'XENON_PIT'

interface MissionSetupProps {
  onStart: (config: { type: ReactorType; scenario: ScenarioType; difficulty: string; coldStart: boolean; manualSync: boolean; chemicalShim: boolean }) => void
}

export function MissionSetup({ onStart }: MissionSetupProps) {
  const [type, setType] = useState<ReactorType>('PWR')
  const [scenario, setScenario] = useState<ScenarioType>('NORMAL')
  const [difficulty, setDifficulty] = useState('NORMAL')
  const [coldStart, setColdStart] = useState(false)
  const [manualSync, setManualSync] = useState(false)
  const [chemicalShim, setChemicalShim] = useState(false)

  const reactorDescriptions = {
    PWR: {
        title: "Pressurized Water Reactor",
        desc: "The most common type. Stable negative void coefficient. Inherently safe design characteristics.",
        gameplay: "GAMEPLAY: Forgiving thermal inertia. Slow response to control inputs. Safe for beginners."
    },
    RBMK: {
        title: "Reaktor Bolshoy Moshchnosti Kanalny",
        desc: "Graphite-moderated, water-cooled. POSITIVE void coefficient. Highly unstable at low power.",
        gameplay: "GAMEPLAY: DANGER! Power increases when coolant boils. Control rods are slow. Prone to runaway excursions."
    },
    BWR: {
        title: "Boiling Water Reactor",
        desc: "Steam generated directly in the core. Simpler loop, but radioactive steam enters the turbine hall.",
        gameplay: "GAMEPLAY: Fast pressure-power coupling. Turbine trips cause immediate pressure spikes. Responsive but volatile."
    }
  }

  const scenarioIntel = {
    NORMAL: {
        briefing: "Standard startup procedure initiated. Reactor is in cold shutdown state. Primary coolant pumps are offline. Your objective is to bring the reactor to criticality, stabilize thermal output, and synchronize with the grid.",
        risk: "LOW",
        objectives: ["Achieve Criticality", "Stabilize at 1000 MWth", "Connect to Grid"]
    },
    TMI_ACCIDENT: {
        briefing: "INTEL: Unit 2 experienced a feedpump trip at 04:00. Pressure relief valve (PORV) opened as designed but failed to close. Instrumentation indicates the valve is CLOSED (false reading). Loss of coolant inventory is ongoing. Core uncovery imminent if not corrected.",
        risk: "CRITICAL",
        objectives: ["Identify Stuck Valve", "Maintain Core Coverage", "Prevent Meltdown"]
    },
    CHERNOBYL_RUN: {
        briefing: "INTEL: Safety test scheduled for Turbogenerator 8. Previous shift delayed the test, leading to rapid xenon buildup. Core is currently at low power (200MW) and highly unstable. Automatic safety systems (ECCS) have been manually disabled by the Chief Engineer.",
        risk: "EXTREME",
        objectives: ["Complete Safety Test", "Manage Positive Void Coefficient", "SURVIVE"]
    },
    XENON_PIT: {
        briefing: "INTEL: Reactor scrammed unexpectedly 1 hour ago. Xenon-135 concentration is peaking ('Dead Pit'). Restarting now is physically difficult and dangerous due to skewed power distribution. Management is demanding immediate power restoration.",
        risk: "HIGH",
        objectives: ["Overcome Xenon Poisoning", "Avoid Power Excursion", "Return to Power"]
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8 font-mono text-zinc-200 bg-[url('/grid-pattern.svg')]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full space-y-8"
      >
        <div className="space-y-2 border-b border-zinc-800 pb-4">
          <h1 className="text-4xl font-bold text-white tracking-tighter flex items-center gap-3">
             <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />
             MISSION PROFILE
          </h1>
          <p className="text-zinc-400">Configure simulation parameters and review mission intelligence.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Configuration */}
          <div className="lg:col-span-7 space-y-6">
             {/* Reactor Selection */}
             <div className="space-y-4">
                <Label className="text-sm text-cyan-400 tracking-widest">REACTOR DESIGN</Label>
                <div className="grid gap-3">
                    {['PWR', 'RBMK', 'BWR'].map((r) => (
                    <div 
                        key={r} 
                        onClick={() => setType(r as ReactorType)}
                        className={`relative cursor-pointer border p-4 rounded-sm transition-all ${type === r ? 'bg-zinc-900 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-black/40 border-zinc-800 hover:border-zinc-600'}`}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className={`font-bold ${type === r ? 'text-white' : 'text-zinc-400'}`}>{reactorDescriptions[r as ReactorType].title}</span>
                            {type === r && <div className="w-2 h-2 bg-cyan-500 rounded-full" />}
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-relaxed mb-2">
                            {reactorDescriptions[r as ReactorType].desc}
                        </p>
                        <p className="text-[10px] text-amber-500 font-bold leading-relaxed border-t border-white/5 pt-2">
                            {reactorDescriptions[r as ReactorType].gameplay}
                        </p>
                    </div>
                    ))}
                </div>
             </div>

             <div className="pt-4 border-t border-zinc-800">
                 <Label className="text-sm text-zinc-400 tracking-widest mb-3 block">DIFFICULTY LEVEL</Label>
                 <div className="flex gap-2">
                    {['TRAINEE', 'NORMAL', 'VETERAN'].map((d) => (
                        <Button 
                        key={d}
                        variant="outline"
                        onClick={() => setDifficulty(d)}
                        className={`flex-1 h-10 text-xs tracking-wider ${difficulty === d ? 'bg-white text-black border-white' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
                        >
                        {d}
                        </Button>
                    ))}
                </div>
             </div>
          </div>

          {/* Right Column: Intel & Start */}
          <div className="lg:col-span-5 flex flex-col gap-6">
             <div className="space-y-4">
                <Label className="text-sm text-amber-400 tracking-widest">OPERATIONAL SCENARIO</Label>
                <Select value={scenario} onValueChange={(v) => setScenario(v as ScenarioType)}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white h-12">
                    <SelectValue placeholder="Select Scenario" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                    <SelectItem value="NORMAL">Standard Cold Startup</SelectItem>
                    <SelectItem value="TMI_ACCIDENT">TMI-2 Accident (Loss of Coolant)</SelectItem>
                    <SelectItem value="CHERNOBYL_RUN">Unit 4 Safety Test (Unstable)</SelectItem>
                    <SelectItem value="XENON_PIT">Xenon Dead Pit Recovery</SelectItem>
                    </SelectContent>
                </Select>
             </div>

             {/* Advanced Options */}
             <div className="space-y-3 border border-zinc-800 p-4 rounded-sm bg-zinc-900/30">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                    <Settings2 className="w-4 h-4" />
                    <span className="text-xs font-bold tracking-widest uppercase">Advanced Realism</span>
                </div>

                <div className="flex items-center space-x-3">
                    <Checkbox 
                        id="coldStart" 
                        checked={coldStart} 
                        onCheckedChange={(c) => setColdStart(c as boolean)}
                        className="border-zinc-600 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
                    />
                    <Label htmlFor="coldStart" className="text-xs text-zinc-300 cursor-pointer">Cold Iron Start (Full Sequence)</Label>
                </div>

                <div className="flex items-center space-x-3">
                    <Checkbox 
                        id="manualSync" 
                        checked={manualSync} 
                        onCheckedChange={(c) => setManualSync(c as boolean)}
                        className="border-zinc-600 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
                    />
                    <Label htmlFor="manualSync" className="text-xs text-zinc-300 cursor-pointer">Manual Grid Synchronization</Label>
                </div>

                <div className="flex items-center space-x-3">
                    <Checkbox 
                        id="chemicalShim" 
                        checked={chemicalShim} 
                        onCheckedChange={(c) => setChemicalShim(c as boolean)}
                        className="border-zinc-600 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
                    />
                    <Label htmlFor="chemicalShim" className="text-xs text-zinc-300 cursor-pointer">Chemical Shim (Boron Control)</Label>
                </div>
             </div>

             {/* Intel Card */}
             <Card className="flex-1 bg-zinc-900/30 border-zinc-800 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/20" />
                 <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-amber-500 mb-2">
                        <FileText className="w-4 h-4" />
                        <span className="text-xs font-bold tracking-widest uppercase">Mission Intelligence</span>
                    </div>
                    
                    <div className="space-y-4">
                        <p className="text-sm text-zinc-300 leading-relaxed border-l-2 border-zinc-700 pl-4">
                            {scenarioIntel[scenario].briefing}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                                <span className="text-[10px] text-zinc-500 uppercase block mb-1">Projected Risk</span>
                                <span className={`text-sm font-bold ${
                                    scenarioIntel[scenario].risk === 'LOW' ? 'text-emerald-500' :
                                    scenarioIntel[scenario].risk === 'CRITICAL' ? 'text-red-500' :
                                    scenarioIntel[scenario].risk === 'EXTREME' ? 'text-purple-500' : 'text-amber-500'
                                }`}>{scenarioIntel[scenario].risk}</span>
                            </div>
                             <div>
                                <span className="text-[10px] text-zinc-500 uppercase block mb-1">Authorization</span>
                                <span className="text-sm font-mono text-zinc-300">LEVEL 5</span>
                            </div>
                        </div>
                    </div>
                 </div>
             </Card>

             <Button 
                size="lg" 
                onClick={() => onStart({ type, scenario, difficulty, coldStart, manualSync, chemicalShim })}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white h-14 text-lg tracking-widest font-bold shadow-[0_0_20px_rgba(8,145,178,0.3)] border border-cyan-400/20"
            >
                INITIALIZE SYSTEM
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

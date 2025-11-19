import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { motion } from 'framer-motion'

export type ReactorType = 'PWR' | 'RBMK' | 'BWR'
export type ScenarioType = 'NORMAL' | 'TMI_ACCIDENT' | 'CHERNOBYL_RUN' | 'XENON_PIT'

interface MissionSetupProps {
  onStart: (config: { type: ReactorType; scenario: ScenarioType; difficulty: string }) => void
}

export function MissionSetup({ onStart }: MissionSetupProps) {
  const [type, setType] = useState<ReactorType>('PWR')
  const [scenario, setScenario] = useState<ScenarioType>('NORMAL')
  const [difficulty, setDifficulty] = useState('NORMAL')

  const reactorDescriptions = {
    PWR: "Pressurized Water Reactor. The most common type. Stable negative void coefficient. inherently safe design characteristics.",
    RBMK: "Reaktor Bolshoy Moshchnosti Kanalny. Graphite-moderated, water-cooled. POSITIVE void coefficient. Highly unstable at low power. Proceed with extreme caution.",
    BWR: "Boiling Water Reactor. Steam generated directly in the core. Simpler loop, but radioactive steam enters the turbine hall."
  }

  const scenarioDescriptions = {
    NORMAL: "Standard cold startup procedure. Bring the reactor to critical, generate steam, and sync to the grid.",
    TMI_ACCIDENT: "Three Mile Island conditions. Stuck open relief valve. Loss of coolant inventory. Confusing instrumentation.",
    CHERNOBYL_RUN: "Safety test conditions. Xenon poisoning. Operators disabled safety systems. Reactor is at low power and highly unstable.",
    XENON_PIT: "Recover from a scram with high xenon concentration. Difficult to restart without stalling or overpowering."
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8 font-mono text-zinc-200 bg-[url('/grid-pattern.svg')]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full space-y-8"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tighter">MISSION PROFILE</h1>
          <p className="text-zinc-400">Configure simulation parameters before core initialization.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Reactor Selection */}
          <Card className="p-6 bg-zinc-900/50 border-zinc-800 space-y-6">
            <div className="space-y-4">
              <Label className="text-lg text-cyan-400">REACTOR DESIGN</Label>
              <RadioGroup value={type} onValueChange={(v) => setType(v as ReactorType)} className="grid gap-4">
                {['PWR', 'RBMK', 'BWR'].map((r) => (
                  <div key={r} className="flex items-start space-x-3 border border-zinc-800 p-4 rounded-md hover:border-zinc-700 transition-colors bg-zinc-950/30">
                    <RadioGroupItem value={r} id={r} className="mt-1 text-cyan-500 border-zinc-600" />
                    <div className="space-y-1">
                      <Label htmlFor={r} className="font-bold text-white cursor-pointer">{r}</Label>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {reactorDescriptions[r as ReactorType]}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </Card>

          {/* Scenario Selection */}
          <Card className="p-6 bg-zinc-900/50 border-zinc-800 space-y-6 flex flex-col">
            <div className="space-y-4 flex-1">
              <Label className="text-lg text-amber-400">SCENARIO</Label>
              <Select value={scenario} onValueChange={(v) => setScenario(v as ScenarioType)}>
                <SelectTrigger className="bg-zinc-950 border-zinc-700 text-white h-12">
                  <SelectValue placeholder="Select Scenario" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                  <SelectItem value="NORMAL">Standard Cold Startup</SelectItem>
                  <SelectItem value="TMI_ACCIDENT">TMI-2 Accident (Loss of Coolant)</SelectItem>
                  <SelectItem value="CHERNOBYL_RUN">Unit 4 Safety Test (Unstable)</SelectItem>
                  <SelectItem value="XENON_PIT">Xenon Dead Pit Recovery</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="p-4 rounded bg-zinc-950/50 border border-zinc-800 min-h-[100px]">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {scenarioDescriptions[scenario]}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-8 border-t border-zinc-800">
               <Label className="text-zinc-400">DIFFICULTY</Label>
               <div className="flex gap-2">
                  {['TRAINEE', 'NORMAL', 'VETERAN'].map((d) => (
                    <Button 
                      key={d}
                      variant={difficulty === d ? 'default' : 'outline'}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 ${difficulty === d ? 'bg-white text-black hover:bg-zinc-200' : 'border-zinc-700 text-zinc-400 hover:text-white'}`}
                    >
                      {d}
                    </Button>
                  ))}
               </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-end pt-8">
          <Button 
            size="lg" 
            onClick={() => onStart({ type, scenario, difficulty })}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-12 text-lg tracking-widest font-bold"
          >
            INITIALIZE SYSTEM
          </Button>
        </div>
      </motion.div>
    </div>
  )
}


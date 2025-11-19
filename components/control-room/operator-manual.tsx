import React from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const PAGES = [
  {
    title: "SOP-8088-A",
    subtitle: "Standard Operating Procedure",
    content: (
      <div className="space-y-6 font-serif">
         <div className="text-center border-b-2 border-zinc-900 pb-4 mb-6">
            <h2 className="text-3xl font-bold uppercase tracking-wider text-zinc-900">Nuclear Operating Manual</h2>
            <p className="text-sm italic mt-2 text-zinc-700">Department of Energy - 1982 Revision</p>
            <div className="mt-4 text-xs font-mono border-2 border-red-900 text-red-900 p-2 inline-block font-bold transform -rotate-1">
               CLASSIFIED: RESTRICTED ACCESS
            </div>
         </div>
         <p className="text-justify leading-relaxed text-zinc-900 font-medium">
            This document outlines the mandatory procedures for the safe operation of the Pressurized Water Reactor (PWR) Unit 01.
            Deviation from these protocols is strictly prohibited and punishable by immediate termination and federal prosecution.
         </p>
         <div className="mt-8 bg-zinc-100/50 p-4 border border-zinc-300">
            <h3 className="font-bold uppercase text-sm border-b border-zinc-400 mb-2 text-zinc-800">Table of Contents</h3>
            <ul className="text-sm space-y-2 font-medium text-zinc-800">
               <li className="flex justify-between border-b border-dotted border-zinc-400 pb-1"><span>1. Cold Startup</span> <span>Pg. 2</span></li>
               <li className="flex justify-between border-b border-dotted border-zinc-400 pb-1"><span>2. Criticality Approach</span> <span>Pg. 3</span></li>
               <li className="flex justify-between border-b border-dotted border-zinc-400 pb-1"><span>3. Power Generation</span> <span>Pg. 4</span></li>
               <li className="flex justify-between border-b border-dotted border-zinc-400 pb-1"><span>4. Emergency Scram</span> <span>Pg. 5</span></li>
            </ul>
         </div>
      </div>
    )
  },
  {
    title: "Phase 1: Startup",
    subtitle: "Cold Condition to Hot Standby",
    content: (
       <div className="space-y-6 font-serif text-zinc-900">
          <h3 className="text-xl font-bold uppercase border-b-2 border-zinc-900 pb-1">1.0 Cold Startup</h3>
          
          <div className="space-y-6">
             <div className="flex gap-4 items-start group">
                <span className="font-bold font-mono text-lg text-zinc-500 group-hover:text-zinc-900">1.1</span>
                <p className="text-base leading-snug font-medium">Verify all Control Rod banks are fully inserted (100% position). Confirm rod bottom lights are illuminated.</p>
             </div>
             <div className="flex gap-4 items-start group">
                <span className="font-bold font-mono text-lg text-zinc-500 group-hover:text-zinc-900">1.2</span>
                <p className="text-base leading-snug font-medium">Engage Primary Coolant Pumps. Set speed to minimum 50% to ensure adequate thermal mixing.</p>
             </div>
             <div className="flex gap-4 items-start group">
                <span className="font-bold font-mono text-lg text-zinc-500 group-hover:text-zinc-900">1.3</span>
                <p className="text-base leading-snug font-medium">Initiate Feedwater Systems. Maintain flow &gt; 20% to prevent Steam Generator boil-off.</p>
             </div>
             
             <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 text-sm italic mt-6 text-zinc-800 shadow-sm">
                <span className="font-bold not-italic text-yellow-700 block mb-1">WARNING:</span>
                Do not withdraw rods without positive coolant flow indication. Core damage will occur within seconds.
             </div>
          </div>
       </div>
    )
  },
  {
    title: "Phase 2: Criticality",
    subtitle: "Approach to Nuclear Heating",
    content: (
       <div className="space-y-6 font-serif text-zinc-900">
          <h3 className="text-xl font-bold uppercase border-b-2 border-zinc-900 pb-1">2.0 Criticality</h3>
          
          <div className="space-y-6">
             <div className="flex gap-4 items-start group">
                <span className="font-bold font-mono text-lg text-zinc-500 group-hover:text-zinc-900">2.1</span>
                <p className="text-base leading-snug font-medium">Begin incremental rod withdrawal. Monitor Neutron Flux rate of change (Period).</p>
             </div>
             <div className="flex gap-4 items-start group">
                <span className="font-bold font-mono text-lg text-zinc-500 group-hover:text-zinc-900">2.2</span>
                <p className="text-base leading-snug font-medium">Stabilize flux at ~10<sup>3</sup> cps range. Criticality is typically achieved at 40-50% rod insertion.</p>
             </div>
             <div className="flex gap-4 items-start group">
                <span className="font-bold font-mono text-lg text-zinc-500 group-hover:text-zinc-900">2.3</span>
                <p className="text-base leading-snug font-medium">Allow Moderator Temperature Coefficient (MTC) to stabilize core temperature at ~300°C.</p>
             </div>
          </div>
          
          <div className="mt-12 border-t border-zinc-900 pt-4 text-center relative">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 font-handwriting text-blue-900 text-2xl transform -rotate-12 opacity-80">
                 Approved - J. Oppenheimer
              </div>
              <div className="inline-block border-2 border-zinc-900 px-4 py-1 font-bold uppercase text-xs">
                 Verified by Supervisor
              </div>
          </div>
       </div>
    )
  },
  {
    title: "Phase 3: Operations",
    subtitle: "Power Generation & Grid Sync",
    content: (
       <div className="space-y-6 font-serif text-zinc-900">
          <h3 className="text-xl font-bold uppercase border-b-2 border-zinc-900 pb-1">3.0 Power Ops</h3>
          
          <div className="space-y-6">
             <div className="flex gap-4 items-start group">
                <span className="font-bold font-mono text-lg text-zinc-500 group-hover:text-zinc-900">3.1</span>
                <p className="text-base leading-snug font-medium">When Secondary Pressure exceeds 5.0 MPa, unlock Turbine Governor.</p>
             </div>
             <div className="flex gap-4 items-start group">
                <span className="font-bold font-mono text-lg text-zinc-500 group-hover:text-zinc-900">3.2</span>
                <p className="text-base leading-snug font-medium">Synchronize Turbine speed (1800 RPM) with Grid frequency.</p>
             </div>
             <div className="flex gap-4 items-start group">
                <span className="font-bold font-mono text-lg text-zinc-500 group-hover:text-zinc-900">3.3</span>
                <p className="text-base leading-snug font-medium">Monitor Condenser Vacuum. Adjust Feedwater flow to maintain heat rejection.</p>
             </div>
             <div className="flex gap-4 items-start group">
                <span className="font-bold font-mono text-lg text-zinc-500 group-hover:text-zinc-900">3.4</span>
                <p className="text-base leading-snug font-medium">Observe Xenon-135 buildup. Adjust rods to compensate for poison load.</p>
             </div>
          </div>
       </div>
    )
  },
  {
     title: "Phase 4: Emergency",
     subtitle: "Reactor Trip Criteria",
     content: (
        <div className="space-y-6 font-serif text-zinc-900">
           <h3 className="text-xl font-bold uppercase border-b-2 border-red-900 pb-1 text-red-900">4.0 Scram Criteria</h3>
           
           <p className="text-base leading-relaxed font-bold">
              The Operator MUST initiate a manual SCRAM (Trip) if any of the following limits are exceeded:
           </p>
           
           <ul className="list-disc pl-6 space-y-3 text-base font-bold font-mono bg-zinc-50 p-4 border border-zinc-200 shadow-inner">
              <li>Core Temperature &gt; 2200°C</li>
              <li>Primary Loop Pressure &gt; 17.0 MPa</li>
              <li>Condenser Temp &gt; 95°C</li>
              <li>Loss of Coolant Flow (Pump Trip)</li>
           </ul>
           
           <div className="mt-8 p-6 border-4 border-double border-red-900 bg-red-50 shadow-lg transform rotate-1">
              <p className="text-center uppercase font-black text-red-900 tracking-[0.2em] text-lg">
                 WHEN IN DOUBT, SCRAM.
              </p>
           </div>
        </div>
     )
   }
]

interface OperatorManualProps {
    page: number
    setPage: (page: number) => void
}

export function OperatorManual({ page, setPage }: OperatorManualProps) {
  const [direction, setDirection] = useState(0)

  const nextPage = () => {
    if (page < PAGES.length - 1) {
      setDirection(1)
      setPage(page + 1)
    }
  }

  const prevPage = () => {
    if (page > 0) {
      setDirection(-1)
      setPage(page - 1)
    }
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      rotateY: direction > 0 ? 45 : -45,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      rotateY: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      rotateY: direction < 0 ? 45 : -45,
      opacity: 0,
      scale: 0.9,
    }),
  }

  return (
    <div className="relative w-full h-full bg-[#f4f4e8] text-zinc-900 rounded-sm overflow-hidden flex flex-col shadow-xl border-l-[12px] border-[#2a2a2a] perspective-[1000px]">
       {/* Vintage Paper Texture Overlay */}
       <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-40 z-10 mix-blend-multiply" />
       
       {/* Header / Binder Ring Holes */}
       <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#2a2a2a] z-20 flex flex-col justify-evenly items-center py-6 shadow-2xl border-r border-zinc-800">
          {[1, 2, 3].map(i => (
             <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-zinc-400 to-zinc-600 shadow-md flex items-center justify-center ring-1 ring-black">
                 <div className="w-2 h-2 rounded-full bg-black/80" />
             </div>
          ))}
       </div>

       {/* Top Bar */}
       <div className="relative z-30 flex justify-between items-center px-6 py-4 pl-14 bg-[#eaeadd] border-b border-[#d0d0c0] shadow-sm flex-shrink-0">
          <div className="font-mono text-xs uppercase tracking-widest text-zinc-600 font-bold">
             DOC: SOP-8088-A // REV 3.1
          </div>
          <div className="font-mono text-xs font-bold bg-black text-white px-2 py-1 rounded-sm">
             PAGE {page + 1} / {PAGES.length}
          </div>
       </div>

       {/* Page Content - Using flex-1 and overflow-hidden to contain ScrollArea */}
       <div className="flex-1 relative z-20 pl-14 overflow-hidden bg-[#fdfcf5] flex flex-col min-h-0">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div 
                key={page} 
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 200, damping: 25, mass: 1 }}
                className="h-full flex flex-col p-8 origin-left"
            >
                <div className="mb-8 border-b-2 border-zinc-200 pb-4 flex-shrink-0">
                    <h2 className="text-3xl font-serif font-black text-zinc-900 tracking-tight mb-1">
                    {PAGES[page].title}
                    </h2>
                    <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest font-bold">
                    {PAGES[page].subtitle}
                    </p>
                </div>
                
                <ScrollArea className="flex-1 min-h-0 pr-6 -mr-2">
                    <div className="text-zinc-900 font-serif leading-relaxed pb-20">
                        {PAGES[page].content}
                    </div>
                </ScrollArea>
            </motion.div>
          </AnimatePresence>
       </div>

       {/* Footer Controls */}
       <div className="relative z-30 pl-14 p-4 bg-[#eaeadd] border-t border-[#d0d0c0] flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex-shrink-0">
          <Button 
             variant="ghost" 
             size="sm" 
             onClick={prevPage} 
             disabled={page === 0}
             className="font-mono text-xs hover:bg-[#d0d0c0] text-zinc-800 font-bold tracking-wider disabled:opacity-30"
          >
             <ChevronLeft className="w-4 h-4 mr-1" /> PREVIOUS
          </Button>
          
          <span className="font-serif italic text-[10px] text-zinc-400 select-none">
             UNAUTHORIZED DUPLICATION PROHIBITED
          </span>
          
          <Button 
             variant="ghost" 
             size="sm" 
             onClick={nextPage} 
             disabled={page === PAGES.length - 1}
             className="font-mono text-xs hover:bg-[#d0d0c0] text-zinc-800 font-bold tracking-wider disabled:opacity-30"
          >
             NEXT PAGE <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
       </div>
       
       {/* Coffee Stain Decoration */}
       {page === 0 && (
           <div className="absolute bottom-16 right-16 w-32 h-32 rounded-full border-[16px] border-[#5c4033]/10 z-10 pointer-events-none mix-blend-multiply blur-[1px] transform rotate-45 scale-110" />
       )}
    </div>
  )
}

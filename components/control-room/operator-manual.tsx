import React, { useState } from 'react'
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

const PAGES = [
  {
    title: "SOP-8088-A",
    subtitle: "Standard Operating Procedure",
    content: (
      <div className="space-y-6 font-serif">
         <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h2 className="text-2xl font-bold uppercase tracking-wider">Nuclear Operating Manual</h2>
            <p className="text-sm italic mt-2">Department of Energy - 1982 Revision</p>
            <div className="mt-4 text-xs font-mono border border-black p-2 inline-block">
               CLASSIFIED: RESTRICTED ACCESS
            </div>
         </div>
         <p className="text-justify leading-relaxed">
            This document outlines the mandatory procedures for the safe operation of the Pressurized Water Reactor (PWR) Unit 01.
            Deviation from these protocols is strictly prohibited and punishable by immediate termination and federal prosecution.
         </p>
         <div className="mt-8">
            <h3 className="font-bold uppercase text-sm border-b border-black mb-2">Table of Contents</h3>
            <ul className="text-sm space-y-1">
               <li className="flex justify-between"><span>1. Cold Startup</span> <span>Pg. 2</span></li>
               <li className="flex justify-between"><span>2. Criticality Approach</span> <span>Pg. 3</span></li>
               <li className="flex justify-between"><span>3. Power Generation</span> <span>Pg. 4</span></li>
               <li className="flex justify-between"><span>4. Emergency Scram</span> <span>Pg. 5</span></li>
            </ul>
         </div>
      </div>
    )
  },
  {
    title: "Phase 1: Startup",
    subtitle: "Cold Condition to Hot Standby",
    content: (
       <div className="space-y-4 font-serif">
          <h3 className="text-lg font-bold uppercase border-b border-black pb-1">1.0 Cold Startup</h3>
          
          <div className="space-y-4">
             <div className="flex gap-4 items-start">
                <span className="font-bold font-mono">1.1</span>
                <p className="text-sm leading-snug">Verify all Control Rod banks are fully inserted (100% position). Confirm rod bottom lights are illuminated.</p>
             </div>
             <div className="flex gap-4 items-start">
                <span className="font-bold font-mono">1.2</span>
                <p className="text-sm leading-snug">Engage Primary Coolant Pumps. Set speed to minimum 50% to ensure adequate thermal mixing.</p>
             </div>
             <div className="flex gap-4 items-start">
                <span className="font-bold font-mono">1.3</span>
                <p className="text-sm leading-snug">Initiate Feedwater Systems. Maintain flow &gt; 20% to prevent Steam Generator boil-off.</p>
             </div>
             
             <div className="bg-yellow-100/50 border border-black p-2 text-xs italic mt-4">
                Warning: Do not withdraw rods without positive coolant flow indication. Core damage will occur within seconds.
             </div>
          </div>
       </div>
    )
  },
  {
    title: "Phase 2: Criticality",
    subtitle: "Approach to Nuclear Heating",
    content: (
       <div className="space-y-4 font-serif">
          <h3 className="text-lg font-bold uppercase border-b border-black pb-1">2.0 Criticality</h3>
          
          <div className="space-y-4">
             <div className="flex gap-4 items-start">
                <span className="font-bold font-mono">2.1</span>
                <p className="text-sm leading-snug">Begin incremental rod withdrawal. Monitor Neutron Flux rate of change (Period).</p>
             </div>
             <div className="flex gap-4 items-start">
                <span className="font-bold font-mono">2.2</span>
                <p className="text-sm leading-snug">Stabilize flux at ~10<sup>3</sup> cps range. Criticality is typically achieved at 40-50% rod insertion.</p>
             </div>
             <div className="flex gap-4 items-start">
                <span className="font-bold font-mono">2.3</span>
                <p className="text-sm leading-snug">Allow Moderator Temperature Coefficient (MTC) to stabilize core temperature at ~300°C.</p>
             </div>
          </div>
          
          <div className="mt-8 border-t border-black pt-4 text-center">
              <div className="inline-block border-2 border-black px-4 py-1 font-bold uppercase text-xs transform -rotate-2">
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
       <div className="space-y-4 font-serif">
          <h3 className="text-lg font-bold uppercase border-b border-black pb-1">3.0 Power Ops</h3>
          
          <div className="space-y-4">
             <div className="flex gap-4 items-start">
                <span className="font-bold font-mono">3.1</span>
                <p className="text-sm leading-snug">When Secondary Pressure exceeds 5.0 MPa, unlock Turbine Governor.</p>
             </div>
             <div className="flex gap-4 items-start">
                <span className="font-bold font-mono">3.2</span>
                <p className="text-sm leading-snug">Synchronize Turbine speed (1800 RPM) with Grid frequency.</p>
             </div>
             <div className="flex gap-4 items-start">
                <span className="font-bold font-mono">3.3</span>
                <p className="text-sm leading-snug">Monitor Condenser Vacuum. Adjust Feedwater flow to maintain heat rejection.</p>
             </div>
             <div className="flex gap-4 items-start">
                <span className="font-bold font-mono">3.4</span>
                <p className="text-sm leading-snug">Observe Xenon-135 buildup. Adjust rods to compensate for poison load.</p>
             </div>
          </div>
       </div>
    )
  },
  {
     title: "Phase 4: Emergency",
     subtitle: "Reactor Trip Criteria",
     content: (
        <div className="space-y-4 font-serif">
           <h3 className="text-lg font-bold uppercase border-b border-black pb-1 text-red-900">4.0 Scram Criteria</h3>
           
           <p className="text-sm leading-relaxed font-bold">
              The Operator MUST initiate a manual SCRAM (Trip) if any of the following limits are exceeded:
           </p>
           
           <ul className="list-disc pl-5 space-y-2 text-sm font-bold font-mono">
              <li>Core Temperature &gt; 2200°C</li>
              <li>Primary Loop Pressure &gt; 17.0 MPa</li>
              <li>Condenser Temp &gt; 95°C</li>
              <li>Loss of Coolant Flow (Pump Trip)</li>
           </ul>
           
           <div className="mt-6 p-4 border-4 border-red-900/20 bg-red-50">
              <p className="text-center uppercase font-black text-red-900 tracking-widest">
                 WHEN IN DOUBT, SCRAM.
              </p>
           </div>
        </div>
     )
   }
]

export function OperatorManual() {
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState(0)

  const nextPage = () => {
    if (page < PAGES.length - 1) {
      setDirection(1)
      setPage(p => p + 1)
    }
  }

  const prevPage = () => {
    if (page > 0) {
      setDirection(-1)
      setPage(p => p - 1)
    }
  }

  return (
    <div className="relative w-full h-full bg-[#f0f0e0] text-zinc-900 rounded-sm overflow-hidden flex flex-col shadow-inner border-l-8 border-[#d4d4c0]">
       {/* Vintage Paper Texture Overlay */}
       <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-50 z-10 mix-blend-multiply" />
       
       {/* Header / Binder Ring Holes */}
       <div className="absolute left-0 top-0 bottom-0 w-8 bg-[#e6e6d0] border-r border-[#d4d4c0] z-20 flex flex-col justify-evenly items-center py-4 shadow-lg">
          {[1, 2, 3, 4].map(i => (
             <div key={i} className="w-4 h-4 rounded-full bg-[#333] shadow-inner ring-1 ring-white/20" />
          ))}
       </div>

       {/* Top Bar */}
       <div className="relative z-30 flex justify-between items-center px-6 py-3 pl-12 bg-[#e6e6d0] border-b border-[#d4d4c0]">
          <div className="font-mono text-xs uppercase tracking-widest text-zinc-600">
             DOC: SOP-8088-A // REV 3.1
          </div>
          <div className="font-mono text-xs font-bold">
             PAGE {page + 1} OF {PAGES.length}
          </div>
       </div>

       {/* Page Content */}
       <div className="flex-1 relative z-20 pl-12 p-6 overflow-hidden bg-[#fffdf5]">
          <div key={page} className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="mb-6">
                <h2 className="text-2xl font-serif font-bold text-zinc-900 border-b-2 border-zinc-900 inline-block pb-1 mb-1">
                   {PAGES[page].title}
                </h2>
                <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
                   {PAGES[page].subtitle}
                </p>
             </div>
             
             <ScrollArea className="flex-1 pr-4">
                <div className="text-zinc-800 font-serif leading-relaxed">
                   {PAGES[page].content}
                </div>
             </ScrollArea>
          </div>
       </div>

       {/* Footer Controls */}
       <div className="relative z-30 pl-12 p-4 bg-[#e6e6d0] border-t border-[#d4d4c0] flex justify-between items-center">
          <Button 
             variant="ghost" 
             size="sm" 
             onClick={prevPage} 
             disabled={page === 0}
             className="font-mono text-xs hover:bg-[#d4d4c0] text-zinc-700"
          >
             <ChevronLeft className="w-4 h-4 mr-1" /> PREV
          </Button>
          
          <span className="font-serif italic text-xs text-zinc-500">
             Property of U.S. Govt
          </span>
          
          <Button 
             variant="ghost" 
             size="sm" 
             onClick={nextPage} 
             disabled={page === PAGES.length - 1}
             className="font-mono text-xs hover:bg-[#d4d4c0] text-zinc-700"
          >
             NEXT <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
       </div>
       
       {/* Coffee Stain Decoration (Optional) */}
       {page === 0 && (
           <div className="absolute bottom-12 right-12 w-32 h-32 rounded-full border-[12px] border-[#5c4033]/10 z-10 pointer-events-none mix-blend-multiply blur-[2px]" />
       )}
    </div>
  )
}


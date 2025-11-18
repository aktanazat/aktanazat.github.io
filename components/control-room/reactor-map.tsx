import React from 'react'

interface ReactorMapProps {
  coolantFlow: number
  controlRodLevel: number
  coreTemp: number
  turbineSpeed: number
}

export function ReactorMap({ coolantFlow, controlRodLevel, coreTemp, turbineSpeed }: ReactorMapProps) {
  // Color mapping for temperature
  const getCoreColor = (temp: number) => {
    if (temp < 100) return '#06b6d4' // Cyan
    if (temp < 300) return '#10b981' // Emerald
    if (temp < 800) return '#f59e0b' // Amber
    if (temp < 1500) return '#f97316' // Orange
    return '#ef4444' // Red
  }

  return (
    <div className="relative w-full h-[400px] bg-[#080808] p-4 overflow-hidden select-none">
      <svg viewBox="0 0 800 400" className="w-full h-full">
        <defs>
            <filter id="glow-map" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>

        {/* Reactor Vessel */}
        <g transform="translate(100, 100)">
          <rect x="0" y="0" width="120" height="200" rx="4" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
          {/* Core */}
          <rect 
            x="20" 
            y="100" 
            width="80" 
            height="80" 
            fill={getCoreColor(coreTemp)} 
            fillOpacity="0.6"
            filter={coreTemp > 200 ? "url(#glow-map)" : ""}
          />
           {/* Control Rods */}
           <g transform={`translate(0, ${controlRodLevel * 0.8})`}>
             <rect x="30" y="20" width="10" height="80" fill="#71717a" />
             <rect x="55" y="20" width="10" height="80" fill="#71717a" />
             <rect x="80" y="20" width="10" height="80" fill="#71717a" />
           </g>
        </g>

        {/* Primary Loop Pipes */}
        <path 
          d="M 220 150 L 350 150 L 350 100" 
          fill="none" 
          stroke="#52525b" 
          strokeWidth="6" 
          strokeDasharray={coolantFlow > 0 ? "4 4" : "none"}
          className={coolantFlow > 0 ? "animate-pulse" : ""}
        />
        <path 
          d="M 350 300 L 350 250 L 220 250" 
          fill="none" 
          stroke="#27272a" 
          strokeWidth="6" 
        />

        {/* Steam Generator */}
        <g transform="translate(300, 50)">
             <rect x="0" y="0" width="100" height="300" rx="4" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
             <path d="M 20 50 Q 50 50 80 50" stroke="#0e7490" strokeWidth="2" fill="none" />
             <path d="M 20 100 Q 50 100 80 100" stroke="#0e7490" strokeWidth="2" fill="none" />
             <path d="M 20 150 Q 50 150 80 150" stroke="#0e7490" strokeWidth="2" fill="none" />
        </g>

        {/* Turbine */}
         <g transform="translate(500, 50)">
             <path d="M 0 20 L 100 0 L 100 100 L 0 80 Z" fill="#27272a" stroke="#52525b" />
             <circle cx="50" cy="50" r="30" fill={turbineSpeed > 100 ? "#10b981" : "#3f3f46"} filter={turbineSpeed > 100 ? "url(#glow-map)" : ""} fillOpacity="0.5" />
             {/* Blades Animation placeholder */}
             {turbineSpeed > 100 && (
                 <g className="origin-center animate-spin" style={{ transformBox: 'fill-box', animationDuration: '0.5s' }}>
                     <path d="M 50 20 L 50 80 M 20 50 L 80 50" stroke="white" strokeWidth="1" />
                 </g>
             )}
         </g>
         
         {/* Generator */}
         <rect x="620" y="40" width="80" height="80" fill="#18181b" stroke="#3f3f46" />
         <text x="635" y="85" fill="#71717a" fontSize="10" fontFamily="monospace">GEN</text>

         {/* Cooling Tower */}
         <path d="M 650 350 L 750 350 L 730 200 L 670 200 Z" fill="none" stroke="#3f3f46" strokeWidth="1" />

        {/* Labels */}
        <text x="130" y="330" fill="#52525b" fontSize="10" fontFamily="monospace" letterSpacing="1">REACTOR VESSEL</text>
        <text x="310" y="370" fill="#52525b" fontSize="10" fontFamily="monospace" letterSpacing="1">STEAM GEN</text>
        <text x="520" y="130" fill="#52525b" fontSize="10" fontFamily="monospace" letterSpacing="1">TURBINE</text>
      </svg>
      
      {/* Overlay Data */}
      <div className="absolute top-4 right-4 text-[10px] text-emerald-500 font-mono tracking-wider">
        <div>FLOW: {coolantFlow.toFixed(1)}%</div>
        <div>RPM: {turbineSpeed.toFixed(0)}</div>
      </div>
    </div>
  )
}

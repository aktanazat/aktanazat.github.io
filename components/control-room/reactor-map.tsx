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
    if (temp < 100) return '#3b82f6' // Blue
    if (temp < 300) return '#22c55e' // Green
    if (temp < 800) return '#eab308' // Yellow
    if (temp < 1500) return '#f97316' // Orange
    return '#ef4444' // Red
  }

  return (
    <div className="relative w-full h-[400px] bg-slate-900 rounded-lg border border-slate-700 p-4 overflow-hidden">
      <svg viewBox="0 0 800 400" className="w-full h-full">
        {/* Reactor Vessel */}
        <g transform="translate(100, 100)">
          <rect x="0" y="0" width="120" height="200" rx="20" fill="#1e293b" stroke="#475569" strokeWidth="4" />
          {/* Core */}
          <rect 
            x="20" 
            y="100" 
            width="80" 
            height="80" 
            fill={getCoreColor(coreTemp)} 
            opacity="0.8"
          />
           {/* Control Rods */}
           <g transform={`translate(0, ${controlRodLevel * 0.8})`}>
             <rect x="30" y="20" width="10" height="80" fill="#94a3b8" />
             <rect x="55" y="20" width="10" height="80" fill="#94a3b8" />
             <rect x="80" y="20" width="10" height="80" fill="#94a3b8" />
           </g>
        </g>

        {/* Primary Loop Pipes */}
        <path 
          d="M 220 150 L 350 150 L 350 100" 
          fill="none" 
          stroke="#64748b" 
          strokeWidth="12" 
          strokeDasharray={coolantFlow > 0 ? "10 5" : "none"}
          className={coolantFlow > 0 ? "animate-pulse" : ""}
        />
        <path 
          d="M 350 300 L 350 250 L 220 250" 
          fill="none" 
          stroke="#334155" 
          strokeWidth="12" 
        />

        {/* Steam Generator */}
        <g transform="translate(300, 50)">
             <rect x="0" y="0" width="100" height="300" rx="10" fill="#1e293b" stroke="#475569" strokeWidth="4" />
             <path d="M 20 50 Q 50 50 80 50" stroke="#38bdf8" strokeWidth="4" fill="none" />
             <path d="M 20 100 Q 50 100 80 100" stroke="#38bdf8" strokeWidth="4" fill="none" />
             <path d="M 20 150 Q 50 150 80 150" stroke="#38bdf8" strokeWidth="4" fill="none" />
        </g>

        {/* Turbine */}
         <g transform="translate(500, 50)">
             <path d="M 0 20 L 100 0 L 100 100 L 0 80 Z" fill="#475569" />
             <circle cx="50" cy="50" r="30" fill={turbineSpeed > 100 ? "#22c55e" : "#64748b"} />
             {/* Blades Animation placeholder */}
             {turbineSpeed > 100 && (
                 <g className="origin-center animate-spin" style={{ transformBox: 'fill-box' }}>
                     <path d="M 50 20 L 50 80 M 20 50 L 80 50" stroke="white" strokeWidth="2" />
                 </g>
             )}
         </g>
         
         {/* Generator */}
         <rect x="620" y="40" width="80" height="80" fill="#334155" stroke="#475569" />
         <text x="635" y="85" fill="white" fontSize="12">GEN</text>

         {/* Cooling Tower */}
         <path d="M 650 350 L 750 350 L 730 200 L 670 200 Z" fill="#cbd5e1" opacity="0.5" />

        {/* Labels */}
        <text x="130" y="330" fill="#94a3b8" fontSize="14">REACTOR VESSEL</text>
        <text x="310" y="370" fill="#94a3b8" fontSize="14">STEAM GEN</text>
        <text x="520" y="130" fill="#94a3b8" fontSize="14">TURBINE</text>
      </svg>
      
      {/* Overlay Data */}
      <div className="absolute top-4 right-4 text-xs text-green-500 font-mono">
        <div>FLOW: {coolantFlow.toFixed(1)}%</div>
        <div>RPM: {turbineSpeed.toFixed(0)}</div>
      </div>
    </div>
  )
}


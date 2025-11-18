import React from 'react'

interface PlantOverviewProps {
  reactorStatus: string
  coreTemp: number
  primaryPressure: number
  coolantFlow: number
  steamPressure: number
  turbineSpeed: number
  outputMw: number
  condenserTemp: number
  coolingEff: number
}

export function PlantOverview({
  reactorStatus,
  coreTemp,
  primaryPressure,
  coolantFlow,
  steamPressure,
  turbineSpeed,
  outputMw,
  condenserTemp,
  coolingEff
}: PlantOverviewProps) {
  
  const getPipeColor = (temp: number, type: 'water' | 'steam') => {
      if (type === 'steam') return temp > 100 ? '#ef4444' : '#3f3f46'
      if (temp > 280) return '#ef4444'
      if (temp > 100) return '#f97316'
      return '#06b6d4' // Cyan for normal water
  }

  return (
    <div className="w-full h-[500px] bg-[#080808] p-4 relative overflow-hidden select-none">
      {/* SVG Diagram */}
      <svg viewBox="0 0 1000 500" className="w-full h-full">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#18181b" strokeWidth="1" />
          </pattern>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* --- CONTAINMENT BUILDING (Left) --- */}
        <g transform="translate(50, 50)">
            {/* Dome Outline */}
            <path d="M 0 400 L 0 100 Q 100 0 200 100 L 200 400 Z" fill="none" stroke="#27272a" strokeWidth="2" strokeDasharray="5 5" />
            <text x="20" y="30" fill="#52525b" fontSize="10" fontFamily="monospace" letterSpacing="2">CONTAINMENT</text>
            
            {/* Reactor Vessel */}
            <rect x="60" y="200" width="80" height="150" rx="2" fill="#18181b" stroke="#52525b" strokeWidth="2" />
            
            {/* Core (Glows based on temp) */}
            <rect 
                x="70" y="250" width="60" height="80" 
                fill={coreTemp > 300 ? '#ef4444' : '#06b6d4'} 
                fillOpacity={Math.min(1, coreTemp / 1500)}
                className="transition-colors duration-500"
                filter={coreTemp > 100 ? "url(#glow)" : ""}
            />
            
            {/* Pressurizer */}
            <rect x="120" y="150" width="30" height="40" rx="2" fill="#18181b" stroke="#52525b" />
            
            {/* Steam Generator (Primary Side) */}
            <rect x="150" y="180" width="40" height="120" rx="2" fill="#18181b" stroke="#52525b" />
        </g>

        {/* --- PIPING CONNECTORS --- */}
        {/* Primary Loop (Reactor -> SG) */}
        <path d="M 140 220 L 200 220" stroke={getPipeColor(coreTemp, 'water')} strokeWidth="4" fill="none" opacity="0.8" />
        <path d="M 200 320 L 140 320" stroke="#0e7490" strokeWidth="4" fill="none" opacity="0.6" />
        
        {/* Secondary Loop (Steam) SG -> Turbine */}
        <path 
            d="M 240 200 L 400 200" 
            stroke={steamPressure > 1 ? "#e4e4e7" : "#3f3f46"} 
            strokeWidth="3" 
            strokeDasharray={steamPressure > 1 ? "4 2" : "none"}
            className={steamPressure > 1 ? "animate-pulse" : ""}
            fill="none" 
        />

        {/* --- TURBINE HALL (Center) --- */}
        <g transform="translate(400, 100)">
            <rect x="0" y="0" width="300" height="300" fill="none" stroke="#27272a" strokeWidth="1" />
            <text x="10" y="20" fill="#52525b" fontSize="10" fontFamily="monospace" letterSpacing="2">TURBINE HALL</text>

            {/* HP Turbine */}
            <path d="M 20 80 L 80 60 L 80 140 L 20 120 Z" fill="#27272a" stroke="#52525b" />
            {/* LP Turbine */}
            <path d="M 90 60 L 160 40 L 160 160 L 90 140 Z" fill="#27272a" stroke="#52525b" />
            
            {/* Generator */}
            <rect x="180" y="60" width="80" height="100" fill="#18181b" stroke="#52525b" />
            <text x="190" y="110" fill="#a1a1aa" fontSize="10" fontFamily="monospace">GEN</text>
            
            {/* Shaft (Spinning) */}
            <rect x="0" y="95" width="260" height="10" fill="#52525b" />
            
            {/* Condenser */}
            <rect x="50" y="200" width="150" height="80" fill="#18181b" stroke="#52525b" />
            <path d="M 60 220 L 190 220 M 60 240 L 190 240 M 60 260 L 190 260" stroke="#0e7490" strokeWidth="1" />
        </g>

        {/* --- COOLING TOWERS (Right) --- */}
        <g transform="translate(750, 150)">
            <path d="M 0 250 L 120 250 L 100 50 L 20 50 Z" fill="none" stroke="#52525b" strokeWidth="1" />
            {/* Steam Plume */}
            {condenserTemp > 40 && (
                <g className="animate-pulse" opacity="0.3">
                   <circle cx="60" cy="40" r="20" fill="#fff" filter="url(#glow)" />
                   <circle cx="70" cy="20" r="25" fill="#fff" filter="url(#glow)" />
                   <circle cx="50" cy="10" r="30" fill="#fff" filter="url(#glow)" />
                </g>
            )}
        </g>

        {/* --- GRID (Far Right) --- */}
        <g transform="translate(900, 100)">
             <path d="M 0 0 L 0 200" stroke="#27272a" strokeWidth="2" />
             <path d="M 0 40 L 50 40 M 0 100 L 50 100 M 0 160 L 50 160" stroke={outputMw > 10 ? "#fbbf24" : "#52525b"} strokeWidth="2" />
             <text x="10" y="20" fill="#71717a" fontSize="10" fontFamily="monospace">GRID</text>
        </g>

        {/* Flow Lines / Arrows */}
        {/* Condensate Return */}
        <path d="M 450 350 L 450 450 L 200 450 L 200 300" stroke="#0e7490" strokeWidth="2" strokeDasharray="2 4" fill="none" opacity="0.4" />
        
        {/* Labels & Metrics Overlay in SVG */}
        <text x="70" y="460" fill="#52525b" fontSize="10" fontFamily="monospace">STATUS: {reactorStatus}</text>
        <text x="420" y="380" fill="#52525b" fontSize="10" fontFamily="monospace">CDSR: {condenserTemp.toFixed(0)}°C</text>
        <text x="800" y="420" fill="#52525b" fontSize="10" fontFamily="monospace">EFF: {coolingEff.toFixed(0)}%</text>
      </svg>
    </div>
  )
}

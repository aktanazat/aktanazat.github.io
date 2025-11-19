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
      if (type === 'steam') return temp > 100 ? '#ef4444' : '#27272a'
      if (temp > 280) return '#ef4444'
      if (temp > 100) return '#f97316'
      return '#52525b' // Zinc-600 (Metallic Grey) for cold water
  }

  return (
    <div className="w-full h-[380px] bg-[#080808] p-4 relative overflow-hidden select-none">
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
          <linearGradient id="pipeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
             <stop offset="0%" stopColor="#18181b" />
             <stop offset="50%" stopColor="#3f3f46" />
             <stop offset="100%" stopColor="#18181b" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* --- CONTAINMENT BUILDING (Left) --- */}
        <g transform="translate(50, 50)">
            {/* Dome Outline */}
            <path d="M 0 350 L 0 100 Q 100 0 200 100 L 200 350" fill="#18181b" fillOpacity="0.5" stroke="#52525b" strokeWidth="2" strokeDasharray="10 5" />
            <text x="20" y="30" fill="#71717a" fontSize="10" fontFamily="monospace" letterSpacing="2" fontWeight="bold">CONTAINMENT</text>
            
            {/* Reactor Vessel */}
            <rect x="60" y="200" width="80" height="150" rx="8" fill="#09090b" stroke="#71717a" strokeWidth="3" />
            <rect x="70" y="210" width="60" height="130" rx="4" fill="#27272a" fillOpacity="0.3" />
            
            {/* Core (Glows based on temp) */}
            <rect 
                x="75" y="260" width="50" height="70" rx="2"
                fill={coreTemp > 300 ? '#ef4444' : '#06b6d4'} 
                fillOpacity={Math.min(0.8, coreTemp / 2000)}
                className="transition-colors duration-500"
                filter={coreTemp > 100 ? "url(#glow)" : ""}
            />
            
            {/* Pressurizer */}
            <rect x="120" y="150" width="30" height="60" rx="6" fill="#09090b" stroke="#71717a" strokeWidth="2" />
            <line x1="135" y1="210" x2="135" y2="230" stroke="#71717a" strokeWidth="2" />
            
            {/* Steam Generator (Primary Side) */}
            <rect x="160" y="180" width="50" height="140" rx="6" fill="#09090b" stroke="#71717a" strokeWidth="2" />
            {/* Internal Tubes - Subtler */}
            <path d="M 170 200 Q 185 200 200 200" stroke="#3f3f46" strokeWidth="1" fill="none" opacity="0.5" />
            <path d="M 170 220 Q 185 220 200 220" stroke="#3f3f46" strokeWidth="1" fill="none" opacity="0.5" />
            <path d="M 170 240 Q 185 240 200 240" stroke="#3f3f46" strokeWidth="1" fill="none" opacity="0.5" />
        </g>

        {/* --- PIPING CONNECTORS --- */}
        {/* Primary Loop (Reactor -> SG) */}
        <path d="M 140 240 L 210 240" stroke={getPipeColor(coreTemp, 'water')} strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Cold Leg */}
        <path d="M 210 330 L 140 330" stroke={getPipeColor(coreTemp > 50 ? 50 : 25, 'water')} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
        
        {/* Secondary Loop (Steam) SG -> Turbine */}
        <path 
            d="M 260 200 L 400 200" 
            stroke={steamPressure > 1 ? "#d4d4d8" : "#52525b"} 
            strokeWidth="4" 
            strokeDasharray={steamPressure > 1 ? "6 4" : "none"}
            className={steamPressure > 1 ? "animate-pulse" : ""}
            fill="none" 
        />

        {/* --- TURBINE HALL (Center) --- */}
        <g transform="translate(400, 100)">
            <rect x="0" y="0" width="320" height="300" fill="#18181b" fillOpacity="0.3" stroke="#27272a" strokeWidth="1" />
            <text x="10" y="20" fill="#71717a" fontSize="10" fontFamily="monospace" letterSpacing="2" fontWeight="bold">TURBINE HALL</text>

            {/* Turbines - Trapezoid shapes */}
            <path d="M 20 80 L 90 50 L 90 150 L 20 120 Z" fill="#27272a" stroke="#71717a" strokeWidth="2" />
            <path d="M 100 50 L 200 20 L 200 180 L 100 150 Z" fill="#27272a" stroke="#71717a" strokeWidth="2" />
            
            {/* Generator */}
            <rect x="210" y="50" width="90" height="100" fill="#18181b" stroke="#71717a" strokeWidth="2" />
            <text x="225" y="105" fill="#a1a1aa" fontSize="12" fontFamily="monospace" fontWeight="bold">GEN</text>
            
            {/* Shaft (Spinning) */}
            <rect x="0" y="95" width="300" height="10" fill="#52525b" rx="2" />
            <rect x="10" y="98" width="280" height="4" fill={turbineSpeed > 100 ? "#10b981" : "#3f3f46"} filter={turbineSpeed > 100 ? "url(#glow)" : ""} />
            
            {/* Condenser */}
            <rect x="50" y="200" width="220" height="80" rx="4" fill="#09090b" stroke="#52525b" strokeWidth="2" />
            <text x="60" y="275" fill="#3f3f46" fontSize="8" fontFamily="monospace">CONDENSER</text>
        </g>

        {/* --- COOLING TOWERS (Right) --- */}
        <g transform="translate(780, 150)">
            {/* Structure */}
            <path d="M 0 250 L 140 250 L 110 20 L 30 20 Z" fill="#18181b" stroke="#52525b" strokeWidth="2" />
            <path d="M 30 20 Q 70 30 110 20" fill="none" stroke="#52525b" />
            
            {/* Steam Plume */}
            {condenserTemp > 40 && (
                <g transform="translate(70, 0)">
                   <circle cx="0" cy="-20" r="15" fill="#fff" filter="url(#glow)" opacity="0.2" className="animate-pulse" />
                   <circle cx="-10" cy="-40" r="20" fill="#fff" filter="url(#glow)" opacity="0.15" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                   <circle cx="15" cy="-50" r="25" fill="#fff" filter="url(#glow)" opacity="0.1" className="animate-pulse" style={{ animationDelay: '1s' }} />
                </g>
            )}
        </g>

        {/* --- GRID (Far Right) --- */}
        <g transform="translate(940, 100)">
             <line x1="0" y1="0" x2="0" y2="300" stroke="#3f3f46" strokeWidth="4" />
             <line x1="0" y1="50" x2="40" y2="50" stroke={outputMw > 10 ? "#fbbf24" : "#3f3f46"} strokeWidth="2" filter={outputMw > 10 ? "url(#glow)" : ""} />
             <line x1="0" y1="150" x2="40" y2="150" stroke={outputMw > 10 ? "#fbbf24" : "#3f3f46"} strokeWidth="2" filter={outputMw > 10 ? "url(#glow)" : ""} />
             <line x1="0" y1="250" x2="40" y2="250" stroke={outputMw > 10 ? "#fbbf24" : "#3f3f46"} strokeWidth="2" filter={outputMw > 10 ? "url(#glow)" : ""} />
             <text x="-10" y="20" fill="#71717a" fontSize="10" fontFamily="monospace" fontWeight="bold">GRID</text>
        </g>

        {/* Flow Lines / Arrows */}
        {/* Condensate Return - Raised to avoid overlap */}
        <path d="M 510 280 L 510 430 L 210 430 L 210 320" stroke="#52525b" strokeWidth="2" strokeDasharray="4 4" fill="none" opacity="0.5" />
        <circle cx="510" cy="430" r="2" fill="#52525b" />
        <circle cx="210" cy="430" r="2" fill="#52525b" />
        
        {/* Labels & Metrics Overlay in SVG - Status Moved */}
        <g transform="translate(50, 420)">
            <rect x="-10" y="-15" width="140" height="25" rx="4" fill="#09090b" stroke="#3f3f46" />
            <text x="0" y="0" fill="#e4e4e7" fontSize="10" fontFamily="monospace" fontWeight="bold">STATUS: {reactorStatus}</text>
        </g>

        {/* Condenser Temp - Moved Down */}
        <g transform="translate(450, 420)">
             <text x="0" y="0" fill="#71717a" fontSize="10" fontFamily="monospace">CONDENSER TEMP</text>
             <text x="0" y="15" fill="#e4e4e7" fontSize="14" fontFamily="monospace">{condenserTemp.toFixed(0)}°C</text>
        </g>
        
        <g transform="translate(830, 420)">
             <text x="0" y="0" fill="#71717a" fontSize="10" fontFamily="monospace">COOLING EFF</text>
             <text x="0" y="15" fill="#e4e4e7" fontSize="14" fontFamily="monospace">{coolingEff.toFixed(0)}%</text>
        </g>
      </svg>
    </div>
  )
}

import React from 'react'
import { motion } from 'framer-motion'
import { Activity, CloudFog, Fan, Zap } from 'lucide-react'

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
      if (type === 'steam') return temp > 100 ? '#ef4444' : '#cbd5e1'
      if (temp > 280) return '#ef4444'
      if (temp > 100) return '#f97316'
      return '#3b82f6'
  }

  return (
    <div className="w-full h-[500px] bg-slate-950 rounded-xl border border-slate-800 p-4 relative overflow-hidden">
      {/* SVG Diagram */}
      <svg viewBox="0 0 1000 500" className="w-full h-full">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* --- CONTAINMENT BUILDING (Left) --- */}
        <g transform="translate(50, 50)">
            <path d="M 0 400 L 0 100 Q 100 0 200 100 L 200 400 Z" fill="#1e293b" stroke="#475569" strokeWidth="2" />
            <text x="20" y="30" fill="#64748b" fontSize="12" fontWeight="bold">CONTAINMENT</text>
            
            {/* Reactor Vessel */}
            <rect x="60" y="200" width="80" height="150" rx="20" fill="#334155" stroke="#cbd5e1" strokeWidth="2" />
            
            {/* Core (Glows based on temp) */}
            <rect 
                x="70" y="250" width="60" height="80" 
                fill={coreTemp > 300 ? '#ef4444' : '#3b82f6'} 
                opacity={Math.min(1, coreTemp / 1000)}
                className="transition-colors duration-500"
            />
            
            {/* Pressurizer */}
            <rect x="120" y="150" width="30" height="40" rx="5" fill="#475569" stroke="#cbd5e1" />
            
            {/* Steam Generator (Primary Side) */}
            <rect x="150" y="180" width="40" height="120" rx="10" fill="#334155" stroke="#cbd5e1" />
        </g>

        {/* --- PIPING CONNECTORS --- */}
        {/* Primary Loop (Reactor -> SG) */}
        <path d="M 140 220 L 200 220" stroke={getPipeColor(coreTemp, 'water')} strokeWidth="8" fill="none" />
        <path d="M 200 320 L 140 320" stroke="#3b82f6" strokeWidth="8" fill="none" />
        
        {/* Secondary Loop (Steam) SG -> Turbine */}
        <path 
            d="M 240 200 L 400 200" 
            stroke={steamPressure > 1 ? "#e2e8f0" : "#475569"} 
            strokeWidth="6" 
            strokeDasharray={steamPressure > 1 ? "10 5" : "none"}
            className={steamPressure > 1 ? "animate-pulse" : ""}
            fill="none" 
        />

        {/* --- TURBINE HALL (Center) --- */}
        <g transform="translate(400, 100)">
            <rect x="0" y="0" width="300" height="300" fill="#1e293b" stroke="#475569" strokeWidth="2" opacity="0.5"/>
            <text x="10" y="20" fill="#64748b" fontSize="12" fontWeight="bold">TURBINE HALL</text>

            {/* HP Turbine */}
            <path d="M 20 80 L 80 60 L 80 140 L 20 120 Z" fill="#64748b" stroke="#cbd5e1" />
            {/* LP Turbine */}
            <path d="M 90 60 L 160 40 L 160 160 L 90 140 Z" fill="#64748b" stroke="#cbd5e1" />
            
            {/* Generator */}
            <rect x="180" y="60" width="80" height="100" fill="#475569" stroke="#cbd5e1" />
            <text x="190" y="110" fill="white" fontSize="10">GEN</text>
            
            {/* Shaft (Spinning) */}
            <rect x="0" y="95" width="260" height="10" fill="#94a3b8" />
            
            {/* Condenser */}
            <rect x="50" y="200" width="150" height="80" fill="#334155" stroke="#64748b" />
            <path d="M 60 220 L 190 220 M 60 240 L 190 240 M 60 260 L 190 260" stroke="#3b82f6" strokeWidth="2" />
        </g>

        {/* --- COOLING TOWERS (Right) --- */}
        <g transform="translate(750, 150)">
            <path d="M 0 250 L 120 250 L 100 50 L 20 50 Z" fill="#cbd5e1" stroke="#94a3b8" opacity="0.8" />
            {/* Steam Plume */}
            {condenserTemp > 40 && (
                <g className="animate-pulse" opacity="0.6">
                   <circle cx="60" cy="40" r="20" fill="white" filter="url(#blur)" />
                   <circle cx="70" cy="20" r="25" fill="white" filter="url(#blur)" />
                   <circle cx="50" cy="10" r="30" fill="white" filter="url(#blur)" />
                </g>
            )}
        </g>

        {/* --- GRID (Far Right) --- */}
        <g transform="translate(900, 100)">
             <path d="M 0 0 L 0 200" stroke="#475569" strokeWidth="4" />
             <path d="M 0 40 L 50 40 M 0 100 L 50 100 M 0 160 L 50 160" stroke="#fbbf24" strokeWidth="2" />
             <text x="10" y="20" fill="#fbbf24" fontSize="12">GRID</text>
        </g>

        {/* Flow Lines / Arrows */}
        {/* Condensate Return */}
        <path d="M 450 350 L 450 450 L 200 450 L 200 300" stroke="#3b82f6" strokeWidth="4" strokeDasharray="5 5" fill="none" opacity="0.5" />
        
        {/* Labels & Metrics Overlay in SVG */}
        <text x="70" y="460" fill="#94a3b8" fontSize="12">Rx: {reactorStatus}</text>
        <text x="420" y="380" fill="#94a3b8" fontSize="12">Condenser: {condenserTemp.toFixed(0)}°C</text>
        <text x="800" y="420" fill="#94a3b8" fontSize="12">Eff: {coolingEff.toFixed(0)}%</text>
      </svg>

      {/* Live Overlay Widgets (HTML on top of SVG) */}
      <div className="absolute top-4 right-4 flex gap-4">
          <div className="bg-black/80 p-2 rounded border border-green-900/50 text-green-400 font-mono text-xs">
              <div className="flex items-center gap-2">
                  <Zap size={14} />
                  <span className="text-lg font-bold">{outputMw.toFixed(1)}</span> MW
              </div>
          </div>
      </div>
      
      <div className="absolute bottom-4 left-4 flex gap-4">
          <div className="bg-black/80 p-2 rounded border border-blue-900/50 text-blue-400 font-mono text-xs">
              <div className="flex items-center gap-2">
                  <Activity size={14} />
                  <span>CORE: {coreTemp.toFixed(0)}°C</span>
              </div>
          </div>
          <div className="bg-black/80 p-2 rounded border border-slate-700 text-slate-300 font-mono text-xs">
              <div className="flex items-center gap-2">
                  <Fan size={14} />
                  <span>TURBINE: {turbineSpeed.toFixed(0)} RPM</span>
              </div>
          </div>
      </div>
    </div>
  )
}


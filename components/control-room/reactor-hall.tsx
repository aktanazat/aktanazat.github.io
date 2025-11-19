import React from 'react'
import { motion } from 'framer-motion'

interface ReactorHallProps {
    type: 'PWR' | 'RBMK' | 'BWR'
    flux: number
    temp: number
    waterLevel: number // 0-100%
}

export function ReactorHall({ type, flux, temp, waterLevel }: ReactorHallProps) {
    // Cherenkov Glow Intensity (Blue)
    const glowOpacity = Math.min(0.8, flux / 100)
    
    return (
        <div className="w-full h-full bg-[#050505] relative overflow-hidden flex items-center justify-center p-8">
            {/* Cherenkov Glow Overlay (Global Atmosphere) */}
            <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
                style={{ 
                    background: `radial-gradient(circle at center, rgba(6,182,212,${glowOpacity * 0.5}) 0%, transparent 70%)` 
                }}
            />

            <svg viewBox="0 0 800 600" className="w-full h-full max-w-[800px]">
                <defs>
                    <filter id="cherenkov-bloom">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id="water-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#083344" stopOpacity="0.8" />
                    </linearGradient>
                </defs>

                {/* --- PWR VISUALIZATION --- */}
                {type === 'PWR' && (
                    <g transform="translate(250, 50)">
                        <text x="150" y="-20" fill="#52525b" textAnchor="middle" fontFamily="monospace" fontSize="12">PRESSURIZED WATER REACTOR VESSEL</text>
                        
                        {/* Concrete Shield */}
                        <path d="M 50 50 L 50 500 L 250 500 L 250 50 L 220 50 L 220 450 L 80 450 L 80 50 Z" fill="#27272a" />
                        
                        {/* Reactor Vessel */}
                        <path d="M 100 80 L 100 400 Q 150 440 200 400 L 200 80 Q 150 40 100 80" fill="#18181b" stroke="#71717a" strokeWidth="2" />
                        
                        {/* Water Level */}
                        <path d="M 100 400 Q 150 440 200 400 L 200 150 L 100 150 Z" fill="url(#water-grad)" />
                        
                        {/* Fuel Assemblies */}
                        <g transform="translate(120, 250)">
                            <rect x="0" y="0" width="10" height="100" fill="#3f3f46" />
                            <rect x="20" y="0" width="10" height="100" fill="#3f3f46" />
                            <rect x="40" y="0" width="10" height="100" fill="#3f3f46" />
                            
                            {/* Cherenkov Glow on Fuel */}
                            <rect x="-5" y="-10" width="70" height="120" fill="#06b6d4" fillOpacity={glowOpacity} filter="url(#cherenkov-bloom)" />
                        </g>

                        {/* Control Rods (Top Entry) */}
                        <g transform="translate(120, 100)">
                            <line x1="5" y1="0" x2="5" y2="140" stroke="#71717a" strokeWidth="2" />
                            <line x1="25" y1="0" x2="25" y2="140" stroke="#71717a" strokeWidth="2" />
                            <line x1="45" y1="0" x2="45" y2="140" stroke="#71717a" strokeWidth="2" />
                        </g>
                    </g>
                )}

                {/* --- RBMK VISUALIZATION --- */}
                {type === 'RBMK' && (
                    <g transform="translate(100, 50)">
                        <text x="300" y="-20" fill="#52525b" textAnchor="middle" fontFamily="monospace" fontSize="12">RBMK REACTOR HALL (UNIT 4 CONFIG)</text>

                        {/* Reactor Pit / Biological Shield */}
                        <rect x="100" y="100" width="400" height="300" fill="#27272a" />
                        
                        {/* The "Elena" Lid (Upper Biological Shield) */}
                        <rect x="100" y="80" width="400" height="40" fill="#3f3f46" stroke="#52525b" />
                        
                        {/* Fuel Channels (Grid Pattern) */}
                        <g transform="translate(120, 140)">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <g key={i} transform={`translate(${i * 35}, 0)`}>
                                    <line x1="0" y1="0" x2="0" y2="250" stroke="#52525b" strokeWidth="1" />
                                    {/* Cherenkov Glow (Visible through water piping/spent fuel pools nearby, stylized here) */}
                                    <circle cx="0" cy="125" r="10" fill="#06b6d4" fillOpacity={glowOpacity * 0.8} filter="url(#cherenkov-bloom)" />
                                </g>
                            ))}
                        </g>

                        {/* Refueling Machine (Crane) */}
                        <g transform="translate(250, 40)">
                            <rect x="-40" y="0" width="80" height="30" fill="#f59e0b" />
                            <line x1="0" y1="30" x2="0" y2="80" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
                        </g>
                    </g>
                )}

                {/* --- BWR VISUALIZATION --- */}
                {type === 'BWR' && (
                    <g transform="translate(200, 50)">
                        <text x="200" y="-20" fill="#52525b" textAnchor="middle" fontFamily="monospace" fontSize="12">BOILING WATER REACTOR (MARK I)</text>

                        {/* Drywell (Lightbulb Shape) */}
                        <path d="M 100 100 Q 50 200 100 350 L 100 450 L 300 450 L 300 350 Q 350 200 300 100 Z" fill="#27272a" fillOpacity="0.5" stroke="#52525b" />
                        
                        {/* Reactor Vessel */}
                        <rect x="150" y="150" width="100" height="200" rx="20" fill="#18181b" stroke="#71717a" strokeWidth="2" />
                        
                        {/* Steam Lines (Top) */}
                        <path d="M 180 150 L 180 50 M 220 150 L 220 50" stroke="#d4d4d8" strokeWidth="4" />
                        
                        {/* Suppression Pool (Torus) - Bottom */}
                        <path d="M 50 480 Q 200 520 350 480 Q 350 550 200 550 Q 50 550 50 480" fill="#0e7490" fillOpacity="0.3" stroke="#0e7490" />

                        {/* Core Area */}
                        <rect x="160" y="250" width="80" height="80" fill="#3f3f46" />
                        <rect x="160" y="250" width="80" height="80" fill="#06b6d4" fillOpacity={glowOpacity} filter="url(#cherenkov-bloom)" />
                        
                        {/* Control Rods (Bottom Entry for BWR) */}
                        <g transform="translate(200, 350)">
                            <line x1="-10" y1="0" x2="-10" y2="50" stroke="#71717a" strokeWidth="2" />
                            <line x1="10" y1="0" x2="10" y2="50" stroke="#71717a" strokeWidth="2" />
                        </g>
                    </g>
                )}
            </svg>
            
            {/* Status Overlay */}
            <div className="absolute bottom-4 left-4 bg-black/80 border border-white/10 p-4 rounded backdrop-blur-md">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Visual Inspection</div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${flux > 1 ? 'bg-cyan-400 animate-pulse' : 'bg-zinc-600'}`} />
                    <span className="text-sm font-mono text-white">
                        {flux > 1 ? 'CHERENKOV RADIATION DETECTED' : 'NO VISIBLE RADIATION'}
                    </span>
                </div>
            </div>
        </div>
    )
}


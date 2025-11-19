import React from 'react'
import { Card } from '@/components/ui/card'

interface CoreRegion {
    id: number
    temp: number
    power: number
    flux: number
}

interface CoreViewProps {
    regions: CoreRegion[]
    controlRodPosition: number
}

export function CoreView({ regions, controlRodPosition }: CoreViewProps) {
    const getRegionColor = (temp: number) => {
        // Interpolate Blue -> Green -> Red
        if (temp < 300) return `rgba(6, 182, 212, 0.2)` // Cyan
        if (temp < 1000) return `rgba(16, 185, 129, 0.3)` // Emerald
        if (temp < 2000) return `rgba(245, 158, 11, 0.4)` // Amber
        return `rgba(239, 68, 68, 0.5)` // Red
    }

    return (
        <div className="h-full flex flex-col gap-6 justify-center px-8">
            <div className="grid grid-cols-2 gap-6 aspect-square w-full max-w-[400px] mx-auto relative">
                {regions.map((region) => (
                    <div 
                        key={region.id}
                        className="relative rounded-sm border border-white/20 flex flex-col items-center justify-center p-4 transition-all duration-500 backdrop-blur-md group hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] overflow-hidden"
                        style={{ backgroundColor: getRegionColor(region.temp) }}
                    >
                         {/* Control Rod Overlay - NOW BEHIND TEXT */}
                        <div 
                            className="absolute top-0 left-0 w-full bg-black/80 transition-all duration-300 border-b border-cyan-500/50 z-0 pointer-events-none"
                            style={{ height: `${controlRodPosition}%` }}
                        />

                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30 group-hover:border-cyan-400 z-10" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30 group-hover:border-cyan-400 z-10" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30 group-hover:border-cyan-400 z-10" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30 group-hover:border-cyan-400 z-10" />

                        {/* Content - z-index higher to stay on top of rod overlay */}
                        <div className="relative z-20 text-center">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Temp</span>
                                <div className="text-3xl font-light text-white drop-shadow-lg tabular-nums tracking-tight">
                                    {region.temp.toFixed(0)}<span className="text-sm text-white/70 ml-0.5">°C</span>
                                </div>
                            </div>
                            
                            <div className="w-full h-px bg-white/10 my-2" />

                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Flux</span>
                                <div className="text-lg font-mono text-cyan-300 drop-shadow-lg tracking-wider">
                                    {region.flux.toFixed(1)}%
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Central Crosshair Overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none z-30">
                     <div className="absolute top-1/2 left-0 w-full h-px bg-white/20" />
                     <div className="absolute left-1/2 top-0 h-full w-px bg-white/20" />
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 border border-cyan-500 rounded-full" />
                </div>
            </div>
            
            <div className="bg-black/40 p-5 rounded-sm border border-white/10 backdrop-blur-sm">
                <h3 className="font-medium text-zinc-200 mb-4 uppercase tracking-[0.2em] text-[10px] border-b border-white/5 pb-2 flex justify-between">
                    <span>Core Telemetry</span>
                    <span className="text-emerald-500 animate-pulse">● LIVE</span>
                </h3>
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Avg Temp</span>
                        <span className="font-mono text-xl text-white tabular-nums">
                            {(regions.reduce((a, b) => a + b.temp, 0) / regions.length).toFixed(0)}°C
                        </span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Rod Insertion</span>
                        <span className="font-mono text-xl text-cyan-400 tabular-nums">{controlRodPosition.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

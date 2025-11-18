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
            <div className="grid grid-cols-2 gap-6 aspect-square w-full max-w-[400px] mx-auto">
                {regions.map((region) => (
                    <div 
                        key={region.id}
                        className="relative rounded-sm border border-white/20 flex flex-col items-center justify-center p-6 transition-all duration-500 backdrop-blur-md group hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                        style={{ backgroundColor: getRegionColor(region.temp) }}
                    >
                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30 group-hover:border-cyan-400" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30 group-hover:border-cyan-400" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30 group-hover:border-cyan-400" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30 group-hover:border-cyan-400" />

                        <div className="text-4xl font-light text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tabular-nums tracking-tighter">
                            {region.temp.toFixed(0)}<span className="text-lg text-white/60 ml-1">°C</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Flux</span>
                            <span className="text-sm font-mono text-cyan-300 drop-shadow-md tracking-wider">
                                {region.flux.toFixed(1)}%
                            </span>
                        </div>
                        
                        {/* Control Rod Overlay */}
                        <div 
                            className="absolute top-0 left-0 w-full bg-black/90 transition-all duration-300 border-b border-cyan-500/50"
                            style={{ height: `${controlRodPosition}%` }}
                        >
                            {controlRodPosition > 10 && (
                                <div className="absolute bottom-2 w-full text-center">
                                    <span className="text-[9px] text-cyan-500/70 font-mono uppercase tracking-[0.2em] bg-black/50 px-2 py-0.5 border border-cyan-900/30 rounded-full">
                                        ROD {controlRodPosition.toFixed(0)}%
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
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

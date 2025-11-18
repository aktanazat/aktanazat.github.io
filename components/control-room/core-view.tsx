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
        if (temp < 300) return `rgba(6, 182, 212, 0.3)` // Cyan
        if (temp < 1000) return `rgba(16, 185, 129, 0.4)` // Emerald
        if (temp < 2000) return `rgba(245, 158, 11, 0.5)` // Amber
        return `rgba(239, 68, 68, 0.6)` // Red
    }

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 aspect-square max-w-[400px] mx-auto">
                {regions.map((region) => (
                    <div 
                        key={region.id}
                        className="relative rounded-sm border border-white/10 flex flex-col items-center justify-center p-4 transition-all duration-500 backdrop-blur-md"
                        style={{ backgroundColor: getRegionColor(region.temp) }}
                    >
                        <div className="text-2xl font-light text-white drop-shadow-md tabular-nums">
                            {region.temp.toFixed(0)}<span className="text-sm text-white/60">°C</span>
                        </div>
                        <div className="text-[10px] font-mono text-zinc-300 drop-shadow-md tracking-wider mt-1">
                            FLUX: {region.flux.toFixed(1)}%
                        </div>
                        
                        {/* Control Rod Overlay */}
                        <div 
                            className="absolute top-0 left-0 w-full bg-black/80 transition-all duration-300 border-b border-white/20"
                            style={{ height: `${controlRodPosition}%` }}
                        >
                            {controlRodPosition > 10 && (
                                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                                    ROD {controlRodPosition.toFixed(0)}%
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="bg-black/40 p-4 rounded-sm border border-white/5 text-xs font-mono text-zinc-400">
                <h3 className="font-medium text-zinc-200 mb-2 uppercase tracking-widest text-[10px]">Core Telemetry</h3>
                <div className="grid grid-cols-2 gap-y-2">
                    <span>AVG TEMP:</span>
                    <span className="text-right text-white">
                        {(regions.reduce((a, b) => a + b.temp, 0) / regions.length).toFixed(0)}°C
                    </span>
                    <span>ROD INSERTION:</span>
                    <span className="text-right text-cyan-400">{controlRodPosition.toFixed(1)}%</span>
                </div>
            </div>
        </div>
    )
}

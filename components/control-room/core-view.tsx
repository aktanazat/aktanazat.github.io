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
        if (temp < 300) return `rgba(59, 130, 246, 0.5)` // Blue
        if (temp < 1000) return `rgba(34, 197, 94, 0.6)` // Green
        if (temp < 2000) return `rgba(234, 179, 8, 0.7)` // Yellow
        return `rgba(239, 68, 68, 0.8)` // Red
    }

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 aspect-square max-w-[400px] mx-auto">
                {regions.map((region) => (
                    <div 
                        key={region.id}
                        className="relative rounded-lg border border-slate-700 flex flex-col items-center justify-center p-4 transition-all duration-500"
                        style={{ backgroundColor: getRegionColor(region.temp) }}
                    >
                        <div className="text-2xl font-bold text-white drop-shadow-md">
                            {region.temp.toFixed(0)}°C
                        </div>
                        <div className="text-xs font-mono text-slate-200 drop-shadow-md">
                            FLUX: {region.flux.toFixed(1)}%
                        </div>
                        
                        {/* Control Rod Overlay */}
                        <div 
                            className="absolute top-0 left-0 w-full bg-slate-900/80 transition-all duration-300 border-b-2 border-slate-500"
                            style={{ height: `${controlRodPosition}%` }}
                        >
                            {controlRodPosition > 10 && (
                                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-400">
                                    ROD INSERTED
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="bg-slate-900 p-4 rounded border border-slate-800 text-xs font-mono text-slate-400">
                <h3 className="font-bold text-white mb-2">CORE STATUS</h3>
                <div className="grid grid-cols-2 gap-y-2">
                    <span>AVG TEMP:</span>
                    <span className="text-right text-white">
                        {(regions.reduce((a, b) => a + b.temp, 0) / regions.length).toFixed(0)}°C
                    </span>
                    <span>ROD INSERTION:</span>
                    <span className="text-right text-blue-400">{controlRodPosition.toFixed(1)}%</span>
                </div>
            </div>
        </div>
    )
}


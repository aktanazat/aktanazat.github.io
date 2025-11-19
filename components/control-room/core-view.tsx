import React from 'react'
import { cn } from '@/lib/utils'

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
        if (temp < 300) return `rgba(6, 182, 212, 0.15)` // Cyan
        if (temp < 1000) return `rgba(16, 185, 129, 0.25)` // Emerald
        if (temp < 2000) return `rgba(245, 158, 11, 0.35)` // Amber
        return `rgba(239, 68, 68, 0.5)` // Red
    }

    return (
        <div className="h-full w-full flex flex-col gap-4 justify-center items-center p-4 bg-[#0a0a0a]">
            {/* Main Core Grid (3x3) */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-[500px] aspect-square relative">
                {regions.map((region) => (
                    <div 
                        key={region.id}
                        className="relative rounded border border-white/10 bg-black/50 flex flex-col items-center justify-center p-2 overflow-hidden group hover:border-cyan-500/50 transition-all duration-300"
                        style={{ 
                            backgroundColor: getRegionColor(region.temp),
                            boxShadow: `inset 0 0 20px ${getRegionColor(region.temp)}`
                        }}
                    >
                         {/* Control Rod Overlay (Visual Depth) */}
                        <div 
                            className="absolute top-0 left-0 w-full bg-black/80 transition-all duration-500 border-b border-cyan-900/50 z-0 pointer-events-none"
                            style={{ height: `${controlRodPosition}%` }}
                        />

                        {/* Region Data */}
                        <div className="relative z-10 w-full h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] text-zinc-500 font-mono">R-{region.id}</span>
                                <span className={cn(
                                    "text-xs font-bold font-mono",
                                    region.temp > 1000 ? "text-amber-500" : "text-zinc-300"
                                )}>
                                    {region.temp.toFixed(0)}°C
                                </span>
                            </div>

                            <div className="flex flex-col items-center py-2">
                                <span className="text-[32px] font-light text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                    {region.flux.toFixed(0)}
                                    <span className="text-sm text-zinc-500 ml-1">%</span>
                                </span>
                            </div>

                            <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-cyan-500 transition-all duration-300"
                                    style={{ width: `${Math.min(100, region.flux)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Central Crosshair Overlay (Decorative) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 pointer-events-none z-30 opacity-50">
                     <div className="absolute top-1/2 left-0 w-full h-px bg-cyan-500/30" />
                     <div className="absolute left-1/2 top-0 h-full w-px bg-cyan-500/30" />
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-500/50 rounded-full" />
                </div>
            </div>
            
            {/* Bottom Telemetry Bar */}
            <div className="w-full max-w-[500px] bg-zinc-900/50 border border-zinc-800 p-4 rounded flex justify-between items-center backdrop-blur-sm">
                <div className="flex flex-col">
                     <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Avg Fuel Temp</span>
                     <span className="text-xl font-mono text-white">
                        {(regions.reduce((a, b) => a + b.temp, 0) / regions.length).toFixed(0)}°C
                     </span>
                </div>
                
                <div className="h-8 w-px bg-zinc-800" />

                <div className="flex flex-col items-end">
                     <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Control Rods</span>
                     <span className="text-xl font-mono text-cyan-400">
                        {controlRodPosition.toFixed(1)}%
                     </span>
                </div>
            </div>
        </div>
    )
}

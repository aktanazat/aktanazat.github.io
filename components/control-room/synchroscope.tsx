import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, ZapOff } from 'lucide-react'

interface SynchroscopeProps {
    phase: number // 0-360 degrees
    freqDiff: number // Hz difference (positive = fast, negative = slow)
    gridVoltage: number
    genVoltage: number
    breakerOpen: boolean
    onSync: () => void
}

export function Synchroscope({ phase, freqDiff, gridVoltage, genVoltage, breakerOpen, onSync }: SynchroscopeProps) {
    // Rotation speed visual multiplier
    const rotationSpeed = freqDiff * 20 

    return (
        <Card className="bg-[#0A0A0A]/80 border-white/10 backdrop-blur-sm rounded-sm h-[500px] flex flex-col overflow-hidden">
            <CardHeader className="pb-2 border-b border-white/5 bg-black/20 flex-shrink-0">
                <CardTitle className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-medium flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> 
                    Grid Synchronization
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-between p-6">
                
                {/* The Synchroscope Dial */}
                <div className="relative w-48 h-48 rounded-full border-4 border-zinc-700 bg-black shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center flex-shrink-0 mt-4">
                    {/* Markings */}
                    <div className="absolute top-2 text-xs font-mono text-emerald-500 font-bold">12</div>
                    <div className="absolute bottom-2 text-xs font-mono text-zinc-600">6</div>
                    <div className="absolute left-2 text-xs font-mono text-zinc-600">9</div>
                    <div className="absolute right-2 text-xs font-mono text-zinc-600">3</div>
                    
                    {/* SLOW / FAST Labels - Moved to sides */}
                    <div className="absolute left-8 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest -rotate-90 origin-center">SLOW</div>
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest rotate-90 origin-center">FAST</div>

                    {/* The Needle - SVG for better shape */}
                    <div 
                        className="absolute w-full h-full flex items-center justify-center transition-transform duration-75 ease-linear"
                        style={{ 
                            transform: `rotate(${phase}deg)`
                        }}
                    >
                        {/* Needle Shape */}
                        <svg width="20" height="100" viewBox="0 0 20 100" className="drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]" style={{ transform: 'translateY(-35%)' }}>
                            <path d="M 10 0 L 20 100 L 10 90 L 0 100 Z" fill="#f59e0b" />
                        </svg>
                    </div>
                    
                    {/* Center Cap */}
                    <div className="absolute w-6 h-6 bg-zinc-800 rounded-full border-2 border-zinc-600 z-10 shadow-lg" />
                </div>

                {/* Digital Readouts */}
                <div className="grid grid-cols-2 gap-4 w-full flex-shrink-0">
                    <div className="text-center space-y-1">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Slip Freq</div>
                        <div className={`font-mono text-lg ${Math.abs(freqDiff) < 0.1 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {freqDiff.toFixed(3)} Hz
                        </div>
                    </div>
                    <div className="text-center space-y-1">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Phase Angle</div>
                        <div className={`font-mono text-lg ${Math.abs(phase) < 10 || Math.abs(phase) > 350 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {phase.toFixed(1)}°
                        </div>
                    </div>
                </div>

                {/* Breaker Control */}
                <div className="w-full pt-4 border-t border-white/5 flex-shrink-0">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-zinc-400 uppercase tracking-widest">Main Breaker</span>
                        <Badge variant={breakerOpen ? "destructive" : "default"} className="font-mono text-[10px] px-2 py-0.5">
                            {breakerOpen ? "OPEN" : "CLOSED"}
                        </Badge>
                    </div>
                    
                    <Button 
                        size="lg"
                        variant={breakerOpen ? "outline" : "destructive"}
                        className={`w-full h-12 text-sm tracking-widest font-bold border-2 ${
                            breakerOpen 
                                ? "border-emerald-900/50 text-emerald-500 hover:bg-emerald-900/20 hover:text-emerald-400" 
                                : "border-red-900/50 text-red-500 hover:bg-red-900/20"
                        }`}
                        onClick={onSync}
                    >
                        {breakerOpen ? (
                            <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> CLOSE BREAKER</span>
                        ) : (
                            <span className="flex items-center gap-2"><ZapOff className="w-4 h-4" /> TRIP BREAKER</span>
                        )}
                    </Button>
                    
                    {breakerOpen && (
                        <p className="text-[10px] text-zinc-500 text-center mt-2">
                            WARNING: Closing out of phase will cause catastrophic turbine failure.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

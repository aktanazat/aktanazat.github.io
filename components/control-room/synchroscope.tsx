import React, { useEffect, useRef } from 'react'

interface SynchroscopeProps {
    phase: number // 0-360 degrees
    freqDiff: number // Hz difference
    gridVoltage: number
    genVoltage: number
    breakerOpen: boolean
    onSync: () => void
}

export function Synchroscope({ phase, freqDiff, gridVoltage, genVoltage, breakerOpen, onSync }: SynchroscopeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const w = canvas.width
        const h = canvas.height
        const cx = w / 2
        const cy = h / 2
        const r = w / 2 - 10

        // Clear
        ctx.clearRect(0, 0, w, h)

        // Draw Dial Background
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fillStyle = '#09090b'
        ctx.fill()
        ctx.strokeStyle = '#27272a'
        ctx.lineWidth = 4
        ctx.stroke()

        // Draw Ticks
        ctx.strokeStyle = '#71717a'
        ctx.lineWidth = 2
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30) * (Math.PI / 180)
            const innerR = i % 3 === 0 ? r - 15 : r - 8
            ctx.beginPath()
            ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR)
            ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r)
            ctx.stroke()
        }

        // Draw "12 o'clock" Marker (Sync Point)
        ctx.beginPath()
        ctx.moveTo(cx, cy - r)
        ctx.lineTo(cx, cy - r + 20)
        ctx.strokeStyle = '#10b981' // Emerald
        ctx.lineWidth = 4
        ctx.stroke()

        // Draw Labels
        ctx.fillStyle = '#71717a'
        ctx.font = '10px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('SLOW', cx - 40, cy + 10)
        ctx.fillText('FAST', cx + 40, cy + 10)

        // Draw Needle
        const rad = (phase - 90) * (Math.PI / 180) // -90 to start at top
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + Math.cos(rad) * (r - 10), cy + Math.sin(rad) * (r - 10))
        ctx.strokeStyle = '#ef4444' // Red needle
        ctx.lineWidth = 3
        ctx.stroke()

        // Center Cap
        ctx.beginPath()
        ctx.arc(cx, cy, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#52525b'
        ctx.fill()

    }, [phase])

    const isSyncSafe = Math.abs(phase) < 10 && Math.abs(freqDiff) < 0.1 && Math.abs(gridVoltage - genVoltage) < 500

    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-black/40 border border-white/10 rounded-sm">
            <div className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Synchroscope</div>
            
            <canvas ref={canvasRef} width={160} height={160} className="rounded-full shadow-lg" />
            
            <div className="grid grid-cols-2 gap-4 w-full text-[10px] font-mono">
                <div className="flex flex-col items-center p-2 bg-white/5 rounded">
                    <span className="text-zinc-500">GRID FREQ</span>
                    <span className="text-white text-lg">60.00 <span className="text-xs">Hz</span></span>
                </div>
                <div className="flex flex-col items-center p-2 bg-white/5 rounded">
                    <span className="text-zinc-500">GEN FREQ</span>
                    <span className={`text-lg ${Math.abs(freqDiff) < 0.1 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {(60 + freqDiff).toFixed(2)} <span className="text-xs">Hz</span>
                    </span>
                </div>
            </div>

            <button
                onClick={onSync}
                disabled={!breakerOpen}
                className={`w-full py-3 text-xs font-bold tracking-widest uppercase rounded-sm transition-all border ${
                    !breakerOpen 
                        ? 'bg-emerald-900/20 border-emerald-900 text-emerald-700 cursor-not-allowed'
                        : isSyncSafe 
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                            : 'bg-red-900/20 hover:bg-red-900/40 text-red-500 border-red-900'
                }`}
            >
                {breakerOpen ? (isSyncSafe ? "CLOSE BREAKER" : "SYNC UNSAFE") : "GRID CONNECTED"}
            </button>
        </div>
    )
}


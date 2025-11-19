import React from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface LiveGraphProps {
    data: number[]
    color: string
    label: string
    max: number
}

export function LiveGraph({ data, color, label, max }: LiveGraphProps) {
    const chartData = data.map((value, index) => ({
        index,
        value
    }))

    return (
        <div className="h-[120px] w-full bg-black/20 border border-white/5 rounded-sm p-2 relative">
            <div className="absolute top-2 left-2 text-[10px] uppercase tracking-widest text-zinc-500 font-mono z-10">
                {label}
            </div>
            <div className="absolute top-2 right-2 text-xs font-mono font-bold" style={{ color }}>
                {data[data.length - 1]?.toFixed(1)}
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="index" hide />
                    <YAxis domain={[0, max]} hide />
                    <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={color} 
                        strokeWidth={2} 
                        dot={false}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}


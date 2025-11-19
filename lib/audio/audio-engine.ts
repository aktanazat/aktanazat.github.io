// lib/audio/audio-engine.ts
import { useRef, useEffect, useCallback } from 'react'

export function useAudioEngine(
    flux: number, 
    turbineSpeed: number, 
    alarmsActive: boolean,
    isMuted: boolean = false
) {
    const audioCtx = useRef<AudioContext | null>(null)
    const turbineOsc = useRef<OscillatorNode | null>(null)
    const turbineGain = useRef<GainNode | null>(null)
    const geigerNextClick = useRef<number>(0)
    const alarmOsc = useRef<OscillatorNode | null>(null)
    const alarmGain = useRef<GainNode | null>(null)
    const alarmInterval = useRef<NodeJS.Timeout | null>(null)

    // Initialize Audio Context
    useEffect(() => {
        if (typeof window !== 'undefined' && !audioCtx.current) {
            const Ctx = window.AudioContext || (window as any).webkitAudioContext
            audioCtx.current = new Ctx()
        }
        return () => {
            audioCtx.current?.close()
        }
    }, [])

    // Turbine Whine (Continuous)
    useEffect(() => {
        if (!audioCtx.current || isMuted) {
            turbineOsc.current?.stop()
            turbineOsc.current = null
            return
        }

        if (turbineSpeed > 100 && !turbineOsc.current) {
            const ctx = audioCtx.current
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            
            osc.type = 'sawtooth'
            // Map 0-1800 RPM to 50-200 Hz (Low hum)
            osc.frequency.value = 50 + (turbineSpeed / 1800) * 150
            
            // Low pass filter to muffle it
            const filter = ctx.createBiquadFilter()
            filter.type = 'lowpass'
            filter.frequency.value = 200

            gain.gain.value = 0.05 // Quiet background hum

            osc.connect(filter)
            filter.connect(gain)
            gain.connect(ctx.destination)
            
            osc.start()
            turbineOsc.current = osc
            turbineGain.current = gain
        } else if (turbineOsc.current && turbineGain.current) {
            // Update pitch
            turbineOsc.current.frequency.setTargetAtTime(
                50 + (turbineSpeed / 1800) * 150, 
                audioCtx.current.currentTime, 
                0.1
            )
            // Update volume based on speed
            turbineGain.current.gain.setTargetAtTime(
                turbineSpeed > 100 ? 0.05 : 0,
                audioCtx.current.currentTime,
                0.5
            )
        }
    }, [turbineSpeed, isMuted])

    // Geiger Counter (Random Clicks)
    useEffect(() => {
        if (!audioCtx.current || isMuted) return

        const ctx = audioCtx.current
        let isRunning = true

        const scheduleClick = () => {
            if (!isRunning) return

            // Flux 0-120%. 
            // At 0%: 1 click every 2s (background)
            // At 100%: 1 click every 50ms
            const rate = Math.max(0.05, 2 - (flux / 120) * 1.95)
            const nextTime = Math.random() * rate * 1000

            // Play Click
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'square'
            osc.frequency.value = 1000 + Math.random() * 500
            gain.gain.value = 0.05
            
            osc.connect(gain)
            gain.connect(ctx.destination)
            
            osc.start()
            osc.stop(ctx.currentTime + 0.005) // Tiny blip

            setTimeout(scheduleClick, nextTime)
        }

        scheduleClick()

        return () => { isRunning = false }
    }, [flux, isMuted])

    // Alarm Klaxon
    useEffect(() => {
        if (!audioCtx.current || isMuted) {
            if (alarmInterval.current) clearInterval(alarmInterval.current)
            return
        }

        if (alarmsActive) {
            const ctx = audioCtx.current
            
            const playAlarmTone = () => {
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                
                osc.type = 'square'
                osc.frequency.setValueAtTime(800, ctx.currentTime)
                osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.4)
                
                gain.gain.setValueAtTime(0.1, ctx.currentTime)
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4)

                osc.connect(gain)
                gain.connect(ctx.destination)
                
                osc.start()
                osc.stop(ctx.currentTime + 0.4)
            }

            alarmInterval.current = setInterval(playAlarmTone, 1000)
        } else {
            if (alarmInterval.current) clearInterval(alarmInterval.current)
        }

        return () => {
            if (alarmInterval.current) clearInterval(alarmInterval.current)
        }
    }, [alarmsActive, isMuted])

    // One-off Sound Triggers
    const playRodSound = useCallback(() => {
        if (!audioCtx.current || isMuted) return
        const ctx = audioCtx.current
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(100, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1)
        
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1)
        
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.1)
    }, [isMuted])

    const playSwitchSound = useCallback(() => {
        if (!audioCtx.current || isMuted) return
        const ctx = audioCtx.current
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        
        osc.type = 'square'
        osc.frequency.value = 2000
        gain.gain.value = 0.05
        
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.01)
    }, [isMuted])

    return {
        playRodSound,
        playSwitchSound
    }
}


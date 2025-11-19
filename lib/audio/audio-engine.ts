import { useState, useEffect, useRef } from 'react'

export function useAudioEngine(flux: number, turbineSpeed: number, isAlarming: boolean, isMuted: boolean) {
    const audioContextRef = useRef<AudioContext | null>(null)
    const geigerOscRef = useRef<OscillatorNode | null>(null)
    const turbineOscRef = useRef<OscillatorNode | null>(null)
    const alarmOscRef = useRef<OscillatorNode | null>(null)
    const gainNodeRef = useRef<GainNode | null>(null)

    // Initialize Audio Context
    useEffect(() => {
        if (typeof window !== 'undefined' && !audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
            gainNodeRef.current = audioContextRef.current.createGain()
            gainNodeRef.current.connect(audioContextRef.current.destination)
        }

        return () => {
            // Cleanup on unmount
            if (audioContextRef.current) {
                audioContextRef.current.close()
                audioContextRef.current = null
            }
        }
    }, [])

    // Master Mute
    useEffect(() => {
        if (gainNodeRef.current && audioContextRef.current) {
            gainNodeRef.current.gain.setTargetAtTime(isMuted ? 0 : 0.5, audioContextRef.current.currentTime, 0.1)
        }
    }, [isMuted])

    // Turbine Hum (Low frequency drone)
    useEffect(() => {
        if (!audioContextRef.current || isMuted) return

        if (turbineSpeed > 100 && !turbineOscRef.current) {
            const osc = audioContextRef.current.createOscillator()
            const gain = audioContextRef.current.createGain()
            
            osc.type = 'sawtooth'
            osc.frequency.value = 50 // Base rumble
            
            gain.gain.value = 0.05
            
            osc.connect(gain)
            gain.connect(gainNodeRef.current!)
            osc.start()
            turbineOscRef.current = osc
        } else if (turbineSpeed <= 100 && turbineOscRef.current) {
            turbineOscRef.current.stop()
            turbineOscRef.current = null
        }

        if (turbineOscRef.current) {
            // Pitch shift with RPM
            turbineOscRef.current.frequency.setTargetAtTime(50 + (turbineSpeed / 1800) * 100, audioContextRef.current.currentTime, 0.5)
        }

        return () => {
            if (turbineOscRef.current) {
                turbineOscRef.current.stop()
                turbineOscRef.current = null
            }
        }
    }, [turbineSpeed, isMuted])

    // Geiger Counter (Random clicks based on flux)
    useEffect(() => {
        if (!audioContextRef.current || isMuted || flux <= 0) return

        // Probability of click increases with flux
        const clickInterval = Math.max(10, 1000 / (flux * 5 + 1))
        
        const interval = setInterval(() => {
            if (Math.random() > 0.3 && audioContextRef.current) { // Randomness
                const osc = audioContextRef.current.createOscillator()
                const gain = audioContextRef.current.createGain()
                
                osc.type = 'square'
                osc.frequency.value = 800 + Math.random() * 200
                
                gain.gain.value = 0.02
                gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.05)
                
                osc.connect(gain)
                gain.connect(gainNodeRef.current!)
                
                osc.start()
                osc.stop(audioContextRef.current.currentTime + 0.05)
            }
        }, clickInterval)

        return () => clearInterval(interval)
    }, [flux, isMuted])

    // Alarm Klaxon
    useEffect(() => {
        if (!audioContextRef.current || isMuted) return

        if (isAlarming && !alarmOscRef.current) {
            const osc = audioContextRef.current.createOscillator()
            const gain = audioContextRef.current.createGain()
            
            osc.type = 'square'
            osc.frequency.value = 600
            
            // Modulate volume for "whoop" effect
            const lfo = audioContextRef.current.createOscillator()
            lfo.type = 'sine'
            lfo.frequency.value = 2 // 2Hz pulse
            const lfoGain = audioContextRef.current.createGain()
            lfoGain.gain.value = 500
            lfo.connect(lfoGain)
            lfoGain.connect(osc.frequency)
            lfo.start()

            gain.gain.value = 0.1
            
            osc.connect(gain)
            gain.connect(gainNodeRef.current!)
            osc.start()
            alarmOscRef.current = osc
        } else if (!isAlarming && alarmOscRef.current) {
            alarmOscRef.current.stop()
            alarmOscRef.current = null
        }

        return () => {
            if (alarmOscRef.current) {
                alarmOscRef.current.stop()
                alarmOscRef.current = null
            }
        }
    }, [isAlarming, isMuted])

    // SFX Triggers
    const playSwitchSound = () => {
        if (!audioContextRef.current || isMuted) return
        const osc = audioContextRef.current.createOscillator()
        const gain = audioContextRef.current.createGain()
        osc.frequency.value = 2000
        gain.gain.value = 0.05
        gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.1)
        osc.connect(gain)
        gain.connect(gainNodeRef.current!)
        osc.start()
        osc.stop(audioContextRef.current.currentTime + 0.1)
    }

    const playRodSound = () => {
        if (!audioContextRef.current || isMuted) return
        const osc = audioContextRef.current.createOscillator()
        const gain = audioContextRef.current.createGain()
        osc.type = 'triangle'
        osc.frequency.value = 100
        gain.gain.value = 0.05
        gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.2)
        osc.connect(gain)
        gain.connect(gainNodeRef.current!)
        osc.start()
        osc.stop(audioContextRef.current.currentTime + 0.2)
    }

    return {
        playSwitchSound,
        playRodSound
    }
}

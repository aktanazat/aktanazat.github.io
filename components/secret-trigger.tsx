"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function SecretTrigger() {
  const router = useRouter()
  const [keys, setKeys] = useState<string[]>([])
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys((prev) => {
        const newKeys = [...prev, e.key].slice(-4) // Keep last 4
        if (newKeys.join("").toLowerCase() === "game") {
          router.push("/control-room")
        }
        return newKeys
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router])

  return null
}


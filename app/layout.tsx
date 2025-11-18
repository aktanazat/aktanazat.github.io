import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Share_Tech_Mono, Courier_Prime } from "next/font/google"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const techMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-tech-mono",
  display: "swap",
})

const courierPrime = Courier_Prime({
    weight: ["400", "700"],
    subsets: ["latin"],
    variable: "--font-courier-prime",
    display: "swap",
})

export const metadata: Metadata = {
  title: "Aktan Azat",
  description: "My website",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${techMono.variable} ${courierPrime.variable} antialiased`}>{children}</body>
    </html>
  )
}

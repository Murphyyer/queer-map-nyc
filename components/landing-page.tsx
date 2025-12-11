"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface LandingPageProps {
  onWindowClick: (position: { x: number; y: number }) => void
}

interface WindowData {
  id: number
  x: number
  y: number
  width: number
  height: number
  baseOpacity: number
  flickerDelay: number
  venueName?: string
}

const ZONES = [
  { name: "Greenwich Village", x: 45, y: 55, radius: 8, scale: 18 },
  { name: "Chelsea", x: 42, y: 42, radius: 7, scale: 16 },
  { name: "East Village", x: 55, y: 52, radius: 7, scale: 16 },
  { name: "Hell's Kitchen", x: 40, y: 35, radius: 6, scale: 15 },
  { name: "Harlem", x: 50, y: 18, radius: 8, scale: 16 },
  { name: "Lower East Side", x: 58, y: 65, radius: 7, scale: 16 },
  { name: "Midtown", x: 50, y: 38, radius: 6, scale: 14 },
  { name: "Financial District", x: 55, y: 88, radius: 6, scale: 18 },
]

function getZoneAtPoint(x: number, y: number): (typeof ZONES)[0] | null {
  for (const zone of ZONES) {
    const distance = Math.sqrt(Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2))
    if (distance <= zone.radius) {
      return zone
    }
  }
  return null
}

function isWindowInZone(windowX: number, windowY: number, zone: (typeof ZONES)[0]): boolean {
  const distance = Math.sqrt(Math.pow(windowX - zone.x, 2) + Math.pow(windowY - zone.y, 2))
  return distance <= zone.radius
}

function getNearestZone(x: number, y: number): (typeof ZONES)[0] {
  let nearest = ZONES[0]
  let minDistance = Number.POSITIVE_INFINITY

  for (const zone of ZONES) {
    const distance = Math.sqrt(Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2))
    if (distance < minDistance) {
      minDistance = distance
      nearest = zone
    }
  }

  return nearest
}

const venueLocations = [
  { x: 45, y: 55, name: "Stonewall Inn" },
  { x: 42, y: 52, name: "Julius' Bar" },
  { x: 48, y: 48, name: "Oscar Wilde Bookshop" },
  { x: 40, y: 60, name: "Caffe Cino" },
  { x: 55, y: 45, name: "Lesbian Herstory Archives" },
  { x: 47, y: 58, name: "Cherry Lane Theatre" },
  { x: 43, y: 50, name: "Cubby Hole" },
  { x: 50, y: 65, name: "The Monster" },
  { x: 46, y: 62, name: "Henrietta Hudson" },
  { x: 52, y: 53, name: "The Duplex" },
]

function isInsideManhattan(x: number, y: number): boolean {
  const manhattanPath = [
    { x: 45, y: 5 },
    { x: 52, y: 8 },
    { x: 55, y: 15 },
    { x: 58, y: 25 },
    { x: 60, y: 35 },
    { x: 62, y: 45 },
    { x: 63, y: 55 },
    { x: 65, y: 65 },
    { x: 68, y: 75 },
    { x: 70, y: 85 },
    { x: 65, y: 92 },
    { x: 55, y: 95 },
    { x: 45, y: 92 },
    { x: 38, y: 85 },
    { x: 35, y: 75 },
    { x: 33, y: 65 },
    { x: 35, y: 55 },
    { x: 37, y: 45 },
    { x: 38, y: 35 },
    { x: 40, y: 25 },
    { x: 42, y: 15 },
    { x: 43, y: 8 },
  ]

  let inside = false
  for (let i = 0, j = manhattanPath.length - 1; i < manhattanPath.length; j = i++) {
    const xi = manhattanPath[i].x,
      yi = manhattanPath[i].y
    const xj = manhattanPath[j].x,
      yj = manhattanPath[j].y

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

function getNearestVenue(x: number, y: number): string | undefined {
  for (const venue of venueLocations) {
    const distance = Math.sqrt(Math.pow(x - venue.x, 2) + Math.pow(y - venue.y, 2))
    if (distance < 3) {
      return venue.name
    }
  }
  return undefined
}

export function LandingPage({ onWindowClick }: LandingPageProps) {
  const [hoveredWindow, setHoveredWindow] = useState<WindowData | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [zoomingTarget, setZoomingTarget] = useState<{ x: number; y: number; scale: number } | null>(null)
  const [hoveredZone, setHoveredZone] = useState<(typeof ZONES)[0] | null>(null)

  const windows = useMemo(() => {
    const windowList: WindowData[] = []
    const gridSize = 3

    for (let y = 0; y < 100; y += gridSize) {
      for (let x = 0; x < 100; x += gridSize) {
        const px = x + Math.random() * 1.5
        const py = y + Math.random() * 1.5

        if (isInsideManhattan(px, py)) {
          windowList.push({
            id: windowList.length,
            x: px,
            y: py,
            width: 1.2 + Math.random() * 0.6,
            height: 1.8 + Math.random() * 1,
            baseOpacity: 0.06 + Math.random() * 0.2,
            flickerDelay: Math.random() * 4,
            venueName: getNearestVenue(px, py),
          })
        }
      }
    }
    return windowList
  }, [])

  const getWindowBrightness = (windowX: number, windowY: number) => {
    if (hoveredZone && isWindowInZone(windowX, windowY, hoveredZone)) {
      return 2.5
    }

    const distance = Math.sqrt(Math.pow(windowX - mousePos.x, 2) + Math.pow(windowY - mousePos.y, 2))
    const maxDistance = 12

    if (distance < maxDistance) {
      return 1 + (1 - distance / maxDistance) * 2.5
    }
    return 1
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePos({ x, y })

    const zone = getZoneAtPoint(x, y)
    setHoveredZone(zone)
  }

  const handleWindowClick = (windowX: number, windowY: number) => {
    if (zoomingTarget) return

    const clickedZone = getZoneAtPoint(windowX, windowY)

    if (clickedZone) {
      setZoomingTarget({
        x: clickedZone.x,
        y: clickedZone.y,
        scale: clickedZone.scale,
      })
    } else {
      const nearestZone = getNearestZone(windowX, windowY)
      setZoomingTarget({
        x: nearestZone.x,
        y: nearestZone.y,
        scale: nearestZone.scale,
      })
    }
  }

  const handleZoomComplete = () => {
    if (zoomingTarget) {
      onWindowClick({ x: zoomingTarget.x, y: zoomingTarget.y })
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredZone(null)}
        animate={{
          scale: zoomingTarget ? zoomingTarget.scale : 1,
          opacity: zoomingTarget ? 0 : 1,
        }}
        transition={{
          duration: 1.5,
          ease: [0.4, 0, 0.2, 1],
          opacity: { duration: 1.5, delay: 0.8 },
        }}
        style={{
          transformOrigin: zoomingTarget ? `${zoomingTarget.x}% ${zoomingTarget.y}%` : "center center",
        }}
        onAnimationComplete={handleZoomComplete}
      >
        <div className="relative w-full h-full max-w-[600px] max-h-[900px]">
          {windows.map((window) => {
            const brightness = getWindowBrightness(window.x, window.y)
            const opacity = window.baseOpacity * brightness
            const isLit = brightness > 1.5
            const isInHoveredZone = hoveredZone && isWindowInZone(window.x, window.y, hoveredZone)

            return (
              <motion.div
                key={window.id}
                className="absolute cursor-pointer window-flicker"
                style={
                  {
                    left: `${window.x}%`,
                    top: `${window.y}%`,
                    width: `${window.width}%`,
                    height: `${window.height}%`,
                    "--base-opacity": Math.min(opacity, 0.95),
                    "--flicker-delay": `${window.flickerDelay}s`,
                    backgroundColor:
                      brightness > 1.8
                        ? "oklch(0.85 0.18 86)"
                        : brightness > 1.3
                          ? "oklch(0.75 0.15 86 / 0.8)"
                          : "oklch(0.5 0.08 86 / 0.4)",
                    boxShadow: isLit ? "0 0 8px 2px oklch(0.795 0.184 86.047 / 0.5)" : "none",
                  } as React.CSSProperties
                }
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  scale: isInHoveredZone ? 1.15 : 1,
                }}
                transition={{ delay: window.id * 0.001, duration: 0.3 }}
                onMouseEnter={() => window.venueName && setHoveredWindow(window)}
                onMouseLeave={() => setHoveredWindow(null)}
                onClick={() => handleWindowClick(window.x, window.y)}
                whileHover={{ scale: 1.3 }}
              />
            )
          })}
        </div>
      </motion.div>

      <AnimatePresence>
        {hoveredZone && !zoomingTarget && (
          <motion.div
            className="fixed z-50 pointer-events-none"
            style={{
              left: `calc(50% + ${(hoveredZone.x - 50) * 3}px + 80px)`,
              top: `calc(50% + ${(hoveredZone.y - 50) * 4}px)`,
              transform: "translateY(-50%)",
            }}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-5 py-3 bg-black/95 border border-primary/60 backdrop-blur-sm">
              <span className="text-primary font-serif text-xl tracking-wide">{hoveredZone.name}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hoveredWindow?.venueName && !zoomingTarget && !hoveredZone && (
          <motion.div
            className="fixed z-50 px-4 py-2 bg-black/90 border border-primary/50 text-primary font-serif text-lg pointer-events-none"
            style={{
              left: `calc(${hoveredWindow.x}% + 50px)`,
              top: `${hoveredWindow.y}%`,
              transform: "translateY(-50%)",
            }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {hoveredWindow.venueName}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!zoomingTarget && (
          <motion.div
            className="absolute top-12 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-5xl md:text-6xl text-foreground font-serif tracking-tight">Queerly Map NYC</h1>
            <p className="mt-4 text-muted-foreground text-lg tracking-wide">1920 — 2020</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!zoomingTarget && (
          <motion.p
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground text-sm tracking-widest uppercase z-10 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            Click a window to enter
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

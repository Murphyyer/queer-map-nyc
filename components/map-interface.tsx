"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TimelineSlider } from "./timeline-slider"
import { VenueModal } from "./venue-modal"

interface MapInterfaceProps {
  currentYear: number
  onYearChange: (year: number) => void
}

export interface Venue {
  id: string
  name: string
  description: string
  startYear: number
  endYear: number | null // null means still active
  x: number // percentage position
  y: number // percentage position
  type: "bar" | "club" | "bookstore" | "community" | "activism"
}

// Mock venue data
const venues: Venue[] = [
  {
    id: "stonewall",
    name: "Stonewall Inn",
    description:
      "The birthplace of the modern LGBTQ+ rights movement. The Stonewall Riots of 1969 sparked a revolution that continues to this day.",
    startYear: 1967,
    endYear: null,
    x: 45,
    y: 55,
    type: "bar",
  },
  {
    id: "julius",
    name: "Julius' Bar",
    description:
      "One of the oldest gay bars in NYC, site of the 1966 'Sip-In' protest against laws prohibiting serving alcohol to homosexuals.",
    startYear: 1864,
    endYear: null,
    x: 42,
    y: 52,
    type: "bar",
  },
  {
    id: "oscar-wilde",
    name: "Oscar Wilde Bookshop",
    description:
      "The world's first gay and lesbian bookstore, opened in 1967. A vital cultural hub for the community for over 40 years.",
    startYear: 1967,
    endYear: 2009,
    x: 48,
    y: 48,
    type: "bookstore",
  },
  {
    id: "cafe-cino",
    name: "Caffe Cino",
    description:
      "The birthplace of Off-Off-Broadway theater, known for presenting groundbreaking queer works in the 1960s.",
    startYear: 1958,
    endYear: 1968,
    x: 40,
    y: 60,
    type: "community",
  },
  {
    id: "lesbian-herstory",
    name: "Lesbian Herstory Archives",
    description:
      "Founded in 1974, the world's largest collection of materials by and about lesbians and their communities.",
    startYear: 1974,
    endYear: null,
    x: 55,
    y: 45,
    type: "community",
  },
]

function generateBackgroundWindows(count: number) {
  const windows = []
  for (let i = 0; i < count; i++) {
    // Cluster windows in center area (20-80% of container)
    const x = 20 + Math.random() * 60
    const y = 15 + Math.random() * 70
    windows.push({
      id: i,
      x,
      y,
      width: 3 + Math.random() * 3, // bigger widths (was 2-4, now 3-6)
      height: 6 + Math.random() * 6, // taller rectangles (was 4-8, now 6-12)
      opacity: 0.03 + Math.random() * 0.12,
      flickerDelay: 0, // No delay
      flickerDuration: 3 + Math.random() * 4,
      hasAmbient: Math.random() > 0.7,
    })
  }
  return windows
}

export function MapInterface({ currentYear, onYearChange }: MapInterfaceProps) {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)

  const backgroundWindows = useMemo(() => generateBackgroundWindows(80), [])

  const getVenueState = (venue: Venue): "active" | "ghost" | "hidden" => {
    if (currentYear < venue.startYear) return "hidden"
    if (venue.endYear && currentYear > venue.endYear) return "ghost"
    return "active"
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative min-h-screen flex bg-black overflow-hidden"
    >
      {/* Timeline sidebar */}
      <div className="fixed left-0 top-0 h-full w-32 bg-zinc-950/80 backdrop-blur-sm border-r border-zinc-800 z-10">
        <TimelineSlider currentYear={currentYear} onYearChange={onYearChange} />
      </div>

      {/* Map area */}
      <div className="flex-1 ml-32 relative flex items-center justify-center">
        <div className="relative w-[70vw] h-[80vh] max-w-[800px] max-h-[700px]">
          {/* Background Windows Layer - dim building windows, render immediately */}
          <div className="absolute inset-0">
            {backgroundWindows.map((win) => (
              <motion.div
                key={win.id}
                className="absolute"
                style={{
                  left: `${win.x}%`,
                  top: `${win.y}%`,
                  width: `${win.width}%`,
                  height: `${win.height}%`,
                }}
                initial={{ opacity: win.opacity }}
                animate={{
                  opacity: [win.opacity, win.opacity * 1.5, win.opacity * 0.7, win.opacity],
                }}
                transition={{
                  duration: win.flickerDuration,
                  delay: 0, // No delay
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <div
                  className="w-full h-full"
                  style={{
                    backgroundColor: win.hasAmbient ? "oklch(0.4 0.08 80)" : "oklch(0.2 0 0)",
                    boxShadow: win.hasAmbient
                      ? "inset 0 1px 2px oklch(0.5 0.1 80 / 0.3), 0 0 4px oklch(0.4 0.08 80 / 0.2)"
                      : "inset 0 1px 2px oklch(0 0 0 / 0.5)",
                    border: "1px solid oklch(0.15 0 0)",
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* Interactive Venue Windows Layer - on top */}
          <div className="absolute inset-0 z-10">
            {venues.map((venue) => {
              const state = getVenueState(venue)
              if (state === "hidden") return null

              const isActive = state === "active"
              const isGhost = state === "ghost"
              const glowColor =
                venue.type === "bar" || venue.type === "club"
                  ? "oklch(0.718 0.202 349.761)"
                  : "oklch(0.795 0.184 86.047)"

              return (
                <motion.button
                  key={venue.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${venue.x}%`,
                    top: `${venue.y}%`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: isGhost ? 0.3 : 1,
                  }}
                  whileHover={isActive ? { scale: 1.15 } : {}}
                  onClick={() => isActive && setSelectedVenue(venue)}
                >
                  <motion.div
                    className="w-5 h-8 cursor-pointer relative"
                    animate={{
                      backgroundColor: isGhost ? "oklch(0.12 0 0)" : glowColor,
                      boxShadow: isActive
                        ? `0 0 20px 8px ${glowColor}, 0 0 40px 16px ${glowColor}40, inset 0 0 8px oklch(1 0 0 / 0.4)`
                        : "inset 0 2px 4px oklch(0 0 0 / 0.9)",
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    style={{
                      border: isGhost ? "1px solid oklch(0.25 0 0)" : `1px solid oklch(0 0 0 / 0.6)`,
                    }}
                  >
                    {/* Inner window frame - inset effect */}
                    <div
                      className="absolute inset-1"
                      style={{
                        border: isActive ? "1px solid oklch(1 0 0 / 0.2)" : "1px solid oklch(0.18 0 0)",
                        boxShadow: isActive
                          ? "inset 0 0 6px oklch(1 0 0 / 0.15)"
                          : "inset 0 1px 3px oklch(0 0 0 / 0.7)",
                        pointerEvents: "none",
                      }}
                    />
                  </motion.div>
                </motion.button>
              )
            })}
          </div>

          {/* Neighborhood label */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-zinc-600 font-serif text-sm tracking-widest uppercase z-20">
            Greenwich Village
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-3 text-sm text-zinc-400 z-20">
          <div className="flex items-center gap-3">
            <span
              className="w-5 h-8 relative"
              style={{
                backgroundColor: "oklch(0.718 0.202 349.761)",
                boxShadow: "0 0 16px 6px oklch(0.718 0.202 349.761), inset 0 0 8px oklch(1 0 0 / 0.4)",
                border: "1px solid oklch(0 0 0 / 0.6)",
              }}
            >
              <span
                className="absolute inset-1 border border-white/20"
                style={{ boxShadow: "inset 0 0 6px oklch(1 0 0 / 0.15)" }}
              />
            </span>
            <span>Bars & Clubs</span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="w-5 h-8 relative"
              style={{
                backgroundColor: "oklch(0.795 0.184 86.047)",
                boxShadow: "0 0 16px 6px oklch(0.795 0.184 86.047), inset 0 0 8px oklch(1 0 0 / 0.4)",
                border: "1px solid oklch(0 0 0 / 0.6)",
              }}
            >
              <span
                className="absolute inset-1 border border-white/20"
                style={{ boxShadow: "inset 0 0 6px oklch(1 0 0 / 0.15)" }}
              />
            </span>
            <span>Community Spaces</span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="w-5 h-8 relative opacity-30"
              style={{
                backgroundColor: "oklch(0.12 0 0)",
                border: "1px solid oklch(0.25 0 0)",
                boxShadow: "inset 0 2px 4px oklch(0 0 0 / 0.9)",
              }}
            >
              <span
                className="absolute inset-1 border border-zinc-800"
                style={{ boxShadow: "inset 0 1px 3px oklch(0 0 0 / 0.7)" }}
              />
            </span>
            <span className="text-zinc-600">Closed / Lost</span>
          </div>
        </div>
      </div>

      {/* Venue modal */}
      <AnimatePresence>
        {selectedVenue && <VenueModal venue={selectedVenue} onClose={() => setSelectedVenue(null)} />}
      </AnimatePresence>
    </motion.div>
  )
}

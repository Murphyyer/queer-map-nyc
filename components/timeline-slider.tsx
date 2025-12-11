"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TimelineSliderProps {
  currentYear: number
  onYearChange: (year: number) => void
}

const decades = [
  { year: 1920, label: "1920s" },
  { year: 1940, label: "1940s" },
  { year: 1960, label: "1960s" },
  { year: 1980, label: "1980s" },
  { year: 2000, label: "2000s" },
  { year: 2020, label: "2020" },
]

export function TimelineSlider({ currentYear, onYearChange }: TimelineSliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [showYear, setShowYear] = useState(false)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const minYear = 1920
  const maxYear = 2020
  const percentage = ((currentYear - minYear) / (maxYear - minYear)) * 100

  const calculateYearFromPosition = useCallback(
    (clientY: number) => {
      if (!trackRef.current) return currentYear
      const rect = trackRef.current.getBoundingClientRect()
      const pct = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
      return Math.round(minYear + pct * (maxYear - minYear))
    },
    [currentYear, minYear, maxYear],
  )

  const handleDragStart = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
    setIsDragging(true)
    setShowYear(true)
  }, [])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    hideTimeoutRef.current = setTimeout(() => setShowYear(false), 800)
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onYearChange(Number.parseInt(e.target.value))
      if (!showYear) setShowYear(true)
    },
    [onYearChange, showYear],
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      handleDragStart()
      const year = calculateYearFromPosition(e.clientY)
      onYearChange(year)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [handleDragStart, calculateYearFromPosition, onYearChange],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return
      const year = calculateYearFromPosition(e.clientY)
      onYearChange(year)
    },
    [isDragging, calculateYearFromPosition, onYearChange],
  )

  const handlePointerUp = useCallback(() => {
    handleDragEnd()
  }, [handleDragEnd])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 1 : -1
      const newYear = Math.max(minYear, Math.min(maxYear, currentYear + delta))
      onYearChange(newYear)
      if (!showYear) setShowYear(true)
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = setTimeout(() => setShowYear(false), 800)
    },
    [currentYear, minYear, maxYear, onYearChange, showYear],
  )

  const trackHeight = 400
  const lineCount = Math.floor(trackHeight / 10)

  return (
    <>
      <AnimatePresence>
        {showYear && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.span
              className="font-serif text-[10rem] md:text-[14rem] lg:text-[18rem] text-primary/20 select-none tracking-tight"
              key={currentYear}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: isDragging ? 1 : 0.5, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {currentYear}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-full flex flex-col items-center py-6">
        <div className="mb-4">
          <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">Year</span>
        </div>

        <div
          ref={trackRef}
          className="flex-1 relative flex items-center justify-center w-full cursor-ns-resize touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
        >
          <div className="absolute h-full w-px bg-zinc-700 left-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="absolute h-full w-full left-0 flex flex-col justify-between pointer-events-none">
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i} className="w-full flex justify-center">
                <div className={`h-px ${i % 5 === 0 ? "w-6 bg-zinc-600" : "w-3 bg-zinc-800"}`} />
              </div>
            ))}
          </div>

          <div className="absolute h-full flex flex-col justify-between left-1/2 pointer-events-none">
            {decades.map((decade) => (
              <div key={decade.year} className="relative flex items-center">
                <span className="absolute left-3 text-[10px] text-zinc-500 whitespace-nowrap font-mono">
                  {decade.label}
                </span>
              </div>
            ))}
          </div>

          <motion.div
            className="absolute left-1/2 -translate-x-1/2 w-16 h-2 rounded-sm pointer-events-none"
            style={{
              top: `${percentage}%`,
              translateY: "-50%",
              backgroundColor: "oklch(0.795 0.184 86.047)",
            }}
            animate={{
              boxShadow: isDragging
                ? "0 0 20px 6px oklch(0.795 0.184 86.047 / 0.8), 0 0 40px 12px oklch(0.795 0.184 86.047 / 0.4)"
                : "0 0 10px 2px oklch(0.795 0.184 86.047 / 0.6), 0 0 20px 4px oklch(0.795 0.184 86.047 / 0.2)",
            }}
            transition={{ duration: 0.2 }}
          />
        </div>

        <div className="mt-3 text-center">
          <span className="text-xs text-zinc-400 font-mono">{currentYear}</span>
        </div>
      </div>
    </>
  )
}

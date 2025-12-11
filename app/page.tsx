"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LandingPage } from "@/components/landing-page"
import { MapInterface } from "@/components/map-interface"

// 1. CONFIGURATION
// This is the visual center of Greenwich Village on your Manhattan map.
// We force the camera to zoom HERE, regardless of which specific window was clicked.
// Adjust these slightly if the zoom feels off-center.
const GREENWICH_CENTER = { x: 45, y: 55 }

export type ViewState = "LANDING" | "MAP"

export default function Home() {
  const [view, setView] = useState<ViewState>("LANDING")
  const [isZooming, setIsZooming] = useState(false)
  const [currentYear, setCurrentYear] = useState(1969)

  // 2. THE HANDLER
  // We ignore the specific x/y passed by the child because we want to 
  // guide the user to the Neighborhood View, not a specific window yet.
  const handleWindowClick = () => {
    if (isZooming) return
    setIsZooming(true)
    
    // We do NOT setView("MAP") here immediately. 
    // We wait for the animation to finish in the onAnimationComplete prop below.
  }

  return (
    <main className="relative min-h-screen bg-black overflow-hidden">
      
      {/* LAYER 1: The Landing Page (Background) */}
      {/* This layer NEVER unmounts. It transforms from a map into a background texture. */}
      <motion.div
        className="absolute inset-0 z-0 origin-center"
        initial={{ scale: 1, opacity: 1 }}
        animate={
          isZooming || view === "MAP"
            ? {
                // MATH: This calculates exactly how to shift the div so Greenwich 
                // ends up in the center of the screen while scaling up.
                scale: 15, 
                x: `${(50 - GREENWICH_CENTER.x) * 15}%`, 
                y: `${(50 - GREENWICH_CENTER.y) * 15}%`,
                opacity: 0.4, // Fade out slightly so the MapInterface pops more
              }
            : { scale: 1, x: 0, y: 0, opacity: 1 }
        }
        transition={{ 
          duration: 1.8, 
          ease: [0.42, 0, 0.58, 1] // Cinematic "Slow Start, Slow End" ease
        }} 
        onAnimationComplete={() => {
          if (isZooming) setView("MAP")
        }}
      >
        <LandingPage onWindowClick={handleWindowClick} />
      </motion.div>


      {/* LAYER 2: The Map Interface (Foreground) */}
      {/* This fades in smoothly ON TOP of the zoomed-in texture. */}
      <AnimatePresence>
        {(view === "MAP" || isZooming) && (
          <motion.div
            className="absolute inset-0 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }} // Wait until zoom is halfway done
          >
            {/* We render the map even during the zoom so it's ready */}
            <MapInterface 
              currentYear={currentYear} 
              onYearChange={setCurrentYear} 
            />
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  )
}

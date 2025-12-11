"use client"

import { motion } from "framer-motion"
import { X } from "lucide-react"
import type { Venue } from "./map-interface"

interface VenueModalProps {
  venue: Venue
  onClose: () => void
}

export function VenueModal({ venue, onClose }: VenueModalProps) {
  const typeLabels = {
    bar: "Bar",
    club: "Club",
    bookstore: "Bookstore",
    community: "Community Space",
    activism: "Activism",
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-2xl">
          {/* Header image placeholder */}
          <div className="relative h-48 bg-secondary">
            <img
              src={`/.jpg?height=192&width=512&query=${encodeURIComponent(venue.name + " historical photo NYC")}`}
              alt={venue.name}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-background/50 backdrop-blur-sm text-foreground hover:bg-background/80 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Type badge */}
            <span className="inline-block px-2 py-1 text-xs uppercase tracking-wider text-primary bg-primary/10 rounded mb-3">
              {typeLabels[venue.type]}
            </span>

            {/* Title */}
            <h2 className="font-serif text-2xl text-foreground mb-2">{venue.name}</h2>

            {/* Years */}
            <p className="text-sm text-muted-foreground mb-4">
              {venue.startYear} — {venue.endYear ?? "Present"}
            </p>

            {/* Description */}
            <p className="text-foreground/80 leading-relaxed">{venue.description}</p>
          </div>
        </div>
      </motion.div>
    </>
  )
}

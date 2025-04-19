"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Play, Pause, SkipBack, SkipForward } from "lucide-react"
import type { Alert } from "./alert-card"

interface IncidentModalProps {
  alert: Alert | null
  onClose: () => void
}

export default function IncidentModal({ alert, onClose }: IncidentModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  if (!alert) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-card border border-border rounded-lg w-full max-w-3xl overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-semibold">{alert.title}</h2>
            <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors" aria-label="Close">
              <X size={20} />
            </button>
          </div>

          <div className="p-4">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden relative mb-4">
              {/* Placeholder for video feed */}
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground">Video feed placeholder</p>
              </div>

              {/* Timestamp overlay */}
              <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                {alert.timestamp.toLocaleTimeString()}
              </div>

              {/* Location overlay */}
              <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                {alert.location} ({alert.locationType} hostel)
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4 mb-4">
              <button className="p-2 rounded-full hover:bg-muted transition-colors">
                <SkipBack size={20} />
              </button>
              <button
                className="p-3 rounded-full bg-alert-critical/20 hover:bg-alert-critical/30 transition-colors"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button className="p-2 rounded-full hover:bg-muted transition-colors">
                <SkipForward size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Description</h3>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">AI Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  The system detected unusual movement patterns consistent with unauthorized access attempts. Confidence
                  level: 87%. Recommended action: Security staff verification.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

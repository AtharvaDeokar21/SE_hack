"use client"

import { motion } from "framer-motion"
import { User } from "lucide-react"

export type GuardStatus = "on-post" | "away" | "inactive"

export interface Guard {
  id: string
  name: string
  status: GuardStatus
  location: string
  lastActive: Date
  image?: string
}

interface GuardCardProps {
  guard: Guard
}

export default function GuardCard({ guard }: GuardCardProps) {
  const statusMap = {
    "on-post": {
      label: "On Post",
      color: "bg-alert-resolved/10 border-alert-resolved text-alert-resolved",
      animation: "animate-pulse",
    },
    away: {
      label: "Away",
      color: "bg-alert-medium/10 border-alert-medium text-alert-medium",
      animation: "",
    },
    inactive: {
      label: "Inactive",
      color: "bg-muted/30 border-muted text-muted-foreground",
      animation: "",
    },
  }

  const { label, color, animation } = statusMap[guard.status]

  return (
    <motion.div
      className="bg-secondary/50 backdrop-blur-sm rounded-lg p-4 border border-border/50"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          {guard.image ? (
            <img
              src={guard.image || "/placeholder.svg"}
              alt={guard.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <User size={24} className="text-muted-foreground" />
            </div>
          )}
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
              guard.status === "on-post"
                ? "bg-alert-resolved"
                : guard.status === "away"
                  ? "bg-alert-medium"
                  : "bg-muted"
            } ${guard.status === "on-post" ? animation : ""}`}
          />
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{guard.name}</h3>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-muted-foreground">{guard.location}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${color}`}>{label}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

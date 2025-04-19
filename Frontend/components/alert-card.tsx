"use client"

import { motion } from "framer-motion"
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export type AlertSeverity = "critical" | "medium" | "resolved"
export type AlertLocation = "within" | "outside"

export interface Alert {
  id: string
  title: string
  description: string
  location: string
  locationType: AlertLocation
  timestamp: Date
  severity: AlertSeverity
}

interface AlertCardProps {
  alert: Alert
  onClick?: () => void
}

export default function AlertCard({ alert, onClick }: AlertCardProps) {
  const severityMap = {
    critical: {
      color: "bg-alert-critical/10 border-alert-critical text-alert-critical",
      icon: AlertCircle,
    },
    medium: {
      color: "bg-alert-medium/10 border-alert-medium text-alert-medium",
      icon: AlertTriangle,
    },
    resolved: {
      color: "bg-alert-resolved/10 border-alert-resolved text-alert-resolved",
      icon: CheckCircle,
    },
  }

  const { color, icon: Icon } = severityMap[alert.severity]

  return (
    <motion.div
      className={`border rounded-lg p-4 ${color} cursor-pointer`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-1 ${alert.severity === "critical" ? "animate-pulse" : ""}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{alert.title}</h3>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs bg-background/50 px-2 py-1 rounded-full">{alert.location}</span>
            <span className="text-xs bg-background/50 px-2 py-1 rounded-full capitalize">
              {alert.locationType} Hostel
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

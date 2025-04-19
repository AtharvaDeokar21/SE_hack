"use client"

import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"

export interface TimelineEvent {
  id: string
  title: string
  description: string
  timestamp: Date
  type: "alert" | "system" | "user"
}

interface TimelineProps {
  events: TimelineEvent[]
}

export default function Timeline({ events }: TimelineProps) {
  const sortedEvents = [...events].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  return (
    <div className="space-y-4">
      {sortedEvents.map((event, index) => (
        <motion.div
          key={event.id}
          className="relative pl-6 pb-4"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          {/* Timeline connector */}
          {index < events.length - 1 && <div className="absolute left-[0.4375rem] top-3 bottom-0 w-0.5 bg-border" />}

          {/* Timeline dot */}
          <div
            className={`absolute left-0 top-1.5 h-3 w-3 rounded-full ${
              event.type === "alert" ? "bg-alert-critical" : event.type === "system" ? "bg-alert-medium" : "bg-muted"
            }`}
          />

          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">{event.title}</h4>
              <time className="text-xs text-muted-foreground">
                {formatDistanceToNow(event.timestamp, { addSuffix: true })}
              </time>
            </div>
            <p className="text-xs text-muted-foreground">{event.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

"use client"
import { motion } from "framer-motion"
import type { Alert } from "./alert-card"

interface MapViewProps {
  alerts: Alert[]
  onAlertClick: (alert: Alert) => void
}

export default function MapView({ alerts, onAlertClick }: MapViewProps) {
  // Map coordinates for alerts (simplified for demo)
  const alertPositions: Record<string, { x: number; y: number }> = {
    "Main Entrance": { x: 20, y: 30 },
    "East Wing": { x: 80, y: 40 },
    "West Wing": { x: 20, y: 70 },
    "North Block": { x: 50, y: 20 },
    "South Block": { x: 50, y: 80 },
    "Quadrangle": { x: 70, y: 60 },
    "Lobby": { x: 30, y: 50 },
    "Lake": { x: 85, y: 15 },
    "Cabin": { x: 10, y: 90 },
  }

  return (
    <div className="relative w-full h-[300px] md:h-[400px] bg-muted/30 rounded-lg border border-border overflow-hidden">
      {/* Simplified floorplan */}
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0">
        {/* Main building outline */}
        <rect x="10" y="10" width="80" height="80" fill="transparent" stroke="#666" strokeWidth="0.5" />

        {/* Internal walls */}
        <line x1="50" y1="10" x2="50" y2="90" stroke="#666" strokeWidth="0.5" />
        <line x1="10" y1="50" x2="90" y2="50" stroke="#666" strokeWidth="0.5" />

        {/* Rooms */}
        <rect x="15" y="15" width="30" height="30" fill="transparent" stroke="#666" strokeWidth="0.3" />
        <rect x="55" y="15" width="30" height="30" fill="transparent" stroke="#666" strokeWidth="0.3" />
        <rect x="15" y="55" width="30" height="30" fill="transparent" stroke="#666" strokeWidth="0.3" />
        <rect x="55" y="55" width="30" height="30" fill="transparent" stroke="#666" strokeWidth="0.3" />

        {/* Entrances */}
        <rect x="48" y="10" width="4" height="2" fill="#888" />
        <rect x="48" y="88" width="4" height="2" fill="#888" />
        <rect x="10" y="48" width="2" height="4" fill="#888" />
        <rect x="88" y="48" width="2" height="4" fill="#888" />

        {/* Perimeter */}
        <rect
          x="5"
          y="5"
          width="90"
          height="90"
          fill="transparent"
          stroke="#444"
          strokeWidth="0.2"
          strokeDasharray="1,1"
        />

        {/* Lake (outside) */}
        <circle cx="90" cy="90" r="8" fill="#235789" fillOpacity="0.3" stroke="#235789" strokeWidth="0.5" />
        <text x="90" y="90" textAnchor="middle" dominantBaseline="middle" fill="#aaa" fontSize="2">
          Lake
        </text>

        {/* Cabin (outside) */}
        <rect x="12" y="7" width="6" height="6" fill="#654321" fillOpacity="0.3" stroke="#654321" strokeWidth="0.5" />
        <text x="15" y="10" textAnchor="middle" dominantBaseline="middle" fill="#aaa" fontSize="2">
          Cabin
        </text>

        {/* Quadrangle (inside) */}
        <rect
          x="45"
          y="45"
          width="10"
          height="10"
          fill="#2a9d8f"
          fillOpacity="0.2"
          stroke="#2a9d8f"
          strokeWidth="0.3"
        />
        <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fill="#aaa" fontSize="2">
          Quad
        </text>
      </svg>

      {/* Alert markers */}
      {alerts.map((alert) => {
        const position = alertPositions[alert.location]
        if (!position) return null

        return (
          <motion.div
            key={alert.id}
            className="absolute group"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <motion.div
              className={`w-4 h-4 rounded-full cursor-pointer ${
                alert.severity === "critical"
                  ? "bg-alert-critical animate-blink"
                  : alert.severity === "medium"
                    ? "bg-alert-medium"
                    : "bg-alert-resolved"
              }`}
              whileHover={{ scale: 1.5 }}
              onClick={() => onAlertClick(alert)}
            />
            <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-48 bg-background/90 backdrop-blur-sm p-2 rounded border border-border text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <p className="font-medium">{alert.title}</p>
              <p className="text-muted-foreground mt-1">{alert.description}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs bg-background/50 px-2 py-0.5 rounded-full">{alert.location}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    alert.severity === "critical"
                      ? "bg-alert-critical/20 text-alert-critical"
                      : alert.severity === "medium"
                        ? "bg-alert-medium/20 text-alert-medium"
                        : "bg-alert-resolved/20 text-alert-resolved"
                  }`}
                >
                  {alert.severity}
                </span>
              </div>
            </div>
          </motion.div>
        )
      })}

      {/* Legend */}
      <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm p-2 rounded-md text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-alert-critical animate-blink" />
          <span>Critical</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-alert-medium" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-alert-resolved" />
          <span>Resolved</span>
        </div>
      </div>

      {/* Location type indicator */}
      <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm p-2 rounded-md text-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-muted/80" />
            <span>Within Hostel</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-transparent border border-muted/80" />
            <span>Outside Hostel</span>
          </div>
        </div>
      </div>
    </div>
  )
}

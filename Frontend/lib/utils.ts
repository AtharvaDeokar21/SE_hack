import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mock data generators
export function generateMockAlerts(count = 10) {
  const locations = [
    { name: "Main Entrance", type: "outside" as const },
    { name: "East Wing", type: "within" as const },
    { name: "West Wing", type: "within" as const },
    { name: "North Block", type: "within" as const },
    { name: "South Block", type: "within" as const },
    { name: "Lake", type: "outside" as const },
    { name: "Cabin", type: "outside" as const },
    { name: "Quadrangle", type: "within" as const },
    { name: "Library", type: "within" as const },
  ]

  const alertTypes = [
    { title: "Unauthorized Access", description: "Potential unauthorized access detected" },
    { title: "Suspicious Activity", description: "Unusual movement patterns detected" },
    { title: "Perimeter Breach", description: "Perimeter security compromised" },
    { title: "Tailgating Detected", description: "Multiple people entering with single credential" },
    { title: "Loitering", description: "Individual lingering in restricted area" },
  ]

  const severities: Array<"critical" | "medium" | "resolved"> = ["critical", "medium", "resolved"]

  return Array.from({ length: count }).map((_, i) => {
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)]
    const locationInfo = locations[Math.floor(Math.random() * locations.length)]

    return {
      id: `alert-${i}`,
      title: alertType.title,
      description: alertType.description,
      location: locationInfo.name,
      locationType: locationInfo.type,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000)),
      severity: severities[Math.floor(Math.random() * severities.length)],
    }
  })
}

export function generateMockTimelineEvents(count = 15) {
  const eventTypes = [
    {
      type: "alert" as const,
      title: "Critical Alert",
      description: "Unauthorized access detected at Main Entrance",
    },
    {
      type: "alert" as const,
      title: "Medium Alert",
      description: "Suspicious activity in East Wing corridor",
    },
    {
      type: "system" as const,
      title: "System Update",
      description: "Security system updated to version 2.4.1",
    },
    {
      type: "user" as const,
      title: "User Action",
      description: "Guard John Smith acknowledged alert #1234",
    },
    {
      type: "system" as const,
      title: "Camera Offline",
      description: "Camera #12 in West Wing went offline",
    },
  ]

  return Array.from({ length: count }).map((_, i) => {
    const event = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    return {
      id: `event-${i}`,
      title: event.title,
      description: event.description,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 7)),
      type: event.type,
    }
  })
}

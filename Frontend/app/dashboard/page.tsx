"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AlertCard, { type Alert } from "@/components/alert-card"
import MapView from "@/components/map-view"
import Timeline, { type TimelineEvent } from "@/components/timeline"
import { AlertSkeleton, MapSkeleton } from "@/components/skeleton-loader"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Shield } from "lucide-react"
import axios from "axios"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

// Backend URL - replace with your actual backend URL
const BACKEND_URL = "http://127.0.0.1:5000//get_alerts"

// Polling interval in milliseconds (30 seconds)
const POLLING_INTERVAL = 30000

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([])
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [alertFilter, setAlertFilter] = useState<"all" | "critical" | "medium" | "resolved">("all")
  const [pollingEnabled, setPollingEnabled] = useState(true)
  const [lastPolled, setLastPolled] = useState<Date | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?callbackUrl=/dashboard")
    }
  }, [user, authLoading, router])

  // Function to convert backend alert format to our Alert type
  const convertBackendAlert = (backendAlert: any, severity: "critical" | "medium" | "resolved" = "critical"): Alert => {
    return {
      id: backendAlert.id || `alert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: backendAlert.title || "Unknown Alert",
      description: backendAlert.description || "No description provided",
      location: backendAlert.location || "Unknown Location",
      locationType: backendAlert.location === "Lake" || backendAlert.location === "Cabin" ? "outside" : "within",
      timestamp: new Date(backendAlert.timestamp || Date.now()),
      severity: severity,
    }
  }

  // Function to fetch alerts from backend
  const fetchAlerts = useCallback(async () => {
    try {
      const response = await axios.get(BACKEND_URL)
      const data = response.data

      // Update last polled timestamp
      setLastPolled(new Date())

      // Check if we have any new alerts
      if (Object.keys(data).length > 0) {
        // Process the data - it's grouped by some ID
        const newAlerts: Alert[] = []

        Object.entries(data).forEach(([_, alertsArray]: [string, any]) => {
          if (Array.isArray(alertsArray)) {
            alertsArray.forEach((backendAlert) => {
              // Check if this alert already exists in our state
              const alertExists = alerts.some(
                (existingAlert) =>
                  existingAlert.id === backendAlert.id &&
                  existingAlert.timestamp.getTime() === new Date(backendAlert.timestamp).getTime(),
              )

              if (!alertExists) {
                newAlerts.push(convertBackendAlert(backendAlert))
              }
            })
          }
        })

        // If we have new alerts, update the state
        if (newAlerts.length > 0) {
          // Add new alerts to the state
          setAlerts((prevAlerts) => [...newAlerts, ...prevAlerts])

          // Create timeline events for the new alerts
          const newEvents: TimelineEvent[] = newAlerts.map((alert) => ({
            id: `event-${alert.id}`,
            title: alert.title,
            description: `${alert.description} at ${alert.location}`,
            timestamp: alert.timestamp,
            type: "alert",
          }))

          // Add new events to the timeline
          setEvents((prevEvents) => [...newEvents, ...prevEvents])

          // Show a toast notification for each new alert
          newAlerts.forEach((alert) => {
            toast({
              title: alert.title,
              description: `${alert.description} at ${alert.location}`,
              variant: "destructive",
              action: <ToastAction altText="View">View</ToastAction>,
            })
          })
        }
      }

      // Set loading to false after first fetch
      if (isLoading) {
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error fetching alerts:", error)
      // Set loading to false even if there's an error
      if (isLoading) {
        setIsLoading(false)
      }
    }
  }, [alerts, isLoading])

  // Initial data fetch and set up polling
  useEffect(() => {
    if (!user) return

    // Initial fetch
    fetchAlerts()

    // Set up interval
    const intervalId = setInterval(() => {
      if (pollingEnabled) {
        fetchAlerts()
      }
    }, POLLING_INTERVAL)

    // Clean up
    return () => clearInterval(intervalId)
  }, [fetchAlerts, pollingEnabled, user])

  // Filter alerts based on user role and severity
  useEffect(() => {
    if (!user || !alerts.length) return

    // Filter alerts based on user role and severity filter
    let roleFilteredAlerts = alerts

    // Apply role-based filtering
    if (user.role === "warden") {
      // Warden can only see alerts within hostel
      roleFilteredAlerts = alerts.filter((alert) => alert.locationType === "within")
    } else if (user.role === "watchman") {
      // Watchman can only see alerts outside hostel
      roleFilteredAlerts = alerts.filter((alert) => alert.locationType === "outside")
    }
    // Superadmin can see all alerts (no filtering needed)

    // Apply severity filtering
    if (alertFilter === "all") {
      setFilteredAlerts(roleFilteredAlerts)
    } else {
      setFilteredAlerts(roleFilteredAlerts.filter((alert) => alert.severity === alertFilter))
    }
  }, [alerts, alertFilter, user])

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-alert-critical mx-auto animate-pulse" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard content if user is not authenticated
  if (!user) {
    return null
  }

  const handleAlertClick = (alert: Alert) => {
    // Just log the alert for now
    console.log("Alert clicked:", alert)
  }

  // Calculate time until next poll
  const getTimeUntilNextPoll = () => {
    if (!lastPolled) return "Waiting for first poll..."

    const nextPollTime = new Date(lastPolled.getTime() + POLLING_INTERVAL)
    const now = new Date()
    const diffMs = nextPollTime.getTime() - now.getTime()

    if (diffMs <= 0) return "Polling..."

    const diffSecs = Math.floor(diffMs / 1000)
    return `Next poll in ${diffSecs}s`
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
            <div>
              <h1 className="text-3xl font-bold mb-2">Security Dashboard</h1>
              <p className="text-muted-foreground">Real-time monitoring and alerts for your residential hostel</p>
            </div>
            <div className="bg-secondary/50 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-sm">
                Logged in as <span className="font-medium">{user.name}</span> ({" "}
                <span className="capitalize">{user.role}</span> )
              </p>
              <p className="text-xs text-muted-foreground">
                {user.role === "superadmin"
                  ? "You can view all alerts"
                  : user.role === "warden"
                    ? "You can view alerts within the hostel"
                    : "You can view alerts outside the hostel"}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - 2/3 width on desktop */}
          <div className="lg:col-span-2 space-y-6">
            {/* Alerts Feed */}
            <motion.div
              className="bg-card rounded-lg border border-border p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div className="flex items-center">
                  <h2 className="text-xl font-bold">Recent Alerts</h2>
                  {pollingEnabled && (
                    <div className="ml-2 flex items-center">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alert-critical opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-alert-critical"></span>
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">Live (30s) - {getTimeUntilNextPoll()}</span>
                    </div>
                  )}
                </div>
                <Tabs defaultValue="all" className="w-full md:w-auto">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all" onClick={() => setAlertFilter("all")}>
                      All
                    </TabsTrigger>
                    <TabsTrigger value="critical" onClick={() => setAlertFilter("critical")}>
                      Critical
                    </TabsTrigger>
                    <TabsTrigger value="medium" onClick={() => setAlertFilter("medium")}>
                      Medium
                    </TabsTrigger>
                    <TabsTrigger value="resolved" onClick={() => setAlertFilter("resolved")}>
                      Resolved
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <AlertSkeleton key={i} />)
                ) : filteredAlerts.length > 0 ? (
                  filteredAlerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} onClick={() => handleAlertClick(alert)} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {alerts.length > 0 ? "No alerts matching the selected filter" : "No alerts available for your role"}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Map View */}
            <motion.div
              className="bg-card rounded-lg border border-border p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-xl font-bold mb-4">Facility Map</h2>
              {isLoading ? <MapSkeleton /> : <MapView alerts={filteredAlerts} onAlertClick={handleAlertClick} />}
            </motion.div>
          </div>

          {/* Sidebar - 1/3 width on desktop */}
          <div className="space-y-6">
            {/* Timeline */}
            <motion.div
              className="bg-card rounded-lg border border-border p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-xl font-bold mb-4">Activity Timeline</h2>
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-3 w-3 rounded-full bg-muted mt-1.5" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : events.length > 0 ? (
                <Timeline events={events} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">No activity recorded yet</div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

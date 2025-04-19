"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AlertCard, { type Alert } from "@/components/alert-card"
import MapView from "@/components/map-view"
import Timeline, { type TimelineEvent } from "@/components/timeline"
import IncidentModal from "@/components/incident-modal"
import { AlertSkeleton, MapSkeleton } from "@/components/skeleton-loader"
import { generateMockAlerts, generateMockTimelineEvents } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Shield } from "lucide-react"

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([])
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [alertFilter, setAlertFilter] = useState<"all" | "critical" | "medium" | "resolved">("all")

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?callbackUrl=/dashboard")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      const allAlerts = generateMockAlerts(12)
      setAlerts(allAlerts)
      setEvents(generateMockTimelineEvents(10))
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

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
                <h2 className="text-xl font-bold">Recent Alerts</h2>
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
                    <AlertCard key={alert.id} alert={alert} onClick={() => setSelectedAlert(alert)} />
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
              {isLoading ? (
                <MapSkeleton />
              ) : (
                <MapView alerts={filteredAlerts} onAlertClick={(alert) => setSelectedAlert(alert)} />
              )}
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
              ) : (
                <Timeline events={events} />
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {selectedAlert && <IncidentModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />}
    </div>
  )
}

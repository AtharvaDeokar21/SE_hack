"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, Bell, Lock, Users, Map, Clock, Smartphone, ArrowRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Feature {
  id: string
  title: string
  description: string
  icon: React.ElementType
  details: string
  useCases: string[]
  color: string
}

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState("monitoring")

  const features: Record<string, Feature[]> = {
    monitoring: [
      {
        id: "real-time",
        title: "Real-Time Monitoring",
        description: "24/7 surveillance with AI-powered analysis",
        icon: Eye,
        color: "bg-alert-critical/20 text-alert-critical",
        details:
          "Our system continuously monitors all camera feeds, using advanced AI to detect suspicious activities, unauthorized access attempts, and potential security threats in real-time.",
        useCases: [
          "Detect unauthorized access attempts at entry points",
          "Monitor common areas for suspicious behavior",
          "Identify potential safety hazards in real-time",
        ],
      },
      {
        id: "alerts",
        title: "Intelligent Alerts",
        description: "Instant notifications with severity classification",
        icon: Bell,
        color: "bg-alert-medium/20 text-alert-medium",
        details:
          "Receive immediate alerts categorized by severity level with detailed context about the nature of the security event.",
        useCases: [
          "Critical alerts for immediate security threats",
          "Medium alerts for suspicious but non-urgent activities",
          "Low-priority notifications for general information",
        ],
      },
      {
        id: "privacy",
        title: "Privacy Protection",
        description: "Advanced controls for sensitive areas and data",
        icon: Lock,
        color: "bg-alert-resolved/20 text-alert-resolved",
        details:
          "Configure privacy zones where monitoring is limited or anonymized. Our system can automatically blur faces in non-alert situations.",
        useCases: [
          "Automatically blur faces in dormitory common areas",
          "Mask sensitive areas like bathroom entrances",
          "Implement role-based access controls for video feeds",
        ],
      },
    ],
    management: [
      {
        id: "staff",
        title: "Staff Management",
        description: "Track security personnel status and location",
        icon: Users,
        color: "bg-alert-critical/20 text-alert-critical",
        details:
          "Monitor security staff positions, patrol routes, and response times. The system tracks guard check-ins and provides performance metrics.",
        useCases: [
          "Track guard patrol routes and coverage",
          "Monitor response times to security incidents",
          "Optimize security staff scheduling based on activity patterns",
        ],
      },
      {
        id: "map",
        title: "Interactive Map View",
        description: "Visual representation of your facility with alert overlays",
        icon: Map,
        color: "bg-alert-medium/20 text-alert-medium",
        details:
          "View your entire facility on an interactive map with real-time alert indicators, staff positions, and zone status.",
        useCases: [
          "Visualize security incident locations across your facility",
          "Track security personnel positions in real-time",
          "Identify security coverage gaps in your facility",
        ],
      },
    ],
    reporting: [
      {
        id: "timeline",
        title: "Incident Timeline",
        description: "Chronological view of security events",
        icon: Clock,
        color: "bg-alert-critical/20 text-alert-critical",
        details:
          "Access a detailed timeline of all security events, with the ability to filter by type, location, severity, and time period.",
        useCases: [
          "Review security incidents chronologically",
          "Generate security reports for management",
          "Analyze patterns in security events over time",
        ],
      },
      {
        id: "mobile",
        title: "Mobile Access",
        description: "Manage security from anywhere",
        icon: Smartphone,
        color: "bg-alert-resolved/20 text-alert-resolved",
        details:
          "Access all system features from any device with our responsive web interface and dedicated mobile app.",
        useCases: [
          "Receive security alerts on your mobile device",
          "View live camera feeds while away from the facility",
          "Manage security staff and respond to incidents remotely",
        ],
      },
    ],
  }

  const categories = [
    { id: "monitoring", label: "Monitoring & Detection" },
    { id: "management", label: "Facility Management" },
    { id: "reporting", label: "Reporting & Access" },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-4">Security System Features</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive security solution provides everything you need to protect your residential hostel.
          </p>
        </motion.div>

        <Tabs defaultValue="monitoring" className="mb-12" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              <div className="grid gap-8">
                {features[category.id].map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    className="flex flex-col md:flex-row gap-6 p-6 bg-card rounded-lg border"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className="md:w-1/3 flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 rounded-full ${feature.color}`}>
                          <feature.icon className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold">{feature.title}</h3>
                      </div>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>

                    <div className="md:w-2/3 flex flex-col">
                      <p className="mb-4">{feature.details}</p>
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Common Use Cases
                      </h4>
                      <ul className="space-y-2">
                        {feature.useCases.map((useCase, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <ArrowRight className={`h-4 w-4 mt-1 flex-shrink-0 ${feature.color.split(" ")[1]}`} />
                            <span className="text-sm">{useCase}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

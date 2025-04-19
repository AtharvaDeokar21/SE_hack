"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, Bell, Lock, Users, Map, Clock, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Feature {
  title: string
  description: string
  icon: React.ElementType
  details: string
}

export default function FeaturesPage() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)

  const features: Feature[] = [
    {
      title: "Real-Time Monitoring",
      description: "24/7 surveillance with AI-powered analysis",
      icon: Eye,
      details:
        "Our system continuously monitors all camera feeds, using advanced AI to detect suspicious activities, unauthorized access attempts, and potential security threats in real-time. The system learns normal patterns over time, reducing false alarms while ensuring genuine threats are never missed.",
    },
    {
      title: "Intelligent Alerts",
      description: "Instant notifications with severity classification",
      icon: Bell,
      details:
        "Receive immediate alerts categorized by severity level (critical, medium, low) with detailed context about the nature of the security event. Alerts can be routed to specific staff members based on location, type, and urgency, ensuring the right person responds at the right time.",
    },
    {
      title: "Privacy Protection",
      description: "Advanced controls for sensitive areas and data",
      icon: Lock,
      details:
        "Configure privacy zones where monitoring is limited or anonymized. Our system can automatically blur faces in non-alert situations, mask sensitive areas like bathroom entrances, and implement role-based access controls to ensure only authorized personnel can view certain feeds or data.",
    },
    {
      title: "Staff Management",
      description: "Track security personnel status",
      icon: Users,
      details:
        "Monitor security staff positions, patrol routes, and response times. The system tracks guard check-ins, generates optimal patrol routes based on risk assessment, and provides performance metrics to help optimize security team operations and coverage.",
    },
    {
      title: "Interactive Map View",
      description: "Visual representation of your facility with alert overlays",
      icon: Map,
      details:
        "View your entire facility on an interactive map with real-time alert indicators, staff positions, and zone status. Quickly identify hotspots of activity, navigate to specific camera feeds by clicking on map locations, and visualize historical patterns of incidents across your property.",
    },
    {
      title: "Incident Timeline",
      description: "Chronological view of security events",
      icon: Clock,
      details:
        "Access a detailed timeline of all security events, with the ability to filter by type, location, severity, and time period. Each incident includes contextual information, linked video evidence, and resolution status, creating a comprehensive security log for your facility.",
    },
    {
      title: "Mobile Access",
      description: "Manage security from anywhere",
      icon: Smartphone,
      details:
        "Access all system features from any device with our responsive web interface and dedicated mobile app. Receive push notifications, view live feeds, respond to incidents, and manage settings on the go, ensuring you're always connected to your security system.",
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-4">Comprehensive Security Features</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore the advanced capabilities of our AI-powered security system designed specifically for residential
            hostels.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              className="bg-secondary/50 backdrop-blur-sm rounded-xl p-6 border border-border/50 hover:border-alert-critical/50 transition-all duration-300 cursor-pointer"
              variants={item}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 30px -15px rgba(255, 0, 0, 0.2)",
              }}
              onClick={() => setSelectedFeature(feature)}
            >
              <div className="rounded-full bg-background w-12 h-12 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-alert-critical" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {selectedFeature && (
          <motion.div
            className="bg-secondary/50 backdrop-blur-sm rounded-xl p-6 border border-border/50 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-background w-12 h-12 flex items-center justify-center flex-shrink-0">
                <selectedFeature.icon className="h-6 w-6 text-alert-critical" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">{selectedFeature.title}</h3>
                <p className="text-muted-foreground mb-4">{selectedFeature.details}</p>
                <Button variant="outline" size="sm" onClick={() => setSelectedFeature(null)}>
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-4">Ready to see it in action?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Experience our AI-powered security system firsthand with our interactive demo dashboard.
          </p>
          <Button size="lg" asChild>
            <Link href="/dashboard">Try Demo Dashboard</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

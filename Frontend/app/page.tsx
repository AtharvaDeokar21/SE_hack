"use client"

import { motion } from "framer-motion"
import { Shield, Eye, Bell, Lock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import FeatureCard from "@/components/feature-card"
import Link from "next/link"

export default function Home() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  // Floating animation for the security interface
  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 6,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "reverse" as const,
      ease: "easeInOut",
    },
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background/90"></div>
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px]"></div>
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-background to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent"></div>

          {/* Animated background elements */}
          <motion.div
            className="absolute top-20 left-[20%] h-64 w-64 rounded-full bg-alert-critical/5 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.2, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-[20%] h-64 w-64 rounded-full bg-alert-critical/10 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        </div>

        <div className="container relative z-10 mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div className="text-left" variants={containerVariants} initial="hidden" animate="visible">
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-muted/20 px-4 py-1.5 text-sm mb-6"
                variants={itemVariants}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-alert-critical opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-alert-critical"></span>
                </span>
                <span className="text-muted-foreground">AI-Powered Security System</span>
              </motion.div>

              <motion.h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" variants={itemVariants}>
                Intelligent Security for{" "}
                <motion.span
                  className="text-alert-critical relative inline-block"
                  animate={{
                    textShadow: ["0 0 8px rgba(255,0,0,0)", "0 0 15px rgba(255,0,0,0.3)", "0 0 8px rgba(255,0,0,0)"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  Residential Hostels
                </motion.span>
              </motion.h1>

              <motion.p className="text-xl text-muted-foreground mb-8 max-w-xl" variants={itemVariants}>
                Enhance safety with real-time monitoring, intelligent alerts, and comprehensive security management for
                your residential facility.
              </motion.p>

              
            </motion.div>

            
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Intelligent Security Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered system provides comprehensive security monitoring with advanced features designed
              specifically for residential hostels.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              title="Real-Time Monitoring"
              description="24/7 surveillance with AI-powered analysis to detect and alert on suspicious activities as they happen."
              icon={Eye}
              delay={0.1}
            />
            <FeatureCard
              title="Intelligent Alerts"
              description="Receive instant notifications for security events, categorized by severity and with AI-enhanced context."
              icon={Bell}
              delay={0.2}
            />
            <FeatureCard
              title="Privacy Protection"
              description="Advanced privacy controls allow you to mask sensitive areas and anonymize individuals as needed."
              icon={Lock}
              delay={0.3}
            />
            <FeatureCard
              title="Staff Management"
              description="Track security personnel location and status in real-time to ensure optimal coverage."
              icon={Shield}
              delay={0.4}
            />
            <FeatureCard
              title="Behavior Analysis"
              description="Detect unusual patterns like loitering, tailgating, and unauthorized access attempts."
              icon={Eye}
              delay={0.5}
            />
            <FeatureCard
              title="Comprehensive Reporting"
              description="Generate detailed security reports with insights and recommendations for improving safety."
              icon={Bell}
              delay={0.6}
            />
          </div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            viewport={{ once: true }}
          >
            <Button size="lg" variant="outline" asChild>
              <Link href="/features" className="group">
                Learn More About Features
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="bg-secondary/50 backdrop-blur-sm rounded-xl p-8 md:p-12 border border-border/50"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to enhance your hostel security?</h2>
                <p className="text-muted-foreground mb-6">
                  Get started with our AI-powered security system today and provide a safer environment for your
                  residents.
                </p>
                <Button size="lg">Request a Demo</Button>
              </div>
              <div className="flex-1 flex justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.2, 0.3, 0.2],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  <Shield className="h-32 w-32 text-alert-critical" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

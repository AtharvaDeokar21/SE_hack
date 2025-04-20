"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Shield, Eye, Bell, Lock, ArrowRight, ShieldCheck, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import FeatureCard from "@/components/feature-card"
import Link from "next/link"

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  // Handle mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)

    // Set loaded state after a short delay for entrance animation
    const timer = setTimeout(() => setIsLoaded(true), 300)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      clearTimeout(timer)
    }
  }, [])

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

  // Particle animation for security nodes
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }))

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Hero Section with Advanced Animations */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-32 pb-24 px-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background/90"></div>

          {/* Animated grid */}
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px]"></div>

          {/* Radial gradient */}
          <div
            className="absolute inset-0 bg-radial-gradient opacity-30"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(255, 0, 0, 0.15), transparent 50%)`,
            }}
          ></div>

          {/* Animated security nodes/particles */}
          <div className="absolute inset-0 overflow-hidden">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full bg-alert-critical/30 backdrop-blur-sm"
                style={{
                  width: particle.size,
                  height: particle.size,
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                }}
                animate={{
                  x: [
                    Math.random() * 100 - 50,
                    Math.random() * 100 - 50,
                    Math.random() * 100 - 50,
                    Math.random() * 100 - 50,
                  ],
                  y: [
                    Math.random() * 100 - 50,
                    Math.random() * 100 - 50,
                    Math.random() * 100 - 50,
                    Math.random() * 100 - 50,
                  ],
                  opacity: [0.2, 0.5, 0.2],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: particle.duration,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: particle.delay,
                }}
              />
            ))}
          </div>

          {/* Connection lines animation */}
          <svg className="absolute inset-0 w-full h-full z-0 opacity-20">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 0, 0, 0.3)" />
                <stop offset="100%" stopColor="rgba(255, 0, 0, 0)" />
              </linearGradient>
            </defs>
            {particles.slice(0, 10).map((particle, i) => (
              <motion.line
                key={`line-${i}`}
                x1={`${particle.x}%`}
                y1={`${particle.y}%`}
                x2={`${particles[(i + 3) % particles.length].x}%`}
                y2={`${particles[(i + 3) % particles.length].y}%`}
                stroke="url(#lineGradient)"
                strokeWidth="0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{
                  duration: 5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.5,
                }}
              />
            ))}
          </svg>

          {/* Gradient overlays */}
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
            <motion.div
              className="text-left"
              variants={containerVariants}
              initial="hidden"
              animate={isLoaded ? "visible" : "hidden"}
              style={{ opacity, scale }}
            >
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-muted/20 px-4 py-1.5 text-sm mb-6 backdrop-blur-sm"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-alert-critical opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-alert-critical"></span>
                </span>
                <span className="text-muted-foreground">AI-Powered Security System</span>
              </motion.div>

              <motion.h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" variants={itemVariants}>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  Intelligent Security for{" "}
                </motion.span>
                <motion.span
                  className="text-alert-critical relative inline-block"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.8 }}
                >
                  <span className="relative">
                    Residential Hostels
                    <motion.span
                      className="absolute -inset-1 rounded-lg bg-alert-critical/10 -z-10"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 1.2 }}
                    />
                  </span>
                </motion.span>
              </motion.h1>

              <motion.p
                className="text-xl text-muted-foreground mb-8 max-w-xl"
                variants={itemVariants}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                Enhance safety with real-time monitoring, intelligent alerts, and comprehensive security management for
                your residential facility.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.3 }}
              >
                <Button size="lg" className="group">
                  <span>Get Started</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/features">Explore Features</Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Abstract Security Visualization - Replacing the 3D interface */}
            <motion.div
              className="relative hidden lg:block"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <div className="relative aspect-square max-w-md mx-auto">
                {/* Central Shield */}
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40"
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, 0, -2, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                  style={{
                    transformStyle: "preserve-3d",
                    perspective: "1000px",
                    transform: `perspective(1000px) rotateY(${(mousePosition.x - 0.5) * 15}deg) rotateX(${
                      (mousePosition.y - 0.5) * -15
                    }deg)`,
                  }}
                >
                  <div className="relative w-full h-full">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-alert-critical/20 to-alert-critical/5 rounded-full backdrop-blur-sm border border-alert-critical/30 flex items-center justify-center"
                      animate={{
                        boxShadow: [
                          "0 0 20px 0 rgba(255, 0, 0, 0.3)",
                          "0 0 40px 0 rgba(255, 0, 0, 0.2)",
                          "0 0 20px 0 rgba(255, 0, 0, 0.3)",
                        ],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                      }}
                    >
                      <Shield className="h-20 w-20 text-alert-critical" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Orbiting Elements */}
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const angle = (i * Math.PI * 2) / 6
                  const radius = 120
                  const x = Math.cos(angle) * radius
                  const y = Math.sin(angle) * radius
                  const icons = [ShieldCheck, Bell, Eye, Lock, ShieldAlert, Shield]
                  const Icon = icons[i]

                  return (
                    <motion.div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-12 h-12"
                      initial={{
                        x: x * 0.5,
                        y: y * 0.5,
                        opacity: 0,
                      }}
                      animate={{
                        x,
                        y,
                        opacity: 1,
                        rotate: [0, 360],
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 50,
                        damping: 20,
                        delay: 1.5 + i * 0.1,
                        rotate: {
                          duration: 20 + i * 5,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        },
                      }}
                    >
                      <motion.div
                        className="w-full h-full bg-secondary/50 backdrop-blur-sm rounded-full border border-border/50 flex items-center justify-center"
                        animate={{
                          scale: [1, 1.1, 1],
                          boxShadow: [
                            "0 0 0px 0 rgba(255, 255, 255, 0)",
                            "0 0 10px 0 rgba(255, 255, 255, 0.1)",
                            "0 0 0px 0 rgba(255, 255, 255, 0)",
                          ],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "reverse",
                          delay: i * 0.5,
                        }}
                      >
                        <Icon className="h-5 w-5 text-foreground" />
                      </motion.div>
                    </motion.div>
                  )
                })}

                {/* Connecting Lines */}
                <svg
                  className="absolute inset-0 w-full h-full z-0"
                  viewBox="0 0 400 400"
                  style={{ overflow: "visible" }}
                >
                  <defs>
                    <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgba(255, 0, 0, 0.3)" />
                      <stop offset="100%" stopColor="rgba(255, 0, 0, 0)" />
                    </linearGradient>
                  </defs>
                  {[0, 1, 2, 3, 4, 5].map((i) => {
                    const angle = (i * Math.PI * 2) / 6
                    const radius = 120
                    const x = Math.cos(angle) * radius + 200
                    const y = Math.sin(angle) * radius + 200

                    return (
                      <motion.line
                        key={i}
                        x1="200"
                        y1="200"
                        x2={x}
                        y2={y}
                        stroke="url(#lineGradient2)"
                        strokeWidth="1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.7, 0.3, 0.7, 0] }}
                        transition={{
                          duration: 4,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.5,
                        }}
                      />
                    )
                  })}
                </svg>

                {/* Pulse Rings */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={`ring-${i}`}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-alert-critical/30"
                    initial={{ width: 80, height: 80, opacity: 0.7 }}
                    animate={{
                      width: [80, 240],
                      height: [80, 240],
                      opacity: [0.7, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 1.3,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <motion.div
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
              animate={{
                y: [0, 4, 0],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
          </motion.div>
        </motion.div>
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
            className="bg-secondary/50 backdrop-blur-sm rounded-xl p-8 md:p-12 border border-border/50 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            {/* Background animation */}
            <div className="absolute inset-0 -z-10">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-alert-critical/10"
                  style={{
                    width: Math.random() * 300 + 100,
                    height: Math.random() * 300 + 100,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    x: [0, Math.random() * 50 - 25],
                    y: [0, Math.random() * 50 - 25],
                    scale: [1, 1.1, 1],
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{
                    duration: 10 + i * 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                />
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
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
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{
                    duration: 10,
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

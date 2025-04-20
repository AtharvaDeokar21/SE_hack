"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion"
import { Shield, Eye, Bell, Lock, ArrowRight, ShieldCheck, ShieldAlert, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import FeatureCard from "@/components/feature-card"
import Link from "next/link"

// Custom hook for mouse parallax effect
function useMouseParallax(strength = 10) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * strength,
        y: (e.clientY / window.innerHeight - 0.5) * strength,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [strength])

  return mousePosition
}

// Particle component for advanced effects
const Particles = ({ count = 100 }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      color: i % 5 === 0 ? "rgba(255, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.2)",
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }))
  }, [count])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
          }}
          animate={{
            x: [Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50],
            y: [Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50],
            opacity: [0, 0.8, 0.4, 0],
            scale: [0, 1, 0.5, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  )
}

// Animated gradient background
const AnimatedGradient = () => {
  return (
    <motion.div
      className="absolute inset-0 opacity-30 z-0"
      style={{
        background: "radial-gradient(circle at center, rgba(255,0,0,0.2), transparent 50%)",
      }}
      animate={{
        background: [
          "radial-gradient(circle at 30% 30%, rgba(255,0,0,0.2), transparent 50%)",
          "radial-gradient(circle at 70% 40%, rgba(255,0,0,0.15), transparent 50%)",
          "radial-gradient(circle at 40% 60%, rgba(255,0,0,0.2), transparent 50%)",
          "radial-gradient(circle at 60% 30%, rgba(255,0,0,0.15), transparent 50%)",
          "radial-gradient(circle at 30% 30%, rgba(255,0,0,0.2), transparent 50%)",
        ],
      }}
      transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
    />
  )
}

// Animated text with character-by-character animation
const AnimatedText = ({ text, className = "", delay = 0 }) => {
  const characters = Array.from(text)

  return (
    <div className={`flex ${className}`}>
      {characters.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: delay + i * 0.03 }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </div>
  )
}

// Animated security shield
const SecurityShield = ({ mousePosition }) => {
  const rotateX = useSpring(useMotionValue(0), { stiffness: 100, damping: 30 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 100, damping: 30 })
  const scale = useSpring(useMotionValue(1), { stiffness: 200, damping: 30 })

  useEffect(() => {
    rotateX.set(-mousePosition.y * 20)
    rotateY.set(mousePosition.x * 20)
  }, [mousePosition, rotateX, rotateY])

  return (
    <div className="relative aspect-square max-w-md mx-auto">
      {/* Glowing background effect */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-alert-critical/10 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />

      {/* Central Shield */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40"
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: "preserve-3d",
          perspective: 1000,
        }}
        whileHover={{ scale: 1.1 }}
        onHoverStart={() => scale.set(1.1)}
        onHoverEnd={() => scale.set(1)}
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
        const icons = [ShieldCheck, Bell, Eye, Lock, ShieldAlert, AlertCircle]
        const Icon = icons[i]

        return (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-12 h-12"
            initial={{
              x: Math.cos(angle) * radius * 0.5,
              y: Math.sin(angle) * radius * 0.5,
              opacity: 0,
            }}
            animate={{
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius,
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
              whileHover={{ scale: 1.2, rotate: 0 }}
            >
              <Icon className="h-5 w-5 text-foreground" />
            </motion.div>
          </motion.div>
        )
      })}

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
  )
}

// Animated security grid
const SecurityGrid = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg width="100%" height="100%" className="opacity-10">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          </pattern>
          <linearGradient id="fadeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <mask id="fadeMask">
            <rect width="100%" height="100%" fill="url(#fadeGradient)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" mask="url(#fadeMask)" />
      </svg>

      {/* Scanning line effect */}
      <motion.div
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-alert-critical/50 to-transparent"
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
    </div>
  )
}

// Floating data points
const FloatingDataPoints = () => {
  const dataPoints = [
    { label: "Alerts", value: "24/7" },
    { label: "Detection", value: "99.8%" },
    { label: "Response", value: "<2min" },
    { label: "Coverage", value: "100%" },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dataPoints.map((point, i) => {
        // Adjust positions to avoid overlapping with text
        // Keep data points on the right side of the screen
        const x = 65 + ((i * 10) % 30) // Start at 65% of screen width instead of 20%
        const y = 15 + ((i * 25) % 70) // Distribute vertically

        return (
          <motion.div
            key={i}
            className="absolute bg-background/30 backdrop-blur-md rounded-lg border border-border/50 px-3 py-2 text-xs"
            style={{ left: `${x}%`, top: `${y}%` }}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [20, 0, 0, -20],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 2,
              times: [0, 0.1, 0.9, 1],
            }}
          >
            <div className="font-bold">{point.value}</div>
            <div className="text-muted-foreground">{point.label}</div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])
  const mousePosition = useMouseParallax(5)

  // Set loaded state after a short delay for entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300)
    return () => clearTimeout(timer)
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

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Hero Section with Advanced Animations */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-32 pb-24 px-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background/90"></div>

          {/* Advanced background effects */}
          <SecurityGrid />
          <AnimatedGradient />
          <Particles count={150} />
          <FloatingDataPoints />

          {/* Gradient overlays */}
          <motion.div
            className="absolute top-20 left-[20%] h-64 w-64 rounded-full bg-alert-critical/5 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.2, 0.3],
              x: [0, -30, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 15,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-[20%] h-64 w-64 rounded-full bg-alert-critical/10 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.3, 0.2],
              x: [0, 40, 0],
              y: [0, -40, 0],
            }}
            transition={{
              duration: 18,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        </div>

        <div className="container relative z-10 mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text content - Fixed to ensure no overlap with 3D model */}
            <motion.div
              className="text-left max-w-xl" // Added max-width to prevent text from expanding too far
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
                <span className="text-muted-foreground">ThirdEye Security System</span>
              </motion.div>

              <motion.div className="mb-6" variants={itemVariants}>
                <AnimatedText
                  text="Intelligent Security for"
                  className="text-4xl md:text-6xl font-bold leading-tight"
                  delay={0.5}
                />
                <div className="h-2"></div>
                <div className="relative inline-block">
                  <AnimatedText
                    text="Residential Hostels"
                    className="text-4xl md:text-6xl font-bold leading-tight text-alert-critical"
                    delay={1.2}
                  />
                  <motion.span
                    className="absolute -inset-1 rounded-lg bg-alert-critical/10 -z-10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.8 }}
                  />
                </div>
              </motion.div>

              <motion.p
                className="text-xl text-muted-foreground mb-8 max-w-xl"
                variants={itemVariants}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.5 }}
              ></motion.p>

              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 2 }}
              >
                <Button size="lg" className="group relative overflow-hidden">
                  <span className="relative z-10">Get Started</span>
                  <motion.span
                    className="absolute inset-0 bg-alert-critical/80 z-0"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <ArrowRight className="ml-2 h-4 w-4 relative z-10 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline" asChild className="group relative overflow-hidden">
                  <Link href="/features">
                    <span className="relative z-10">Explore Features</span>
                    <motion.span
                      className="absolute inset-0 bg-alert-critical/10 z-0"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* 3D Visualization - Contained in its own column */}
            <motion.div
              className="relative hidden lg:block lg:h-full" // Added height to ensure proper containment
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <SecurityShield mousePosition={mousePosition} />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
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

      {/* Features Section with Parallax */}
      <section className="relative py-16 px-4 bg-gradient-to-b from-background to-muted/20 overflow-hidden">
        {/* Parallax background elements */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute top-0 left-0 w-full h-full"
            style={{ y: useTransform(scrollYProgress, [0, 1], [0, -100]) }}
          >
            <div className="absolute top-20 left-[30%] h-64 w-64 rounded-full bg-alert-critical/5 blur-3xl" />
            <div className="absolute bottom-40 right-[20%] h-64 w-64 rounded-full bg-alert-medium/5 blur-3xl" />
          </motion.div>
        </div>

        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Intelligent Security Features
            </motion.h2>
            <motion.p
              className="text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Our AI-powered system provides comprehensive security monitoring with advanced features designed
              specifically for residential hostels.
            </motion.p>
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
            <Button size="lg" variant="outline" asChild className="group relative overflow-hidden">
              <Link href="/features">
                <span className="relative z-10">
                  Learn More About Features
                  <ArrowRight className="ml-2 h-4 w-4 inline transition-transform group-hover:translate-x-1" />
                </span>
                <motion.span
                  className="absolute inset-0 bg-alert-critical/10 z-0"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section with Advanced Effects */}
      <section className="py-16 px-4 relative overflow-hidden">
        {/* Background animation */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:30px_30px]"></div>
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "radial-gradient(circle at 20% 30%, rgba(255,0,0,0.1), transparent 70%)",
                "radial-gradient(circle at 80% 70%, rgba(255,0,0,0.1), transparent 70%)",
                "radial-gradient(circle at 20% 30%, rgba(255,0,0,0.1), transparent 70%)",
              ],
            }}
            transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />

          {/* Floating particles */}
          {Array.from({ length: 10 }).map((_, i) => (
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

        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="bg-secondary/50 backdrop-blur-sm rounded-xl p-8 md:p-12 border border-border/50 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            {/* Animated border */}
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none"
              animate={{
                boxShadow: [
                  "inset 0 0 0 1px rgba(255, 0, 0, 0)",
                  "inset 0 0 0 2px rgba(255, 0, 0, 0.3)",
                  "inset 0 0 0 1px rgba(255, 0, 0, 0)",
                ],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            />

            <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
              <div className="flex-1">
                <motion.h2
                  className="text-2xl md:text-3xl font-bold mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  Ready to enhance your hostel security?
                </motion.h2>
                <motion.p
                  className="text-muted-foreground mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  Get started with our AI-powered security system today and provide a safer environment for your
                  residents.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <Button size="lg" className="group relative overflow-hidden">
                    <span className="relative z-10">Request a Demo</span>
                    <motion.span
                      className="absolute inset-0 bg-alert-critical/80 z-0"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Button>
                </motion.div>
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
                  style={{
                    filter: "drop-shadow(0 0 20px rgba(255, 0, 0, 0.3))",
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

"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  delay?: number
}

export default function FeatureCard({ title, description, icon: Icon, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      className="bg-secondary/50 backdrop-blur-sm rounded-xl p-6 border border-border/50 hover:border-alert-critical/50 transition-all duration-300 h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{
        y: -5,
        boxShadow: "0 10px 30px -15px rgba(255, 0, 0, 0.2)",
      }}
    >
      <div className="flex flex-col h-full">
        <div className="rounded-full bg-background w-12 h-12 flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-alert-critical" />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground flex-grow">{description}</p>
      </div>
    </motion.div>
  )
}

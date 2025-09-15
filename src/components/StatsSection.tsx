"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect } from "react"

const stats = [
  { value: 100, label: "Happy Clients" },
  { value: 5, label: "Years Experience" },
  { value: 120, label: "Completed Projects" },
]

const AnimatedStat = ({ value, label }: { value: number; label: string }) => {
  const motionValue = useMotionValue(0)

  // Animated number with + sign for >= 100
  const displayValue = useTransform(motionValue, (latest) =>
    latest >= 0 ? `${Math.round(latest)}+` : `${Math.round(latest)}`
  )

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 2.5 })
    return () => controls.stop()
  }, [value, motionValue])

  return (
    <motion.div className="text-center p-4 rounded-lg hover:bg-emerald-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
        <motion.span>{displayValue}</motion.span>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    </motion.div>
  )
}

export default function StatsSection() {
  return (
    <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      {stats.map((stat, idx) => (
        <AnimatedStat key={idx} value={stat.value} label={stat.label} />
      ))}
    </div>
  )
}

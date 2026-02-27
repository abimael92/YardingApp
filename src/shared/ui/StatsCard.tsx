"use client"

import { motion } from "framer-motion"
import type { SVGProps } from "react"
import type { ForwardRefExoticComponent, RefAttributes } from "react"

type HeroIcon = ForwardRefExoticComponent<
  Omit<SVGProps<SVGSVGElement>, "ref"> & {
    title?: string | undefined
    titleId?: string | undefined
  } & RefAttributes<SVGSVGElement>
>

interface StatsCardProps {
  title: string
  value: string
  icon: HeroIcon
  color: "primary" | "green" | "earth" | "sand" | "blue" | "red" | "brown" | "grey" | "purple"
  change?: string | React.ReactNode
}

const getColorClasses = (color: string) => {
  switch (color) {
    case "primary":
      return "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
    case "green":
      return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
    case "earth":
      return "bg-earth-100 dark:bg-earth-900/30 text-earth-600 dark:text-earth-400"
    case "sand":
      return "bg-sand-100 dark:bg-sand-900/30 text-sand-600 dark:text-sand-400"
    case "blue":
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
    case "red":
      return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
    case "brown":
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
    case "grey":
      return "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400"
    case "purple":
      return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
    default:
      return "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400"
  }
}

const StatsCard = ({ title, value, icon: Icon, color, change }: StatsCardProps) => {
  const colorClasses = getColorClasses(color)
  const textColor = colorClasses.split(" ").filter((c) => c.startsWith("text-")).join(" ")

  return (
    <motion.div whileHover={{ y: -2 }} className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {change && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {typeof change === "string" ? <p>{change}</p> : change}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses}`}>
          <Icon className={`w-6 h-6 ${textColor}`} />
        </div>
      </div>
    </motion.div>
  )
}

export default StatsCard
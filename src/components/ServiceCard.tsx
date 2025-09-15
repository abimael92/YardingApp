// ServiceCard.tsx
"use client"

import { motion } from "framer-motion"
import { CheckIcon } from "@heroicons/react/24/solid"
import type { Service } from "../types"

interface ServiceCardProps {
  service: Service
}

const categoryColors: Record<string, string> = {
  "Lawn Care": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  "Tree Services": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "Landscaping": "bg-sage-100 text-sage-800 dark:bg-sage-900 dark:text-sage-200",
  "Irrigation": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "Hardscaping": "bg-stone-100 text-stone-800 dark:bg-stone-900 dark:text-stone-200",
  // add more categories as needed
}


const ServiceCard = ({ service }: ServiceCardProps) => {
   const chipColor = categoryColors[service.category] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="card p-6 h-full bg-gray-100 dark:bg-gray-900 border rounded-lg cursor-pointer group shadow-lg"
    >
      {/* Image */}
      <div className="relative mb-4 rounded-lg overflow-hidden">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-48 object-cover object-top"
        />
         {/* Category chip */}
      <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${chipColor}`}>
          {service.category}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
        {service.name}
      </h3>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-300 mb-4">{service.description}</p>

      {/* Price */}
      <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 ">
        {service.price}
      </div>

      {/* Duration */ }
        <div className="text-sm font-light text-gray-300 dark:text-gray-500 mb-4">
        {service.duration}
      </div>

      {/* Features */}
      <ul className="space-y-2 mb-6">
        {service.features.map((feature, idx) => (
          <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <CheckIcon className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      {/* Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-emerald-600 dark:bg-emerald-700 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 dark:hover:bg-emerald-800 transition-colors duration-200"
      >
        Request Quote
      </motion.button>
    </motion.div>
  )
}

export default ServiceCard

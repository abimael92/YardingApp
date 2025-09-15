// app/components/ServiceCard.tsx
'use client'

import { motion } from 'framer-motion'

interface Service {
  id: number
  title: string
  category: string
  description: string
  price: string
  duration: string
  features: string[]
  image: string
}

interface ServiceCardProps {
  service: Service
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <motion.div 
      className="card h-full cursor-pointer group"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative mb-4">
        <img 
          src={service.image} 
          alt={service.title}
          className="w-full h-48 object-cover object-top rounded-lg group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
            {service.category}
          </span>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {service.title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {service.description}
      </p>

      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
            {service.price}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {service.duration}
          </p>
        </div>
      </div>

      <ul className="space-y-2 mb-6">
        {service.features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <div className="w-4 h-4 flex items-center justify-center mr-2">
              <span className="ri-check-line text-emerald-600"></span>
            </div>
            {feature}
          </li>
        ))}
      </ul>

      <button className="w-full btn-primary group-hover:bg-emerald-700 transition-colors">
        Request Quote
      </button>
    </motion.div>
  )
}
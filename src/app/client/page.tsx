// app/client/page.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import ServiceCard from '../components/ServiceCard'
import { services } from '../utils/data'

export default function ClientPortal() {
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [showRequestForm, setShowRequestForm] = useState(false)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Client Portal
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Request services and manage your landscaping needs
        </p>
      </motion.div>

      {!showRequestForm ? (
        <>
          {/* Service Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Select a Service
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <ServiceCard 
                    service={service}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="btn-primary">
                <span className="ri-calendar-event-line mr-2"></span>
                Schedule Service
              </button>
              <button className="btn-secondary">
                <span className="ri-bill-line mr-2"></span>
                View Invoices
              </button>
              <button className="btn-secondary">
                <span className="ri-chat-history-line mr-2"></span>
                Support Request
              </button>
            </div>
          </motion.div>
        </>
      ) : (
        /* Service Request Form would go here */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Service Request Form
          </h2>
          {/* Form implementation would go here */}
        </motion.div>
      )}
    </div>
  )
}
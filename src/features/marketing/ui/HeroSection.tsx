"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ChevronRightIcon, PhoneIcon, StarIcon } from "@heroicons/react/24/solid"
import { useState, useEffect } from "react"
import StatsSection from "./StatsSection"

const heroImages = [
  "/Desert Landscape(1).jpg",
  "/Desert Landscape(2).jpg",
  "/Desert Landscape(3).jpg",
  "/Desert Landscape(4).jpg",
  "/Desert Landscape(5).jpg",
  "/Desert Landscape(6).jpg",
]

const heroQuotes = [
  { text: "Our yard has never looked better!", author: "Maria S.", rating: 5 },
  { text: "Professional and reliable service.", author: "John D.", rating: 5 },
  { text: "Transformed our outdoor space beautifully.", author: "Alicia M.", rating: 5 },
  { text: "Highly recommend for landscaping.", author: "Carlos R.", rating: 4.9 },
  { text: "Exceeded our expectations every time.", author: "Samantha K.", rating: 5 },
  { text: "Fast, efficient, and professional.", author: "David P.", rating: 4.8 },
]

export default function HeroSection() {
  const [current, setCurrent] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Rotate images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setImageLoaded(false) // reset before next image
      setCurrent((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Column */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl lg:text-6xl font-display font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Transform Your
              <span className="text-emerald-600 block">Outdoor Space</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Professional lawn care and landscaping services in Phoenix. From weekly
              maintenance to complete landscape transformations, we bring your vision to life.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 border-2 bg-emerald-600 border-primary-600 text-zinc-50 dark:text-primary-400 dark:border-primary-400 rounded-lg font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-200 flex items-center justify-center"
              >
                Get Free Quote
                <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 rounded-lg font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200 flex items-center justify-center"
              >
                <PhoneIcon className="w-5 h-5 mr-2" />
                (602) 824-2791
              </motion.button>
            </div>

            {/* Stats */}
            <StatsSection />
          </motion.div>

          {/* Image Column */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.img
                  key={heroImages[current]}
                  src={heroImages[current]}
                  alt="Beautiful landscaped yard"
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                  initial={{ opacity: 0, rotate: -5, scale: 0.95 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 5, scale: 0.95 }}
                  transition={{ duration: 1 }}
                  onLoad={() => setImageLoaded(true)}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Floating Review Card */}
            <AnimatePresence>
              {imageLoaded && (
                <motion.div
                  key={current}
                  initial={{ opacity: 0, y: 20, x: 50 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, y: 20, x: 50 }}
                  transition={{ duration: 0.8 }}
                  className="absolute bottom-6 right-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-xs"
                >
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="w-4 h-4" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                      {heroQuotes[current].rating}/5
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {heroQuotes[current].text}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    - {heroQuotes[current].author}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

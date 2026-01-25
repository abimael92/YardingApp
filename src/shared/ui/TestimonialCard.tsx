"use client"

import { motion } from "framer-motion"
import { StarIcon } from "@heroicons/react/24/solid"
import type { Testimonial } from "@/src/domain/models"

interface TestimonialCardProps {
  testimonial: Testimonial
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  return (
    <motion.div whileHover={{ y: -5 }} className="card p-6 h-full">
      <div className="flex items-center mb-4">
        <div className="flex text-yellow-400">
          {[...Array(testimonial.rating)].map((_, i) => (
            <StarIcon key={i} className="w-4 h-4" />
          ))}
        </div>
      </div>
      <blockquote className="text-gray-600 dark:text-gray-300 mb-6 italic">
        "{testimonial.content}"
      </blockquote>
      <div className="flex items-center">
        <img
          src={testimonial.avatar || "/placeholder.svg"}
          alt={testimonial.name}
          className="w-12 h-12 rounded-full object-cover mr-4"
          loading="lazy"
          decoding="async"
        />
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {testimonial.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {testimonial.role}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default TestimonialCard

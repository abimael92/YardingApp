"use client"

import { motion } from "framer-motion"
import {
  MapPinIcon,
  ClockIcon,
  StarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  EyeDropperIcon,
} from "@heroicons/react/24/solid"

const features = [
  {
    title: "Licensed & Insured",
    description:
      "Fully licensed and insured professionals with years of Arizona landscaping experience.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Water Conservation",
    description:
      "Drought-resistant designs and efficient irrigation systems perfect for Arizona's climate.",
    icon: EyeDropperIcon,
  },
  {
    title: "Local Expertise",
    description:
      "Born and raised in Phoenix, we understand the unique challenges of desert landscaping and seasonal care.",
    icon: MapPinIcon,
  },
  {
    title: "Reliable Service",
    description:
      "Consistent, on-time service with real-time updates and transparent communication throughout every project.",
    icon: ClockIcon,
  },
  //   { title: "Quality Guarantee", description: "100% satisfaction guarantee on all services. If you're not happy, we'll make it right at no extra cost.", icon: StarIcon },
  {
    title: "Customer Focused",
    description:
      "We prioritize your needs and tailor every project to exceed expectations.",
    icon: UserGroupIcon,
  },
]

export default function WhyChooseUsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 dark:text-white mb-8">
              Why Choose J&J Desert Landscaping?
            </h2>
            <div className="space-y-6">
              {features.map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <div key={idx} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img
              src="/professional-landscaping-team-working-on-desert-ga.jpg"
              alt="Professional landscaping team"
              className="rounded-2xl shadow-xl w-full h-[600px] object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

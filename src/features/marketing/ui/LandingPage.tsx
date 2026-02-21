"use client"

import { motion } from "framer-motion"
import { ChevronRightIcon } from "@heroicons/react/24/solid"
import { PhoneIcon } from "@heroicons/react/24/outline"
import ServicesSection from "./ServicesSection"
import HeroSection from "./HeroSection"
import WhyChooseUsSection from "./WhyChooseUsSection"
import ClientTestimonialsSection from "./ClientTestimonialsSection"

const LandingPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      {/* Hero Section */}
      <section id="home">
        <HeroSection />
      </section>

      {/* Services Section */}
      <section id="services">
        <ServicesSection />
      </section>

      {/* Why Choose Us Section */}
      <section id="why">
        <WhyChooseUsSection />
      </section>

      {/* Testimonials Section */}
      <section id="testimonials">
        <ClientTestimonialsSection />
      </section>

      {/* Contact / CTA Section */}
      <section id="contact" className="py-20 bg-emerald-600 dark:bg-emerald-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Ready to Transform Your Outdoor Space?
            </h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Get a free estimate today and discover how we can enhance your
              Arizona landscape with professional, sustainable solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
              >
                Schedule Consultation
                <ChevronRightIcon className="w-5 h-5 ml-2" />
              </motion.button>
              <motion.a
                href="tel:+16028242791"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors duration-200 flex items-center justify-center shadow-lg"
              >
                <PhoneIcon className="w-5 h-5 mr-2" />
                Call Now
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}

export default LandingPage

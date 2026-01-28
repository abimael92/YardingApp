"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { playfair } from "@/src/shared/styles/fonts"
import {
  HomeIcon,
  UserGroupIcon,
  EyeIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline"
import { getMockRole, clearMockRole, type MockRole } from "@/src/features/auth/services/mockAuth"

interface NavbarProps {
  darkMode: boolean
  setDarkMode: (darkMode: boolean) => void
}

const Navbar = ({ darkMode, setDarkMode }: NavbarProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [currentRole, setCurrentRole] = useState<MockRole | null>(null)

  // Update role when pathname changes (user navigates)
  useEffect(() => {
    const updateRole = () => {
      setCurrentRole(getMockRole())
    }
    updateRole()
    
    // Also check periodically in case cookie changes
    const interval = setInterval(updateRole, 1000)
    return () => clearInterval(interval)
  }, [pathname])

  const handleLogout = () => {
    clearMockRole()
    setCurrentRole(null) // Immediately update UI
    router.push("/")
    // Force a refresh after a short delay to ensure cookie is cleared
    setTimeout(() => {
      router.refresh()
    }, 100)
  }

  const navigation = [
    { name: "Home", href: "#home", icon: HomeIcon },
    { name: "Services", href: "#services", icon: UserIcon },
    { name: "Why Choose Us", href: "#why", icon: EyeIcon },
    { name: "Testimonials", href: "#testimonials", icon: UserGroupIcon },
    { name: "Contact", href: "#contact", icon: Cog6ToothIcon },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="#home" className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-black"
            >
              <img
                src="/brand-logo.png"
                alt="J&J Desert Landscaping LLC logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                decoding="async"
              />
            </motion.div>
            <span
              className={`${playfair.variable} font-serif font-bold text-xl text-gray-900 dark:text-white`}
            >
              J&J Desert Landscaping LLC
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </a>
              )
            })}
          </div>

          {/* Login Button & Actions */}
          <div className="flex items-center space-x-4">
            {currentRole ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 shadow-lg transition-all duration-200 flex items-center space-x-2"
                type="button"
              >
                <span className="capitalize">{currentRole}</span>
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/login")}
                className="px-6 py-2.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 shadow-lg transition-all duration-200 flex items-center space-x-2"
                type="button"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>Login</span>
              </motion.button>
            )}
          </div>
          {/* <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {darkMode ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </motion.button>

            {/* Mobile menu button */} {/*
            <div className="md:hidden">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                {isOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>
           */}
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4"
            >
              <div className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </a>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default Navbar

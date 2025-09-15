// app/components/Navbar.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link className="flex items-center space-x-2" href="/">
              <div className="w-8 h-8 flex items-center justify-center">
                <span className="ri-leaf-line text-2xl text-emerald-600"></span>
              </div>
              <span className="font-poppins text-xl text-emerald-600 font-semibold">AZ Landscapes</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors" href="/">
                Home
              </Link>
              <a className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors" href="/worker">
                Worker Dashboard
              </a>
              <a className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors" href="/supervisor">
                Supervisor
              </a>
              <a className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors" href="/client">
                Client Portal
              </a>
              <a className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors" href="/admin">
                Admin
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span className="ri-moon-line text-lg"></span>
            </button>
            
            <div className="md:hidden">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="ri-menu-line text-lg"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-gray-200 dark:border-gray-700"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-base font-medium" href="/">
              Home
            </Link>
            <a className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-base font-medium" href="/worker">
              Worker Dashboard
            </a>
            <a className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-base font-medium" href="/supervisor">
              Supervisor
            </a>
            <a className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-base font-medium" href="/client">
              Client Portal
            </a>
            <a className="block text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-base font-medium" href="/admin">
              Admin
            </a>
          </div>
        </motion.div>
      )}
    </nav>
  )
}
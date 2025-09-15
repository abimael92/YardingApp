"use client"

import { AnimatePresence } from "framer-motion"
import { useState, useEffect, ReactNode } from "react"
import { playfair, inter } from '@/src/fonts'
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  return (
    <div className= {`${playfair.variable} font-sans flex-1 min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className={`${playfair.variable} font-sans flex-1`}>
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}

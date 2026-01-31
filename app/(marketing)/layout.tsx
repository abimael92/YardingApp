"use client"

import { useEffect, useState } from "react"
import Navbar from "@/src/shared/ui/Navbar"
import Footer from "@/src/shared/ui/Footer"

const STORAGE_KEY = "theme"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
    const isDark = stored === "dark"
    setDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  useEffect(() => {
    const onThemeChange = (e: CustomEvent<{ dark: boolean }>) => {
      setDarkMode(e.detail.dark)
    }
    window.addEventListener("theme-change", onThemeChange as EventListener)
    return () => window.removeEventListener("theme-change", onThemeChange as EventListener)
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">{children}</main>
      <Footer />
    </div>
  )
}

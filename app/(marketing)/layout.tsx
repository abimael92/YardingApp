"use client"

import { useEffect, useState } from "react"
import Navbar from "@/src/shared/ui/Navbar"
import Footer from "@/src/shared/ui/Footer"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline"

const STORAGE_KEY = "theme"

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    const dark = stored === "dark" || (!stored && prefersDark)
    setIsDark(dark)
    if (dark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add("dark")
      localStorage.setItem(STORAGE_KEY, "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem(STORAGE_KEY, "light")
    }
    window.dispatchEvent(new CustomEvent("theme-change", { detail: { dark: next } }))
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="fixed top-20 right-4 z-[9999] flex h-11 w-11 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-800 shadow-lg ring-2 ring-black/5 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:shadow-gray-900/50 dark:hover:bg-gray-700"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <SunIcon className="h-5 w-5" aria-hidden />
      ) : (
        <MoonIcon className="h-5 w-5" aria-hidden />
      )}
    </button>
  )
}

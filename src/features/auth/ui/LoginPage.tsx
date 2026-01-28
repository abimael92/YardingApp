"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { setMockRole, type MockRole } from "@/src/features/auth/services/mockAuth"

const mockUsers = [
  {
    email: "client@client.com",
    password: "Arizona2025!",
    role: "client" as MockRole,
  },
  {
    email: "worker@worker.com",
    password: "Arizona2025!",
    role: "worker" as MockRole,
  },
  {
    email: "supervisor@supervisor.com",
    password: "Arizona2025!",
    role: "supervisor" as MockRole,
  },
  {
    email: "josue.garcia@jjdesertlandscaping.com",
    password: "Desert2026!",
    role: "admin" as MockRole,
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    console.info("Mock login credentials", mockUsers)
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.info("Mock login submit", { email, password, mockUsers })
    const matchedUser = mockUsers.find(
      (user) => user.email === email && user.password === password
    )
    if (matchedUser) {
      setMockRole(matchedUser.role, matchedUser.email)
      // Small delay to ensure cookie is set
      await new Promise(resolve => setTimeout(resolve, 100))
      router.push(`/${matchedUser.role}`)
      router.refresh() // Refresh to update navbar
    } else {
      console.warn("Mock login failed")
      alert("Invalid email or password")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <img
            src="/brand-logo.png"
            alt="J&J Desert Landscaping LLC logo"
            width={40}
            height={40}
            className="h-10 w-10 object-contain bg-black rounded-lg"
            decoding="async"
          />
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              J&J Desert Landscaping LLC
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Mock Login
            </p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="you@jjdesertlandscaping.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}

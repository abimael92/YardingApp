"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getMockRole, type MockRole } from "@/src/features/auth/services/mockAuth"

interface RoleGateProps {
  role: MockRole
  children: React.ReactNode
}

export default function RoleGate({ role, children }: RoleGateProps) {
  const router = useRouter()

  useEffect(() => {
    const currentRole = getMockRole()
    if (!currentRole || currentRole !== role) {
      router.replace("/login")
    }
  }, [role, router])

  return <>{children}</>
}

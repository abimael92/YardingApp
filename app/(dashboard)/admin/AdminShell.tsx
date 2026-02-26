"use client"

import Sidebar from "@/src/shared/ui/Sidebar"
import { useState, useMemo } from "react"
import { Bars3Icon } from "@heroicons/react/24/outline"
import { usePathname } from "next/navigation"

export default function AdminShell({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()

    const pageInfo = useMemo(() => {
        const sections = [
            {
                match: ["/admin", "/admin/analytics", "/admin/settings"],
                section: "ADMINISTRATION",
                sectionDescription: "System configuration and overview",
            },
            {
                match: ["/admin/users", "/admin/clients", "/admin/employees"],
                section: "USER MANAGEMENT",
                sectionDescription: "Manage users, clients, and employees",
            },
            {
                match: ["/admin/jobs", "/admin/tasks", "/admin/schedule", "/admin/quotes"],
                section: "OPERATIONS",
                sectionDescription: "Manage jobs, tasks, and schedules",
            },
            {
                match: ["/admin/payments", "/admin/invoices", "/admin/reports"],
                section: "FINANCIAL",
                sectionDescription: "Manage payments, invoices, and reports",
            },
        ]

        const foundSection = sections.find(({ match }) =>
            match.some(route =>
                route === "/admin"
                    ? pathname === route
                    : pathname.startsWith(route)
            )
        )

        return (
            foundSection || {
                section: "ADMINISTRATION",
                sectionDescription: "System configuration and overview",
            }
        )
    }, [pathname])

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-brown-200/50 to-amber-200/50 dark:bg-gray-900 min-w-0">
            <Sidebar
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
                userRole="admin"
            />

            <div className="flex-1 min-w-0 w-full overflow-x-hidden">
                <div className="bg-gradient-to-r from-amber-200/50 to-orange-100/60 dark:from-gray-800 dark:to-gray-800 border-b px-4 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg bg-amber-200 dark:bg-gray-700"
                        >
                            <Bars3Icon className="w-6 h-6" />
                        </button>

                        <div>
                            <h1 className="text-xl font-bold">
                                {pageInfo.section}
                            </h1>
                            <p className="text-sm opacity-70">
                                {pageInfo.sectionDescription}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6">
                    {children}
                </div>
            </div>
        </div>
    )
}
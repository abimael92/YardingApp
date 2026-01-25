"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  HomeIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  CalendarIcon,
  MapIcon,
  BellIcon,
} from "@heroicons/react/24/outline"

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  userRole: "worker" | "supervisor" | "client" | "admin"
}

const Sidebar = ({ isOpen, setIsOpen, userRole }: SidebarProps) => {
  const pathname = usePathname()

  const getNavigationItems = () => {
    const baseItems = [{ name: "Dashboard", href: `/${userRole}`, icon: HomeIcon }]

    switch (userRole) {
      case "worker":
        return [
          ...baseItems,
          { name: "My Tasks", href: `/${userRole}/tasks`, icon: ClipboardDocumentListIcon },
          { name: "Schedule", href: `/${userRole}/schedule`, icon: CalendarIcon },
          { name: "Map View", href: `/${userRole}/map`, icon: MapIcon },
        ]
      case "supervisor":
        return [
          ...baseItems,
          { name: "Team Overview", href: `/${userRole}/team`, icon: UserGroupIcon },
          { name: "Task Management", href: `/${userRole}/tasks`, icon: ClipboardDocumentListIcon },
          { name: "Analytics", href: `/${userRole}/analytics`, icon: ChartBarIcon },
          { name: "Schedule", href: `/${userRole}/schedule`, icon: CalendarIcon },
        ]
      case "client":
        return [
          ...baseItems,
          { name: "My Services", href: `/${userRole}/services`, icon: ClipboardDocumentListIcon },
          { name: "Schedule", href: `/${userRole}/schedule`, icon: CalendarIcon },
          { name: "Billing", href: `/${userRole}/billing`, icon: ChartBarIcon },
        ]
      case "admin":
        return [
          ...baseItems,
          { name: "Analytics", href: `/${userRole}/analytics`, icon: ChartBarIcon },
          { name: "User Management", href: `/${userRole}/users`, icon: UserGroupIcon },
          { name: "Task Overview", href: `/${userRole}/tasks`, icon: ClipboardDocumentListIcon },
          { name: "Settings", href: `/${userRole}/settings`, icon: Cog6ToothIcon },
        ]
      default:
        return baseItems
    }
  }

  const navigationItems = getNavigationItems()
  const isActive = (path: string) => pathname === path

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 lg:relative lg:top-0 lg:h-screen lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
              {userRole} Portal
            </h2>
            <div className="relative">
              <BellIcon className="w-6 h-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
            </div>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                      : "text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </motion.aside>
    </>
  )
}

export default Sidebar

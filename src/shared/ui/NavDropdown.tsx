"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDownIcon } from "@heroicons/react/24/outline"
import { useState } from "react"

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number | string
}

interface NavDropdownProps {
  title: string
  items: NavItem[]
  isOpen: boolean
  onToggle: () => void
  icon?: React.ComponentType<{ className?: string }>
  onItemClick?: () => void
}

const NavDropdown = ({ title, items, isOpen, onToggle, icon: Icon, onItemClick }: NavDropdownProps) => {
  const pathname = usePathname()

  return (
    <div className="mb-2">
      {/* Dropdown Button */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5" />}
          <span className="font-medium">{title}</span>
        </div>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Items */}
      {isOpen && (
        <div className="ml-8 mt-1 space-y-1">
          {items.map((item) => {
            const ItemIcon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onItemClick}
                className={`flex items-center gap-3 px-3 py-2 rounded text-sm ${isActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
              >
                <ItemIcon className="w-4 h-4" />
                <span>{item.name}</span>
                {item.badge && (
                  <span className="ml-auto px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default NavDropdown
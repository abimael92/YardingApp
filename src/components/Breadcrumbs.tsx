"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline"

const Breadcrumbs = () => {
  const pathname = usePathname()
  const pathnames = pathname.split("/").filter((x) => x)

  const getBreadcrumbName = (path: string) => {
    const names: { [key: string]: string } = {
      worker: "Worker Portal",
      supervisor: "Supervisor Portal",
      client: "Client Portal",
      admin: "Admin Portal",
      tasks: "Tasks",
      schedule: "Schedule",
      team: "Team",
      analytics: "Analytics",
      services: "Services",
      billing: "Billing",
      users: "Users",
      settings: "Settings",
      map: "Map View",
    }
    return names[path] || path.charAt(0).toUpperCase() + path.slice(1)
  }

  if (pathname === "/") {
    return null
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
      <Link href="/" className="flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
        <HomeIcon className="w-4 h-4" />
      </Link>

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`
        const isLast = index === pathnames.length - 1

        return (
          <div key={name} className="flex items-center space-x-2">
            <ChevronRightIcon className="w-4 h-4" />
            {isLast ? (
              <span className="text-gray-900 dark:text-white font-medium">{getBreadcrumbName(name)}</span>
            ) : (
              <Link href={routeTo} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {getBreadcrumbName(name)}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}

export default Breadcrumbs

/**
 * Settings Page Component
 * 
 * Company settings and configuration
 */

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Cog6ToothIcon, BuildingOfficeIcon, CreditCardIcon, BellIcon, KeyIcon, EnvelopeIcon } from "@heroicons/react/24/outline"

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("company")

  const tabs = [
    { id: "company", label: "Company", icon: BuildingOfficeIcon },
    { id: "billing", label: "Billing", icon: CreditCardIcon },
    { id: "notifications", label: "Notifications", icon: BellIcon },
    { id: "integrations", label: "Integrations", icon: KeyIcon },
    { id: "email", label: "Email Templates", icon: EnvelopeIcon },
  ]

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        {activeTab === "company" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  defaultValue="Desert Landscaping Co."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tax ID
                </label>
                <input
                  type="text"
                  defaultValue="12-3456789"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Service Categories
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>Lawn Care, Tree Service, Irrigation, Landscaping, Hardscaping</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  defaultValue="8.0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
              Save Changes
            </button>
          </div>
        )}

        {activeTab === "billing" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Billing Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Payment Gateway</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Stripe (Connected)</p>
                </div>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
                  Configure
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">QuickBooks Integration</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Not connected</p>
                </div>
                <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm">
                  Connect
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Settings</h2>
            <div className="space-y-4">
              {[
                { label: "Email notifications", checked: true },
                { label: "SMS notifications", checked: false },
                { label: "Payment reminders", checked: true },
                { label: "Job completion alerts", checked: true },
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between">
                  <label className="text-gray-900 dark:text-white">{setting.label}</label>
                  <input
                    type="checkbox"
                    defaultChecked={setting.checked}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "integrations" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Integrations</h2>
            <div className="space-y-4">
              {[
                { name: "QuickBooks", status: "Not connected", action: "Connect" },
                { name: "Stripe", status: "Connected", action: "Configure" },
                { name: "Google Calendar", status: "Not connected", action: "Connect" },
              ].map((integration) => (
                <div key={integration.name} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{integration.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{integration.status}</p>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
                    {integration.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "email" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Email Templates</h2>
            <div className="space-y-4">
              {[
                "Invoice Email",
                "Quote Email",
                "Payment Reminder",
                "Job Completion",
                "Welcome Email",
              ].map((template) => (
                <div key={template} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <span className="text-gray-900 dark:text-white">{template}</span>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default SettingsPage

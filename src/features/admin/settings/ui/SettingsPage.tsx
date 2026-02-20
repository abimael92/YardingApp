/**
 * Settings Page Component
 * 
 * Company settings and configuration
 */

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Cog6ToothIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  BellIcon,
  KeyIcon,
  EnvelopeIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("company")
  const [saveSuccess, setSaveSuccess] = useState(false)

  const tabs = [
    { id: "company", label: "Company", icon: BuildingOfficeIcon },
    { id: "billing", label: "Billing", icon: CreditCardIcon },
    { id: "notifications", label: "Notifications", icon: BellIcon },
    { id: "integrations", label: "Integrations", icon: KeyIcon },
    { id: "email", label: "Email Templates", icon: EnvelopeIcon },
  ]

  const handleSave = () => {
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#8b4513] dark:text-[#d4a574] mt-2">Settings</h1>
        <p className="text-sm text-[#b85e1a]/80 dark:text-gray-400">Manage company settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#d4a574]/30 dark:border-[#8b4513]/50">
        <nav className="flex space-x-8 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                    ? "border-[#2e8b57] text-[#2e8b57] dark:text-[#4a7c5c]"
                    : "border-transparent text-[#8b4513]/60 hover:text-[#b85e1a] hover:border-[#d4a574] dark:text-[#d4a574]/60 dark:hover:text-[#d88c4a] dark:hover:border-[#8b4513]"
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
        className="card p-6 border-[#d4a574]/30 dark:border-[#8b4513]/50"
        style={{ background: "var(--bg-primary)" }}
      >
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-[#2e8b57]/20 border border-[#2e8b57] rounded-lg flex items-center gap-2 text-[#2e8b57] dark:text-[#4a7c5c]"
          >
            <CheckCircleIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Settings saved successfully!</span>
          </motion.div>
        )}

        {activeTab === "company" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#8b4513] dark:text-[#d4a574]">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  defaultValue="Desert Landscaping Co."
                  className="w-full px-3 py-2 border border-[#d4a574] dark:border-[#8b4513] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:border-[#2e8b57] dark:focus:border-[#4a7c5c] focus:ring-1 focus:ring-[#2e8b57] dark:focus:ring-[#4a7c5c] outline-none transition-all"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-2">
                  Tax ID
                </label>
                <input
                  type="text"
                  defaultValue="12-3456789"
                  className="w-full px-3 py-2 border border-[#d4a574] dark:border-[#8b4513] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:border-[#2e8b57] dark:focus:border-[#4a7c5c] focus:ring-1 focus:ring-[#2e8b57] dark:focus:ring-[#4a7c5c] outline-none transition-all"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-2">
                  Service Categories
                </label>
                <select className="w-full px-3 py-2 border border-[#d4a574] dark:border-[#8b4513] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:border-[#2e8b57] dark:focus:border-[#4a7c5c] focus:ring-1 focus:ring-[#2e8b57] dark:focus:ring-[#4a7c5c] outline-none transition-all">
                  <option>Lawn Care, Tree Service, Irrigation, Landscaping, Hardscaping</option>
                  <option>Lawn Care, Tree Service, Irrigation</option>
                  <option>Landscaping, Hardscaping, Design</option>
                </select>
              </div>
              <div className="group">
                <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  defaultValue="8.0"
                  className="w-full px-3 py-2 border border-[#d4a574] dark:border-[#8b4513] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:border-[#2e8b57] dark:focus:border-[#4a7c5c] focus:ring-1 focus:ring-[#2e8b57] dark:focus:ring-[#4a7c5c] outline-none transition-all"
                />
              </div>
            </div>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-[#2e8b57] hover:bg-[#1f6b41] text-white rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#2e8b57]/20 transform hover:-translate-y-0.5"
            >
              Save Changes
            </button>
          </div>
        )}

        {activeTab === "billing" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#8b4513] dark:text-[#d4a574]">Billing Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-[#d4a574]/50 dark:border-[#8b4513]/50 rounded-lg hover:bg-[#f5f1e6] dark:hover:bg-gray-800/50 transition-all group">
                <div>
                  <p className="font-medium text-[#8b4513] dark:text-[#d4a574]">Payment Gateway</p>
                  <p className="text-sm text-[#b85e1a]/70 dark:text-gray-400">Stripe (Connected)</p>
                </div>
                <button className="px-4 py-2 border border-[#d4a574] dark:border-[#8b4513] rounded-lg text-sm hover:bg-[#f5f1e6] dark:hover:bg-gray-700 text-[#8b4513] dark:text-[#d4a574] transition-all hover:border-[#2e8b57] dark:hover:border-[#4a7c5c]">
                  Configure
                </button>
              </div>
              <div className="flex items-center justify-between p-4 border border-[#d4a574]/50 dark:border-[#8b4513]/50 rounded-lg hover:bg-[#f5f1e6] dark:hover:bg-gray-800/50 transition-all group">
                <div>
                  <p className="font-medium text-[#8b4513] dark:text-[#d4a574]">QuickBooks Integration</p>
                  <p className="text-sm text-[#b85e1a]/70 dark:text-gray-400">Not connected</p>
                </div>
                <button className="px-4 py-2 bg-[#2e8b57] hover:bg-[#1f6b41] text-white rounded-lg text-sm transition-all hover:shadow-lg hover:shadow-[#2e8b57]/20 transform hover:-translate-y-0.5">
                  Connect
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#8b4513] dark:text-[#d4a574]">Notification Settings</h2>
            <div className="space-y-4">
              {[
                { label: "Email notifications", checked: true },
                { label: "SMS notifications", checked: false },
                { label: "Payment reminders", checked: true },
                { label: "Job completion alerts", checked: true },
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between p-4 border border-[#d4a574]/50 dark:border-[#8b4513]/50 rounded-lg hover:bg-[#f5f1e6] dark:hover:bg-gray-800/50 transition-all group">
                  <label className="text-[#8b4513] dark:text-[#d4a574]">{setting.label}</label>
                  <input
                    type="checkbox"
                    defaultChecked={setting.checked}
                    className="w-4 h-4 text-[#2e8b57] bg-[#f5f1e6] dark:bg-gray-700 border-[#d4a574] dark:border-[#8b4513] rounded focus:ring-[#2e8b57] focus:ring-2"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "integrations" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#8b4513] dark:text-[#d4a574]">Integrations</h2>
            <div className="space-y-4">
              {[
                { name: "QuickBooks", status: "Not connected", action: "Connect" },
                { name: "Stripe", status: "Connected", action: "Configure" },
                { name: "Google Calendar", status: "Not connected", action: "Connect" },
              ].map((integration) => (
                <div key={integration.name} className="flex items-center justify-between p-4 border border-[#d4a574]/50 dark:border-[#8b4513]/50 rounded-lg hover:bg-[#f5f1e6] dark:hover:bg-gray-800/50 transition-all group">
                  <div>
                    <p className="font-medium text-[#8b4513] dark:text-[#d4a574]">{integration.name}</p>
                    <p className="text-sm text-[#b85e1a]/70 dark:text-gray-400">{integration.status}</p>
                  </div>
                  <button className={`px-4 py-2 rounded-lg text-sm transition-all ${integration.status === "Connected"
                      ? "border border-[#d4a574] dark:border-[#8b4513] hover:bg-[#f5f1e6] dark:hover:bg-gray-700 text-[#8b4513] dark:text-[#d4a574] hover:border-[#2e8b57] dark:hover:border-[#4a7c5c]"
                      : "bg-[#2e8b57] hover:bg-[#1f6b41] text-white hover:shadow-lg hover:shadow-[#2e8b57]/20 transform hover:-translate-y-0.5"
                    }`}>
                    {integration.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "email" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#8b4513] dark:text-[#d4a574]">Email Templates</h2>
            <div className="space-y-4">
              {[
                "Invoice Email",
                "Quote Email",
                "Payment Reminder",
                "Job Completion",
                "Welcome Email",
              ].map((template) => (
                <div key={template} className="flex items-center justify-between p-4 border border-[#d4a574]/50 dark:border-[#8b4513]/50 rounded-lg hover:bg-[#f5f1e6] dark:hover:bg-gray-800/50 transition-all group">
                  <span className="text-[#8b4513] dark:text-[#d4a574] font-medium">{template}</span>
                  <button className="px-4 py-2 border border-[#d4a574] dark:border-[#8b4513] rounded-lg text-sm hover:bg-[#f5f1e6] dark:hover:bg-gray-700 text-[#8b4513] dark:text-[#d4a574] transition-all hover:border-[#2e8b57] dark:hover:border-[#4a7c5c]">
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
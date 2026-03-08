/**
 * Client Preferences Component
 * 
 * Manages client communication preferences, marketing consent, and notification settings
 */

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  BellIcon,
  GlobeAltIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline"
import type { Client } from "@/src/domain/entities"

interface ClientPreferencesProps {
  client: Client
  onBack: () => void
}

const ClientPreferences = ({ client, onBack }: ClientPreferencesProps) => {
  const [preferences, setPreferences] = useState({
    preferredContactMethod: "email",
    marketingConsent: false,
    emailNotifications: true,
    smsNotifications: true,
    callReminders: true,
    newsletterSubscribed: true,
    specialOffers: false,
    preferredLanguage: "en",
    timezone: "America/Phoenix",
    doNotDisturb: {
      enabled: false,
      startTime: "20:00",
      endTime: "08:00",
    },
    notificationTypes: {
      jobUpdates: true,
      invoiceAlerts: true,
      paymentConfirmations: true,
      scheduleChanges: true,
      promotionalEmails: false,
    },
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const PreferenceSection = ({ 
    title, 
    icon: Icon, 
    children 
  }: { 
    title: string
    icon: any
    children: React.ReactNode 
  }) => (
    <div className="bg-[#f5f1e6] dark:bg-gray-800 p-6 rounded-lg border border-[#d4a574]/30">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-[#2e8b57]/10 rounded-lg">
          <Icon className="w-5 h-5 text-[#2e8b57]" />
        </div>
        <h3 className="text-lg font-semibold text-[#8b4513] dark:text-[#d4a574]">
          {title}
        </h3>
      </div>
      {children}
    </div>
  )

  const Toggle = ({ 
    label, 
    description, 
    enabled, 
    onChange 
  }: { 
    label: string
    description?: string
    enabled: boolean
    onChange: (value: boolean) => void
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-[#d4a574]/30 last:border-0">
      <div>
        <p className="text-sm font-medium text-[#8b4513] dark:text-[#d4a574]">{label}</p>
        {description && (
          <p className="text-xs text-[#b85e1a]/70 mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? "bg-[#2e8b57]" : "bg-gray-300 dark:bg-gray-600"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            enabled ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-[#d4a574]/20 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-[#8b4513] dark:text-[#d4a574]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#8b4513] dark:text-[#d4a574]">
            Preferences - {client.name}
          </h1>
          <p className="text-sm text-[#b85e1a]/80 dark:text-gray-400">
            Manage communication and notification settings
          </p>
        </div>
      </div>

      {/* Save Status */}
      <div className="flex items-center justify-end gap-3">
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-green-600"
          >
            <CheckCircleIcon className="w-5 h-5" />
            <span>Preferences saved!</span>
          </motion.div>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-[#2e8b57] text-white rounded-lg hover:bg-[#1f6b41] disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Preferences */}
        <PreferenceSection title="Contact Preferences" icon={EnvelopeIcon}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#8b4513] mb-2">
                Preferred Contact Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "email", label: "Email", icon: EnvelopeIcon },
                  { value: "phone", label: "Phone", icon: PhoneIcon },
                  { value: "sms", label: "SMS", icon: ChatBubbleLeftIcon },
                ].map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setPreferences(prev => ({ ...prev, preferredContactMethod: method.value as any }))}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      preferences.preferredContactMethod === method.value
                        ? "border-[#2e8b57] bg-[#2e8b57]/10 text-[#2e8b57]"
                        : "border-[#d4a574]/30 text-[#8b4513] hover:border-[#2e8b57]/50"
                    }`}
                  >
                    <method.icon className="w-5 h-5" />
                    <span className="text-sm">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Toggle
              label="Marketing Communications"
              description="Receive promotional emails and offers"
              enabled={preferences.marketingConsent}
              onChange={(val) => setPreferences(prev => ({ ...prev, marketingConsent: val }))}
            />

            <Toggle
              label="Newsletter Subscription"
              description="Monthly newsletter with tips and updates"
              enabled={preferences.newsletterSubscribed}
              onChange={(val) => setPreferences(prev => ({ ...prev, newsletterSubscribed: val }))}
            />

            <Toggle
              label="Special Offers"
              description="Receive notifications about special promotions"
              enabled={preferences.specialOffers}
              onChange={(val) => setPreferences(prev => ({ ...prev, specialOffers: val }))}
            />
          </div>
        </PreferenceSection>

        {/* Notification Settings */}
        <PreferenceSection title="Notification Settings" icon={BellIcon}>
          <div className="space-y-4">
            <Toggle
              label="Email Notifications"
              description="Receive notifications via email"
              enabled={preferences.emailNotifications}
              onChange={(val) => setPreferences(prev => ({ ...prev, emailNotifications: val }))}
            />

            <Toggle
              label="SMS Notifications"
              description="Receive text message alerts"
              enabled={preferences.smsNotifications}
              onChange={(val) => setPreferences(prev => ({ ...prev, smsNotifications: val }))}
            />

            <Toggle
              label="Call Reminders"
              description="Get reminder calls for appointments"
              enabled={preferences.callReminders}
              onChange={(val) => setPreferences(prev => ({ ...prev, callReminders: val }))}
            />

            <div className="pt-4 border-t border-[#d4a574]/30">
              <h4 className="text-sm font-medium text-[#8b4513] mb-3">Notification Types</h4>
              <div className="space-y-2">
                <Toggle
                  label="Job Updates"
                  enabled={preferences.notificationTypes.jobUpdates}
                  onChange={(val) => setPreferences(prev => ({
                    ...prev,
                    notificationTypes: { ...prev.notificationTypes, jobUpdates: val }
                  }))}
                />
                <Toggle
                  label="Invoice Alerts"
                  enabled={preferences.notificationTypes.invoiceAlerts}
                  onChange={(val) => setPreferences(prev => ({
                    ...prev,
                    notificationTypes: { ...prev.notificationTypes, invoiceAlerts: val }
                  }))}
                />
                <Toggle
                  label="Payment Confirmations"
                  enabled={preferences.notificationTypes.paymentConfirmations}
                  onChange={(val) => setPreferences(prev => ({
                    ...prev,
                    notificationTypes: { ...prev.notificationTypes, paymentConfirmations: val }
                  }))}
                />
                <Toggle
                  label="Schedule Changes"
                  enabled={preferences.notificationTypes.scheduleChanges}
                  onChange={(val) => setPreferences(prev => ({
                    ...prev,
                    notificationTypes: { ...prev.notificationTypes, scheduleChanges: val }
                  }))}
                />
              </div>
            </div>
          </div>
        </PreferenceSection>

        {/* Language & Region */}
        <PreferenceSection title="Language & Region" icon={GlobeAltIcon}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#8b4513] mb-2">
                Preferred Language
              </label>
              <select
                value={preferences.preferredLanguage}
                onChange={(e) => setPreferences(prev => ({ ...prev, preferredLanguage: e.target.value }))}
                className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-white dark:bg-gray-700 text-[#8b4513]"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="zh">Chinese</option>
                <option value="vi">Vietnamese</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8b4513] mb-2">
                Timezone
              </label>
              <select
                value={preferences.timezone}
                onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-white dark:bg-gray-700 text-[#8b4513]"
              >
                <option value="America/Phoenix">Arizona (MST)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/New_York">Eastern Time (ET)</option>
              </select>
            </div>
          </div>
        </PreferenceSection>

        {/* Do Not Disturb */}
        <PreferenceSection title="Do Not Disturb" icon={ClockIcon}>
          <div className="space-y-4">
            <Toggle
              label="Enable Do Not Disturb"
              description="Silence notifications during specified hours"
              enabled={preferences.doNotDisturb.enabled}
              onChange={(val) => setPreferences(prev => ({
                ...prev,
                doNotDisturb: { ...prev.doNotDisturb, enabled: val }
              }))}
            />

            {preferences.doNotDisturb.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="grid grid-cols-2 gap-4 pt-2"
              >
                <div>
                  <label className="block text-sm text-[#b85e1a] mb-1">Start Time</label>
                  <input
                    type="time"
                    value={preferences.doNotDisturb.startTime}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      doNotDisturb: { ...prev.doNotDisturb, startTime: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-white dark:bg-gray-700 text-[#8b4513]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#b85e1a] mb-1">End Time</label>
                  <input
                    type="time"
                    value={preferences.doNotDisturb.endTime}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      doNotDisturb: { ...prev.doNotDisturb, endTime: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-white dark:bg-gray-700 text-[#8b4513]"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </PreferenceSection>
      </div>

      {/* Current Preferences Summary */}
      <div className="bg-[#2e8b57]/5 p-6 rounded-lg border border-[#2e8b57]/30">
        <h3 className="text-lg font-semibold text-[#2e8b57] mb-4">Current Settings Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-[#b85e1a]">Contact Method</p>
            <p className="text-[#8b4513] capitalize">{preferences.preferredContactMethod}</p>
          </div>
          <div>
            <p className="text-xs text-[#b85e1a]">Marketing</p>
            <p className={preferences.marketingConsent ? "text-green-600" : "text-gray-500"}>
              {preferences.marketingConsent ? "Opted In" : "Opted Out"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#b85e1a]">Notifications</p>
            <p className="text-[#8b4513]">
              {Object.values(preferences.notificationTypes).filter(Boolean).length} active
            </p>
          </div>
          <div>
            <p className="text-xs text-[#b85e1a]">Language</p>
            <p className="text-[#8b4513] uppercase">{preferences.preferredLanguage}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientPreferences
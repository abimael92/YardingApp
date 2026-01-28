/**
 * Client Communication Component
 * 
 * Communication tools for client management (email/SMS templates, reminders)
 */

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline"
import FormModal from "@/src/shared/ui/FormModal"
import type { Client } from "@/src/domain/entities"
import { createCommunication } from "@/src/services/communicationService"
import { CommunicationType, CommunicationDirection } from "@/src/domain/entities"

interface ClientCommunicationProps {
  client: Client
  isOpen: boolean
  onClose: () => void
}

const ClientCommunication = ({ client, isOpen, onClose }: ClientCommunicationProps) => {
  const [communicationType, setCommunicationType] = useState<"email" | "sms">("email")
  const [template, setTemplate] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  const templates = {
    email: [
      {
        name: "Service Reminder",
        subject: "Upcoming Service Reminder",
        body: `Hi ${client.name},\n\nThis is a reminder that we have a scheduled service coming up. We'll be at your property soon.\n\nBest regards,\nYour Landscaping Team`,
      },
      {
        name: "Payment Reminder",
        subject: "Payment Reminder",
        body: `Hi ${client.name},\n\nThis is a friendly reminder about your outstanding balance. Please let us know if you have any questions.\n\nThank you,\nYour Landscaping Team`,
      },
      {
        name: "Service Follow-up",
        subject: "How was your service?",
        body: `Hi ${client.name},\n\nWe hope you're happy with our recent service. Please let us know if there's anything we can improve.\n\nBest regards,\nYour Landscaping Team`,
      },
    ],
    sms: [
      {
        name: "Service Reminder",
        body: `Hi ${client.name}, reminder: We have a service scheduled for your property. Reply STOP to opt out.`,
      },
      {
        name: "Payment Reminder",
        body: `Hi ${client.name}, friendly reminder about your outstanding balance. Reply HELP for assistance.`,
      },
    ],
  }

  const handleTemplateSelect = (templateName: string) => {
    const selected = templates[communicationType].find((t) => t.name === templateName)
    if (selected) {
      setTemplate(templateName)
      if ("subject" in selected && typeof selected.subject === "string") {
        setSubject(selected.subject)
      }
      setMessage(selected.body)
    }
  }

  const handleSend = async () => {
    if (!message.trim()) {
      alert("Please enter a message")
      return
    }

    setIsSending(true)
    try {
      await createCommunication({
        clientId: client.id,
        type: communicationType === "email" ? CommunicationType.EMAIL : CommunicationType.SMS,
        direction: CommunicationDirection.OUTBOUND,
        subject: communicationType === "email" ? subject : undefined,
        content: message,
        status: "sent",
      })
      alert("Message sent successfully!")
      setMessage("")
      setSubject("")
      setTemplate("")
      onClose()
    } catch (error) {
      console.error("Failed to send message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Contact ${client.name}`}
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending || !message.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Communication Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Communication Type
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setCommunicationType("email")
                setTemplate("")
                setSubject("")
                setMessage("")
              }}
              className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                communicationType === "email"
                  ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400"
                  : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              }`}
            >
              <EnvelopeIcon className="w-5 h-5 inline mr-2" />
              Email
            </button>
            <button
              type="button"
              onClick={() => {
                setCommunicationType("sms")
                setTemplate("")
                setSubject("")
                setMessage("")
              }}
              className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                communicationType === "sms"
                  ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400"
                  : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              }`}
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 inline mr-2" />
              SMS
            </button>
          </div>
        </div>

        {/* Templates */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Templates
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {templates[communicationType].map((t) => (
              <button
                key={t.name}
                type="button"
                onClick={() => handleTemplateSelect(t.name)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors text-left ${
                  template === t.name
                    ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                    : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Subject (Email only) */}
        {communicationType === "email" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Email subject"
            />
          </div>
        )}

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Message *
          </label>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter your message here..."
          />
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {communicationType === "sms" && "SMS messages are limited to 160 characters"}
          </div>
        </div>
      </div>
    </FormModal>
  )
}

export default ClientCommunication

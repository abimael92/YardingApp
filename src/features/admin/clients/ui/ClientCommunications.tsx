/**
 * Client Communications Component
 * 
 * Manages all client communications including emails, calls, SMS, and follow-ups
 */

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PaperAirplaneIcon,
  PlusIcon,
  ClockIcon,
  UserIcon,
} from "@heroicons/react/24/outline"
import { formatDate, formatRelativeTime } from "@/src/features/admin/utils/formatters"
import type { Client } from "@/src/domain/entities"

interface Communication {
  id: string
  type: "email" | "sms" | "call" | "in_person"
  direction: "incoming" | "outgoing"
  subject?: string
  content: string
  sentAt: Date
  sentBy?: string
  status: "sent" | "delivered" | "read" | "failed"
  requiresResponse: boolean
  respondedAt?: Date
  attachments?: Array<{ name: string; url: string }>
}

interface ClientCommunicationsProps {
  client: Client
  communications: Communication[]
  onBack: () => void
}

const ClientCommunications = ({ client, communications: initialComms, onBack }: ClientCommunicationsProps) => {
  const [communications, setCommunications] = useState<Communication[]>(initialComms)
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [messageType, setMessageType] = useState<"email" | "sms">("email")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [filter, setFilter] = useState<"all" | "email" | "sms" | "call">("all")
  const [dateRange, setDateRange] = useState<"week" | "month" | "all">("all")

  const stats = {
    total: communications.length,
    emails: communications.filter(c => c.type === "email").length,
    sms: communications.filter(c => c.type === "sms").length,
    calls: communications.filter(c => c.type === "call").length,
    unread: communications.filter(c => c.status === "sent" && c.direction === "incoming").length,
    pendingResponse: communications.filter(c => c.requiresResponse && !c.respondedAt).length,
  }

  const filteredCommunications = communications
    .filter(c => filter === "all" || c.type === filter)
    .filter(c => {
      if (dateRange === "week") {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(c.sentAt) >= weekAgo
      }
      if (dateRange === "month") {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return new Date(c.sentAt) >= monthAgo
      }
      return true
    })
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())

  const handleSendMessage = () => {
    const newMessage: Communication = {
      id: Date.now().toString(),
      type: messageType,
      direction: "outgoing",
      subject: messageType === "email" ? subject : undefined,
      content,
      sentAt: new Date(),
      sentBy: "Current User",
      status: "sent",
      requiresResponse: false,
    }
    setCommunications([newMessage, ...communications])
    setShowNewMessage(false)
    setSubject("")
    setContent("")
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email": return <EnvelopeIcon className="w-5 h-5" />
      case "sms": return <ChatBubbleLeftIcon className="w-5 h-5" />
      case "call": return <PhoneIcon className="w-5 h-5" />
      default: return <ChatBubbleLeftIcon className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent": return "text-blue-500"
      case "delivered": return "text-green-500"
      case "read": return "text-purple-500"
      case "failed": return "text-red-500"
      default: return "text-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent": return <PaperAirplaneIcon className="w-4 h-4" />
      case "delivered": return <CheckCircleIcon className="w-4 h-4" />
      case "read": return <CheckCircleIcon className="w-4 h-4" />
      case "failed": return <XCircleIcon className="w-4 h-4" />
      default: return null
    }
  }

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
            Communications - {client.name}
          </h1>
          <p className="text-sm text-[#b85e1a]/80 dark:text-gray-400">
            Manage all client interactions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#2e8b57]/10 p-4 rounded-lg border border-[#2e8b57]/30">
          <div className="text-sm text-[#2e8b57] mb-1">Total</div>
          <div className="text-2xl font-bold text-[#2e8b57]">{stats.total}</div>
        </div>
        <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
          <div className="text-sm text-blue-600 mb-1">Emails</div>
          <div className="text-2xl font-bold text-blue-600">{stats.emails}</div>
        </div>
        <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
          <div className="text-sm text-green-600 mb-1">SMS</div>
          <div className="text-2xl font-bold text-green-600">{stats.sms}</div>
        </div>
        <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/30">
          <div className="text-sm text-purple-600 mb-1">Calls</div>
          <div className="text-2xl font-bold text-purple-600">{stats.calls}</div>
        </div>
        <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
          <div className="text-sm text-yellow-600 mb-1">Need Response</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pendingResponse}</div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewMessage(true)}
            className="px-4 py-2 bg-[#2e8b57] text-white rounded-lg hover:bg-[#1f6b41] flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            New Message
          </button>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-[#d4a574] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513]"
          >
            <option value="all">All Types</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="call">Calls</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-2 border border-[#d4a574] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513]"
          >
            <option value="all">All Time</option>
            <option value="month">Last 30 Days</option>
            <option value="week">Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* New Message Modal */}
      <AnimatePresence>
        {showNewMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#f5f1e6] dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full"
            >
              <h2 className="text-xl font-bold text-[#8b4513] dark:text-[#d4a574] mb-4">
                New Message
              </h2>

              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setMessageType("email")}
                  className={`flex-1 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                    messageType === "email"
                      ? "border-[#2e8b57] bg-[#2e8b57]/10 text-[#2e8b57]"
                      : "border-[#d4a574]/30 text-[#8b4513]"
                  }`}
                >
                  <EnvelopeIcon className="w-5 h-5" />
                  Email
                </button>
                <button
                  onClick={() => setMessageType("sms")}
                  className={`flex-1 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                    messageType === "sms"
                      ? "border-[#2e8b57] bg-[#2e8b57]/10 text-[#2e8b57]"
                      : "border-[#d4a574]/30 text-[#8b4513]"
                  }`}
                >
                  <ChatBubbleLeftIcon className="w-5 h-5" />
                  SMS
                </button>
              </div>

              {messageType === "email" && (
                <input
                  type="text"
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 mb-4 border border-[#d4a574] rounded-lg bg-white dark:bg-gray-700 text-[#8b4513] dark:text-[#d4a574]"
                />
              )}

              <textarea
                placeholder={messageType === "email" ? "Write your email..." : "Type your SMS message..."}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 mb-4 border border-[#d4a574] rounded-lg bg-white dark:bg-gray-700 text-[#8b4513] dark:text-[#d4a574]"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowNewMessage(false)}
                  className="px-4 py-2 text-[#8b4513] hover:bg-[#d4a574]/20 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!content.trim()}
                  className="px-4 py-2 bg-[#2e8b57] text-white rounded-lg hover:bg-[#1f6b41] disabled:opacity-50"
                >
                  Send Message
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Communications List */}
      <div className="space-y-4">
        {filteredCommunications.length === 0 ? (
          <div className="text-center py-12 bg-[#f5f1e6] dark:bg-gray-800 rounded-lg border border-[#d4a574]/30">
            <ChatBubbleLeftIcon className="w-12 h-12 mx-auto text-[#b85e1a]/40 mb-3" />
            <h3 className="text-lg font-medium text-[#8b4513] dark:text-[#d4a574]">
              No communications yet
            </h3>
            <p className="text-sm text-[#b85e1a]/70 mt-1">
              Start a conversation with {client.name}
            </p>
          </div>
        ) : (
          filteredCommunications.map((comm) => (
            <motion.div
              key={comm.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${
                comm.direction === "incoming"
                  ? "bg-blue-500/5 border-blue-500/30 ml-0 md:ml-12"
                  : "bg-[#2e8b57]/5 border-[#2e8b57]/30 mr-0 md:mr-12"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  comm.direction === "incoming" ? "bg-blue-500/10" : "bg-[#2e8b57]/10"
                }`}>
                  {getTypeIcon(comm.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#8b4513] dark:text-[#d4a574]">
                        {comm.direction === "incoming" ? client.name : "You"}
                      </span>
                      <span className="text-sm text-[#b85e1a]/70">
                        {formatRelativeTime(comm.sentAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {comm.requiresResponse && !comm.respondedAt && (
                        <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-600 rounded-full">
                          Response Needed
                        </span>
                      )}
                      <span className={`flex items-center gap-1 text-sm ${getStatusColor(comm.status)}`}>
                        {getStatusIcon(comm.status)}
                        {comm.status}
                      </span>
                    </div>
                  </div>
                  
                  {comm.subject && (
                    <h4 className="text-[#8b4513] dark:text-[#d4a574] font-medium mb-1">
                      {comm.subject}
                    </h4>
                  )}
                  
                  <p className="text-[#8b4513] dark:text-[#d4a574] whitespace-pre-wrap">
                    {comm.content}
                  </p>
                  
                  {comm.attachments && comm.attachments.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {comm.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 text-sm bg-[#d4a574]/20 text-[#8b4513] rounded-lg hover:bg-[#d4a574]/30"
                        >
                          {att.name}
                        </a>
                      ))}
                    </div>
                  )}
                  
                  {comm.respondedAt && (
                    <div className="mt-2 text-sm text-[#b85e1a]/70 flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      Responded {formatRelativeTime(comm.respondedAt)}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

export default ClientCommunications
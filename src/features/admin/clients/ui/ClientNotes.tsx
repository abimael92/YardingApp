/**
 * Client Notes Component
 * 
 * Manages internal notes and comments about clients
 */

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  ClockIcon,
  PaperClipIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline"
import { formatRelativeTime } from "@/src/features/admin/utils/formatters"
import type { Client } from "@/src/domain/entities"

export interface Note {
  id: string
  content: string
  createdBy: string
  createdAt: Date
  updatedAt?: Date
  category: "general" | "issue" | "followup" | "feedback" | "internal"
  priority?: "low" | "medium" | "high"
  attachments?: Array<{ name: string; url: string }>
  isPrivate: boolean
  isArchived: boolean
}

interface ClientNotesProps {
  client: Client
  notes: Note[]
  onBack: () => void
  onUpdate: () => void
}

const ClientNotes = ({ client, notes: initialNotes, onBack, onUpdate }: ClientNotesProps) => {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [filter, setFilter] = useState<"all" | "general" | "issue" | "followup" | "feedback">("all")
  const [showPrivate, setShowPrivate] = useState(false)

  const stats = {
    total: notes.length,
    general: notes.filter(n => n.category === "general").length,
    issues: notes.filter(n => n.category === "issue").length,
    followups: notes.filter(n => n.category === "followup").length,
    feedback: notes.filter(n => n.category === "feedback").length,
    highPriority: notes.filter(n => n.priority === "high").length,
  }

  const filteredNotes = notes
    .filter(n => filter === "all" || n.category === filter)
    .filter(n => showPrivate || !n.isPrivate)
    .filter(n => !n.isArchived)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const handleAddNote = (newNote: Omit<Note, "id" | "createdAt">) => {
    const note: Note = {
      ...newNote,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setNotes([note, ...notes])
    setShowForm(false)
    onUpdate()
  }

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes(notes.map(n => n.id === updatedNote.id ? updatedNote : n))
    setEditingNote(null)
    onUpdate()
  }

  const handleDeleteNote = (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      setNotes(notes.filter(n => n.id !== id))
      onUpdate()
    }
  }

  const handleArchiveNote = (id: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, isArchived: true } : n))
    onUpdate()
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "general": return "bg-blue-500/20 text-blue-600"
      case "issue": return "bg-red-500/20 text-red-600"
      case "followup": return "bg-yellow-500/20 text-yellow-600"
      case "feedback": return "bg-purple-500/20 text-purple-600"
      case "internal": return "bg-gray-500/20 text-gray-600"
      default: return "bg-gray-500/20 text-gray-600"
    }
  }

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case "high": return <span className="text-red-500">🔴</span>
      case "medium": return <span className="text-yellow-500">🟡</span>
      case "low": return <span className="text-green-500">🟢</span>
      default: return null
    }
  }

  const NoteCard = ({ note }: { note: Note }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#f5f1e6] dark:bg-gray-800 p-6 rounded-lg border ${
        note.isPrivate 
          ? "border-purple-500/30 bg-purple-500/5" 
          : "border-[#d4a574]/30"
      } hover:shadow-lg transition-shadow`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getCategoryColor(note.category)}`}>
            {note.category === "issue" ? "⚠️" : 
             note.category === "followup" ? "📅" :
             note.category === "feedback" ? "💬" : "📝"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(note.category)}`}>
                {note.category}
              </span>
              {note.priority && (
                <span className="flex items-center gap-1">
                  {getPriorityIcon(note.priority)}
                  <span className="text-xs text-[#b85e1a]/70 capitalize">{note.priority}</span>
                </span>
              )}
              {note.isPrivate && (
                <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-600 rounded-full">
                  Private
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEditingNote(note)}
            className="p-2 text-[#b85e1a] hover:text-[#2e8b57] transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleArchiveNote(note.id)}
            className="p-2 text-[#b85e1a] hover:text-[#2e8b57] transition-colors"
            title="Archive"
          >
            <CheckCircleIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteNote(note.id)}
            className="p-2 text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-[#8b4513] dark:text-[#d4a574] whitespace-pre-wrap mb-4">
        {note.content}
      </p>

      {note.attachments && note.attachments.length > 0 && (
        <div className="mb-4 flex gap-2">
          {note.attachments.map((att, idx) => (
            <a
              key={idx}
              href={att.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 text-sm bg-[#d4a574]/20 text-[#8b4513] rounded-lg hover:bg-[#d4a574]/30"
            >
              <PaperClipIcon className="w-3 h-3" />
              {att.name}
            </a>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-[#b85e1a]/70 border-t border-[#d4a574]/30 pt-3">
        <div className="flex items-center gap-2">
          <UserIcon className="w-3 h-3" />
          <span>{note.createdBy}</span>
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="w-3 h-3" />
          <span>{formatRelativeTime(note.createdAt)}</span>
          {note.updatedAt && <span>(edited)</span>}
        </div>
      </div>
    </motion.div>
  )

  const NoteForm = ({ 
    note, 
    onSave, 
    onCancel 
  }: { 
    note?: Note | null
    onSave: (note: Omit<Note, "id" | "createdAt">) => void
    onCancel: () => void
  }) => {
    const [formData, setFormData] = useState({
      content: note?.content || "",
      category: note?.category || "general" as Note["category"],
      priority: note?.priority || "medium" as Note["priority"],
      isPrivate: note?.isPrivate || false,
      createdBy: note?.createdBy || "Current User",
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (!formData.content.trim()) return
      onSave(formData)
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#8b4513] mb-2">
            Note Category
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {["general", "issue", "followup", "feedback", "internal"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category: cat as Note["category"] }))}
                className={`px-3 py-2 rounded-lg border-2 text-sm capitalize transition-all ${
                  formData.category === cat
                    ? "border-[#2e8b57] bg-[#2e8b57]/10 text-[#2e8b57]"
                    : "border-[#d4a574]/30 text-[#8b4513] hover:border-[#2e8b57]/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#8b4513] mb-2">
            Priority
          </label>
          <div className="flex gap-2">
            {["low", "medium", "high"].map((priority) => (
              <button
                key={priority}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, priority: priority as Note["priority"] }))}
                className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm capitalize transition-all ${
                  formData.priority === priority
                    ? priority === "high" ? "border-red-500 bg-red-500/10 text-red-600"
                    : priority === "medium" ? "border-yellow-500 bg-yellow-500/10 text-yellow-600"
                    : "border-green-500 bg-green-500/10 text-green-600"
                    : "border-[#d4a574]/30 text-[#8b4513] hover:border-[#2e8b57]/50"
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#8b4513] mb-2">
            Note Content
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={5}
            required
            className="w-full px-4 py-2 border border-[#d4a574] rounded-lg bg-white dark:bg-gray-700 text-[#8b4513]"
            placeholder="Write your note here..."
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isPrivate}
              onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
              className="w-4 h-4 text-[#2e8b57] rounded"
            />
            <span className="text-sm text-[#8b4513]">Private note (internal only)</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-[#8b4513] hover:bg-[#d4a574]/20 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#2e8b57] text-white rounded-lg hover:bg-[#1f6b41]"
          >
            {note ? "Update Note" : "Add Note"}
          </button>
        </div>
      </form>
    )
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
            Notes - {client.name}
          </h1>
          <p className="text-sm text-[#b85e1a]/80 dark:text-gray-400">
            Internal notes and observations
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
          <div className="text-sm text-blue-600 mb-1">General</div>
          <div className="text-2xl font-bold text-blue-600">{stats.general}</div>
        </div>
        <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/30">
          <div className="text-sm text-red-600 mb-1">Issues</div>
          <div className="text-2xl font-bold text-red-600">{stats.issues}</div>
        </div>
        <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
          <div className="text-sm text-yellow-600 mb-1">Follow-ups</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.followups}</div>
        </div>
        <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/30">
          <div className="text-sm text-purple-600 mb-1">High Priority</div>
          <div className="text-2xl font-bold text-purple-600">{stats.highPriority}</div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-[#2e8b57] text-white rounded-lg hover:bg-[#1f6b41] flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add Note
          </button>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-[#d4a574] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513]"
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="issue">Issues</option>
            <option value="followup">Follow-ups</option>
            <option value="feedback">Feedback</option>
            <option value="internal">Internal</option>
          </select>
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showPrivate}
            onChange={(e) => setShowPrivate(e.target.checked)}
            className="w-4 h-4 text-[#2e8b57] rounded"
          />
          <span className="text-sm text-[#8b4513]">Show private notes</span>
        </label>
      </div>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12 bg-[#f5f1e6] dark:bg-gray-800 rounded-lg border border-[#d4a574]/30">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="text-lg font-medium text-[#8b4513] dark:text-[#d4a574]">
            No notes yet
          </h3>
          <p className="text-sm text-[#b85e1a]/70 mt-1">
            Add your first note about {client.name}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredNotes.map(note => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showForm || editingNote) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#f5f1e6] dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-bold text-[#8b4513] dark:text-[#d4a574] mb-4">
                {editingNote ? "Edit Note" : "Add New Note"}
              </h2>
              
              <NoteForm
                note={editingNote}
                onSave={(data) => {
                  if (editingNote) {
                    handleUpdateNote({ ...editingNote, ...data, updatedAt: new Date() })
                  } else {
                    handleAddNote(data)
                  }
                }}
                onCancel={() => {
                  setShowForm(false)
                  setEditingNote(null)
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ClientNotes
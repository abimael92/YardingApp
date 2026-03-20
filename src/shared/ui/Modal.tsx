"use client"

import React, { useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/src/lib/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
}

export const Modal = ({ isOpen, onClose, children, size = "lg" }: ModalProps) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = "unset"
    return () => { document.body.style.overflow = "unset" }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={cn(
          "relative bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full flex flex-col max-h-[90vh] border border-[#d4a574]/30 overflow-hidden",
          sizeClasses[size]
        )}
      >
        {children}
      </motion.div>
    </div>,
    document.body
  )
}

Modal.Header = ({ title, subtitle, icon, progress }: { title: string; subtitle?: string; icon?: React.ReactNode; progress?: number }) => (
  <div className="p-8 border-b border-[#d4a574]/10 bg-white dark:bg-gray-900 flex-none z-10">
    <div className="flex items-center gap-5 mb-6">
      <div className="w-14 h-14 rounded-2xl bg-[#2e8b57] flex items-center justify-center text-white font-bold text-2xl shadow-inner shrink-0">
        {icon || "+"}
      </div>
      <div className="min-w-0">
        <h2 className="text-2xl font-black text-[#5d4037] dark:text-[#d4a574] leading-tight tracking-tight truncate">{title}</h2>
        {subtitle && <p className="text-sm font-medium text-[#b85e1a]/70 dark:text-gray-400 truncate">{subtitle}</p>}
      </div>
    </div>
    {progress !== undefined && (
      <div className="space-y-3">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-[#b85e1a]">
          <span>Onboarding Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-2.5 bg-[#f5f1e6] dark:bg-gray-800 rounded-full overflow-hidden border border-[#d4a574]/20">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="h-full bg-gradient-to-r from-[#2e8b57] to-[#1f6b41]"
          />
        </div>
      </div>
    )}
  </div>
)

Modal.Body = ({ children }: { children: React.ReactNode }) => (
  <div className="flex-1 overflow-y-auto p-8 bg-[#fdfbf7] dark:bg-gray-950/20 custom-scrollbar">
    {children}
  </div>
)

Modal.Footer = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 border-t border-[#d4a574]/10 bg-white dark:bg-gray-900 flex justify-end items-center gap-4 flex-none z-10">
    {children}
  </div>
)
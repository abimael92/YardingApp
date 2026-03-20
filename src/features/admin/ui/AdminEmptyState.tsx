"use client"

import React from "react"
import EmptyState from "@/src/shared/ui/EmptyState"
import { Button } from "@/src/shared/ui/Button"

export interface AdminEmptyStateProps {
  title: string
  message?: string
  actionLabel?: string
  onAction?: () => void
}

export function AdminEmptyState({ title, message, actionLabel, onAction }: AdminEmptyStateProps) {
  return (
    <EmptyState
      title={title}
      message={message}
      actionLabel={actionLabel}
      onAction={onAction}
    />
  )
}

/** Primary action button for empty states (earthy) */
export function AdminEmptyStateAction({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <Button
      variant="primary"
      onClick={onClick}
      className="bg-[#2e8b57] hover:bg-[#1f6b41] text-white"
    >
      {children}
    </Button>
  )
}

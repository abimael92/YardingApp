"use client"

import React, { useState, useEffect } from "react"
import { Modal } from "@/src/shared/ui/Modal"
import { StatusBadge } from "@/src/shared/ui/StatusBadge"
import { Button } from "@/src/shared/ui/Button"
import {
    TrashIcon,
    PencilIcon,
    UserPlusIcon,
    BriefcaseIcon,
    UsersIcon,
    XMarkIcon
} from "@heroicons/react/24/outline"
import { cn } from "@/src/lib/utils"
import Link from "next/link"

interface CrewDetailModalInnerProps {
    crewId: string
    onClose: () => void
    onEdit: (crewData: any) => void
    onRefresh: () => void
}

export const CrewDetailModalInner = ({
    crewId,
    onClose,
    onEdit,
    onRefresh
}: CrewDetailModalInnerProps) => {
    const [crew, setCrew] = useState<any>(null)
    const [activeTab, setActiveTab] = useState<'members' | 'jobs'>('members')
    const [isLoading, setIsLoading] = useState(true)

    const fetchCrewDetails = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/crews/${crewId}`)
            if (res.ok) {
                const data = await res.json()
                setCrew(data)
            }
        } catch (error) {
            console.error("Failed to fetch crew details:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (crewId) fetchCrewDetails()
    }, [crewId])

    const handleRemoveMember = async (employeeId: string) => {
        if (!confirm("Remove this member from the crew?")) return

        try {
            const res = await fetch(`/api/crews/${crewId}/members?employeeId=${employeeId}`, {
                method: "DELETE"
            })
            if (res.ok) {
                fetchCrewDetails()
                onRefresh()
            }
        } catch (error) {
            console.error("Error removing member:", error)
        }
    }

    if (isLoading) {
        return (
            <div className="p-20 flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2e8b57]"></div>
                <p className="text-[#8b4513] font-medium">Loading Crew Details...</p>
            </div>
        )
    }

    if (!crew) return <div className="p-10 text-center">Crew not found.</div>

    return (
        <>
            <Modal.Header
                title={crew.name}
                subtitle={crew.description || "Active Landscaping Crew"}
                icon={crew.name.substring(0, 2).toUpperCase()}
            />

            <Modal.Body className="p-0"> {/* Remove padding for custom tab look */}
                {/* Navigation Tabs */}
                <div className="flex border-b border-[#d4a574]/20 bg-white sticky top-0 z-20">
                    <button
                        onClick={() => setActiveTab('members')}
                        className={cn(
                            "flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all",
                            activeTab === 'members'
                                ? "border-b-2 border-[#2e8b57] text-[#2e8b57] bg-[#2e8b57]/5"
                                : "text-gray-400 hover:text-[#8b4513]"
                        )}
                    >
                        <UsersIcon className="w-4 h-4" />
                        Members ({crew.members?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('jobs')}
                        className={cn(
                            "flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all",
                            activeTab === 'jobs'
                                ? "border-b-2 border-[#2e8b57] text-[#2e8b57] bg-[#2e8b57]/5"
                                : "text-gray-400 hover:text-[#8b4513]"
                        )}
                    >
                        <BriefcaseIcon className="w-4 h-4" />
                        Assigned Jobs ({crew.jobs?.length || 0})
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'members' ? (
                        <div className="space-y-3">
                            {crew.members?.length > 0 ? (
                                crew.members.map((m: any) => (
                                    <div
                                        key={m.id}
                                        className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#d4a574]/10 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f5f1e6] to-[#d4a574]/30 flex items-center justify-center text-xs font-black text-[#8b4513]">
                                                {m.employeeName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#8b4513]">{m.employeeName}</p>
                                                <p className="text-[10px] uppercase tracking-widest font-black text-[#2e8b57]">
                                                    {m.role || 'Worker'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveMember(m.employeeId)}
                                            className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Remove Member"
                                        >
                                            <XMarkIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 bg-[#f5f1e6]/30 rounded-2xl border-2 border-dashed border-[#d4a574]/20">
                                    <p className="text-sm text-[#b85e1a]">No members assigned to this crew.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {crew.jobs?.length > 0 ? (
                                crew.jobs.map((j: any) => (
                                    <Link
                                        key={j.id}
                                        href={`/admin/jobs/${j.jobId}`}
                                        className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#d4a574]/10 hover:border-[#2e8b57] transition-all group"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-mono font-bold text-[#b85e1a]">{j.jobNumber}</span>
                                            <span className="font-bold text-[#8b4513] group-hover:text-[#2e8b57]">{j.jobTitle}</span>
                                        </div>
                                        <StatusBadge type="job" value={j.status} />
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-400 text-sm italic">
                                    No active jobs currently scheduled.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Modal.Body>

            <Modal.Footer>
                <div className="flex w-full items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => onEdit(crew)}
                        className="text-[#b85e1a] font-bold flex items-center gap-2"
                    >
                        <PencilIcon className="w-4 h-4" />
                        Edit Crew Details
                    </Button>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700"
                        >
                            Close
                        </button>
                        <Button
                            onClick={() => {/* Trigger Add Member Modal */ }}
                            className="bg-[#2e8b57] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2"
                        >
                            <UserPlusIcon className="w-4 h-4" />
                            Add Member
                        </Button>
                    </div>
                </div>
            </Modal.Footer>
        </>
    )
}
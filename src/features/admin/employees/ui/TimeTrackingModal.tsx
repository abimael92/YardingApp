"use client"

import { useState, useEffect } from "react"
import FormModal from "@/src/shared/ui/FormModal"
import { getEmployeeAssignments } from "@/src/services/userService"
import { startTimeEntry, endTimeEntry, getTimeEntries } from "@/src/services/timeTrackingService"
import type { JobAssignment } from "@/src/domain/models"

interface TimeTrackingModalProps {
    isOpen: boolean
    onClose: () => void
    employeeId: string
    employeeName: string
}

interface TimeEntry {
    id: string
    jobId: string
    jobNumber: string
    jobTitle: string
    startTime: string
    endTime: string | null
    duration: number | null
}

const TimeTrackingModal = ({ isOpen, onClose, employeeId, employeeName }: TimeTrackingModalProps) => {
    const [assignments, setAssignments] = useState<JobAssignment[]>([])
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
    const [selectedJobId, setSelectedJobId] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null)

    useEffect(() => {
        if (isOpen) {
            loadData()
        }
    }, [isOpen])

    const loadData = async () => {
        setIsLoading(true)
        try {
            const [userAssignments, entries] = await Promise.all([
                getEmployeeAssignments(employeeId),
                getTimeEntries(employeeId)
            ])
            setAssignments(userAssignments)
            setTimeEntries(entries as TimeEntry[])

            // Check if there's an active time entry
            const active = entries.find(e => e.endTime === null)
            setActiveEntry((active as TimeEntry) || null)
            if (active) {
                setSelectedJobId(active.jobId)
            }
        } catch (error) {
            console.error("Failed to load time tracking data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleClockIn = async () => {
        if (!selectedJobId) {
            alert("Please select a job")
            return
        }

        setIsSubmitting(true)
        try {
            await startTimeEntry({
                employeeId,
                jobId: selectedJobId,
                startTime: new Date().toISOString()
            })
            await loadData()
        } catch (error) {
            console.error("Failed to clock in:", error)
            alert("Failed to start time tracking")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClockOut = async () => {
        if (!activeEntry) return

        setIsSubmitting(true)
        try {
            await endTimeEntry(activeEntry.id, new Date().toISOString())
            await loadData()
        } catch (error) {
            console.error("Failed to clock out:", error)
            alert("Failed to end time tracking")
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours}h ${mins}m`
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString()
    }

    return (
        <FormModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Time Tracking - ${employeeName}`}
            size="lg"
        >
            <div className="space-y-6">
                {isLoading ? (
                    <div className="text-center py-8">Loading time tracking data...</div>
                ) : (
                    <>
                        {/* Current Time Entry Section */}
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <h3 className="text-lg font-medium mb-4">Current Time Entry</h3>

                            {activeEntry ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-medium">{activeEntry.jobNumber} - {activeEntry.jobTitle}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                Started: {formatDate(activeEntry.startTime)}
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleClockOut}
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {isSubmitting ? "Processing..." : "Clock Out"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Select Job to Clock In
                                        </label>
                                        <select
                                            value={selectedJobId}
                                            onChange={(e) => setSelectedJobId(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="">-- Select a job --</option>
                                            {assignments.map((a) => (
                                                <option key={a.jobId} value={a.jobId}>
                                                    {a.jobNumber} - {a.jobTitle}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        onClick={handleClockIn}
                                        disabled={isSubmitting || !selectedJobId}
                                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Processing..." : "Clock In"}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Recent Time Entries */}
                        <div>
                            <h3 className="text-lg font-medium mb-4">Recent Time Entries</h3>
                            {timeEntries.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No time entries found</p>
                            ) : (
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {timeEntries.slice(0, 10).map((entry) => (
                                        <div
                                            key={entry.id}
                                            className="border dark:border-gray-700 rounded-lg p-3"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium">{entry.jobNumber} - {entry.jobTitle}</div>
                                                    <div className="text-xs text-gray-500">
                                                        Started: {formatDate(entry.startTime)}
                                                    </div>
                                                    {entry.endTime && (
                                                        <div className="text-xs text-gray-500">
                                                            Ended: {formatDate(entry.endTime)}
                                                        </div>
                                                    )}
                                                </div>
                                                {entry.duration && (
                                                    <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                        {formatDuration(entry.duration)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                <div className="flex justify-end pt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        </FormModal>
    )
}

export default TimeTrackingModal
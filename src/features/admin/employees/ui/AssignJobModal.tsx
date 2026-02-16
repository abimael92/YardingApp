"use client"

import { useState, useEffect } from "react"
import FormModal from "@/src/shared/ui/FormModal"
import { getJobs } from "@/src/services/jobService"
import { assignEmployeeToJob } from "@/src/services/assignmentService"
import type { Job } from "@/src/domain/entities"

interface AssignJobModalProps {
    isOpen: boolean
    onClose: () => void
    employeeId: string
    employeeName: string
    onSuccess: () => void
}

const AssignJobModal = ({ isOpen, onClose, employeeId, employeeName, onSuccess }: AssignJobModalProps) => {
    const [jobs, setJobs] = useState<Job[]>([])
    const [selectedJobId, setSelectedJobId] = useState("")
    const [role, setRole] = useState<"lead" | "helper" | "specialist">("helper")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (isOpen) {
            loadJobs()
        }
    }, [isOpen])

    const loadJobs = async () => {
        setIsLoading(true)
        try {
            const allJobs = await getJobs()
            // Filter to jobs that are not completed
            const availableJobs = allJobs.filter(j => j.status !== "completed" && j.status !== "cancelled")
            setJobs(availableJobs)
        } catch (error) {
            console.error("Failed to load jobs:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedJobId) {
            alert("Please select a job")
            return
        }

        setIsSubmitting(true)
        try {
            await assignEmployeeToJob({
                employeeId,
                jobId: selectedJobId,
                role,
                assignedAt: new Date().toISOString(),
            })
            onSuccess()
            onClose()
        } catch (error) {
            console.error("Failed to assign employee:", error)
            alert("Failed to assign employee to job")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <FormModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Assign ${employeeName} to Job`}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {isLoading ? (
                    <div className="text-center py-8">Loading jobs...</div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No available jobs to assign</div>
                ) : (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Select Job *
                            </label>
                            <select
                                required
                                value={selectedJobId}
                                onChange={(e) => setSelectedJobId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="">-- Select a job --</option>
                                {jobs.map((job) => (
                                    <option key={job.id} value={job.id}>
                                        {job.jobNumber} - {job.title} ({job.status})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Role on Job
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as "lead" | "helper" | "specialist")}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="helper">Helper</option>
                                <option value="lead">Lead</option>
                                <option value="specialist">Specialist</option>
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !selectedJobId}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSubmitting ? "Assigning..." : "Assign to Job"}
                            </button>
                        </div>
                    </>
                )}
            </form>
        </FormModal>
    )
}

export default AssignJobModal
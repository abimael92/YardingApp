/**
 * Job Details Page
 * 
 * Displays detailed information about a specific job including:
 * - Job overview (status, dates, value)
 * - Client information
 * - Assigned crew and equipment
 * - Materials used
 * - Time tracking
 * - Photos and milestones
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
    ArrowLeftIcon,
    CalendarIcon,
    UserGroupIcon,
    TruckIcon,
    DocumentTextIcon,
    CurrencyDollarIcon,
    ClockIcon,
    MapPinIcon,
    PhotoIcon,
} from "@heroicons/react/24/outline"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import LoadingState from "@/src/shared/ui/LoadingState"
import { formatCurrency } from "@/src/features/admin/utils/formatters"

export default function JobDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [job, setJob] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchJob = async () => {
            try {
                setLoading(true)
                // Fetch job data from your service
                const { getJobById } = await import("@/src/services/jobService")
                const data = await getJobById(params.id)
                setJob(data)
            } catch (err) {
                setError("Failed to load job details")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchJob()
    }, [params.id])

    if (loading) return <LoadingState message="Loading job details..." />

    if (error || !job) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-red-600">{error || "Job not found"}</p>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <Breadcrumbs />
            </div>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold">{job.title}</h1>
                    <p className="text-gray-600">Job #{job.jobNumber}</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        Edit Job
                    </button>
                </div>
            </div>

            {/* Job details implementation... */}
            <div className="card p-6">
                <p className="text-gray-500">Job details page for ID: {params.id}</p>
            </div>
        </div>
    )
}
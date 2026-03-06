"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon } from "@heroicons/react/24/outline"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import LoadingState from "@/src/shared/ui/LoadingState"

type ScheduleItem = {
    id: string | number
    jobTitle: string
    crewName: string
    startTime: string
    location: string
}

export default function SchedulePage() {
    const router = useRouter()
    const [schedule, setSchedule] = useState<ScheduleItem[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(new Date())

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const { getUpcomingSchedule } = await import("@/src/services/adminService")
                const data = await getUpcomingSchedule(30, selectedDate)
                setSchedule(data)
            } catch (error) {
                console.error("Failed to load schedule:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchSchedule()
    }, [selectedDate])

    if (loading) return <LoadingState message="Loading schedule..." />

    return (
        <div className="space-y-6">
            <div>
                <Breadcrumbs />
                <h1 className="text-2xl font-bold mt-2">Schedule</h1>
            </div>

            <div className="card p-6">
                <div className="flex items-center gap-4 mb-6">
                    <CalendarIcon className="w-5 h-5 text-gray-500" />
                    <input
                        type="date"
                        value={selectedDate.toISOString().split("T")[0]}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        className="px-3 py-2 border rounded-lg"
                    />
                </div>

                <div className="space-y-4">
                    {schedule.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => router.push(`/admin/jobs/${item.id}`)}
                            className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                            <h3 className="font-medium">{item.jobTitle}</h3>
                            <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-gray-600">
                                <span>Crew: {item.crewName}</span>
                                <span>Time: {item.startTime}</span>
                                <span>Location: {item.location}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
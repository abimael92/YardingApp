
"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { EnvelopeIcon, PhoneIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import LoadingState from "@/src/shared/ui/LoadingState"

export default function CommunicationsPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const type = searchParams.get("type")
    const [loading, setLoading] = useState(true)
    const [communications, setCommunications] = useState([])

    useEffect(() => {
        const fetchCommunications = async () => {
            try {
                const { getCommunicationAlerts } = await import("@/src/services/adminService")
                const data = await getCommunicationAlerts()
                setCommunications(data)
            } catch (error) {
                console.error("Failed to load communications:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchCommunications()
    }, [type])

    if (loading) return <LoadingState message="Loading communications..." />

    return (
        <div className="space-y-6">
            <Breadcrumbs />
            <h1 className="text-2xl font-bold">Communications Center</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {communications.map((comm: any) => (
                    <div key={comm.type} className="card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            {comm.type === 'email' && <EnvelopeIcon className="w-6 h-6 text-blue-500" />}
                            {comm.type === 'sms' && <ChatBubbleLeftIcon className="w-6 h-6 text-green-500" />}
                            {comm.type === 'call' && <PhoneIcon className="w-6 h-6 text-purple-500" />}
                            <h2 className="text-lg font-semibold capitalize">{comm.type}</h2>
                        </div>
                        <div className="space-y-2">
                            <p>Total: {comm.count}</p>
                            <p className="text-blue-600">Unread: {comm.unread}</p>
                            <p className="text-sm text-gray-500">
                                Latest: {new Date(comm.latest).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
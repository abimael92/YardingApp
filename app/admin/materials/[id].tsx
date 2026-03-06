
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import LoadingState from "@/src/shared/ui/LoadingState"

export default function MaterialDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => setLoading(false), 500)
    }, [params.id])

    if (loading) return <LoadingState message="Loading material details..." />

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <Breadcrumbs />
            </div>
            <h1 className="text-2xl font-bold">Material Details</h1>
            <div className="card p-6">
                <p>Material ID: {params.id}</p>
            </div>
        </div>
    )
}

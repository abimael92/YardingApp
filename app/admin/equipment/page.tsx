/**
 * Equipment Management Page
 * 
 * Manage all equipment including:
 * - List all equipment with status
 * - Add/edit equipment
 * - View maintenance schedule
 * - Track assignments
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import LoadingState from "@/src/shared/ui/LoadingState"
import DataTable from "@/src/shared/ui/DataTable"

interface Equipment {
    id: string
    name: string
    type: string
    status: string
    hours: number
    nextMaintenance: string
}

interface Column {
    key: keyof Equipment
    label: string
}

export default function EquipmentPage() {
    const router = useRouter()
    const [equipment, setEquipment] = useState<Equipment[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const { getEquipmentStatus } = await import("@/src/services/adminService")
                const data = await getEquipmentStatus()
                setEquipment(data as unknown as Equipment[])
            } catch (error) {
                console.error("Failed to load equipment:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchEquipment()
    }, [])

    if (loading) return <LoadingState message="Loading equipment..." />

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Breadcrumbs />
                    <h1 className="text-2xl font-bold mt-2">Equipment Management</h1>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <PlusIcon className="w-5 h-5" />
                    Add Equipment
                </button>
            </div>

            <div className="card p-6">
                <DataTable
                    columns={[
                        { key: "name", label: "Equipment Name" },
                        { key: "type", label: "Type" },
                        { key: "status", label: "Status" },
                        { key: "hours", label: "Hours Used" },
                        { key: "nextMaintenance", label: "Next Maintenance" },
                    ]}
                    data={equipment}
                    onRowClick={(item) => router.push(`/admin/equipment/${item.id}`)}
                />
            </div>
        </div>
    )
}
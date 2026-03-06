"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PlusIcon } from "@heroicons/react/24/outline"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import LoadingState from "@/src/shared/ui/LoadingState"
import DataTable from "@/src/shared/ui/DataTable"

interface Material {
    id: string
    materialName: string
    currentStock: number
    reorderLevel: number
    unit: string
    supplier: string
}

interface DataTableColumn {
    key: keyof Material
    label: string
}

export default function MaterialsPage() {
    const router = useRouter()
    const [materials, setMaterials] = useState<Material[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const { getStockAlerts } = await import("@/src/services/adminService")
                const data = await getStockAlerts()
                setMaterials(data)
            } catch (error) {
                console.error("Failed to load materials:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchMaterials()
    }, [])

    if (loading) return <LoadingState message="Loading materials..." />

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Breadcrumbs />
                    <h1 className="text-2xl font-bold mt-2">Materials Inventory</h1>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <PlusIcon className="w-5 h-5" />
                    Add Material
                </button>
            </div>

            <div className="card p-6">
                <DataTable
                    columns={[
                        { key: "materialName", label: "Material" },
                        { key: "currentStock", label: "Stock" },
                        { key: "reorderLevel", label: "Reorder Level" },
                        { key: "unit", label: "Unit" },
                        { key: "supplier", label: "Supplier" },
                    ]}
                    data={materials}
                    onRowClick={(item) => router.push(`/admin/materials/${item.id}`)}
                />
            </div>
        </div>
    )
}
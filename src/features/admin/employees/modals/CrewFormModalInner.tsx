"use client"

import React, { useState, useMemo } from "react"
import { Modal } from "@/src/shared/ui/Modal"
import { BriefcaseIcon } from "@heroicons/react/24/outline"

export const CrewFormModalInner = ({ initialData, onCancel, onSuccess }: any) => {
    const [name, setName] = useState(initialData?.name || "")
    const [description, setDescription] = useState(initialData?.description || "")
    const [loading, setLoading] = useState(false)

    const progress = useMemo(() => {
        let p = 0
        if (name.length > 2) p += 50
        if (description.length > 5) p += 50
        return p
    }, [name, description])

    const handleSave = async () => {
        setLoading(true)
        // Business logic for API call here...
        setTimeout(() => { setLoading(false); onSuccess(); }, 1000)
    }

    return (
        <>
            <Modal.Header
                title={initialData?.id ? "Update Crew" : "New Crew"}
                subtitle="Organize team members and goals"
                icon={<BriefcaseIcon className="w-6 h-6" />}
                progress={progress}
            />
            <Modal.Body>
                <div className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-[#8b4513]/60 ml-1">Crew Name *</label>
                        <input
                            className="w-full px-4 py-3 rounded-xl border-2 border-[#d4a574]/20 focus:border-[#2e8b57] outline-none transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Westside Mowing"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-[#8b4513]/60 ml-1">Description</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl border-2 border-[#d4a574]/20 focus:border-[#2e8b57] outline-none min-h-[120px] resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Primary responsibilities..."
                        />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button onClick={onCancel} className="px-6 py-2 text-sm font-bold text-[#8b4513]/60">Cancel</button>
                <button
                    onClick={handleSave}
                    disabled={loading || name.length < 3}
                    className="px-10 py-3 bg-[#2e8b57] text-white rounded-xl font-bold shadow-lg disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save Crew"}
                </button>
            </Modal.Footer>
        </>
    )
}
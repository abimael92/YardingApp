"use client"

import React, { useState } from "react" // Added useState
import { Modal } from "@/src/shared/ui/Modal"
import { CrewFormModalInner } from "./CrewFormModalInner"
import { CrewDetailModalInner } from "./CrewDetailModalInner"

interface CrewModalManagerProps {
    activeModal: 'crew_form' | 'crew_detail' | null
    data: any
    onClose: () => void
    onRefresh: () => void
}

export const CrewModalManager = ({ activeModal, data, onClose, onRefresh }: CrewModalManagerProps) => {
    // Internal state to handle switching to edit mode from the detail view
    const [isEditingFromDetail, setIsEditingFromDetail] = useState(false);

    if (!activeModal) return null;

    // Determine which view to show
    // If explicitly 'crew_form' OR if we clicked edit inside the detail modal
    const showForm = activeModal === 'crew_form' || isEditingFromDetail;
    const showDetail = activeModal === 'crew_detail' && !isEditingFromDetail;

    const handleClose = () => {
        setIsEditingFromDetail(false);
        onClose();
    };

    return (
        <>
            {/* Crew Form Modal */}
            <Modal isOpen={showForm} onClose={handleClose} size="lg">
                <CrewFormModalInner
                    initialData={data}
                    onCancel={handleClose}
                    onSuccess={() => {
                        onRefresh();
                        handleClose();
                    }}
                />
            </Modal>

            {/* Crew Detail Modal */}
            <Modal isOpen={showDetail} onClose={handleClose} size="lg">
                <CrewDetailModalInner
                    crewId={data?.id}
                    onClose={handleClose}
                    onRefresh={onRefresh}
                    // Pass the missing onEdit prop to switch views
                    onEdit={() => setIsEditingFromDetail(true)}
                />
            </Modal>
        </>
    )
}
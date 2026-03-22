"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/src/components/layout/Modal"
import { Button } from "@/src/components/layout/Button"
import {
    EnvelopeIcon,
    DevicePhoneMobileIcon,
    DocumentTextIcon,
    ClipboardDocumentIcon,
    ChevronDownIcon,
    PaperAirplaneIcon,
    CheckCircleIcon
} from "@heroicons/react/24/outline"
import { useTemplates } from "@/src/features/admin/settings/hooks/useTemplates"
import { Template } from "@/src/features/admin/settings/types/settings.types"

interface LogContactModalProps {
    isOpen: boolean
    onClose: () => void
    clientId: string
    clientName: string
    clientEmail?: string
    clientPhone?: string
    onSuccess: () => void
}

interface ClientData {
    latestJob: {
        id: string
        job_number: string
        title: string
        description: string
        scheduled_date: string
        status: string
        total: number
    } | null
    latestInvoice: {
        id: string
        invoice_number: string
        amount_cents: number
        due_date: string
        status: string
    } | null
    latestQuote: {
        id: string
        quote_number: string
        total_cents: number
        valid_until: string
        status: string
    } | null
    upcomingAppointment: {
        id: string
        date: string
        time: string
        service_type: string
    } | null
}

const CONTACT_TYPES = [
    { value: "call", label: "Phone Call", icon: DevicePhoneMobileIcon },
    { value: "email", label: "Email", icon: EnvelopeIcon },
    { value: "meeting", label: "Meeting", icon: ClipboardDocumentIcon },
    { value: "site_visit", label: "Site Visit", icon: ClipboardDocumentIcon },
    { value: "quote_sent", label: "Quote Sent", icon: DocumentTextIcon },
    { value: "job_completed", label: "Job Completed", icon: DocumentTextIcon },
]

const CALL_SCRIPTS = {
    follow_up: {
        title: "Follow-up Call",
        script: `Hello {{client_name}}, this is {{owner_name}} from {{company_name}} calling to follow up on your recent service. I wanted to check if everything was done to your satisfaction and if you have any questions about the work we performed.`,
        key_points: [
            "Be friendly and professional",
            "Listen more than you talk",
            "Ask open-ended questions",
            "Take detailed notes",
            "Confirm next steps before ending call"
        ]
    },
    quote_follow_up: {
        title: "Quote Follow-up",
        script: `Hello {{client_name}}, this is {{owner_name}} from {{company_name}}. I'm following up on the quote we sent you (Quote #{{quote_number}} for {{quote_amount}}). I wanted to see if you had any questions about the proposal or if you'd like to move forward with scheduling.`,
        key_points: [
            "Be helpful, not pushy",
            "Address any concerns directly",
            "Offer to adjust if needed",
            "Set clear next steps"
        ]
    },
    satisfaction_check: {
        title: "Satisfaction Check",
        script: `Hello {{client_name}}, this is {{owner_name}} from {{company_name}}. I'm calling to check in after your recent {{service_type}} service on {{service_date}}. We value your feedback and want to make sure everything met your expectations.`,
        key_points: [
            "Thank them for their business",
            "Ask specific questions about the service",
            "Listen to both positive and negative feedback",
            "Offer solutions if there are issues"
        ]
    },
    payment_reminder: {
        title: "Payment Reminder",
        script: `Hello {{client_name}}, this is {{owner_name}} from {{company_name}}. I'm calling to remind you about the payment for Invoice #{{invoice_number}} in the amount of {{invoice_amount}} which is due {{due_date}}.`,
        key_points: [
            "Be polite and understanding",
            "Offer to help with payment process",
            "Note any payment arrangements"
        ]
    },
    appointment_reminder: {
        title: "Appointment Reminder",
        script: `Hello {{client_name}}, this is {{owner_name}} from {{company_name}}. I'm calling to confirm your {{service_type}} appointment scheduled for {{appointment_date}} at {{appointment_time}}.`,
        key_points: [
            "Confirm time and location",
            "Verify access instructions",
            "Note any special requests"
        ]
    }
}

export default function LogContactModal({
    isOpen,
    onClose,
    clientId,
    clientName,
    clientEmail = "",
    clientPhone = "",
    onSuccess
}: LogContactModalProps) {
    const { templates, loading: templatesLoading } = useTemplates()
    const [contactType, setContactType] = useState("call")
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
    const [selectedScript, setSelectedScript] = useState("follow_up")
    const [notes, setNotes] = useState("")
    const [callNotes, setCallNotes] = useState("")
    const [nextFollowupDate, setNextFollowupDate] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showScript, setShowScript] = useState(true)
    const [showTemplatePreview, setShowTemplatePreview] = useState(false)
    const [emailSubject, setEmailSubject] = useState("")
    const [emailBody, setEmailBody] = useState("")
    const [useTemplate, setUseTemplate] = useState(false)
    const [clientData, setClientData] = useState<ClientData>({
        latestJob: null,
        latestInvoice: null,
        latestQuote: null,
        upcomingAppointment: null
    })
    const [loadingClientData, setLoadingClientData] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const currentScript = CALL_SCRIPTS[selectedScript as keyof typeof CALL_SCRIPTS]

    const availableTemplates = templates.filter((t: Template) =>
        t.type === 'email' || t.type === 'both'
    )

    // Fetch client data when modal opens
    useEffect(() => {
        if (isOpen && clientId) {
            fetchClientData()
        }
    }, [isOpen, clientId])

    const fetchClientData = async () => {
        setLoadingClientData(true)
        try {
            const response = await fetch(`/api/clients/${clientId}/data`)
            if (response.ok) {
                const data = await response.json()
                setClientData(data)
            }
        } catch (error) {
            console.error("Failed to fetch client data:", error)
        } finally {
            setLoadingClientData(false)
        }
    }

    useEffect(() => {
        if (selectedTemplate && contactType === 'email') {
            setEmailSubject(selectedTemplate.subject)
            setEmailBody(selectedTemplate.content)
        }
    }, [selectedTemplate, contactType])

    const replaceVariables = (text: string, forEmail: boolean = false) => {
        let result = text
            .replace(/{{client_name}}/g, clientName)
            .replace(/{{client_email}}/g, clientEmail)
            .replace(/{{client_phone}}/g, clientPhone)
            .replace(/{{owner_name}}/g, "Mike")
            .replace(/{{company_name}}/g, "Desert Landscaping Co.")
            .replace(/{{phone_number}}/g, "(602) 555-0123")

        // Real data from database
        if (clientData.latestJob) {
            result = result
                .replace(/{{job_number}}/g, clientData.latestJob.job_number)
                .replace(/{{job_type}}/g, clientData.latestJob.title)
                .replace(/{{job_description}}/g, clientData.latestJob.description || "")
                .replace(/{{service_type}}/g, clientData.latestJob.title)
                .replace(/{{service_date}}/g, clientData.latestJob.scheduled_date ? new Date(clientData.latestJob.scheduled_date).toLocaleDateString() : "")
        }

        if (clientData.latestInvoice) {
            result = result
                .replace(/{{invoice_number}}/g, clientData.latestInvoice.invoice_number)
                .replace(/{{invoice_amount}}/g, `$${(clientData.latestInvoice.amount_cents / 100).toFixed(2)}`)
                .replace(/{{due_date}}/g, new Date(clientData.latestInvoice.due_date).toLocaleDateString())
        }

        if (clientData.latestQuote) {
            result = result
                .replace(/{{quote_number}}/g, clientData.latestQuote.quote_number)
                .replace(/{{quote_amount}}/g, `$${(clientData.latestQuote.total_cents / 100).toFixed(2)}`)
                .replace(/{{valid_until}}/g, new Date(clientData.latestQuote.valid_until).toLocaleDateString())
        }

        if (clientData.upcomingAppointment) {
            result = result
                .replace(/{{appointment_date}}/g, new Date(clientData.upcomingAppointment.date).toLocaleDateString())
                .replace(/{{appointment_time}}/g, clientData.upcomingAppointment.time)
                .replace(/{{service_type}}/g, clientData.upcomingAppointment.service_type)
        }

        // Default values if no real data
        if (!clientData.latestJob) {
            result = result
                .replace(/{{job_number}}/g, "N/A")
                .replace(/{{job_type}}/g, "Landscaping")
                .replace(/{{service_type}}/g, "Landscaping")
                .replace(/{{service_date}}/g, new Date().toLocaleDateString())
        }

        if (!clientData.latestInvoice) {
            result = result
                .replace(/{{invoice_number}}/g, "N/A")
                .replace(/{{invoice_amount}}/g, "$0.00")
                .replace(/{{due_date}}/g, "N/A")
        }

        if (!clientData.latestQuote) {
            result = result
                .replace(/{{quote_number}}/g, "N/A")
                .replace(/{{quote_amount}}/g, "$0.00")
                .replace(/{{valid_until}}/g, "N/A")
        }

        if (!clientData.upcomingAppointment) {
            result = result
                .replace(/{{appointment_date}}/g, "TBD")
                .replace(/{{appointment_time}}/g, "TBD")
        }

        return result
    }

    const sendEmail = async () => {
        if (!clientEmail) {
            alert("No email address for this client")
            return false
        }

        try {
            const response = await fetch(`/api/communications/send-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: clientEmail,
                    subject: replaceVariables(emailSubject, true),
                    body: replaceVariables(emailBody, true),
                    clientId,
                    templateId: selectedTemplate?.id
                })
            })

            if (response.ok) {
                setEmailSent(true)
                setTimeout(() => setEmailSent(false), 3000)
                return true
            }
            return false
        } catch (error) {
            console.error("Failed to send email:", error)
            return false
        }
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)

        try {
            let finalNotes = ""
            let emailActuallySent = false

            if (contactType === "call") {
                finalNotes = callNotes || "Phone call completed"
            } else if (contactType === "email" && useTemplate && selectedTemplate) {
                // Send the actual email
                const sent = await sendEmail()
                emailActuallySent = sent
                finalNotes = `Email ${sent ? "sent" : "attempted to send"} using template: ${selectedTemplate.name}\nSubject: ${emailSubject}\n\n${replaceVariables(emailBody)}`
            } else if (contactType === "email" && !useTemplate) {
                finalNotes = notes || "Email contact logged (no template used)"
            } else {
                finalNotes = notes || "Contact logged"
            }

            const logData = {
                contactType,
                notes: finalNotes,
                nextFollowupDate: nextFollowupDate || null,
                emailSent: emailActuallySent,
                templateUsed: selectedTemplate?.name
            }

            const response = await fetch(`/api/clients/${clientId}/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(logData)
            })

            if (!response.ok) throw new Error("Failed to log contact")

            onSuccess()
            onClose()
            resetForm()
        } catch (error) {
            console.error("Error logging contact:", error)
            alert("Failed to log contact. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setContactType("call")
        setSelectedTemplate(null)
        setSelectedScript("follow_up")
        setNotes("")
        setCallNotes("")
        setNextFollowupDate("")
        setShowScript(true)
        setShowTemplatePreview(false)
        setEmailSubject("")
        setEmailBody("")
        setUseTemplate(false)
        setEmailSent(false)
    }

    const getDefaultFollowupDate = () => {
        const date = new Date()
        date.setDate(date.getDate() + 7)
        return date.toISOString().split("T")[0]
    }

    if (templatesLoading) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title={`Log Contact - ${clientName}`} size="lg">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2e8b57]"></div>
                </div>
            </Modal>
        )
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Log Contact - ${clientName}`} size="lg">
            <div className="space-y-6">
                {/* Contact Type Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contact Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {CONTACT_TYPES.map(type => {
                            const Icon = type.icon
                            return (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => {
                                        setContactType(type.value)
                                        setUseTemplate(false)
                                        setShowScript(type.value === 'call')
                                    }}
                                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${contactType === type.value
                                        ? "border-[#2e8b57] bg-[#2e8b57]/10 text-[#2e8b57]"
                                        : "border-[#d4a574] hover:border-[#2e8b57] text-[#8b4513] dark:text-[#d4a574]"
                                        }`}
                                >
                                    <Icon className="w-6 h-6" />
                                    <span className="text-xs font-medium">{type.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Client Data Status */}
                {loadingClientData && (
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#2e8b57]"></div>
                        Loading client data...
                    </div>
                )}

                {/* Call Section */}
                {contactType === "call" && (
                    <>
                        <div className="border border-[#d4a574]/30 rounded-lg overflow-hidden">
                            <div className="bg-[#f5f1e6] dark:bg-gray-800 p-3 flex justify-between items-center">
                                <button
                                    type="button"
                                    onClick={() => setShowScript(!showScript)}
                                    className="flex items-center gap-2 text-sm font-medium text-[#8b4513] dark:text-[#d4a574]"
                                >
                                    <DocumentTextIcon className="w-4 h-4" />
                                    Call Script
                                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${showScript ? "rotate-180" : ""}`} />
                                </button>
                                {showScript && (
                                    <select
                                        value={selectedScript}
                                        onChange={(e) => setSelectedScript(e.target.value)}
                                        className="px-2 py-1 text-sm border border-[#d4a574] rounded bg-white dark:bg-gray-700"
                                    >
                                        <option value="follow_up">Follow-up Call</option>
                                        <option value="quote_follow_up">Quote Follow-up</option>
                                        <option value="satisfaction_check">Satisfaction Check</option>
                                        <option value="payment_reminder">Payment Reminder</option>
                                        <option value="appointment_reminder">Appointment Reminder</option>
                                    </select>
                                )}
                            </div>

                            {showScript && currentScript && (
                                <div className="p-4 space-y-4">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                        <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">
                                            Call Script: {currentScript.title}
                                        </h4>
                                        <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 p-3 rounded">
                                            {replaceVariables(currentScript.script)}
                                        </div>
                                    </div>

                                    <div>
                                        <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Key Points:</h5>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                            {currentScript.key_points.map((point, idx) => (
                                                <li key={idx}>{point}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Call Notes
                            </label>
                            <textarea
                                value={callNotes}
                                onChange={(e) => setCallNotes(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                                placeholder="What was discussed? What did the client say?"
                            />
                        </div>
                    </>
                )}

                {/* Email Section */}
                {contactType === "email" && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="useTemplate"
                                checked={useTemplate}
                                onChange={(e) => setUseTemplate(e.target.checked)}
                                className="w-4 h-4 text-[#2e8b57] rounded"
                            />
                            <label htmlFor="useTemplate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Use email template
                            </label>
                        </div>

                        {useTemplate && (
                            <div className="border border-[#d4a574]/30 rounded-lg p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Select Template
                                    </label>
                                    <select
                                        value={selectedTemplate?.id || ""}
                                        onChange={(e) => {
                                            const template = availableTemplates.find((t: Template) => t.id === e.target.value)
                                            setSelectedTemplate(template || null)
                                        }}
                                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                                    >
                                        <option value="">Select a template...</option>
                                        {availableTemplates.map((template: Template) => (
                                            <option key={template.id} value={template.id}>{template.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {selectedTemplate && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Subject
                                            </label>
                                            <input
                                                type="text"
                                                value={emailSubject}
                                                onChange={(e) => setEmailSubject(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Email Body
                                            </label>
                                            <textarea
                                                value={emailBody}
                                                onChange={(e) => setEmailBody(e.target.value)}
                                                rows={8}
                                                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 font-mono text-sm"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setShowTemplatePreview(!showTemplatePreview)}
                                            className="text-sm text-[#2e8b57] hover:underline"
                                        >
                                            {showTemplatePreview ? "Hide Preview" : "Show Preview"}
                                        </button>

                                        {showTemplatePreview && (
                                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                                                <div className="prose prose-sm max-w-none">
                                                    <div dangerouslySetInnerHTML={{
                                                        __html: replaceVariables(emailBody, true).replace(/\n/g, '<br/>')
                                                    }} />
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-2">
                                            <Button
                                                onClick={async () => {
                                                    const sent = await sendEmail()
                                                    if (sent) {
                                                        alert("Email sent successfully!")
                                                    } else {
                                                        alert("Failed to send email. Please check the email address.")
                                                    }
                                                }}
                                                className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                                            >
                                                <PaperAirplaneIcon className="w-4 h-4" />
                                                {emailSent ? "Sent!" : "Send Email Now"}
                                            </Button>
                                            {emailSent && (
                                                <div className="flex items-center gap-1 text-green-600 text-xs mt-2">
                                                    <CheckCircleIcon className="w-3 h-3" />
                                                    Email sent successfully
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {!useTemplate && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Notes
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                                    placeholder="What was discussed? Any important details?"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Other Contact Types */}
                {contactType !== "call" && contactType !== "email" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                            placeholder="Record details about this interaction..."
                        />
                    </div>
                )}

                {/* Follow-up Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Next Follow-up Date
                    </label>
                    <input
                        type="date"
                        value={nextFollowupDate}
                        onChange={(e) => setNextFollowupDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Leave empty to use default (7 days)
                    </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : "Log Contact"}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
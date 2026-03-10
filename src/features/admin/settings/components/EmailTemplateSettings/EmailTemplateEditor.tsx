// EmailTemplateEditor.tsx
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    PencilIcon,
    DocumentDuplicateIcon,
    DevicePhoneMobileIcon,
    EnvelopeIcon,
    EyeIcon,
    PlusIcon,
    TrashIcon,
    XMarkIcon,
    CheckIcon,
    DocumentTextIcon,
    Cog6ToothIcon
} from "@heroicons/react/24/outline"
import { ClientOnlyRichTextEditor as RichTextEditor } from "./ClientOnlyRichTextEditor"
import { useTemplates } from "../../hooks/useTemplates"
import { Template, VARIABLE_GROUPS } from "../../types/settings.types"

interface EmailTemplateEditorProps {
    onSave: () => void
    saveSuccess: boolean
    setSaveSuccess: (value: boolean) => void
}

export const EmailTemplateEditor = ({ onSave, saveSuccess, setSaveSuccess }: EmailTemplateEditorProps) => {
    const { templates, loading, error, saveTemplate, createTemplate, deleteTemplate } = useTemplates()

    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
    const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit')
    const [showNewTemplateModal, setShowNewTemplateModal] = useState(false)
    const [newTemplateName, setNewTemplateName] = useState("")
    const [newTemplateType, setNewTemplateType] = useState<'email' | 'sms' | 'both'>('email')

    // Editor state
    const [editName, setEditName] = useState("")
    const [editSubject, setEditSubject] = useState("")
    const [editContent, setEditContent] = useState("")
    const [editSignature, setEditSignature] = useState("")
    const [editType, setEditType] = useState<'email' | 'sms' | 'both'>('email')

    // Preview variables
    const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({
        client_name: "John Doe",
        company_name: "Desert Landscaping Co.",
        owner_name: "Mike Smith",
        phone_number: "(602) 555-0123",
        invoice_number: "INV-2024-001",
        invoice_amount: "$850.00",
        due_date: "05/15/2024",
        job_type: "Lawn Maintenance",
        job_address: "123 Desert Rd, Phoenix, AZ",
        quote_number: "Q-2024-123",
        quote_amount: "$1,200.00",
        valid_until: "06/01/2024"
    })

    // Load template when selected
    useEffect(() => {
        if (selectedTemplate) {
            setEditName(selectedTemplate.name)
            setEditSubject(selectedTemplate.subject)
            setEditContent(selectedTemplate.content)
            setEditSignature(selectedTemplate.signature)
            setEditType(selectedTemplate.type)
        }
    }, [selectedTemplate])

    const handleSaveTemplate = async () => {
        if (!selectedTemplate) return

        const updated = {
            ...selectedTemplate,
            name: editName,
            subject: editSubject,
            content: editContent,
            signature: editSignature,
            type: editType,
            lastEdited: new Date().toISOString()
        }

        await saveTemplate(updated)
        onSave()
    }

    const handleCreateTemplate = async () => {
        if (!newTemplateName.trim()) return

        const newTemplate = await createTemplate({
            name: newTemplateName,
            subject: `New ${newTemplateType} template`,
            content: "Start writing your template here...",
            signature: "Best regards,\n{{owner_name}}\n{{company_name}}",
            type: newTemplateType,
            variables: ['client_name', 'company_name']
        })

        setSelectedTemplate(newTemplate)
        setShowNewTemplateModal(false)
        setNewTemplateName("")
        setNewTemplateType('email')
    }

    const handleDeleteTemplate = async (id: string) => {
        if (confirm("Are you sure you want to delete this template?")) {
            await deleteTemplate(id)
            if (selectedTemplate?.id === id) {
                setSelectedTemplate(null)
            }
        }
    }

    const insertVariable = (variable: string) => {
        setEditContent(prev => prev + ` {{${variable}}} `)
    }

    const renderPreview = () => {
        if (!selectedTemplate) return null

        let preview = editContent
        let subject = editSubject

        Object.entries(previewVariables).forEach(([key, value]) => {
            preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), value)
            subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value)
        })

        return (
            <div className="space-y-4">
                <div className="p-4 bg-[#f5f1e6] dark:bg-gray-800 rounded-lg border border-[#d4a574] dark:border-[#8b4513]">
                    <p className="text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">Subject:</p>
                    <p className="text-[#b85e1a] dark:text-[#d4a574]">{subject}</p>
                </div>

                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-[#d4a574] dark:border-[#8b4513] prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: preview }} />
                </div>

                <div className="p-4 bg-[#f5f1e6] dark:bg-gray-800 rounded-lg border border-[#d4a574] dark:border-[#8b4513]">
                    <p className="text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">Signature:</p>
                    <p className="text-[#b85e1a] dark:text-[#d4a574] whitespace-pre-line">{editSignature}</p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2e8b57]"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-[#8b4513] dark:text-[#d4a574]">
                    Email & SMS Templates
                </h2>
                <button
                    onClick={() => setShowNewTemplateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2e8b57] hover:bg-[#1f6b41] text-white rounded-lg transition-all hover:shadow-lg hover:shadow-[#2e8b57]/20"
                >
                    <PlusIcon className="w-5 h-5" />
                    New Template
                </button>
            </div>

            {/* Template List and Editor Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Template List */}
                <div className="lg:col-span-1 border border-[#d4a574]/50 dark:border-[#8b4513]/50 rounded-lg p-4 bg-white dark:bg-gray-900">
                    <h3 className="text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-3">Templates</h3>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                className={`p-3 rounded-lg cursor-pointer transition-all ${selectedTemplate?.id === template.id
                                        ? 'bg-[#2e8b57]/20 border border-[#2e8b57]'
                                        : 'hover:bg-[#f5f1e6] dark:hover:bg-gray-800 border border-transparent'
                                    }`}
                                onClick={() => setSelectedTemplate(template)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            {template.type === 'email' ? (
                                                <EnvelopeIcon className="w-4 h-4 text-[#2e8b57]" />
                                            ) : template.type === 'sms' ? (
                                                <DevicePhoneMobileIcon className="w-4 h-4 text-[#2e8b57]" />
                                            ) : (
                                                <>
                                                    <EnvelopeIcon className="w-4 h-4 text-[#2e8b57]" />
                                                    <DevicePhoneMobileIcon className="w-4 h-4 text-[#2e8b57] -ml-1" />
                                                </>
                                            )}
                                            <span className="font-medium text-[#8b4513] dark:text-[#d4a574]">
                                                {template.name}
                                            </span>
                                        </div>
                                        <p className="text-xs text-[#b85e1a]/70 dark:text-gray-400 mt-1 truncate">
                                            {template.subject}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteTemplate(template.id)
                                        }}
                                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Editor/Preview Panel */}
                <div className="lg:col-span-2 space-y-4">
                    {selectedTemplate ? (
                        <>
                            {/* Editor/Preview Toggle */}
                            <div className="flex justify-between items-center">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditorMode('edit')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${editorMode === 'edit'
                                                ? 'bg-[#2e8b57] text-white'
                                                : 'border border-[#d4a574] text-[#8b4513] dark:text-[#d4a574] hover:bg-[#f5f1e6] dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <PencilIcon className="w-4 h-4 inline mr-2" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setEditorMode('preview')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${editorMode === 'preview'
                                                ? 'bg-[#2e8b57] text-white'
                                                : 'border border-[#d4a574] text-[#8b4513] dark:text-[#d4a574] hover:bg-[#f5f1e6] dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <EyeIcon className="w-4 h-4 inline mr-2" />
                                        Preview
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <select
                                        value={editType}
                                        onChange={(e) => setEditType(e.target.value as 'email' | 'sms' | 'both')}
                                        className="px-3 py-2 border border-[#d4a574] dark:border-[#8b4513] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] text-sm"
                                    >
                                        <option value="email">Email Only</option>
                                        <option value="sms">SMS Only</option>
                                        <option value="both">Both</option>
                                    </select>

                                    <button
                                        onClick={handleSaveTemplate}
                                        className="px-4 py-2 bg-[#2e8b57] hover:bg-[#1f6b41] text-white rounded-lg text-sm flex items-center gap-2"
                                    >
                                        <CheckIcon className="w-4 h-4" />
                                        Save
                                    </button>
                                </div>
                            </div>

                            {/* Editor Mode */}
                            {editorMode === 'edit' ? (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Template Name"
                                        className="w-full px-3 py-2 border border-[#d4a574] dark:border-[#8b4513] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574]"
                                    />

                                    <input
                                        type="text"
                                        value={editSubject}
                                        onChange={(e) => setEditSubject(e.target.value)}
                                        placeholder="Subject Line"
                                        className="w-full px-3 py-2 border border-[#d4a574] dark:border-[#8b4513] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574]"
                                    />

                                    {/* Variable Insertion */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[#8b4513] dark:text-[#d4a574]">
                                            Insert Variables
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(VARIABLE_GROUPS).map(([group, vars]) => (
                                                <div key={group} className="relative group">
                                                    <button className="px-3 py-1 bg-[#f5f1e6] dark:bg-gray-800 border border-[#d4a574] dark:border-[#8b4513] rounded-lg text-sm text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20">
                                                        {group}
                                                    </button>
                                                    <div className="absolute left-0 mt-1 hidden group-hover:block z-10">
                                                        <div className="bg-white dark:bg-gray-800 border border-[#d4a574] dark:border-[#8b4513] rounded-lg p-2 shadow-lg min-w-[150px]">
                                                            {vars.map(v => (
                                                                <button
                                                                    key={v}
                                                                    onClick={() => insertVariable(v)}
                                                                    className="block w-full text-left px-2 py-1 text-sm text-[#8b4513] dark:text-[#d4a574] hover:bg-[#f5f1e6] dark:hover:bg-gray-700 rounded"
                                                                >
                                                                    {v}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Rich Text Editor */}
                                    <RichTextEditor
                                        content={editContent}
                                        onChange={setEditContent}
                                        placeholder="Write your template content here..."
                                    />

                                    {/* Signature Editor */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-2">
                                            Signature
                                        </label>
                                        <textarea
                                            value={editSignature}
                                            onChange={(e) => setEditSignature(e.target.value)}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-[#d4a574] dark:border-[#8b4513] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574]"
                                            placeholder="Enter your signature..."
                                        />
                                    </div>
                                </div>
                            ) : (
                                /* Preview Mode */
                                <div className="space-y-4">
                                    {/* Test Variables Editor */}
                                    <div className="border border-[#d4a574]/50 dark:border-[#8b4513]/50 rounded-lg p-4">
                                        <h4 className="text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-3">
                                            Test Variables
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {Object.entries(previewVariables).map(([key, value]) => (
                                                <div key={key}>
                                                    <label className="block text-xs text-[#b85e1a]/70 dark:text-gray-400 mb-1">
                                                        {key}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={value}
                                                        onChange={(e) => setPreviewVariables(prev => ({ ...prev, [key]: e.target.value }))}
                                                        className="w-full px-2 py-1 border border-[#d4a574] dark:border-[#8b4513] rounded bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] text-sm"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Preview Content */}
                                    {renderPreview()}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-[#d4a574]/50 dark:border-[#8b4513]/50 rounded-lg p-8">
                            <DocumentTextIcon className="w-12 h-12 text-[#d4a574] dark:text-[#8b4513] mb-4" />
                            <p className="text-[#8b4513] dark:text-[#d4a574] font-medium">
                                Select a template to edit
                            </p>
                            <p className="text-sm text-[#b85e1a]/70 dark:text-gray-400 mt-2">
                                or create a new template to get started
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* New Template Modal */}
            <AnimatePresence>
                {showNewTemplateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={() => setShowNewTemplateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-[#8b4513] dark:text-[#d4a574]">
                                    Create New Template
                                </h3>
                                <button
                                    onClick={() => setShowNewTemplateModal(false)}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-2">
                                        Template Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newTemplateName}
                                        onChange={(e) => setNewTemplateName(e.target.value)}
                                        placeholder="e.g., Welcome Email"
                                        className="w-full px-3 py-2 border border-[#d4a574] dark:border-[#8b4513] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574]"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-2">
                                        Template Type
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                value="email"
                                                checked={newTemplateType === 'email'}
                                                onChange={(e) => setNewTemplateType('email')}
                                                className="text-[#2e8b57]"
                                            />
                                            <span className="text-[#8b4513] dark:text-[#d4a574]">Email</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                value="sms"
                                                checked={newTemplateType === 'sms'}
                                                onChange={(e) => setNewTemplateType('sms')}
                                                className="text-[#2e8b57]"
                                            />
                                            <span className="text-[#8b4513] dark:text-[#d4a574]">SMS</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                value="both"
                                                checked={newTemplateType === 'both'}
                                                onChange={(e) => setNewTemplateType('both')}
                                                className="text-[#2e8b57]"
                                            />
                                            <span className="text-[#8b4513] dark:text-[#d4a574]">Both</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowNewTemplateModal(false)}
                                    className="px-4 py-2 border border-[#d4a574] dark:border-[#8b4513] rounded-lg text-[#8b4513] dark:text-[#d4a574] hover:bg-[#f5f1e6] dark:hover:bg-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateTemplate}
                                    disabled={!newTemplateName.trim()}
                                    className="px-4 py-2 bg-[#2e8b57] hover:bg-[#1f6b41] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Create
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
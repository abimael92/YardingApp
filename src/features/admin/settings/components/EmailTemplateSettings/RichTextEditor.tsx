'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import {
    BoldIcon,
    ItalicIcon,
    UnderlineIcon,
    ListBulletIcon,
    LinkIcon,
} from "@heroicons/react/24/outline"
import { useEffect, useState } from 'react'

export interface RichTextEditorProps {
    content: string
    onChange: (content: string) => void
    placeholder?: string
}

export const RichTextEditor = ({ content, onChange, placeholder }: RichTextEditorProps) => {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder })
        ],
        content,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose max-w-none p-4 min-h-[200px] bg-white dark:bg-gray-900 text-[#8b4513] dark:text-[#d4a574] focus:outline-none',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content)
        }
    }, [content, editor])

    if (!isMounted) {
        return (
            <div className="border border-[#d4a574] dark:border-[#8b4513] rounded-lg p-4 min-h-[200px] bg-[#f5f1e6] dark:bg-gray-800 animate-pulse">
                <div className="h-6 bg-[#d4a574]/20 rounded w-3/4 mb-4"></div>
                <div className="h-20 bg-[#d4a574]/20 rounded"></div>
            </div>
        )
    }

    if (!editor) return null

    return (
        <div className="border border-[#d4a574] dark:border-[#8b4513] rounded-lg overflow-hidden">
            <div className="bg-[#f5f1e6] dark:bg-gray-800 p-2 border-b border-[#d4a574] dark:border-[#8b4513] flex gap-1">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-[#d4a574]/20 ${editor.isActive('bold') ? 'bg-[#2e8b57]/20 text-[#2e8b57]' : ''}`}
                >
                    <BoldIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-[#d4a574]/20 ${editor.isActive('italic') ? 'bg-[#2e8b57]/20 text-[#2e8b57]' : ''}`}
                >
                    <ItalicIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded hover:bg-[#d4a574]/20 ${editor.isActive('bulletList') ? 'bg-[#2e8b57]/20 text-[#2e8b57]' : ''}`}
                >
                    <ListBulletIcon className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-[#d4a574]/30 mx-1" />
                <button
                    onClick={() => {
                        const url = window.prompt('Enter URL:')
                        if (url) {
                            editor.chain().focus().setLink({ href: url }).run()
                        }
                    }}
                    className={`p-2 rounded hover:bg-[#d4a574]/20 ${editor.isActive('link') ? 'bg-[#2e8b57]/20 text-[#2e8b57]' : ''}`}
                >
                    <LinkIcon className="w-4 h-4" />
                </button>
            </div>
            <EditorContent editor={editor} />
        </div>
    )
}
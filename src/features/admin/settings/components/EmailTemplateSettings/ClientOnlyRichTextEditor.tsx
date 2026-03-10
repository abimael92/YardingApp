'use client'

import dynamic from 'next/dynamic'
import { RichTextEditorProps } from './RichTextEditor'

const DynamicRichTextEditor = dynamic(
    () => import('./RichTextEditor').then(mod => mod.RichTextEditor),
    { ssr: false }
)

export function ClientOnlyRichTextEditor(props: RichTextEditorProps) {
    return <DynamicRichTextEditor {...props} />
}
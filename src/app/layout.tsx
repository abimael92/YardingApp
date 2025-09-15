// src/app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'AZ Landscapes - Professional Yard Services',
  description: 'Professional landscaping and yardwork services across Arizona',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "J&J Desert Landscaping LLC",
    template: "%s | J&J Desert Landscaping LLC",
  },
  description:
    "Professional landscaping services in Phoenix, Arizona. Lawn care, desert landscaping, irrigation, and hardscaping tailored for the Arizona climate.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "J&J Desert Landscaping LLC",
    description:
      "Professional landscaping services in Phoenix, Arizona. Lawn care, desert landscaping, irrigation, and hardscaping tailored for the Arizona climate.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "J&J Desert Landscaping LLC",
    description:
      "Professional landscaping services in Phoenix, Arizona. Lawn care, desert landscaping, irrigation, and hardscaping tailored for the Arizona climate.",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  )
}

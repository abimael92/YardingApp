import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import ThemeToggle from "@/src/shared/ui/ThemeToggle";
import { NextAuthProvider } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "J&J Desert Landscaping LLC",
    template: "%s | J&J Desert Landscaping LLC",
  },
  description: "Professional landscaping services in Phoenix, Arizona.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="min-h-screen font-sans">
        <NextAuthProvider>
          <ThemeToggle />
          {children}
          <Analytics />
        </NextAuthProvider>
      </body>
    </html>
  );
}
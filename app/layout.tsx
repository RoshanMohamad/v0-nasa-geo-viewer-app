import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "🌍 NASA GeoViewer",
  description: "Advanced Earth visualization platform for NASA Space Competition 2025",
  generator: "v0.app",
  openGraph: {
    title: "🌍 NASA GeoViewer",
    description: "Advanced Earth visualization platform for NASA Space Competition 2025",
    url: "https://v0.app",
    siteName: "🌍 NASA GeoViewer",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "🌍 NASA GeoViewer",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}

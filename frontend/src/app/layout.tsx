import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NugVerse - UGC Brief Generator',
  description: 'AI-Powered UGC Campaign Brief Generation Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


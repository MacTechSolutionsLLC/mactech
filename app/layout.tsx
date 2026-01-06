import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import FloatingChatButton from '@/components/FloatingChatButton'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'MacTech Solutions | DoD Cybersecurity, Infrastructure & Compliance',
  description: 'Veteran-owned consulting firm specializing in RMF, ATO, infrastructure engineering, and audit readiness for federal programs and defense contractors.',
  keywords: ['DoD', 'RMF', 'ATO', 'Cybersecurity', 'SDVOSB', 'Federal Contractor', 'STIG', 'Compliance'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <Navigation />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <FloatingChatButton />
      </body>
    </html>
  )
}


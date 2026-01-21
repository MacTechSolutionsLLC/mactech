'use client'

import { usePathname } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import FloatingChatButton from '@/components/FloatingChatButton'

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin') || pathname?.startsWith('/auth')

  if (isAdminPage) {
    return <>{children}</>
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <FloatingChatButton />
    </>
  )
}

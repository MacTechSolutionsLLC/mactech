'use client'

import { usePathname } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin') || pathname?.startsWith('/auth')
  const isUserPage = pathname?.startsWith('/user') || pathname?.startsWith('/feedback')

  // Don't show public Navigation/Footer for admin, auth, or user pages (they have their own navigation)
  if (isAdminPage || isUserPage) {
    return <>{children}</>
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}

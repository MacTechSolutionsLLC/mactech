'use client'

import { useSession } from 'next-auth/react'
import AdminNavigation from '@/components/admin/AdminNavigation'
import UserNavigation from '@/components/user/UserNavigation'

/**
 * RoleBasedNavigation Component
 * 
 * Automatically displays the appropriate navigation component based on the user's role.
 * - Admins see AdminNavigation regardless of the page they're on
 * - Regular users see UserNavigation
 * - Returns null if unauthenticated (let ConditionalLayout handle public pages)
 */
export default function RoleBasedNavigation() {
  const { data: session, status } = useSession()

  // Handle loading state - don't render anything while session is loading
  if (status === 'loading') {
    return null
  }

  // If unauthenticated, return null (let ConditionalLayout handle public pages)
  if (status === 'unauthenticated' || !session) {
    return null
  }

  // Check if user is admin
  const isAdmin = session?.user?.role === 'ADMIN'

  // Render appropriate navigation based on role
  if (isAdmin) {
    return <AdminNavigation />
  }

  // Default to UserNavigation for regular users
  return <UserNavigation />
}

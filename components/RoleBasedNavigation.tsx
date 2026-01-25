'use client'

import { useSession } from 'next-auth/react'
import AdminNavigation from '@/components/admin/AdminNavigation'
import UserNavigation from '@/components/user/UserNavigation'

/**
 * RoleBasedNavigation Component
 * 
 * Automatically displays the appropriate navigation component based on user role:
 * - AdminNavigation for ADMIN users
 * - UserNavigation for USER users or unauthenticated users
 * 
 * This ensures admins always see AdminNavigation even when accessing user pages,
 * maintaining their navigation context and session experience.
 */
export default function RoleBasedNavigation() {
  const { data: session, status } = useSession()

  // Show loading state (minimal, navigation will appear quickly)
  if (status === 'loading') {
    // Return UserNavigation as default during loading to avoid layout shift
    // This is safe since it will switch to AdminNavigation if needed once session loads
    return <UserNavigation />
  }

  // Check if user is admin
  const isAdmin = session?.user?.role === 'ADMIN'

  // Render appropriate navigation based on role
  if (isAdmin) {
    return <AdminNavigation />
  }

  // Default to UserNavigation for regular users or unauthenticated users
  return <UserNavigation />
}

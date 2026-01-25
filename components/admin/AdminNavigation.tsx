'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

interface NavItem {
  href: string
  label: string
  description?: string
  icon?: string
}

const navItems: NavItem[] = [
  {
    href: '/admin/poam',
    label: 'POA&M',
    description: 'Plan of Action and Milestones',
    icon: '📋',
  },
  {
    href: '/admin/compliance/sctm',
    label: 'SCTM',
    description: 'System Control Traceability Matrix',
    icon: '📊',
  },
  {
    href: '/admin/users',
    label: 'Users',
    description: 'Manage user accounts',
    icon: '👥',
  },
  {
    href: '/admin/events',
    label: 'Event Logs',
    description: 'Audit log and events',
    icon: '📝',
  },
  {
    href: '/user/contract-discovery',
    label: 'Capture',
    description: 'Search SAM.gov opportunities',
    icon: '🔍',
  },
]

export default function AdminNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLoggingOut(true)
    try {
      // Log logout event before signing out
      if (session?.user) {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (logError) {
          console.error('Failed to log logout event:', logError)
          // Continue with logout even if logging fails
        }
      }
      
      // Sign out without redirect (we'll handle it manually)
      await signOut({ 
        redirect: false 
      })
      
      // Manually redirect to home page using current domain
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback: redirect manually
      window.location.href = '/'
    } finally {
      setIsLoggingOut(false)
    }
  }

  const isAdmin = session?.user?.role === 'ADMIN'

  return (
    <nav className="bg-gradient-to-r from-neutral-900 to-neutral-800 border-b border-neutral-700 sticky top-0 z-50 shadow-lg">
      <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-12 gap-2">
          {/* Logo/Home Link */}
          <Link 
            href="/admin" 
            className="flex items-center gap-2 group flex-shrink-0"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-accent-600 rounded-lg group-hover:bg-accent-700 transition-colors">
              <span className="text-lg">⚙️</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-semibold text-xs leading-tight">Admin Portal</p>
              <p className="text-neutral-400 text-[10px] leading-tight">MacTech</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-0.5 bg-neutral-800/50 rounded-lg p-0.5 backdrop-blur-sm flex-1 min-w-0 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-accent-600 text-white shadow-md'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-700/50'
                  }`}
                  title={item.description}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
            {isAdmin && (
              <Link
                href="/user"
                className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-700/50 rounded-md transition-all duration-200 flex items-center gap-1.5 ml-2"
                title="Switch to User Panel"
              >
                <span className="text-sm">👤</span>
                <span>User Panel</span>
              </Link>
            )}
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {session?.user && (
              <div className="hidden md:flex items-center gap-2 px-2 py-1 bg-neutral-800/50 rounded-lg backdrop-blur-sm">
                <div className="w-7 h-7 bg-accent-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {(session.user.name || session.user.email || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="text-right">
                  <p className="text-white text-xs font-medium leading-tight truncate max-w-[120px]">{session.user.name || session.user.email}</p>
                  <p className="text-neutral-400 text-[10px] leading-tight">{session.user.role}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md hover:shadow-lg"
            >
              {isLoggingOut ? (
                <>
                  <span className="animate-spin text-xs">⟳</span>
                  <span className="hidden sm:inline">Logging out...</span>
                </>
              ) : (
                <>
                  <span className="text-sm">🚪</span>
                  <span className="hidden sm:inline">Logout</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile: Navigation Dropdown */}
          <div className="lg:hidden flex items-center gap-2 flex-shrink-0">
            <select
              value={pathname}
              onChange={(e) => {
                router.push(e.target.value)
              }}
              className="px-2 py-1.5 text-xs font-medium bg-neutral-800 text-white border border-neutral-700 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
            >
              {navItems.map((item) => (
                <option key={item.href} value={item.href}>
                  {item.icon} {item.label}
                </option>
              ))}
            </select>
            {isAdmin && (
              <Link
                href="/user"
                className="px-2 py-1.5 text-xs text-accent-400 hover:text-accent-300 underline"
                title="Switch to User Panel"
              >
                User Panel →
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

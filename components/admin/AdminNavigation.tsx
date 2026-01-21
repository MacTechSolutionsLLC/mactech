'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Image from 'next/image'

interface NavItem {
  href: string
  label: string
  description?: string
  icon?: string
}

const navItems: NavItem[] = [
  {
    href: '/admin',
    label: 'Portal',
    description: 'Overview and quick access',
    icon: '🏠',
  },
  {
    href: '/admin/capture',
    label: 'Capture',
    description: 'Federal contract opportunities',
    icon: '📊',
  },
  {
    href: '/admin/contract-discovery',
    label: 'Discovery',
    description: 'Search SAM.gov opportunities',
    icon: '🔍',
  },
  {
    href: '/admin/contract-discovery/dashboard',
    label: 'Dashboard',
    description: 'Manage all contracts',
    icon: '📋',
  },
  {
    href: '/admin/generate-proposal',
    label: 'Proposals',
    description: 'Create proposals from SOW',
    icon: '📄',
  },
  {
    href: '/admin/usaspending',
    label: 'Awards',
    description: 'View award history',
    icon: '🏆',
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
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      })
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback: redirect manually
      router.push('/')
      router.refresh()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <nav className="bg-gradient-to-r from-neutral-900 to-neutral-800 border-b border-neutral-700 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Home Link */}
          <Link 
            href="/admin" 
            className="flex items-center gap-3 group"
          >
            <div className="flex items-center justify-center w-10 h-10 bg-accent-600 rounded-lg group-hover:bg-accent-700 transition-colors">
              <span className="text-xl">⚙️</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-semibold text-sm">Admin Portal</p>
              <p className="text-neutral-400 text-xs">MacTech Solutions</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 bg-neutral-800/50 rounded-lg p-1 backdrop-blur-sm">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'bg-accent-600 text-white shadow-md'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-700/50'
                  }`}
                  title={item.description}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center gap-3">
            {session?.user && (
              <div className="hidden md:flex items-center gap-3 px-3 py-2 bg-neutral-800/50 rounded-lg backdrop-blur-sm">
                <div className="w-8 h-8 bg-accent-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {(session.user.name || session.user.email || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-medium">{session.user.name || session.user.email}</p>
                  <p className="text-neutral-400 text-xs">{session.user.role}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              {isLoggingOut ? (
                <>
                  <span className="animate-spin">⟳</span>
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <span>🚪</span>
                  <span>Logout</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile: Show current page and dropdown */}
          <div className="lg:hidden flex items-center gap-2">
            <select
              value={pathname}
              onChange={(e) => {
                router.push(e.target.value)
              }}
              className="px-3 py-2 text-sm font-medium bg-neutral-800 text-white border border-neutral-700 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
            >
              {navItems.map((item) => (
                <option key={item.href} value={item.href}>
                  {item.icon} {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </nav>
  )
}


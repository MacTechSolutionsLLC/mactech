'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'

interface NavItem {
  href: string
  label: string
  description?: string
  icon?: string
}

const navItems: NavItem[] = [
  {
    href: '/admin',
    label: 'Admin Portal',
    description: 'Overview and quick access',
    icon: '🏠',
  },
  {
    href: '/admin/capture',
    label: 'Capture Dashboard',
    description: 'Federal contract opportunities',
    icon: '📊',
  },
  {
    href: '/admin/contract-discovery',
    label: 'Contract Discovery',
    description: 'Search SAM.gov opportunities',
    icon: '🔍',
  },
  {
    href: '/admin/contract-discovery/dashboard',
    label: 'Contract Dashboard',
    description: 'Manage all contracts',
    icon: '📋',
  },
  {
    href: '/admin/generate-proposal',
    label: 'Generate Proposal',
    description: 'Create proposals from SOW',
    icon: '📄',
  },
  {
    href: '/admin/usaspending',
    label: 'USAspending Awards',
    description: 'View award history',
    icon: '🏆',
  },
]

export default function AdminNavigation() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Home Link */}
          <Link 
            href="/admin" 
            className="flex items-center gap-2 text-accent-700 hover:text-accent-800 transition-colors font-semibold"
          >
            <span className="text-lg">⚙️</span>
            <span className="hidden sm:inline">Admin Portal</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-accent-50 text-accent-700'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                  title={item.description}
                >
                  <span className="hidden xl:inline mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center gap-4">
            {session?.user && (
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-neutral-900">{session.user.name || session.user.email}</p>
                  <p className="text-xs text-neutral-500">{session.user.role}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile: Show current page and dropdown */}
          <div className="lg:hidden flex items-center gap-2">
            <select
              value={pathname}
              onChange={(e) => {
                window.location.href = e.target.value
              }}
              className="px-3 py-2 text-sm font-medium bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
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


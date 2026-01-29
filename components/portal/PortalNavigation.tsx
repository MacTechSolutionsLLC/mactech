'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default function PortalNavigation() {
  const pathname = usePathname()

  const nav = [
    { href: '/portal', label: 'Home' },
    { href: '/portal/upload', label: 'Upload' },
    { href: '/portal/resources', label: 'Resources' },
  ]

  return (
    <nav className="bg-white border-b border-neutral-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center gap-8">
            <Link href="/portal" className="text-neutral-900 font-semibold">
              Customer Portal
            </Link>
            <div className="flex gap-4">
              {nav.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`text-sm font-medium px-3 py-2 rounded-md ${
                    pathname === href || (href !== '/portal' && pathname?.startsWith(href))
                      ? 'bg-neutral-100 text-neutral-900'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">Guest</span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

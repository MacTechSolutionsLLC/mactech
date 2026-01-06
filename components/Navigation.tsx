'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/showcase', label: 'Showcase' },
    { href: '/readiness', label: 'Assessment' },
    { href: '/leadership', label: 'Leadership' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <nav 
      className={`sticky top-0 z-50 bg-white transition-all duration-gentle ${
        scrolled ? 'border-b border-neutral-200 shadow-sm' : 'border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center min-h-20 py-4">
          {/* Logo - restrained, confident */}
          <Link 
            href="/" 
            className="flex items-center group"
            aria-label="MacTech Solutions Home"
          >
            <Image
              src="/mactech.png"
              alt="MacTech Solutions"
              width={1440}
              height={320}
              className="h-64 w-auto transition-opacity duration-gentle group-hover:opacity-80"
              priority
            />
          </Link>
          
          {/* Desktop Navigation - minimal, editorial */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-body-sm font-medium transition-colors duration-gentle ${
                    isActive
                      ? 'text-accent-700'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Mobile menu button - minimal icon */}
          <button
            className="md:hidden text-neutral-700 hover:text-neutral-900 transition-colors p-2 -mr-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              strokeWidth={1.5}
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation - clean, spacious */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-neutral-200 fade-in">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 text-body font-medium transition-colors duration-gentle ${
                      isActive
                        ? 'text-accent-700 bg-accent-50'
                        : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

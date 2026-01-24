'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function MFAVerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    // Get userId and email from session or query params
    // In a real implementation, these would come from the session after password auth
    const storedUserId = sessionStorage.getItem('mfa_userId')
    const storedUserEmail = sessionStorage.getItem('mfa_userEmail')
    
    if (storedUserId && storedUserEmail) {
      setUserId(storedUserId)
      setUserEmail(storedUserEmail)
    } else {
      // If no stored data, redirect back to signin
      router.push('/auth/signin?error=mfa_session_expired')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!userId) {
      setError('Session expired. Please sign in again.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          code,
          userEmail,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setIsLoading(false)
      } else {
        // Clear stored MFA data
        const role = sessionStorage.getItem('mfa_userRole') || 'USER'
        sessionStorage.removeItem('mfa_userId')
        sessionStorage.removeItem('mfa_userEmail')
        sessionStorage.removeItem('mfa_userRole')
        
        // Update session to mark MFA as verified
        // The session should already be created from password auth
        // Refresh to get updated session
        router.refresh()
        
        // Redirect to the appropriate page
        setTimeout(() => {
          if (role === 'ADMIN') {
            router.push('/admin')
          } else {
            router.push('/user/contract-discovery')
          }
        }, 500)
      }
    } catch (err) {
      setError('Failed to verify MFA code')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/mactech.png"
              alt="MacTech Solutions"
              width={1800}
              height={360}
              className="h-16 w-auto mx-auto"
            />
          </Link>
        </div>

        {/* MFA Verification Form */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Verify Your Identity</h1>
          <p className="text-sm text-neutral-600 mb-6">
            Enter the 6-digit code from your authenticator app
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-neutral-700 mb-1">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition-colors text-center text-2xl tracking-widest"
                placeholder="000000"
                autoFocus
              />
              <p className="text-xs text-neutral-500 mt-1">
                Open your authenticator app and enter the code
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full py-2.5 bg-accent-700 text-white rounded-lg font-medium hover:bg-accent-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify and Sign In'}
            </button>

            <div className="text-center">
              <Link
                href="/auth/signin"
                className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                ← Back to sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

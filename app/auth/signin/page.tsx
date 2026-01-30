'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') ?? ''
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // First, check password and MFA requirements via custom API
      const customSignInResponse = await fetch('/api/auth/custom-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const customSignInData = await customSignInResponse.json()

      if (customSignInData.error) {
        setError(customSignInData.error)
        setIsLoading(false)
        return
      }

      // If password change required, complete authentication and redirect to password change
      // Password change must happen BEFORE MFA enrollment (NIST SP 800-171 Rev. 2, Section 3.5.9)
      if (customSignInData.requiresPasswordChange) {
        // Complete password authentication with NextAuth (session will be created)
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setError('Authentication failed')
          setIsLoading(false)
          return
        }

        // Redirect to password change page
        router.push('/auth/change-password?required=true')
        return
      }

      // If MFA enrollment required, create session first then redirect to enrollment
      if (customSignInData.requiresMFAEnrollment) {
        sessionStorage.setItem('mfa_userId', customSignInData.userId)
        sessionStorage.setItem('mfa_userEmail', customSignInData.userEmail)
        sessionStorage.setItem('mfa_userRole', customSignInData.userRole)
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })
        if (result?.error) {
          setError('Authentication failed')
          setIsLoading(false)
          return
        }
        router.push('/auth/mfa/enroll')
        return
      }

      // If MFA verification required, store user info and redirect to MFA verification
      if (customSignInData.requiresMFA) {
        sessionStorage.setItem('mfa_userId', customSignInData.userId)
        sessionStorage.setItem('mfa_userEmail', customSignInData.userEmail)
        sessionStorage.setItem('mfa_userRole', customSignInData.userRole)
        
        // Complete password authentication with NextAuth (session will be created)
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setError('Authentication failed')
          setIsLoading(false)
          return
        }

        // Redirect to MFA verification
        router.push('/auth/mfa/verify')
        return
      }

      // No MFA required, proceed with normal NextAuth sign-in
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid username or password')
      } else {
        // Fetch user role to determine redirect
        try {
          const userResponse = await fetch('/api/auth/session')
          const sessionData = await userResponse.json()
          
          // Redirect based on role - middleware will check for password change requirement
          // and redirect to change-password if needed
          if (sessionData?.user?.role === 'ADMIN') {
            router.push('/admin')
          } else if (sessionData?.user?.role === 'GUEST') {
            router.push(callbackUrl && callbackUrl.startsWith('/portal') ? callbackUrl : '/portal')
          } else {
            router.push(callbackUrl && callbackUrl.startsWith('/user') ? callbackUrl : '/user/contract-discovery')
          }
          router.refresh()
        } catch {
          router.push('/user/contract-discovery')
          router.refresh()
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
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

        {/* Sign In Form */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Sign In</h1>
          <p className="text-sm text-neutral-600 mb-6">
            Sign in to access your portal
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                Username or Email
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition-colors"
                placeholder="Enter username or email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-accent-700 text-white rounded-lg font-medium hover:bg-accent-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'User Login'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-200">
            <Link
              href="/"
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function SignInFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center text-neutral-500">Loading…</div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInForm />
    </Suspense>
  )
}

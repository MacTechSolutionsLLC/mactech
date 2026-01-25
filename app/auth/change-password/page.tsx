'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

function ChangePasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, update } = useSession()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRequired, setIsRequired] = useState(false)

  useEffect(() => {
    // Check if this is a required password change
    const required = searchParams.get('required') === 'true'
    setIsRequired(required)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!currentPassword) {
      setError('Current password is required')
      return
    }

    if (!newPassword) {
      setError('New password is required')
      return
    }

    if (newPassword.length < 14) {
      setError('New password must be at least 14 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to change password')
        setIsLoading(false)
        return
      }

      // Update session to reflect password change
      await update({
        mustChangePassword: false
      })

      // Redirect based on user role
      if (session?.user?.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/user/contract-discovery')
      }
      router.refresh()
    } catch (err) {
      setError('An error occurred. Please try again.')
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

        {/* Change Password Form */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            {isRequired ? 'Change Your Password' : 'Update Password'}
          </h1>
          {isRequired && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                You must change your password before continuing.
              </p>
            </div>
          )}
          <p className="text-sm text-neutral-600 mb-6">
            {isRequired
              ? 'Please set a new password to continue.'
              : 'Update your password to keep your account secure.'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition-colors"
                placeholder="Enter current password"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={14}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition-colors"
                placeholder="Enter new password (min. 14 characters)"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Password must be at least 14 characters long and meet complexity requirements
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={14}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition-colors"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-accent-700 text-white rounded-lg font-medium hover:bg-accent-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>

          {!isRequired && (
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <Link
                href="/admin"
                className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                ← Back to admin
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
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
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
            <p className="text-neutral-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ChangePasswordForm />
    </Suspense>
  )
}

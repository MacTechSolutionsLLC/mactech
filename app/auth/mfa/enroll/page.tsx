'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function MFAEnrollPage() {
  const router = useRouter()
  const [step, setStep] = useState<'loading' | 'qr' | 'verify' | 'success'>('loading')
  const [qrCode, setQrCode] = useState<string>('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [secret, setSecret] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if password change is required first
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((sessionData) => {
        // If password change is required, redirect to password change page
        if (sessionData?.user?.mustChangePassword) {
          router.push('/auth/change-password?required=true')
          return
        }
        
        // Fetch MFA enrollment data
        return fetch('/api/auth/mfa/enroll')
      })
      .then((res) => {
        if (!res) return // Already redirected
        return res.json()
      })
      .then((data) => {
        if (!data) return // Already redirected
        
        if (data.error) {
          // If error is about password change, redirect
          if (data.error.includes('Password change required')) {
            router.push('/auth/change-password?required=true')
            return
          }
          setError(data.error)
          setStep('qr')
        } else {
          setQrCode(data.qrCode)
          setBackupCodes(data.backupCodes)
          setSecret(data.secret)
          setStep('qr')
        }
      })
      .catch((err) => {
        console.error('MFA enrollment error:', err)
        setError('Failed to load MFA enrollment')
        setStep('qr')
      })
  }, [router])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!secret || !backupCodes.length) {
        setError('MFA enrollment data missing. Please refresh the page.')
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/auth/mfa/verify-enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret,
          code: verificationCode,
          backupCodes,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setIsLoading(false)
      } else {
        setStep('success')
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/admin')
          router.refresh()
        }, 2000)
      }
    } catch (err) {
      setError('Failed to verify MFA enrollment')
      setIsLoading(false)
    }
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-700 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading MFA enrollment...</p>
        </div>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-neutral-200 p-8 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">MFA Enabled Successfully</h1>
          <p className="text-neutral-600 mb-6">Your account is now protected with multi-factor authentication.</p>
          <p className="text-sm text-neutral-500">Redirecting...</p>
        </div>
      </div>
    )
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

        {/* MFA Enrollment Form */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Enable Multi-Factor Authentication</h1>
          <p className="text-sm text-neutral-600 mb-6">
            Scan the QR code with your authenticator app to set up MFA
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {step === 'qr' && (
            <div className="space-y-6">
              {/* QR Code */}
              <div className="flex justify-center">
                {qrCode && (
                  <div className="p-4 bg-white border-2 border-neutral-200 rounded-lg">
                    <Image
                      src={qrCode}
                      alt="MFA QR Code"
                      width={200}
                      height={200}
                      className="w-48 h-48"
                    />
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Setup Instructions:</h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Open your authenticator app (Google Authenticator, Authy, etc.)</li>
                  <li>Scan the QR code above</li>
                  <li>Enter the 6-digit code from your app below</li>
                </ol>
              </div>

              {/* Backup Codes */}
              {backupCodes.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Save Your Backup Codes</h3>
                  <p className="text-sm text-yellow-800 mb-2">
                    These codes can be used to access your account if you lose your authenticator device.
                    Save them in a secure location.
                  </p>
                  <div className="bg-white p-3 rounded border border-yellow-300 font-mono text-xs">
                    {backupCodes.map((code, i) => (
                      <div key={i} className="py-1">{code}</div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setStep('verify')}
                className="w-full py-2.5 bg-accent-700 text-white rounded-lg font-medium hover:bg-accent-800 transition-colors"
              >
                I&apos;ve Scanned the QR Code
              </button>
            </div>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-neutral-700 mb-1">
                  Enter Verification Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition-colors text-center text-2xl tracking-widest"
                  placeholder="000000"
                  autoFocus
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full py-2.5 bg-accent-700 text-white rounded-lg font-medium hover:bg-accent-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify and Enable MFA'}
              </button>

              <button
                type="button"
                onClick={() => setStep('qr')}
                className="w-full py-2 text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                ← Back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

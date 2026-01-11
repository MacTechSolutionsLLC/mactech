'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="mb-8">
          <h1 className="heading-hero mb-4 text-neutral-900">Something went wrong</h1>
          <h2 className="heading-2 mb-6 text-neutral-700">We&apos;re sorry for the inconvenience</h2>
          <p className="text-body-lg text-neutral-600 mb-8 leading-relaxed">
            An unexpected error occurred. Our team has been notified and is working to resolve the issue.
          </p>
          {error.digest && (
            <p className="text-body-sm text-neutral-500 mb-4">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={reset} className="btn-primary">
            Try Again
          </button>
          <Link href="/" className="btn-secondary">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}


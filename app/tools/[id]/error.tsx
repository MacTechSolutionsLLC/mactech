'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import ToolLayout from '@/components/tools/ToolLayout'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Tool page error:', error)
  }, [error])

  return (
    <ToolLayout toolId="error" toolName="Error">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="heading-hero mb-4 text-red-700">Something went wrong!</h1>
          <p className="text-body-lg text-neutral-700 mb-8">
            {error.message || 'An unexpected error occurred'}
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={reset} className="btn-primary">
              Try Again
            </button>
            <Link href="/showcase" className="btn-secondary">
              Back to Showcase
            </Link>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}


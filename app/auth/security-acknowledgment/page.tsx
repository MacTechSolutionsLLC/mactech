'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const SECURITY_ACKNOWLEDGMENT_VERSION = "1.0"

export default function SecurityAcknowledgmentPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [accepted, setAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!accepted) {
      setError("You must accept the security acknowledgment to continue")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Update user's security acknowledgment
      const response = await fetch('/api/auth/security-acknowledgment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: SECURITY_ACKNOWLEDGMENT_VERSION,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save acknowledgment')
      }

      // Update session
      await update()

      // Redirect based on user role
      if (session?.user?.role === 'ADMIN') {
        router.push('/admin')
      } else if (session?.user?.role === 'GUEST') {
        router.push('/portal')
      } else {
        router.push('/user/contract-discovery')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900">
            Security Acknowledgment
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Required before accessing the system
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Federal Contract Information (FCI) Handling
              </h3>
              <ul className="list-disc list-inside space-y-2 text-blue-800">
                <li>I understand my responsibility to protect Federal Contract Information (FCI) as defined by FAR 52.204-21</li>
                <li>I will access FCI only for authorized business purposes</li>
                <li>I will not disclose FCI to unauthorized individuals</li>
                <li>I will report any suspected FCI breaches or unauthorized access</li>
                <li>I will follow all organizational policies and procedures related to FCI handling</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-amber-900 mb-3">
                Controlled Unclassified Information (CUI) Handling
              </h3>
              <ul className="list-disc list-inside space-y-2 text-amber-800">
                <li>I understand my responsibility to protect Controlled Unclassified Information (CUI) as defined by 32 CFR Part 2002</li>
                <li>I will properly mark files containing CUI during upload</li>
                <li>I will use password protection when accessing CUI files</li>
                <li>I will follow CUI marking and handling requirements</li>
                <li>I will report any suspected CUI breaches or unauthorized access</li>
                <li>I understand that CUI files are stored separately and require password protection for access</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3">
                System Access and Security
              </h3>
              <ul className="list-disc list-inside space-y-2 text-yellow-800">
                <li>I understand that system access is granted based on business need and least privilege principles</li>
                <li>I will use my account only for authorized purposes</li>
                <li>I will not share my account credentials with anyone</li>
                <li>I will not attempt to access data or functions beyond my authorized scope</li>
                <li>I will report any suspected security incidents or unauthorized access attempts</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-3">
                Data Handling
              </h3>
              <ul className="list-disc list-inside space-y-2 text-green-800">
                <li>I understand that FCI and CUI are stored only in the cloud database and not on local devices</li>
                <li>I will not download FCI or CUI to local devices unless explicitly authorized</li>
                <li>I will not store FCI or CUI on removable media</li>
                <li>I will not print FCI or CUI unless authorized and necessary for business purposes</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="accept"
                name="accept"
                type="checkbox"
                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-neutral-300 rounded"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="accept" className="font-medium text-neutral-700">
                I have read and understand all statements above. I agree to comply with all requirements and understand the consequences of non-compliance.
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={!accepted || submitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Accept and Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

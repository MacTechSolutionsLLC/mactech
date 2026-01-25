'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface TemporaryPasswordData {
  temporaryPassword: string
  temporaryPasswordExpiresAt: string
  user: {
    email: string
    name: string | null
    role: string
  }
}

export default function CreateUserForm() {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [tempPasswordData, setTempPasswordData] = useState<TemporaryPasswordData | null>(null)
  const [passwordCopied, setPasswordCopied] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'USER' as 'USER' | 'ADMIN',
  })

  // Clear success message after 3 seconds
  const showSuccessMessage = (message: string) => {
    setSuccess(message)
    setTimeout(() => setSuccess(null), 3000)
  }

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (email: string) => {
    setFormData({ ...formData, email })
    if (email && !validateEmail(email)) {
      setFieldErrors({ ...fieldErrors, email: 'Please enter a valid email address' })
    } else {
      const { email: _, ...rest } = fieldErrors
      setFieldErrors(rest)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setPasswordCopied(true)
      setTimeout(() => setPasswordCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const formatExpirationDate = (expiresAt: string): string => {
    const date = new Date(expiresAt)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    // Client-side validation
    if (!formData.email) {
      setFieldErrors({ email: 'Email is required' })
      return
    }
    if (!validateEmail(formData.email)) {
      setFieldErrors({ email: 'Please enter a valid email address' })
      return
    }

    setLoading(true)
    setError(null)
    setTempPasswordData(null)

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          role: formData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle field-specific errors
        if (data.errors && Array.isArray(data.errors)) {
          const errors: Record<string, string> = {}
          data.errors.forEach((err: string) => {
            if (err.includes('email')) errors.email = err
          })
          setFieldErrors(errors)
        }
        throw new Error(data.error || 'Failed to create user')
      }

      // Store temporary password data for display
      if (data.temporaryPassword && data.temporaryPasswordExpiresAt) {
        setTempPasswordData({
          temporaryPassword: data.temporaryPassword,
          temporaryPasswordExpiresAt: data.temporaryPasswordExpiresAt,
          user: data.user,
        })
      }

      showSuccessMessage(`User ${data.user.email} created successfully!`)
      setFieldErrors({})
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-2.5 bg-accent-700 text-white rounded-lg hover:bg-accent-800 font-medium transition-colors shadow-sm hover:shadow"
        >
          + Create New User
        </button>
        <p className="text-sm text-neutral-500">
          Add a new user account to the system
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">Create New User</h2>
        <button
          onClick={() => {
            setShowForm(false)
            setFormData({
              email: '',
              name: '',
              role: 'USER',
            })
            setError(null)
            setFieldErrors({})
            setSuccess(null)
            setTempPasswordData(null)
          }}
          className="text-neutral-500 hover:text-neutral-700 text-xl leading-none"
          aria-label="Close form"
        >
          ×
        </button>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Temporary Password Display Modal */}
      {tempPasswordData && (
        <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-yellow-900 mb-1">
                ⚠️ Temporary Password Generated
              </h3>
              <p className="text-xs text-yellow-800">
                A temporary password has been automatically generated for this user. 
                Provide this password securely to the user (out of band, not via email).
              </p>
            </div>
            <button
              onClick={() => setTempPasswordData(null)}
              className="text-yellow-700 hover:text-yellow-900 text-lg leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          
          <div className="bg-white rounded border border-yellow-300 p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-neutral-700">Temporary Password:</label>
              <button
                onClick={() => copyToClipboard(tempPasswordData.temporaryPassword)}
                className="text-xs text-accent-700 hover:text-accent-900 font-medium"
              >
                {passwordCopied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <div className="font-mono text-sm bg-neutral-50 p-2 rounded border border-neutral-200 break-all">
              {tempPasswordData.temporaryPassword}
            </div>
          </div>

          <div className="text-xs text-yellow-800 space-y-1">
            <p>
              <strong>Expires:</strong> {formatExpirationDate(tempPasswordData.temporaryPasswordExpiresAt)} (72 hours from now)
            </p>
            <p>
              <strong>User:</strong> {tempPasswordData.user.email}
            </p>
            <p className="mt-2 text-yellow-900 font-medium">
              ⚠️ Important: The user must change this password on first login. 
              This password will expire in 72 hours if not changed.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 ${
              fieldErrors.email ? 'border-red-300' : 'border-neutral-300'
            }`}
            placeholder="user@example.com"
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-800">
            <strong>ℹ️ Automatic Password Generation:</strong> A secure temporary password will be automatically 
            generated for this user. The password will expire in 72 hours and the user will be required to 
            change it on first login.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Name (optional)
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
            placeholder="Full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'USER' | 'ADMIN' })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
          >
            <option value="USER">USER - Standard user access</option>
            <option value="ADMIN">ADMIN - Full administrative access</option>
          </select>
          <p className="mt-1 text-xs text-neutral-500">
            {formData.role === 'USER'
              ? 'Users can access the user portal and manage contracts'
              : 'Admins have full system access including user management'}
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || Object.keys(fieldErrors).length > 0}
            className="px-6 py-2 bg-accent-700 text-white rounded-lg hover:bg-accent-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false)
              setFormData({
                email: '',
                name: '',
                role: 'USER',
              })
              setError(null)
              setFieldErrors({})
              setSuccess(null)
              setTempPasswordData(null)
            }}
            disabled={loading}
            className="px-6 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 font-medium disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

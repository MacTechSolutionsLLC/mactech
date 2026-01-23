'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateUserForm() {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

  // Calculate password strength
  const getPasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong', score: number } => {
    let score = 0
    if (password.length >= 14) score += 1
    if (password.length >= 20) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^a-zA-Z0-9]/.test(password)) score += 1

    if (score <= 2) return { strength: 'weak', score }
    if (score <= 4) return { strength: 'medium', score }
    return { strength: 'strong', score }
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

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password })
    if (password && password.length < 14) {
      setFieldErrors({ ...fieldErrors, password: 'Password must be at least 14 characters' })
    } else {
      const { password: _, ...rest } = fieldErrors
      setFieldErrors(rest)
    }
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
    if (!formData.password) {
      setFieldErrors({ password: 'Password is required' })
      return
    }
    if (formData.password.length < 14) {
      setFieldErrors({ password: 'Password must be at least 14 characters' })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle field-specific errors
        if (data.errors && Array.isArray(data.errors)) {
          const errors: Record<string, string> = {}
          data.errors.forEach((err: string) => {
            if (err.includes('email')) errors.email = err
            if (err.includes('password')) errors.password = err
          })
          setFieldErrors(errors)
        }
        throw new Error(data.error || 'Failed to create user')
      }

      showSuccessMessage(`User ${data.user.email} created successfully!`)
      setShowForm(false)
      setFormData({
        email: '',
        password: '',
        name: '',
        role: 'USER',
      })
      setFieldErrors({})
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
      >
        Create User
      </button>
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
              password: '',
              name: '',
              role: 'USER',
            })
            setError(null)
            setFieldErrors({})
            setSuccess(null)
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

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Password <span className="text-red-500">*</span> (min 14 characters)
          </label>
          <input
            type="password"
            required
            minLength={14}
            value={formData.password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 ${
              fieldErrors.password ? 'border-red-300' : 'border-neutral-300'
            }`}
            placeholder="Enter secure password"
          />
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
          )}
          {passwordStrength && !fieldErrors.password && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      passwordStrength.strength === 'weak'
                        ? 'bg-red-500 w-1/3'
                        : passwordStrength.strength === 'medium'
                        ? 'bg-yellow-500 w-2/3'
                        : 'bg-green-500 w-full'
                    }`}
                  />
                </div>
                <span className={`text-xs font-medium ${
                  passwordStrength.strength === 'weak'
                    ? 'text-red-600'
                    : passwordStrength.strength === 'medium'
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}>
                  {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Password must be at least 14 characters and meet security requirements
              </p>
            </div>
          )}
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
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false)
              setFormData({
                email: '',
                password: '',
                name: '',
                role: 'USER',
              })
              setError(null)
              setFieldErrors({})
              setSuccess(null)
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

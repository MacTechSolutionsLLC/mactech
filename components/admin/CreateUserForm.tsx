'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateUserForm() {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'USER' as 'USER' | 'ADMIN',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

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
        if (data.requiresReauth) {
          setError("Admin re-authentication required. Please re-authenticate and try again.")
          return
        }
        throw new Error(data.error || 'Failed to create user')
      }

      alert(`User ${data.user.email} created successfully!`)
      setShowForm(false)
      setFormData({
        email: '',
        password: '',
        name: '',
        role: 'USER',
      })
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
      >
        Create User
      </button>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
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
          }}
          className="text-neutral-500 hover:text-neutral-700"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Password * (min 14 characters)
          </label>
          <input
            type="password"
            required
            minLength={14}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Password must be at least 14 characters and meet security requirements
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
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Role *
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'USER' | 'ADMIN' })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
            }}
            className="px-6 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

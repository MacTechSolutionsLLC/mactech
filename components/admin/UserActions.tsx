'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  role: string
  disabled: boolean
}

interface UserActionsProps {
  user: User
}

export default function UserActions({ user }: UserActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDisable = async () => {
    if (!confirm(`Are you sure you want to ${user.disabled ? 'enable' : 'disable'} ${user.email}?`)) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          disabled: !user.disabled,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.requiresReauth) {
          setError("Admin re-authentication required. Please re-authenticate and try again.")
          return
        }
        throw new Error(data.error || 'Failed to update user')
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (newRole: string) => {
    if (!confirm(`Change ${user.email} role from ${user.role} to ${newRole}?`)) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: newRole,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.requiresReauth) {
          setError("Admin re-authentication required. Please re-authenticate and try again.")
          return
        }
        throw new Error(data.error || 'Failed to update user')
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <div className="text-xs text-red-600 mr-2">{error}</div>
      )}
      <button
        onClick={handleDisable}
        disabled={loading}
        className={`px-3 py-1 text-xs font-medium rounded ${
          user.disabled
            ? "bg-green-100 text-green-800 hover:bg-green-200"
            : "bg-red-100 text-red-800 hover:bg-red-200"
        } disabled:opacity-50`}
      >
        {user.disabled ? "Enable" : "Disable"}
      </button>
      {user.role === "USER" && (
        <button
          onClick={() => handleRoleChange("ADMIN")}
          disabled={loading}
          className="px-3 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800 hover:bg-purple-200 disabled:opacity-50"
        >
          Make Admin
        </button>
      )}
      {user.role === "ADMIN" && (
        <button
          onClick={() => handleRoleChange("USER")}
          disabled={loading}
          className="px-3 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-50"
        >
          Make User
        </button>
      )}
    </div>
  )
}

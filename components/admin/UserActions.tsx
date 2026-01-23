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
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)

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

  const handlePasswordReset = async () => {
    if (!newPassword) {
      setPasswordError('Password is required')
      return
    }

    if (newPassword.length < 14) {
      setPasswordError('Password must be at least 14 characters')
      return
    }

    setLoading(true)
    setError(null)
    setPasswordError(null)

    try {
      const response = await fetch('/api/admin/reset-user-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.requiresReauth) {
          setError("Admin re-authentication required. Please re-authenticate and try again.")
          return
        }
        throw new Error(data.error || 'Failed to reset password')
      }

      alert(`Password reset successfully for ${user.email}. User will be required to change password on next login.`)
      setShowPasswordReset(false)
      setNewPassword('')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      if (err.message?.includes('Password does not meet requirements')) {
        setPasswordError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <div className="text-xs text-red-600">{error}</div>
      )}
      <div className="flex items-center gap-2 flex-wrap">
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
        <button
          onClick={() => setShowPasswordReset(!showPasswordReset)}
          disabled={loading}
          className="px-3 py-1 text-xs font-medium rounded bg-orange-100 text-orange-800 hover:bg-orange-200 disabled:opacity-50"
        >
          Reset Password
        </button>
      </div>
      {showPasswordReset && (
        <div className="mt-2 p-3 bg-neutral-50 rounded border border-neutral-200">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                New Password (min 14 characters)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  setPasswordError(null)
                }}
                className="w-full px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                placeholder="Enter new password"
              />
              {passwordError && (
                <p className="text-xs text-red-600 mt-1">{passwordError}</p>
              )}
            </div>
            <button
              onClick={handlePasswordReset}
              disabled={loading || !newPassword}
              className="px-4 py-1.5 text-xs font-medium bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
            <button
              onClick={() => {
                setShowPasswordReset(false)
                setNewPassword('')
                setPasswordError(null)
              }}
              className="px-3 py-1.5 text-xs font-medium bg-neutral-200 text-neutral-700 rounded hover:bg-neutral-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

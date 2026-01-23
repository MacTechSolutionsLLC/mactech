'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

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
  const { update: updateSession } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showReauth, setShowReauth] = useState(false)
  const [reauthPassword, setReauthPassword] = useState('')
  const [reauthError, setReauthError] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null)

  const handleReauth = async () => {
    if (!reauthPassword) {
      setReauthError('Password is required')
      return
    }

    setReauthError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/admin/reauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: reauthPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        setReauthError(data.error || 'Re-authentication failed')
        return
      }

      // Update session to set re-auth flag
      await updateSession({ adminReauthVerified: true })

      // Close re-auth modal
      setShowReauth(false)
      setReauthPassword('')
      setReauthError(null)

      // Retry pending action if any
      if (pendingAction) {
        await pendingAction()
        setPendingAction(null)
      }
    } catch (err: any) {
      setReauthError(err.message || 'Re-authentication failed')
    } finally {
      setLoading(false)
    }
  }

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
          setPendingAction(() => () => handleDisable())
          setShowReauth(true)
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
          setPendingAction(() => () => handleRoleChange(newRole))
          setShowReauth(true)
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
          // Capture the password value for retry
          const capturedPassword = newPassword
          setPendingAction(() => async () => {
            // Temporarily set the password back for the retry
            setNewPassword(capturedPassword)
            await handlePasswordReset()
          })
          setShowReauth(true)
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
      
      {/* Re-authentication Modal */}
      {showReauth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Admin Re-authentication Required</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Please enter your password to continue with this sensitive action.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={reauthPassword}
                onChange={(e) => {
                  setReauthPassword(e.target.value)
                  setReauthError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && reauthPassword) {
                    handleReauth()
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                placeholder="Enter your password"
                autoFocus
              />
              {reauthError && (
                <p className="text-xs text-red-600 mt-1">{reauthError}</p>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowReauth(false)
                  setReauthPassword('')
                  setReauthError(null)
                  setPendingAction(null)
                }}
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded hover:bg-neutral-200"
              >
                Cancel
              </button>
              <button
                onClick={handleReauth}
                disabled={loading || !reauthPassword}
                className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Re-authenticate'}
              </button>
            </div>
          </div>
        </div>
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

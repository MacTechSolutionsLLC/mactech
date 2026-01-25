'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import UserDetailsModal from './UserDetailsModal'

interface User {
  id: string
  email: string
  role: string
  disabled: boolean
  name?: string | null
  lastLoginAt?: Date | null
  createdAt?: Date
  securityAcknowledgmentAcceptedAt?: Date | null
}

interface UserActionsProps {
  user: User
}

export default function UserActions({ user }: UserActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    type: 'disable' | 'enable' | 'role'
    message: string
    action: () => Promise<void>
  } | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  // Clear success message after 3 seconds
  const showSuccessMessage = (message: string) => {
    setSuccess(message)
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleDisable = async () => {
    setShowConfirmDialog({
      type: user.disabled ? 'enable' : 'disable',
      message: `Are you sure you want to ${user.disabled ? 'enable' : 'disable'} ${user.email}?`,
      action: async () => {
        setLoading(true)
        setError(null)
        setShowConfirmDialog(null)

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
            throw new Error(data.error || 'Failed to update user')
          }

          showSuccessMessage(`User ${user.disabled ? 'enabled' : 'disabled'} successfully`)
          router.refresh()
        } catch (err: any) {
          setError(err.message || 'An error occurred')
        } finally {
          setLoading(false)
        }
      }
    })
  }

  const handleRoleChange = async (newRole: string) => {
    setShowConfirmDialog({
      type: 'role',
      message: `Change ${user.email} role from ${user.role} to ${newRole}? This will immediately affect their access permissions.`,
      action: async () => {
        setLoading(true)
        setError(null)
        setShowConfirmDialog(null)

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
            throw new Error(data.error || 'Failed to update user')
          }

          showSuccessMessage(`User role changed to ${newRole} successfully`)
          router.refresh()
        } catch (err: any) {
          setError(err.message || 'An error occurred')
        } finally {
          setLoading(false)
        }
      }
    })
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
        throw new Error(data.error || 'Failed to reset password')
      }

      showSuccessMessage(`Password reset successfully for ${user.email}`)
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
    <>
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Confirm Action</h3>
            <p className="text-sm text-neutral-600 mb-6">{showConfirmDialog.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(null)}
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded hover:bg-neutral-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={showConfirmDialog.action}
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white rounded hover:opacity-90 disabled:opacity-50 ${
                  showConfirmDialog.type === 'disable' 
                    ? 'bg-red-600' 
                    : showConfirmDialog.type === 'enable'
                    ? 'bg-green-600'
                    : 'bg-blue-600'
                }`}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative" ref={dropdownRef}>
        {/* Success Message */}
        {success && (
          <div className="mb-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded px-2 py-1">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
            {error}
          </div>
        )}

        {/* Dropdown Button */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-medium rounded bg-neutral-100 text-neutral-700 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          aria-label="User actions menu"
        >
          <span>Actions</span>
          <svg
            className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 z-50 py-1">
            {/* Account Actions Section */}
            <div className="px-3 py-2 border-b border-neutral-200">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                Account Actions
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false)
                    handleDisable()
                  }}
                  disabled={loading}
                  className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                    user.disabled
                      ? "text-green-700 hover:bg-green-50"
                      : "text-red-700 hover:bg-red-50"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? '...' : user.disabled ? "Enable User" : "Disable User"}
                </button>
                {user.role === "USER" && (
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false)
                      handleRoleChange("ADMIN")
                    }}
                    disabled={loading}
                    className="w-full text-left px-3 py-2 text-sm text-purple-700 rounded hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? '...' : 'Make Admin'}
                  </button>
                )}
                {user.role === "ADMIN" && (
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false)
                      handleRoleChange("USER")
                    }}
                    disabled={loading}
                    className="w-full text-left px-3 py-2 text-sm text-blue-700 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? '...' : 'Make User'}
                  </button>
                )}
              </div>
            </div>

            {/* Security Actions Section */}
            <div className="px-3 py-2">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                Security Actions
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false)
                    setShowPasswordReset(!showPasswordReset)
                  }}
                  disabled={loading}
                  className="w-full text-left px-3 py-2 text-sm text-orange-700 rounded hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Reset Password
                </button>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false)
                    setShowUserDetails(true)
                  }}
                  disabled={loading}
                  className="w-full text-left px-3 py-2 text-sm text-neutral-700 rounded hover:bg-neutral-50 disabled:opacity-50 transition-colors"
                >
                  View Details
                </button>
                <Link
                  href={`/admin/events?actorUserId=${user.id}`}
                  onClick={() => setIsDropdownOpen(false)}
                  className="block w-full text-left px-3 py-2 text-sm text-neutral-700 rounded hover:bg-neutral-50 transition-colors"
                >
                  View Activity
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Password Reset Form */}
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
                  disabled={loading}
                />
                {passwordError && (
                  <p className="text-xs text-red-600 mt-1">{passwordError}</p>
                )}
              </div>
              <button
                onClick={handlePasswordReset}
                disabled={loading || !newPassword}
                className="px-4 py-1.5 text-xs font-medium bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Resetting...' : 'Reset'}
              </button>
              <button
                onClick={() => {
                  setShowPasswordReset(false)
                  setNewPassword('')
                  setPasswordError(null)
                }}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-medium bg-neutral-200 text-neutral-700 rounded hover:bg-neutral-300 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        user={{
          id: user.id,
          email: user.email,
          name: user.name || null,
          role: user.role,
          disabled: user.disabled,
          lastLoginAt: user.lastLoginAt || null,
          createdAt: user.createdAt || new Date(),
          securityAcknowledgmentAcceptedAt: user.securityAcknowledgmentAcceptedAt || null,
        }}
        isOpen={showUserDetails}
        onClose={() => setShowUserDetails(false)}
      />
    </>
  )
}

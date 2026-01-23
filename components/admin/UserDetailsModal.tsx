'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  disabled: boolean
  lastLoginAt: Date | null
  createdAt: Date
  securityAcknowledgmentAcceptedAt: Date | null
}

interface UserDetailsModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
}

export default function UserDetailsModal({ user, isOpen, onClose }: UserDetailsModalProps) {
  const [activityCount, setActivityCount] = useState<number | null>(null)

  useEffect(() => {
    if (isOpen && user.id) {
      // Fetch activity count
      fetch(`/api/admin/events?actorUserId=${user.id}&limit=1`)
        .then(res => res.json())
        .then(data => {
          if (data.total !== undefined) {
            setActivityCount(data.total)
          }
        })
        .catch(() => setActivityCount(null))
    }
  }, [isOpen, user.id])

  if (!isOpen) return null

  const formatDate = (date: Date | null) => {
    if (!date) return "Never"
    return new Date(date).toLocaleString()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">User Details</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
              Basic Information
            </h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-neutral-500">Email</dt>
                <dd className="mt-1 text-sm text-neutral-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">Name</dt>
                <dd className="mt-1 text-sm text-neutral-900">{user.name || "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">Role</dt>
                <dd className="mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    user.role === "ADMIN"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {user.role}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">Status</dt>
                <dd className="mt-1">
                  {user.disabled ? (
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                      Disabled
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      Active
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Account Activity */}
          <div>
            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
              Account Activity
            </h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-neutral-500">Account Created</dt>
                <dd className="mt-1 text-sm text-neutral-900">{formatDate(user.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">Last Login</dt>
                <dd className="mt-1 text-sm text-neutral-900">{formatDate(user.lastLoginAt)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">Security Acknowledgment</dt>
                <dd className="mt-1">
                  {user.securityAcknowledgmentAcceptedAt ? (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      Accepted {formatDate(user.securityAcknowledgmentAcceptedAt)}
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                      Required
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">Activity Events</dt>
                <dd className="mt-1 text-sm text-neutral-900">
                  {activityCount !== null ? (
                    <Link
                      href={`/admin/events?actorUserId=${user.id}`}
                      className="text-primary-600 hover:text-primary-700 underline"
                    >
                      {activityCount} events
                    </Link>
                  ) : (
                    "Loading..."
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/events?actorUserId=${user.id}`}
                className="px-3 py-2 text-sm font-medium bg-neutral-100 text-neutral-700 rounded hover:bg-neutral-200 transition-colors"
              >
                View Activity Log
              </Link>
              <button
                onClick={onClose}
                className="px-3 py-2 text-sm font-medium bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                Manage User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

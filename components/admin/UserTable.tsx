'use client'

import { useState } from 'react'
import UserActions from './UserActions'

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

interface UserTableProps {
  users: User[]
}

export default function UserTable({ users }: UserTableProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "Never"
    return new Date(date).toLocaleString()
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Last Login
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Security Ack
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {users.map((user) => (
            <tr key={user.id} className={user.disabled ? "bg-red-50" : "hover:bg-neutral-50"}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                {user.name || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  user.role === "ADMIN"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                {formatDate(user.lastLoginAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {user.securityAcknowledgmentAcceptedAt ? (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                    Accepted
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                    Required
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {user.disabled ? (
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                    Disabled
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                    Active
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <UserActions user={user} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

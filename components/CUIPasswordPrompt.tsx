'use client'

import { useState } from 'react'

interface CUIPasswordPromptProps {
  fileId: string
  filename: string
  onSuccess: () => void
  onCancel: () => void
}

export default function CUIPasswordPrompt({
  fileId,
  filename,
  onSuccess,
  onCancel,
}: CUIPasswordPromptProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Call CUI download API with password
      const response = await fetch(`/api/files/cui/${fileId}?password=${encodeURIComponent(password)}`)
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Invalid password')
      }

      // Get the file blob
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to download CUI file')
      setPassword('') // Clear password on error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          CUI File Access
        </h2>
        <p className="text-sm text-neutral-600 mb-4">
          This file contains Controlled Unclassified Information (CUI) and requires password protection.
        </p>
        <p className="text-sm font-medium text-neutral-900 mb-4">
          File: <span className="font-normal">{filename}</span>
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="cui-password" className="block text-sm font-medium text-neutral-700 mb-2">
              Enter CUI Password
            </label>
            <input
              id="cui-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter password"
              autoFocus
              disabled={loading}
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Access File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

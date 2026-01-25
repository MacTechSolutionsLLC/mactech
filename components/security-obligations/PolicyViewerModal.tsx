'use client'

import { useState, useEffect } from 'react'
import MarkdownRenderer from '@/components/compliance/MarkdownRenderer'

interface PolicyViewerModalProps {
  isOpen: boolean
  onClose: () => void
  policyName: string
  policyPath: string
}

export default function PolicyViewerModal({
  isOpen,
  onClose,
  policyName,
  policyPath,
}: PolicyViewerModalProps) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && policyPath) {
      setLoading(true)
      setError(null)
      setContent(null)

      fetch(`/api/policies/${encodeURIComponent(policyPath)}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to load policy')
          }
          return response.text()
        })
        .then((text) => {
          setContent(text)
          setLoading(false)
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to load policy')
          setLoading(false)
        })
    }
  }, [isOpen, policyPath])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-2xl font-bold text-neutral-900">{policyName}</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 100px)' }}>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-700"></div>
              <span className="ml-3 text-neutral-600">Loading policy...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-sm">
              <p className="text-sm text-red-800 font-semibold mb-2">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {content && (
            <MarkdownRenderer content={content} className="max-w-none" />
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200 bg-neutral-50">
          <button
            onClick={onClose}
            className="btn-primary text-sm px-6 py-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

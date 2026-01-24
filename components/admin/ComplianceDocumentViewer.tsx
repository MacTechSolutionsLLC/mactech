'use client'

import { useEffect, useState } from 'react'
import MarkdownRenderer from '@/components/compliance/MarkdownRenderer'

interface ComplianceDocumentViewerProps {
  filePath: string | null
}

export default function ComplianceDocumentViewer({ filePath }: ComplianceDocumentViewerProps) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!filePath) {
      setContent(null)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    fetch(`/api/admin/compliance/files/read?path=${encodeURIComponent(filePath)}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to load file')
        }
        return res.json()
      })
      .then((data) => {
        setContent(data.content)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error loading file:', err)
        setError(err.message || 'Failed to load file')
        setLoading(false)
        setContent(null)
      })
  }, [filePath])

  if (!filePath) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-neutral-700 mb-2">
            No Document Selected
          </h3>
          <p className="text-sm text-neutral-500">
            Select a document from the file tree to view its contents
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-sm text-neutral-600">Loading document...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-50">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Error Loading Document
          </h3>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <p className="text-sm text-neutral-500">No content available</p>
        </div>
      </div>
    )
  }

  const filename = filePath.split('/').pop() || filePath
  const documentUrl = `/admin/compliance/document?path=${encodeURIComponent(filePath)}`

  const handleOpenInNewTab = () => {
    window.open(documentUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="h-full flex flex-col bg-white min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-neutral-200 bg-neutral-50 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-neutral-900 mb-1">{filename}</h2>
            <p className="text-xs text-neutral-500 font-mono truncate">{filePath}</p>
          </div>
          <button
            onClick={handleOpenInNewTab}
            className="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors flex items-center gap-2"
            title="Open in new tab"
          >
            <span>🔗</span>
            <span>Open in New Tab</span>
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 min-h-0">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  )
}

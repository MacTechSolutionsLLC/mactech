'use client'

import { useState, useEffect } from 'react'
import MarkdownRenderer from './MarkdownRenderer'

interface DocumentViewerModalProps {
  isOpen: boolean
  onClose: () => void
  documentPath: string
  documentName?: string
}

export default function DocumentViewerModal({
  isOpen,
  onClose,
  documentPath,
  documentName,
}: DocumentViewerModalProps) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && documentPath) {
      setLoading(true)
      setError(null)
      setContent(null)

      // Determine if it's a code file or markdown file
      const isCodeFile = documentPath.match(/\.(ts|tsx|js|jsx|py|java|cpp|c|h)$/i)
      const isMarkdown = documentPath.endsWith('.md')

      if (isCodeFile) {
        // For code files, fetch from GitHub raw or use a code viewer API
        // For now, we'll try to fetch it as text
        fetch(`/api/compliance/document?path=${encodeURIComponent(documentPath)}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Failed to load document')
            }
            return response.text()
          })
          .then((text) => {
            setContent(text)
            setLoading(false)
          })
          .catch((err) => {
            setError(err instanceof Error ? err.message : 'Failed to load document')
            setLoading(false)
          })
      } else if (isMarkdown) {
        // For markdown files, use the same API
        fetch(`/api/compliance/document?path=${encodeURIComponent(documentPath)}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Failed to load document')
            }
            return response.text()
          })
          .then((text) => {
            setContent(text)
            setLoading(false)
          })
          .catch((err) => {
            setError(err instanceof Error ? err.message : 'Failed to load document')
            setLoading(false)
          })
      } else {
        setError('Unsupported file type')
        setLoading(false)
      }
    }
  }, [isOpen, documentPath])

  if (!isOpen) return null

  const isCodeFile = documentPath.match(/\.(ts|tsx|js|jsx|py|java|cpp|c|h)$/i)
  const isMarkdown = documentPath.endsWith('.md')
  const displayName = documentName || documentPath.split('/').pop() || 'Document'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">{displayName}</h2>
            <p className="text-xs text-neutral-500 font-mono mt-1">{documentPath}</p>
          </div>
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
              <span className="ml-3 text-neutral-600">Loading document...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-sm">
              <p className="text-sm text-red-800 font-semibold mb-2">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {content && (
            <>
              {isMarkdown ? (
                <MarkdownRenderer content={content} currentDocumentPath={documentPath} className="max-w-none" />
              ) : isCodeFile ? (
                <div className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    <code>{content}</code>
                  </pre>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm">{content}</pre>
                </div>
              )}
            </>
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

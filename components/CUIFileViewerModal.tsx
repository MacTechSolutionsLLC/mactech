'use client'

import { useEffect } from 'react'

interface CUIFileViewerModalProps {
  fileId: string
  filename: string
  viewUrl?: string
  isOpen: boolean
  onClose: () => void
}

export default function CUIFileViewerModal({
  fileId,
  filename,
  viewUrl,
  isOpen,
  onClose,
}: CUIFileViewerModalProps) {
  useEffect(() => {
    if (isOpen && viewUrl) {
      window.open(viewUrl, '_blank', 'noopener,noreferrer')
    }
  }, [isOpen, viewUrl])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-neutral-50">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-neutral-900 mb-1">{filename}</h2>
            <div className="flex items-center gap-4 text-sm text-neutral-600">
              <span>Secure Viewer</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 text-2xl font-bold ml-4"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Security Notice:</strong> This CUI file is view-only. No download or local storage is permitted.
            CUI bytes never transit Railway.
          </p>
        </div>

        <div className="p-6">
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <p className="text-sm font-medium">Secure viewer opened in a new tab.</p>
            <p className="text-xs mt-1">
              CUI file bytes are delivered directly from the vault. Railway never receives CUI bytes.
            </p>
            {viewUrl && (
              <div className="mt-3">
                <a
                  href={viewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-700 underline"
                >
                  Open secure viewer
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-neutral-200 bg-neutral-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-800 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'

interface CUIFileViewerModalProps {
  fileId: string
  filename: string
  fileData: string // base64-encoded file data
  mimeType: string
  size: number
  isOpen: boolean
  onClose: () => void
}

export default function CUIFileViewerModal({
  fileId,
  filename,
  fileData,
  mimeType,
  size,
  isOpen,
  onClose,
}: CUIFileViewerModalProps) {
  const [decodedText, setDecodedText] = useState<string | null>(null)
  const [csvRows, setCsvRows] = useState<string[][]>([])

  // Clear file data when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDecodedText(null)
      setCsvRows([])
    }
  }, [isOpen])

  // Decode base64 data for text-based files
  useEffect(() => {
    if (isOpen && fileData) {
      if (mimeType.startsWith('text/') || mimeType === 'application/json' || mimeType === 'application/csv') {
        try {
          const decoded = atob(fileData)
          setDecodedText(decoded)
          
          // Parse CSV if applicable
          if (mimeType === 'text/csv' || mimeType === 'application/csv' || filename.endsWith('.csv')) {
            const lines = decoded.split('\n').filter(line => line.trim())
            const rows = lines.map(line => {
              // Simple CSV parsing (handles quoted fields)
              const result: string[] = []
              let current = ''
              let inQuotes = false
              
              for (let i = 0; i < line.length; i++) {
                const char = line[i]
                if (char === '"') {
                  inQuotes = !inQuotes
                } else if (char === ',' && !inQuotes) {
                  result.push(current.trim())
                  current = ''
                } else {
                  current += char
                }
              }
              result.push(current.trim())
              return result
            })
            setCsvRows(rows)
          }
        } catch (error) {
          console.error('Error decoding file data:', error)
          setDecodedText('Error decoding file content')
        }
      }
    }
  }, [isOpen, fileData, mimeType, filename])

  if (!isOpen) return null

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const renderContent = () => {
    // PDF files
    if (mimeType === 'application/pdf') {
      return (
        <iframe
          src={`data:application/pdf;base64,${fileData}`}
          className="w-full h-full border-0"
          style={{ minHeight: '600px' }}
          title={filename}
        />
      )
    }

    // Image files
    if (mimeType.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center p-4">
          <img
            src={`data:${mimeType};base64,${fileData}`}
            alt={filename}
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>
      )
    }

    // CSV files - display as table
    if ((mimeType === 'text/csv' || mimeType === 'application/csv' || filename.endsWith('.csv')) && csvRows.length > 0) {
      return (
        <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
          <table className="min-w-full divide-y divide-neutral-200 border border-neutral-300">
            <thead className="bg-neutral-50">
              {csvRows.length > 0 && (
                <tr>
                  {csvRows[0].map((header, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider border-b border-neutral-300"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              )}
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {csvRows.slice(1).map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-neutral-50">
                  {row.map((cell, cellIdx) => (
                    <td
                      key={cellIdx}
                      className="px-4 py-2 text-sm text-neutral-900 border-r border-neutral-200 last:border-r-0"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    // Text files
    if (mimeType.startsWith('text/') || mimeType === 'application/json') {
      if (decodedText === null) {
        return (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-neutral-600">Loading content...</span>
          </div>
        )
      }

      // JSON formatting
      if (mimeType === 'application/json') {
        try {
          const jsonObj = JSON.parse(decodedText)
          const formatted = JSON.stringify(jsonObj, null, 2)
          return (
            <div className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-auto" style={{ maxHeight: '70vh' }}>
              <pre className="text-sm font-mono whitespace-pre-wrap">
                <code>{formatted}</code>
              </pre>
            </div>
          )
        } catch {
          // If JSON parsing fails, show as plain text
        }
      }

      return (
        <textarea
          readOnly
          value={decodedText}
          className="w-full h-full font-mono text-sm p-4 border border-neutral-300 rounded-lg resize-none"
          style={{ minHeight: '400px', maxHeight: '70vh' }}
        />
      )
    }

    // Unsupported file types
    return (
      <div className="text-center p-8">
        <div className="text-6xl mb-4">📄</div>
        <p className="text-lg font-medium text-neutral-700 mb-2">Preview not available for this file type</p>
        <p className="text-sm text-neutral-500 mb-1">File: <span className="font-medium">{filename}</span></p>
        <p className="text-sm text-neutral-500 mb-1">Type: <span className="font-medium">{mimeType}</span></p>
        <p className="text-sm text-neutral-500">Size: <span className="font-medium">{formatFileSize(size)}</span></p>
        <p className="text-xs text-neutral-400 mt-4">
          This file type cannot be previewed in the browser. CUI files are view-only and cannot be downloaded.
        </p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-neutral-50">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-neutral-900 mb-1">{filename}</h2>
            <div className="flex items-center gap-4 text-sm text-neutral-600">
              <span>Type: {mimeType}</span>
              <span>Size: {formatFileSize(size)}</span>
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

        {/* Security Notice */}
        <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Security Notice:</strong> This CUI file is view-only. No download or local storage is permitted. 
            File data is cleared from memory when this modal is closed.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-6" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200 bg-neutral-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

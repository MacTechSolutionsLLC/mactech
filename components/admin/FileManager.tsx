'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CUIWarningBanner from '@/components/CUIWarningBanner'

interface File {
  id: string
  filename: string
  mimeType: string
  size: number
  uploadedAt: Date
  uploader: {
    id: string
    email: string
    name: string | null
  }
}

interface FileManagerProps {
  files: File[]
}

export default function FileManager({ files }: FileManagerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const handleDelete = async (fileId: string, filename: string) => {
    if (!confirm(`Delete file "${filename}"? This action cannot be undone.`)) {
      return
    }

    setLoading(fileId)

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete file')
      }

      router.refresh()
    } catch (error) {
      alert('Failed to delete file')
    } finally {
      setLoading(null)
    }
  }

  const handleDownload = (fileId: string) => {
    // Generate signed URL (would need to call API or generate client-side)
    window.open(`/api/files/${fileId}`, '_blank')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file')
      }

      // Refresh the page to show the new file
      router.refresh()
      
      // Reset the input
      e.target.value = ''
    } catch (error: any) {
      setUploadError(error.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <CUIWarningBanner />
      
      <div className="mb-6 p-4 bg-white border border-neutral-200 rounded-lg">
        <h2 className="text-lg font-semibold text-neutral-900 mb-3">Upload File</h2>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer">
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.json,.jpg,.jpeg,.png,.gif"
            />
            <span className="px-4 py-2 bg-accent-700 text-white rounded-lg hover:bg-accent-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-block">
              {uploading ? 'Uploading...' : 'Choose File'}
            </span>
          </label>
          {uploadError && (
            <span className="text-sm text-red-600">{uploadError}</span>
          )}
        </div>
        <p className="mt-2 text-sm text-neutral-500">
          Allowed types: PDF, Word, Excel, Text, CSV, JSON, Images (max 10MB)
        </p>
      </div>

      <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Filename
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Size
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Uploaded By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Uploaded At
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {files.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-neutral-500">
                No files found
              </td>
            </tr>
          ) : (
            files.map((file) => (
              <tr key={file.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                  {file.filename}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {file.mimeType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {formatFileSize(file.size)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {file.uploader.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {new Date(file.uploadedAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(file.id)}
                      className="px-3 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(file.id, file.filename)}
                      disabled={loading === file.id}
                      className="px-3 py-1 text-xs font-medium rounded bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50"
                    >
                      {loading === file.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  )
}

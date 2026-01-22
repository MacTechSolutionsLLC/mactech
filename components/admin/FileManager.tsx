'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

  return (
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
  )
}

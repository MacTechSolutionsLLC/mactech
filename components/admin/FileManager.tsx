'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CUIWarningBanner from '@/components/CUIWarningBanner'
import ComplianceFileBrowser from './ComplianceFileBrowser'
import CUIFileViewerModal from '@/components/CUIFileViewerModal'

interface File {
  id: string
  filename: string
  mimeType: string
  size: number
  uploadedAt: Date | string
  uploader: {
    id: string
    email: string
    name: string | null
  }
}

interface CUIFile {
  id: string
  filename: string
  mimeType: string
  size: number
  uploadedAt: Date
  userId: string
  uploader: {
    id: string
    email: string
    name: string | null
  }
}

interface FCIFile {
  id: string
  filename: string
  mimeType: string
  size: number
  uploadedAt: Date
  userId: string
  isFCI: boolean
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
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'database' | 'fci' | 'compliance' | 'cui'>('database')
  const [loading, setLoading] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isCUI, setIsCUI] = useState(false)
  const [isFCI, setIsFCI] = useState(false)
  const [cuiFiles, setCuiFiles] = useState<CUIFile[]>([])
  const [fciFiles, setFciFiles] = useState<FCIFile[]>([])
  const [selectedCUIFile, setSelectedCUIFile] = useState<{ id: string; filename: string } | null>(null)
  const [showViewerModal, setShowViewerModal] = useState(false)
  const [viewerFileData, setViewerFileData] = useState<string | null>(null)
  const [viewerMimeType, setViewerMimeType] = useState<string>('')
  const [viewerFileSize, setViewerFileSize] = useState<number>(0)
  const [loadingView, setLoadingView] = useState(false)
  
  // Files passed from page are already filtered to exclude FCI files (System Files tab)
  const systemFiles = files

  // Handle tab query parameter on mount
  useEffect(() => {
    const tabParam = searchParams?.get('tab')
    if (tabParam && ['database', 'fci', 'compliance', 'cui'].includes(tabParam)) {
      setActiveTab(tabParam as 'database' | 'fci' | 'compliance' | 'cui')
    }
  }, [searchParams])

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

  // Load CUI files on mount and when CUI tab is active
  useEffect(() => {
    if (activeTab === 'cui') {
      loadCUIFiles()
    }
  }, [activeTab])

  // Load FCI files on mount and when FCI tab is active
  useEffect(() => {
    if (activeTab === 'fci') {
      loadFCIFiles()
    }
  }, [activeTab])

  const loadCUIFiles = async () => {
    try {
      const response = await fetch('/api/files/cui/list')
      const data = await response.json()
      if (data.success) {
        setCuiFiles(data.files)
      }
    } catch (error) {
      console.error('Failed to load CUI files:', error)
    }
  }

  const loadFCIFiles = async () => {
    try {
      const response = await fetch('/api/files/fci/list')
      const data = await response.json()
      if (data.success) {
        setFciFiles(data.files)
      }
    } catch (error) {
      console.error('Failed to load FCI files:', error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (isCUI) {
        formData.append('isCUI', 'true')
      } else if (isFCI) {
        formData.append('isFCI', 'true')
      }

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
      
      // If CUI file, reload CUI files list
      if (data.isCUI) {
        await loadCUIFiles()
      } else if (data.isFCI) {
        // If FCI file, reload FCI files list
        await loadFCIFiles()
      }
      
      // Reset the input and checkboxes
      e.target.value = ''
      setIsCUI(false)
      setIsFCI(false)
    } catch (error: any) {
      setUploadError(error.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleCUIView = async (fileId: string, filename: string) => {
    setSelectedCUIFile({ id: fileId, filename })
    setLoadingView(true)
    
    try {
      // Fetch CUI file directly (no password required)
      const response = await fetch(`/api/files/cui/${fileId}`)
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to load CUI file')
      }

      const data = await response.json()
      
      if (!data.data || !data.mimeType) {
        throw new Error('Invalid response from server')
      }

      // Show viewer modal with file data
      setViewerFileData(data.data)
      setViewerMimeType(data.mimeType)
      setViewerFileSize(data.size || 0)
      setShowViewerModal(true)
    } catch (err: any) {
      console.error('Error loading CUI file:', err)
      alert(err.message || 'Failed to load CUI file')
    } finally {
      setLoadingView(false)
    }
  }

  const handleDeleteCUIFile = async (fileId: string, filename: string) => {
    if (!confirm(`Delete CUI file "${filename}"? This action cannot be undone.`)) {
      return
    }

    setLoading(fileId)

    try {
      const response = await fetch(`/api/files/cui/${fileId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete CUI file')
      }

      await loadCUIFiles()
    } catch (error) {
      alert('Failed to delete CUI file')
    } finally {
      setLoading(null)
    }
  }

  const handleDeleteFCIFile = async (fileId: string, filename: string) => {
    if (!confirm(`Delete FCI file "${filename}"? This action cannot be undone.`)) {
      return
    }

    setLoading(fileId)

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete FCI file')
      }

      await loadFCIFiles()
      router.refresh()
    } catch (error) {
      alert('Failed to delete FCI file')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <CUIWarningBanner />
      
      {/* Tabs */}
      <div className="mb-6 border-b border-neutral-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('database')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'database'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
          >
            System Files
          </button>
          <button
            onClick={() => setActiveTab('fci')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'fci'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
          >
            FCI Files
          </button>
          <button
            onClick={() => setActiveTab('cui')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'cui'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
          >
            CUI Files
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'compliance'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
          >
            Compliance Documents
          </button>
        </nav>
      </div>

      {/* System Files Tab */}
      {activeTab === 'database' && (
        <>
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
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFCI"
                  checked={isFCI}
                  onChange={(e) => {
                    setIsFCI(e.target.checked)
                    if (e.target.checked) setIsCUI(false) // Mutually exclusive
                  }}
                  disabled={uploading}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label htmlFor="isFCI" className="text-sm text-neutral-700">
                  This file contains FCI (Federal Contract Information)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCUI"
                  checked={isCUI}
                  onChange={(e) => {
                    setIsCUI(e.target.checked)
                    if (e.target.checked) setIsFCI(false) // Mutually exclusive
                  }}
                  disabled={uploading}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label htmlFor="isCUI" className="text-sm text-neutral-700">
                  This file contains CUI (Controlled Unclassified Information)
                </label>
              </div>
            </div>
            <p className="mt-2 text-sm text-neutral-500">
              Allowed types: PDF, Word, Excel, Text, CSV, JSON, Images (max 10MB)
            </p>
            <p className="mt-1 text-xs text-amber-600">
              Note: Files with CUI keywords in filename or metadata will be automatically stored as CUI files.
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
                {systemFiles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-neutral-500">
                      No files found
                    </td>
                  </tr>
                ) : (
                  systemFiles.map((file) => (
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
        </>
      )}

      {/* FCI Files Tab */}
      {activeTab === 'fci' && (
        <>
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">FCI Files</h2>
            <p className="text-sm text-blue-800">
              Files containing Federal Contract Information (FCI) as defined by FAR 52.204-21.
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
                {fciFiles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-neutral-500">
                      No FCI files found
                    </td>
                  </tr>
                ) : (
                  fciFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                        <div className="flex items-center gap-2">
                          <span>{file.filename}</span>
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            FCI
                          </span>
                        </div>
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
                            onClick={() => handleDeleteFCIFile(file.id, file.filename)}
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
        </>
      )}

      {/* CUI Files Tab */}
      {activeTab === 'cui' && (
        <>
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h2 className="text-lg font-semibold text-amber-900 mb-2">CUI Files</h2>
            <p className="text-sm text-amber-800">
              Files containing Controlled Unclassified Information (CUI) require password protection for access.
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
                {cuiFiles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-neutral-500">
                      No CUI files found
                    </td>
                  </tr>
                ) : (
                  cuiFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                        <div className="flex items-center gap-2">
                          <span>{file.filename}</span>
                          <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded">
                            CUI
                          </span>
                        </div>
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
                            onClick={() => handleCUIView(file.id, file.filename)}
                            disabled={loadingView}
                            className="px-3 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-50"
                          >
                            {loadingView ? 'Loading...' : 'View'}
                          </button>
                          <button
                            onClick={() => handleDeleteCUIFile(file.id, file.filename)}
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
        </>
      )}

      {/* Compliance Documents Tab */}
      {activeTab === 'compliance' && (
        <Suspense fallback={
          <div className="h-[600px] flex items-center justify-center bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-sm text-neutral-600">Loading compliance documents...</p>
            </div>
          </div>
        }>
          <ComplianceFileBrowser />
        </Suspense>
      )}

      {/* CUI File Viewer Modal */}
      {showViewerModal && selectedCUIFile && viewerFileData && (
        <CUIFileViewerModal
          fileId={selectedCUIFile.id}
          filename={selectedCUIFile.filename}
          fileData={viewerFileData}
          mimeType={viewerMimeType}
          size={viewerFileSize}
          isOpen={showViewerModal}
          onClose={() => {
            setShowViewerModal(false)
            setViewerFileData(null)
            setViewerMimeType('')
            setViewerFileSize(0)
            setSelectedCUIFile(null)
          }}
        />
      )}
    </div>
  )
}

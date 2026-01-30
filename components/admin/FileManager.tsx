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
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const [loadingView, setLoadingView] = useState(false)
  const [vaultConfigured, setVaultConfigured] = useState<boolean | null>(null)
  const [evidenceLoading, setEvidenceLoading] = useState(false)
  const [evidenceResult, setEvidenceResult] = useState<{ output: string; filename: string; success: boolean } | null>(null)
  const [evidenceError, setEvidenceError] = useState<string | null>(null)
  const [showEvidenceModal, setShowEvidenceModal] = useState(false)
  const [vaultCheckLoading, setVaultCheckLoading] = useState(false)
  const [vaultCheckResult, setVaultCheckResult] = useState<{
    configured: boolean
    vaultReachable: boolean
    vaultUrl: string | null
    message: string
  } | null>(null)
  
  // Files passed from page are already filtered to exclude FCI files (System Files tab)
  const systemFiles = files

  // Handle tab query parameter on mount
  useEffect(() => {
    const tabParam = searchParams?.get('tab')
    if (tabParam && ['database', 'fci', 'compliance', 'cui'].includes(tabParam)) {
      setActiveTab(tabParam as 'database' | 'fci' | 'compliance' | 'cui')
    }
  }, [searchParams])

  // Check vault status when CUI tab is active (so we can show a message if not configured)
  useEffect(() => {
    if (activeTab === 'cui') {
      fetch('/api/cui/vault-status')
        .then((res) => res.json())
        .then((data) => setVaultConfigured(data.configured === true))
        .catch(() => setVaultConfigured(false))
    } else {
      setVaultConfigured(null)
    }
  }, [activeTab])

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  // Fixed-format date so server and client match (avoids hydration mismatch from toLocaleString)
  const formatUploadedAt = (uploadedAt: Date | string) => {
    const d = typeof uploadedAt === 'string' ? new Date(uploadedAt) : uploadedAt
    return d.toLocaleString('en-US', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
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
      if (isCUI) {
        const mimeType = file.type?.trim() || 'application/octet-stream'
        const fileName = (file.name && String(file.name).trim()) || 'upload'
        const fileSize = Number(file.size)
        if (!Number.isFinite(fileSize) || fileSize < 0) {
          setUploadError('Invalid file size')
          setUploading(false)
          return
        }
        const sessionRes = await fetch('/api/cui/upload-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName, mimeType, fileSize }),
        })
        const sessionData = await sessionRes.json()
        if (!sessionRes.ok) throw new Error(sessionData.error || 'Failed to get upload session')

        const { uploadUrl, uploadToken } = sessionData
        const vaultFormData = new FormData()
        vaultFormData.append('file', file)
        let vaultRes: Response
        try {
          vaultRes = await fetch(uploadUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${uploadToken}` },
            body: vaultFormData,
          })
        } catch (networkErr: unknown) {
          const msg = networkErr instanceof Error ? networkErr.message : String(networkErr)
          const isNetwork = msg.includes('fetch') || msg.includes('NetworkError') || (networkErr instanceof TypeError)
          throw new Error(
            isNetwork
              ? 'Cannot reach the CUI vault. Check: (1) Vault is running and reachable, (2) CORS on the vault allows this site (CUI_VAULT_CORS_ORIGIN).'
              : msg
          )
        }
        if (!vaultRes.ok) {
          const errText = await vaultRes.text()
          let errMsg = 'Vault upload failed'
          try {
            const errJson = JSON.parse(errText)
            errMsg = errJson.detail || errJson.error || errMsg
          } catch {
            errMsg = errText || errMsg
          }
          if (vaultRes.status === 401) {
            errMsg += ' Ensure CUI_VAULT_JWT_SECRET matches on the app and vault.'
          } else if (vaultRes.status === 403) {
            errMsg += ' Check vault CORS allows this origin (CUI_VAULT_CORS_ORIGIN).'
          }
          throw new Error(errMsg)
        }
        const vaultData = await vaultRes.json().catch(() => ({}))
        const vaultId = vaultData.vaultId || vaultData.id
        const size = vaultData.size ?? file.size
        const recordMimeType = vaultData.mimeType || mimeType
        if (!vaultId) throw new Error('Vault did not return vaultId. Check vault response format.')

        const recordRes = await fetch('/api/cui/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vaultId, size, mimeType: recordMimeType }),
        })
        const recordData = await recordRes.json()
        if (!recordRes.ok) throw new Error(recordData.error || 'Failed to record CUI file')

        router.refresh()
        await loadCUIFiles()
      } else {
        const formData = new FormData()
        formData.append('file', file)
        if (isFCI) formData.append('isFCI', 'true')

        const response = await fetch('/api/files/upload', { method: 'POST', body: formData })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to upload file')

        router.refresh()
        if (data.isFCI) await loadFCIFiles()
      }

      e.target.value = ''
      setIsCUI(false)
      setIsFCI(false)
    } catch (error: unknown) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleCUIView = async (fileId: string, filename: string) => {
    setSelectedCUIFile({ id: fileId, filename })
    setLoadingView(true)

    try {
      const response = await fetch(`/api/cui/view-session?id=${encodeURIComponent(fileId)}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to get view session')
      if (!data.viewUrl) throw new Error('Invalid view session response')

      setViewerUrl(data.viewUrl)
      setShowViewerModal(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to open CUI file'
      alert(message)
    } finally {
      setLoadingView(false)
    }
  }

  const handleDeleteCUIFile = async (fileId: string, _filename: string) => {
    if (!confirm('Delete this CUI file? This action cannot be undone.')) {
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
                        {formatUploadedAt(file.uploadedAt)}
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
                        {formatUploadedAt(file.uploadedAt)}
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
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-amber-900">CUI Files</h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  setVaultCheckLoading(true)
                  setVaultCheckResult(null)
                  try {
                    const res = await fetch('/api/cui/vault-check')
                    const data = await res.json()
                    setVaultCheckResult({
                      configured: data.configured === true,
                      vaultReachable: data.vaultReachable === true,
                      vaultUrl: data.vaultUrl ?? null,
                      message: data.message ?? (data.error || 'Check failed'),
                    })
                  } catch {
                    setVaultCheckResult({
                      configured: false,
                      vaultReachable: false,
                      vaultUrl: null,
                      message: 'Request failed',
                    })
                  } finally {
                    setVaultCheckLoading(false)
                  }
                }}
                disabled={vaultCheckLoading}
                className="px-3 py-1.5 text-sm font-medium rounded border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
              >
                {vaultCheckLoading ? 'Testing…' : 'Test vault connection'}
              </button>
              <button
                type="button"
                onClick={async () => {
                setEvidenceLoading(true)
                setEvidenceError(null)
                setEvidenceResult(null)
                setShowEvidenceModal(true)
                try {
                  const res = await fetch('/api/cui/vault-evidence-check', { method: 'POST' })
                  const data = await res.json()
                  if (!res.ok) throw new Error(data.error || 'Evidence check failed')
                  setEvidenceResult({
                    output: data.output ?? '',
                    filename: data.filename ?? 'vault_evidence.txt',
                    success: data.success === true,
                  })
                } catch (err) {
                  setEvidenceError(err instanceof Error ? err.message : 'Evidence check failed')
                } finally {
                  setEvidenceLoading(false)
                }
              }}
              disabled={evidenceLoading || vaultConfigured === false}
              className="px-4 py-2 text-sm font-medium rounded border border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {evidenceLoading ? 'Running Vault Evidence Check…' : 'Run Vault Evidence Check'}
            </button>
            </div>
          </div>
          {vaultCheckResult && (
            <div className={`mb-6 p-4 rounded-lg border text-sm ${vaultCheckResult.vaultReachable ? 'bg-green-50 border-green-200 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
              <p className="font-medium">
                {vaultCheckResult.vaultReachable ? 'Vault connection OK' : 'Vault connection issue'}
              </p>
              {vaultCheckResult.vaultUrl && <p className="mt-1 text-xs font-mono">{vaultCheckResult.vaultUrl}</p>}
              <p className="mt-1">{vaultCheckResult.message}</p>
            </div>
          )}
          {showEvidenceModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                  <h3 className="text-lg font-semibold text-neutral-900">Vault Evidence Check</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEvidenceModal(false)
                      setEvidenceResult(null)
                      setEvidenceError(null)
                    }}
                    className="text-neutral-500 hover:text-neutral-700 text-2xl font-bold leading-none"
                  >
                    ×
                  </button>
                </div>
                <div className="p-4 overflow-auto flex-1 min-h-0">
                  {evidenceLoading && (
                    <p className="text-sm text-neutral-600">Running evidence script on vault… This may take a few minutes.</p>
                  )}
                  {evidenceError && (
                    <p className="text-sm text-red-600">{evidenceError}</p>
                  )}
                  {!evidenceLoading && evidenceResult && (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm font-medium ${evidenceResult.success ? 'text-green-700' : 'text-amber-700'}`}>
                          {evidenceResult.success ? 'Completed' : 'Completed with errors'}
                        </span>
                        <a
                          href={URL.createObjectURL(new Blob([evidenceResult.output], { type: 'text/plain' }))}
                          download={evidenceResult.filename}
                          className="px-3 py-1.5 text-sm font-medium rounded border border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          Download
                        </a>
                      </div>
                      <pre className="p-4 bg-neutral-50 rounded border border-neutral-200 text-xs overflow-auto max-h-[60vh] whitespace-pre-wrap font-mono">
                        {evidenceResult.output || '(no output)'}
                      </pre>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          {vaultConfigured === false && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-800">CUI vault is not configured. CUI uploads will fail until <code className="bg-red-100 px-1 rounded">CUI_VAULT_API_KEY</code> and <code className="bg-red-100 px-1 rounded">CUI_VAULT_JWT_SECRET</code> (or <code className="bg-red-100 px-1 rounded">CUI_VAULT_URL</code> if vault is elsewhere) are set on the app, and the vault server has <code className="bg-red-100 px-1 rounded">CUI_VAULT_CORS_ORIGIN</code> set to allow this site.</p>
            </div>
          )}

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
                        {formatUploadedAt(file.uploadedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCUIView(file.id, file.filename)}
                            className="px-3 py-1 text-xs font-medium rounded border border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            Open secure viewer
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

      {/* CUI Secure Viewer Modal */}
      {showViewerModal && selectedCUIFile && viewerUrl && (
        <CUIFileViewerModal
          fileId={selectedCUIFile.id}
          filename={selectedCUIFile.filename}
          viewUrl={viewerUrl}
          isOpen={showViewerModal}
          onClose={() => {
            setShowViewerModal(false)
            setViewerUrl(null)
            setSelectedCUIFile(null)
          }}
        />
      )}
    </div>
  )
}

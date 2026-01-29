'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import CUIWarningBanner from '@/components/CUIWarningBanner'
import CUIFileViewerModal from '@/components/CUIFileViewerModal'

interface CUIFile {
  id: string
  filename: string
  mimeType: string
  size: number
  uploadedAt: string
}
interface FCIFile {
  id: string
  filename: string
  mimeType: string
  size: number
  uploadedAt: string
  isFCI: boolean
}

export default function PortalUploadPage() {
  const [isCUI, setIsCUI] = useState(false)
  const [isFCI, setIsFCI] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [cuiFiles, setCuiFiles] = useState<CUIFile[]>([])
  const [fciFiles, setFciFiles] = useState<FCIFile[]>([])
  const [vaultConfigured, setVaultConfigured] = useState<boolean | null>(null)
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const [viewerFileId, setViewerFileId] = useState<string>('')
  const [viewerFilename, setViewerFilename] = useState<string>('')
  const [showViewerModal, setShowViewerModal] = useState(false)
  const [loadingView, setLoadingView] = useState(false)

  const loadCUI = () => {
    fetch('/api/files/cui/list')
      .then((r) => r.json())
      .then((d) => (d.success ? setCuiFiles(d.files ?? []) : null))
      .catch(() => setCuiFiles([]))
  }
  const loadFCI = () => {
    fetch('/api/files/fci/list')
      .then((r) => r.json())
      .then((d) => (d.success ? setFciFiles(d.files ?? []) : null))
      .catch(() => setFciFiles([]))
  }
  useEffect(() => {
    loadCUI()
    loadFCI()
    fetch('/api/cui/vault-status')
      .then((r) => r.json())
      .then((d) => setVaultConfigured(d.configured === true))
      .catch(() => setVaultConfigured(false))
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      if (isCUI) {
        if (vaultConfigured === false) {
          throw new Error('CUI vault is not configured. Contact your administrator.')
        }
        const mimeType = file.type?.trim() || 'application/octet-stream'
        const sessionRes = await fetch('/api/cui/upload-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, mimeType, fileSize: file.size }),
        })
        const sessionData = await sessionRes.json()
        if (!sessionRes.ok) throw new Error(sessionData.error || 'Failed to get upload session')
        const { uploadUrl, uploadToken } = sessionData
        const vaultFormData = new FormData()
        vaultFormData.append('file', file)
        const vaultRes = await fetch(uploadUrl, {
          method: 'POST',
          headers: { Authorization: `Bearer ${uploadToken}` },
          body: vaultFormData,
        })
        if (!vaultRes.ok) {
          const errText = await vaultRes.text()
          let errMsg = 'Vault upload failed'
          try {
            const errJson = JSON.parse(errText)
            errMsg = errJson.detail || errJson.error || errMsg
          } catch {
            errMsg = errText || errMsg
          }
          throw new Error(errMsg)
        }
        const vaultData = await vaultRes.json().catch(() => ({}))
        const vaultId = vaultData.vaultId || vaultData.id
        const size = vaultData.size ?? file.size
        const recordMimeType = vaultData.mimeType || mimeType
        if (!vaultId) throw new Error('Vault did not return vaultId')
        const recordRes = await fetch('/api/cui/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vaultId, size, mimeType: recordMimeType }),
        })
        const recordData = await recordRes.json()
        if (!recordRes.ok) throw new Error(recordData.error || 'Failed to record CUI file')
        loadCUI()
      } else {
        const formData = new FormData()
        formData.append('file', file)
        if (isFCI) formData.append('isFCI', 'true')
        const res = await fetch('/api/files/upload', { method: 'POST', body: formData })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')
        if (data.isFCI) loadFCI()
      }
      e.target.value = ''
      setIsCUI(false)
      setIsFCI(false)
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const openCUIView = async (fileId: string, filename: string) => {
    setLoadingView(true)
    try {
      const res = await fetch(`/api/cui/view-session?id=${encodeURIComponent(fileId)}`)
      const data = await res.json()
      if (!res.ok || !data.viewUrl) throw new Error(data.error || 'Could not open file')
      setViewerFileId(fileId)
      setViewerFilename(filename)
      setViewerUrl(data.viewUrl)
      setShowViewerModal(true)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to open file')
    } finally {
      setLoadingView(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Upload</h1>
        <p className="mt-1 text-neutral-600">
          Upload FCI or CUI files. Your uploads are stored securely.
        </p>
      </div>

      {isCUI && <CUIWarningBanner />}
      {vaultConfigured === false && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm">
          CUI vault is not configured. CUI uploads will fail until an administrator configures the vault.
        </div>
      )}

      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Upload a file</h2>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isFCI} onChange={(e) => setIsFCI(e.target.checked)} className="rounded border-neutral-300" />
            <span className="text-sm">Store as FCI</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isCUI} onChange={(e) => setIsCUI(e.target.checked)} className="rounded border-neutral-300" />
            <span className="text-sm">Store as CUI</span>
          </label>
          <input
            type="file"
            onChange={handleUpload}
            disabled={uploading}
            className="block text-sm text-neutral-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-neutral-100 file:text-neutral-700"
          />
        </div>
        {uploadError && (
          <p className="mt-2 text-sm text-red-600">{uploadError}</p>
        )}
        {uploading && <p className="mt-2 text-sm text-neutral-500">Uploading…</p>}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-3">Your CUI files</h2>
          {cuiFiles.length === 0 ? (
            <p className="text-sm text-neutral-500">No CUI files yet.</p>
          ) : (
            <ul className="space-y-2">
              {cuiFiles.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-neutral-700">{f.filename}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-neutral-500">{formatSize(f.size)}</span>
                    <button
                      type="button"
                      onClick={() => openCUIView(f.id, f.filename)}
                      disabled={loadingView}
                      className="text-accent-700 hover:underline"
                    >
                      View
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-3">Your FCI files</h2>
          {fciFiles.length === 0 ? (
            <p className="text-sm text-neutral-500">No FCI files yet.</p>
          ) : (
            <ul className="space-y-2">
              {fciFiles.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-neutral-700">{f.filename}</span>
                  <span className="text-neutral-500 shrink-0">{formatSize(f.size)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showViewerModal && (
        <CUIFileViewerModal
          fileId={viewerFileId}
          filename={viewerFilename}
          viewUrl={viewerUrl ?? undefined}
          isOpen={showViewerModal}
          onClose={() => { setShowViewerModal(false); setViewerUrl(null); setViewerFileId(''); setViewerFilename('') }}
        />
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<{
    proposalUrl?: string
    boeUrl?: string
    error?: string
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('sow', file as Blob)

    try {
      const response = await fetch('/api/admin/generate-proposal', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate documents')
      }

      setResult({
        proposalUrl: data.proposalUrl,
        boeUrl: data.boeUrl,
      })
    } catch (error) {
      console.error('Error:', error)
      setResult({
        error: error instanceof Error ? error.message : 'An error occurred',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="section-narrow bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-hero mb-6">Admin Portal</h1>
          <p className="text-body-lg text-neutral-700 max-w-2xl leading-relaxed mb-6">
            Upload a Statement of Work (SOW) to automatically generate a Proposal and Basis of Estimate (BOE).
          </p>
          <div className="flex gap-4">
            <Link href="/admin/contract-discovery" className="btn-secondary">
              Contract Discovery
            </Link>
            <Link href="/admin/contract-discovery/dashboard" className="btn-secondary">
              Contract Dashboard
            </Link>
            <Link href="/admin/sam-dashboard" className="btn-secondary">
              SAM.gov Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Upload Form */}
      <section className="section-container bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="card p-8 lg:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label htmlFor="sow-file" className="block text-body-sm font-medium text-neutral-900 mb-3">
                  Statement of Work Document
                </label>
                <div className="mt-2">
                  <input
                    type="file"
                    id="sow-file"
                    name="sow"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="block w-full text-body-sm text-neutral-700 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-body-sm file:font-medium file:bg-accent-50 file:text-accent-700 hover:file:bg-accent-100 file:cursor-pointer"
                    required
                  />
                </div>
                <p className="mt-2 text-body-sm text-neutral-500">
                  Supported formats: PDF, Word (.doc, .docx), or Text (.txt)
                </p>
              </div>

              {file && (
                <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="text-body-sm font-medium text-neutral-900">{file.name}</p>
                        <p className="text-body-sm text-neutral-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null)
                        setResult(null)
                        const input = document.getElementById('sow-file') as HTMLInputElement
                        if (input) input.value = ''
                      }}
                      className="text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={!file || isUploading}
                  className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Processing...' : 'Generate Proposal & BOE'}
                </button>
                <Link href="/" className="btn-secondary">
                  Cancel
                </Link>
              </div>
            </form>

            {/* Results */}
            {result && (
              <div className="mt-8 pt-8 border-t border-neutral-200">
                {result.error ? (
                  <div className="bg-red-50 border border-red-200 p-6 rounded-sm">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h3 className="text-body-sm font-semibold text-red-900 mb-1">Error</h3>
                        <p className="text-body-sm text-red-700">{result.error}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="heading-3 mb-4">Generated Documents</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {result.proposalUrl && (
                        <a
                          href={result.proposalUrl}
                          download
                          className="card p-6 hover:border-accent-300 transition-colors group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-accent-50 border border-accent-200 flex items-center justify-center rounded-sm group-hover:bg-accent-100 transition-colors">
                              <svg className="w-6 h-6 text-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-body-sm font-semibold text-neutral-900 mb-1">Proposal</h4>
                              <p className="text-body-sm text-neutral-600">Download generated proposal document</p>
                            </div>
                            <svg className="w-5 h-5 text-neutral-400 group-hover:text-accent-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </div>
                        </a>
                      )}
                      {result.boeUrl && (
                        <a
                          href={result.boeUrl}
                          download
                          className="card p-6 hover:border-accent-300 transition-colors group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-accent-50 border border-accent-200 flex items-center justify-center rounded-sm group-hover:bg-accent-100 transition-colors">
                              <svg className="w-6 h-6 text-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-body-sm font-semibold text-neutral-900 mb-1">Basis of Estimate</h4>
                              <p className="text-body-sm text-neutral-600">Download generated BOE document</p>
                            </div>
                            <svg className="w-5 h-5 text-neutral-400 group-hover:text-accent-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 card p-8 bg-neutral-50">
            <h3 className="heading-3 mb-4">How It Works</h3>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 bg-accent-700 text-white rounded-full flex items-center justify-center text-body-sm font-semibold">
                  1
                </div>
                <div>
                  <h4 className="text-body-sm font-semibold text-neutral-900 mb-1">Upload SOW</h4>
                  <p className="text-body-sm text-neutral-700">
                    Upload the Statement of Work document (PDF, Word, or Text format)
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 bg-accent-700 text-white rounded-full flex items-center justify-center text-body-sm font-semibold">
                  2
                </div>
                <div>
                  <h4 className="text-body-sm font-semibold text-neutral-900 mb-1">AI Processing</h4>
                  <p className="text-body-sm text-neutral-700">
                    The system extracts key information from the SOW including requirements, scope, and deliverables
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 bg-accent-700 text-white rounded-full flex items-center justify-center text-body-sm font-semibold">
                  3
                </div>
                <div>
                  <h4 className="text-body-sm font-semibold text-neutral-900 mb-1">Document Generation</h4>
                  <p className="text-body-sm text-neutral-700">
                    Proposal and Basis of Estimate documents are automatically generated based on the SOW content
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 bg-accent-700 text-white rounded-full flex items-center justify-center text-body-sm font-semibold">
                  4
                </div>
                <div>
                  <h4 className="text-body-sm font-semibold text-neutral-900 mb-1">Download & Review</h4>
                  <p className="text-body-sm text-neutral-700">
                    Download the generated documents, review, and customize as needed for your proposal submission
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  )
}


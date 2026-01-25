'use client'

interface SystemBoundaryModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SystemBoundaryModal({ isOpen, onClose }: SystemBoundaryModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-2xl font-semibold text-neutral-900">System Boundary & Data Flow</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
        </div>

                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                  {/* Scope Statement */}
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">Scope Statement</h3>
                    <div className="space-y-3 text-neutral-700">
                      <p>
                        <strong>Level 1 (FCI):</strong> This system processes and stores <strong>Federal Contract Information (FCI)</strong>, 
                        as defined by FAR 52.204-21. Only non-public information related to government contracts is treated as FCI. 
                        Publicly released information (e.g., SAM.gov postings) is not FCI unless combined with internal, non-public data.
                      </p>
                      <p>
                        <strong>Level 2 (CUI):</strong> This system has been upgraded to also process and store <strong>Controlled Unclassified Information (CUI)</strong>, 
                        as defined by 32 CFR Part 2002 and the CUI Registry. CUI is handled according to established CUI handling procedures and security controls.
                      </p>
                      <p>
                        <strong>System Scope:</strong> The system processes both FCI and CUI. FCI handling remains as documented in Level 1. 
                        CUI handling is added per Level 2 requirements. All security controls protect both FCI and CUI unless otherwise specified.
                      </p>
                    </div>
                  </div>

                  {/* Data Flow */}
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">Data Flow</h3>
                    <pre className="bg-neutral-50 p-4 rounded text-sm font-mono overflow-x-auto">
{`Browser (HTTPS)
    ↓
Next.js Application (Railway)
    ↓
PostgreSQL Database (Railway)
    ↓
File Storage (PostgreSQL BYTEA)
    - FCI files: StoredFile table
    - CUI files: StoredCUIFile table
    ↓
Signed URLs for Downloads`}
                    </pre>
                  </div>

                  {/* In-Scope Components */}
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">In-Scope Components</h3>
                    <ul className="list-disc list-inside text-neutral-700 space-y-2">
                      <li><strong>Next.js web application</strong> (Railway) - Application code that processes FCI and CUI</li>
                      <li><strong>PostgreSQL database</strong> (Railway) - FCI and CUI data storage</li>
                      <li><strong>Authentication system</strong> (NextAuth.js) - User identification and authentication</li>
                      <li><strong>File storage</strong> (PostgreSQL BYTEA)
                        <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                          <li>FCI files: StoredFile table</li>
                          <li>CUI files: StoredCUIFile table (password protected)</li>
                        </ul>
                      </li>
                      <li><strong>Event logging</strong> (AppEvent table) - Application event logging for audit trail</li>
                      <li><strong>CUI access control</strong> - CUI file access controls and password protection</li>
                    </ul>
                  </div>

                  {/* Out-of-Scope Components */}
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">Out-of-Scope Components</h3>
                    <ul className="list-disc list-inside text-neutral-700 space-y-1">
                      <li>Developer workstations</li>
                      <li>Third-party APIs (SAM.gov, USAspending.gov) - Read-only, public data only</li>
                      <li>End-user browsers</li>
                      <li>Railway infrastructure (inherited controls)</li>
                      <li>Source code repository (GitHub) - No CUI stored in source code</li>
                    </ul>
                  </div>

                  {/* Network Architecture */}
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">Network Architecture</h3>
                    <div className="text-neutral-700 space-y-2">
                      <p>
                        <strong>Public Network Segment:</strong> Next.js application operates in publicly accessible network tier 
                        (accepts HTTPS from internet)
                      </p>
                      <p>
                        <strong>Internal Network Segment:</strong> PostgreSQL database operates in internal network tier 
                        (not directly accessible from internet)
                      </p>
                      <p>
                        <strong>Network Boundary:</strong> Railway platform manages network boundaries and access controls between tiers
                      </p>
                      <p>
                        <strong>Logical Separation:</strong> Application and database are logically separated in different network segments
                      </p>
                    </div>
                  </div>

                  {/* CUI Handling */}
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">CUI Handling</h3>
                    <div className="text-neutral-700 space-y-2">
                      <p>
                        CUI files are stored separately from FCI files in the <code className="bg-neutral-100 px-1 py-0.5 rounded">StoredCUIFile</code> table 
                        with password protection. CUI handling includes:
                      </p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>CUI keyword detection for auto-classification</li>
                        <li>Password protection for CUI file access</li>
                        <li>User acknowledgment required for CUI handling</li>
                        <li>Procedural controls and training</li>
                        <li>Separate storage from FCI files</li>
                      </ul>
                    </div>
                  </div>
                </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200 bg-neutral-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import SystemBoundaryModal from '@/components/compliance/SystemBoundaryModal'

export default function ComplianceDashboardClient() {
  const [isSystemBoundaryOpen, setIsSystemBoundaryOpen] = useState(false)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* System Boundary Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">System Boundary</h2>
          <p className="text-neutral-600 mb-4">
            CMMC Level 2 - FCI and CUI scope.
          </p>
          <button
            onClick={() => setIsSystemBoundaryOpen(true)}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View Details →
          </button>
        </div>

        {/* Access Control Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Access Control</h2>
          <p className="text-neutral-600 mb-4">
            Role-based access, admin re-authentication, least privilege.
          </p>
          <Link
            href="/admin/users"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Manage Users →
          </Link>
        </div>

        {/* Event Logging Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Event Logging</h2>
          <p className="text-neutral-600 mb-4">
            Application event log for audit trail.
          </p>
          <Link
            href="/admin/events"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View Events →
          </Link>
        </div>

        {/* File Management Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">File Management</h2>
          <p className="text-neutral-600 mb-4">
            Secure file storage with signed URLs.
          </p>
          <Link
            href="/admin/files"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Manage Files →
          </Link>
        </div>

        {/* Evidence Index Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Evidence Index</h2>
          <p className="text-neutral-600 mb-4">
            Mapping of 17 FAR practices to controls and evidence.
          </p>
          <Link
            href="/admin/compliance/evidence-index"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View Document →
          </Link>
        </div>

        {/* Audit Checklist Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Audit Checklist</h2>
          <p className="text-neutral-600 mb-4">
            Step-by-step &quot;show me&quot; procedures for assessors.
          </p>
          <Link
            href="/admin/compliance/internal-audit-checklist"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View Checklist →
          </Link>
        </div>

        {/* System Security Plan Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">System Security Plan</h2>
          <p className="text-neutral-600 mb-4">
            Comprehensive security documentation for CMMC Level 2 compliance.
          </p>
          <Link
            href="/admin/compliance/system-security-plan"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View Document →
          </Link>
        </div>

        {/* System Control Traceability Matrix Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">System Control Traceability Matrix</h2>
          <p className="text-neutral-600 mb-4">
            View all 110 CMMC Level 2 controls and implementation status.
          </p>
          <Link
            href="/admin/compliance/sctm"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View SCTM →
          </Link>
        </div>

        {/* Compliance Audit Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Compliance Audit</h2>
          <p className="text-neutral-600 mb-4">
            Comprehensive verification of control implementation, evidence, and documentation.
          </p>
          <Link
            href="/admin/compliance/audit"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Run Audit →
          </Link>
        </div>

        {/* NIST CSF 2.0 Alignment Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">NIST CSF 2.0 Alignment</h2>
          <p className="text-neutral-600 mb-4">
            MacTech Solutions aligns its cybersecurity program with NIST CSF 2.0. Our alignment is documented in our CSF 2.0 Profile, which maps existing CMMC Level 2 controls to CSF 2.0 outcomes.
          </p>
          <p className="text-sm text-neutral-500 mb-4">
            CSF 2.0 Profile available in compliance documentation: <code className="text-xs">compliance/nist-csf-2.0/</code>
          </p>
        </div>
      </div>

      {/* Control Status Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Control Status Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-neutral-800 mb-2">Implemented Controls</h3>
            <ul className="list-disc list-inside text-neutral-700 space-y-1 text-sm">
              <li>Authentication (NextAuth.js)</li>
              <li>Role-based access control</li>
              <li>Password policy (14 chars, denylist)</li>
              <li>Admin re-authentication</li>
              <li>Event logging</li>
              <li>File storage (DB blob)</li>
              <li>Security headers</li>
              <li>CUI keyword blocking</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-neutral-800 mb-2">Inherited Controls (Railway)</h3>
            <ul className="list-disc list-inside text-neutral-700 space-y-1 text-sm">
              <li>TLS/HTTPS encryption</li>
              <li>Physical security</li>
              <li>Infrastructure security</li>
              <li>Database encryption at rest</li>
              <li>Malware protection</li>
            </ul>
          </div>
        </div>
      </div>

      <SystemBoundaryModal
        isOpen={isSystemBoundaryOpen}
        onClose={() => setIsSystemBoundaryOpen(false)}
      />
    </>
  )
}

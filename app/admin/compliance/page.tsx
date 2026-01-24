import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import AdminNavigation from "@/components/admin/AdminNavigation"

export default async function ComplianceDashboardPage() {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Compliance Dashboard</h1>
          <p className="mt-2 text-neutral-600">
            CMMC Level 1 (FAR 52.204-21) Compliance Overview
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* System Boundary Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">System Boundary</h2>
            <p className="text-neutral-600 mb-4">
              FCI-only scope. CUI explicitly excluded.
            </p>
            <Link
              href="/admin/compliance#boundary"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View Details →
            </Link>
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
              Comprehensive security documentation for CMMC Level 1 compliance.
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
        </div>

        {/* System Boundary Section */}
        <div id="boundary" className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">System Boundary & Data Flow</h2>
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">Scope Statement</h3>
            <p className="text-neutral-700">
              This system processes and stores <strong>Federal Contract Information (FCI) only</strong>, 
              as defined by FAR 52.204-21. <strong>Controlled Unclassified Information (CUI) is explicitly excluded</strong> 
              and prohibited from being uploaded or stored in the system.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">Data Flow</h3>
            <pre className="bg-neutral-50 p-4 rounded text-sm font-mono overflow-x-auto">
{`Browser (HTTPS)
    ↓
Next.js Application (Railway)
    ↓
PostgreSQL Database (Railway)
    ↓
File Storage (PostgreSQL BYTEA)
    ↓
Signed URLs for Downloads`}
            </pre>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">In-Scope Components</h3>
            <ul className="list-disc list-inside text-neutral-700 space-y-1">
              <li>Next.js web application (Railway)</li>
              <li>PostgreSQL database (Railway)</li>
              <li>Authentication system (NextAuth.js)</li>
              <li>File storage (PostgreSQL BYTEA)</li>
              <li>Event logging (AppEvent table)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">Out-of-Scope Components</h3>
            <ul className="list-disc list-inside text-neutral-700 space-y-1">
              <li>Developer workstations</li>
              <li>Third-party APIs (SAM.gov, USAspending.gov)</li>
              <li>End-user browsers</li>
              <li>Railway infrastructure (inherited controls)</li>
            </ul>
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
      </div>
    </div>
  )
}

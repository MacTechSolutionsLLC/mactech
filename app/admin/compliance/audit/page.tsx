import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminNavigation from '@/components/admin/AdminNavigation'
import AuditSummary from '@/components/compliance/AuditSummary'

export default async function ComplianceAuditPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/admin/compliance"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Compliance Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">
            CMMC Level 2 Compliance Audit
          </h1>
          <p className="mt-2 text-neutral-600">
            Comprehensive verification of control implementation, evidence, and documentation. Audited controls support alignment with NIST CSF 2.0, FedRAMP Moderate, SOC 2, and NIST RMF. See compliance documentation for framework-specific alignment details.
          </p>
        </div>

        <AuditSummary />
      </div>
    </div>
  )
}

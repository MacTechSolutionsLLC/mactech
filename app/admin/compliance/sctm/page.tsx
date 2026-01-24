import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { readFile } from 'fs/promises'
import { join } from 'path'
import AdminNavigation from '@/components/admin/AdminNavigation'
import SCTMSummary from '@/components/compliance/SCTMSummary'
import SCTMTable from '@/components/compliance/SCTMTable'
import { parseSCTM, calculateSummaryStats } from '@/lib/compliance/sctm-parser'

export default async function SCTMPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  // Parse SCTM data directly
  let controls: any[] = []
  let summary: any = null

  try {
    const filePath = join(
      process.cwd(),
      'compliance',
      'cmmc',
      'level1',
      '04-self-assessment',
      'MAC-AUD-408_System_Control_Traceability_Matrix.md'
    )

    const content = await readFile(filePath, 'utf-8')
    controls = parseSCTM(content)
    summary = calculateSummaryStats(controls)
  } catch (error) {
    console.error('Error parsing SCTM:', error)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/admin/compliance"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Compliance Dashboard
          </Link>
          <Link
            href="/admin/compliance/audit"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm"
          >
            Run Compliance Audit
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">
            System Control Traceability Matrix (SCTM)
          </h1>
          <p className="mt-2 text-neutral-600">
            CMMC Level 2 - All 110 NIST SP 800-171 Rev. 2 Controls
          </p>
        </div>

        {summary && (
          <div className="mb-8">
            <SCTMSummary summary={summary} />
          </div>
        )}

        <div>
          <SCTMTable controls={controls} />
        </div>
      </div>
    </div>
  )
}

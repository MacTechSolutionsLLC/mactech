import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { auth } from '@/lib/auth'
import { parseSCTM, calculateSummaryStats } from '@/lib/compliance/sctm-parser'

/**
 * GET /api/admin/compliance/sctm
 * Returns parsed SCTM data with controls and summary statistics
 */
export async function GET() {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Read the SCTM markdown file
    const filePath = join(
      process.cwd(),
      'compliance',
      'cmmc',
      'level2',
      '04-self-assessment',
      'MAC-AUD-408_System_Control_Traceability_Matrix.md'
    )

    const content = await readFile(filePath, 'utf-8')

    // Parse controls
    const controls = parseSCTM(content)

    // Calculate summary statistics
    const summary = calculateSummaryStats(controls)

    return NextResponse.json({
      controls,
      summary,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('Error parsing SCTM:', error)
    return NextResponse.json(
      { error: 'Failed to parse SCTM' },
      { status: 500 }
    )
  }
}

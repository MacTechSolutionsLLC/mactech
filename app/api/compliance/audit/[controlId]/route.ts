import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/authz'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { parseSCTM } from '@/lib/compliance/sctm-parser'
import { auditControl } from '@/lib/compliance/control-audit'

export async function GET(
  request: Request,
  { params }: { params: { controlId: string } }
) {
  try {
    await requireAdmin()
    
    const controlId = decodeURIComponent(params.controlId)
    
    // Load SCTM and find the control
    const sctmPath = join(
      process.cwd(),
      'compliance',
      'cmmc',
      'level2',
      '04-self-assessment',
      'MAC-AUD-408_System_Control_Traceability_Matrix.md'
    )
    const content = await readFile(sctmPath, 'utf-8')
    const controls = parseSCTM(content)
    
    const control = controls.find(c => c.id === controlId)
    if (!control) {
      return NextResponse.json(
        { success: false, error: 'Control not found' },
        { status: 404 }
      )
    }
    
    const auditResult = await auditControl(control)
    
    return NextResponse.json({
      success: true,
      control,
      auditResult,
      generatedAt: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Error auditing control:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to audit control'
      },
      { status: error.status || 500 }
    )
  }
}

/**
 * SCTM Control Update API
 * Updates individual control in the SCTM markdown file
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { updateControlInSCTM } from "@/lib/compliance/sctm-writer"
import { parseSCTM } from "@/lib/compliance/sctm-parser"
import { readFile } from "fs/promises"
import { join } from "path"
import { logAdminAction } from "@/lib/audit"

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/admin/compliance/sctm/[controlId]
 * Update a control in the SCTM
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ controlId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { controlId } = await context.params
    const body = await request.json()

    // Extract updates (only allow editing: status, policy, procedure, evidence, implementation, sspSection)
    const updates: any = {}
    
    if (body.status !== undefined) {
      // Validate status
      const validStatuses = ['implemented', 'inherited', 'partially_satisfied', 'not_implemented', 'not_applicable']
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        )
      }
      updates.status = body.status
    }
    
    if (body.policy !== undefined) {
      updates.policy = body.policy
    }
    
    if (body.procedure !== undefined) {
      updates.procedure = body.procedure
    }
    
    if (body.evidence !== undefined) {
      updates.evidence = body.evidence
    }
    
    if (body.implementation !== undefined) {
      updates.implementation = body.implementation
    }
    
    if (body.sspSection !== undefined) {
      updates.sspSection = body.sspSection
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      )
    }

    // Update the control in the markdown file
    await updateControlInSCTM(controlId, updates)

    // Log the update
    await logAdminAction(
      session.user.id,
      session.user.email || "",
      "admin_action",
      { type: "sctm_control" as const, id: controlId },
      {
        controlId,
        updates: Object.keys(updates),
        action: "sctm_control_updated",
      }
    )

    // Read and parse the updated SCTM to return the updated control
    const filePath = join(
      process.cwd(),
      'compliance',
      'cmmc',
      'level1',
      '04-self-assessment',
      'MAC-AUD-408_System_Control_Traceability_Matrix.md'
    )
    const content = await readFile(filePath, 'utf-8')
    const controls = parseSCTM(content)
    const updatedControl = controls.find(c => c.id === controlId)

    if (!updatedControl) {
      return NextResponse.json(
        { error: 'Control not found after update' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      control: updatedControl,
    })
  } catch (error: any) {
    console.error('Error updating SCTM control:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update SCTM control' },
      { status: error.message?.includes('not found') ? 404 : 500 }
    )
  }
}

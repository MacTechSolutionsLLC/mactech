/**
 * Individual POA&M Item API Route
 * Get, update, and delete POA&M items
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAdminAction } from "@/lib/audit"

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const poamItem = await prisma.pOAMItem.findUnique({
      where: { id: params.id },
    })

    if (!poamItem) {
      return NextResponse.json(
        { error: "POA&M item not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ item: poamItem })
  } catch (error) {
    console.error("Error fetching POA&M item:", error)
    return NextResponse.json(
      { error: "Failed to fetch POA&M item" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      status,
      priority,
      responsibleParty,
      targetCompletionDate,
      actualCompletionDate,
      milestones,
      notes,
      verified,
    } = body

    const existing = await prisma.pOAMItem.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "POA&M item not found" },
        { status: 404 }
      )
    }

    const updateData: any = {}

    if (status !== undefined) updateData.status = status
    if (priority !== undefined) updateData.priority = priority
    if (responsibleParty !== undefined) updateData.responsibleParty = responsibleParty
    if (targetCompletionDate !== undefined) {
      updateData.targetCompletionDate = targetCompletionDate ? new Date(targetCompletionDate) : null
    }
    if (actualCompletionDate !== undefined) {
      updateData.actualCompletionDate = actualCompletionDate ? new Date(actualCompletionDate) : null
    }
    if (milestones !== undefined) updateData.milestones = JSON.stringify(milestones)
    if (notes !== undefined) updateData.notes = notes

    // Handle verification
    if (verified === true && existing.status !== "verified") {
      updateData.status = "verified"
      updateData.verifiedBy = session.user.id
      updateData.verifiedAt = new Date()
      if (!updateData.actualCompletionDate) {
        updateData.actualCompletionDate = new Date()
      }
    }

    const updated = await prisma.pOAMItem.update({
      where: { id: params.id },
      data: updateData,
    })

    await logAdminAction(
      session.user.id,
      session.user.email || "",
      "poam_item_updated",
      { type: "poam", id: updated.id },
      {
        poamId: updated.poamId,
        changes: Object.keys(updateData),
      }
    )

    return NextResponse.json({ item: updated })
  } catch (error) {
    console.error("Error updating POA&M item:", error)
    return NextResponse.json(
      { error: "Failed to update POA&M item" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existing = await prisma.pOAMItem.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "POA&M item not found" },
        { status: 404 }
      )
    }

    await prisma.pOAMItem.delete({
      where: { id: params.id },
    })

    await logAdminAction(
      session.user.id,
      session.user.email || "",
      "poam_item_deleted",
      { type: "poam", id: params.id },
      {
        poamId: existing.poamId,
        controlId: existing.controlId,
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting POA&M item:", error)
    return NextResponse.json(
      { error: "Failed to delete POA&M item" },
      { status: 500 }
    )
  }
}

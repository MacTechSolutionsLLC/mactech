/**
 * POA&M Items API Route
 * List and create POA&M items
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAdminAction } from "@/lib/audit"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const controlId = searchParams.get("controlId")
    const controlFamily = searchParams.get("controlFamily")

    const where: any = {}

    if (status && status !== "all") {
      where.status = status
    }

    if (priority && priority !== "all") {
      where.priority = priority
    }

    if (controlId) {
      where.controlId = controlId
    }

    if (controlFamily) {
      // Extract control family from controlId (e.g., "3.2.2" -> "AT" for 3.2.x)
      const familyMap: Record<string, string> = {
        "3.1": "AC",
        "3.2": "AT",
        "3.3": "AU",
        "3.4": "CM",
        "3.5": "IA",
        "3.6": "IR",
        "3.7": "MA",
        "3.8": "MP",
        "3.9": "PS",
        "3.10": "PE",
        "3.11": "RA",
        "3.12": "CA",
        "3.13": "SC",
        "3.14": "SI",
      }

      const controlPrefix = controlFamily.split(".")[0] + "." + controlFamily.split(".")[1]
      if (familyMap[controlPrefix]) {
        where.controlId = {
          startsWith: controlPrefix,
        }
      }
    }

    const poamItems = await prisma.pOAMItem.findMany({
      where,
      orderBy: [
        { priority: "desc" }, // critical, high, medium, low
        { targetCompletionDate: "asc" },
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json({ items: poamItems })
  } catch (error) {
    console.error("Error fetching POA&M items:", error)
    return NextResponse.json(
      { error: "Failed to fetch POA&M items" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      poamId,
      controlId,
      title,
      description,
      affectedControls,
      status = "open",
      priority = "medium",
      responsibleParty,
      targetCompletionDate,
      plannedRemediation,
      milestones,
      notes,
    } = body

    if (!poamId || !controlId || !title || !description || !responsibleParty) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if POA&M ID already exists
    const existing = await prisma.pOAMItem.findUnique({
      where: { poamId },
    })

    if (existing) {
      return NextResponse.json(
        { error: "POA&M ID already exists" },
        { status: 400 }
      )
    }

    const poamItem = await prisma.pOAMItem.create({
      data: {
        poamId,
        controlId,
        title,
        description,
        affectedControls: JSON.stringify(affectedControls || [controlId]),
        status,
        priority,
        responsibleParty,
        targetCompletionDate: targetCompletionDate ? new Date(targetCompletionDate) : null,
        plannedRemediation: JSON.stringify(plannedRemediation || []),
        milestones: JSON.stringify(milestones || []),
        notes: notes || null,
        createdBy: session.user.id,
      },
    })

    await logAdminAction(
      session.user.id,
      session.user.email || "",
      "admin_action",
      { type: "poam", id: poamItem.id },
      {
        poamId: poamItem.poamId,
        controlId: poamItem.controlId,
        title: poamItem.title,
        action: "poam_item_created",
      }
    )

    return NextResponse.json({ item: poamItem }, { status: 201 })
  } catch (error) {
    console.error("Error creating POA&M item:", error)
    return NextResponse.json(
      { error: "Failed to create POA&M item" },
      { status: 500 }
    )
  }
}

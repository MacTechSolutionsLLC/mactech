/**
 * POA&M ID Uniqueness Check API
 * Checks if a POA&M ID is available (doesn't exist)
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const poamId = searchParams.get("poamId")
    const excludeId = searchParams.get("excludeId") // For checking during updates

    if (!poamId) {
      return NextResponse.json(
        { error: "poamId parameter is required" },
        { status: 400 }
      )
    }

    // Check if POA&M ID exists
    const existing = await prisma.pOAMItem.findUnique({
      where: { poamId },
    })

    // If excludeId is provided, ignore that item (for updates)
    const exists = existing !== null && existing.id !== excludeId

    return NextResponse.json({
      available: !exists,
      exists,
      poamId,
    })
  } catch (error) {
    console.error("Error checking POA&M ID:", error)
    return NextResponse.json(
      { error: "Failed to check POA&M ID" },
      { status: 500 }
    )
  }
}

/**
 * POA&M Statistics API Route
 * Return summary statistics for POA&M items
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

    const now = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const [
      totalItems,
      itemsByStatus,
      itemsByPriority,
      overdueItems,
      itemsDueSoon,
    ] = await Promise.all([
      prisma.pOAMItem.count(),
      prisma.pOAMItem.groupBy({
        by: ["status"],
        _count: {
          id: true,
        },
      }),
      prisma.pOAMItem.groupBy({
        by: ["priority"],
        _count: {
          id: true,
        },
      }),
      prisma.pOAMItem.count({
        where: {
          targetCompletionDate: {
            lt: now,
          },
          status: {
            notIn: ["closed", "verified"],
          },
        },
      }),
      prisma.pOAMItem.count({
        where: {
          targetCompletionDate: {
            gte: now,
            lte: thirtyDaysFromNow,
          },
          status: {
            notIn: ["closed", "verified"],
          },
        },
      }),
    ])

    // Count items by control family
    const allItems = await prisma.pOAMItem.findMany({
      select: { controlId: true },
    })

    const controlFamilyCounts: Record<string, number> = {}
    allItems.forEach((item) => {
      const familyPrefix = item.controlId.split(".").slice(0, 2).join(".")
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
      const family = familyMap[familyPrefix] || "Other"
      controlFamilyCounts[family] = (controlFamilyCounts[family] || 0) + 1
    })

    const statusBreakdown: Record<string, number> = {}
    itemsByStatus.forEach((item) => {
      statusBreakdown[item.status] = item._count.id
    })

    const priorityBreakdown: Record<string, number> = {}
    itemsByPriority.forEach((item) => {
      priorityBreakdown[item.priority] = item._count.id
    })

    return NextResponse.json({
      totalItems,
      statusBreakdown,
      priorityBreakdown,
      controlFamilyCounts,
      overdueItems,
      itemsDueSoon,
    })
  } catch (error) {
    console.error("Error fetching POA&M statistics:", error)
    return NextResponse.json(
      { error: "Failed to fetch POA&M statistics" },
      { status: 500 }
    )
  }
}

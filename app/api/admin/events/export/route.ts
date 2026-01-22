import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/authz"
import { exportEventsCSV } from "@/lib/audit"

/**
 * GET /api/admin/events/export
 * Export events to CSV
 * Requires admin
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin()

    const searchParams = req.nextUrl.searchParams
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined
    const actionType = searchParams.get("actionType") as any

    const filters = {
      startDate,
      endDate,
      actionType,
    }

    const csv = await exportEventsCSV(filters, {
      exportedBy: session.user.id,
      exportedByEmail: session.user.email || undefined,
    })

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="events-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to export events" },
      { status: error.message?.includes("Admin") ? 403 : 500 }
    )
  }
}

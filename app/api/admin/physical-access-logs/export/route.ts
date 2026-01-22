import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { logAdminAction } from "@/lib/audit"

/**
 * GET /api/admin/physical-access-logs/export
 * Export physical access logs to CSV
 * Requires admin
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin()

    const searchParams = req.nextUrl.searchParams
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const location = searchParams.get("location")

    const where: any = {}

    if (startDate || endDate) {
      where.date = {}
      if (startDate) {
        where.date.gte = new Date(startDate)
      }
      if (endDate) {
        where.date.lte = new Date(endDate)
      }
    }

    if (location) {
      where.location = location
    }

    const logs = await prisma.physicalAccessLog.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        createdBy: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    // CSV header
    const headers = [
      "Date",
      "Time In",
      "Time Out",
      "Person Name",
      "Purpose",
      "Host/Escort",
      "Location",
      "Notes",
      "Created At",
      "Created By",
    ]

    // CSV rows
    const rows = logs.map((log) => [
      log.date.toISOString().split("T")[0], // Date only
      log.timeIn,
      log.timeOut || "",
      log.personName,
      log.purpose,
      log.hostEscort || "",
      log.location,
      log.notes || "",
      log.createdAt.toISOString(),
      log.createdBy.email || log.createdBy.name || "unknown",
    ])

    // Metadata headers
    const metadataLines = [
      "# Evidence Export",
      `# Generated: ${new Date().toISOString()}`,
      "# System: MacTech Solutions Application",
      `# Exported By: ${session.user.email || session.user.id}`,
      "# Export Type: Physical Access Logs",
      "",
    ]

    // Combine metadata, header and rows
    const csv = [
      ...metadataLines,
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n")

    // Log export action
    await logAdminAction(
      session.user.id,
      session.user.email || "unknown",
      "export_physical_access_logs",
      undefined,
      {
        startDate: startDate || null,
        endDate: endDate || null,
        location: location || null,
        recordCount: logs.length,
      }
    )

    // Return CSV with appropriate headers
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="physical-access-logs-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error: any) {
    console.error("Physical access logs export error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to export physical access logs" },
      { status: error.message?.includes("Admin") ? 403 : 500 }
    )
  }
}

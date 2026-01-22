import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { logAdminAction } from "@/lib/audit"

/**
 * GET /api/admin/endpoint-inventory/export
 * Export endpoint inventory to CSV
 * Requires admin
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin()

    const endpoints = await prisma.endpointInventory.findMany({
      orderBy: { lastVerifiedDate: "desc" },
    })

    // CSV header
    const headers = [
      "Device Identifier",
      "Owner",
      "Operating System",
      "AV Enabled",
      "Last Verified Date",
      "Verification Method",
      "Notes",
      "Created At",
      "Updated At",
    ]

    // CSV rows
    const rows = endpoints.map((endpoint) => [
      endpoint.deviceIdentifier,
      endpoint.owner,
      endpoint.os,
      endpoint.avEnabled ? "Yes" : "No",
      endpoint.lastVerifiedDate?.toISOString().split("T")[0] || "",
      endpoint.verificationMethod || "",
      endpoint.notes || "",
      endpoint.createdAt.toISOString(),
      endpoint.updatedAt.toISOString(),
    ])

    // Metadata headers
    const metadataLines = [
      "# Evidence Export",
      `# Generated: ${new Date().toISOString()}`,
      "# System: MacTech Solutions Application",
      `# Exported By: ${session.user.email || session.user.id}`,
      "# Export Type: Endpoint Inventory",
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
      "export_endpoint_inventory",
      undefined,
      {
        recordCount: endpoints.length,
      }
    )

    // Return CSV with appropriate headers
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="endpoint-inventory-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error: any) {
    console.error("Endpoint inventory export error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to export endpoint inventory" },
      { status: error.message?.includes("Admin") ? 403 : 500 }
    )
  }
}

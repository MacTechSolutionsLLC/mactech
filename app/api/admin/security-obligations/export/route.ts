import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/security-obligations/export
 * Export all user attestations to CSV
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin()

    // Fetch all attestations with user information
    const attestations = await prisma.userAttestation.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: [
        { acknowledgedAt: "desc" },
        { createdAt: "desc" },
      ],
    })

    // Metadata headers
    const metadataLines = [
      "# Evidence Export",
      `# Generated: ${new Date().toISOString()}`,
      "# System: MacTech Solutions Application",
      `# Exported By: ${session.user.email || "unknown"}`,
      "# Export Type: User Security Obligations Attestations",
      "",
    ]

    // CSV header
    const headers = [
      "id",
      "userId",
      "userEmail",
      "userName",
      "attestationType",
      "version",
      "acknowledgedAt",
      "ipAddress",
      "userAgent",
      "createdAt",
    ]

    // CSV rows
    const rows = attestations.map((attestation) => [
      attestation.id,
      attestation.userId,
      attestation.user.email || "",
      attestation.user.name || "",
      attestation.attestationType,
      attestation.version,
      attestation.acknowledgedAt.toISOString(),
      attestation.ipAddress || "",
      attestation.userAgent || "",
      attestation.createdAt.toISOString(),
    ])

    // Escape CSV cells (handle commas, quotes, newlines)
    const escapeCSV = (cell: string): string => {
      if (cell === null || cell === undefined) {
        return ""
      }
      const str = String(cell)
      // Escape quotes by doubling them, then wrap in quotes
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    // Combine metadata, header and rows
    const csv = [
      ...metadataLines,
      headers.join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n")

    // Return CSV response
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="user_attestations_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error: any) {
    console.error("Error exporting attestations:", error)

    // If it's an auth error, let it propagate
    if (error.status === 401 || error.status === 403) {
      throw error
    }

    return NextResponse.json(
      { error: error.message || "Failed to export attestations" },
      { status: 500 }
    )
  }
}

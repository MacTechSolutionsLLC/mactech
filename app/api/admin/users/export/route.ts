import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/users/export
 * Export users to CSV for quarterly access review
 * Requires admin
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin()

    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
        lastLoginAt: true,
        disabled: true,
        createdAt: true,
        securityAcknowledgmentAcceptedAt: true,
      },
      orderBy: { email: "asc" },
    })

    // Generate CSV
    const headers = [
      "Email",
      "Name",
      "Role",
      "Last Login",
      "Disabled",
      "Created At",
      "Security Acknowledgment Accepted",
    ]

    const rows = users.map((user) => [
      user.email,
      user.name || "",
      user.role,
      user.lastLoginAt?.toISOString() || "",
      user.disabled ? "Yes" : "No",
      user.createdAt.toISOString(),
      user.securityAcknowledgmentAcceptedAt?.toISOString() || "Not Accepted",
    ])

    // Metadata headers
    const metadataLines = [
      "# Evidence Export",
      `# Generated: ${new Date().toISOString()}`,
      "# System: MacTech Solutions Application",
      `# Exported By: ${session.user.email || session.user.id}`,
      "# Export Type: Users",
      "",
    ]

    const csv = [
      ...metadataLines,
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="users-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to export users" },
      { status: error.message?.includes("Admin") ? 403 : 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { logAdminAction } from "@/lib/audit"
import { z } from "zod"

// Validation schema for endpoint inventory entry
const endpointInventorySchema = z.object({
  deviceIdentifier: z.string().min(1, "Device identifier is required"),
  owner: z.string().min(1, "Owner is required"),
  os: z.string().min(1, "Operating system is required"),
  avEnabled: z.boolean(),
  lastVerifiedDate: z.string().transform((str) => (str ? new Date(str) : null)).optional().nullable(),
  verificationMethod: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

/**
 * GET /api/admin/endpoint-inventory
 * List endpoint inventory entries
 * Requires admin
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin()

    const searchParams = req.nextUrl.searchParams
    const owner = searchParams.get("owner")
    const avEnabled = searchParams.get("avEnabled")
    const limit = parseInt(searchParams.get("limit") || "100")
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: any = {}

    if (owner) {
      where.owner = { contains: owner, mode: "insensitive" }
    }

    if (avEnabled !== null && avEnabled !== undefined) {
      where.avEnabled = avEnabled === "true"
    }

    const [endpoints, total] = await Promise.all([
      prisma.endpointInventory.findMany({
        where,
        orderBy: { lastVerifiedDate: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.endpointInventory.count({ where }),
    ])

    return NextResponse.json({
      endpoints,
      total,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error("Endpoint inventory list error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to list endpoint inventory" },
      { status: error.message?.includes("Admin") ? 403 : 500 }
    )
  }
}

/**
 * POST /api/admin/endpoint-inventory
 * Create or update endpoint inventory entry
 * Requires admin
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin()

    const body = await req.json()
    const validated = endpointInventorySchema.parse(body)

    // Check if endpoint exists by device identifier
    const existing = await prisma.endpointInventory.findFirst({
      where: { deviceIdentifier: validated.deviceIdentifier },
    })

    let endpoint

    if (existing) {
      // Update existing
      endpoint = await prisma.endpointInventory.update({
        where: { id: existing.id },
        data: {
          owner: validated.owner,
          os: validated.os,
          avEnabled: validated.avEnabled,
          lastVerifiedDate: validated.lastVerifiedDate || null,
          verificationMethod: validated.verificationMethod || null,
          notes: validated.notes || null,
        },
      })
    } else {
      // Create new
      endpoint = await prisma.endpointInventory.create({
        data: {
          deviceIdentifier: validated.deviceIdentifier,
          owner: validated.owner,
          os: validated.os,
          avEnabled: validated.avEnabled,
          lastVerifiedDate: validated.lastVerifiedDate || null,
          verificationMethod: validated.verificationMethod || null,
          notes: validated.notes || null,
        },
      })
    }

    // Log admin action
    await logAdminAction(
      session.user.id,
      session.user.email || "unknown",
      existing ? "endpoint_inventory_updated" : "endpoint_inventory_created",
      { type: "endpoint_inventory", id: endpoint.id },
      {
        deviceIdentifier: endpoint.deviceIdentifier,
        owner: endpoint.owner,
        avEnabled: endpoint.avEnabled,
      }
    )

    return NextResponse.json({
      success: true,
      endpoint,
    })
  } catch (error: any) {
    console.error("Endpoint inventory creation error:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to create/update endpoint inventory" },
      { status: error.message?.includes("Admin") ? 403 : 500 }
    )
  }
}

/**
 * GET /api/admin/endpoint-inventory/export
 * Export endpoint inventory to CSV
 * Requires admin
 */
export async function GET_EXPORT(req: NextRequest) {
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

    // Combine header and rows
    const csv = [
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

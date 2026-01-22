import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { logAdminAction } from "@/lib/audit"
import { z } from "zod"

// Validation schema for physical access log entry
const physicalAccessLogSchema = z.object({
  date: z.string().transform((str) => new Date(str)),
  timeIn: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:mm format"),
  timeOut: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:mm format").optional().nullable(),
  personName: z.string().min(1, "Person name is required"),
  purpose: z.string().min(1, "Purpose is required"),
  hostEscort: z.string().optional().nullable(),
  location: z.string().min(1, "Location is required"),
  notes: z.string().optional().nullable(),
})

/**
 * GET /api/admin/physical-access-logs
 * List physical access logs with filters
 * Requires admin
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin()

    const searchParams = req.nextUrl.searchParams
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const location = searchParams.get("location")
    const limit = parseInt(searchParams.get("limit") || "100")
    const offset = parseInt(searchParams.get("offset") || "0")

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

    const [logs, total] = await Promise.all([
      prisma.physicalAccessLog.findMany({
        where,
        orderBy: { date: "desc" },
        take: limit,
        skip: offset,
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
      prisma.physicalAccessLog.count({ where }),
    ])

    return NextResponse.json({
      logs,
      total,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error("Physical access logs list error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to list physical access logs" },
      { status: error.message?.includes("Admin") ? 403 : 500 }
    )
  }
}

/**
 * POST /api/admin/physical-access-logs
 * Create a new physical access log entry
 * Requires admin
 * Entries are immutable after creation (tamper-evident)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin()

    const body = await req.json()
    const validated = physicalAccessLogSchema.parse(body)

    // Create the log entry
    const log = await prisma.physicalAccessLog.create({
      data: {
        date: validated.date,
        timeIn: validated.timeIn,
        timeOut: validated.timeOut || null,
        personName: validated.personName,
        purpose: validated.purpose,
        hostEscort: validated.hostEscort || null,
        location: validated.location,
        notes: validated.notes || null,
        createdByUserId: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    // Log admin action
    await logAdminAction(
      session.user.id,
      session.user.email || "unknown",
      "physical_access_log_created",
      { type: "physical_access_log", id: log.id },
      {
        location: log.location,
        personName: log.personName,
        date: log.date.toISOString(),
      }
    )

    return NextResponse.json({
      success: true,
      log,
    })
  } catch (error: any) {
    console.error("Physical access log creation error:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to create physical access log" },
      { status: error.message?.includes("Admin") ? 403 : 500 }
    )
  }
}

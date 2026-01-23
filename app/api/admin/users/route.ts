import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { logAdminAction } from "@/lib/audit"
// CUI monitoring not needed for GET endpoints (read-only)

/**
 * GET /api/admin/users
 * List users with filters, pagination, and statistics
 * Requires admin
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin()

    const searchParams = req.nextUrl.searchParams
    const role = searchParams.get("role")
    const disabled = searchParams.get("disabled")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "100")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const where: any = {}

    if (role && role !== "all") {
      where.role = role
    }

    if (disabled !== null && disabled !== "all") {
      where.disabled = disabled === "true"
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ]
    }

    // Get total count for pagination
    const total = await prisma.user.count({ where })

    // Calculate pagination
    const skip = (page - 1) * limit
    const totalPages = Math.ceil(total / limit)

    // Build orderBy
    const orderBy: any = {}
    if (sortBy === "email" || sortBy === "name" || sortBy === "role") {
      orderBy[sortBy] = sortOrder
    } else if (sortBy === "lastLoginAt" || sortBy === "createdAt") {
      orderBy[sortBy] = sortOrder
    } else {
      orderBy.createdAt = "desc"
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        disabled: true,
        lastLoginAt: true,
        createdAt: true,
        securityAcknowledgmentAcceptedAt: true,
      },
      orderBy,
      skip,
      take: limit,
    })

    // Get statistics
    const stats = {
      total: await prisma.user.count(),
      active: await prisma.user.count({ where: { disabled: false } }),
      disabled: await prisma.user.count({ where: { disabled: true } }),
      admins: await prisma.user.count({ where: { role: "ADMIN", disabled: false } }),
      users: await prisma.user.count({ where: { role: "USER", disabled: false } }),
    }

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      stats,
    })
  } catch (error: any) {
    console.error("Error listing users:", error)
    return NextResponse.json(
      { error: error.message || "Failed to list users" },
      { status: error.message?.includes("Admin") ? 403 : 500 }
    )
  }
}


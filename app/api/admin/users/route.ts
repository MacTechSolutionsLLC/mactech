import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { logAdminAction } from "@/lib/audit"
// CUI monitoring not needed for GET endpoints (read-only)

/**
 * GET /api/admin/users
 * List users with filters
 * Requires admin
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin()

    const searchParams = req.nextUrl.searchParams
    const role = searchParams.get("role")
    const disabled = searchParams.get("disabled")
    const search = searchParams.get("search")

    const where: any = {}

    if (role) {
      where.role = role
    }

    if (disabled !== null) {
      where.disabled = disabled === "true"
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ]
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
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ users })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to list users" },
      { status: error.message?.includes("Admin") ? 403 : 500 }
    )
  }
}


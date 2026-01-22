import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { logEvent } from "@/lib/audit"

/**
 * POST /api/auth/security-acknowledgment
 * Save security acknowledgment acceptance
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()

    const { version } = await req.json()

    if (!version) {
      return NextResponse.json(
        { error: "Version is required" },
        { status: 400 }
      )
    }

    // Update user's security acknowledgment
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        securityAcknowledgmentVersion: version,
        securityAcknowledgmentAcceptedAt: new Date(),
        securityAcknowledgmentRequired: false,
      },
    })

    // Log security acknowledgment event
    await logEvent(
      "security_acknowledgment",
      session.user.id,
      session.user.email || null,
      true,
      "user",
      session.user.id,
      {
        version,
      }
    )

    return NextResponse.json({
      success: true,
      message: "Security acknowledgment saved",
    })
  } catch (error: any) {
    console.error("Security acknowledgment error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to save acknowledgment" },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    )
  }
}

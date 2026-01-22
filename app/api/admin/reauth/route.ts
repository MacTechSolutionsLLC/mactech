import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { requireAdmin } from "@/lib/authz"
import { verifyAdminReauth } from "@/lib/admin-reauth"
import { logAdminAction } from "@/lib/audit"

/**
 * POST /api/admin/reauth
 * Verify admin re-authentication password
 * Sets re-auth flag in session for sensitive admin actions
 */
export async function POST(req: NextRequest) {
  try {
    // Require admin
    const session = await requireAdmin()

    const { password } = await req.json()

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      )
    }

    // Verify password
    const isValid = await verifyAdminReauth(password)

    if (!isValid) {
      // Log failed re-auth attempt
      await logAdminAction(
        session.user.id,
        session.user.email || "unknown",
        "admin_reauth_failed",
        undefined,
        { reason: "Invalid password" }
      )

      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      )
    }

    // Log successful re-auth
    await logAdminAction(
      session.user.id,
      session.user.email || "unknown",
      "admin_reauth_success",
      undefined
    )

    // Return success
    // Client must call session.update({ adminReauthVerified: true }) to set the flag
    // The flag is stored in JWT token and expires with session
    return NextResponse.json({
      success: true,
      message: "Re-authentication successful",
      requiresSessionUpdate: true, // Client should update session
    })
  } catch (error: any) {
    console.error("Admin re-auth error:", error)
    return NextResponse.json(
      { error: error.message || "Re-authentication failed" },
      { status: error.message?.includes("Admin") ? 403 : 500 }
    )
  }
}

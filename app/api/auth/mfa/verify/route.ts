/**
 * MFA Verification API Route
 * Verifies TOTP code or backup code during login
 */

import { NextRequest, NextResponse } from "next/server"
import { verifyMFA } from "@/lib/mfa"
import { logEvent } from "@/lib/audit"
import { auth } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Require an authenticated session (password step completed) for MFA verification.
    // This endpoint completes the MFA step-up for the currently authenticated user.
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userId, code, userEmail } = body

    if (!userId || !code) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Prevent verifying MFA for a different user than the authenticated session.
    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Verify MFA code
    const result = await verifyMFA(userId, code)

    if (!result.valid) {
      // Log failed MFA verification
      await logEvent(
        "mfa_verification_failed",
        userId,
        userEmail || null,
        false,
        "user",
        userId,
        {
          reason: "Invalid MFA code",
          mfaMethod: result.usedBackupCode ? "backup_code" : "TOTP",
        }
      )

      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 401 }
      )
    }

    // Log successful MFA verification
    await logEvent(
      "mfa_verification_success",
      userId,
      userEmail || null,
      true,
      "user",
      userId,
      {
        mfaMethod: result.usedBackupCode ? "backup_code" : "TOTP",
        mfaVerified: true,
      }
    )

    // If a backup code was used, log it explicitly for auditability.
    if (result.usedBackupCode) {
      await logEvent(
        "mfa_backup_code_used",
        userId,
        userEmail || null,
        true,
        "user",
        userId,
        { what: "Backup code used for MFA verification" }
      )
    }

    return NextResponse.json({
      success: true,
      usedBackupCode: result.usedBackupCode,
    })
  } catch (error) {
    console.error("MFA verification error:", error)
    return NextResponse.json(
      { error: "Failed to verify MFA code" },
      { status: 500 }
    )
  }
}

/**
 * MFA Verification API Route
 * Verifies TOTP code or backup code during login
 */

import { NextRequest, NextResponse } from "next/server"
import { verifyMFA } from "@/lib/mfa"
import { logEvent } from "@/lib/audit"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, code, userEmail } = body

    if (!userId || !code) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify MFA code
    const result = await verifyMFA(userId, code)

    if (!result.valid) {
      // Log failed MFA verification
      await logEvent(
        "login_failed",
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
      "login",
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

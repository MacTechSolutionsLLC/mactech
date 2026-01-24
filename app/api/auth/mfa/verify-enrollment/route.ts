/**
 * MFA Enrollment Verification API Route
 * Verifies TOTP code during enrollment and saves MFA configuration
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { verifyTOTPCode, enableMFA } from "@/lib/mfa"
import { isMFAEnrolled } from "@/lib/mfa"
import { logEvent } from "@/lib/audit"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const userEmail = session.user.email || ""

    // Check if already enrolled
    const alreadyEnrolled = await isMFAEnrolled(userId)
    if (alreadyEnrolled) {
      return NextResponse.json(
        { error: "MFA is already enrolled" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { secret, code, backupCodes } = body

    if (!secret || !code || !backupCodes) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify TOTP code
    const isValid = verifyTOTPCode(secret, code)
    if (!isValid) {
      // Log failed MFA enrollment attempt
      await logEvent(
        "admin_action",
        userId,
        userEmail,
        false,
        "user",
        userId,
        {
          action: "mfa_enrollment_verification_failed",
          reason: "Invalid TOTP code",
        }
      )

      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      )
    }

    // Enable MFA for user
    await enableMFA(userId, secret, backupCodes)

    // Log successful MFA enrollment
    await logEvent(
      "admin_action",
      userId,
      userEmail,
      true,
      "user",
      userId,
      {
        action: "mfa_enrollment_completed",
        mfaMethod: "TOTP",
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("MFA enrollment verification error:", error)
    return NextResponse.json(
      { error: "Failed to verify MFA enrollment" },
      { status: 500 }
    )
  }
}

/**
 * MFA Enrollment API Route
 * Generates TOTP secret and QR code for MFA enrollment
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { generateMFASecret, generateTOTPURI, generateBackupCodes } from "@/lib/mfa"
import { isMFAEnrolled, isMFARequired } from "@/lib/mfa"
import QRCode from "qrcode"
import { logEvent } from "@/lib/audit"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const userEmail = session.user.email || ""

    // Check if MFA is required (ADMIN role)
    const mfaRequired = await isMFARequired(userId)
    if (!mfaRequired) {
      return NextResponse.json(
        { error: "MFA is not required for your role" },
        { status: 403 }
      )
    }

    // Check if already enrolled
    const alreadyEnrolled = await isMFAEnrolled(userId)
    if (alreadyEnrolled) {
      return NextResponse.json(
        { error: "MFA is already enrolled" },
        { status: 400 }
      )
    }

    // Generate MFA secret
    const secret = generateMFASecret(userEmail)
    const totpURI = generateTOTPURI(userEmail, secret)

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(totpURI)

    // Generate backup codes (will be hashed when saved)
    const backupCodes = generateBackupCodes(10)

    // Log MFA enrollment initiation
    await logEvent(
      "admin_action",
      userId,
      userEmail,
      true,
      "user",
      userId,
      {
        action: "mfa_enrollment_initiated",
        mfaMethod: "TOTP",
      }
    )

    return NextResponse.json({
      secret, // Return secret for verification step
      qrCode: qrCodeDataURL,
      backupCodes, // Return plain backup codes for display (user should save these)
      totpURI, // For manual entry if QR code doesn't work
    })
  } catch (error) {
    console.error("MFA enrollment error:", error)
    return NextResponse.json(
      { error: "Failed to generate MFA enrollment" },
      { status: 500 }
    )
  }
}

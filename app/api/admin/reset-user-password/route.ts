import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { requireAdmin } from '@/lib/authz'
import { requireAdminReauth } from '@/lib/admin-reauth'
import { validatePassword, PASSWORD_POLICY } from '@/lib/password-policy'
import { monitorCUIKeywords } from '@/lib/cui-blocker'
import { logAdminAction, logEvent } from '@/lib/audit'

// Admin endpoint to reset a user's password
// Requires admin re-authentication for sensitive action
export async function POST(req: NextRequest) {
  try {
    // Read request body once
    const body = await req.json()
    const { email, newPassword } = body
    
    // Check if re-auth is required (before attempting)
    let session
    try {
      session = await requireAdminReauth()
    } catch (error: any) {
      // Log that re-auth was required but not provided
      if (error.requiresReauth) {
        const authSession = await requireAdmin()
        
        await logEvent(
          "admin_action",
          authSession.user.id,
          authSession.user.email || "unknown",
          false,
          "user",
          undefined,
          {
            action: "admin_reauth_required",
            attemptedAction: "password_reset",
            targetEmail: email,
            reason: "Re-authentication required but not verified"
          }
        )
      }
      
      throw error
    }

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and newPassword are required' },
        { status: 400 }
      )
    }

    // Monitor input for CUI keywords (monitoring-only, does not block)
    await monitorCUIKeywords({ email }, "password_reset", session.user.id, session.user.email || null)

    // Validate password against policy
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          error: 'Password does not meet requirements',
          errors: passwordValidation.errors,
        },
        { status: 400 }
      )
    }

    // Find user by email or name (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: email, mode: 'insensitive' } },
          { name: { equals: email.toLowerCase(), mode: 'insensitive' } }
        ]
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Hash new password with configured cost factor
    const hashedPassword = await bcrypt.hash(newPassword, PASSWORD_POLICY.bcryptRounds)

    // Update password and reset mustChangePassword flag
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: true, // Force password change on next login
      }
    })

    // Log admin action
    await logAdminAction(
      session.user.id,
      session.user.email || "unknown",
      "password_reset",
      { type: "user", id: user.id },
      {
        targetEmail: user.email,
        reauthVerified: true, // Indicate that re-auth was verified for this action
      }
    )

    return NextResponse.json({
      success: true,
      message: `Password reset successfully for ${user.email}`,
      user: {
        email: user.email,
        name: user.name,
      }
    })
  } catch (error: any) {
    console.error('Error resetting password:', error)

    if (error.requiresReauth) {
      return NextResponse.json(
        { error: "Admin re-authentication required", requiresReauth: true },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to reset password' },
      { status: error.message?.includes("Admin") || error.message?.includes("CUI") ? 400 : 500 }
    )
  }
}

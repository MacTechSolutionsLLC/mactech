import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { requireAdmin } from '@/lib/authz'
import { validatePassword, PASSWORD_POLICY } from '@/lib/password-policy'
import { monitorCUIKeywords } from '@/lib/cui-blocker'
import { logAdminAction } from '@/lib/audit'

// Admin endpoint to reset a user's password
// Requires admin authentication
export async function POST(req: NextRequest) {
  try {
    // Require admin authentication
    const session = await requireAdmin()
    
    // Read request body
    const body = await req.json()
    const { email, newPassword } = body

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

    // Check password history to prevent reuse (NIST SP 800-171 Rev. 2, Section 3.5.8)
    const passwordHistory = await prisma.passwordHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: PASSWORD_POLICY.passwordHistoryCount,
    })

    // Check against password history
    for (const historyEntry of passwordHistory) {
      const isReusedPassword = await bcrypt.compare(newPassword, historyEntry.passwordHash)
      if (isReusedPassword) {
        return NextResponse.json(
          { 
            error: `Password cannot be reused. The user cannot use any of their last ${PASSWORD_POLICY.passwordHistoryCount} passwords.`,
            errors: [`Password reuse is prohibited for the last ${PASSWORD_POLICY.passwordHistoryCount} passwords`]
          },
          { status: 400 }
        )
      }
    }

    // Check if new password is same as current password
    if (user.password) {
      const isSamePassword = await bcrypt.compare(newPassword, user.password)
      if (isSamePassword) {
        return NextResponse.json(
          { error: 'New password must be different from current password' },
          { status: 400 }
        )
      }
    }

    // Hash new password with configured cost factor
    const hashedPassword = await bcrypt.hash(newPassword, PASSWORD_POLICY.bcryptRounds)

    // Save current password to history before updating (if user has a password)
    if (user.password) {
      await prisma.passwordHistory.create({
        data: {
          userId: user.id,
          passwordHash: user.password, // Store the old password hash
        }
      })
    }

    // Update password and reset mustChangePassword flag
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: true, // Force password change on next login
      }
    })

    // Clean up old password history entries (keep only the configured number)
    const allHistoryEntries = await prisma.passwordHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    if (allHistoryEntries.length > PASSWORD_POLICY.passwordHistoryCount) {
      const entriesToDelete = allHistoryEntries.slice(PASSWORD_POLICY.passwordHistoryCount)
      await prisma.passwordHistory.deleteMany({
        where: {
          id: { in: entriesToDelete.map(e => e.id) }
        }
      })
    }

    // Log admin action
    await logAdminAction(
      session.user.id,
      session.user.email || "unknown",
      "password_reset",
      { type: "user", id: user.id },
      {
        targetEmail: user.email,
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

    return NextResponse.json(
      { error: error.message || 'Failed to reset password' },
      { status: error.message?.includes("Admin") || error.message?.includes("CUI") ? 400 : 500 }
    )
  }
}

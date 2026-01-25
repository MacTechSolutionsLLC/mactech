import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { requireAdmin } from '@/lib/authz'
import { PASSWORD_POLICY } from '@/lib/password-policy'
import { monitorCUIKeywords } from '@/lib/cui-blocker'
import { logAdminAction } from '@/lib/audit'
import { generateTemporaryPassword, getTemporaryPasswordExpiration } from '@/lib/temporary-password'

// Admin endpoint to reset a user's password
// Requires admin authentication
export async function POST(req: NextRequest) {
  try {
    // Require admin authentication
    const session = await requireAdmin()
    
    // Read request body
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Monitor input for CUI keywords (monitoring-only, does not block)
    await monitorCUIKeywords({ email }, "password_reset", session.user.id, session.user.email || null)

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

    // Generate temporary password (NIST SP 800-171 Rev. 2, Section 3.5.9)
    const temporaryPassword = generateTemporaryPassword()
    const temporaryPasswordExpiresAt = getTemporaryPasswordExpiration()

    // Hash temporary password with configured cost factor
    const hashedPassword = await bcrypt.hash(temporaryPassword, PASSWORD_POLICY.bcryptRounds)

    // Save current password to history before updating (if user has a password)
    if (user.password) {
      await prisma.passwordHistory.create({
        data: {
          userId: user.id,
          passwordHash: user.password, // Store the old password hash
        }
      })
    }

    // Update password with temporary password (NIST SP 800-171 Rev. 2, Section 3.5.9)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        isTemporaryPassword: true, // Mark as temporary password
        temporaryPasswordExpiresAt: temporaryPasswordExpiresAt, // Set expiration (72 hours)
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
        temporaryPasswordGenerated: true,
        temporaryPasswordExpiresAt: temporaryPasswordExpiresAt.toISOString(),
      }
    )

    return NextResponse.json({
      success: true,
      message: `Password reset successfully for ${user.email}. Temporary password generated.`,
      temporaryPassword: temporaryPassword, // Return temporary password for admin to provide to user securely
      temporaryPasswordExpiresAt: temporaryPasswordExpiresAt.toISOString(),
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

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { validatePassword, PASSWORD_POLICY } from '@/lib/password-policy'
import { logEvent } from '@/lib/audit'

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    // Validate password against policy
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Password does not meet requirements',
          errors: passwordValidation.errors
        },
        { status: 400 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    )

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Check if new password is different from current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
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
            error: `Password cannot be reused. You cannot use any of your last ${PASSWORD_POLICY.passwordHistoryCount} passwords.`,
            errors: [`Password reuse is prohibited for the last ${PASSWORD_POLICY.passwordHistoryCount} passwords`]
          },
          { status: 400 }
        )
      }
    }

    // Hash new password with configured cost factor
    const hashedPassword = await bcrypt.hash(newPassword, PASSWORD_POLICY.bcryptRounds)

    // Check if changing from temporary password (NIST SP 800-171 Rev. 2, Section 3.5.9)
    const wasTemporaryPassword = user.isTemporaryPassword

    // Update password and clear temporary password flags (NIST SP 800-171 Rev. 2, Section 3.5.9)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false, // Clear forced change flag
        isTemporaryPassword: false, // Mark as permanent password
        temporaryPasswordExpiresAt: null, // Clear expiration
      }
    })

    // Save current password to history before updating
    await prisma.passwordHistory.create({
      data: {
        userId: user.id,
        passwordHash: user.password, // Store the old password hash
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

    // Log password change event with detailed information
    await logEvent(
      "password_change",
      session.user.id,
      session.user.email || null,
      true,
      "user",
      user.id,
      {
        what: wasTemporaryPassword ? "Password change from temporary to permanent" : "Password change",
        toWhom: {
          targetType: "user",
          targetId: user.id,
          targetEmail: user.email,
          wasTemporaryPassword: wasTemporaryPassword,
        },
        message: wasTemporaryPassword 
          ? `User ${user.email} changed temporary password to permanent password (NIST 3.5.9)`
          : `User ${user.email} changed their password`,
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}

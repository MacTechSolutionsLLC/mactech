import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { requireAdmin } from '@/lib/authz'
import { PASSWORD_POLICY } from '@/lib/password-policy'
import { monitorCUIKeywords } from '@/lib/cui-blocker'
import { logAdminAction, logEvent } from '@/lib/audit'
import { generateTemporaryPassword, getTemporaryPasswordExpiration } from '@/lib/temporary-password'

// API route to create admin users (protected - only existing admins can create new users)
// Requires admin authentication
export async function POST(req: NextRequest) {
  try {
    // Require admin authentication
    const session = await requireAdmin()

    const { email, name, role = 'ADMIN' } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Monitor input for CUI keywords (monitoring-only, does not block)
    await monitorCUIKeywords({ email, name, role }, "user_creation", session.user.id, session.user.email || null)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Generate temporary password (NIST SP 800-171 Rev. 2, Section 3.5.9)
    const temporaryPassword = generateTemporaryPassword()
    const temporaryPasswordExpiresAt = getTemporaryPasswordExpiration()

    // Hash temporary password with configured cost factor
    const hashedPassword = await bcrypt.hash(temporaryPassword, PASSWORD_POLICY.bcryptRounds)

    // Create user with temporary password (NIST SP 800-171 Rev. 2, Section 3.5.9)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
        isTemporaryPassword: true, // Mark as temporary password
        temporaryPasswordExpiresAt: temporaryPasswordExpiresAt, // Set expiration (72 hours)
        mustChangePassword: true, // Force password change on first login
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        isTemporaryPassword: true,
        temporaryPasswordExpiresAt: true,
      }
    })

    // Log admin action with detailed information
    await logAdminAction(
      session.user.id,
      session.user.email || "unknown",
      "user_create",
      { type: "user", id: user.id },
      {
        what: "User creation with temporary password",
        toWhom: {
          targetType: "user",
          targetId: user.id,
          targetName: user.name,
          createdEmail: email,
          createdRole: role || "USER",
          createdName: name || null,
          temporaryPasswordGenerated: true,
          temporaryPasswordExpiresAt: temporaryPasswordExpiresAt.toISOString(),
        },
        message: `Created new user: ${email} (${role || "USER"}) with temporary password`,
      }
    )

    // Log user creation event
    await logEvent(
      "user_create",
      session.user.id,
      session.user.email || null,
      true,
      "user",
      user.id,
      {
        what: "User creation with temporary password",
        toWhom: {
          targetType: "user",
          targetId: user.id,
          targetName: user.name,
          createdEmail: email,
          createdRole: role || "USER",
          createdName: name || null,
          temporaryPasswordGenerated: true,
          temporaryPasswordExpiresAt: temporaryPasswordExpiresAt.toISOString(),
        },
        message: `Created new user: ${email} (${role || "USER"}) with temporary password`,
      }
    )

    return NextResponse.json({
      success: true,
      user,
      temporaryPassword: temporaryPassword, // Return temporary password for admin to provide to user securely
      temporaryPasswordExpiresAt: temporaryPasswordExpiresAt.toISOString(),
      message: 'User created successfully with temporary password. User must change password on first login.'
    })
  } catch (error: any) {
    console.error('Error creating user:', error)

    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: error.message?.includes("Admin") || error.message?.includes("CUI") ? 400 : 500 }
    )
  }
}

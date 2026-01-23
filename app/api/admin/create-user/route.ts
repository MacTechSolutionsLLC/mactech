import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { requireAdmin } from '@/lib/authz'
import { validatePassword, PASSWORD_POLICY } from '@/lib/password-policy'
import { monitorCUIKeywords } from '@/lib/cui-blocker'
import { logAdminAction, logEvent } from '@/lib/audit'

// API route to create admin users (protected - only existing admins can create new users)
// Requires admin authentication
export async function POST(req: NextRequest) {
  try {
    // Require admin authentication
    const session = await requireAdmin()

    const { email, password, name, role = 'ADMIN' } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Monitor input for CUI keywords (monitoring-only, does not block)
    await monitorCUIKeywords({ email, name, role }, "user_creation", session.user.id, session.user.email || null)

    // Validate password against policy
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          error: 'Password does not meet requirements',
          errors: passwordValidation.errors,
        },
        { status: 400 }
      )
    }

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

    // Hash password with configured cost factor
    const hashedPassword = await bcrypt.hash(password, PASSWORD_POLICY.bcryptRounds)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    })

    // Log admin action
    await logAdminAction(
      session.user.id,
      session.user.email || "unknown",
      "user_create",
      { type: "user", id: user.id },
      {
        createdEmail: email,
        createdRole: role,
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
        createdEmail: email,
        createdRole: role,
      }
    )

    return NextResponse.json({
      success: true,
      user,
      message: 'User created successfully'
    })
  } catch (error: any) {
    console.error('Error creating user:', error)

    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: error.message?.includes("Admin") || error.message?.includes("CUI") ? 400 : 500 }
    )
  }
}

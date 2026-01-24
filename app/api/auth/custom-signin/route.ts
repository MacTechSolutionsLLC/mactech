/**
 * Custom Sign-In API Route
 * Handles password authentication and MFA requirement checks
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { logLogin } from "@/lib/audit"
import { isMFARequired, isMFAEnrolled } from "@/lib/mfa"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const loginValue = email.toLowerCase().trim()

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: loginValue, mode: "insensitive" } },
          { name: { equals: loginValue, mode: "insensitive" } },
        ],
      },
    })

    if (!user || !user.password) {
      await logLogin(null, loginValue, false).catch(() => {})
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      )
    }

    // Check if account is locked
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      await logLogin(user.id, user.email, false).catch(() => {})
      return NextResponse.json(
        {
          error: "Account is locked due to too many failed login attempts. Please try again later.",
        },
        { status: 403 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      // Increment failed login attempts
      const failedAttempts = (user.failedLoginAttempts || 0) + 1
      const maxAttempts = 5
      const lockoutDuration = 30 * 60 * 1000 // 30 minutes

      if (failedAttempts >= maxAttempts) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: failedAttempts,
            lockedUntil: new Date(Date.now() + lockoutDuration),
          },
        }).catch(() => {})
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: failedAttempts },
        }).catch(() => {})
      }

      await logLogin(user.id, user.email, false).catch(() => {})
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      )
    }

    // Reset failed login attempts on successful password verification
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }).catch(() => {})
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    }).catch(() => {})

    // Check MFA requirements
    const mfaRequired = await isMFARequired(user.id)
    const mfaEnrolled = await isMFAEnrolled(user.id)

    // Log successful password authentication
    await logLogin(user.id, user.email, true).catch(() => {})

    // If MFA is required and enrolled, return MFA verification required
    if (mfaRequired && mfaEnrolled) {
      return NextResponse.json({
        success: true,
        requiresMFA: true,
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
      })
    }

    // If MFA is required but not enrolled, redirect to enrollment
    if (mfaRequired && !mfaEnrolled) {
      return NextResponse.json({
        success: true,
        requiresMFAEnrollment: true,
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
      })
    }

    // No MFA required, proceed with normal NextAuth sign-in
    // We'll use NextAuth's signIn function from the client
    return NextResponse.json({
      success: true,
      requiresMFA: false,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
    })
  } catch (error) {
    console.error("Custom sign-in error:", error)
    return NextResponse.json(
      { error: "An error occurred during sign-in" },
      { status: 500 }
    )
  }
}

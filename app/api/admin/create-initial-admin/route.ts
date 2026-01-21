import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// One-time route to create the first admin user
// This should be called manually or removed after initial setup
export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Check if user already exists (by email or name)
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: email, mode: 'insensitive' } },
          { name: { equals: name?.toLowerCase() || email.toLowerCase(), mode: 'insensitive' } }
        ]
      }
    })

    if (existing) {
      // If user exists, reset their password instead of erroring
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          password: hashedPassword,
          mustChangePassword: true,
          name: name || existing.name,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        }
      })

      return NextResponse.json({
        success: true,
        user: updated,
        message: 'User password reset successfully (user already existed)'
      })
    }

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: 'ADMIN',
        mustChangePassword: true, // Force password change on first login
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      success: true,
      user,
      message: 'Initial admin user created successfully'
    })
  } catch (error) {
    console.error('Error creating initial admin:', error)
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
}

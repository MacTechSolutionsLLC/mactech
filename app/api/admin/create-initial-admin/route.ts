import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// One-time route to create the first admin user
// This should be called manually or removed after initial setup
export async function POST(req: NextRequest) {
  try {
    // Check if we already have 4 admin users (initial setup complete)
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    })

    if (adminCount >= 4) {
      return NextResponse.json(
        { error: 'Initial admin users already created. Use /api/admin/create-user instead.' },
        { status: 400 }
      )
    }

    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
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

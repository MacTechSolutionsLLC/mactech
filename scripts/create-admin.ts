import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function createAdmin() {
  const email = process.argv[2]
  const password = process.argv[3]
  const name = process.argv[4] || 'Admin User'

  if (!email || !password) {
    console.error('Usage: tsx scripts/create-admin.ts <email> <password> [name]')
    console.error('Example: tsx scripts/create-admin.ts admin@mactech.com mypassword "Admin Name"')
    process.exit(1)
  }

  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email }
    })

    if (existing) {
      console.error(`User with email ${email} already exists`)
      process.exit(1)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log('Email:', user.email)
    console.log('Name:', user.name)
    console.log('Role:', user.role)
    console.log('Created at:', user.createdAt)
  } catch (error) {
    console.error('Error creating admin user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()

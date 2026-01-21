import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

const users = [
  { email: 'patrick@mactech.com', name: 'Patrick' },
  { email: 'jonny@mactech.com', name: 'Jonny' },
  { email: 'jimbo@mactech.com', name: 'Jimbo' },
  { email: 'bryan@mactech.com', name: 'Bryan' },
]

// Default password for all users
const defaultPassword = 'changeme'

async function createInitialUsers() {
  console.log('Creating initial admin users...\n')

  for (const userData of users) {
    try {
      // Check if user already exists
      const existing = await prisma.user.findUnique({
        where: { email: userData.email }
      })

      if (existing) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`)
        continue
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(defaultPassword, 10)

      // Create user with mustChangePassword flag set to true
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: 'ADMIN',
          mustChangePassword: true, // Force password change on first login
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          mustChangePassword: true,
          createdAt: true,
        }
      })

      console.log(`✅ Created user: ${user.email}`)
      console.log(`   Name: ${user.name}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Must change password: ${user.mustChangePassword}`)
      console.log('')
    } catch (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error)
    }
  }

  console.log('Done!')
}

createInitialUsers()
  .then(() => {
    prisma.$disconnect()
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    prisma.$disconnect()
    process.exit(1)
  })

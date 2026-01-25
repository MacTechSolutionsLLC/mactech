import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { logLogin } from "./audit"
import { isTemporaryPasswordExpired } from "./temporary-password"
import { getFIPSJWTConfig } from "./fips-nextauth-config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  trustHost: true, // Trust Railway's proxy
  // FIPS-validated JWT configuration (uses FIPS crypto when available)
  jwt: getFIPSJWTConfig(),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const loginValue = (credentials.email as string).toLowerCase().trim()
        
        // Try to find user by email first, then by name (case-insensitive)
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: { equals: loginValue, mode: 'insensitive' } },
              { name: { equals: loginValue, mode: 'insensitive' } }
            ]
          }
        })

        if (!user || !user.password) {
          // Log failed login attempt (user not found)
          await logLogin(null, loginValue, false).catch(() => {
            // Don't fail auth if logging fails
          })
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          // Increment failed login attempts and check for lockout
          const failedAttempts = (user.failedLoginAttempts || 0) + 1
          const maxAttempts = 5 // Configurable: 5 failed attempts
          const lockoutDuration = 30 * 60 * 1000 // 30 minutes in milliseconds

          if (failedAttempts >= maxAttempts) {
            // Lock account
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: failedAttempts,
                lockedUntil: new Date(Date.now() + lockoutDuration),
              },
            }).catch(() => {
              // Don't fail if update fails
            })
          } else {
            // Increment failed attempts
            await prisma.user.update({
              where: { id: user.id },
              data: { failedLoginAttempts: failedAttempts },
            }).catch(() => {
              // Don't fail if update fails
            })
          }

          // Log failed login attempt (invalid password)
          await logLogin(user.id, user.email, false).catch(() => {
            // Don't fail auth if logging fails
          })
          return null
        }

        // Check if account is locked
        if (user.lockedUntil && new Date() < user.lockedUntil) {
          // Log locked account access attempt
          await logLogin(user.id, user.email, false).catch(() => {
            // Don't fail auth if logging fails
          })
          return null
        }

        // Check if temporary password has expired (NIST SP 800-171 Rev. 2, Section 3.5.9)
        if (user.isTemporaryPassword && user.temporaryPasswordExpiresAt) {
          if (isTemporaryPasswordExpired(user.temporaryPasswordExpiresAt)) {
            // Log expired temporary password attempt
            await logLogin(user.id, user.email, false).catch(() => {
              // Don't fail auth if logging fails
            })
            return null // Reject login - temporary password expired
          }
        }

        // Reset failed login attempts on successful password verification
        if (user.failedLoginAttempts > 0 || user.lockedUntil) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              lockedUntil: null,
            },
          }).catch(() => {
            // Don't fail if update fails
          })
        }

        // Update last login timestamp
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        }).catch((err) => {
          // Don't fail login if lastLoginAt update fails
          console.error("Failed to update lastLoginAt:", err)
        })

        // Log successful login
        await logLogin(user.id, user.email, true).catch(() => {
          // Don't fail auth if logging fails
        })

        // Check if MFA is required and enrolled
        const mfaRequired = user.role === "ADMIN"
        const mfaEnrolled = user.mfaEnabled && !!user.mfaSecret

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
          mfaRequired,
          mfaEnrolled,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
    updateAge: 60 * 60, // 1 hour (refresh token every hour)
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? "__Secure-next-auth.session-token" 
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production", // Secure cookies in production
      },
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
        token.mustChangePassword = user.mustChangePassword
        token.adminReauthVerified = false // Reset re-auth on new login
        token.mfaRequired = (user as any).mfaRequired || false
        token.mfaEnrolled = (user as any).mfaEnrolled || false
        token.mfaVerified = false // MFA verification status
      }
      
      // If session.update() was called (e.g., after password change or re-auth), update the token
      if (trigger === "update" && session) {
        if (session.mustChangePassword !== undefined) {
          token.mustChangePassword = session.mustChangePassword
        }
        if (session.role) {
          token.role = session.role
        }
        if (session.adminReauthVerified !== undefined) {
          token.adminReauthVerified = session.adminReauthVerified
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.mustChangePassword = token.mustChangePassword as boolean
      }
      // Add admin re-auth flag to session
      ;(session as any).adminReauthVerified = token.adminReauthVerified === true
      return session
    },
  },
})

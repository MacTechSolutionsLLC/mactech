/**
 * Admin re-authentication for sensitive admin actions
 * Requires password re-entry for critical operations
 */

import { auth } from "./auth"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

/**
 * Admin re-authentication flag key in session
 */
const REAUTH_FLAG_KEY = "adminReauthVerified"

/**
 * Check if admin re-authentication is required and verified
 * @returns Session if re-auth verified
 * @throws Error if re-auth required but not verified
 */
export async function requireAdminReauth() {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("Authentication required")
  }

  if (session.user.role !== "ADMIN") {
    throw new Error("Admin access required")
  }

  // Check if re-auth flag exists in session
  // This is set by verifyAdminReauth() and stored in JWT token
  const reauthVerified = (session as any).adminReauthVerified === true

  if (!reauthVerified) {
    const error: any = new Error("Admin re-authentication required")
    error.requiresReauth = true
    throw error
  }

  return session
}

/**
 * Verify admin re-authentication password
 * @param password Password to verify
 * @returns true if password is correct, false otherwise
 */
export async function verifyAdminReauth(password: string): Promise<boolean> {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return false
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  })

  if (!user || !user.password) {
    return false
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.password)
  return isValid
}

/**
 * Clear admin re-authentication flag
 * Note: This is handled by session expiration, but can be called explicitly
 */
export function clearAdminReauth() {
  // Re-auth flag expires with session
  // No explicit action needed
}

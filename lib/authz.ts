/**
 * Authorization library for CMMC Level 1 compliance
 * Centralizes authorization checks for consistent enforcement
 */

import { auth } from "./auth"
import { NextResponse } from "next/server"

/**
 * Require authentication - throws if user is not authenticated
 * @throws NextResponse with 401 status if not authenticated
 */
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
  // CMMC Level 2 posture: MFA is required for all authenticated sessions before accessing protected resources.
  // We enforce this at the authorization layer so API routes cannot be reached without MFA verification.
  if ((session.user as any).mfaRequired && !(session.user as any).mfaVerified) {
    throw NextResponse.json(
      {
        error: "MFA verification required",
        requiresMFA: true,
      },
      { status: 403 }
    )
  }
  return session
}

/**
 * Require admin role - throws if user is not admin
 * @throws NextResponse with 403 status if not admin
 */
export async function requireAdmin() {
  const session = await requireAuth()
  if (session.user.role !== "ADMIN") {
    throw NextResponse.json(
      { error: "Forbidden - Admin access required" },
      { status: 403 }
    )
  }
  return session
}

/**
 * Check if admin re-authentication is required and verified
 * Admin re-auth is stored in session as a temporary flag
 * @throws NextResponse with 403 status if re-auth required but not verified
 */
export async function requireAdminReauth() {
  const session = await requireAdmin()
  
  // Check if re-auth flag exists in session
  // Re-auth flag is set by POST /api/admin/reauth
  const reauthVerified = (session as any).adminReauthVerified === true
  
  if (!reauthVerified) {
    throw NextResponse.json(
      { 
        error: "Admin re-authentication required",
        requiresReauth: true 
      },
      { status: 403 }
    )
  }
  
  return session
}

/**
 * Check if user has specific role
 * @param role Role to check (USER, ADMIN)
 * @returns true if user has role, false otherwise
 */
export async function checkRole(role: string): Promise<boolean> {
  try {
    const session = await requireAuth()
    return session.user.role === role
  } catch {
    return false
  }
}

/**
 * Get current user session (non-throwing)
 * @returns Session if authenticated, null otherwise
 */
export async function getSession() {
  try {
    return await auth()
  } catch {
    return null
  }
}

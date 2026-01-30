/**
 * MFA (Multi-Factor Authentication) utilities for CMMC Level 2 compliance
 * Implements TOTP (Time-based One-Time Password) per NIST SP 800-171 Rev. 2, Section 3.5.3
 */

import { authenticator, totp } from "@otplib/preset-default"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

// TOTP configuration per MFA Implementation Guide
const TOTP_CONFIG = {
  issuer: "MacTech Solutions",
  algorithm: "sha1",
  digits: 6,
  period: 30, // seconds
}

/**
 * Generate a new TOTP secret for a user
 */
export function generateMFASecret(email: string): string {
  return authenticator.generateSecret()
}

/**
 * Generate TOTP URI for QR code generation
 */
export function generateTOTPURI(email: string, secret: string): string {
  return authenticator.keyuri(email, TOTP_CONFIG.issuer, secret)
}

/**
 * Verify a TOTP code against a secret
 */
export function verifyTOTPCode(secret: string, token: string): boolean {
  try {
    return authenticator.verify({ token, secret })
  } catch (error) {
    console.error("TOTP verification error:", error)
    return false
  }
}

/**
 * Generate backup codes for MFA recovery
 * Returns array of plain text codes (should be hashed before storage)
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto.randomBytes(4).toString("hex").toUpperCase()
    codes.push(code)
  }
  return codes
}

/**
 * Hash backup codes for storage
 */
export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map((code) => bcrypt.hash(code, 10)))
}

/**
 * Verify a backup code against hashed codes
 */
export async function verifyBackupCode(
  code: string,
  hashedCodes: string[]
): Promise<boolean> {
  for (const hashedCode of hashedCodes) {
    const isValid = await bcrypt.compare(code, hashedCode)
    if (isValid) {
      return true
    }
  }
  return false
}

/**
 * Enable MFA for a user
 */
export async function enableMFA(
  userId: string,
  secret: string,
  backupCodes: string[]
): Promise<void> {
  // Hash backup codes before storage
  const hashedBackupCodes = await hashBackupCodes(backupCodes)

  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaEnabled: true,
      mfaSecret: secret, // In production, this should be encrypted
      mfaBackupCodes: JSON.stringify(hashedBackupCodes),
      mfaEnrolledAt: new Date(),
    },
  })
}

/**
 * Disable MFA for a user
 */
export async function disableMFA(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaEnabled: false,
      mfaSecret: null,
      mfaBackupCodes: null,
      mfaEnrolledAt: null,
    },
  })
}

/**
 * Check if MFA is required for a user
 * CMMC Level 2: MFA required for all users accessing CUI systems (ADMIN, USER, and GUEST)
 */
export async function isMFARequired(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, mfaEnabled: true },
  })

  if (!user) return false

  // MFA required for ADMIN, USER, and GUEST per CMMC Level 2 (all roles access CUI/portal)
  const rolesRequiringMFA = ["ADMIN", "USER", "GUEST"] as const
  return rolesRequiringMFA.includes((user.role ?? "") as (typeof rolesRequiringMFA)[number])
}

/**
 * Check if MFA is enrolled for a user
 */
export async function isMFAEnrolled(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mfaEnabled: true, mfaSecret: true },
  })

  return user?.mfaEnabled === true && !!user?.mfaSecret
}

/**
 * Verify MFA code (TOTP or backup code)
 */
export async function verifyMFA(
  userId: string,
  code: string
): Promise<{ valid: boolean; usedBackupCode: boolean }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mfaSecret: true, mfaBackupCodes: true },
  })

  if (!user || !user.mfaSecret) {
    return { valid: false, usedBackupCode: false }
  }

  // Try TOTP verification first
  const totpValid = verifyTOTPCode(user.mfaSecret, code)
  if (totpValid) {
    return { valid: true, usedBackupCode: false }
  }

  // Try backup code verification
  if (user.mfaBackupCodes) {
    try {
      const hashedCodes: string[] = JSON.parse(user.mfaBackupCodes)
      const backupValid = await verifyBackupCode(code, hashedCodes)

      if (backupValid) {
        // Remove used backup code by finding which one matches
        const updatedCodes: string[] = []
        for (const hashed of hashedCodes) {
          const matches = await bcrypt.compare(code, hashed)
          if (!matches) {
            updatedCodes.push(hashed)
          }
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            mfaBackupCodes: JSON.stringify(updatedCodes),
          },
        })

        return { valid: true, usedBackupCode: true }
      }
    } catch (error) {
      console.error("Error verifying backup code:", error)
    }
  }

  return { valid: false, usedBackupCode: false }
}

/**
 * NextAuth.js FIPS Configuration
 * Custom JWT encoder/decoder configuration for FIPS-validated cryptography
 * 
 * This module provides NextAuth.js configuration that uses FIPS-validated
 * JWT encoding/decoding when FIPS mode is available.
 */

import { encodeFIPSJWT, decodeFIPSJWT, verifyFIPSBeforeJWT } from './fips-jwt'
import type { JWT, JWTOptions } from 'next-auth/jwt'

/**
 * Custom JWT encode function using FIPS-validated cryptography
 */
export async function encodeFIPSJWTForNextAuth(
  token: JWT,
  secret: string,
  maxAge?: number
): Promise<string> {
  // Verify FIPS status
  const fipsCheck = verifyFIPSBeforeJWT()
  if (!fipsCheck.valid) {
    console.warn('FIPS JWT Warning:', fipsCheck.message)
    // Continue with encoding but log warning
    // In production, you may want to fail here or use fallback
  }
  
  // Convert JWT to payload
  const payload: Record<string, any> = {
    ...token,
  }
  
  // Encode using FIPS-validated JWT
  return encodeFIPSJWT(payload, secret, {
    algorithm: 'HS256',
    expiresIn: maxAge || 8 * 60 * 60, // 8 hours default
  })
}

/**
 * Custom JWT decode function using FIPS-validated cryptography
 */
export async function decodeFIPSJWTForNextAuth(
  token: string,
  secret: string
): Promise<JWT | null> {
  // Verify FIPS status
  const fipsCheck = verifyFIPSBeforeJWT()
  if (!fipsCheck.valid) {
    console.warn('FIPS JWT Warning:', fipsCheck.message)
    // Continue with decoding but log warning
  }
  
  // Decode using FIPS-validated JWT
  const payload = decodeFIPSJWT(token, secret)
  
  if (!payload) {
    return null
  }
  
  // Convert payload to JWT format
  return payload as JWT
}

/**
 * Get NextAuth.js JWT configuration with FIPS support
 * 
 * Usage in NextAuth config:
 * ```typescript
 * import { getFIPSJWTConfig } from '@/lib/fips-nextauth-config'
 * 
 * export const { handlers, auth } = NextAuth({
 *   ...otherConfig,
 *   jwt: getFIPSJWTConfig(),
 * })
 * ```
 */
export function getFIPSJWTConfig() {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  
  if (!secret) {
    throw new Error('AUTH_SECRET or NEXTAUTH_SECRET must be set')
  }
  
  // NextAuth.js v5 JWT configuration format
  return {
    encode: async ({ token, secret: jwtSecret, maxAge }: { token: JWT; secret?: string; maxAge?: number }) => {
      const secretToUse = jwtSecret || secret
      return encodeFIPSJWTForNextAuth(token, secretToUse, maxAge)
    },
    decode: async ({ token, secret: jwtSecret }: { token: string; secret?: string }) => {
      const secretToUse = jwtSecret || secret
      return decodeFIPSJWTForNextAuth(token, secretToUse)
    },
  }
}

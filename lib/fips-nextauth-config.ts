/**
 * NextAuth.js FIPS Configuration
 * Custom JWT encoder/decoder configuration for FIPS-validated cryptography
 * 
 * This module provides NextAuth.js configuration that uses FIPS-validated
 * JWT encoding/decoding when FIPS mode is available.
 */

import { encodeFIPSJWT, decodeFIPSJWT, verifyFIPSBeforeJWT } from './fips-jwt'
import type { JWT, JWTOptions, JWTEncodeParams, JWTDecodeParams } from 'next-auth/jwt'
import { decode } from 'next-auth/jwt'

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
export function getFIPSJWTConfig(): Partial<JWTOptions> {
  // Get secret at runtime (not at module load time)
  // This allows the build to succeed even if AUTH_SECRET is not set during build
  const getSecret = () => {
    return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  }
  
  // NextAuth.js v5 JWT configuration format
  // Note: NextAuth.js v5 uses JWTEncodeParams and JWTDecodeParams
  return {
    encode: async (params: JWTEncodeParams<JWT>): Promise<string> => {
      // Get secret at runtime
      const secret = getSecret()
      if (!secret) {
        throw new Error('AUTH_SECRET or NEXTAUTH_SECRET must be set')
      }
      
      // Handle optional token (default to empty object if not provided)
      const token = params.token || ({} as JWT)
      const secretToUse = Array.isArray(params.secret) ? params.secret[0] : params.secret
      const maxAge = params.maxAge
      
      // Use FIPS encoding for new sessions
      return encodeFIPSJWTForNextAuth(token, secretToUse, maxAge)
    },
    decode: async (params: JWTDecodeParams): Promise<JWT | null> => {
      if (!params.token) {
        return null
      }
      
      // Get secret at runtime
      const secret = getSecret()
      if (!secret) {
        throw new Error('AUTH_SECRET or NEXTAUTH_SECRET must be set')
      }
      
      // Check token format:
      // - FIPS JWT (JWS): 3 parts (header.payload.signature)
      // - NextAuth JWE: 5 parts (header.encrypted_key.iv.ciphertext.tag)
      const parts = params.token.split('.')
      const isFIPSFormat = parts.length === 3
      const isJWEFormat = parts.length === 5
      
      // Strategy: Try the appropriate decoder based on token format
      // This prevents unnecessary decode attempts and errors
      
      if (isJWEFormat) {
        // JWE format - use NextAuth's default decoder only
        try {
          return await decode({
            token: params.token,
            secret: Array.isArray(params.secret) ? params.secret : [params.secret],
            salt: params.salt,
          }) as JWT | null
        } catch (error) {
          // Log JWE decode errors for debugging
          console.error('JWE decode error:', error instanceof Error ? error.message : String(error))
          // Return null - NextAuth will handle this appropriately
          return null
        }
      } else if (isFIPSFormat) {
        // FIPS format (3 parts) - try FIPS decoder first
        try {
          const secretToUse = Array.isArray(params.secret) ? params.secret[0] : params.secret
          const decoded = await decodeFIPSJWTForNextAuth(params.token, secretToUse)
          
          if (decoded) {
            return decoded
          }
        } catch (error) {
          // FIPS decode failed, log and try default decoder
          console.warn('FIPS JWT decode failed, trying default decoder:', error instanceof Error ? error.message : String(error))
        }
        
        // Fallback to default decoder if FIPS decode failed or returned null
        // This handles edge cases where FIPS token might be decoded by default decoder
        try {
          return await decode({
            token: params.token,
            secret: Array.isArray(params.secret) ? params.secret : [params.secret],
            salt: params.salt,
          }) as JWT | null
        } catch (error) {
          // Both decoders failed - log error for debugging
          console.error('Both FIPS and default JWT decoders failed:', error instanceof Error ? error.message : String(error))
          // Return null - NextAuth will handle this appropriately
          return null
        }
      } else {
        // Unknown format - try default decoder
        // Don't catch errors - let NextAuth handle them
        return await decode({
          token: params.token,
          secret: Array.isArray(params.secret) ? params.secret : [params.secret],
          salt: params.salt,
        }) as JWT | null
      }
    },
  }
}

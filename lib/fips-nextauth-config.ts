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
      
      // Strategy: Always try NextAuth's default decoder first for existing sessions
      // Only use FIPS decoder for new tokens (3 parts) if default fails
      // This ensures backward compatibility with existing JWE sessions
      
      // Always try default decoder first (handles JWE and most cases)
      try {
        const decoded = await decode({
          token: params.token,
          secret: Array.isArray(params.secret) ? params.secret : [params.secret],
          salt: params.salt,
        }) as JWT | null
        
        if (decoded) {
          return decoded
        }
      } catch (error) {
        // Default decoder failed - only try FIPS if it's a 3-part token
        if (isFIPSFormat) {
          // Token is 3 parts - might be FIPS format, try FIPS decoder
          try {
            const secretToUse = Array.isArray(params.secret) ? params.secret[0] : params.secret
            const fipsDecoded = await decodeFIPSJWTForNextAuth(params.token, secretToUse)
            
            if (fipsDecoded) {
              return fipsDecoded
            }
          } catch (fipsError) {
            // Both decoders failed - log for debugging
            console.warn('JWT decode failed (both default and FIPS):', {
              tokenParts: parts.length,
              defaultError: error instanceof Error ? error.message : String(error),
              fipsError: fipsError instanceof Error ? fipsError.message : String(fipsError)
            })
          }
        } else {
          // Not FIPS format and default decoder failed - log error
          console.warn('JWT decode failed (default decoder):', {
            tokenParts: parts.length,
            error: error instanceof Error ? error.message : String(error)
          })
        }
      }
      
      // All decode attempts failed - return null
      // NextAuth will handle this by creating a new session
      return null
    },
  }
}

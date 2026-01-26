/**
 * FIPS-Validated JWT Implementation
 * Custom JWT encoder/decoder using FIPS-validated cryptography
 * For use with NextAuth.js custom JWT encoding
 * 
 * CMVP Certificate #4282: OpenSSL FIPS Provider 3.0.8
 */

import { signWithFIPS, verifyFIPSSignature, checkFIPSStatus } from './fips-crypto'

export interface JWTPayload {
  [key: string]: any
}

export interface JWTOptions {
  algorithm?: string
  expiresIn?: number
}

/**
 * Encode JWT using FIPS-validated cryptography
 * Format: header.payload.signature (base64url encoded)
 */
export function encodeFIPSJWT(
  payload: JWTPayload,
  secret: string,
  options: JWTOptions = {}
): string {
  const algorithm = options.algorithm || 'HS256'
  const expiresIn = options.expiresIn || 8 * 60 * 60 // 8 hours default
  
  // Add standard JWT claims
  const now = Math.floor(Date.now() / 1000)
  // Don't override exp if it's already set in payload
  const jwtPayload = {
    ...payload,
    iat: payload.iat || now,
    exp: payload.exp !== undefined ? payload.exp : now + expiresIn,
  }
  
  // JWT Header
  const header = {
    alg: algorithm,
    typ: 'JWT',
  }
  
  // Encode header and payload (base64url)
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(jwtPayload))
  
  // Create signature using FIPS-validated crypto
  const signatureInput = `${encodedHeader}.${encodedPayload}`
  const signature = signWithFIPS(signatureInput, secret, 'sha256')
  
  // Return JWT
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

/**
 * Decode and verify JWT using FIPS-validated cryptography
 */
export function decodeFIPSJWT(token: string, secret: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }
    
    const [encodedHeader, encodedPayload, signature] = parts
    
    // Verify signature
    const signatureInput = `${encodedHeader}.${encodedPayload}`
    if (!verifyFIPSSignature(signatureInput, signature, secret, 'sha256')) {
      return null
    }
    
    // Decode payload
    const payload = JSON.parse(base64UrlDecode(encodedPayload))
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    
    return payload
  } catch (error) {
    return null
  }
}

/**
 * Base64URL encode (JWT standard)
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Base64URL decode (JWT standard)
 */
function base64UrlDecode(str: string): string {
  // Add padding if needed
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  return Buffer.from(base64, 'base64').toString('utf-8')
}

/**
 * Verify FIPS status before JWT operations
 * Safe for Edge Runtime - gracefully handles missing process.versions
 */
export function verifyFIPSBeforeJWT(): { valid: boolean; message: string } {
  try {
    const status = checkFIPSStatus()
    
    if (!status.active) {
      return {
        valid: false,
        message: `FIPS mode not active. OpenSSL version: ${status.version}. Migration to OpenSSL 3.0.8 FIPS Provider (CMVP #4282) required.`,
      }
    }
    
    return {
      valid: true,
      message: `FIPS mode active. Using OpenSSL ${status.version} FIPS Provider (CMVP #${status.cmvpCertificate}).`,
    }
  } catch (error) {
    // Edge Runtime or other environment where FIPS check fails
    // Return non-valid status but don't throw
    return {
      valid: false,
      message: `FIPS status check unavailable (Edge Runtime or unsupported environment). Using standard crypto operations.`,
    }
  }
}

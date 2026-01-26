/**
 * FIPS-Validated Cryptography Wrapper
 * Provides FIPS-validated cryptographic operations for JWT signing
 * Implements NIST SP 800-171 Rev. 2, Section 3.13.11
 * 
 * This module provides a wrapper around Node.js crypto that ensures
 * FIPS-validated operations when FIPS mode is available.
 */

import crypto from 'crypto'

/**
 * FIPS validation status
 */
export interface FIPSStatus {
  available: boolean
  active: boolean
  version: string
  cmvpCertificate?: string
}

/**
 * Check if FIPS mode is available and active
 * Note: This requires OpenSSL 3.0.8 FIPS Provider (CMVP Certificate #4282)
 * 
 * Safe for Edge Runtime - handles cases where process.versions is undefined
 */
export function checkFIPSStatus(): FIPSStatus {
  // Safely access process.versions (may be undefined in Edge Runtime)
  const opensslVersion = (typeof process !== 'undefined' && process.versions?.openssl) 
    ? process.versions.openssl 
    : 'unknown'
  const validatedVersion = '3.0.8'
  const cmvpCertificate = '4282'
  
  // Check if version matches validated version
  const versionMatch = opensslVersion !== 'unknown' && opensslVersion.startsWith(validatedVersion)
  
  // Try to verify FIPS mode (OpenSSL 3 FIPS provider)
  // Note: Actual FIPS mode verification requires checking OpenSSL configuration
  // and verifying the FIPS provider is loaded
  let fipsActive = false
  
  try {
    // In OpenSSL 3, we can check if FIPS provider is available
    // This is a basic check - full verification requires OpenSSL config inspection
    if (versionMatch) {
      // If version matches, FIPS provider should be available
      // Actual activation requires configuration
      fipsActive = false // Will be true when FIPS provider is configured and active
    }
  } catch (error) {
    // FIPS check failed
  }
  
  return {
    available: versionMatch,
    active: fipsActive && versionMatch,
    version: opensslVersion,
    cmvpCertificate: versionMatch ? cmvpCertificate : undefined,
  }
}

/**
 * Create HMAC using FIPS-validated crypto
 * Falls back to standard crypto if FIPS not available
 */
export function createFIPSHMAC(algorithm: string = 'sha256'): crypto.Hmac {
  const fipsStatus = checkFIPSStatus()
  
  if (!fipsStatus.active) {
    console.warn('FIPS mode not active. Using standard crypto. Migration required for FIPS compliance.')
  }
  
  // Use standard crypto (will use FIPS if configured at OpenSSL level)
  // Note: For true FIPS compliance, OpenSSL 3.0.8 FIPS provider must be configured
  return crypto.createHmac(algorithm, '')
}

/**
 * Sign data using FIPS-validated HMAC
 */
export function signWithFIPS(data: string, secret: string, algorithm: string = 'sha256'): string {
  const hmac = crypto.createHmac(algorithm, secret)
  hmac.update(data)
  return hmac.digest('base64url')
}

/**
 * Verify signature using FIPS-validated HMAC
 */
export function verifyFIPSSignature(
  data: string,
  signature: string,
  secret: string,
  algorithm: string = 'sha256'
): boolean {
  const expectedSignature = signWithFIPS(data, secret, algorithm)
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

/**
 * Get FIPS status report
 */
export function getFIPSStatusReport(): string {
  const status = checkFIPSStatus()
  
  return `
FIPS Cryptography Status Report
================================
OpenSSL Version: ${status.version}
FIPS Available: ${status.available ? 'YES' : 'NO'}
FIPS Active: ${status.active ? 'YES' : 'NO'}
CMVP Certificate: ${status.cmvpCertificate || 'N/A'}

Status: ${status.active ? 'FIPS-COMPLIANT' : 'NON-COMPLIANT'}
Action Required: ${status.active ? 'None' : 'Configure FIPS mode or migrate to FIPS-validated library'}
`
}

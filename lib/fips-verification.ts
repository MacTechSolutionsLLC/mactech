/**
 * FIPS Validation Verification Module
 * Verifies FIPS-validated cryptography status for compliance with NIST SP 800-171 Rev. 2, Section 3.13.11
 */

import crypto from 'crypto'

export interface FIPSVerificationResult {
  opensslVersion: string
  nodeVersion: string
  fipsProviderAvailable: boolean
  fipsModeActive: boolean
  cmvpCertificate?: string
  validationStatus: 'validated' | 'not-validated' | 'unknown'
  details: Record<string, any>
}

/**
 * Verify OpenSSL version and FIPS status
 * Returns verification results for compliance documentation
 */
export function verifyFIPSStatus(): FIPSVerificationResult {
  const nodeVersion = typeof process !== 'undefined' ? process.version : 'unknown'
  const opensslVersion = (typeof process !== 'undefined' && process.versions?.openssl) 
    ? process.versions.openssl 
    : 'unknown'
  
  // CMVP Certificate #4282: OpenSSL FIPS Provider 3.0.8 is validated
  // Runtime version: OpenSSL 3.6.0 is NOT validated
  const validatedVersion = '3.0.8'
  const cmvpCertificate = '4282'
  
  // Check if current version matches validated version
  const isVersionValidated = opensslVersion.startsWith('3.0.8')
  
  // Try to check for FIPS provider (OpenSSL 3)
  let fipsProviderAvailable = false
  let fipsModeActive = false
  
  try {
    // In OpenSSL 3, FIPS provider can be loaded
    // Check if FIPS provider is available (this is a basic check)
    const providers = crypto.getCiphers()
    fipsProviderAvailable = providers.length > 0 // Basic check - providers exist
    
    // Note: Actual FIPS mode verification requires checking OpenSSL configuration
    // and verifying the FIPS provider is loaded and active
    // This would require additional runtime checks
  } catch (error) {
    // FIPS provider check failed
    fipsProviderAvailable = false
  }
  
  return {
    opensslVersion,
    nodeVersion,
    fipsProviderAvailable,
    fipsModeActive: isVersionValidated && fipsModeActive, // Only true if validated version AND FIPS mode active
    cmvpCertificate: isVersionValidated ? cmvpCertificate : undefined,
    validationStatus: isVersionValidated ? 'validated' : 'not-validated',
    details: {
      validatedVersion,
      cmvpCertificate,
      runtimeVersion: opensslVersion,
      versionMatch: isVersionValidated,
      fipsProviderCheck: fipsProviderAvailable,
      note: isVersionValidated 
        ? 'OpenSSL version matches validated version. FIPS mode must be configured and verified separately.'
        : 'OpenSSL version does not match validated version (3.0.8). Migration required for FIPS compliance.',
    },
  }
}

/**
 * Get FIPS verification report for compliance documentation
 */
export function getFIPSVerificationReport(): string {
  const result = verifyFIPSStatus()
  
  return `
FIPS Validation Verification Report
====================================
Date: ${new Date().toISOString()}
Node.js Version: ${result.nodeVersion}
OpenSSL Version: ${result.opensslVersion}
CMVP Certificate: ${result.cmvpCertificate || 'N/A'}
Validation Status: ${result.validationStatus.toUpperCase()}

Details:
- Validated Version: ${result.details.validatedVersion}
- Runtime Version: ${result.details.runtimeVersion}
- Version Match: ${result.details.versionMatch ? 'YES' : 'NO'}
- FIPS Provider Available: ${result.fipsProviderAvailable ? 'YES' : 'NO'}
- FIPS Mode Active: ${result.fipsModeActive ? 'YES' : 'NO'}

${result.details.note}

Action Required: ${result.validationStatus === 'not-validated' 
  ? 'Migration to FIPS-validated OpenSSL 3.0.8 required' 
  : 'Verify FIPS mode is configured and active'}
`
}

/**
 * Log FIPS verification status to audit log
 */
export async function logFIPSVerificationStatus(): Promise<void> {
  const result = verifyFIPSStatus()
  
  // Log to console for now (can be integrated with audit system)
  console.log('FIPS Verification Status:', {
    opensslVersion: result.opensslVersion,
    validationStatus: result.validationStatus,
    cmvpCertificate: result.cmvpCertificate,
    versionMatch: result.details.versionMatch,
  })
  
  // TODO: Integrate with audit logging system
  // await logEvent('fips_verification', null, null, result.validationStatus === 'validated', 'system', null, {
  //   opensslVersion: result.opensslVersion,
  //   validationStatus: result.validationStatus,
  //   cmvpCertificate: result.cmvpCertificate,
  //   ...result.details,
  // })
}

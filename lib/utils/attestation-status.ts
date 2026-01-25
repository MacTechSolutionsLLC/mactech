/**
 * Attestation Status Utilities
 * Calculates compliance status for user security obligations attestations
 */

export type AttestationType =
  | "security_training"
  | "policy_acknowledgement"
  | "cui_handling"
  | "incident_reporting"
  | "acceptable_use"

export const REQUIRED_ATTESTATIONS: AttestationType[] = [
  "security_training",
  "policy_acknowledgement",
  "cui_handling",
  "incident_reporting",
  "acceptable_use",
]

export type OverallComplianceStatus = "green" | "yellow" | "red"
export type IndividualAttestationStatus = "completed" | "pending" | "expiring" | "expired"

// Validity window: 365 days in milliseconds
const VALIDITY_MS = 365 * 24 * 60 * 60 * 1000
// Expiring threshold: 30 days in milliseconds
const EXPIRING_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Get current year as version string
 */
export function getCurrentVersionYear(): string {
  return new Date().getFullYear().toString()
}

/**
 * Check if an attestation is expired (older than 365 days)
 */
export function isExpired(acknowledgedAt: Date, now: Date = new Date()): boolean {
  const ageMs = now.getTime() - acknowledgedAt.getTime()
  return ageMs > VALIDITY_MS
}

/**
 * Check if an attestation is expiring (expires within 30 days and not already expired)
 */
export function isExpiring(acknowledgedAt: Date, now: Date = new Date()): boolean {
  if (isExpired(acknowledgedAt, now)) {
    return false
  }
  const ageMs = now.getTime() - acknowledgedAt.getTime()
  const remainingMs = VALIDITY_MS - ageMs
  return remainingMs <= EXPIRING_THRESHOLD_MS && remainingMs > 0
}

/**
 * Get individual attestation status
 * - completed: exists for current version and not expiring/expired
 * - expiring: exists for current version and expires within 30 days
 * - expired: exists for current version but older than 365 days
 * - pending: no attestation exists for current version
 */
export function getAttestationStatus(
  attestation: { acknowledgedAt: Date } | null,
  now: Date = new Date()
): IndividualAttestationStatus {
  if (!attestation) {
    return "pending"
  }

  if (isExpired(attestation.acknowledgedAt, now)) {
    return "expired"
  }

  if (isExpiring(attestation.acknowledgedAt, now)) {
    return "expiring"
  }

  return "completed"
}

/**
 * Calculate overall compliance status from per-type statuses
 * - green: all are "completed"
 * - yellow: any "expiring" and none "expired"/"pending"
 * - red: any "expired" or "pending"
 */
export function calculateComplianceStatus(
  perTypeStatus: Record<AttestationType, IndividualAttestationStatus>
): OverallComplianceStatus {
  const statuses = Object.values(perTypeStatus) as IndividualAttestationStatus[]

  // Red: any expired or pending
  if (statuses.some((s) => s === "expired" || s === "pending")) {
    return "red"
  }

  // Yellow: any expiring
  if (statuses.some((s) => s === "expiring")) {
    return "yellow"
  }

  // Green: all completed
  return "green"
}

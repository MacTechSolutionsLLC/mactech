import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import {
  getCurrentVersionYear,
  getAttestationStatus,
  calculateComplianceStatus,
  REQUIRED_ATTESTATIONS,
  type AttestationType,
} from "@/lib/utils/attestation-status"

/**
 * GET /api/user/security-obligations
 * Returns user's attestations, compliance status, and expiration info
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    const userId = session.user.id

    // Get current year version
    const currentYear = getCurrentVersionYear()

    // Fetch all attestations for the user, ordered by acknowledgedAt desc
    const allAttestations = await prisma.userAttestation.findMany({
      where: { userId },
      orderBy: { acknowledgedAt: "desc" },
    })

    // Build per-type status information
    const types: Record<
      AttestationType,
      {
        status: "completed" | "pending" | "expiring" | "expired"
        currentYearAttestedAt: string | null
        lastAttestedAt: string | null
      }
    > = {} as any

    const perTypeStatus: Record<AttestationType, "completed" | "pending" | "expiring" | "expired"> = {} as any

    // Process each required attestation type
    for (const type of REQUIRED_ATTESTATIONS) {
      // Find current year attestation
      const currentYearAttestation = allAttestations.find(
        (a) => a.attestationType === type && a.version === currentYear
      )

      // Find most recent attestation (any year) for lastAttestedAt
      const lastAttestation = allAttestations.find((a) => a.attestationType === type)

      // Calculate status based on current year attestation
      const status = getAttestationStatus(
        currentYearAttestation ? { acknowledgedAt: currentYearAttestation.acknowledgedAt } : null
      )

      perTypeStatus[type] = status

      types[type] = {
        status,
        currentYearAttestedAt: currentYearAttestation
          ? currentYearAttestation.acknowledgedAt.toISOString()
          : null,
        lastAttestedAt: lastAttestation ? lastAttestation.acknowledgedAt.toISOString() : null,
      }
    }

    // Calculate overall status
    const overallStatus = calculateComplianceStatus(perTypeStatus)

    return NextResponse.json({
      currentYear,
      overallStatus,
      types,
      attestations: allAttestations.map((a) => ({
        id: a.id,
        attestationType: a.attestationType,
        version: a.version,
        acknowledgedAt: a.acknowledgedAt.toISOString(),
        ipAddress: a.ipAddress,
        userAgent: a.userAgent,
        createdAt: a.createdAt.toISOString(),
      })),
    })
  } catch (error: any) {
    console.error("Error fetching user attestations:", error)

    // If it's an auth error, let it propagate
    if (error.status === 401 || error.status === 403) {
      throw error
    }

    return NextResponse.json(
      { error: error.message || "Failed to fetch attestations" },
      { status: 500 }
    )
  }
}

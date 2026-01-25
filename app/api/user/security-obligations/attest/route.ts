import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { logEvent } from "@/lib/audit"
import { getCurrentVersionYear, REQUIRED_ATTESTATIONS, type AttestationType } from "@/lib/utils/attestation-status"

/**
 * POST /api/user/security-obligations/attest
 * Submit a new attestation
 */
export async function POST(req: NextRequest) {
  let session: Awaited<ReturnType<typeof requireAuth>> | null = null
  let body: { attestationType?: string } = {}
  let userId: string | null = null
  let userEmail: string | null = null

  try {
    session = await requireAuth()
    userId = session.user.id
    userEmail = session.user.email || null

    body = await req.json()
    const { attestationType } = body

    // Validate attestation type
    if (!attestationType || !REQUIRED_ATTESTATIONS.includes(attestationType as AttestationType)) {
      return NextResponse.json(
        { error: "Invalid attestation type. Must be one of: " + REQUIRED_ATTESTATIONS.join(", ") },
        { status: 400 }
      )
    }

    // Get current year version
    const version = getCurrentVersionYear()

    // Capture IP address and user agent
    const forwardedFor = req.headers.get("x-forwarded-for")
    const ipAddress = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : req.headers.get("x-real-ip") || null

    const userAgent = req.headers.get("user-agent") || null

    // Check if attestation already exists for this user/type/version
    const existing = await prisma.userAttestation.findUnique({
      where: {
        userId_attestationType_version: {
          userId,
          attestationType: attestationType as AttestationType,
          version,
        },
      },
    })

    if (existing) {
      // Already exists - log and return success with alreadyExists flag
      await logEvent(
        "user_attestation",
        userId,
        userEmail,
        true,
        "user",
        userId,
        {
          attestationType: attestationType as AttestationType,
          version,
          ipAddress,
          userAgent,
          result: "already_exists",
          message: `User attempted to attest ${attestationType} for ${version}, but already attested`,
        }
      )

      return NextResponse.json({
        ok: true,
        status: "already_exists",
        message: "Attestation already exists for this year",
      })
    }

    // Create new attestation
    const attestation = await prisma.userAttestation.create({
      data: {
        userId,
        attestationType: attestationType as AttestationType,
        version,
        ipAddress,
        userAgent,
      },
    })

    // Audit log the successful creation
    await logEvent(
      "user_attestation",
      userId,
      userEmail,
      true,
      "user",
      userId,
      {
        attestationType: attestationType as AttestationType,
        version,
        ipAddress,
        userAgent,
        result: "created",
        message: `User attested ${attestationType} for ${version}`,
        attestationId: attestation.id,
      }
    )

    return NextResponse.json({
      ok: true,
      status: "created",
      attestation: {
        id: attestation.id,
        attestationType: attestation.attestationType,
        version: attestation.version,
        acknowledgedAt: attestation.acknowledgedAt.toISOString(),
      },
    })
  } catch (error: any) {
    console.error("Error creating attestation:", error)

    // If it's an auth error, let it propagate
    if (error.status === 401 || error.status === 403) {
      throw error
    }

    // Handle unique constraint violation (shouldn't happen due to check, but handle gracefully)
    if (error.code === "P2002") {
      if (userId && userEmail) {
        await logEvent(
          "user_attestation",
          userId,
          userEmail,
          false,
          "user",
          userId,
          {
            attestationType: (body.attestationType as AttestationType) || "unknown",
            version: getCurrentVersionYear(),
            result: "error",
            error: "Unique constraint violation",
            message: "Attempted to create duplicate attestation",
          }
        ).catch(() => {})
      }

      return NextResponse.json(
        {
          ok: true,
          status: "already_exists",
          message: "Attestation already exists for this year",
        },
        { status: 200 }
      )
    }

    // Log error
    if (userId && userEmail) {
      await logEvent(
        "user_attestation",
        userId,
        userEmail,
        false,
        "user",
        userId,
        {
          attestationType: (body.attestationType as AttestationType) || "unknown",
          version: getCurrentVersionYear(),
          result: "error",
          error: error.message,
          message: "Failed to create attestation",
        }
      ).catch(() => {})
    }

    return NextResponse.json(
      { error: error.message || "Failed to create attestation" },
      { status: 500 }
    )
  }
}

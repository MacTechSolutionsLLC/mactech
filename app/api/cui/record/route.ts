import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/authz"
import { recordCUIUploadMetadata } from "@/lib/file-storage"
import { logFileUpload } from "@/lib/audit"

/**
 * POST /api/cui/record
 * Records CUI upload metadata after client uploads directly to vault.
 * Request body: { vaultId, size, mimeType, displayLabel? } — no filename (potential CUI).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body. Expected JSON: vaultId, size, mimeType." },
        { status: 400 }
      )
    }

    const { vaultId, size, mimeType, displayLabel } = body
    if (typeof vaultId !== "string" || !vaultId.trim()) {
      return NextResponse.json(
        { error: "vaultId is required and must be a non-empty string." },
        { status: 400 }
      )
    }
    if (typeof size !== "number" || size < 0) {
      return NextResponse.json(
        { error: "size is required and must be a non-negative number." },
        { status: 400 }
      )
    }
    if (typeof mimeType !== "string" || !mimeType.trim()) {
      return NextResponse.json(
        { error: "mimeType is required and must be a non-empty string." },
        { status: 400 }
      )
    }

    const label =
      typeof displayLabel === "string" && /^CUI-/.test(displayLabel.trim())
        ? displayLabel.trim()
        : undefined

    const result = await recordCUIUploadMetadata(
      session.user.id,
      vaultId.trim(),
      size,
      mimeType.trim(),
      label
    )

    await logFileUpload(
      session.user.id,
      session.user.email || "unknown",
      result.fileId,
      `CUI-${vaultId.trim()}`,
      size,
      true,
      undefined,
      mimeType.trim(),
      true,
      false
    )

    return NextResponse.json({
      fileId: result.fileId,
      signedUrl: result.signedUrl,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Record CUI metadata failed"
    return NextResponse.json(
      { error: message },
      { status: message.includes("not configured") ? 503 : 500 }
    )
  }
}

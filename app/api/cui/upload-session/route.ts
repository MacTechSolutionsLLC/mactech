import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/authz"
import { createUploadSession } from "@/lib/cui-vault-client"
import { MAX_FILE_SIZE, ALLOWED_MIME_TYPES_CUI } from "@/lib/file-storage"

/**
 * POST /api/cui/upload-session
 * Returns uploadUrl and token for browser to upload CUI directly to vault.
 * Railway does NOT accept file bytes; metadata only.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body. Expected JSON: fileName, mimeType, fileSize." },
        { status: 400 }
      )
    }

    const { fileName, mimeType, fileSize } = body
    if (typeof fileName !== "string" || !fileName.trim()) {
      return NextResponse.json(
        { error: "fileName is required and must be a non-empty string." },
        { status: 400 }
      )
    }
    if (typeof mimeType !== "string" || !mimeType.trim()) {
      return NextResponse.json(
        { error: "mimeType is required and must be a non-empty string." },
        { status: 400 }
      )
    }
    if (typeof fileSize !== "number" || fileSize < 0) {
      return NextResponse.json(
        { error: "fileSize is required and must be a non-negative number." },
        { status: 400 }
      )
    }

    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum ${MAX_FILE_SIZE} bytes (10MB).` },
        { status: 400 }
      )
    }
    if (!ALLOWED_MIME_TYPES_CUI.includes(mimeType as (typeof ALLOWED_MIME_TYPES_CUI)[number])) {
      return NextResponse.json(
        { error: `MIME type ${mimeType} is not allowed for CUI uploads.` },
        { status: 400 }
      )
    }

    const result = createUploadSession({
      fileName: fileName.trim(),
      mimeType: mimeType.trim(),
      fileSize,
      userId: session.user.id,
    })

    return NextResponse.json({
      uploadUrl: result.uploadUrl,
      uploadToken: result.uploadToken,
      expiresAt: result.expiresAt,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload session failed"
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && message.includes("not configured") ? 503 : 500 }
    )
  }
}

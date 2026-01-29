import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/authz"
import { storeFile } from "@/lib/file-storage"
import { logFileUpload } from "@/lib/audit"
import { detectCUIKeywords } from "@/lib/cui-blocker"

/**
 * POST /api/files/upload
 * Upload files (FCI or non-CUI only). CUI files must NOT be sent here; use the CUI upload flow (direct-to-vault).
 * Railway does not accept CUI file bytes.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    const metadata: Record<string, unknown> = {}
    let isCUI = false
    let isFCI = false

    for (const [key, value] of formData.entries()) {
      if (key === "isCUI") {
        isCUI = typeof value === "string" && (value === "true" || value.toLowerCase() === "true")
      } else if (key === "isFCI") {
        isFCI = typeof value === "string" && (value === "true" || value.toLowerCase() === "true")
      } else if (key !== "file" && typeof value === "string") {
        metadata[key] = value
      }
    }

    const hasCUIInFilename = detectCUIKeywords(file.name)
    const hasCUIInMetadata = Object.keys(metadata).length > 0 && detectCUIKeywords(metadata)
    const shouldStoreAsCUI = isCUI || hasCUIInFilename || hasCUIInMetadata

    if (shouldStoreAsCUI) {
      return NextResponse.json(
        {
          error:
            "CUI files must be uploaded via the CUI upload flow (direct to vault). Do not send CUI file bytes to this endpoint. Use the CUI Files tab and the direct-to-vault upload.",
          useCuiFlow: true,
        },
        { status: 400 }
      )
    }

    const result = await storeFile(
      session.user.id,
      file,
      Object.keys(metadata).length > 0 ? (metadata as Record<string, string>) : undefined,
      isFCI
    )

    await logFileUpload(
      session.user.id,
      session.user.email || "unknown",
      result.fileId,
      file.name,
      file.size,
      true,
      undefined,
      file.type,
      false,
      isFCI
    )

    return NextResponse.json({
      success: true,
      fileId: result.fileId,
      signedUrl: result.signedUrl,
      isCUI: false,
      isFCI: isFCI,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to upload file"
    try {
      const session = await requireAuth()
      const formData = await req.formData()
      const file = formData.get("file") as File | null
      if (file && session?.user) {
        await logFileUpload(
          session.user.id,
          session.user.email || "unknown",
          "unknown",
          file.name,
          file.size,
          false,
          message,
          file.type,
          undefined,
          undefined
        )
      }
    } catch {
      // Ignore logging errors
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

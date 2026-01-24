import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/authz"
import { storeFile, storeCUIFile } from "@/lib/file-storage"
import { logFileUpload } from "@/lib/audit"
import { detectCUIKeywords } from "@/lib/cui-blocker"

/**
 * POST /api/files/upload
 * Upload files with CUI detection and separate storage
 * Supports both FCI files (StoredFile) and CUI files (StoredCUIFile)
 * CUI files require password protection for access
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

    // Extract metadata and isCUI flag
    const metadata: Record<string, any> = {}
    let isCUI = false
    
    for (const [key, value] of formData.entries()) {
      if (key === "isCUI") {
        isCUI = typeof value === "string" && (value === "true" || value.toLowerCase() === "true")
      } else if (key !== "file" && typeof value === "string") {
        metadata[key] = value
      }
    }

    // Auto-detect CUI keywords in filename and metadata
    const hasCUIInFilename = detectCUIKeywords(file.name)
    const hasCUIInMetadata = Object.keys(metadata).length > 0 && detectCUIKeywords(metadata)
    
    // If user marked as CUI or auto-detected, store as CUI file
    const shouldStoreAsCUI = isCUI || hasCUIInFilename || hasCUIInMetadata

    // Store file in appropriate table
    const result = shouldStoreAsCUI
      ? await storeCUIFile(session.user.id, file, Object.keys(metadata).length > 0 ? metadata : undefined)
      : await storeFile(session.user.id, file, Object.keys(metadata).length > 0 ? metadata : undefined)

    // Log file upload with detailed file information
    await logFileUpload(
      session.user.id,
      session.user.email || "unknown",
      result.fileId,
      file.name,
      file.size,
      true,
      undefined, // error
      file.type // mimeType
    )

    return NextResponse.json({
      success: true,
      fileId: result.fileId,
      signedUrl: result.signedUrl,
      isCUI: shouldStoreAsCUI,
    })
  } catch (error: any) {
    console.error("File upload error:", error)
    
    // Log failed upload
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
          error.message,
          file.type // mimeType
        )
      }
    } catch (logError) {
      // Ignore logging errors
    }

    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    )
  }
}

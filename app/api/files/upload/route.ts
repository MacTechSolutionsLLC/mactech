import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/authz"
import { storeFile } from "@/lib/file-storage"
import { logFileUpload } from "@/lib/audit"
import { validateNoCUI } from "@/lib/cui-blocker"

/**
 * POST /api/files/upload
 * Upload files with CUI keyword validation
 * This system handles FCI only. CUI, ITAR, and classified information are prohibited.
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

    // Validate metadata for CUI keywords
    const metadata: Record<string, any> = {}
    for (const [key, value] of formData.entries()) {
      if (key !== "file" && typeof value === "string") {
        metadata[key] = value
      }
    }

    try {
      if (Object.keys(metadata).length > 0) {
        validateNoCUI(metadata)
      }
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Metadata contains prohibited terms" },
        { status: 400 }
      )
    }

    // Store file (this will validate filename and metadata for CUI keywords)
    const result = await storeFile(session.user.id, file, Object.keys(metadata).length > 0 ? metadata : undefined)

    // Log file upload
    await logFileUpload(
      session.user.id,
      session.user.email || "unknown",
      result.fileId,
      file.name,
      file.size,
      true
    )

    return NextResponse.json({
      success: true,
      fileId: result.fileId,
      signedUrl: result.signedUrl,
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
          error.message
        )
      }
    } catch (logError) {
      // Ignore logging errors
    }

    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: error.message?.includes("prohibited") || error.message?.includes("CUI") ? 400 : 500 }
    )
  }
}

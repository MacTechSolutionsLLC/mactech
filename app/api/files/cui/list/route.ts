import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/authz"
import { listCUIFiles } from "@/lib/file-storage"

/**
 * GET /api/files/cui/list
 * List CUI files for authenticated user
 * Admin can see all CUI files, users see only their own
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    
    const searchParams = req.nextUrl.searchParams
    const includeDeleted = searchParams.get("includeDeleted") === "true"

    // List CUI files
    const files = await listCUIFiles(
      session.user.id,
      includeDeleted,
      session.user.role
    )

    return NextResponse.json({
      success: true,
      files,
      count: files.length,
    })
  } catch (error: any) {
    console.error("CUI file list error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to list CUI files" },
      { status: 500 }
    )
  }
}

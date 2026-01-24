import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/authz"
import { listFCIFiles } from "@/lib/file-storage"

/**
 * GET /api/files/fci/list
 * List FCI files for authenticated user
 * Admin can see all FCI files, users see only their own
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    
    const searchParams = req.nextUrl.searchParams
    const includeDeleted = searchParams.get("includeDeleted") === "true"

    // List FCI files
    const files = await listFCIFiles(
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
    console.error("FCI file list error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to list FCI files" },
      { status: 500 }
    )
  }
}

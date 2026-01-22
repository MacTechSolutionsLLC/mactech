import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/authz"
import { storeFile } from "@/lib/file-storage"
import { logFileUpload } from "@/lib/audit"
import { validateNoCUI } from "@/lib/cui-blocker"

/**
 * POST /api/files/upload
 * File uploads are disabled. This system handles FCI only and does not accept file uploads.
 * This endpoint returns 403 Forbidden to prevent CUI entry.
 */
export async function POST(req: NextRequest) {
  return NextResponse.json(
    { 
      error: "File uploads are disabled. This system handles FCI only and does not accept file uploads." 
    },
    { status: 403 }
  )
}

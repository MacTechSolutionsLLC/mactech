import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/authz"
import { getCUIFileMetadataForView } from "@/lib/file-storage"
import { createViewSession } from "@/lib/cui-vault-client"

/**
 * GET /api/cui/view-session?id=<fileId>
 * Returns viewUrl and token for browser to open CUI directly from vault.
 * Railway does NOT return file bytes.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    const id = req.nextUrl.searchParams.get("id")
    if (!id) {
      return NextResponse.json(
        { error: "Query parameter id (fileId) is required." },
        { status: 400 }
      )
    }

    const metadata = await getCUIFileMetadataForView(id, session.user.id, session.user.role)
    const result = createViewSession(metadata.vaultId)

    return NextResponse.json({
      viewUrl: result.viewUrl,
      viewToken: result.viewToken,
      expiresAt: result.expiresAt,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "View session failed"
    const status =
      message.includes("not found") || message.includes("deleted")
        ? 404
        : message.includes("Access denied") || message.includes("Authentication")
          ? 403
          : 500
    return NextResponse.json(
      { error: message },
      { status }
    )
  }
}

import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/authz"
import { getPortalDocumentsList } from "@/lib/portal-documents"

/**
 * GET /api/portal/documents
 * List curated documents for the guest portal. Requires GUEST (or any authenticated user for flexibility).
 */
export async function GET() {
  try {
    await requireAuth()
    const list = getPortalDocumentsList()
    return NextResponse.json({ documents: list })
  } catch (e) {
    if (e && typeof e === "object" && "status" in e) return e as NextResponse
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

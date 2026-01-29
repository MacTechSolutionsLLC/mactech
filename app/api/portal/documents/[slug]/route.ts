import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/authz"
import { getPortalDocumentBySlug, getPortalDocumentContent } from "@/lib/portal-documents"

/**
 * GET /api/portal/documents/[slug]
 * Return curated document content by slug. Requires authentication.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requireAuth()
    const { slug } = await params
    const meta = getPortalDocumentBySlug(slug)
    if (!meta) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }
    const content = getPortalDocumentContent(slug)
    return NextResponse.json({ ...meta, content: content ?? "" })
  } catch (e) {
    if (e && typeof e === "object" && "status" in e) return e as NextResponse
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

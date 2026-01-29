import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/authz"
import { isVaultConfigured } from "@/lib/cui-vault-client"

/**
 * GET /api/cui/vault-status
 * Returns whether the CUI vault is configured (so UI can show a message before upload).
 * Requires authentication.
 */
export async function GET() {
  try {
    await requireAuth()
    const configured = isVaultConfigured()
    return NextResponse.json({ configured })
  } catch (error: unknown) {
    if (error && typeof error === "object" && "status" in error) {
      return error as NextResponse
    }
    return NextResponse.json({ error: "Failed to check vault status" }, { status: 500 })
  }
}

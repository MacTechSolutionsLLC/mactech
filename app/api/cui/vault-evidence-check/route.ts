import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/authz"
import { runVaultEvidenceCheck } from "@/lib/cui-vault-client"

/**
 * POST /api/cui/vault-evidence-check
 * Triggers the CMMC evidence script on the vault server and returns output for viewing/download.
 * Admin only. Vault runs CUI_VAULT_EVIDENCE_SCRIPT_PATH and returns stdout/stderr.
 */
export async function POST() {
  try {
    await requireAdmin()
    const result = await runVaultEvidenceCheck()
    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Vault evidence check failed"
    const status =
      message.includes("not configured") ? 503 :
      message.includes("Unauthorized") || message.includes("401") ? 401 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

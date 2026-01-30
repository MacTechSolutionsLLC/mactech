import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/authz"
import {
  isVaultConfigured,
  getVaultBaseUrl,
  checkVaultHealth,
} from "@/lib/cui-vault-client"

/**
 * GET /api/cui/vault-check
 * Returns vault configuration and connectivity for troubleshooting.
 * Requires authentication. Use on CUI tab to verify app→vault connectivity.
 */
export async function GET() {
  try {
    await requireAuth()
    const configured = isVaultConfigured()
    const vaultUrl = getVaultBaseUrl()
    let vaultReachable = false
    let error: string | null = null

    if (configured && vaultUrl) {
      try {
        vaultReachable = await checkVaultHealth()
      } catch (e) {
        error = e instanceof Error ? e.message : "Vault health check failed"
      }
    }

    return NextResponse.json({
      configured,
      vaultReachable,
      vaultUrl: vaultUrl ?? null,
      message: error
        ? error
        : !configured
          ? "Vault not configured. Set CUI_VAULT_API_KEY and CUI_VAULT_JWT_SECRET on the app."
          : vaultReachable
            ? "App can reach vault. Ensure CORS allows this site for browser uploads."
            : "Vault URL not reachable from app. On vault host: ensure process and nginx are running. Check DNS, firewall (inbound 443), and TLS. See docs/CUI_VAULT_INTEGRATION.md → \"Vault URL not reachable from app\".",
    })
  } catch (e) {
    if (e && typeof e === "object" && "status" in e) return e as NextResponse
    return NextResponse.json(
      { error: "Failed to check vault" },
      { status: 500 }
    )
  }
}

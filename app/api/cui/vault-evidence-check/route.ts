import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/authz"
import { downloadVaultEvidenceReport, runVaultEvidenceCheck } from "@/lib/cui-vault-client"
import JSZip from "jszip"

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

/**
 * GET /api/cui/vault-evidence-check/download?filename=<vault_evidence_...txt>
 * Returns a zip bundle containing:
 * - the requested vault evidence output file
 * - validation_summary.txt
 * - validation_results.json
 */
export async function GET(req: Request) {
  try {
    await requireAdmin()

    const url = new URL(req.url)
    const filename = url.searchParams.get("filename") || ""
    if (!filename) {
      return NextResponse.json({ error: "Missing filename" }, { status: 400 })
    }

    // Fetch all artifacts from the vault (server-to-server).
    const [evidenceTxt, summaryTxt, resultsJson] = await Promise.all([
      downloadVaultEvidenceReport(filename),
      downloadVaultEvidenceReport("validation_summary.txt"),
      downloadVaultEvidenceReport("validation_results.json"),
    ])

    const zip = new JSZip()
    zip.file(filename, evidenceTxt)
    zip.file("validation_summary.txt", summaryTxt)
    zip.file("validation_results.json", resultsJson)

    const zipBuf = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    })

    const base = filename.replace(/\.txt$/i, "")
    const downloadName = `${base}_bundle.zip`

    // NextResponse body must be a web-compatible BodyInit; Buffer is Node-specific.
    // Convert to Uint8Array for type compatibility (and identical bytes at runtime).
    const body = new Uint8Array(zipBuf)
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${downloadName}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create evidence bundle"
    const status =
      message.includes("not configured") ? 503 :
      message.includes("Unauthorized") || message.includes("401") ? 401 :
      message.includes("not found") || message.includes("Not found") ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

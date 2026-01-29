import { NextRequest, NextResponse } from "next/server"
import { getCUIFileMetadataForView } from "@/lib/file-storage"
import { createViewSession } from "@/lib/cui-vault-client"
import { deleteCUIFile } from "@/lib/file-storage"
import { requireAuth } from "@/lib/authz"
import { logEvent } from "@/lib/audit"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/files/cui/[id]
 * Returns view session (viewUrl, viewToken, expiresAt) for browser to open CUI directly from vault.
 * Railway does NOT return file bytes.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await context.params

    const metadata = await getCUIFileMetadataForView(id, session.user.id, session.user.role)
    const result = createViewSession(metadata.vaultId)

    await logEvent(
      "cui_file_access",
      session.user.id,
      session.user.email || null,
      true,
      "cui_file",
      id,
      {
        fileId: metadata.id,
        vaultId: metadata.vaultId,
        fileSize: metadata.size,
        mimeType: metadata.mimeType,
        accessType: "view_only",
      }
    )

    return NextResponse.json(
      {
        viewUrl: result.viewUrl,
        viewToken: result.viewToken,
        expiresAt: result.expiresAt,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, private",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "CUI file view failed"
    try {
      const session = await requireAuth()
      const { id } = await context.params
      await logEvent(
        "cui_file_access_denied",
        session.user.id,
        session.user.email || null,
        false,
        "cui_file",
        id,
        { error: message }
      )
    } catch {
      // Ignore logging errors
    }
    return NextResponse.json(
      { error: message },
      {
        status: message.includes("not found") || message.includes("deleted") ? 404 : 403,
      }
    )
  }
}

/**
 * DELETE /api/files/cui/[id]
 * Deletes CUI in vault first, then marks record deleted. If vault delete fails, DB is not updated.
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await context.params

    const file = await prisma.storedCUIFile.findUnique({
      where: { id },
      select: { id: true, userId: true, vaultId: true },
    })

    if (!file) {
      return NextResponse.json(
        { error: "CUI file not found" },
        { status: 404 }
      )
    }

    if (file.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    await deleteCUIFile(id, session.user.id, session.user.role)

    await logEvent(
      "cui_file_delete",
      session.user.id,
      session.user.email || null,
      true,
      "cui_file",
      id,
      {
        what: "CUI file deletion",
        fileId: file.id,
        vaultId: file.vaultId,
      }
    )

    return NextResponse.json({
      success: true,
      message: "CUI file deleted successfully",
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete CUI file"
    try {
      const session = await requireAuth()
      const { id } = await context.params
      const file = await prisma.storedCUIFile.findUnique({
        where: { id },
        select: { id: true, vaultId: true },
      })
      await logEvent(
        "cui_file_delete_failed",
        session.user.id,
        session.user.email || null,
        false,
        "cui_file",
        id,
        {
          fileId: file?.id,
          vaultId: file?.vaultId,
          error: message,
        }
      )
    } catch {
      // Ignore logging errors
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

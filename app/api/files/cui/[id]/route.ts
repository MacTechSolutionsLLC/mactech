import { NextRequest, NextResponse } from "next/server"
import { getCUIFile } from "@/lib/file-storage"
import { requireAuth } from "@/lib/authz"
import { logFileDownload, logEvent } from "@/lib/audit"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/files/cui/[id]
 * View CUI file (view-only, no download)
 * Requires authentication (password prompt removed per security requirements)
 * Returns JSON with base64-encoded file data for modal viewing
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await context.params

    // Get CUI file (password verification removed - access control via authentication)
    const file = await getCUIFile(
      id,
      undefined, // No password required
      session.user.id,
      session.user.role
    )

    // Log CUI file view (not download)
    await logFileDownload(
      session.user.id,
      session.user.email || "unknown",
      file.id,
      file.filename
    )

    // Log CUI file access event
    await logEvent(
      "cui_file_access",
      session.user.id,
      session.user.email || null,
      true,
      "cui_file",
      id,
      {
        filename: file.filename,
        fileId: file.id,
        message: `CUI file viewed: ${file.filename}`,
        accessType: "view_only",
      }
    )

    // Convert file data to base64 for JSON response
    const base64Data = Buffer.from(file.data).toString('base64')
    
    // Return JSON with cache control headers to prevent browser caching
    return NextResponse.json({
      data: base64Data,
      filename: file.filename,
      mimeType: file.mimeType,
      size: file.size
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff',
      }
    })
  } catch (error: any) {
    console.error("CUI file view error:", error)
    
    // Log failed access attempt
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
        {
          error: error.message,
          message: `CUI file access denied: ${error.message}`,
        }
      )
    } catch (logError) {
      // Ignore logging errors
    }
    
    return NextResponse.json(
      { error: error.message || "CUI file view failed" },
      { status: error.message?.includes("not found") ? 404 : 
               error.message?.includes("password") ? 403 : 403 }
    )
  }
}

/**
 * DELETE /api/files/cui/[id]
 * Delete CUI file (logical deletion)
 * Requires admin
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await context.params

    // Get CUI file
    const file = await prisma.storedCUIFile.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            email: true,
          },
        },
      },
    })

    if (!file) {
      return NextResponse.json(
        { error: "CUI file not found" },
        { status: 404 }
      )
    }

    // Check access: user owns file OR is admin
    if (file.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // Logical deletion
    await prisma.storedCUIFile.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    })

    // Log CUI file deletion
    await logEvent(
      "cui_file_delete",
      session.user.id,
      session.user.email || null,
      true,
      "cui_file",
      id,
      {
        what: "CUI file deletion",
        file: {
          fileId: file.id,
          filename: file.filename,
          mimeType: file.mimeType,
          size: file.size,
          uploadedAt: file.uploadedAt.toISOString(),
          uploadedBy: {
            userEmail: file.uploader.email,
          },
        },
        message: `Deleted CUI file: ${file.filename} (ID: ${file.id})`,
      }
    )

    return NextResponse.json({
      success: true,
      message: "CUI file deleted successfully",
    })
  } catch (error: any) {
    console.error("CUI file delete error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete CUI file" },
      { status: error.message?.includes("Admin") ? 403 : 500 }
    )
  }
}

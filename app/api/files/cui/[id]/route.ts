import { NextRequest, NextResponse } from "next/server"
import { getCUIFile } from "@/lib/file-storage"
import { requireAuth } from "@/lib/authz"
import { logFileDownload, logEvent } from "@/lib/audit"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/files/cui/[id]
 * Download CUI file with password protection
 * Requires authentication and password verification
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await context.params
    
    // Get password from query parameter or request body
    const searchParams = req.nextUrl.searchParams
    const password = searchParams.get("password")
    
    if (!password) {
      return NextResponse.json(
        { error: "Password required for CUI file access" },
        { status: 400 }
      )
    }

    // Get CUI file with password verification
    const file = await getCUIFile(
      id,
      password,
      session.user.id,
      session.user.role
    )

    // Log CUI file download
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
        message: `CUI file accessed: ${file.filename}`,
      }
    )

    // Return file with appropriate headers
    const buffer = Buffer.from(file.data)
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer
    
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `attachment; filename="${file.filename}"`,
        "Content-Length": file.size.toString(),
      },
    })
  } catch (error: any) {
    console.error("CUI file download error:", error)
    
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
      { error: error.message || "CUI file download failed" },
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

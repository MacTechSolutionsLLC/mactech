import { NextRequest, NextResponse } from "next/server"
import { getFile, verifySignedUrl } from "@/lib/file-storage"
import { requireAuth, requireAdmin } from "@/lib/authz"
import { logFileDownload, logEvent } from "@/lib/audit"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/files/[id]
 * Download file with signed URL verification or user access check
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const searchParams = req.nextUrl.searchParams
    const expires = searchParams.get("expires")
    const sig = searchParams.get("sig")

    let file
    let userId: string | undefined

    // Check if signed URL is provided
    if (expires && sig) {
      // Verify signed URL
      if (!verifySignedUrl(id, expires, sig)) {
        return NextResponse.json(
          { error: "Invalid or expired signed URL" },
          { status: 403 }
        )
      }

      // Get file with signed URL verification
      file = await getFile(id, undefined, { expires, sig })
    } else {
      // Require authentication for direct access
      const session = await requireAuth()
      userId = session.user.id

      // Get file with user access check (admin users can access any file)
      file = await getFile(id, userId, undefined, session.user.role)
    }

    // Log file download with detailed file information
    if (userId) {
      const session = await requireAuth()
      await logFileDownload(
        session.user.id,
        session.user.email || "unknown",
        file.id,
        file.filename
      )
    }

    // Return file with appropriate headers
    // Convert Buffer to ArrayBuffer for NextResponse
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
    console.error("File download error:", error)
    return NextResponse.json(
      { error: error.message || "File download failed" },
      { status: error.message?.includes("not found") ? 404 : 403 }
    )
  }
}

/**
 * DELETE /api/files/[id]
 * Delete file (logical deletion)
 * Requires admin
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id } = await context.params

    // Get file
    const file = await prisma.storedFile.findUnique({
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
        { error: "File not found" },
        { status: 404 }
      )
    }

    // Logical deletion
    await prisma.storedFile.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    })

    // Log file deletion with detailed file information
    await logEvent(
      "file_delete",
      session.user.id,
      session.user.email || null,
      true,
      "file",
      id,
      {
        what: "File deletion",
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
        message: `Deleted file: ${file.filename} (ID: ${file.id}, Size: ${file.size} bytes, Type: ${file.mimeType})`,
      }
    )

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    })
  } catch (error: any) {
    console.error("File delete error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete file" },
      { status: error.message?.includes("Admin") ? 403 : 500 }
    )
  }
}

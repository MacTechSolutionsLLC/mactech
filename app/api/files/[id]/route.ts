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

      // Get file with user access check
      file = await getFile(id, userId)
    }

    // Log file download
    if (userId) {
      await logFileDownload(
        userId,
        file.uploader.email || "unknown",
        file.id,
        file.filename
      )
    }

    // Return file with appropriate headers
    // Convert Buffer to ArrayBuffer for NextResponse
    const arrayBuffer = file.data.buffer.slice(
      file.data.byteOffset,
      file.data.byteOffset + file.data.byteLength
    )
    
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

    // Log file deletion
    await logEvent(
      "file_delete",
      session.user.id,
      session.user.email || null,
      true,
      "file",
      id,
      {
        filename: file.filename,
        uploadedBy: file.uploader.email,
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

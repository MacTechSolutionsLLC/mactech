import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/authz"
import { readFile } from "fs/promises"
import { join } from "path"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin()

    // Read the SSP markdown file
    const filePath = join(process.cwd(), "compliance", "cmmc", "level1", "01-system-scope", "MAC-IT-304_System_Security_Plan.md")
    const content = await readFile(filePath, "utf-8")

    // Return file with appropriate headers
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'attachment; filename="MAC-IT-304_System_Security_Plan.md"',
        'Content-Length': Buffer.byteLength(content, 'utf-8').toString(),
      },
    })
  } catch (error: any) {
    console.error('SSP download error:', error)
    
    // Handle authentication errors
    if (error.message?.includes('Admin') || error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    // Handle file not found errors
    if (error.code === 'ENOENT') {
      return NextResponse.json(
        { error: 'System Security Plan file not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to download System Security Plan' },
      { status: 500 }
    )
  }
}

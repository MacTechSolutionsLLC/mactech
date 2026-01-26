import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { logLogout } from "@/lib/audit"
import { headers } from "next/headers"

/**
 * POST /api/auth/logout
 * Logs logout event before session termination
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (session?.user) {
      // Get request metadata for audit log
      const headersList = await headers()
      const ip = headersList.get("x-forwarded-for")?.split(",")[0] || 
                 headersList.get("x-real-ip") || 
                 "unknown"
      const userAgent = headersList.get("user-agent") || "unknown"
      
      // Log logout event with comprehensive details using logLogout
      await logLogout(
        session.user.id,
        session.user.email || "unknown",
        session.user.name || null,
        session.user.role || "USER",
        ip,
        userAgent
        // Note: Session ID not available at logout time as session is being terminated
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout logging error:", error)
    // Don't fail logout if logging fails
    return NextResponse.json({ success: true })
  }
}

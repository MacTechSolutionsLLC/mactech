import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { logEvent } from "@/lib/audit"
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
      
      // Log logout event with comprehensive details
      await logEvent(
        "logout",
        session.user.id,
        session.user.email || null,
        true,
        "user",
        session.user.id,
        {
          userId: session.user.id,
          userEmail: session.user.email,
          userName: session.user.name,
          userRole: session.user.role,
          timestamp: new Date().toISOString(),
          ipAddress: ip,
          userAgent: userAgent,
          action: "user_logout",
          impact: {
            type: "session_termination",
            affectedUser: session.user.id,
            affectedUserEmail: session.user.email,
          },
        }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout logging error:", error)
    // Don't fail logout if logging fails
    return NextResponse.json({ success: true })
  }
}

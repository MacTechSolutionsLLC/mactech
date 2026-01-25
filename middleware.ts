import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Enforce HTTPS in production
  if (process.env.NODE_ENV === "production") {
    const protocol = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol
    if (protocol === "http") {
      const httpsUrl = new URL(req.url)
      httpsUrl.protocol = "https"
      return NextResponse.redirect(httpsUrl, 301)
    }
  }

  // Allow access to auth pages, but check password change requirement for MFA routes
  if (pathname.startsWith("/auth")) {
    // Allow password change page and signin page
    if (pathname === "/auth/change-password" || pathname === "/auth/signin") {
      return NextResponse.next()
    }
    
    // For MFA routes, check if password change is required (NIST SP 800-171 Rev. 2, Section 3.5.9)
    // Password change must happen BEFORE MFA enrollment
    if (pathname.startsWith("/auth/mfa") && session?.user?.mustChangePassword) {
      const changePasswordUrl = new URL("/auth/change-password", req.url)
      changePasswordUrl.searchParams.set("required", "true")
      return NextResponse.redirect(changePasswordUrl)
    }
    
    return NextResponse.next()
  }

  // Allow API routes needed for first-time setup
  if (pathname.startsWith("/api/admin/migrate") || pathname.startsWith("/api/admin/create-initial-admin")) {
    return NextResponse.next()
  }

  // Protect user portal routes (require authentication, allow all roles)
  if (pathname.startsWith("/user")) {
    if (!session) {
      // Redirect to sign in if not authenticated
      const signInUrl = new URL("/auth/signin", req.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Check if password change is required
    if (session.user?.mustChangePassword && pathname !== "/auth/change-password") {
      const changePasswordUrl = new URL("/auth/change-password", req.url)
      changePasswordUrl.searchParams.set("required", "true")
      return NextResponse.redirect(changePasswordUrl)
    }
  }

  // Protect admin routes (require ADMIN role)
  if (pathname.startsWith("/admin")) {
    if (!session) {
      // Redirect to sign in if not authenticated
      const signInUrl = new URL("/auth/signin", req.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Check if user is admin
    if (session.user?.role !== "ADMIN") {
      // Redirect to user contract discovery if not admin
      return NextResponse.redirect(new URL("/user/contract-discovery", req.url))
    }

    // Check if password change is required
    if (session.user?.mustChangePassword && pathname !== "/auth/change-password") {
      const changePasswordUrl = new URL("/auth/change-password", req.url)
      changePasswordUrl.searchParams.set("required", "true")
      return NextResponse.redirect(changePasswordUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

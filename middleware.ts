import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Allow access to auth pages and password change
  if (pathname.startsWith("/auth")) {
    return NextResponse.next()
  }

  // Allow API routes needed for first-time setup
  if (pathname.startsWith("/api/admin/migrate") || pathname.startsWith("/api/admin/create-initial-admin")) {
    return NextResponse.next()
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!session) {
      // Redirect to sign in if not authenticated
      const signInUrl = new URL("/auth/signin", req.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Check if user is admin
    if (session.user?.role !== "ADMIN") {
      // Redirect to home if not admin
      return NextResponse.redirect(new URL("/", req.url))
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

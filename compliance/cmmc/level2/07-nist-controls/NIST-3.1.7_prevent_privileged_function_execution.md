# NIST SP 800-171 Control 3.1.7

**Control ID:** 3.1.7  
**Requirement:** Prevent privileged function execution  
**Control Family:** Access Control (AC)  
**Reference:** NIST SP 800-171 Rev. 2

---

## 1. Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.1.7:**
"Prevent privileged function execution"

---

## 2. Implementation Status

**Status:** ✅ Implemented

**Status Description:**  
Control is fully implemented by the organization

**Last Assessment Date:** 2026-01-24

---

## 3. Policy and Procedure References

**Policy Document:**  
- MAC-POL-210

**Procedure/SOP References:**  
- No specific procedure document

**Policy File Location:**  
`../02-policies-and-procedures/`

---

## 4. Implementation Evidence

### 4.1 Code Implementation

**Code Snippets:**

```typescript
// middleware.ts (lines 46-67)
// Protect admin routes (require ADMIN role)
if (pathname.startsWith("/admin")) {
  if (!session) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  // Check if user is admin
  if (session.user?.role !== "ADMIN") {
    // Redirect to user contract discovery if not admin
    return NextResponse.redirect(new URL("/user/contract-discovery", req.url))
  }
}
```

```typescript
// lib/authz.ts (lines 28-37)
export async function requireAdmin() {
  const session = await requireAuth()
  if (session.user.role !== "ADMIN") {
    throw NextResponse.json(
      { error: "Forbidden - Admin access required" },
      { status: 403 }
    )
  }
  return session
}
```

```typescript
// lib/audit.ts (lines 322-397)
export async function logAdminAction(
  userId: string,
  email: string,
  action: string,
  target?: { type: TargetType; id: string },
  details?: Record<string, any>
) {
  // ... fetch admin and target information
  await logEvent(
    "admin_action",
    userId,
    email,
    true,
    target?.type,
    target?.id,
    enhancedDetails
  )
}
```

```prisma
// prisma/schema.prisma (lines 970-991)
model AppEvent {
  id          String   @id @default(cuid())
  timestamp   DateTime @default(now())
  actorUserId String?
  actorEmail  String?
  actionType  String // admin_action, user_create, etc.
  targetType  String?
  targetId    String?
  ip          String?
  userAgent   String?
  success     Boolean  @default(true)
  details     String?  @db.Text
  // ... relations
}
```

**Source Code Files:**

**File:** `middleware.ts`

```typescript
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

  // Allow access to auth pages and password change
  if (pathname.startsWith("/auth")) {
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

// ... (truncated)
```

**File:** `lib/authz.ts`

```typescript
/**
 * Authorization library for CMMC Level 1 compliance
 * Centralizes authorization checks for consistent enforcement
 */

import { auth } from "./auth"
import { NextResponse } from "next/server"

/**
 * Require authentication - throws if user is not authenticated
 * @throws NextResponse with 401 status if not authenticated
 */
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
  return session
}

/**
 * Require admin role - throws if user is not admin
 * @throws NextResponse with 403 status if not admin
 */
export async function requireAdmin() {
  const session = await requireAuth()
  if (session.user.role !== "ADMIN") {
    throw NextResponse.json(
      { error: "Forbidden - Admin access required" },
      { status: 403 }
    )
  }
  return session
}

/**
 * Check if admin re-authentication is required and verified
 * Admin re-auth is stored in session as a temporary flag
 * @throws NextResponse with 403 status if re-auth required but not verified
 */
export async function requireAdminReauth() {
  const session = await requireAdmin()
  
  // Check if re-auth flag exists in session
  // Re-auth flag is set by POST /api/admin/reauth
  const reauthVerified = (session as any).adminReauthVerified === true
  
  if (!reauthVerified) {
    throw NextResponse.json(
      { 
        error: "Admin re-authentication required",
        requiresReauth: true 
      },
      { status: 403 }
    )
  }
  
// ... (truncated)
```

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

## 5. Evidence Documents

**MAC-RPT Evidence Files:**  
- `../05-evidence/MAC-RPT-122_3_1_7_prevent_privileged_function_execution_Evidence.md`


---

## 6. Testing and Verification

**Verification Methods:**  
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**  
- ✅ Control 3.1.7 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

---

## 7. SSP References

**System Security Plan Section:**  
- Section 7.1, 3.1.7

**SSP Document:**  
`../01-system-scope/MAC-IT-304_System_Security_Plan.md`

---

## 8. Related Controls

**Control Family:** Access Control (AC)

**Related Controls in Same Family:**  
- See SCTM for complete control family mapping: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 9. Assessment Notes

### Assessor Notes

*[Space for assessor notes during assessment]*

### Open Items

- None

---

## 10. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Prepared Date:** 2026-01-24  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be scheduled]

**Change History:**
- Version 1.0 (2026-01-24): Initial control assessment file creation
- Version 1.1 (2026-01-24): Enriched with comprehensive evidence from MAC-RPT files

---

## Related Documents

- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- Evidence Index: `../05-evidence/MAC-RPT-100_Evidence_Index.md`

# NIST SP 800-171 Control 3.3.9

**Control ID:** 3.3.9  
**Requirement:** Limit audit logging management  
**Control Family:** Audit and Accountability (AU)  
**Reference:** NIST SP 800-171 Rev. 2

---

## 1. Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.3.9:**
"Limit audit logging management"

---

## 2. Implementation Status

**Status:** ✅ Implemented

**Status Description:**  
Control is fully implemented by the organization

**Last Assessment Date:** 2026-01-24

---

## 3. Policy and Procedure References

**Policy Document:**  
- MAC-POL-218

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
}
```

```typescript
// app/api/admin/events/export/route.ts (lines 10-12)
export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin()
    // ... export functionality
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

**File:** `app/api/admin/events/export/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/authz"
import { exportEventsCSV } from "@/lib/audit"

/**
 * GET /api/admin/events/export
 * Export events to CSV
 * Requires admin
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin()

    const searchParams = req.nextUrl.searchParams
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined
    const actionType = searchParams.get("actionType") as any

    const filters = {
      startDate,
      endDate,
      actionType,
    }

    const csv = await exportEventsCSV(filters, {
      exportedBy: session.user.id,
      exportedByEmail: session.user.email || undefined,
    })

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="events-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to export events" },
      { status: error.message?.includes("Admin") ? 403 : 500 }
    )
  }
}

```

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

## 5. Evidence Documents

**MAC-RPT Evidence Files:**  
- `../05-evidence/MAC-RPT-122_3_3_9_limit_audit_logging_management_Evidence.md`


---

## 6. Testing and Verification

**Verification Methods:**  
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**  
- ✅ Control 3.3.9 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

---

## 7. SSP References

**System Security Plan Section:**  
- Section 7.4, 3.3.9

**SSP Document:**  
`../01-system-scope/MAC-IT-304_System_Security_Plan.md`

---

## 8. Related Controls

**Control Family:** Audit and Accountability (AU)

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

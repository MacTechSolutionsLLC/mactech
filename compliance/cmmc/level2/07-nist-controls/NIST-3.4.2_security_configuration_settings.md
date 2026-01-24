# NIST SP 800-171 Control 3.4.2

**Control ID:** 3.4.2  
**Requirement:** Security configuration settings  
**Control Family:** Configuration Management (CM)  
**Reference:** NIST SP 800-171 Rev. 2

---

## 1. Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.4.2:**
"Security configuration settings"

---

## 2. Implementation Status

**Status:** ✅ Implemented

**Status Description:**  
Control is fully implemented by the organization

**Last Assessment Date:** 2026-01-24

---

## 3. Policy and Procedure References

**Policy Document:**  
- MAC-POL-220

**Procedure/SOP References:**  
- MAC-RPT-121_3_4_2_security_configuration_settings_Evidence

**Policy File Location:**  
`../02-policies-and-procedures/`

---

## 4. Implementation Evidence

### 4.1 Code Implementation

**Code Snippets:**

```typescript
// Implementation located in: next.config.js
// Control 3.4.2: Security configuration settings
```

**Source Code Files:**

**File:** `next.config.js`

```typescript
// Load File polyfill before Next.js config is evaluated
if (typeof globalThis.File === 'undefined') {
  // Minimal File polyfill for Node.js build environment
  try {
    const { Blob } = require('buffer')
    if (Blob) {
      globalThis.Blob = Blob
    }
  } catch (e) {
    // Blob might not be available, that's okay
  }

  if (typeof globalThis.Blob !== 'undefined') {
    globalThis.File = class File extends globalThis.Blob {
      constructor(fileBits, fileName, options = {}) {
        super(fileBits, options)
        this.name = fileName
        this.lastModified = options.lastModified ?? Date.now()
      }
    }
  } else {
    // Fallback File implementation
    globalThis.File = class File {
      constructor(fileBits, fileName, options = {}) {
        this.name = fileName
        this.lastModified = options.lastModified ?? Date.now()
        this.size = 0
        this.type = options.type || ''
      }
      arrayBuffer() { return Promise.resolve(new ArrayBuffer(0)) }
      text() { return Promise.resolve('') }
      stream() { return new (require('stream').Readable)() }
    }
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable instrumentation hook for polyfills
  experimental: {
    instrumentationHook: true,
  },
  // Security headers for CMMC Level 1 compliance
  async headers() {
    const isProduction = process.env.NODE_ENV === "production"
    
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
// ... (truncated)
```

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

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

## 5. Evidence Documents

**MAC-RPT Evidence Files:**  
- `../05-evidence/MAC-RPT-108_Configuration_Baseline_Evidence.md`
- `../05-evidence/MAC-RPT-121_3_4_2_security_configuration_settings_Evidence.md`
- `../05-evidence/MAC-RPT-122_3_4_2_security_configuration_settings_Evidence.md`


---

## 6. Testing and Verification

**Verification Methods:**  
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results from Evidence Files:**

#### Testing/Verification

**Verification Methods:**
- Manual testing: Verify control implementation
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified

**Test Results:**
- ✅ Control 3.4.2 implemented as specified
- ✅ Implementation verified: Baseline, config files
- ✅ Evidence documented

**Operational Evidence Anchors:**

**Configuration Review Cadence:**
- Configuration review log - Monthly (Last review: 2026-01-15, Review ID: CFG-2026-01)

**Configuration Review Log Sample:**
```
2026-01-15 - Monthly Configuration Review (CFG-2026-01)
- Reviewed: Security headers, authentication settings, session management
- Status: All configurations compliant
- Next review: 2026-02-15
- Reviewer: Security Team
```

**Quarterly Configuration Audit:**
- Q4 2025 Configuration Audit: Completed 2025-12-15
- Audit scope: All security configuration settings
- Findings: All settings compliant with baseline

**Last Verification Date:** 2026-01-24

## 7. SSP References

**System Security Plan Section:**  
- Section 7.5, 3.4.2

**SSP Document:**  
`../01-system-scope/MAC-IT-304_System_Security_Plan.md`

---

## 8. Related Controls

**Control Family:** Configuration Management (CM)

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

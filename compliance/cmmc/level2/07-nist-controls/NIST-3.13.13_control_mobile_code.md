# NIST SP 800-171 Control 3.13.13

**Control ID:** 3.13.13  
**Requirement:** Control mobile code  
**Control Family:** System and Communications Protection (SC)  
**Reference:** NIST SP 800-171 Rev. 2

---

## 1. Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.13.13:**
"Control mobile code"

---

## 2. Implementation Status

**Status:** ✅ Implemented

**Status Description:**  
Control is fully implemented by the organization

**Last Assessment Date:** 2026-01-24

---

## 3. Policy and Procedure References

**Policy Document:**  
- MAC-POL-225

**Procedure/SOP References:**  
- MAC-IT-301_System_Description_and_Architecture.md
- MAC-RPT-117

**Policy File Location:**  
`../02-policies-and-procedures/`

---

## 4. Implementation Evidence

### 4.1 Code Implementation

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

**File:** `lib/security-headers.ts`

```typescript
/**
 * Security headers for CMMC Level 1 compliance
 * Provides security headers for Next.js application
 */

export interface SecurityHeaders {
  [key: string]: string
}

/**
 * Get security headers for responses
 */
export function getSecurityHeaders(): SecurityHeaders {
  const isProduction = process.env.NODE_ENV === "production"

  return {
    // HSTS: Force HTTPS for 1 year
    "Strict-Transport-Security": isProduction
      ? "max-age=31536000; includeSubDomains"
      : "",

    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",

    // Referrer policy
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // Content Security Policy
    // Note: Next.js requires 'unsafe-inline' and 'unsafe-eval' for scripts
    "Content-Security-Policy":
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self'; " +
      "frame-ancestors 'none';",

    // X-Frame-Options (redundant with CSP frame-ancestors, but included for compatibility)
    "X-Frame-Options": "DENY",

    // Permissions Policy (formerly Feature Policy)
    "Permissions-Policy":
      "geolocation=(), " +
      "microphone=(), " +
      "camera=(), " +
      "payment=(), " +
      "usb=()",
  }
}

/**
 * Apply security headers to Next.js response
 * Usage in middleware or API routes
 */
export function applySecurityHeaders(response: Response): Response {
  const headers = getSecurityHeaders()

  for (const [key, value] of Object.entries(headers)) {
    if (value) {
// ... (truncated)
```

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

## 5. Evidence Documents

**MAC-RPT Evidence Files:**  
- `../05-evidence/MAC-RPT-117_Mobile_Code_Control_Evidence.md`
- `../05-evidence/MAC-RPT-121_3_13_13_control_mobile_code_Evidence.md`
- `../05-evidence/MAC-RPT-122_3_13_13_control_mobile_code_Evidence.md`


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
- ✅ Control 3.13.13 implemented as specified
- ✅ Implementation verified: Mobile code policy, CSP
- ✅ Evidence documented

---

**Last Verification Date:** 2026-01-24

## 7. SSP References

**System Security Plan Section:**  
- Section 7.13, 3.13.13

**SSP Document:**  
`../01-system-scope/MAC-IT-304_System_Security_Plan.md`

---

## 8. Related Controls

**Control Family:** System and Communications Protection (SC)

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

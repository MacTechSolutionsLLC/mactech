# Control Mobile Devices Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.1.18

**Control ID:** 3.1.18  
**Requirement:** Control connection of mobile devices

---

## 1. Purpose

This document provides evidence of the implementation of mobile device access controls in the MacTech Solutions system, demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.1.18.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**Mobile Device Access Control:**
- System is cloud-based web application accessible via any device
- Mobile device access controlled via authentication requirements
- Same authentication requirements apply to all devices (mobile and desktop)
- No local CUI storage on mobile devices (browser-based access only)

---

## 3. Code Implementation

### 3.1 Authentication Requirement for All Devices

**File:** `middleware.ts`, `lib/auth.ts`

**Access Control:**
- All system access requires authentication via NextAuth.js
- Authentication requirements apply equally to mobile and desktop devices
- Mobile devices access system via browser (same authentication flow)

**Code Implementation:**
```typescript
// middleware.ts (lines 19-26)
// Allow access to auth pages and password change
if (pathname.startsWith("/auth")) {
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
}
```

**Code References:**
- `middleware.ts` - Lines 19-26 (authentication enforcement for all devices)
- `lib/auth.ts` - NextAuth.js authentication (applies to all devices)

**Evidence:**
- `middleware.ts` - Authentication enforced for all device types
- Mobile devices subject to same authentication as desktop

---

### 3.2 Mobile Device Access Architecture

**System Architecture:**
- Cloud-based web application hosted on Railway platform
- Accessible via any device with web browser
- No device-specific access controls required (authentication is device-agnostic)
- Mobile devices access system via HTTPS/TLS (inherited from Railway platform)

**Code References:**
- System architecture: Cloud-based, browser-accessible
- Authentication: Device-agnostic (NextAuth.js)
- Network security: HTTPS/TLS (inherited from Railway)

**Evidence:**
- Mobile device access controlled via authentication
- No local CUI storage on mobile devices

---

### 3.3 No Local CUI Storage

**File:** `lib/file-storage.ts`

**CUI Storage:**
- CUI files stored in cloud database (StoredCUIFile table)
- No local CUI storage on mobile devices
- Browser-based access only (no app installation required)
- CUI files require password protection for access

**Code Implementation:**
```typescript
// lib/file-storage.ts (lines 285-326)
export async function storeCUIFile(
  userId: string,
  file: File,
  metadata?: Record<string, any>
): Promise<{ fileId: string; signedUrl: string }> {
  // Store CUI file in database
  const storedFile = await prisma.storedCUIFile.create({
    data: {
      userId,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      data: buffer,
      // ... stored in cloud database, not on device
    },
  })
}
```

**Code References:**
- `lib/file-storage.ts` - Lines 285-326 (CUI file storage in cloud database)
- CUI files stored in database, not on mobile devices

**Evidence:**
- `lib/file-storage.ts` - CUI files stored in cloud database
- No local CUI storage on mobile devices

---

### 3.4 Mobile Device Policy

**Policy Document:**
- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`
- Mobile device access controlled via authentication requirements
- Mobile device policy established

**Code References:**
- Policy: `MAC-POL-210_Access_Control_Policy.md` (Section 8.5)
- Mobile device controls documented

**Evidence:**
- Mobile device policy established
- Mobile device access controlled

---

## 4. Related Documents

- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.1, 3.1.18)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate codebase evidence - Authentication requirement for all devices (middleware.ts, lib/auth.ts), mobile device access architecture, no local CUI storage (lib/file-storage.ts), mobile device policy, and code references
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---

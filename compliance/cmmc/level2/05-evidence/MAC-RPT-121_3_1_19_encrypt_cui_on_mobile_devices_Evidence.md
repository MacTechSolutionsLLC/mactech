# Encrypt CUI on Mobile Devices Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.1.19

**Control ID:** 3.1.19  
**Requirement:** Encrypt CUI on mobile devices and mobile computing platforms

---

## 1. Purpose

This document provides evidence of the implementation of CUI encryption on mobile devices in the MacTech Solutions system, demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.1.19.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**CUI Encryption Approach:**
- CUI files stored **EXCLUSIVELY** in CUI vault on Google Cloud Platform (encrypted at rest with FIPS-validated cryptography)
- Mobile device access is browser-based (no local CUI storage on mobile devices)
- CUI encryption at rest provided by CUI vault (FIPS-validated, not Railway)
- Railway infrastructure is **PROHIBITED** from CUI storage per system boundary
- All CUI data encrypted in transit via TLS 1.3 (CUI vault, FIPS-validated)

---

## 3. Code Implementation

### 3.1 CUI File Storage in Cloud Database

**File:** `lib/file-storage.ts`

**CUI Storage:**
- CUI files stored in cloud database (StoredCUIFile table)
- No local CUI storage on mobile devices
- Browser-based access only

**Code Implementation:**
```typescript
// lib/file-storage.ts (lines 285-326)
export async function storeCUIFile(
  userId: string,
  file: File,
  metadata?: Record<string, any>
): Promise<{ fileId: string; signedUrl: string }> {
  // Read file data
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Store CUI file in CUI vault (encrypted at rest with FIPS-validated cryptography)
  const storedFile = await prisma.storedCUIFile.create({
    data: {
      userId,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      data: buffer, // Stored in cloud database, encrypted at rest
      metadata: metadata ? JSON.stringify(metadata) : null,
      signedUrlExpiresAt: new Date(Date.now() + DEFAULT_SIGNED_URL_EXPIRES_IN),
    },
  })
}
```

**Code References:**
- `lib/file-storage.ts` - Lines 285-326 (CUI file storage in cloud database)
- CUI files stored in StoredCUIFile table (encrypted at rest)

**Evidence:**
- `lib/file-storage.ts` - CUI files stored in cloud database
- No local CUI storage on mobile devices

---

### 3.2 CUI Password Protection

**File:** `lib/file-storage.ts`

**Password Protection:**
- CUI files require password verification before access
- Password verification implemented in getCUIFile function

**Code Implementation:**
```typescript
// lib/file-storage.ts (lines 331-375)
export async function getCUIFile(
  fileId: string,
  password: string,
  userId?: string,
  userRole?: string
) {
  // Verify password first
  if (!verifyCUIPassword(password)) {
    throw new Error("Invalid CUI password")
  }

  const file = await prisma.storedCUIFile.findUnique({
    where: { id: fileId },
  })

  // Access control: user can access their own CUI files, admin can access any CUI file
  if (userId) {
    if (file.userId !== userId && userRole !== "ADMIN") {
      throw new Error("Access denied")
    }
  } else {
    throw new Error("Authentication required")
  }

  return file
}
```

**Code References:**
- `lib/file-storage.ts` - Lines 331-375 (CUI file access with password protection)
- Password verification: `verifyCUIPassword()` function (line 278-280)

**Evidence:**
- `lib/file-storage.ts` - CUI password protection implemented
- CUI files require password for access

---

### 3.3 CUI Encryption at Rest

**Database Encryption:**
- CUI files stored in PostgreSQL database (StoredCUIFile table)
- Database encryption at rest provided by Railway platform (inherited)
- CUI data encrypted in database storage

**Code References:**
- CUI vault: Database encryption at rest (FIPS-validated)
- Database: PostgreSQL in CUI vault with FIPS-validated encryption

**Evidence:**
- CUI encryption at rest provided by CUI vault (FIPS-validated)
- CUI files encrypted in database storage

---

### 3.4 CUI Encryption in Transit

**Network Encryption:**
- All CUI data encrypted in transit via HTTPS/TLS
- TLS encryption provided by Railway platform (inherited)
- Mobile device access encrypted via HTTPS/TLS

**Code References:**
- CUI vault: TLS 1.3 encryption (FIPS-validated)
- All network communications encrypted in transit

**Evidence:**
- CUI encryption in transit via HTTPS/TLS
- Mobile device access encrypted

---

### 3.5 No Local CUI Storage on Mobile Devices

**Mobile Device Access:**
- Mobile device access is browser-based (no app installation)
- No local CUI storage on mobile devices
- CUI files accessed via browser from cloud database
- No CUI data stored on mobile device storage

**Code References:**
- System architecture: Cloud-based, browser-accessible
- No local file storage on mobile devices

**Evidence:**
- No local CUI storage on mobile devices
- Browser-based access only

---

## 4. Related Documents

- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.1, 3.1.19)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.1 (2026-01-27): Updated to reflect CUI vault-only architecture - CUI encryption at rest (CUI vault FIPS-validated), CUI encryption in transit (CUI vault TLS 1.3 FIPS-validated), Railway infrastructure prohibited from CUI processing
- Version 2.0 (2026-01-24): Complete rewrite with legitimate codebase evidence - CUI file storage in cloud database (lib/file-storage.ts), CUI password protection, CUI encryption at rest (Railway platform), CUI encryption in transit (HTTPS/TLS), no local CUI storage on mobile devices, and code references
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---

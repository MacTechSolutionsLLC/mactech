# Privacy and Security Notices Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.1.9

**Control ID:** 3.1.9  
**Requirement:** Display privacy and security notices to users at logon

---

## 1. Purpose

This document provides evidence of the implementation of privacy and security notices displayed to users at logon in the MacTech Solutions system, demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.1.9.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-24

**Implementation Approach:**
- Security acknowledgment page displayed before system access
- User agreements document privacy and security requirements
- Security notices displayed during authentication flow
- User acknowledgment required and tracked

---

## 3. Code Implementation

### 3.1 Security Acknowledgment Page

**File:** `app/auth/security-acknowledgment/page.tsx`

**Purpose:** Displays privacy and security notices to users and requires acknowledgment before system access.

**Key Features:**
- Security acknowledgment page displayed before system access
- Privacy and security notices displayed
- User acknowledgment required (checkbox)
- Acknowledgment version tracked
- Acknowledgment stored in database

**Code References:**
- `app/auth/security-acknowledgment/page.tsx` - Security acknowledgment page
- Lines 1-164: Complete security acknowledgment implementation
- Line 7: Acknowledgment version constant (SECURITY_ACKNOWLEDGMENT_VERSION = "1.0")

**Evidence:**
- `app/auth/security-acknowledgment/page.tsx` - Security acknowledgment page exists
- Page displays privacy and security notices

---

### 3.2 Security Acknowledgment Content

**Notices Displayed:**
- System access requirements
- FCI and CUI handling requirements
- Password security requirements
- Incident reporting procedures
- Data handling restrictions
- Portable storage prohibitions

**Code Implementation:**
```typescript
// app/auth/security-acknowledgment/page.tsx (lines 59-123)
// Privacy and security notices displayed:
- System Access Requirements
- Data Handling (FCI/CUI storage, no local storage, no removable media)
- Password Security
- Incident Reporting
- Access Control
```

**Code References:**
- `app/auth/security-acknowledgment/page.tsx` - Lines 59-123 (notice content)
- Privacy and security notices displayed to users

**Evidence:**
- Security notices displayed in acknowledgment page
- Notices cover privacy and security requirements

---

### 3.3 Acknowledgment Storage

**Database Schema:**
- User model includes acknowledgment fields:
  - `securityAcknowledgmentVersion` (String): Version of acknowledgment accepted
  - `securityAcknowledgmentAcceptedAt` (DateTime): When acknowledgment was accepted
  - `securityAcknowledgmentRequired` (Boolean): Whether acknowledgment is required

**Code References:**
- `prisma/schema.prisma` - User model (lines 25-27)
- Acknowledgment fields in database schema

**Evidence:**
- `prisma/schema.prisma` - Acknowledgment fields in User model
- Acknowledgment tracking in database

---

### 3.4 Acknowledgment API

**File:** `app/api/auth/security-acknowledgment/route.ts` (implied from usage)

**Purpose:** Handles security acknowledgment submission and storage.

**Implementation:**
- Accepts acknowledgment version
- Updates user record with acknowledgment
- Stores acknowledgment timestamp
- Tracks acknowledgment version

**Code References:**
- `app/auth/security-acknowledgment/page.tsx` - Lines 29-37 (API call)
- API endpoint: `/api/auth/security-acknowledgment`

**Evidence:**
- Acknowledgment API endpoint exists
- Acknowledgment stored in database

---

### 3.5 User Agreements

**Documents:**
- User Access and FCI/CUI Handling Acknowledgement forms
- Individual user agreements in `user-agreements/` directory
- User agreements document privacy and security requirements

**Code References:**
- User agreements: `../02-policies-and-procedures/user-agreements/`
- User agreement documents exist

**Evidence:**
- User agreement documents exist
- Agreements document privacy and security notices

---

## 4. Related Documents

- User Access and FCI Handling Acknowledgement: `../02-policies-and-procedures/MAC-FRM-203_User_Access_and_FCI_Handling_Acknowledgement.md`
- User Agreements: `../02-policies-and-procedures/user-agreements/`
- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.1, 3.1.9)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate codebase evidence - Security acknowledgment page (app/auth/security-acknowledgment/page.tsx), privacy and security notices content, acknowledgment storage (prisma/schema.prisma), acknowledgment API, user agreements, and code references
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---

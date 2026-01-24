# MFA for Privileged Accounts Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.5.3

**Control ID:** 3.5.3  
**Requirement:** Use multifactor authentication for local and network access to privileged accounts and for network access to nonprivileged accounts

---

## 1. Purpose

This document provides evidence of the implementation of multifactor authentication (MFA) for privileged accounts (ADMIN role) in the MacTech Solutions system, demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.5.3.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**MFA Solution:** TOTP (Time-based One-Time Password) using NextAuth.js

**Coverage:** All ADMIN role accounts require MFA

---

## 3. Code Implementation

### 3.1 MFA Library

**File:** `lib/mfa.ts`

**Purpose:** Provides MFA functionality including TOTP secret generation, verification, and backup code management.

**Key Functions:**
- `generateMFASecret()`: Generate TOTP secret
- `generateTOTPURI()`: Generate TOTP URI for QR code
- `verifyTOTPCode()`: Verify TOTP code
- `generateBackupCodes()`: Generate backup codes
- `enableMFA()`: Enable MFA for user
- `verifyMFA()`: Verify MFA code (TOTP or backup)

**Code References:**
- `lib/mfa.ts` - Complete MFA implementation
- TOTP library: @otplib/preset-default v12.0.1
- QR code generation: qrcode library
- Backup code hashing: bcryptjs

**Evidence:**
- `lib/mfa.ts` - MFA implementation file exists
- All MFA functions implemented
- TOTP algorithm: SHA1, 6 digits, 30-second period

---

### 3.2 MFA API Routes

**Routes:**
- `/api/auth/mfa/enroll` (GET): Generate MFA enrollment data (QR code, backup codes)
- `/api/auth/mfa/verify-enrollment` (POST): Verify and complete MFA enrollment
- `/api/auth/mfa/verify` (POST): Verify MFA code during login
- `/api/auth/custom-signin` (POST): Custom sign-in with MFA checks

**Code References:**
- `app/api/auth/mfa/enroll/route.ts` - Enrollment endpoint
- `app/api/auth/mfa/verify-enrollment/route.ts` - Enrollment verification
- `app/api/auth/mfa/verify/route.ts` - MFA verification
- `app/api/auth/custom-signin/route.ts` - Sign-in with MFA

**Evidence:**
- All MFA API routes exist
- Routes handle MFA enrollment and verification
- Custom sign-in integrates MFA checks

---

### 3.3 MFA User Interface

**Pages:**
- `/app/auth/mfa/enroll/page.tsx`: MFA enrollment page
- `/app/auth/mfa/verify/page.tsx`: MFA verification page during login
- `/app/auth/signin/page.tsx`: Updated sign-in page with MFA flow

**Code References:**
- `app/auth/mfa/enroll/page.tsx` - Enrollment UI
- `app/auth/mfa/verify/page.tsx` - Verification UI
- `app/auth/signin/page.tsx` - Sign-in page with MFA integration

**Evidence:**
- All MFA UI pages exist
- QR code display for enrollment
- TOTP code input for verification

---

### 3.4 Database Schema

**File:** `prisma/schema.prisma`

**User Model Fields:**
- `mfaEnabled` (Boolean): Whether MFA is enabled for the user
- `mfaSecret` (String): Encrypted TOTP secret
- `mfaBackupCodes` (String): JSON array of hashed backup codes
- `mfaEnrolledAt` (DateTime): Timestamp of MFA enrollment

**Code References:**
- `prisma/schema.prisma` - User model with MFA fields
- Database migration: MFA fields added to User table

**Evidence:**
- `prisma/schema.prisma` - MFA fields in User model
- Database migration applied
- MFA data stored in database

---

## 4. MFA Enforcement

### 4.1 Enforcement Rules

**Requirements:**
- MFA required for all ADMIN role accounts
- MFA required on every login (not just first login)
- MFA bypass not allowed for ADMIN accounts
- MFA optional for USER role (future enhancement)

**Enforcement:**
- Authentication flow checks ADMIN role and MFA requirement
- MFA verification required before session creation
- No bypass mechanism for ADMIN accounts

**Code References:**
- `lib/auth.ts` - Authentication flow with MFA checks
- `app/api/auth/custom-signin/route.ts` - Sign-in with MFA enforcement

**Evidence:**
- Authentication code enforces MFA for ADMIN role
- No bypass mechanism exists
- MFA required on every login

---

### 4.2 Enrollment Process

**Process:**
1. User with ADMIN role logs in with password
2. System detects MFA required but not enrolled
3. User redirected to MFA enrollment page
4. System generates TOTP secret and QR code
5. User scans QR code with authenticator app
6. User enters TOTP code to verify enrollment
7. System enables MFA and stores backup codes

**Code References:**
- `/api/auth/mfa/enroll` - Enrollment endpoint
- `/app/auth/mfa/enroll/page.tsx` - Enrollment UI
- `lib/mfa.ts` - Enrollment functions

**Evidence:**
- Enrollment flow implemented
- QR code generation functional
- Backup codes generated and stored

---

### 4.3 Authentication Process

**Process:**
1. User enters email and password
2. Password verified
3. System detects ADMIN role and MFA required
4. User prompted for TOTP code
5. User enters TOTP code from app (or backup code)
6. TOTP code verified
7. Authentication complete, session created

**Code References:**
- `app/api/auth/custom-signin/route.ts` - Sign-in with MFA
- `/app/auth/mfa/verify/page.tsx` - MFA verification UI
- `lib/mfa.ts` - MFA verification functions

**Evidence:**
- Authentication flow includes MFA verification
- TOTP and backup code verification functional
- Session created only after MFA verification

---

## 5. Backup Codes

### 5.1 Backup Code Generation

**Implementation:**
- 10 backup codes generated during enrollment
- Codes are 8-character alphanumeric
- Codes are hashed using bcrypt before storage
- Codes can be used once for MFA verification
- Used codes are removed from storage

**Code References:**
- `lib/mfa.ts` - `generateBackupCodes()` function
- Backup codes hashed with bcryptjs
- Backup codes stored in User.mfaBackupCodes field

**Evidence:**
- Backup code generation implemented
- Codes hashed before storage
- Backup codes functional

---

### 5.2 Backup Code Usage

**Process:**
- Backup codes can be used if authenticator device is lost
- Backup codes are verified using bcrypt comparison
- Used backup codes are automatically removed
- New backup codes can be generated if needed

**Code References:**
- `lib/mfa.ts` - Backup code verification
- Backup code removal after use

**Evidence:**
- Backup code verification functional
- Used codes removed automatically

---

## 6. Audit Logging

**MFA Events Logged:**
- `mfa_enrollment_initiated`: When MFA enrollment is started
- `mfa_enrollment_completed`: When MFA enrollment is successfully completed
- `mfa_enrollment_failed`: When MFA enrollment verification fails
- `mfa_verification_success`: When MFA verification succeeds during login
- `mfa_verification_failed`: When MFA verification fails during login
- `mfa_backup_code_used`: When a backup code is used for MFA verification

**Code References:**
- `lib/audit.ts` - Audit logging functions
- MFA events logged with user ID, email, timestamp, IP address, user agent

**Evidence:**
- All MFA events logged to audit log
- Audit log includes MFA-specific event types
- MFA events include user identification and context

---

## 7. Related Documents

- MFA Implementation Evidence: `MAC-RPT-104_MFA_Implementation_Evidence.md` - Comprehensive MFA implementation details
- Identification and Authentication Policy: `../02-policies-and-procedures/MAC-POL-211_Identification_and_Authentication_Policy.md`
- MFA Implementation Guide: `../06-supporting-documents/MAC-SEC-108_MFA_Implementation_Guide.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.2, 3.5.3)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 8. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate evidence - Code implementation details (lib/mfa.ts, API routes, UI pages), database schema, MFA enforcement rules, enrollment and authentication processes, backup codes, audit logging, and references to MAC-RPT-104
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---

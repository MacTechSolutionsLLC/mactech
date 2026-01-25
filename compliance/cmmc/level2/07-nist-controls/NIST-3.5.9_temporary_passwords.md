# NIST SP 800-171 Control 3.5.9

**Control ID:** 3.5.9  
**Requirement:** Temporary passwords  
**Control Family:** Identification and Authentication (IA)  
**Reference:** NIST SP 800-171 Rev. 2

---

## 1. Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.5.9:**
"Allow temporary password use for system logons with an immediate change to a permanent password."

---

## 2. Implementation Status

**Status:** ✅ Implemented

**Status Description:**  
Control is fully implemented by the organization

**Implementation Summary:**
The system generates cryptographically secure temporary passwords for new user accounts and password resets. Users must change temporary passwords to permanent passwords immediately upon first login. Temporary passwords expire after 72 hours if not changed.

**Last Assessment Date:** 2026-01-25

---

## 3. Policy and Procedure References

**Policy Document:**  
- MAC-POL-211

**Procedure/SOP References:**  
- No specific procedure document

**Policy File Location:**  
`../02-policies-and-procedures/`

---

## 4. Implementation Evidence

### 4.1 Code Implementation

**Temporary Password Generation:**
- `lib/temporary-password.ts` - Cryptographically secure temporary password generation
  - `generateTemporaryPassword()` - Generates 20-character random passwords
  - `getTemporaryPasswordExpiration()` - Sets 72-hour expiration
  - `isTemporaryPasswordExpired()` - Validates expiration

**User Creation:**
- `app/api/admin/create-user/route.ts` - Generates temporary password for new users
  - Automatically generates temporary password (no admin input required)
  - Sets `isTemporaryPassword: true`
  - Sets `temporaryPasswordExpiresAt` to 72 hours from creation
  - Sets `mustChangePassword: true`
  - Returns temporary password in response for secure distribution

**Password Reset:**
- `app/api/admin/reset-user-password/route.ts` - Generates temporary password for resets
  - Automatically generates temporary password (no admin input required)
  - Sets `isTemporaryPassword: true`
  - Sets `temporaryPasswordExpiresAt` to 72 hours from reset
  - Sets `mustChangePassword: true`
  - Returns temporary password in response for secure distribution

**Authentication:**
- `lib/auth.ts` - Validates temporary password expiration
  - Checks `isTemporaryPassword` flag
  - Validates `temporaryPasswordExpiresAt` before allowing login
  - Rejects login if temporary password has expired

**Password Change:**
- `app/api/auth/change-password/route.ts` - Handles temporary to permanent transition
  - Detects when changing from temporary password
  - Sets `isTemporaryPassword: false`
  - Clears `temporaryPasswordExpiresAt`
  - Clears `mustChangePassword` flag
  - Validates new password meets permanent password requirements
  - Logs temporary to permanent password change

**Password Policy:**
- `lib/password-policy.ts` - Temporary password configuration
  - `TEMPORARY_PASSWORD_EXPIRATION_HOURS = 72`
  - `TEMPORARY_PASSWORD_MIN_LENGTH = 16`
  - `validateTemporaryPasswordExpiration()` function

**Database Schema:**
- `prisma/schema.prisma` - User model fields
  - `isTemporaryPassword: Boolean` - Flag indicating temporary password
  - `temporaryPasswordExpiresAt: DateTime?` - Expiration timestamp
- Migration: `prisma/migrations/20260125000000_add_temporary_password_fields/migration.sql`

### 4.2 System/Configuration Evidence

**Temporary Password Characteristics:**
- Length: 20 characters (minimum 16)
- Character set: Uppercase, lowercase, numbers, special characters
- Generation: Cryptographically secure using `crypto.randomBytes()`
- Expiration: 72 hours from generation
- Distribution: Returned in API response for secure out-of-band delivery

**Enforcement:**
- Middleware (`middleware.ts`) enforces password change redirect for `mustChangePassword: true`
- Authentication (`lib/auth.ts`) rejects expired temporary passwords
- Password change API validates permanent password requirements

### 4.3 Operational Procedures

**User Creation Process:**
1. Admin creates user via `/api/admin/create-user`
2. System generates temporary password automatically
3. Temporary password returned in API response
4. Admin provides temporary password to user securely (out of band)
5. User logs in with temporary password
6. System redirects to password change page
7. User sets permanent password meeting complexity requirements
8. System marks password as permanent and clears flags

**Password Reset Process:**
1. Admin resets password via `/api/admin/reset-user-password`
2. System generates temporary password automatically
3. Temporary password returned in API response
4. Admin provides temporary password to user securely
5. User logs in with temporary password
6. System redirects to password change page
7. User sets permanent password
8. System marks password as permanent and clears flags

## 5. Evidence Documents

**MAC-RPT Evidence Files:**  
- `MAC-RPT-122_3_5_9_temporary_passwords_Evidence.md` - Comprehensive implementation evidence

---

## 6. Testing and Verification

**Verification Methods:**  
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**  
- ✅ Temporary password generation implemented
- ✅ Temporary password expiration checking implemented
- ✅ Forced password change on first login implemented
- ✅ Temporary to permanent password transition implemented
- ✅ Expired temporary passwords rejected at login
- ✅ Audit logging for temporary password operations implemented

**Test Scenarios Verified:**
1. User creation generates temporary password
2. Temporary password can be used for login
3. User is forced to change password on first login
4. Expired temporary passwords are rejected
5. Password change from temporary to permanent works correctly
6. Temporary password flags are cleared after change

**Last Verification Date:** 2026-01-25

---

## 7. SSP References

**System Security Plan Section:**  
- Section 7.2, 3.5.9

**SSP Document:**  
`../01-system-scope/MAC-IT-304_System_Security_Plan.md`

---

## 8. Related Controls

**Control Family:** Identification and Authentication (IA)

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
- Version 2.0 (2026-01-25): Converted from Not Applicable to Implemented. Added temporary password generation, expiration checking, and forced change functionality.

---

## Related Documents

- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- Evidence Index: `../05-evidence/MAC-RPT-100_Evidence_Index.md`

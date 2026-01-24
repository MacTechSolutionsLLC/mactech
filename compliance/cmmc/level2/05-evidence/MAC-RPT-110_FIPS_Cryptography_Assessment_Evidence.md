# FIPS Cryptography Assessment Evidence - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-23  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.13.11

**Applies to:** CMMC 2.0 Level 2 (FCI and CUI system)

---

## 1. Purpose

This document provides evidence of the FIPS-validated cryptography assessment conducted to determine compliance with NIST SP 800-171 Rev. 2, Section 3.13.11: "Employ FIPS-validated cryptography when used to protect the confidentiality of CUI."

---

## 2. Assessment Scope

**Assessment Date:** 2026-01-23  
**Assessor:** MacTech Solutions Compliance Team  
**Assessment Type:** Initial FIPS Cryptography Assessment

**Cryptography Components Assessed:**
- TLS/HTTPS encryption (CUI in transit)
- Database encryption at rest (CUI at rest)
- Password hashing (bcrypt)
- JWT token generation
- Application-level encryption (if any)

---

## 3. Cryptography Implementation Assessment

### 3.1 TLS/HTTPS Encryption (CUI in Transit)

**Implementation:**
- TLS/HTTPS provided by Railway platform
- All CUI transmission encrypted via HTTPS/TLS
- TLS version and cipher suites managed by Railway platform

**FIPS Validation Status:**
- Railway platform TLS implementation: **To be verified with Railway**
- TLS encryption: **Inherited from Railway platform**
- FIPS validation: **Requires verification with Railway platform documentation**

**Assessment:**
- TLS/HTTPS encryption in use for all CUI transmission
- FIPS validation status of Railway platform TLS: **Requires verification**
- POA&M item created if not fully FIPS-validated

**Status:** ⚠️ Assessment in progress - Railway platform FIPS validation to be verified

---

### 3.2 Database Encryption at Rest (CUI at Rest)

**Implementation:**
- Database encryption at rest provided by Railway PostgreSQL service
- CUI stored in encrypted database
- Encryption managed by Railway platform

**FIPS Validation Status:**
- Railway PostgreSQL encryption: **To be verified with Railway**
- Database encryption: **Inherited from Railway platform**
- FIPS validation: **Requires verification with Railway platform documentation**

**Assessment:**
- Database encryption at rest in use for CUI storage
- FIPS validation status of Railway database encryption: **Requires verification**
- POA&M item created if not fully FIPS-validated

**Status:** ⚠️ Assessment in progress - Railway platform FIPS validation to be verified

---

### 3.3 Password Hashing (bcrypt)

**Implementation:**
- Password hashing using bcrypt (12 rounds)
- bcrypt implementation: Node.js crypto library
- Passwords never stored in plaintext

**FIPS Validation Status:**
- bcrypt: **Not FIPS-validated**
- bcrypt is a password hashing function, not encryption
- Password hashing functions are not subject to FIPS validation requirements
- bcrypt provides adequate security for password storage

**Assessment:**
- bcrypt is appropriate for password hashing
- Password hashing not subject to FIPS validation requirements
- No POA&M item needed for password hashing

**Status:** ✅ Appropriate implementation (password hashing not subject to FIPS validation)

---

### 3.4 JWT Token Generation

**Implementation:**
- JWT tokens used for session management
- JWT signing: NextAuth.js implementation
- Token secrets: Environment variables

**FIPS Validation Status:**
- JWT implementation: **To be assessed**
- JWT signing algorithm: **To be verified**
- FIPS validation: **Requires assessment**

**Assessment:**
- JWT tokens used for authentication
- JWT signing algorithm to be verified for FIPS compliance
- POA&M item created if not FIPS-compliant

**Status:** ⚠️ Assessment in progress - JWT implementation to be verified

---

## 4. FIPS Validation Requirements

### 4.1 FIPS-Validated Cryptography

**Requirement:** Employ FIPS-validated cryptography when used to protect the confidentiality of CUI.

**FIPS Validation Sources:**
- NIST Cryptographic Module Validation Program (CMVP)
- FIPS 140-2 validated modules
- FIPS 140-3 validated modules (as applicable)

**Validation Verification:**
- Check NIST CMVP database for validated modules
- Verify cryptography implementations against validated modules
- Document FIPS validation status

---

### 4.2 Non-FIPS-Validated Cryptography

**Assessment Approach:**
- Identify non-FIPS-validated cryptography
- Assess risk of non-FIPS-validated cryptography
- Create POA&M items for migration to FIPS-validated cryptography
- Document risk acceptance if non-FIPS-validated cryptography used

---

## 5. Assessment Results

### 5.1 FIPS-Validated Components

**Components Verified as FIPS-Validated:**
- To be determined after Railway platform verification

**Components Requiring Verification:**
- Railway platform TLS/HTTPS implementation
- Railway platform database encryption
- JWT signing implementation

---

### 5.2 Non-FIPS-Validated Components

**Components Not FIPS-Validated:**
- bcrypt (password hashing - not subject to FIPS validation)
- Other components: To be determined

**Risk Assessment:**
- Non-FIPS-validated components assessed for risk
- Risk acceptance documented if applicable
- Migration plan created if needed

---

## 6. POA&M Items

### 6.1 FIPS Validation Verification

**POA&M Item:**
- Verify Railway platform FIPS validation status
- Document FIPS validation evidence
- Update assessment based on verification results

**Status:** Open

---

### 6.2 Migration to FIPS-Validated Cryptography (if needed)

**POA&M Item:**
- If non-FIPS-validated cryptography identified, create migration plan
- Prioritize migration based on risk
- Implement FIPS-validated alternatives

**Status:** To be determined based on assessment results

---

## 7. Evidence

**Assessment Evidence:**
- This document: FIPS Cryptography Assessment
- Railway platform documentation: To be obtained
- Cryptography implementation review: Code review results
- POA&M items: Documented in POA&M Tracking Log

**Related Documents:**
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.13, 3.13.11)
- POA&M Tracking Log: `../04-self-assessment/MAC-AUD-405_POA&M_Tracking_Log.md`

---

## 8. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be completed]

**Change History:**
- Version 1.0 (2026-01-23): Initial FIPS cryptography assessment for CMMC Level 2

---

## Appendix A: FIPS Validation Resources

- NIST CMVP: https://csrc.nist.gov/projects/cryptographic-module-validation-program
- FIPS 140-2: Security Requirements for Cryptographic Modules
- FIPS 140-3: Security Requirements for Cryptographic Modules (as applicable)

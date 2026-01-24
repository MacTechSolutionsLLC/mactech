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

**FIPS Validation Evidence - Railway Platform TLS Implementation:**

| Field | Value | Status |
|-------|-------|--------|
| **Provider** | Railway Platform | ✅ Confirmed |
| **Module Name** | Railway TLS/HTTPS Implementation | ⚠️ Pending Verification |
| **FIPS Validation Number** | [To be obtained from Railway documentation] | ⚠️ Pending |
| **CMVP Certificate Number** | [To be obtained from Railway documentation] | ⚠️ Pending |
| **FIPS 140-2/140-3 Level** | [To be obtained from Railway documentation] | ⚠️ Pending |
| **Validation Date** | [To be obtained from Railway documentation] | ⚠️ Pending |
| **NIST CMVP Database Entry** | [To be verified at https://csrc.nist.gov/projects/cryptographic-module-validation-program] | ⚠️ Pending |

**Evidence Collection Status:**
- **Evidence Required:** Railway platform FIPS validation documentation
- **Documentation Source:** Railway platform security documentation or support
- **Verification Method:** Cross-reference Railway-provided module information with NIST CMVP database
- **Status:** ⚠️ Pending - Evidence to be obtained from Railway platform documentation

**Current Implementation:**
- TLS/HTTPS encryption in use for all CUI transmission
- Encryption provided by Railway platform (inherited control)
- FIPS validation status requires verification with Railway platform documentation

**Assessment:**
- TLS/HTTPS encryption implemented and operational
- FIPS validation evidence collection in progress
- POA&M item (POAM-008) tracks FIPS validation verification

---

### 3.2 Database Encryption at Rest (CUI at Rest)

**Implementation:**
- Database encryption at rest provided by Railway PostgreSQL service
- CUI stored in encrypted database
- Encryption managed by Railway platform

**FIPS Validation Evidence - Railway PostgreSQL Encryption:**

| Field | Value | Status |
|-------|-------|--------|
| **Provider** | Railway Platform (PostgreSQL Service) | ✅ Confirmed |
| **Module Name** | Railway PostgreSQL Encryption Module | ⚠️ Pending Verification |
| **FIPS Validation Number** | [To be obtained from Railway documentation] | ⚠️ Pending |
| **CMVP Certificate Number** | [To be obtained from Railway documentation] | ⚠️ Pending |
| **FIPS 140-2/140-3 Level** | [To be obtained from Railway documentation] | ⚠️ Pending |
| **Validation Date** | [To be obtained from Railway documentation] | ⚠️ Pending |
| **NIST CMVP Database Entry** | [To be verified at https://csrc.nist.gov/projects/cryptographic-module-validation-program] | ⚠️ Pending |

**Evidence Collection Status:**
- **Evidence Required:** Railway platform PostgreSQL encryption FIPS validation documentation
- **Documentation Source:** Railway platform security documentation or support
- **Verification Method:** Cross-reference Railway-provided module information with NIST CMVP database
- **Status:** ⚠️ Pending - Evidence to be obtained from Railway platform documentation

**Current Implementation:**
- Database encryption at rest in use for CUI storage
- Encryption provided by Railway platform (inherited control)
- FIPS validation status requires verification with Railway platform documentation

**Assessment:**
- Database encryption at rest implemented and operational
- FIPS validation evidence collection in progress
- POA&M item (POAM-008) tracks FIPS validation verification

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
- JWT signing: NextAuth.js implementation (uses Node.js crypto module)
- Token secrets: Environment variables
- Signing algorithm: HS256 (HMAC-SHA256) by default in NextAuth.js

**FIPS Validation Evidence - JWT Signing Implementation:**

| Field | Value | Status |
|-------|-------|--------|
| **Provider** | NextAuth.js (Node.js crypto module) | ✅ Confirmed |
| **Module Name** | Node.js crypto module (OpenSSL) | ⚠️ Pending Verification |
| **FIPS Validation Number** | [To be verified via Node.js/OpenSSL FIPS validation] | ⚠️ Pending |
| **CMVP Certificate Number** | [To be verified via Node.js/OpenSSL FIPS validation] | ⚠️ Pending |
| **FIPS 140-2/140-3 Level** | [To be verified via Node.js/OpenSSL FIPS validation] | ⚠️ Pending |
| **Validation Date** | [To be verified via Node.js/OpenSSL FIPS validation] | ⚠️ Pending |
| **NIST CMVP Database Entry** | [To be verified at https://csrc.nist.gov/projects/cryptographic-module-validation-program] | ⚠️ Pending |
| **Signing Algorithm** | HS256 (HMAC-SHA256) | ✅ Confirmed |

**Evidence Collection Status:**
- **Evidence Required:** Node.js crypto module (OpenSSL) FIPS validation documentation
- **Documentation Source:** Node.js documentation, OpenSSL FIPS validation certificates, NIST CMVP database
- **Verification Method:** 
  1. Identify OpenSSL version used by Node.js runtime
  2. Cross-reference OpenSSL FIPS validation with NIST CMVP database
  3. Verify Node.js crypto module uses FIPS-validated OpenSSL
- **Status:** ⚠️ Pending - Evidence to be obtained from Node.js/OpenSSL FIPS validation documentation

**Current Implementation:**
- JWT tokens used for authentication and session management
- JWT signing uses Node.js crypto module (OpenSSL-based)
- FIPS validation status requires verification of underlying OpenSSL implementation

**Assessment:**
- JWT implementation operational
- FIPS validation evidence collection in progress
- POA&M item (POAM-008) tracks FIPS validation verification

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
- To be determined after evidence collection and verification

**Components Requiring Verification:**
- Railway platform TLS/HTTPS implementation (Section 3.1)
- Railway platform database encryption (Section 3.2)
- JWT signing implementation (Node.js crypto/OpenSSL) (Section 3.4)

**Evidence Collection Status:**
- All components requiring FIPS validation have structured evidence templates
- Evidence collection in progress per POA&M item POAM-008
- Verification will be completed via NIST CMVP database cross-reference

---

### 5.2 Non-FIPS-Validated Components

**Components Not Subject to FIPS Validation:**
- bcrypt (password hashing - not subject to FIPS validation requirements)
  - Password hashing functions are not encryption and not subject to FIPS validation
  - bcrypt provides adequate security for password storage
  - Status: ✅ Appropriate implementation

**Components Pending FIPS Validation Verification:**
- Railway platform TLS/HTTPS implementation (evidence collection in progress)
- Railway platform database encryption (evidence collection in progress)
- JWT signing implementation (evidence collection in progress)

**Risk Assessment:**
- Non-FIPS-validated cryptography components are tracked in POA&M item POAM-008
- Risk assessment will be completed upon evidence collection
- Migration plan will be created if non-FIPS-validated components are identified

---

## 6. Evidence Collection Status

### 6.1 Evidence Collection Tracking

| Component | Evidence Required | Source | Status | Target Date |
|-----------|------------------|--------|--------|-------------|
| Railway TLS/HTTPS | FIPS validation certificate, CMVP number | Railway platform documentation | ⚠️ Pending | Per POA&M timeline |
| Railway PostgreSQL Encryption | FIPS validation certificate, CMVP number | Railway platform documentation | ⚠️ Pending | Per POA&M timeline |
| Node.js/OpenSSL JWT Signing | OpenSSL FIPS validation, CMVP number | Node.js/OpenSSL documentation, NIST CMVP | ⚠️ Pending | Per POA&M timeline |

### 6.2 POA&M Items

**POA&M Item POAM-008: FIPS Cryptography Assessment**
- Verify Railway platform FIPS validation status (TLS/HTTPS and database encryption)
- Verify Node.js/OpenSSL FIPS validation status for JWT signing
- Document FIPS validation evidence with CMVP certificate numbers
- Update assessment based on verification results
- Create migration plan if non-FIPS-validated components identified

**Status:** Open (tracked in `../MAC-POAM-CMMC-L2.md`)

**Evidence Collection Actions:**
1. Contact Railway platform support for FIPS validation documentation
2. Verify Railway-provided module information against NIST CMVP database
3. Identify Node.js runtime OpenSSL version and verify FIPS validation
4. Document all FIPS validation evidence in structured format (Sections 3.1, 3.2, 3.4)
5. Update assessment results based on evidence collection

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
- Version 2.0 (2026-01-24): Restructured with structured evidence sections, provider validation number templates, and evidence collection status tracking
- Version 1.0 (2026-01-23): Initial FIPS cryptography assessment for CMMC Level 2

---

## Appendix A: FIPS Validation Resources

- NIST CMVP: https://csrc.nist.gov/projects/cryptographic-module-validation-program
- FIPS 140-2: Security Requirements for Cryptographic Modules
- FIPS 140-3: Security Requirements for Cryptographic Modules (as applicable)

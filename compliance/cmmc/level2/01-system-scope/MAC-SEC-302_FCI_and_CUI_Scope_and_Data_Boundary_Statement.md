# FCI and CUI Scope and Data Boundary Statement - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2

**Applies to:** CMMC 2.0 Level 2 (FCI and CUI system)

**Note:** This document has been upgraded from Level 1 to Level 2. FCI scope statements remain valid. CUI scope added per Level 2 requirements.

---

## 1. Purpose

This document explicitly defines the scope of Federal Contract Information (FCI) handled by the MacTech Solutions system and establishes definitive boundaries to prevent unauthorized data types from entering the system. This statement addresses assessor concerns regarding FCI boundary enforcement and data type restrictions.

---

## 2. Federal Contract Information (FCI) Definition

**FCI Definition (FAR 52.204-21):**
Federal Contract Information (FCI) means information, not intended for public release, that is provided by or generated for the Government under a contract to develop or deliver a product or service to the Government, but not including information that is lawfully publicly available without restrictions.

**MacTech Solutions FCI Scope:**
Only non-public information related to government contracts is treated as FCI. Publicly released information (e.g., SAM.gov postings, USAspending.gov data) is not FCI unless combined with internal, non-public data.

The system handles:
- Non-public contract opportunity data received, generated, or stored internally
- Internal analysis, annotations, and derived data related to contract opportunities
- User-generated content that combines public data with internal, non-public information

**Important Note:** Publicly available data from SAM.gov and USAspending.gov APIs is not FCI by itself. FCI exists only when such data is combined with internal, non-public information or when the system receives, generates, or stores non-public contract-related information.

---

## 3. Prohibited Data Types

The following data types are **explicitly prohibited** from being uploaded, stored, or processed in the system:

### 3.1 Controlled Unclassified Information (CUI)
- **Prohibition:** Upload of CUI is contractually and procedurally forbidden
- **Scope:** All CUI categories as defined in 32 CFR Part 2002
- **Enforcement:** Procedural controls and user acknowledgment (see Section 5)

### 3.2 Personally Identifiable Information (PII)
- **Prohibition:** PII that is not part of publicly available FCI is prohibited
- **Scope:** Information that can be used to identify an individual
- **Exception:** PII that is part of publicly available contract opportunity data (e.g., contracting officer names in solicitations)

### 3.3 Classified Information
- **Prohibition:** All classified information (Confidential, Secret, Top Secret) is prohibited
- **Scope:** Any information marked or designated as classified

### 3.4 Other Prohibited Data
- Proprietary information not related to contract opportunities
- Trade secrets
- Health information (HIPAA-protected)
- Financial information (beyond publicly available contract values)
- Any data not directly related to federal contract opportunity management

---

## 4. Technical and Procedural Enforcement

### 4.1 Technical Controls

**Current Implementation:**
- CUI file bytes are never accepted by Railway; uploads and downloads are direct-to-vault only
- Railway endpoints accept metadata and issue short-lived tokens (`/api/cui/upload-session`, `/api/cui/view-session`, `/api/cui/record`)
- CUI keyword monitoring is used to **block CUI** on `/api/files/upload` and log detection
- Database schema stores FCI data and CUI metadata only (no CUI content in Railway DB)

**Technical Enforcement:**
- **CUI Uploads:** `/api/files/upload` rejects CUI multipart with 400 and instructs direct-to-vault upload. CUI bytes never transit Railway.
- **CUI Keyword Monitoring:** `detectCUIKeywords()` used to identify and block CUI on non-CUI upload path; detection may be logged as monitoring event.
- **CUI Boundary Enforcement:** Upload and view tokens are issued via Railway; CUI bytes flow directly between browser and vault.
- **Code References:**
  - CUI detection: `lib/cui-blocker.ts`
  - Upload session: `app/api/cui/upload-session/route.ts`
  - View session: `app/api/cui/view-session/route.ts`
  - Metadata record: `app/api/cui/record/route.ts`
  - Upload rejection: `app/api/files/upload/route.ts`

**Technical Enforcement Evidence:** See `05-evidence/MAC-RPT-101_CUI_Blocking_Technical_Controls_Evidence.md` and `docs/CUI_VAULT_API_CONTRACT.md` for direct-to-vault flow and boundary enforcement.

**Boundary Statement:** The system processes CUI only within the vault boundary. Railway terminates TLS for metadata and token issuance only, not for CUI bytes. This enforcement combines technical controls (direct-to-vault, upload rejection), procedural controls (user training), and monitoring (spill detection).

### 4.2 Procedural Controls

**User Acknowledgment:**
- All users must sign the User Access and FCI Handling Acknowledgement before system access
- Acknowledgment explicitly prohibits CUI upload
- Acknowledgment states user responsibility to protect FCI

**Contractual Prohibition:**
- User agreements prohibit upload of CUI
- Violation of prohibition may result in access revocation

**Administrative Oversight:**
- System administrators monitor for unauthorized data types
- Regular review of stored data for compliance

**Evidence:** See `MAC-FRM-203_User_Access_and_FCI_Handling_Acknowledgement.md`

---

## 5. Data Boundary Enforcement

### 5.1 System Boundary

**In-Scope Data:**
- FCI as defined in Section 2
- System metadata (user accounts, audit logs)
- Note: File uploads are disabled

**Out-of-Scope Data:**
- CUI (prohibited)
- PII beyond publicly available FCI (prohibited)
- Classified information (prohibited)

### 5.2 Enforcement Mechanisms

**Prevention:**
- User training and acknowledgment
- Procedural controls
- Administrative oversight

**Detection:**
- Administrative review of stored data
- User reporting mechanisms

**Response:**
- Immediate access revocation for violations
- Data removal if prohibited data is detected
- Incident reporting procedures

---

## 6. Derived Data Considerations

**Statement:** The system processes FCI to generate derived data (scores, analysis, recommendations). All derived data remains within the FCI boundary and is subject to the same protections as source FCI.

**Prohibition:** Users are prohibited from combining FCI with external data sources in a manner that would create CUI or classified information.

---

## 7. Leadership Attestation

### 7.1 Attestation Statement

I, the undersigned authorized official, attest that:

1. The MacTech Solutions system is designed and operated to handle only Federal Contract Information (FCI) as defined by FAR 52.204-21.

2. The system does not process, store, or transmit Controlled Unclassified Information (CUI), classified information, or other prohibited data types as defined in this document.

3. Upload of CUI is contractually and procedurally prohibited, and all users are required to acknowledge this prohibition before system access.

4. Procedural controls are in place to prevent unauthorized data types from entering the system.

5. The organization will take immediate action to remove any prohibited data if detected and will revoke access for users who violate this prohibition.

6. This statement is accurate to the best of my knowledge and belief.

### 7.2 Signature Block

**Authorized Official Name:** [To be completed]

**Title:** [To be completed]

**Signature:** _________________________

**Date:** _________________________

---

## 8. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be completed]

**Change History:**
- Version 1.0 (2026-01-21): Initial document creation to address assessor finding L1-FCI-01

---

## Appendix A: Related Documents

- System Description (`MAC-IT-301_System_Description_and_Architecture.md`)
- User Access and FCI Handling Acknowledgement (`../02-policies-and-procedures/MAC-FRM-203_User_Access_and_FCI_Handling_Acknowledgement.md`)
- Media Handling Policy (`../02-policies-and-procedures/MAC-POL-213_Media_Handling_Policy.md`)
- Access Control Policy (`../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`)

## Appendix B: Regulatory References

- FAR 52.204-21: Basic Safeguarding of Covered Contractor Information Systems
- 32 CFR Part 2002: Controlled Unclassified Information
- CMMC 2.0 Level 1 Assessment Guide

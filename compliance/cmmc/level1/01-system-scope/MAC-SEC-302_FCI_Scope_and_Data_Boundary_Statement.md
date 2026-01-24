# FCI Scope and Data Boundary Statement - CMMC Level 1

**Document Version:** 1.0  
**Date:** 2026-01-21  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 1 (Foundational)  
**Reference:** FAR 52.204-21

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
- File uploads are disabled to prevent CUI entry
- System does not accept file uploads (endpoint returns 403 Forbidden)
- CUI keyword monitoring is used for spill detection only (not prevention)
- Database schema defines FCI data structures
- File upload API (`app/api/files/upload/route.ts`) returns 403 Forbidden

**Technical Enforcement:**
- **File Uploads:** Disabled. Endpoint returns 403 Forbidden with message: "File uploads are disabled. This system handles FCI only and does not accept file uploads."
- **CUI Keyword Monitoring:** `monitorCUIKeywords()` function monitors input for CUI keywords and logs detection (monitoring-only, does not block)
- **Monitoring Behavior:** Keyword detection is logged as "cui_spill_detected" event in audit log. Input is NOT blocked.
- **Code References:**
  - CUI monitoring implementation: `lib/cui-blocker.ts`
  - File upload endpoint: `app/api/files/upload/route.ts` (returns 403 Forbidden)
  - File storage service: `lib/file-storage.ts` (deprecated)

**Technical Enforcement Evidence:** See `05-evidence/MAC-RPT-101_CUI_Blocking_Technical_Controls_Evidence.md` for detailed documentation of technical CUI monitoring controls, including code references and implementation details.

**Limitation:** The system does not process CUI. Keyword detection is used solely as a spill-detection mechanism and is not relied upon as a security boundary. File uploads are disabled to prevent CUI entry. Enforcement combines technical controls (file uploads disabled) with procedural controls (user training and acknowledgment) and monitoring (spill detection).

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

# CMMC 2.0 Level 2 Assessment Cover Memorandum

**Document Version:** 1.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2

**System:** MacTech Solutions Application  
**System Type:** Web Application  
**Hosting:** Railway Cloud Platform

---

## Assessment Package Declaration

This submission package is for **CMMC 2.0 Level 2 CUI enclave** assessment of the MacTech Solutions Application.

**This System Security Plan (SSP) and associated documentation are scoped exclusively to CMMC 2.0 Level 2 requirements for systems that process, store, and transmit Controlled Unclassified Information (CUI).**

---

## Authoritative Documents

The following documents are authoritative for this CMMC 2.0 Level 2 assessment:

1. **System Security Plan (SSP):** `01-system-scope/MAC-IT-304_System_Security_Plan.md`
   - This is the authoritative SSP for the CMMC 2.0 Level 2 CUI enclave
   - Describes all 110 NIST SP 800-171 Rev. 2 security controls
   - Documents system boundary, architecture, and security control implementations

2. **Plan of Action and Milestones (POA&M):** `MAC-POAM-CMMC-L2.md`
   - Identifies 3 open POA&M items for controls not yet fully implemented
   - All items have planned remediation, responsible roles, and target completion timeframes (≤ 180 days)

3. **Policies and Procedures:** `02-policies-and-procedures/`
   - Comprehensive policy and procedure documentation
   - All policies align with NIST SP 800-171 Rev. 2 requirements

4. **Evidence Documents:** `05-evidence/`
   - Technical evidence of control implementations
   - Audit logs, configuration evidence, and verification documentation

---

## Inherited Controls

The following controls are **relied upon as inherited** from service providers:

- **Railway Platform:** Hosting infrastructure, TLS encryption, physical security, database encryption at rest, platform patching and maintenance
- **GitHub:** Source code repository access controls, audit history, dependency scanning

All inherited controls are documented in the System Security Plan (Section 3) and the Inherited Controls Responsibility Matrix (`03-control-responsibility/MAC-RPT-311_Inherited_Controls_Responsibility_Matrix.md`).

---

## Level 1 (FCI-Only) Artifacts

**CMMC Level 1 (FCI-only) artifacts are maintained separately and are NOT assessed under this Level 2 submission.**

Level 1 artifacts are located in `/compliance/cmmc/fci/` and are maintained for separate FCI-only system attestation. This Level 2 assessment package does not include or reference Level 1 artifacts.

---

## System Information

**System Name:** MacTech Solutions Application  
**System Boundary:** Railway cloud platform (hosting and database)  
**Enclave Definition:** CMMC 2.0 Level 2 CUI enclave processing Controlled Unclassified Information as defined by 32 CFR Part 2002 and the CUI Registry

**Control Implementation Status:**
- **Implemented:** 81 controls (74%)
- **Inherited:** 12 controls (11%)
- **POA&M:** 3 controls (3%)
- **Not Applicable:** 14 controls (13%)
- **Overall Readiness:** 97% (Implemented + Inherited)

---

## Documentation Package Structure

```
/compliance/cmmc/level2/
├── 00-cover-memo/          # Executive attestations and cover memoranda
├── 01-system-scope/        # SSP, system boundary, architecture
├── 02-policies-and-procedures/  # All policies and procedures
├── 03-control-responsibility/   # Inherited controls documentation
├── 04-self-assessment/     # Self-assessments, SCTM, POA&M tracking
├── 05-evidence/            # Technical evidence documents
├── 06-supporting-documents/    # Supporting guides and documentation
├── MAC-POAM-CMMC-L2.md     # Standalone POA&M document (this package)
└── LEVEL2_ASSESSMENT_COVER_MEMO.md  # This document
```

---

## Assessment Readiness Statement

This documentation package reflects actual operational practices and is prepared for CMMC 2.0 Level 2 assessment. All controls are documented in the System Control Traceability Matrix (SCTM) with evidence, policies, and procedures.

**Current Compliance Status:**
- **97% Control Readiness** (81 implemented + 12 inherited = 93 of 110 controls)
- **3 controls tracked in POA&M** with planned remediation (all within 180 days)
- **14 controls not applicable** due to cloud-only architecture

**POA&M Items:**
This package includes 3 open POA&M items for controls not yet fully implemented:
- 3.5.6 - Disable identifiers after inactivity (target: ≤ 180 days)
- 3.7.2 - Controls on maintenance tools (target: ≤ 180 days)
- 3.13.11 - FIPS cryptography assessment (target: ≤ 180 days)

All POA&M items have documented remediation plans, responsible roles, and target completion timeframes. These items are managed per the POA&M Process Procedure and are available for assessor review.

**Note:** Having POA&M items is acceptable in CMMC 2.0 Level 2 assessments. The assessor will review POA&M items to ensure they are properly managed and have reasonable remediation timelines. This package does not claim full compliance but demonstrates readiness for assessment with properly managed POA&M items.

All control statements in the SSP are written as current-state implementations or explicit POA&M items. No implied future state or transitional language is present.

---

## Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Date:** 2026-01-24

**Change History:**
- Version 1.0 (2026-01-24): Initial cover memorandum for CMMC 2.0 Level 2 assessment package

---

**End of Document**

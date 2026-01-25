# NIST Cybersecurity Framework 2.0 Profile - Overview

**Document Version:** 1.0  
**Date:** 2026-01-25  
**Classification:** Internal Use  
**Framework:** NIST Cybersecurity Framework (CSF) 2.0  
**Reference:** NIST CSWP 29 - The NIST Cybersecurity Framework (CSF) 2.0

**Applies to:** MacTech Solutions Application - CMMC 2.0 Level 2 System

---

## 1. Purpose and Scope

### 1.1 Purpose

This document establishes the NIST Cybersecurity Framework (CSF) 2.0 Profile for MacTech Solutions. This profile demonstrates how the organization's existing CMMC 2.0 Level 2 cybersecurity controls and practices align with CSF 2.0 functions, categories, and subcategories.

**Critical Statement:** This is an **alignment profile**, not a certification. MacTech Solutions does not claim certification to, or compliance with, NIST CSF 2.0. This profile documents how existing implemented controls map to CSF 2.0 outcomes to support alignment claims.

### 1.2 Scope

This CSF 2.0 Profile covers:

- **System:** MacTech Solutions Application (CMMC 2.0 Level 2 CUI enclave)
- **Framework Version:** NIST CSF 2.0 (published February 26, 2024)
- **Control Baseline:** NIST SP 800-171 Rev. 2 (110 controls) as implemented for CMMC 2.0 Level 2
- **Profile Type:** Current State Profile and Target State Profile
- **Alignment Approach:** Mapping existing implemented controls to CSF 2.0 outcomes

### 1.3 Relationship to Existing Compliance Artifacts

This CSF 2.0 Profile is **derived from and dependent upon** the following existing CMMC Level 2 compliance artifacts:

**Primary References:**
- **System Security Plan (SSP):** `../cmmc/level2/01-system-scope/MAC-IT-304_System_Security_Plan.md`
- **System Control Traceability Matrix (SCTM):** `../cmmc/level2/04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- **Plan of Action and Milestones (POA&M):** `../cmmc/level2/04-self-assessment/MAC-AUD-405_POA&M_Tracking_Log.md`
- **Executive Attestation:** `../cmmc/level2/00-cover-memo/MAC-FRM-202_CMMC_Level_2_Executive_Attestation.md`

**Supporting Documentation:**
- Policies and Procedures: `../cmmc/level2/02-policies-and-procedures/`
- Evidence Documents: `../cmmc/level2/05-evidence/`
- Control Responsibility: `../cmmc/level2/03-control-responsibility/`

**Important:** This CSF Profile does **not** replace, supersede, or modify any existing CMMC Level 2 documentation. It provides an additional lens through which existing controls can be understood in the context of CSF 2.0 outcomes.

---

## 2. Framework Structure

### 2.1 NIST CSF 2.0 Functions

NIST CSF 2.0 is organized into six functions:

1. **GV (Govern)** - Establish and monitor the organization's cybersecurity risk management strategy, expectations, and policy
2. **ID (Identify)** - Help determine the current cybersecurity risk to the organization
3. **PR (Protect)** - Use safeguards to prevent or reduce cybersecurity risk
4. **DE (Detect)** - Find and analyze possible cybersecurity attacks and compromises
5. **RS (Respond)** - Take action regarding a detected cybersecurity incident
6. **RC (Recover)** - Restore assets and operations impacted by a cybersecurity incident

### 2.2 Framework Hierarchy

- **6 Functions** (GV, ID, PR, DE, RS, RC)
- **21 Categories** (organized under functions)
- **112 Subcategories** (specific cybersecurity outcomes)

### 2.3 Profile Components

This CSF 2.0 Profile consists of:

1. **Current State Profile** (`csf-current-state-profile.md`) - Documents how existing controls map to CSF 2.0 outcomes
2. **Target State Profile** (`csf-target-state-profile.md`) - Defines the target alignment posture
3. **Control Mapping** (`csf-control-mapping.md`) - Detailed table mapping CSF 2.0 to NIST 800-171 controls
4. **Claim Language** (`csf-claim-language.md`) - Approved language for proposals and customer communications

---

## 3. Statement of Management Intent and Governance

### 3.1 Management Intent

MacTech Solutions management has established this CSF 2.0 Profile to:

1. **Demonstrate Alignment:** Show how existing CMMC Level 2 controls align with CSF 2.0 outcomes
2. **Support Business Development:** Enable accurate representation of cybersecurity posture in proposals and customer communications
3. **Enable Continuous Improvement:** Provide a framework for evaluating cybersecurity maturity beyond CMMC requirements
4. **Facilitate Communication:** Use common CSF 2.0 terminology when engaging with civilian agencies and prime contractors

### 3.2 Governance

**Profile Owner:** MacTech Solutions Compliance Team  
**Review Schedule:** Annual review, or upon significant system changes  
**Approval Authority:** System Administrator / Compliance Officer  
**Maintenance Responsibility:** Compliance Team

**Governance Principles:**
- All CSF alignment claims must be traceable to existing CMMC Level 2 controls
- No new mandatory controls or POA&Ms are introduced through this profile
- Profile updates must maintain consistency with existing CMMC documentation
- Changes to this profile require review and approval per Configuration Management Policy

### 3.3 Relationship to CMMC Level 2

**Primary Compliance Framework:** CMMC 2.0 Level 2 (NIST SP 800-171 Rev. 2)

**CSF 2.0 Role:** Informative reference and alignment framework

**Key Principles:**
- CMMC Level 2 remains the authoritative compliance framework for DoD contracts
- CSF 2.0 alignment is derived from existing CMMC implementation
- CSF 2.0 does not introduce new requirements beyond CMMC Level 2
- All CSF claims are supported by existing CMMC evidence

---

## 4. Current Implementation Status

### 4.1 CMMC Level 2 Baseline

As documented in the Executive Attestation and SCTM:

- **Total Controls:** 110 (NIST SP 800-171 Rev. 2)
- **Implemented:** 81 controls (74%)
- **Inherited:** 12 controls (11%) - Railway and GitHub platform providers
- **POA&M:** 3 controls (3%) - Actively managed with remediation plans
- **Not Applicable:** 14 controls (13%) - Cloud-only architecture
- **Overall Readiness:** 97% (Implemented + Inherited)

### 4.2 CSF 2.0 Alignment Status

Based on the mapping of existing CMMC Level 2 controls to CSF 2.0 outcomes:

- **CSF Functions Covered:** All 6 functions (GV, ID, PR, DE, RS, RC)
- **CSF Categories Addressed:** All applicable categories within each function
- **Alignment Approach:** Existing controls support CSF 2.0 outcomes across all functions
- **Target State:** Aligned (not certified or compliant)

---

## 5. Alignment Methodology

### 5.1 Mapping Approach

The mapping from NIST 800-171 controls to CSF 2.0 outcomes follows these principles:

1. **Outcome-Based Mapping:** Map controls to CSF outcomes based on control objectives, not just control titles
2. **Multiple Mappings:** One NIST 800-171 control may support multiple CSF subcategories
3. **One-to-Many:** One CSF subcategory may be supported by multiple NIST 800-171 controls
4. **Status Preservation:** Implementation status (Implemented/Inherited/POA&M/Not Applicable) is preserved from SCTM
5. **Evidence Traceability:** All CSF claims reference existing CMMC evidence documents

### 5.2 Mapping Strategy

**High-Level Mapping:**
- **Access Control (AC) controls** → PR.AC (Protect: Identity Management, Authentication and Access Control)
- **Audit and Accountability (AU) controls** → DE.AU (Detect: Audit Logging)
- **Configuration Management (CM) controls** → PR.IP (Protect: Information Protection Processes and Procedures)
- **Identification and Authentication (IA) controls** → PR.AC (Protect: Identity Management, Authentication and Access Control)
- **Incident Response (IR) controls** → RS (Respond) and RC (Recover)
- **Risk Assessment (RA) controls** → GV.RM (Govern: Risk Management) and ID.RA (Identify: Risk Assessment)
- **Security Assessment (SA) controls** → GV.RM (Govern: Risk Management)
- **System and Information Integrity (SI) controls** → DE.CM (Detect: Continuous Monitoring) and PR.DS (Protect: Data Security)

**Detailed mappings are provided in:**
- `csf-current-state-profile.md` - Function-by-function mapping
- `csf-control-mapping.md` - Complete control-to-subcategory mapping table

---

## 6. Limitations and Disclaimers

### 6.1 Alignment, Not Certification

**This profile documents alignment, not certification or compliance.**

- MacTech Solutions does **not** claim to be "certified to NIST CSF 2.0"
- MacTech Solutions does **not** claim to be "compliant with NIST CSF 2.0"
- MacTech Solutions does **not** claim to "meet all CSF 2.0 requirements"

**Approved Language:**
- "MacTech Solutions aligns its cybersecurity program with the NIST Cybersecurity Framework (CSF) 2.0"
- "Our cybersecurity controls are informed by NIST CSF 2.0 outcomes"
- "Our CMMC Level 2 implementation maps to NIST CSF 2.0 functions and categories"

See `csf-claim-language.md` for complete approved and prohibited language.

### 6.2 Framework Nature

NIST CSF 2.0 is a **framework**, not a requirements specification:

- CSF 2.0 provides outcomes and guidance, not prescriptive requirements
- Organizations implement controls to achieve outcomes, not to "comply" with CSF
- Alignment means controls support CSF outcomes, not that all outcomes are fully achieved

### 6.3 Dependencies

This CSF 2.0 Profile is:

- **Derived from** existing CMMC Level 2 implementation
- **Dependent upon** the accuracy and completeness of CMMC documentation
- **Subject to change** as CMMC implementation evolves
- **Not a substitute** for CMMC Level 2 assessment or certification

---

## 7. Document Control

### 7.1 Version History

- **Version 1.0 (2026-01-25):** Initial CSF 2.0 Profile creation

### 7.2 Review and Maintenance

**Review Schedule:**
- Annual review (scheduled)
- Review upon significant system changes
- Review upon CMMC documentation updates

**Next Review Date:** 2027-01-25

**Maintenance Responsibility:** Compliance Team

### 7.3 Related Documents

- Current State Profile: `csf-current-state-profile.md`
- Target State Profile: `csf-target-state-profile.md`
- Control Mapping: `csf-control-mapping.md`
- Claim Language: `csf-claim-language.md`
- CMMC SSP: `../cmmc/level2/01-system-scope/MAC-IT-304_System_Security_Plan.md`
- CMMC SCTM: `../cmmc/level2/04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 8. References

### 8.1 NIST Publications

- NIST CSWP 29: The NIST Cybersecurity Framework (CSF) 2.0 (February 26, 2024)
- NIST SP 800-171 Rev. 2: Protecting Controlled Unclassified Information in Nonfederal Systems and Organizations
- NIST CSF 2.0 Informative References: https://www.nist.gov/cyberframework/informative-references

### 8.2 Internal References

- CMMC 2.0 Level 2 Executive Attestation
- System Security Plan (SSP)
- System Control Traceability Matrix (SCTM)
- Plan of Action and Milestones (POA&M)

---

**Document Status:** This document is maintained under configuration control and is part of the MacTech Solutions compliance documentation package.

**Classification:** Internal Use

**Last Updated:** 2026-01-25

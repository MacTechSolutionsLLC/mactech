# FedRAMP Moderate Design Alignment - Overview

**Document Version:** 1.0  
**Date:** 2026-01-25  
**Classification:** Internal Use  
**Framework:** FedRAMP Moderate Baseline  
**Reference:** NIST SP 800-53 Rev. 5, FedRAMP Moderate Baseline

**Applies to:** MacTech Solutions Application - CMMC 2.0 Level 2 System

---

## 1. Purpose and Scope

### 1.1 Purpose

This document establishes the FedRAMP Moderate Design Alignment Package for MacTech Solutions. This package demonstrates how the organization's existing CMMC 2.0 Level 2 cybersecurity controls and architecture align with FedRAMP Moderate baseline expectations.

**Critical Statement:** This is **design alignment documentation only**, not FedRAMP authorization. MacTech Solutions does not claim FedRAMP authorization, certification, approval, or compliance. This documentation demonstrates how existing control design aligns with FedRAMP Moderate baseline expectations to support alignment claims.

### 1.2 Scope

This FedRAMP Moderate Design Alignment Package covers:

- **System:** MacTech Solutions Application (CMMC 2.0 Level 2 CUI enclave)
- **Baseline:** FedRAMP Moderate (NIST SP 800-53 Rev. 5)
- **Control Baseline:** NIST SP 800-171 Rev. 2 (110 controls) as implemented for CMMC 2.0 Level 2
- **Alignment Type:** Design alignment (control design intent, not operating effectiveness assessment)
- **Alignment Approach:** Mapping existing implemented controls to FedRAMP Moderate baseline expectations

### 1.3 Relationship to Existing Compliance Artifacts

This FedRAMP Moderate Design Alignment Package is **derived from and dependent upon** the following existing compliance artifacts:

**Primary References:**
- **System Security Plan (SSP):** `../cmmc/level2/01-system-scope/MAC-IT-304_System_Security_Plan.md`
- **System Architecture:** `../cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md`
- **System Control Traceability Matrix (SCTM):** `../cmmc/level2/04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- **NIST CSF 2.0 Profile:** `../nist-csf-2.0/csf-profile-overview.md`
- **Inherited Controls Documentation:** `../cmmc/level2/03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md`

**Supporting Documentation:**
- Policies and Procedures: `../cmmc/level2/02-policies-and-procedures/`
- Evidence Documents: `../cmmc/level2/05-evidence/`
- Plan of Action and Milestones (POA&M): `../cmmc/level2/04-self-assessment/MAC-AUD-405_POA&M_Tracking_Log.md`

**Important:** This FedRAMP alignment documentation does **not** replace, supersede, or modify any existing CMMC Level 2 or CSF 2.0 documentation. It provides an additional lens through which existing controls can be understood in the context of FedRAMP Moderate baseline expectations.

---

## 2. Framework Structure and Relationship

### 2.1 FedRAMP Moderate Baseline

**FedRAMP Moderate:**
- Based on NIST SP 800-53 Rev. 5
- Moderate impact level (at least one security objective rated Moderate, none High)
- Most common FedRAMP authorization level (approximately 73% of authorized cloud service offerings)
- Default authorization tier for cloud systems handling Controlled Unclassified Information (CUI)

**Control Families:**
FedRAMP Moderate baseline includes controls from the following NIST 800-53 Rev. 5 control families:
- AC (Access Control)
- IA (Identification and Authentication)
- AU (Audit and Accountability)
- CM (Configuration Management)
- IR (Incident Response)
- CP (Contingency Planning)
- MA (Maintenance)
- MP (Media Protection)
- PS (Personnel Security)
- PE (Physical and Environmental Protection)
- PL (Planning)
- RA (Risk Assessment)
- SA (System and Services Acquisition)
- SC (System and Communications Protection)
- SI (System and Information Integrity)
- CA (Security Assessment and Authorization)
- PM (Program Management)

### 2.2 NIST 800-171 to NIST 800-53 Relationship

**Mapping Relationship:**
NIST SP 800-171 controls are derived from NIST SP 800-53 controls, tailored for non-federal systems handling CUI. The relationship is:

- **NIST 800-171** extracts relevant portions of **NIST 800-53** controls applicable to CUI protection
- **NIST 800-53** provides the broader control framework from which 800-171 requirements are derived
- Many NIST 800-171 controls map directly to corresponding NIST 800-53 controls
- Some NIST 800-53 controls may not have direct 800-171 equivalents (documented as gaps)

**Example Mappings:**
- NIST 800-171 Control 3.1.1 (Limit system access) → NIST 800-53 AC-3 (Access Enforcement)
- NIST 800-171 Control 3.5.3 (MFA for privileged accounts) → NIST 800-53 IA-2 (1) (Multifactor Authentication)
- NIST 800-171 Control 3.3.1 (Create and retain audit logs) → NIST 800-53 AU-2 (Audit Events)

**Important Note:** Satisfaction of a NIST 800-171 requirement does not automatically mean the full corresponding NIST 800-53 control has been met, since some control elements not essential to CUI protection are excluded from 800-171. This alignment documentation describes design intent alignment, not full control satisfaction.

---

## 3. Statement of Management Intent and Governance

### 3.1 Management Intent

MacTech Solutions management has established this FedRAMP Moderate Design Alignment Package to:

1. **Demonstrate Design Alignment:** Show how existing CMMC Level 2 controls align with FedRAMP Moderate baseline expectations
2. **Support Business Development:** Enable accurate representation of security architecture in proposals and customer communications
3. **Enable Framework Understanding:** Provide a framework for evaluating security posture in the context of FedRAMP expectations
4. **Facilitate Communication:** Use common FedRAMP terminology when engaging with civilian agencies and prime contractors

### 3.2 Governance

**Package Owner:** MacTech Solutions Compliance Team  
**Review Schedule:** Annual review, or upon significant system changes  
**Approval Authority:** System Administrator / Compliance Officer  
**Maintenance Responsibility:** Compliance Team

**Governance Principles:**
- All FedRAMP alignment claims must be traceable to existing CMMC Level 2 controls
- No new mandatory controls or POA&Ms are introduced through this package
- Package updates must maintain consistency with existing CMMC and CSF documentation
- Changes to this package require review and approval per Configuration Management Policy

### 3.3 Relationship to CMMC Level 2 and CSF 2.0

**Primary Compliance Framework:** CMMC 2.0 Level 2 (NIST SP 800-171 Rev. 2)

**Supporting Frameworks:**
- **NIST CSF 2.0:** Alignment profile documenting how controls support CSF outcomes
- **FedRAMP Moderate:** Design alignment documentation demonstrating how controls align with FedRAMP baseline expectations

**Key Principles:**
- CMMC Level 2 remains the authoritative compliance framework for DoD contracts
- CSF 2.0 alignment is derived from existing CMMC implementation
- FedRAMP Moderate alignment is derived from existing CMMC implementation
- Neither CSF 2.0 nor FedRAMP alignment introduces new requirements beyond CMMC Level 2
- All alignment claims are supported by existing CMMC evidence

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

### 4.2 FedRAMP Moderate Design Alignment Status

Based on the mapping of existing CMMC Level 2 controls to FedRAMP Moderate baseline expectations:

- **Control Families Addressed:** All applicable FedRAMP Moderate control families
- **Design Alignment Approach:** Existing controls support FedRAMP Moderate baseline expectations across control families
- **Alignment Type:** Design intent alignment (not operating effectiveness assessment)
- **Target State:** Aligned (not authorized or certified)

---

## 5. Alignment Methodology

### 5.1 Mapping Approach

The mapping from NIST 800-171 controls to FedRAMP Moderate (NIST 800-53) controls follows these principles:

1. **Direct Mapping:** Many NIST 800-171 controls map directly to corresponding NIST 800-53 controls
2. **Design Intent:** Map controls based on design intent and control objectives, not just control titles
3. **Multiple Mappings:** One NIST 800-171 control may support multiple NIST 800-53 controls
4. **One-to-Many:** One NIST 800-53 control may be supported by multiple NIST 800-171 controls
5. **Status Preservation:** Implementation status (Implemented/Inherited/POA&M/Not Applicable) is preserved from SCTM
6. **Evidence Traceability:** All FedRAMP alignment claims reference existing CMMC evidence documents

### 5.2 Design Alignment vs. Operating Effectiveness

**Design Alignment:**
- Documents how control design aligns with FedRAMP Moderate baseline expectations
- Describes control intent and design approach
- References existing policies, procedures, and implementation artifacts
- Demonstrates architectural alignment with FedRAMP expectations

**Not Operating Effectiveness:**
- This documentation does not assess operating effectiveness
- This documentation does not claim control testing or validation
- This documentation does not represent a FedRAMP security assessment
- This documentation does not support FedRAMP authorization claims

### 5.3 Mapping Strategy

**High-Level Mapping:**
- **Access Control (AC) controls** → FedRAMP AC family (NIST 800-53 AC controls)
- **Identification and Authentication (IA) controls** → FedRAMP IA family (NIST 800-53 IA controls)
- **Audit and Accountability (AU) controls** → FedRAMP AU family (NIST 800-53 AU controls)
- **Configuration Management (CM) controls** → FedRAMP CM family (NIST 800-53 CM controls)
- **Incident Response (IR) controls** → FedRAMP IR family (NIST 800-53 IR controls)
- **System and Communications Protection (SC) controls** → FedRAMP SC family (NIST 800-53 SC controls)
- **System and Information Integrity (SI) controls** → FedRAMP SI family (NIST 800-53 SI controls)

**Detailed mappings are provided in:**
- `fedramp-control-family-alignment.md` - Control family-by-family mapping
- `system-boundary-and-architecture.md` - Architecture alignment
- `inherited-controls-and-external-services.md` - External service dependencies

---

## 6. Limitations and Disclaimers

### 6.1 Design Alignment, Not Authorization

**This package documents design alignment, not FedRAMP authorization.**

- MacTech Solutions does **not** claim to be "FedRAMP authorized"
- MacTech Solutions does **not** claim to be "FedRAMP certified"
- MacTech Solutions does **not** claim to be "FedRAMP approved"
- MacTech Solutions does **not** claim to be "FedRAMP compliant"
- MacTech Solutions does **not** claim to "meet FedRAMP requirements"

**Approved Language:**
- "MacTech Solutions' security architecture and control design are aligned with the FedRAMP Moderate baseline"
- "Our system design is informed by FedRAMP Moderate requirements"
- "Our CMMC Level 2 controls map to FedRAMP Moderate baseline expectations"

See `fedramp-claim-language.md` for complete approved and prohibited language.

### 6.2 Design Intent vs. Operating Effectiveness

**This package documents design intent, not operating effectiveness:**

- Design alignment means control design supports FedRAMP Moderate expectations
- Design alignment does not mean controls have been tested for operating effectiveness
- Design alignment does not mean controls meet all FedRAMP Moderate requirements
- Design alignment demonstrates architectural alignment, not authorization readiness

### 6.3 Dependencies

This FedRAMP Moderate Design Alignment Package is:

- **Derived from** existing CMMC Level 2 implementation
- **Dependent upon** the accuracy and completeness of CMMC documentation
- **Subject to change** as CMMC implementation evolves
- **Not a substitute** for FedRAMP authorization or security assessment

---

## 7. Package Components

This FedRAMP Moderate Design Alignment Package consists of:

1. **Overview** (this document) - Purpose, scope, and governance
2. **System Boundary and Architecture** (`system-boundary-and-architecture.md`) - System boundary, architecture, and trust boundaries
3. **Control Family Alignment** (`fedramp-control-family-alignment.md`) - Detailed mapping of controls to FedRAMP Moderate families
4. **Inherited Controls and External Services** (`inherited-controls-and-external-services.md`) - External service dependencies and inherited controls
5. **Continuous Monitoring Concept** (`continuous-monitoring-concept.md`) - Conceptual continuous monitoring approach
6. **Claim Language** (`fedramp-claim-language.md`) - Approved language for proposals and customer communications

---

## 8. Document Control

### 8.1 Version History

- **Version 1.0 (2026-01-25):** Initial FedRAMP Moderate Design Alignment Package creation

### 8.2 Review and Maintenance

**Review Schedule:**
- Annual review (scheduled)
- Review upon significant system changes
- Review upon CMMC documentation updates

**Next Review Date:** 2027-01-25

**Maintenance Responsibility:** Compliance Team

### 8.3 Related Documents

- System Boundary and Architecture: `system-boundary-and-architecture.md`
- Control Family Alignment: `fedramp-control-family-alignment.md`
- Inherited Controls: `inherited-controls-and-external-services.md`
- Continuous Monitoring: `continuous-monitoring-concept.md`
- Claim Language: `fedramp-claim-language.md`
- CMMC SSP: `../cmmc/level2/01-system-scope/MAC-IT-304_System_Security_Plan.md`
- CMMC SCTM: `../cmmc/level2/04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- CSF 2.0 Profile: `../nist-csf-2.0/csf-profile-overview.md`

---

## 9. References

### 9.1 FedRAMP and NIST Publications

- FedRAMP Moderate Baseline: NIST SP 800-53 Rev. 5 controls
- NIST SP 800-53 Rev. 5: Security and Privacy Controls for Information Systems and Organizations
- NIST SP 800-171 Rev. 2: Protecting Controlled Unclassified Information in Nonfederal Systems and Organizations
- FedRAMP.gov: Official FedRAMP documentation and templates

### 9.2 Internal References

- CMMC 2.0 Level 2 Executive Attestation
- System Security Plan (SSP)
- System Control Traceability Matrix (SCTM)
- Plan of Action and Milestones (POA&M)
- NIST CSF 2.0 Profile

---

**Document Status:** This document is maintained under configuration control and is part of the MacTech Solutions compliance documentation package.

**Classification:** Internal Use

**Last Updated:** 2026-01-25

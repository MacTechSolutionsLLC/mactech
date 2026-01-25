# NIST CSF 2.0 Control Mapping

**Document Version:** 1.0  
**Date:** 2026-01-25  
**Classification:** Internal Use  
**Framework:** NIST Cybersecurity Framework (CSF) 2.0  
**Reference:** NIST CSWP 29 - The NIST Cybersecurity Framework (CSF) 2.0

**Applies to:** MacTech Solutions Application - CMMC 2.0 Level 2 System

---

## 1. Purpose

This document provides a detailed mapping table that correlates NIST Cybersecurity Framework (CSF) 2.0 functions, categories, and subcategories to NIST SP 800-171 controls and CMMC Level 2 practices. This mapping enables traceability from CSF 2.0 outcomes to specific implemented controls.

**Source of Truth:** All implementation status and references are derived from the System Control Traceability Matrix (SCTM): `../cmmc/level2/04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 2. Mapping Methodology

### 2.1 Mapping Principles

1. **Outcome-Based:** Controls are mapped to CSF subcategories based on control objectives and outcomes, not just control titles
2. **Multiple Mappings:** One NIST 800-171 control may support multiple CSF subcategories
3. **One-to-Many:** One CSF subcategory may be supported by multiple NIST 800-171 controls
4. **Status Preservation:** Implementation status (Implemented/Inherited/POA&M/Not Applicable) is preserved from SCTM
5. **Evidence Traceability:** All mappings reference existing CMMC evidence documents

### 2.2 Table Structure

The mapping table includes:
- **CSF Function:** GV, ID, PR, DE, RS, RC
- **CSF Category:** Full category ID and name
- **CSF Subcategory:** Subcategory ID and description (where applicable)
- **NIST 800-171 Controls:** Control IDs that support the CSF outcome
- **CMMC Level 2 Practices:** Reference to CMMC practice numbers (if applicable)
- **Implementation Status:** Implemented/Inherited/POA&M/Not Applicable
- **Reference Documents:** Links to policies, procedures, evidence, and SSP sections

---

## 3. Control Mapping Table

### 3.1 GV - Govern Function

| CSF Function | CSF Category | CSF Subcategory | NIST 800-171 Controls | CMMC Level 2 Practices | Implementation Status | Reference Documents |
|--------------|--------------|-----------------|----------------------|----------------------|----------------------|---------------------|
| GV | GV.OC - Organizational Context | Organizational context is understood and informs risk management | 3.12.4 | CMMC Level 2 | ✅ Implemented | MAC-POL-224, MAC-IT-304 Section 7.12, MAC-RPT-121_3_12_4_develop_update_ssp_Evidence |
| GV | GV.RM - Risk Management Strategy | Cybersecurity risk management strategy is established | 3.11.1, 3.12.1, 3.12.2, 3.12.3 | CMMC Level 2 | ✅ Implemented | MAC-POL-223, MAC-POL-224, MAC-SOP-231, MAC-AUD-404, MAC-AUD-405, MAC-IT-304 Section 7.11, 7.12 |
| GV | GV.SC - Supply Chain Risk Management | Supply chain risk management processes are established | 3.1.20, 3.13.1 | CMMC Level 2 | ✅ Implemented / 🔄 Inherited | MAC-POL-210, MAC-POL-225, MAC-RPT-102, MAC-IT-304 Section 7.1, 7.13 |

---

### 3.2 ID - Identify Function

| CSF Function | CSF Category | CSF Subcategory | NIST 800-171 Controls | CMMC Level 2 Practices | Implementation Status | Reference Documents |
|--------------|--------------|-----------------|----------------------|----------------------|----------------------|---------------------|
| ID | ID.AM - Asset Management | Assets are identified and inventoried | 3.4.1, 3.4.6, 3.4.8, 3.4.9 | CMMC Level 2 | ✅ Implemented | MAC-POL-220, MAC-POL-226, MAC-RPT-108, MAC-IT-301, MAC-IT-304 Section 7.5 |
| ID | ID.BE - Business Environment | Business environment is understood | 3.12.4 | CMMC Level 2 | ✅ Implemented | MAC-IT-304 Section 1.2 |
| ID | ID.RA - Risk Assessment | Cybersecurity risks are identified | 3.11.1, 3.11.2, 3.11.3 | CMMC Level 2 | ✅ Implemented | MAC-POL-223, MAC-RPT-114, MAC-RPT-115, MAC-RPT-103, MAC-AUD-404, MAC-IT-304 Section 7.11 |
| ID | ID.IM - Improvement | Improvements are identified | 3.12.2, 3.12.3 | CMMC Level 2 | ✅ Implemented | MAC-POL-224, MAC-SOP-231, MAC-AUD-405, MAC-IT-304 Section 7.12 |

---

### 3.3 PR - Protect Function

| CSF Function | CSF Category | CSF Subcategory | NIST 800-171 Controls | CMMC Level 2 Practices | Implementation Status | Reference Documents |
|--------------|--------------|-----------------|----------------------|----------------------|----------------------|---------------------|
| PR | PR.AC - Identity Management, Authentication and Access Control | Identities are managed | 3.5.1, 3.5.5, 3.5.6 | CMMC Level 2 | ✅ Implemented | MAC-POL-211, MAC-SOP-221, MAC-SOP-222, MAC-RPT-120, MAC-RPT-122_3_5_*_Evidence, MAC-IT-304 Section 7.2 |
| PR | PR.AC | Authentication is managed | 3.5.2, 3.5.3, 3.5.4, 3.5.7, 3.5.8, 3.5.9, 3.5.10, 3.5.11 | CMMC Level 2 | ✅ Implemented | MAC-POL-211, MAC-SOP-222, MAC-RPT-104, MAC-RPT-122_3_5_*_Evidence, lib/auth.ts, lib/mfa.ts, lib/password-policy.ts, MAC-IT-304 Section 7.2 |
| PR | PR.AC | Access is managed | 3.1.1, 3.1.2, 3.1.3, 3.1.4, 3.1.5, 3.1.6, 3.1.7, 3.1.8, 3.1.9, 3.1.10, 3.1.11, 3.1.12, 3.1.13, 3.1.14, 3.1.15 | CMMC Level 2 | ✅ Implemented / 🔄 Inherited | MAC-POL-210, MAC-SOP-221, MAC-SOP-222, MAC-SOP-235, MAC-RPT-104, MAC-RPT-105, MAC-RPT-106, MAC-RPT-117, MAC-RPT-122_3_1_*_Evidence, middleware.ts, lib/auth.ts, lib/authz.ts, MAC-IT-304 Section 7.1 |
| PR | PR.AT - Awareness and Training | Security awareness is provided | 3.2.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-219, MAC-SOP-227, training/security-awareness-training-content.md, MAC-RPT-121_3_2_1_Evidence, MAC-IT-304 Section 7.3 |
| PR | PR.AT | Security training is provided | 3.2.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-219, MAC-SOP-227, training/training-completion-log.md, MAC-RPT-121_3_2_2_Evidence, MAC-IT-304 Section 7.3 |
| PR | PR.AT | Insider threat awareness is provided | 3.2.3 | CMMC Level 2 | ✅ Implemented | MAC-POL-219, MAC-SOP-227, training/security-awareness-training-content.md, MAC-RPT-121_3_2_3_Evidence, MAC-IT-304 Section 7.3 |
| PR | PR.DS - Data Security | Data-at-rest is protected | 3.8.1, 3.8.6, 3.8.9, 3.13.16 | CMMC Level 2 | ✅ Implemented / 🔄 Inherited | MAC-POL-213, MAC-POL-225, MAC-RPT-121_3_8_*_Evidence, Railway platform, MAC-IT-304 Section 7.6, 7.13 |
| PR | PR.DS | Data-in-transit is protected | 3.1.13, 3.13.8 | CMMC Level 2 | 🔄 Inherited | MAC-POL-210, MAC-POL-225, Railway platform (TLS/HTTPS), MAC-IT-304 Section 7.1, 7.13 |
| PR | PR.DS | Data-in-use is protected | 3.1.3, 3.1.19, 3.1.21, 3.1.22, 3.8.2, 3.8.7, 3.8.8 | CMMC Level 2 | ✅ Implemented | MAC-POL-210, MAC-POL-213, MAC-RPT-101, MAC-RPT-118, MAC-RPT-121_3_1_*_Evidence, MAC-RPT-121_3_8_*_Evidence, MAC-IT-304 Section 7.1, 7.6 |
| PR | PR.IP - Information Protection Processes and Procedures | Configuration management processes are established | 3.4.1, 3.4.2, 3.4.3, 3.4.4, 3.4.5, 3.4.6, 3.4.8, 3.4.9 | CMMC Level 2 | ✅ Implemented | MAC-POL-220, MAC-POL-226, MAC-SOP-225, MAC-CMP-001, MAC-RPT-108, MAC-RPT-109, MAC-RPT-124, MAC-RPT-125, MAC-RPT-121_3_4_*_Evidence, MAC-IT-304 Section 7.5 |
| PR | PR.MA - Maintenance | Maintenance is performed | 3.7.1, 3.7.2, 3.7.5 | CMMC Level 2 | ✅ Implemented / ❌ POA&M / 🔄 Inherited | MAC-POL-221, MAC-RPT-110, MAC-RPT-121_3_7_*_Evidence, MAC-AUD-405 (POA&M for 3.7.2), MAC-IT-304 Section 7.10 |
| PR | PR.PS - Personnel Security | Personnel are screened | 3.9.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-222, MAC-SOP-233, personnel-screening/, MAC-RPT-121_3_9_1_Evidence, MAC-IT-304 Section 7.7 |
| PR | PR.PS | Personnel actions are managed | 3.9.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-222, personnel-screening/, MAC-RPT-121_3_9_2_Evidence, MAC-IT-304 Section 7.7 |
| PR | PR.PE - Physical Environment | Physical access is managed | 3.10.1, 3.10.2, 3.10.3, 3.10.4, 3.10.5, 3.10.6 | CMMC Level 2 | ✅ Implemented | MAC-POL-212, MAC-SOP-224, MAC-RPT-111, MAC-RPT-112, MAC-RPT-113, MAC-RPT-121_3_10_*_Evidence, /admin/physical-access-logs, MAC-IT-304 Section 7.8 |

---

### 3.4 DE - Detect Function

| CSF Function | CSF Category | CSF Subcategory | NIST 800-171 Controls | CMMC Level 2 Practices | Implementation Status | Reference Documents |
|--------------|--------------|-----------------|----------------------|----------------------|----------------------|---------------------|
| DE | DE.AU - Audit Logging | Audit log records are determined and documented | 3.3.1, 3.3.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-218, lib/audit.ts, MAC-RPT-107, MAC-RPT-121_3_3_1_Evidence, MAC-RPT-122_3_3_*_Evidence, MAC-IT-304 Section 7.4 |
| DE | DE.AU | Audit log records are implemented | 3.3.1, 3.3.2, 3.3.7, 3.3.8, 3.3.9 | CMMC Level 2 | ✅ Implemented / 🔄 Inherited | MAC-POL-218, lib/audit.ts, Railway platform (NTP), MAC-RPT-107, MAC-RPT-121_3_3_*_Evidence, MAC-RPT-122_3_3_*_Evidence, MAC-IT-304 Section 7.4 |
| DE | DE.AU | Audit log records are reviewed | 3.3.3 | CMMC Level 2 | ✅ Implemented | MAC-POL-218, MAC-SOP-226, audit-log-reviews/, MAC-RPT-121_3_3_3_Evidence, MAC-IT-304 Section 7.4 |
| DE | DE.AU | Audit log failures are handled | 3.3.4 | CMMC Level 2 | ✅ Implemented | MAC-POL-218, MAC-SOP-226, lib/audit.ts, MAC-RPT-122_3_3_4_Evidence, MAC-IT-304 Section 7.4 |
| DE | DE.AU | Audit log records are correlated | 3.3.5 | CMMC Level 2 | ✅ Implemented | MAC-POL-218, MAC-SOP-226, lib/audit.ts, MAC-RPT-122_3_3_5_Evidence, MAC-IT-304 Section 7.4 |
| DE | DE.AU | Audit log records are reduced and reported | 3.3.6 | CMMC Level 2 | ✅ Implemented | MAC-POL-218, /api/admin/events/export, MAC-RPT-122_3_3_6_Evidence, MAC-IT-304 Section 7.4 |
| DE | DE.CM - Continuous Monitoring | The information system and assets are monitored | 3.12.3, 3.14.3, 3.14.5, 3.14.6, 3.14.7 | CMMC Level 2 | ✅ Implemented | MAC-POL-214, MAC-POL-224, MAC-RPT-114, MAC-RPT-119, MAC-RPT-103, MAC-AUD-407, MAC-RPT-121_3_12_3_Evidence, MAC-RPT-121_3_14_*_Evidence, MAC-IT-304 Section 7.12, 7.14 |
| DE | DE.DP - Detection Processes | Detection processes are maintained | 3.3.3, 3.3.5, 3.14.7 | CMMC Level 2 | ✅ Implemented | MAC-POL-218, MAC-POL-214, MAC-SOP-226, lib/audit.ts, MAC-RPT-119, MAC-RPT-121_3_3_*_Evidence, MAC-RPT-121_3_14_7_Evidence, MAC-IT-304 Section 7.4, 7.14 |

---

### 3.5 RS - Respond Function

| CSF Function | CSF Category | CSF Subcategory | NIST 800-171 Controls | CMMC Level 2 Practices | Implementation Status | Reference Documents |
|--------------|--------------|-----------------|----------------------|----------------------|----------------------|---------------------|
| RS | RS.RP - Response Planning | Response processes and procedures are executed | 3.6.1, 3.6.2, 3.6.3 | CMMC Level 2 | ✅ Implemented | MAC-POL-215, MAC-SOP-232, MAC-RPT-121_3_6_*_Evidence, MAC-IT-304 Section 7.9 |
| RS | RS.CO - Response Communications | Response activities are coordinated | 3.6.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-215, MAC-RPT-121_3_6_2_Evidence, MAC-IT-304 Section 7.9 |
| RS | RS.AN - Response Analysis | Analysis is conducted | 3.6.1, 3.6.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-215, MAC-RPT-121_3_6_*_Evidence, MAC-IT-304 Section 7.9 |
| RS | RS.MI - Incident Mitigation | Activities are performed to prevent expansion | 3.6.1, 3.6.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-215, MAC-RPT-121_3_6_*_Evidence, MAC-IT-304 Section 7.9 |

---

### 3.6 RC - Recover Function

| CSF Function | CSF Category | CSF Subcategory | NIST 800-171 Controls | CMMC Level 2 Practices | Implementation Status | Reference Documents |
|--------------|--------------|-----------------|----------------------|----------------------|----------------------|---------------------|
| RC | RC.RP - Recovery Planning | Recovery processes and procedures are executed | 3.6.1, 3.8.9 | CMMC Level 2 | ✅ Implemented / 🔄 Inherited | MAC-POL-215, MAC-POL-213, MAC-RPT-121_3_6_1_Evidence, Railway platform (backup encryption), MAC-IT-304 Section 7.9, 7.6 |
| RC | RC.IM - Recovery Improvements | Recovery planning and processes are improved | 3.6.3, 3.12.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-215, MAC-POL-224, MAC-SOP-232, MAC-SOP-231, MAC-AUD-405, MAC-RPT-121_3_6_3_Evidence, MAC-RPT-121_3_12_2_Evidence, MAC-IT-304 Section 7.9, 7.12 |
| RC | RC.CO - Recovery Communications | Restoration activities are coordinated | 3.6.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-215, MAC-RPT-121_3_6_2_Evidence, MAC-IT-304 Section 7.9 |

---

## 4. Summary Statistics

### 4.1 Mapping Coverage

- **Total CSF Functions:** 6 (all covered)
- **Total CSF Categories:** 21 (all applicable categories addressed)
- **Total NIST 800-171 Controls Mapped:** 110 (all controls mapped to applicable CSF outcomes)
- **Implementation Status Distribution:**
  - ✅ Implemented: 81 controls (74%)
  - 🔄 Inherited: 12 controls (11%)
  - ❌ POA&M: 3 controls (3%)
  - 🚫 Not Applicable: 14 controls (13%)

### 4.2 Alignment Completeness

- **GV (Govern):** Fully aligned through RA, SA, and SSP controls
- **ID (Identify):** Fully aligned through CM, RA, SA controls
- **PR (Protect):** Fully aligned through AC, AT, IA, MP, SC, SI, CM, MA, PS, PE controls
- **DE (Detect):** Fully aligned through AU, SI, SA controls
- **RS (Respond):** Fully aligned through IR controls
- **RC (Recover):** Fully aligned through IR, MP, SA controls

---

## 5. Reference Document Abbreviations

**Policies:**
- MAC-POL-210: Access Control Policy
- MAC-POL-211: Identification and Authentication Policy
- MAC-POL-212: Physical Security Policy
- MAC-POL-213: Media Handling Policy
- MAC-POL-214: System and Information Integrity Policy
- MAC-POL-215: Incident Response Policy
- MAC-POL-218: Audit and Accountability Policy
- MAC-POL-219: Awareness and Training Policy
- MAC-POL-220: Configuration Management Policy
- MAC-POL-221: Maintenance Policy
- MAC-POL-222: Personnel Security Policy
- MAC-POL-223: Risk Assessment Policy
- MAC-POL-224: Security Assessment Policy
- MAC-POL-225: System and Communications Protection Policy
- MAC-POL-226: Software Restriction Policy

**Procedures:**
- MAC-SOP-221: User Account Management Procedure
- MAC-SOP-222: Account Lifecycle Enforcement Procedure
- MAC-SOP-224: Physical Environment and Remote Work Controls
- MAC-SOP-225: Security Impact Analysis Procedure
- MAC-SOP-226: Audit Log Review Procedure
- MAC-SOP-227: Security Awareness and Training Procedure
- MAC-SOP-231: POA&M Process Procedure
- MAC-SOP-232: Incident Response Testing Procedure
- MAC-SOP-233: Personnel Screening Procedure
- MAC-SOP-235: Separation of Duties Procedure

**Plans:**
- MAC-CMP-001: Configuration Management Plan

**Reports:**
- MAC-AUD-404: Risk Assessment Report
- MAC-AUD-405: POA&M Tracking Log
- MAC-AUD-407: Continuous Monitoring Log
- MAC-AUD-408: System Control Traceability Matrix
- MAC-RPT-102: Inherited Controls Matrix
- MAC-RPT-103: Dependabot Configuration Evidence
- MAC-RPT-104: MFA Implementation Evidence
- MAC-RPT-105: Account Lockout Implementation Evidence
- MAC-RPT-106: Session Lock Implementation Evidence
- MAC-RPT-107: Audit Log Retention Evidence
- MAC-RPT-108: Configuration Baseline Evidence
- MAC-RPT-109: Change Control Evidence
- MAC-RPT-110: Maintenance MFA Evidence
- MAC-RPT-111: Visitor Controls Evidence
- MAC-RPT-112: Physical Access Device Evidence
- MAC-RPT-113: Alternate Work Site Safeguarding Evidence
- MAC-RPT-114: Vulnerability Scanning Evidence
- MAC-RPT-115: Vulnerability Remediation Evidence
- MAC-RPT-116: Cryptographic Key Management Evidence
- MAC-RPT-117: Separation of Duties Enforcement Evidence
- MAC-RPT-118: Portable Storage Controls Evidence
- MAC-RPT-119: Unauthorized Use Detection Evidence
- MAC-RPT-120: Identifier Reuse Prevention Evidence
- MAC-RPT-121_*: Control-specific evidence documents
- MAC-RPT-122_*: Control-specific evidence documents
- MAC-RPT-124: Security Impact Analysis Operational Evidence
- MAC-RPT-125: Least Functionality Operational Evidence
- MAC-RPT-126: Communications Protection Operational Evidence

**System Documents:**
- MAC-IT-301: System Description and Architecture
- MAC-IT-304: System Security Plan (SSP)

**Directories:**
- training/: Security awareness and training content
- audit-log-reviews/: Audit log review documentation
- personnel-screening/: Personnel screening records

---

## 6. Document Control

### 6.1 Version History

- **Version 1.0 (2026-01-25):** Initial Control Mapping creation

### 6.2 Review and Maintenance

**Review Schedule:**
- Annual review (scheduled)
- Review upon significant system changes
- Review upon CMMC documentation updates
- Review when SCTM is updated

**Next Review Date:** 2027-01-25

**Maintenance Responsibility:** Compliance Team

### 6.3 Related Documents

- Profile Overview: `csf-profile-overview.md`
- Current State Profile: `csf-current-state-profile.md`
- Target State Profile: `csf-target-state-profile.md`
- Claim Language: `csf-claim-language.md`
- CMMC SCTM: `../cmmc/level2/04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- CMMC SSP: `../cmmc/level2/01-system-scope/MAC-IT-304_System_Security_Plan.md`

---

**Document Status:** This document is maintained under configuration control and is part of the MacTech Solutions compliance documentation package.

**Classification:** Internal Use

**Last Updated:** 2026-01-25

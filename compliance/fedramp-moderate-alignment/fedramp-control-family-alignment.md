# FedRAMP Moderate Control Family Alignment

**Document Version:** 1.0  
**Date:** 2026-01-25  
**Classification:** Internal Use  
**Framework:** FedRAMP Moderate Baseline  
**Reference:** NIST SP 800-53 Rev. 5, FedRAMP Moderate Baseline

**Applies to:** MacTech Solutions Application - CMMC 2.0 Level 2 System

---

## 1. Purpose

This document provides a structured mapping that correlates FedRAMP Moderate baseline controls (NIST SP 800-53 Rev. 5) to existing NIST SP 800-171 controls and CMMC Level 2 practices. This mapping demonstrates design alignment at the control family level.

**Source of Truth:** All implementation status and references are derived from the System Control Traceability Matrix (SCTM): `../cmmc/level2/04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

**Important:** This document describes design intent alignment, not operating effectiveness assessment. It demonstrates how existing control design aligns with FedRAMP Moderate baseline expectations.

---

## 2. Mapping Methodology

### 2.1 Mapping Principles

1. **Direct Relationship:** NIST 800-171 controls are derived from NIST 800-53, so many map directly
2. **Design Intent:** Map controls based on control objectives and design intent
3. **Multiple Mappings:** One NIST 800-171 control may support multiple NIST 800-53 controls
4. **One-to-Many:** One NIST 800-53 control may be supported by multiple NIST 800-171 controls
5. **Status Preservation:** Implementation status (Implemented/Inherited/POA&M/Not Applicable) is preserved from SCTM
6. **Evidence Traceability:** All mappings reference existing CMMC evidence documents

### 2.2 Design Alignment Approach

**Design Alignment:**
- Documents how control design aligns with FedRAMP Moderate baseline expectations
- Describes control intent and design approach
- References existing policies, procedures, and implementation artifacts
- Demonstrates architectural alignment with FedRAMP expectations

**Not Operating Effectiveness:**
- This mapping does not assess operating effectiveness
- This mapping does not claim control testing or validation
- This mapping does not represent a FedRAMP security assessment

---

## 3. Control Family Mappings

### 3.1 AC - Access Control

**FedRAMP Moderate Controls:** AC-1 through AC-25 (and enhancements)

**NIST 800-171 Controls Mapped:** 3.1.1 through 3.1.22

| FedRAMP Control (NIST 800-53) | NIST 800-171 Control | CMMC Level 2 Practice | Implementation Status | Reference Documents |
|-------------------------------|---------------------|----------------------|----------------------|---------------------|
| AC-2 (Account Management) | 3.5.1, 3.5.5, 3.5.6 | CMMC Level 2 | ✅ Implemented | MAC-POL-211, MAC-SOP-221, MAC-SOP-222, MAC-IT-304 Section 7.2 |
| AC-3 (Access Enforcement) | 3.1.1, 3.1.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-210, MAC-SOP-222, middleware.ts, lib/authz.ts, MAC-IT-304 Section 7.1 |
| AC-4 (Information Flow Enforcement) | 3.1.3 | CMMC Level 2 | ✅ Implemented | MAC-POL-210, middleware.ts, lib/authz.ts, MAC-IT-304 Section 7.1 |
| AC-5 (Separation of Duties) | 3.1.4 | CMMC Level 2 | ✅ Implemented | MAC-POL-210, MAC-SOP-235, middleware.ts, lib/authz.ts, MAC-IT-304 Section 7.1 |
| AC-6 (Least Privilege) | 3.1.5, 3.1.6 | CMMC Level 2 | ✅ Implemented | MAC-POL-210, MAC-SOP-222, middleware.ts, MAC-IT-304 Section 7.1 |
| AC-7 (Unsuccessful Logon Attempts) | 3.1.8 | CMMC Level 2 | ✅ Implemented | MAC-POL-210, MAC-SOP-222, lib/auth.ts, MAC-IT-304 Section 7.1 |
| AC-8 (System Use Notification) | 3.1.9 | CMMC Level 2 | ✅ Implemented | MAC-POL-210, User agreements, MAC-IT-304 Section 7.1 |
| AC-11 (Session Lock) | 3.1.10 | CMMC Level 2 | ✅ Implemented | MAC-POL-210, components/SessionLock.tsx, MAC-IT-304 Section 7.1 |
| AC-12 (Session Termination) | 3.1.11 | CMMC Level 2 | ✅ Implemented | MAC-POL-210, lib/auth.ts, MAC-IT-304 Section 7.1 |
| AC-17 (Remote Access) | 3.1.12, 3.1.13, 3.1.14, 3.1.15 | CMMC Level 2 | ✅ Implemented / 🔄 Inherited | MAC-POL-210, lib/audit.ts, Railway platform, MAC-IT-304 Section 7.1 |
| AC-18 (Wireless Access) | 3.1.16, 3.1.17 | CMMC Level 2 | 🚫 Not Applicable | System architecture (cloud-only) |
| AC-19 (Access Control for Mobile Devices) | 3.1.18, 3.1.19 | CMMC Level 2 | ✅ Implemented | MAC-POL-210, MAC-IT-301, MAC-IT-304 Section 7.1 |
| AC-20 (Use of External Information Systems) | 3.1.20, 3.1.22 | CMMC Level 2 | ✅ Implemented | MAC-POL-210, MAC-IT-304, MAC-IT-304 Section 7.1 |
| AC-21 (Information Sharing) | 3.1.21 | CMMC Level 2 | ✅ Implemented | MAC-POL-213, MAC-IT-301, MAC-IT-304 Section 7.1 |

**Design Alignment Summary:**
Access control design aligns with FedRAMP Moderate AC family expectations through role-based access control, least privilege enforcement, session management, and comprehensive access logging. All access control requirements are addressed through existing CMMC Level 2 controls.

---

### 3.2 IA - Identification and Authentication

**FedRAMP Moderate Controls:** IA-1 through IA-12 (and enhancements)

**NIST 800-171 Controls Mapped:** 3.5.1 through 3.5.11

| FedRAMP Control (NIST 800-53) | NIST 800-171 Control | CMMC Level 2 Practice | Implementation Status | Reference Documents |
|-------------------------------|---------------------|----------------------|----------------------|---------------------|
| IA-1 (Identification and Authentication Policy) | 3.5.1, 3.5.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-211, MAC-SOP-221, MAC-SOP-222, MAC-IT-304 Section 7.2 |
| IA-2 (Identification and Authentication) | 3.5.1, 3.5.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-211, lib/auth.ts, NextAuth.js, MAC-IT-304 Section 7.2 |
| IA-2 (1) (Multifactor Authentication) | 3.5.3 | CMMC Level 2 | ✅ Implemented | MAC-POL-211, lib/mfa.ts, MAC-RPT-104, MAC-IT-304 Section 7.2 |
| IA-3 (Device Identification and Authentication) | 3.1.20 | CMMC Level 2 | ✅ Implemented | MAC-POL-210, MAC-IT-304, MAC-IT-304 Section 7.1 |
| IA-4 (Identifier Management) | 3.5.1, 3.5.5 | CMMC Level 2 | ✅ Implemented | MAC-POL-211, MAC-SOP-221, MAC-IT-304 Section 7.2 |
| IA-5 (Authenticator Management) | 3.5.7, 3.5.8, 3.5.9, 3.5.10 | CMMC Level 2 | ✅ Implemented | MAC-POL-211, lib/password-policy.ts, lib/auth.ts, MAC-IT-304 Section 7.2 |
| IA-6 (Authenticator Feedback) | 3.5.11 | CMMC Level 2 | ✅ Implemented | MAC-POL-211, lib/auth.ts, MAC-IT-304 Section 7.2 |
| IA-7 (Cryptographic Module Authentication) | 3.5.4 | CMMC Level 2 | ✅ Implemented | MAC-POL-211, lib/auth.ts, MAC-IT-304 Section 7.2 |
| IA-8 (Identification and Authentication - Non-Organizational Users) | 3.5.1, 3.5.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-211, lib/auth.ts, MAC-IT-304 Section 7.2 |
| IA-11 (Re-Authentication) | 3.1.11 | CMMC Level 2 | ✅ Implemented | MAC-POL-210, lib/auth.ts, MAC-IT-304 Section 7.1 |
| IA-12 (Identity Proofing) | 3.5.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-211, MAC-SOP-221, MAC-IT-304 Section 7.2 |

**Design Alignment Summary:**
Identification and authentication design aligns with FedRAMP Moderate IA family expectations through comprehensive user identification, password-based authentication with MFA for privileged accounts, password policy enforcement, and authenticator management. All IA requirements are addressed through existing CMMC Level 2 controls.

---

### 3.3 AU - Audit and Accountability

**FedRAMP Moderate Controls:** AU-1 through AU-16 (and enhancements)

**NIST 800-171 Controls Mapped:** 3.3.1 through 3.3.9

| FedRAMP Control (NIST 800-53) | NIST 800-171 Control | CMMC Level 2 Practice | Implementation Status | Reference Documents |
|-------------------------------|---------------------|----------------------|----------------------|---------------------|
| AU-1 (Audit and Accountability Policy) | 3.3.1, 3.3.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-218, MAC-IT-304 Section 7.4 |
| AU-2 (Audit Events) | 3.3.1, 3.3.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-218, lib/audit.ts, MAC-IT-304 Section 7.4 |
| AU-3 (Content of Audit Records) | 3.3.1, 3.3.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-218, lib/audit.ts, MAC-IT-304 Section 7.4 |
| AU-4 (Audit Storage Capacity) | 3.3.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-218, lib/audit.ts, MAC-IT-304 Section 7.4 |
| AU-5 (Response to Audit Processing Failures) | 3.3.4 | CMMC Level 2 | ✅ Implemented | MAC-POL-218, MAC-SOP-226, lib/audit.ts, MAC-IT-304 Section 7.4 |
| AU-6 (Audit Review, Analysis, and Reporting) | 3.3.3, 3.3.5, 3.3.6 | CMMC Level 2 | ✅ Implemented | MAC-POL-218, MAC-SOP-226, lib/audit.ts, MAC-IT-304 Section 7.4 |
| AU-7 (Audit Reduction and Report Generation) | 3.3.6 | CMMC Level 2 | ✅ Implemented | MAC-POL-218, /api/admin/events/export, MAC-IT-304 Section 7.4 |
| AU-8 (Time Stamps) | 3.3.7 | CMMC Level 2 | 🔄 Inherited | MAC-POL-218, Railway platform (NTP), MAC-IT-304 Section 7.4 |
| AU-9 (Protection of Audit Information) | 3.3.8 | CMMC Level 2 | ✅ Implemented | MAC-POL-218, lib/audit.ts, MAC-IT-304 Section 7.4 |
| AU-10 (Non-Repudiation) | 3.3.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-218, lib/audit.ts, MAC-IT-304 Section 7.4 |
| AU-11 (Audit Record Retention) | 3.3.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-218, lib/audit.ts, MAC-RPT-107, MAC-IT-304 Section 7.4 |
| AU-12 (Audit Generation) | 3.3.1, 3.3.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-218, lib/audit.ts, MAC-IT-304 Section 7.4 |
| AU-13 (Monitoring for Information Disclosure) | 3.3.5 | CMMC Level 2 | ✅ Implemented | MAC-POL-218, lib/audit.ts, MAC-IT-304 Section 7.4 |
| AU-14 (Session Audit) | 3.3.1, 3.3.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-218, lib/audit.ts, MAC-IT-304 Section 7.4 |
| AU-16 (Cross-Organizational Auditing) | 3.3.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-218, lib/audit.ts, MAC-IT-304 Section 7.4 |

**Design Alignment Summary:**
Audit and accountability design aligns with FedRAMP Moderate AU family expectations through comprehensive audit logging, 90-day retention, audit log review procedures, failure alerts, and audit record correlation. All AU requirements are addressed through existing CMMC Level 2 controls.

---

### 3.4 CM - Configuration Management

**FedRAMP Moderate Controls:** CM-1 through CM-8 (and enhancements)

**NIST 800-171 Controls Mapped:** 3.4.1 through 3.4.9

| FedRAMP Control (NIST 800-53) | NIST 800-171 Control | CMMC Level 2 Practice | Implementation Status | Reference Documents |
|-------------------------------|---------------------|----------------------|----------------------|---------------------|
| CM-1 (Configuration Management Policy) | 3.4.1, 3.4.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-220, MAC-CMP-001, MAC-IT-304 Section 7.5 |
| CM-2 (Baseline Configurations) | 3.4.1, 3.4.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-220, MAC-RPT-108, MAC-IT-304 Section 7.5 |
| CM-3 (Configuration Change Control) | 3.4.3, 3.4.4, 3.4.5 | CMMC Level 2 | ✅ Implemented | MAC-POL-220, MAC-SOP-225, MAC-RPT-109, MAC-IT-304 Section 7.5 |
| CM-4 (Security Impact Analysis) | 3.4.4 | CMMC Level 2 | ✅ Implemented | MAC-POL-220, MAC-SOP-225, MAC-RPT-124, MAC-IT-304 Section 7.5 |
| CM-5 (Access Restrictions for Change) | 3.4.5 | CMMC Level 2 | ✅ Implemented | MAC-POL-220, MAC-RPT-109, MAC-IT-304 Section 7.5 |
| CM-6 (Configuration Settings) | 3.4.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-220, next.config.js, middleware.ts, MAC-IT-304 Section 7.5 |
| CM-7 (Least Functionality) | 3.4.6 | CMMC Level 2 | ✅ Implemented | MAC-POL-220, MAC-IT-301, MAC-RPT-125, MAC-IT-304 Section 7.5 |
| CM-8 (Information System Component Inventory) | 3.4.1, 3.4.8, 3.4.9 | CMMC Level 2 | ✅ Implemented | MAC-POL-220, MAC-POL-226, package.json, MAC-IT-304 Section 7.5 |

**Design Alignment Summary:**
Configuration management design aligns with FedRAMP Moderate CM family expectations through baseline configurations, change control processes, security impact analysis, and configuration settings management. All CM requirements are addressed through existing CMMC Level 2 controls.

---

### 3.5 IR - Incident Response

**FedRAMP Moderate Controls:** IR-1 through IR-10 (and enhancements)

**NIST 800-171 Controls Mapped:** 3.6.1 through 3.6.3

| FedRAMP Control (NIST 800-53) | NIST 800-171 Control | CMMC Level 2 Practice | Implementation Status | Reference Documents |
|-------------------------------|---------------------|----------------------|----------------------|---------------------|
| IR-1 (Incident Response Policy) | 3.6.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-215, MAC-IT-304 Section 7.9 |
| IR-2 (Incident Response Training) | 3.6.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-215, MAC-IT-304 Section 7.9 |
| IR-4 (Incident Handling) | 3.6.1, 3.6.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-215, MAC-IT-304 Section 7.9 |
| IR-5 (Incident Monitoring) | 3.6.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-215, MAC-IT-304 Section 7.9 |
| IR-6 (Incident Reporting) | 3.6.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-215, MAC-IT-304 Section 7.9 |
| IR-7 (Incident Response Assistance) | 3.6.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-215, MAC-IT-304 Section 7.9 |
| IR-8 (Incident Response Plan) | 3.6.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-215, MAC-IT-304 Section 7.9 |
| IR-9 (Information Spillage Response) | 3.6.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-215, MAC-IT-304 Section 7.9 |
| IR-10 (Integrated Information Security Analysis Team) | 3.6.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-215, MAC-IT-304 Section 7.9 |

**Design Alignment Summary:**
Incident response design aligns with FedRAMP Moderate IR family expectations through operational incident-handling capability, incident tracking and documentation, and incident response testing. All IR requirements are addressed through existing CMMC Level 2 controls.

---

### 3.6 CP - Contingency Planning

**FedRAMP Moderate Controls:** CP-1 through CP-13 (and enhancements)

**NIST 800-171 Controls Mapped:** Limited direct mapping (recovery procedures in IR)

**Note:** CMMC Level 2 does not have explicit contingency planning controls, but recovery procedures are included in incident response. Design alignment exists through:
- Recovery procedures in Incident Response Plan
- Backup and recovery processes (inherited from Railway)
- System restoration capabilities

| FedRAMP Control (NIST 800-53) | NIST 800-171 Control | CMMC Level 2 Practice | Implementation Status | Reference Documents |
|-------------------------------|---------------------|----------------------|----------------------|---------------------|
| CP-2 (Contingency Plan) | 3.6.1 (recovery procedures) | CMMC Level 2 | ✅ Implemented | MAC-POL-215, IRP includes recovery, MAC-IT-304 Section 7.9 |
| CP-3 (Contingency Training) | 3.6.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-215, IR training, MAC-IT-304 Section 7.9 |
| CP-4 (Contingency Plan Testing) | 3.6.3 | CMMC Level 2 | ✅ Implemented | MAC-POL-215, MAC-SOP-232, IR testing, MAC-IT-304 Section 7.9 |
| CP-6 (Alternate Storage Site) | 3.8.9 (backup CUI) | CMMC Level 2 | ✅ Implemented | MAC-POL-213, CUI vault backups (FIPS-validated), MAC-IT-304 Section 7.6 |
| CP-7 (Alternate Processing Site) | N/A | CMMC Level 2 | Design consideration | Railway platform redundancy |
| CP-9 (System Backup) | 3.8.9 | CMMC Level 2 | 🔄 Inherited | MAC-POL-213, Railway platform, MAC-IT-304 Section 7.6 |
| CP-10 (System Recovery and Reconstitution) | 3.6.1 (recovery procedures) | CMMC Level 2 | ✅ Implemented | MAC-POL-215, IRP recovery procedures, MAC-IT-304 Section 7.9 |

**Design Alignment Summary:**
Contingency planning design aligns with FedRAMP Moderate CP family expectations through recovery procedures in the Incident Response Plan, backup and recovery processes (inherited from Railway), and system restoration capabilities. Some CP controls may require additional design considerations for full FedRAMP Moderate alignment.

---

### 3.7 MA - Maintenance

**FedRAMP Moderate Controls:** MA-1 through MA-6 (and enhancements)

**NIST 800-171 Controls Mapped:** 3.7.1 through 3.7.6

| FedRAMP Control (NIST 800-53) | NIST 800-171 Control | CMMC Level 2 Practice | Implementation Status | Reference Documents |
|-------------------------------|---------------------|----------------------|----------------------|---------------------|
| MA-1 (Maintenance Policy) | 3.7.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-221, MAC-IT-304 Section 7.10 |
| MA-2 (Controlled Maintenance) | 3.7.1 | CMMC Level 2 | ✅ Implemented / 🔄 Inherited | MAC-POL-221, Railway platform, MAC-IT-304 Section 7.10 |
| MA-3 (Maintenance Tools) | 3.7.2 | CMMC Level 2 | ❌ POA&M | MAC-POL-221, MAC-AUD-405, MAC-IT-304 Section 7.10 |
| MA-4 (Nonlocal Maintenance) | 3.7.5 | CMMC Level 2 | ✅ Implemented (Inherited) | MAC-POL-221, Railway platform MFA, MAC-IT-304 Section 7.10 |
| MA-5 (Maintenance Personnel) | 3.7.6 | CMMC Level 2 | 🚫 Not Applicable | System architecture (cloud-only) |

**Design Alignment Summary:**
Maintenance design aligns with FedRAMP Moderate MA family expectations through maintenance policies, controlled maintenance processes (inherited from Railway), and MFA for nonlocal maintenance. Maintenance tool controls are tracked in POA&M.

---

### 3.8 MP - Media Protection

**FedRAMP Moderate Controls:** MP-1 through MP-8 (and enhancements)

**NIST 800-171 Controls Mapped:** 3.8.1 through 3.8.9

| FedRAMP Control (NIST 800-53) | NIST 800-171 Control | CMMC Level 2 Practice | Implementation Status | Reference Documents |
|-------------------------------|---------------------|----------------------|----------------------|---------------------|
| MP-1 (Media Protection Policy) | 3.8.1, 3.8.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-213, MAC-IT-304 Section 7.6 |
| MP-2 (Media Access) | 3.8.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-213, RBAC, MAC-IT-304 Section 7.6 |
| MP-3 (Media Marking) | 3.8.4 | CMMC Level 2 | 🚫 Not Applicable | Digital-only, no physical media |
| MP-4 (Media Storage) | 3.8.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-213, Database encryption, MAC-IT-304 Section 7.6 |
| MP-5 (Media Transport) | 3.8.5 | CMMC Level 2 | 🚫 Not Applicable | Cloud-only, no physical media transport |
| MP-6 (Media Sanitization) | 3.8.3 | CMMC Level 2 | ✅ Implemented | MAC-POL-213, No removable media, MAC-IT-304 Section 7.6 |
| MP-7 (Media Use) | 3.8.7, 3.8.8 | CMMC Level 2 | ✅ Implemented | MAC-POL-213, Policy prohibition, MAC-IT-304 Section 7.6 |
| MP-8 (Media Downgrading) | 3.8.3 | CMMC Level 2 | ✅ Implemented | MAC-POL-213, Media sanitization, MAC-IT-304 Section 7.6 |

**Design Alignment Summary:**
Media protection design aligns with FedRAMP Moderate MP family expectations through media protection policies, access controls, database encryption, and removable media controls. Physical media controls are not applicable due to cloud-only architecture.

---

### 3.9 PS - Personnel Security

**FedRAMP Moderate Controls:** PS-1 through PS-8 (and enhancements)

**NIST 800-171 Controls Mapped:** 3.9.1, 3.9.2

| FedRAMP Control (NIST 800-53) | NIST 800-171 Control | CMMC Level 2 Practice | Implementation Status | Reference Documents |
|-------------------------------|---------------------|----------------------|----------------------|---------------------|
| PS-1 (Personnel Security Policy) | 3.9.1, 3.9.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-222, MAC-IT-304 Section 7.7 |
| PS-2 (Position Risk Designation) | 3.9.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-222, MAC-SOP-233, MAC-IT-304 Section 7.7 |
| PS-3 (Personnel Screening) | 3.9.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-222, MAC-SOP-233, MAC-IT-304 Section 7.7 |
| PS-4 (Personnel Termination) | 3.9.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-222, Termination procedures, MAC-IT-304 Section 7.7 |
| PS-5 (Personnel Transfer) | 3.9.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-222, Personnel actions, MAC-IT-304 Section 7.7 |
| PS-6 (Access Agreements) | 3.9.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-222, User agreements, MAC-IT-304 Section 7.7 |
| PS-7 (Third-Party Personnel Security) | 3.9.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-222, Screening process, MAC-IT-304 Section 7.7 |
| PS-8 (Personnel Sanctions) | 3.9.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-222, Personnel actions, MAC-IT-304 Section 7.7 |

**Design Alignment Summary:**
Personnel security design aligns with FedRAMP Moderate PS family expectations through personnel screening, termination procedures, and access agreement processes. All PS requirements are addressed through existing CMMC Level 2 controls.

---

### 3.10 PE - Physical and Environmental Protection

**FedRAMP Moderate Controls:** PE-1 through PE-23 (and enhancements)

**NIST 800-171 Controls Mapped:** 3.10.1 through 3.10.6

| FedRAMP Control (NIST 800-53) | NIST 800-171 Control | CMMC Level 2 Practice | Implementation Status | Reference Documents |
|-------------------------------|---------------------|----------------------|----------------------|---------------------|
| PE-1 (Physical and Environmental Protection Policy) | 3.10.1, 3.10.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-212, MAC-IT-304 Section 7.8 |
| PE-2 (Physical Access Authorizations) | 3.10.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-212, MAC-IT-304 Section 7.8 |
| PE-3 (Physical Access Control) | 3.10.1, 3.10.5 | CMMC Level 2 | ✅ Implemented | MAC-POL-212, MAC-IT-304 Section 7.8 |
| PE-4 (Access Control for Transmission Medium) | 3.10.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-212, MAC-IT-304 Section 7.8 |
| PE-5 (Access Control for Output Devices) | 3.10.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-212, MAC-IT-304 Section 7.8 |
| PE-6 (Monitoring Physical Access) | 3.10.2, 3.10.4 | CMMC Level 2 | ✅ Implemented | MAC-POL-212, /admin/physical-access-logs, MAC-IT-304 Section 7.8 |
| PE-8 (Visitor Access Records) | 3.10.3 | CMMC Level 2 | ✅ Implemented | MAC-POL-212, MAC-RPT-111, MAC-IT-304 Section 7.8 |
| PE-12 (Emergency Lighting) | 3.10.2 | CMMC Level 2 | 🔄 Inherited | MAC-POL-212, Railway platform, MAC-IT-304 Section 7.8 |
| PE-13 (Fire Protection) | 3.10.2 | CMMC Level 2 | 🔄 Inherited | MAC-POL-212, Railway platform, MAC-IT-304 Section 7.8 |
| PE-14 (Temperature and Humidity Controls) | 3.10.2 | CMMC Level 2 | 🔄 Inherited | MAC-POL-212, Railway platform, MAC-IT-304 Section 7.8 |
| PE-15 (Water Damage Protection) | 3.10.2 | CMMC Level 2 | 🔄 Inherited | MAC-POL-212, Railway platform, MAC-IT-304 Section 7.8 |
| PE-16 (Delivery and Removal) | 3.10.1 | CMMC Level 2 | 🔄 Inherited | MAC-POL-212, Railway platform, MAC-IT-304 Section 7.8 |
| PE-17 (Alternate Work Site) | 3.10.6 | CMMC Level 2 | ✅ Implemented | MAC-POL-212, MAC-RPT-113, MAC-IT-304 Section 7.8 |
| PE-18 (Location of Information System Components) | 3.10.1 | CMMC Level 2 | 🔄 Inherited | MAC-POL-212, Railway platform, MAC-IT-304 Section 7.8 |
| PE-19 (Information Leakage) | 3.10.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-212, Facility protection, MAC-IT-304 Section 7.8 |
| PE-20 (Asset Monitoring and Tracking) | 3.10.4 | CMMC Level 2 | ✅ Implemented | MAC-POL-212, Physical access logs, MAC-IT-304 Section 7.8 |
| PE-21 (Electromagnetic Emanations) | 3.10.2 | CMMC Level 2 | 🔄 Inherited | MAC-POL-212, Railway platform, MAC-IT-304 Section 7.8 |

**Design Alignment Summary:**
Physical and environmental protection design aligns with FedRAMP Moderate PE family expectations through physical access controls, facility protection, visitor monitoring, and alternate work site safeguarding. Many PE controls are inherited from Railway platform (data center facilities).

---

### 3.11 PL - Planning

**FedRAMP Moderate Controls:** PL-1 through PL-8 (and enhancements)

**NIST 800-171 Controls Mapped:** 3.12.4 (SSP development)

| FedRAMP Control (NIST 800-53) | NIST 800-171 Control | CMMC Level 2 Practice | Implementation Status | Reference Documents |
|-------------------------------|---------------------|----------------------|----------------------|---------------------|
| PL-1 (Planning Policy) | 3.12.4 | CMMC Level 2 | ✅ Implemented | MAC-POL-224, MAC-IT-304 Section 7.12 |
| PL-2 (System Security Plan) | 3.12.4 | CMMC Level 2 | ✅ Implemented | MAC-POL-224, MAC-IT-304, MAC-IT-304 Section 7.12 |
| PL-4 (Rules of Behavior) | 3.1.9 | CMMC Level 2 | ✅ Implemented | MAC-POL-210, User agreements, MAC-IT-304 Section 7.1 |
| PL-8 (Information Security Architecture) | 3.13.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-225, MAC-IT-301, MAC-IT-304 Section 7.13 |

**Design Alignment Summary:**
Planning design aligns with FedRAMP Moderate PL family expectations through System Security Plan development, rules of behavior (user agreements), and information security architecture documentation. All PL requirements are addressed through existing CMMC Level 2 controls.

---

### 3.12 RA - Risk Assessment

**FedRAMP Moderate Controls:** RA-1 through RA-5 (and enhancements)

**NIST 800-171 Controls Mapped:** 3.11.1 through 3.11.3

| FedRAMP Control (NIST 800-53) | NIST 800-171 Control | CMMC Level 2 Practice | Implementation Status | Reference Documents |
|-------------------------------|---------------------|----------------------|----------------------|---------------------|
| RA-1 (Risk Assessment Policy) | 3.11.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-223, MAC-IT-304 Section 7.11 |
| RA-2 (Security Categorization) | 3.11.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-223, Risk assessment, MAC-IT-304 Section 7.11 |
| RA-3 (Risk Assessment) | 3.11.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-223, MAC-AUD-404, MAC-IT-304 Section 7.11 |
| RA-5 (Vulnerability Scanning) | 3.11.2, 3.11.3 | CMMC Level 2 | ✅ Implemented | MAC-POL-223, MAC-RPT-114, MAC-RPT-115, MAC-IT-304 Section 7.11 |

**Design Alignment Summary:**
Risk assessment design aligns with FedRAMP Moderate RA family expectations through risk assessment policies, periodic risk assessments, vulnerability scanning, and vulnerability remediation processes. All RA requirements are addressed through existing CMMC Level 2 controls.

---

### 3.13 SA - System and Services Acquisition

**FedRAMP Moderate Controls:** SA-1 through SA-22 (and enhancements)

**NIST 800-171 Controls Mapped:** 3.1.20 (external systems), 3.13.1 (external services)

| FedRAMP Control (NIST 800-53) | NIST 800-171 Control | CMMC Level 2 Practice | Implementation Status | Reference Documents |
|-------------------------------|---------------------|----------------------|----------------------|---------------------|
| SA-1 (System and Services Acquisition Policy) | 3.1.20 | CMMC Level 2 | ✅ Implemented | MAC-POL-210, MAC-IT-304 Section 7.1 |
| SA-2 (Allocation of Resources) | 3.1.20 | CMMC Level 2 | ✅ Implemented | MAC-POL-210, External system verification, MAC-IT-304 Section 7.1 |
| SA-4 (Acquisition Process) | 3.1.20 | CMMC Level 2 | ✅ Implemented | MAC-POL-210, External system verification, MAC-IT-304 Section 7.1 |
| SA-9 (External System Services) | 3.1.20, 3.13.1 | CMMC Level 2 | ✅ Implemented / 🔄 Inherited | MAC-POL-210, MAC-POL-225, Railway platform, MAC-IT-304 Section 7.1, 7.13 |
| SA-11 (Developer Security Testing) | 3.14.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-214, Dependabot, MAC-IT-304 Section 7.14 |
| SA-12 (Supply Chain Protection) | 3.1.20 | CMMC Level 2 | ✅ Implemented | MAC-POL-210, External system verification, MAC-IT-304 Section 7.1 |
| SA-15 (Development Process, Standards, and Tools) | 3.4.3 | CMMC Level 2 | ✅ Implemented | MAC-POL-220, Change control, MAC-IT-304 Section 7.5 |
| SA-17 (Developer-Provided Training) | 3.2.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-219, Security training, MAC-IT-304 Section 7.3 |
| SA-19 (Component Authenticity) | 3.1.20 | CMMC Level 2 | ✅ Implemented | MAC-POL-210, External system verification, MAC-IT-304 Section 7.1 |
| SA-22 (Unsupported System Components) | 3.14.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-214, Flaw management, MAC-IT-304 Section 7.14 |

**Design Alignment Summary:**
System and services acquisition design aligns with FedRAMP Moderate SA family expectations through external system verification, supply chain risk management, and development process controls. All SA requirements are addressed through existing CMMC Level 2 controls.

---

### 3.14 SC - System and Communications Protection

**FedRAMP Moderate Controls:** SC-1 through SC-43 (and enhancements)

**NIST 800-171 Controls Mapped:** 3.13.1 through 3.13.16

| FedRAMP Control (NIST 800-53) | NIST 800-171 Control | CMMC Level 2 Practice | Implementation Status | Reference Documents |
|-------------------------------|---------------------|----------------------|----------------------|---------------------|
| SC-1 (System and Communications Protection Policy) | 3.13.1, 3.13.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-225, MAC-IT-304 Section 7.13 |
| SC-2 (Application Partitioning) | 3.13.3 | CMMC Level 2 | ✅ Implemented | MAC-POL-225, MAC-IT-301, MAC-IT-304 Section 7.13 |
| SC-4 (Information in Shared Resources) | 3.13.4 | CMMC Level 2 | ✅ Implemented | MAC-POL-225, Access controls, MAC-IT-304 Section 7.13 |
| SC-5 (Denial of Service Protection) | 3.13.1 | CMMC Level 2 | 🔄 Inherited | MAC-POL-225, Railway platform, MAC-IT-304 Section 7.13 |
| SC-7 (Boundary Protection) | 3.13.1, 3.13.5, 3.13.6 | CMMC Level 2 | ✅ Implemented / 🔄 Inherited | MAC-POL-225, Railway platform, MAC-IT-304 Section 7.13 |
| SC-8 (Transmission Confidentiality and Integrity) | 3.13.8, 3.13.15 | CMMC Level 2 | 🔄 Inherited | MAC-POL-225, Railway platform (TLS/HTTPS), MAC-IT-304 Section 7.13 |
| SC-10 (Network Disconnect) | 3.13.9 | CMMC Level 2 | 🔄 Inherited | MAC-POL-225, Railway platform, MAC-IT-304 Section 7.13 |
| SC-12 (Cryptographic Key Establishment and Management) | 3.13.10 | CMMC Level 2 | ✅ Implemented | MAC-POL-225, MAC-RPT-116, MAC-IT-304 Section 7.13 |
| SC-13 (Cryptographic Protection) | 3.13.8, 3.13.11, 3.13.16 | CMMC Level 2 | ✅ Implemented / 🔄 Inherited / ❌ POA&M | MAC-POL-225, Railway platform, FIPS POA&M, MAC-IT-304 Section 7.13 |
| SC-15 (Collaborative Computing Devices) | 3.13.12 | CMMC Level 2 | 🚫 Not Applicable | System architecture (web application) |
| SC-17 (Public Key Infrastructure Certificates) | 3.13.8 | CMMC Level 2 | 🔄 Inherited | MAC-POL-225, Railway platform, MAC-IT-304 Section 7.13 |
| SC-18 (Mobile Code) | 3.13.13 | CMMC Level 2 | ✅ Implemented | MAC-POL-225, MAC-RPT-117, MAC-IT-304 Section 7.13 |
| SC-20 (Secure Name / Address Resolution Service) | 3.13.1 | CMMC Level 2 | 🔄 Inherited | MAC-POL-225, Railway platform, MAC-IT-304 Section 7.13 |
| SC-21 (Secure Name / Address Resolution Service) | 3.13.1 | CMMC Level 2 | 🔄 Inherited | MAC-POL-225, Railway platform, MAC-IT-304 Section 7.13 |
| SC-23 (Session Authenticity) | 3.5.4 | CMMC Level 2 | ✅ Implemented | MAC-POL-211, lib/auth.ts, MAC-IT-304 Section 7.2 |
| SC-28 (Protection of Information at Rest) | 3.13.16 | CMMC Level 2 | 🔄 Inherited | MAC-POL-225, Railway platform (database encryption), MAC-IT-304 Section 7.13 |
| SC-39 (Process Isolation) | 3.13.3 | CMMC Level 2 | ✅ Implemented | MAC-POL-225, MAC-IT-301, MAC-IT-304 Section 7.13 |
| SC-43 (Usage Restrictions) | 3.13.13 | CMMC Level 2 | ✅ Implemented | MAC-POL-225, Mobile code policy, MAC-IT-304 Section 7.13 |

**Design Alignment Summary:**
System and communications protection design aligns with FedRAMP Moderate SC family expectations through network security, encryption (in transit and at rest), boundary protection, and cryptographic key management. Many SC controls are inherited from Railway platform. FIPS-validated cryptography is tracked in POA&M.

---

### 3.15 SI - System and Information Integrity

**FedRAMP Moderate Controls:** SI-1 through SI-16 (and enhancements)

**NIST 800-171 Controls Mapped:** 3.14.1 through 3.14.7

| FedRAMP Control (NIST 800-53) | NIST 800-171 Control | CMMC Level 2 Practice | Implementation Status | Reference Documents |
|-------------------------------|---------------------|----------------------|----------------------|---------------------|
| SI-1 (System and Information Integrity Policy) | 3.14.1, 3.14.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-214, MAC-IT-304 Section 7.14 |
| SI-2 (Flaw Remediation) | 3.14.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-214, Dependabot, MAC-IT-304 Section 7.14 |
| SI-3 (Malicious Code Protection) | 3.14.2, 3.14.4 | CMMC Level 2 | ✅ Implemented / 🔄 Inherited | MAC-POL-214, Railway platform, MAC-IT-304 Section 7.14 |
| SI-4 (Information System Monitoring) | 3.14.3, 3.14.5, 3.14.6, 3.14.7 | CMMC Level 2 | ✅ Implemented | MAC-POL-214, Monitoring processes, MAC-IT-304 Section 7.14 |
| SI-5 (Security Alerts, Advisories, and Directives) | 3.14.3 | CMMC Level 2 | ✅ Implemented | MAC-POL-214, Alert monitoring, MAC-IT-304 Section 7.14 |
| SI-6 (Security Function Verification) | 3.14.6 | CMMC Level 2 | ✅ Implemented | MAC-POL-214, System monitoring, MAC-IT-304 Section 7.14 |
| SI-7 (Software, Firmware, and Information Integrity) | 3.14.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-214, Flaw management, MAC-IT-304 Section 7.14 |
| SI-8 (Spam Protection) | N/A | CMMC Level 2 | Design consideration | Not directly addressed |
| SI-10 (Information Input Validation) | 3.14.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-214, Flaw management, MAC-IT-304 Section 7.14 |
| SI-11 (Error Handling) | 3.14.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-214, Flaw management, MAC-IT-304 Section 7.14 |
| SI-12 (Information Output Handling and Retention) | 3.14.6 | CMMC Level 2 | ✅ Implemented | MAC-POL-214, System monitoring, MAC-IT-304 Section 7.14 |
| SI-16 (Memory Protection) | 3.14.2 | CMMC Level 2 | 🔄 Inherited | MAC-POL-214, Railway platform, MAC-IT-304 Section 7.14 |

**Design Alignment Summary:**
System and information integrity design aligns with FedRAMP Moderate SI family expectations through flaw remediation, malicious code protection, system monitoring, security alert monitoring, and information integrity verification. All SI requirements are addressed through existing CMMC Level 2 controls.

---

### 3.16 CA - Security Assessment and Authorization

**FedRAMP Moderate Controls:** CA-1 through CA-9 (and enhancements)

**Note:** FedRAMP uses "CA" for Security Assessment and Authorization. CMMC Level 2 uses "SA" for Security Assessment.

**NIST 800-171 Controls Mapped:** 3.12.1, 3.12.2, 3.12.3, 3.12.4

| FedRAMP Control (NIST 800-53) | NIST 800-171 Control | CMMC Level 2 Practice | Implementation Status | Reference Documents |
|-------------------------------|---------------------|----------------------|----------------------|---------------------|
| CA-1 (Security Assessment and Authorization Policy) | 3.12.1, 3.12.4 | CMMC Level 2 | ✅ Implemented | MAC-POL-224, MAC-IT-304 Section 7.12 |
| CA-2 (Security Assessments) | 3.12.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-224, Control assessments, MAC-IT-304 Section 7.12 |
| CA-3 (System Interconnections) | 3.1.20 | CMMC Level 2 | ✅ Implemented | MAC-POL-210, External system verification, MAC-IT-304 Section 7.1 |
| CA-5 (Plan of Action and Milestones) | 3.12.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-224, MAC-SOP-231, MAC-AUD-405, MAC-IT-304 Section 7.12 |
| CA-6 (Security Authorization) | 3.12.4 | CMMC Level 2 | Design consideration | SSP development (not FedRAMP authorization) |
| CA-7 (Continuous Monitoring) | 3.12.3 | CMMC Level 2 | ✅ Implemented | MAC-POL-224, MAC-AUD-407, MAC-IT-304 Section 7.12 |
| CA-9 (Internal System Connections) | 3.1.20 | CMMC Level 2 | ✅ Implemented | MAC-POL-210, External system verification, MAC-IT-304 Section 7.1 |

**Design Alignment Summary:**
Security assessment and authorization design aligns with FedRAMP Moderate CA family expectations through security control assessments, POA&M processes, continuous monitoring, and system interconnection documentation. CA-6 (Security Authorization) represents FedRAMP authorization, which is not claimed.

---

### 3.17 PM - Program Management

**FedRAMP Moderate Controls:** PM-1 through PM-31 (and enhancements)

**NIST 800-171 Controls Mapped:** Limited direct mapping (governance and management controls)

**Note:** Program Management controls are primarily organizational-level controls. Design alignment exists through:
- Security program governance (SSP, policies, procedures)
- Risk management processes
- Security awareness and training
- Configuration management

| FedRAMP Control (NIST 800-53) | NIST 800-171 Control | CMMC Level 2 Practice | Implementation Status | Reference Documents |
|-------------------------------|---------------------|----------------------|----------------------|---------------------|
| PM-1 (Information Security Program Plan) | 3.12.4 | CMMC Level 2 | ✅ Implemented | MAC-POL-224, MAC-IT-304, MAC-IT-304 Section 7.12 |
| PM-2 (Information Security Program Leadership Role) | 3.12.4 | CMMC Level 2 | ✅ Implemented | MAC-POL-224, SSP governance, MAC-IT-304 Section 7.12 |
| PM-3 (Information Security Resources) | 3.12.4 | CMMC Level 2 | ✅ Implemented | MAC-POL-224, Security program, MAC-IT-304 Section 7.12 |
| PM-4 (Plan of Action and Milestones Process) | 3.12.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-224, MAC-SOP-231, MAC-AUD-405, MAC-IT-304 Section 7.12 |
| PM-7 (Enterprise Architecture) | 3.13.2 | CMMC Level 2 | ✅ Implemented | MAC-POL-225, MAC-IT-301, MAC-IT-304 Section 7.13 |
| PM-9 (Risk Management Strategy) | 3.11.1 | CMMC Level 2 | ✅ Implemented | MAC-POL-223, Risk assessment, MAC-IT-304 Section 7.11 |
| PM-11 (Mission/Business Process Definition) | 3.12.4 | CMMC Level 2 | ✅ Implemented | MAC-POL-224, SSP system purpose, MAC-IT-304 Section 7.12 |
| PM-14 (Testing, Training, and Monitoring) | 3.2.1, 3.2.2, 3.12.3 | CMMC Level 2 | ✅ Implemented | MAC-POL-219, MAC-POL-224, Training and monitoring, MAC-IT-304 Section 7.3, 7.12 |
| PM-15 (Contacts with Security Groups and Associations) | 3.14.3 | CMMC Level 2 | ✅ Implemented | MAC-POL-214, Security alert monitoring, MAC-IT-304 Section 7.14 |
| PM-16 (Threat Awareness Program) | 3.2.1, 3.2.3 | CMMC Level 2 | ✅ Implemented | MAC-POL-219, Security awareness, MAC-IT-304 Section 7.3 |
| PM-31 (Continuous Improvement) | 3.12.2, 3.12.3 | CMMC Level 2 | ✅ Implemented | MAC-POL-224, POA&M and monitoring, MAC-IT-304 Section 7.12 |

**Design Alignment Summary:**
Program management design aligns with FedRAMP Moderate PM family expectations through security program planning, POA&M processes, risk management strategy, security awareness and training, and continuous improvement processes. All PM requirements are addressed through existing CMMC Level 2 controls.

---

## 4. Summary Statistics

### 4.1 Control Family Coverage

- **AC (Access Control):** Fully aligned through NIST 800-171 AC controls
- **IA (Identification and Authentication):** Fully aligned through NIST 800-171 IA controls
- **AU (Audit and Accountability):** Fully aligned through NIST 800-171 AU controls
- **CM (Configuration Management):** Fully aligned through NIST 800-171 CM controls
- **IR (Incident Response):** Fully aligned through NIST 800-171 IR controls
- **CP (Contingency Planning):** Aligned through IR recovery procedures and inherited backups
- **MA (Maintenance):** Aligned through NIST 800-171 MA controls (one control in POA&M)
- **MP (Media Protection):** Fully aligned through NIST 800-171 MP controls
- **PS (Personnel Security):** Fully aligned through NIST 800-171 PS controls
- **PE (Physical and Environmental Protection):** Aligned through NIST 800-171 PE controls and inherited Railway controls
- **PL (Planning):** Fully aligned through NIST 800-171 SA controls (SSP development)
- **RA (Risk Assessment):** Fully aligned through NIST 800-171 RA controls
- **SA (System and Services Acquisition):** Aligned through NIST 800-171 external system controls
- **SC (System and Communications Protection):** Aligned through NIST 800-171 SC controls (one control in POA&M)
- **SI (System and Information Integrity):** Fully aligned through NIST 800-171 SI controls
- **CA (Security Assessment and Authorization):** Aligned through NIST 800-171 SA controls (authorization not claimed)
- **PM (Program Management):** Aligned through governance and management controls

### 4.2 Alignment Completeness

**Design Alignment Status:**
- All applicable FedRAMP Moderate control families are addressed
- Existing CMMC Level 2 controls support FedRAMP Moderate baseline expectations
- Inherited controls from Railway and GitHub support FedRAMP Moderate expectations
- POA&M items are actively managed (not blockers to design alignment)

**Gaps and Considerations:**
- Some FedRAMP Moderate controls may require additional design considerations beyond CMMC Level 2
- FIPS-validated cryptography (SC-13) is tracked in POA&M
- Maintenance tool controls (MA-3) are tracked in POA&M
- Contingency planning may require additional design considerations for full FedRAMP Moderate alignment

---

## 5. Document Control

### 5.1 Version History

- **Version 1.0 (2026-01-25):** Initial Control Family Alignment document creation

### 5.2 Review and Maintenance

**Review Schedule:**
- Annual review (scheduled)
- Review upon significant system changes
- Review upon CMMC documentation updates
- Review when SCTM is updated

**Next Review Date:** 2027-01-25

**Maintenance Responsibility:** Compliance Team

### 5.3 Related Documents

- FedRAMP Alignment Overview: `fedramp-alignment-overview.md`
- System Boundary and Architecture: `system-boundary-and-architecture.md`
- Inherited Controls: `inherited-controls-and-external-services.md`
- Continuous Monitoring: `continuous-monitoring-concept.md`
- Claim Language: `fedramp-claim-language.md`
- CMMC SCTM: `../cmmc/level2/04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- CMMC SSP: `../cmmc/level2/01-system-scope/MAC-IT-304_System_Security_Plan.md`

---

**Document Status:** This document is maintained under configuration control and is part of the MacTech Solutions compliance documentation package.

**Classification:** Internal Use

**Last Updated:** 2026-01-25

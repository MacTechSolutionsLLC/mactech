# NIST CSF 2.0 Current State Profile

**Document Version:** 1.0  
**Date:** 2026-01-25  
**Classification:** Internal Use  
**Framework:** NIST Cybersecurity Framework (CSF) 2.0  
**Reference:** NIST CSWP 29 - The NIST Cybersecurity Framework (CSF) 2.0

**Applies to:** MacTech Solutions Application - CMMC 2.0 Level 2 System

---

## 1. Purpose

This document provides the Current State Profile for MacTech Solutions' alignment with NIST Cybersecurity Framework (CSF) 2.0. It maps existing CMMC Level 2 / NIST 800-171 controls to CSF 2.0 functions, categories, and subcategories, describing how current implementations support CSF outcomes.

**Source of Truth:** All implementation status, policies, procedures, and evidence references are derived from the System Control Traceability Matrix (SCTM) and supporting CMMC Level 2 documentation.

---

## 2. Profile Structure

This profile is organized by CSF 2.0 Functions:

1. **GV (Govern)** - Risk management strategy, policies, supply chain
2. **ID (Identify)** - Asset management, business environment, risk assessment
3. **PR (Protect)** - Access control, awareness/training, data security, protective technology
4. **DE (Detect)** - Anomalies/events, continuous monitoring
5. **RS (Respond)** - Response planning, communications, analysis
6. **RC (Recover)** - Recovery planning, improvements

For each CSF category and subcategory, this profile identifies:
- Applicable NIST 800-171 controls
- Current implementation status
- Supporting policies and procedures
- Evidence references
- High-level implementation description
- SSP section references

---

## 3. GV - Govern Function

The Govern function establishes and monitors the organization's cybersecurity risk management strategy, expectations, and policy.

### 3.1 GV.OC - Organizational Context

**CSF Category:** Organizational Context (GV.OC)

**Description:** The circumstances—mission, stakeholder expectations, dependencies, and legal, regulatory, and contractual requirements—that the organization considers when making risk decisions.

**NIST 800-171 Controls Mapped:**
- 3.12.4 - Develop and update system security plans (SSP)

**Implementation Status:** ✅ Implemented

**Current Implementation:**
- System Security Plan (SSP) developed and maintained
- SSP describes system boundaries, environment, and security requirements
- SSP updated periodically and as system changes occur
- SSP version control maintained

**Supporting Documentation:**
- Policy: MAC-POL-224 (Security Assessment Policy)
- SSP: `../cmmc/level2/01-system-scope/MAC-IT-304_System_Security_Plan.md`
- Evidence: MAC-RPT-121_3_12_4_develop_update_ssp_Evidence
- SSP Section: 7.12, 3.12.4

---

### 3.2 GV.RM - Risk Management Strategy

**CSF Category:** Risk Management Strategy (GV.RM)

**Description:** The strategy for how cybersecurity risk is managed throughout the organization.

**NIST 800-171 Controls Mapped:**
- 3.11.1 - Periodically assess risk
- 3.12.1 - Periodically assess security controls
- 3.12.2 - Develop and implement POA&M
- 3.12.3 - Monitor security controls

**Implementation Status:** ✅ Implemented

**Current Implementation:**
- Risk assessment process established and documented
- Periodic risk assessments conducted
- Security control assessments performed
- POA&M process implemented with admin UI (`/admin/poam`)
- Continuous monitoring process established
- Risk management strategy documented in SSP

**Supporting Documentation:**
- Policy: MAC-POL-223 (Risk Assessment Policy), MAC-POL-224 (Security Assessment Policy)
- Procedures: MAC-SOP-231 (POA&M Process Procedure)
- Evidence: 
  - MAC-RPT-121_3_11_1_periodically_assess_risk_Evidence
  - MAC-RPT-121_3_12_1_periodically_assess_security_controls_Evidence
  - MAC-RPT-121_3_12_2_develop_and_implement_poa_m_Evidence
  - MAC-RPT-121_3_12_3_monitor_security_controls_Evidence
- POA&M: `../cmmc/level2/04-self-assessment/MAC-AUD-405_POA&M_Tracking_Log.md`
- SSP Section: 7.11, 7.12

---

### 3.3 GV.SC - Supply Chain Risk Management

**CSF Category:** Supply Chain Risk Management (GV.SC)

**Description:** The processes for managing cybersecurity supply chain risks.

**NIST 800-171 Controls Mapped:**
- 3.1.20 - Verify external systems
- 3.13.1 - Monitor, control, and protect communications (inherited platform controls)

**Implementation Status:** ✅ Implemented / 🔄 Inherited

**Current Implementation:**
- External system verification process established
- Platform provider (Railway, GitHub) security controls documented
- Inherited controls matrix maintained
- Supply chain risk considered in system architecture

**Supporting Documentation:**
- Policy: MAC-POL-210 (Access Control Policy), MAC-POL-225 (System and Communications Protection Policy)
- Evidence: 
  - MAC-RPT-121_3_1_20_verify_external_systems_Evidence
  - Inherited Controls Matrix: `../cmmc/level2/03-control-responsibility/MAC-RPT-102_Inherited_Controls_Matrix.md`
- SSP Section: 7.1, 7.13

---

## 4. ID - Identify Function

The Identify function helps determine the current cybersecurity risk to the organization.

### 4.1 ID.AM - Asset Management

**CSF Category:** Asset Management (ID.AM)

**Description:** The data, personnel, devices, systems, and facilities that enable the organization to achieve business purposes are identified and managed consistent with their relative importance to organizational objectives and the organization's risk strategy.

**NIST 800-171 Controls Mapped:**
- 3.4.1 - Baseline configurations
- 3.4.6 - Least functionality
- 3.4.8 - Software restriction policy
- 3.4.9 - Control user-installed software

**Implementation Status:** ✅ Implemented

**Current Implementation:**
- Configuration baseline established and maintained
- System architecture documented with asset inventory
- Software restriction policy implemented
- Approved software list maintained
- Change control process manages asset modifications

**Supporting Documentation:**
- Policy: MAC-POL-220 (Configuration Management Policy), MAC-POL-226 (Software Restriction Policy)
- Evidence:
  - MAC-RPT-108_Configuration_Baseline_Evidence
  - MAC-RPT-121_3_4_1_baseline_configurations_Evidence
  - MAC-RPT-121_3_4_6_least_functionality_Evidence
  - MAC-RPT-121_3_4_8_software_restriction_policy_Evidence
- Architecture: `../cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md`
- SSP Section: 7.5

---

### 4.2 ID.BE - Business Environment

**CSF Category:** Business Environment (ID.BE)

**Description:** The organization's mission, objectives, stakeholders, and activities are understood and prioritized; this information is used to inform cybersecurity roles, responsibilities, and risk management decisions.

**NIST 800-171 Controls Mapped:**
- 3.12.4 - Develop and update system security plans (SSP includes business context)

**Implementation Status:** ✅ Implemented

**Current Implementation:**
- System purpose and business context documented in SSP
- System scope and boundaries defined
- Stakeholder requirements documented
- Business objectives inform security decisions

**Supporting Documentation:**
- SSP: `../cmmc/level2/01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 1)
- SSP Section: 1.2

---

### 4.3 ID.RA - Risk Assessment

**CSF Category:** Risk Assessment (ID.RA)

**Description:** The cybersecurity risk to organizational operations (including mission, functions, image, and reputation), organizational assets, individuals, other organizations, and the Nation are understood and prioritized.

**NIST 800-171 Controls Mapped:**
- 3.11.1 - Periodically assess risk
- 3.11.2 - Scan for vulnerabilities
- 3.11.3 - Remediate vulnerabilities

**Implementation Status:** ✅ Implemented

**Current Implementation:**
- Risk assessment process established
- Periodic risk assessments conducted
- Vulnerability scanning implemented (Dependabot, manual scans)
- Vulnerability remediation process with timelines
- Risk assessment results documented

**Supporting Documentation:**
- Policy: MAC-POL-223 (Risk Assessment Policy)
- Evidence:
  - MAC-RPT-121_3_11_1_periodically_assess_risk_Evidence
  - MAC-RPT-114_Vulnerability_Scanning_Evidence
  - MAC-RPT-115_Vulnerability_Remediation_Evidence
  - MAC-RPT-103_Dependabot_Configuration_Evidence
- Risk Assessment: `../cmmc/level2/04-self-assessment/MAC-AUD-404_Risk_Assessment_Report.md`
- SSP Section: 7.11

---

### 4.4 ID.IM - Improvement

**CSF Category:** Improvement (ID.IM)

**Description:** Improvements to organizational cybersecurity risk management processes, procedures, and activities are identified across all CSF Functions.

**NIST 800-171 Controls Mapped:**
- 3.12.2 - Develop and implement POA&M
- 3.12.3 - Monitor security controls

**Implementation Status:** ✅ Implemented

**Current Implementation:**
- POA&M process established for identifying and tracking improvements
- Continuous monitoring identifies improvement opportunities
- Security control assessments inform improvement priorities
- Improvement activities tracked in POA&M system

**Supporting Documentation:**
- Policy: MAC-POL-224 (Security Assessment Policy)
- Procedure: MAC-SOP-231 (POA&M Process Procedure)
- Evidence:
  - MAC-RPT-121_3_12_2_develop_and_implement_poa_m_Evidence
  - MAC-RPT-121_3_12_3_monitor_security_controls_Evidence
- POA&M: `../cmmc/level2/04-self-assessment/MAC-AUD-405_POA&M_Tracking_Log.md`
- SSP Section: 7.12

---

## 5. PR - Protect Function

The Protect function uses safeguards to prevent or reduce cybersecurity risk.

### 5.1 PR.AC - Identity Management, Authentication and Access Control

**CSF Category:** Identity Management, Authentication and Access Control (PR.AC)

**Description:** Access to physical and logical assets and associated facilities is limited to authorized users, processes, and devices, and is managed consistent with the assessed risk of unauthorized access.

**NIST 800-171 Controls Mapped:**
- 3.1.1 - Limit system access to authorized users, processes, devices
- 3.1.2 - Limit access to transactions/functions
- 3.1.3 - Control flow of CUI
- 3.1.4 - Separate duties
- 3.1.5 - Least privilege
- 3.1.6 - Non-privileged accounts
- 3.1.7 - Prevent privileged function execution
- 3.1.8 - Limit unsuccessful logon attempts
- 3.1.9 - Privacy/security notices
- 3.1.10 - Session lock
- 3.1.11 - Automatic session termination
- 3.1.12 - Monitor remote access
- 3.1.13 - Cryptographic remote access (inherited)
- 3.1.14 - Managed access control points (inherited)
- 3.1.15 - Authorize remote privileged commands
- 3.5.1 - Identify users
- 3.5.2 - Authenticate users
- 3.5.3 - MFA for privileged accounts
- 3.5.4 - Replay-resistant authentication
- 3.5.5 - Prevent identifier reuse
- 3.5.6 - Disable identifiers after inactivity
- 3.5.7 - Password complexity
- 3.5.8 - Prohibit password reuse
- 3.5.9 - Temporary passwords
- 3.5.10 - Cryptographically-protected passwords
- 3.5.11 - Obscure authentication feedback

**Implementation Status:** ✅ Implemented (with some inherited controls)

**Current Implementation:**
- Role-based access control (RBAC) implemented with NextAuth.js
- Multi-factor authentication (MFA) for ADMIN role accounts (TOTP-based)
- Account lockout after 5 failed attempts (30-minute lockout)
- Session management with 8-hour timeout and session lock capability
- Password policy enforced (complexity, history, cryptographic protection)
- Separation of duties enforced through RBAC
- Least privilege principle implemented
- User identification and authentication processes established
- Remote access monitored through audit logging
- Cryptographic remote access provided by Railway platform (TLS/HTTPS)

**Supporting Documentation:**
- Policy: MAC-POL-210 (Access Control Policy), MAC-POL-211 (Identification and Authentication Policy)
- Procedures: MAC-SOP-221, MAC-SOP-222, MAC-SOP-235 (Separation of Duties)
- Evidence:
  - MAC-RPT-104_MFA_Implementation_Evidence
  - MAC-RPT-105_Account_Lockout_Implementation_Evidence
  - MAC-RPT-106_Session_Lock_Implementation_Evidence
  - MAC-RPT-117_Separation_of_Duties_Enforcement_Evidence
  - MAC-RPT-120_Identifier_Reuse_Prevention_Evidence
  - MAC-RPT-122_3_1_*_Evidence (multiple access control evidence documents)
  - MAC-RPT-122_3_5_*_Evidence (multiple authentication evidence documents)
- Implementation: middleware.ts, lib/auth.ts, lib/authz.ts, lib/mfa.ts, lib/password-policy.ts
- SSP Section: 7.1, 7.2

---

### 5.2 PR.AT - Awareness and Training

**CSF Category:** Awareness and Training (PR.AT)

**Description:** The organization's personnel and partners are provided cybersecurity awareness education and are trained to perform their cybersecurity-related duties and responsibilities consistent with related policies, procedures, and agreements.

**NIST 800-171 Controls Mapped:**
- 3.2.1 - Security awareness
- 3.2.2 - Security training
- 3.2.3 - Insider threat awareness

**Implementation Status:** ✅ Implemented

**Current Implementation:**
- Security awareness training program established
- Security training delivered to personnel
- Insider threat awareness training included
- Training completion tracked and documented
- Training content covers security policies and procedures

**Supporting Documentation:**
- Policy: MAC-POL-219 (Awareness and Training Policy)
- Procedure: MAC-SOP-227 (Security Awareness and Training Procedure)
- Evidence:
  - Training content: `../cmmc/level2/05-evidence/training/security-awareness-training-content.md`
  - Training log: `../cmmc/level2/05-evidence/training/training-completion-log.md`
  - MAC-RPT-121_3_2_*_Evidence (awareness and training evidence)
- SSP Section: 7.3

---

### 5.3 PR.DS - Data Security

**CSF Category:** Data Security (PR.DS)

**Description:** Data-at-rest, data-in-transit, and data-in-use are managed and protected throughout the data lifecycle.

**NIST 800-171 Controls Mapped:**
- 3.1.3 - Control flow of CUI
- 3.1.19 - Encrypt CUI on mobile devices
- 3.1.21 - Limit portable storage
- 3.1.22 - Control CUI on public systems
- 3.8.1 - Protect system media
- 3.8.2 - Limit access to CUI on media
- 3.8.3 - Sanitize/destroy media
- 3.8.6 - Cryptographic protection on digital media (inherited)
- 3.8.7 - Control removable media
- 3.8.8 - Prohibit portable storage without owner
- 3.8.9 - Protect backup CUI (inherited)
- 3.13.8 - Cryptographic mechanisms for CUI in transit (inherited)
- 3.13.16 - Protect CUI at rest (inherited)

**Implementation Status:** ✅ Implemented (with inherited controls)

**Current Implementation:**
- CUI file storage with separate table (StoredCUIFile) and password protection
- CUI flow controls implemented through access controls
- Portable storage restrictions enforced through policy and technical controls
- Media protection policies established
- Database encryption at rest (inherited from Railway)
- TLS/HTTPS for data in transit (inherited from Railway)
- Backup encryption (inherited from Railway)
- CUI handling procedures documented

**Supporting Documentation:**
- Policy: MAC-POL-210 (Access Control Policy), MAC-POL-213 (Media Handling Policy)
- Evidence:
  - MAC-RPT-101_CUI_Blocking_Technical_Controls_Evidence
  - MAC-RPT-118_Portable_Storage_Controls_Evidence
  - MAC-RPT-121_3_1_*_Evidence (CUI-related controls)
  - MAC-RPT-121_3_8_*_Evidence (media protection evidence)
- SSP Section: 7.1, 7.6, 7.13

---

### 5.4 PR.IP - Information Protection Processes and Procedures

**CSF Category:** Information Protection Processes and Procedures (PR.IP)

**Description:** Security policies (that address purpose, scope, roles, responsibilities, management commitment, and coordination among organizational entities), processes, and procedures are maintained and used to manage protection of information systems and assets.

**NIST 800-171 Controls Mapped:**
- 3.4.1 - Baseline configurations
- 3.4.2 - Security configuration settings
- 3.4.3 - Change control
- 3.4.4 - Security impact analysis
- 3.4.5 - Change access restrictions
- 3.4.6 - Least functionality
- 3.4.8 - Software restriction policy
- 3.4.9 - Control user-installed software

**Implementation Status:** ✅ Implemented

**Current Implementation:**
- Configuration Management Plan established
- Configuration baseline maintained
- Change control process implemented with approval workflow
- Security impact analysis performed for changes
- Software restriction policy enforced
- Approved software list maintained
- Change access restrictions documented

**Supporting Documentation:**
- Policy: MAC-POL-220 (Configuration Management Policy), MAC-POL-226 (Software Restriction Policy)
- Procedure: MAC-SOP-225 (Security Impact Analysis Procedure)
- Plan: MAC-CMP-001 (Configuration Management Plan)
- Evidence:
  - MAC-RPT-108_Configuration_Baseline_Evidence
  - MAC-RPT-109_Change_Control_Evidence
  - MAC-RPT-124_Security_Impact_Analysis_Operational_Evidence
  - MAC-RPT-125_Least_Functionality_Operational_Evidence
  - MAC-RPT-121_3_4_*_Evidence (configuration management evidence)
- SSP Section: 7.5

---

### 5.5 PR.MA - Maintenance

**CSF Category:** Maintenance (PR.MA)

**Description:** Maintenance and repairs of industrial control and information system components are performed consistent with policies and procedures.

**NIST 800-171 Controls Mapped:**
- 3.7.1 - Perform maintenance
- 3.7.2 - Controls on maintenance tools (POA&M)
- 3.7.5 - MFA for nonlocal maintenance (inherited)

**Implementation Status:** ✅ Implemented / ❌ POA&M / 🔄 Inherited

**Current Implementation:**
- Maintenance procedures documented
- Platform maintenance provided by Railway
- Application maintenance performed by organization
- MFA for maintenance access (inherited from platform)
- Maintenance tool controls tracked in POA&M

**Supporting Documentation:**
- Policy: MAC-POL-221 (Maintenance Policy)
- Evidence:
  - MAC-RPT-121_3_7_1_perform_maintenance_Evidence
  - MAC-RPT-110_Maintenance_MFA_Evidence
- POA&M: See `../cmmc/level2/04-self-assessment/MAC-AUD-405_POA&M_Tracking_Log.md` for 3.7.2
- SSP Section: 7.10

---

### 5.6 PR.PS - Personnel Security

**CSF Category:** Personnel Security (PR.PS)

**Description:** The workforce is managed to reduce the risk of human error, theft, fraud, and misuse of organizational assets.

**NIST 800-171 Controls Mapped:**
- 3.9.1 - Screen individuals prior to access
- 3.9.2 - Protect systems during/after personnel actions

**Implementation Status:** ✅ Implemented

**Current Implementation:**
- Personnel screening process established
- Screening records maintained
- Termination procedures documented
- Access revocation process implemented
- Personnel security policy established

**Supporting Documentation:**
- Policy: MAC-POL-222 (Personnel Security Policy)
- Procedure: MAC-SOP-233 (Personnel Screening Procedure)
- Evidence:
  - MAC-RPT-121_3_9_1_screen_individuals_prior_to_access_Evidence
  - MAC-RPT-121_3_9_2_protect_systems_during_after_personnel_actions_Evidence
  - Screening records: `../cmmc/level2/05-evidence/personnel-screening/`
- SSP Section: 7.7

---

### 5.7 PR.PE - Physical Environment

**CSF Category:** Physical Environment (PR.PE)

**Description:** Physical access to assets is managed and protected.

**NIST 800-171 Controls Mapped:**
- 3.10.1 - Limit physical access
- 3.10.2 - Protect and monitor facility
- 3.10.3 - Escort and monitor visitors
- 3.10.4 - Physical access audit logs
- 3.10.5 - Control physical access devices
- 3.10.6 - Safeguarding at alternate work sites

**Implementation Status:** ✅ Implemented

**Current Implementation:**
- Physical security policy established
- Facility protection controls documented
- Visitor monitoring procedures implemented
- Physical access logging system (`/admin/physical-access-logs`)
- Physical access device controls documented
- Alternate work site safeguarding procedures established

**Supporting Documentation:**
- Policy: MAC-POL-212 (Physical Security Policy)
- Procedure: MAC-SOP-224 (Physical Environment and Remote Work Controls)
- Evidence:
  - MAC-RPT-111_Visitor_Controls_Evidence
  - MAC-RPT-112_Physical_Access_Device_Evidence
  - MAC-RPT-113_Alternate_Work_Site_Safeguarding_Evidence
  - MAC-RPT-121_3_10_*_Evidence (physical protection evidence)
- SSP Section: 7.8

---

## 6. DE - Detect Function

The Detect function finds and analyzes possible cybersecurity attacks and compromises.

### 6.1 DE.AU - Audit Logging

**CSF Category:** Audit Logging (DE.AU)

**Description:** Audit log records are determined, documented, implemented, and reviewed in accordance with policy.

**NIST 800-171 Controls Mapped:**
- 3.3.1 - Create and retain audit logs
- 3.3.2 - Unique user traceability
- 3.3.3 - Review and update logged events
- 3.3.4 - Alert on audit logging failure
- 3.3.5 - Correlate audit records
- 3.3.6 - Audit record reduction/reporting
- 3.3.7 - System clock synchronization (inherited)
- 3.3.8 - Protect audit information
- 3.3.9 - Limit audit logging management

**Implementation Status:** ✅ Implemented (with inherited controls)

**Current Implementation:**
- Comprehensive audit logging implemented (lib/audit.ts)
- 90-day minimum audit log retention
- All security events logged (authentication, admin actions, file operations)
- Unique user identification in audit logs
- Audit log review procedure established (MAC-SOP-226)
- Audit logging failure alerts implemented
- Audit record correlation capabilities
- Audit log export functionality (CSV format)
- System clock synchronization (inherited from Railway NTP)
- Audit information protected (append-only)
- Audit logging management restricted to administrators

**Supporting Documentation:**
- Policy: MAC-POL-218 (Audit and Accountability Policy)
- Procedure: MAC-SOP-226 (Audit Log Review Procedure)
- Evidence:
  - MAC-RPT-107_Audit_Log_Retention_Evidence
  - MAC-RPT-121_3_3_*_Evidence (audit logging evidence)
  - MAC-RPT-122_3_3_*_Evidence (audit logging evidence)
  - Audit log review log: `../cmmc/level2/05-evidence/audit-log-reviews/audit-log-review-log.md`
- Implementation: lib/audit.ts, /api/admin/events/export
- SSP Section: 7.4

---

### 6.2 DE.CM - Continuous Monitoring

**CSF Category:** Continuous Monitoring (DE.CM)

**Description:** The information system and assets are monitored to identify cybersecurity events and verify the effectiveness of protective measures.

**NIST 800-171 Controls Mapped:**
- 3.12.3 - Monitor security controls
- 3.14.3 - Monitor security alerts
- 3.14.5 - Periodic/real-time scans
- 3.14.6 - Monitor systems and communications
- 3.14.7 - Identify unauthorized use

**Implementation Status:** ✅ Implemented

**Current Implementation:**
- Continuous monitoring process established
- Security control monitoring performed
- Security alert monitoring (Dependabot, vulnerability alerts)
- Vulnerability scanning (periodic and real-time)
- System and communications monitoring
- Unauthorized use detection and alerting
- Continuous monitoring log maintained

**Supporting Documentation:**
- Policy: MAC-POL-214 (System and Information Integrity Policy), MAC-POL-224 (Security Assessment Policy)
- Evidence:
  - MAC-RPT-114_Vulnerability_Scanning_Evidence
  - MAC-RPT-119_Unauthorized_Use_Detection_Evidence
  - MAC-RPT-103_Dependabot_Configuration_Evidence
  - MAC-RPT-121_3_12_3_monitor_security_controls_Evidence
  - MAC-RPT-121_3_14_*_Evidence (monitoring evidence)
- Continuous Monitoring Log: `../cmmc/level2/04-self-assessment/MAC-AUD-407_Continuous_Monitoring_Log.md`
- SSP Section: 7.12, 7.14

---

### 6.3 DE.DP - Detection Processes

**CSF Category:** Detection Processes (DE.DP)

**Description:** Detection processes and procedures are maintained and tested to ensure awareness of anomalous events.

**NIST 800-171 Controls Mapped:**
- 3.3.3 - Review and update logged events
- 3.3.5 - Correlate audit records
- 3.14.7 - Identify unauthorized use

**Implementation Status:** ✅ Implemented

**Current Implementation:**
- Audit log review process established
- Audit record correlation implemented
- Unauthorized use detection and alerting
- Detection procedures documented
- Detection capabilities tested

**Supporting Documentation:**
- Policy: MAC-POL-218 (Audit and Accountability Policy), MAC-POL-214 (System and Information Integrity Policy)
- Procedure: MAC-SOP-226 (Audit Log Review Procedure)
- Evidence:
  - MAC-RPT-119_Unauthorized_Use_Detection_Evidence
  - MAC-RPT-121_3_3_*_Evidence (detection evidence)
  - MAC-RPT-121_3_14_7_identify_unauthorized_use_Evidence
- Implementation: lib/audit.ts (correlation functions)
- SSP Section: 7.4, 7.14

---

## 7. RS - Respond Function

The Respond function takes action regarding a detected cybersecurity incident.

### 7.1 RS.RP - Response Planning

**CSF Category:** Response Planning (RS.RP)

**Description:** Response processes and procedures are executed and maintained to ensure response to detected cybersecurity incidents.

**NIST 800-171 Controls Mapped:**
- 3.6.1 - Operational incident-handling capability
- 3.6.2 - Track, document, and report incidents
- 3.6.3 - Test incident response capability

**Implementation Status:** ✅ Implemented

**Current Implementation:**
- Incident Response Plan (IRP) established
- Incident handling capability operational
- Incident tracking and documentation procedures
- Incident reporting procedures
- Incident response testing performed (tabletop exercises)
- Incident response policy and procedures documented

**Supporting Documentation:**
- Policy: MAC-POL-215 (Incident Response Policy)
- Procedure: MAC-SOP-232 (Incident Response Testing Procedure)
- Evidence:
  - MAC-RPT-121_3_6_1_operational_incident_handling_capability_Evidence
  - MAC-RPT-121_3_6_2_track_document_and_report_incidents_Evidence
  - MAC-RPT-121_3_6_3_test_incident_response_capability_Evidence
- SSP Section: 7.9

---

### 7.2 RS.CO - Response Communications

**CSF Category:** Response Communications (RS.CO)

**Description:** Response activities are coordinated with internal and external stakeholders.

**NIST 800-171 Controls Mapped:**
- 3.6.2 - Track, document, and report incidents

**Implementation Status:** ✅ Implemented

**Current Implementation:**
- Incident reporting procedures include stakeholder communication
- Internal coordination procedures established
- External reporting procedures (as required by contracts)
- Communication processes documented in IRP

**Supporting Documentation:**
- Policy: MAC-POL-215 (Incident Response Policy)
- Evidence: MAC-RPT-121_3_6_2_track_document_and_report_incidents_Evidence
- SSP Section: 7.9

---

### 7.3 RS.AN - Response Analysis

**CSF Category:** Response Analysis (RS.AN)

**Description:** Analysis is conducted to ensure effective response and support recovery activities.

**NIST 800-171 Controls Mapped:**
- 3.6.1 - Operational incident-handling capability
- 3.6.2 - Track, document, and report incidents

**Implementation Status:** ✅ Implemented

**Current Implementation:**
- Incident analysis procedures established
- Root cause analysis performed
- Incident documentation includes analysis
- Analysis supports response and recovery activities

**Supporting Documentation:**
- Policy: MAC-POL-215 (Incident Response Policy)
- Evidence:
  - MAC-RPT-121_3_6_1_operational_incident_handling_capability_Evidence
  - MAC-RPT-121_3_6_2_track_document_and_report_incidents_Evidence
- SSP Section: 7.9

---

### 7.4 RS.MI - Incident Mitigation

**CSF Category:** Incident Mitigation (RS.MI)

**Description:** Activities are performed to prevent expansion of an event, mitigate its effects, and resolve the incident.

**NIST 800-171 Controls Mapped:**
- 3.6.1 - Operational incident-handling capability
- 3.6.2 - Track, document, and report incidents

**Implementation Status:** ✅ Implemented

**Current Implementation:**
- Incident containment procedures established
- Incident mitigation activities documented
- Incident resolution procedures
- Incident handling capability supports mitigation

**Supporting Documentation:**
- Policy: MAC-POL-215 (Incident Response Policy)
- Evidence:
  - MAC-RPT-121_3_6_1_operational_incident_handling_capability_Evidence
  - MAC-RPT-121_3_6_2_track_document_and_report_incidents_Evidence
- SSP Section: 7.9

---

## 8. RC - Recover Function

The Recover function restores assets and operations impacted by a cybersecurity incident.

### 8.1 RC.RP - Recovery Planning

**CSF Category:** Recovery Planning (RC.RP)

**Description:** Recovery processes and procedures are executed and maintained to ensure restoration of systems or assets affected by cybersecurity incidents.

**NIST 800-171 Controls Mapped:**
- 3.6.1 - Operational incident-handling capability (includes recovery)
- 3.8.9 - Protect backup CUI (inherited)

**Implementation Status:** ✅ Implemented / 🔄 Inherited

**Current Implementation:**
- Recovery procedures included in Incident Response Plan
- Backup and recovery processes established
- Backup encryption (inherited from Railway)
- Recovery testing procedures
- Recovery planning documented

**Supporting Documentation:**
- Policy: MAC-POL-215 (Incident Response Policy), MAC-POL-213 (Media Handling Policy)
- Evidence: MAC-RPT-121_3_6_1_operational_incident_handling_capability_Evidence
- SSP Section: 7.9, 7.6

---

### 8.2 RC.IM - Recovery Improvements

**CSF Category:** Recovery Improvements (RC.IM)

**Description:** Recovery planning and processes are improved by incorporating lessons learned into future activities.

**NIST 800-171 Controls Mapped:**
- 3.6.3 - Test incident response capability (includes lessons learned)
- 3.12.2 - Develop and implement POA&M (improvement tracking)

**Implementation Status:** ✅ Implemented

**Current Implementation:**
- Lessons learned from incident response testing documented
- Improvement opportunities tracked in POA&M
- Recovery procedures updated based on lessons learned
- Continuous improvement process established

**Supporting Documentation:**
- Policy: MAC-POL-215 (Incident Response Policy), MAC-POL-224 (Security Assessment Policy)
- Procedure: MAC-SOP-232 (Incident Response Testing Procedure)
- Evidence:
  - MAC-RPT-121_3_6_3_test_incident_response_capability_Evidence
  - MAC-RPT-121_3_12_2_develop_and_implement_poa_m_Evidence
- POA&M: `../cmmc/level2/04-self-assessment/MAC-AUD-405_POA&M_Tracking_Log.md`
- SSP Section: 7.9, 7.12

---

### 8.3 RC.CO - Recovery Communications

**CSF Category:** Recovery Communications (RC.CO)

**Description:** Restoration activities are coordinated with internal and external parties.

**NIST 800-171 Controls Mapped:**
- 3.6.2 - Track, document, and report incidents (includes recovery communications)

**Implementation Status:** ✅ Implemented

**Current Implementation:**
- Recovery communication procedures established
- Stakeholder notification during recovery
- Recovery status reporting
- Communication processes documented in IRP

**Supporting Documentation:**
- Policy: MAC-POL-215 (Incident Response Policy)
- Evidence: MAC-RPT-121_3_6_2_track_document_and_report_incidents_Evidence
- SSP Section: 7.9

---

## 9. Summary

### 9.1 CSF 2.0 Function Coverage

All six CSF 2.0 functions are addressed through existing CMMC Level 2 controls:

- **GV (Govern):** Risk management strategy, organizational context, supply chain risk management
- **ID (Identify):** Asset management, business environment, risk assessment, improvement
- **PR (Protect):** Access control, awareness/training, data security, configuration management, maintenance, personnel security, physical environment
- **DE (Detect):** Audit logging, continuous monitoring, detection processes
- **RS (Respond):** Response planning, communications, analysis, mitigation
- **RC (Recover):** Recovery planning, improvements, communications

### 9.2 Implementation Status Summary

- **Implemented Controls:** 81 controls (74%) support CSF 2.0 outcomes
- **Inherited Controls:** 12 controls (11%) support CSF 2.0 outcomes
- **POA&M Controls:** 3 controls (3%) - improvements tracked
- **Not Applicable:** 14 controls (13%) - cloud-only architecture
- **Overall Alignment:** 97% of applicable controls support CSF 2.0 outcomes

### 9.3 Traceability

All CSF 2.0 alignment claims are:
- Traceable to existing NIST 800-171 controls
- Supported by existing CMMC Level 2 evidence
- Documented in System Control Traceability Matrix (SCTM)
- Referenced in System Security Plan (SSP)

---

## 10. Document Control

### 10.1 Version History

- **Version 1.0 (2026-01-25):** Initial Current State Profile creation

### 10.2 Review and Maintenance

**Review Schedule:**
- Annual review (scheduled)
- Review upon significant system changes
- Review upon CMMC documentation updates

**Next Review Date:** 2027-01-25

**Maintenance Responsibility:** Compliance Team

### 10.3 Related Documents

- Profile Overview: `csf-profile-overview.md`
- Target State Profile: `csf-target-state-profile.md`
- Control Mapping: `csf-control-mapping.md`
- Claim Language: `csf-claim-language.md`
- CMMC SCTM: `../cmmc/level2/04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- CMMC SSP: `../cmmc/level2/01-system-scope/MAC-IT-304_System_Security_Plan.md`

---

**Document Status:** This document is maintained under configuration control and is part of the MacTech Solutions compliance documentation package.

**Classification:** Internal Use

**Last Updated:** 2026-01-25

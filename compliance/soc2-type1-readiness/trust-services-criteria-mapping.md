# Trust Services Criteria Mapping - SOC 2 Type I Readiness

**Document Version:** 1.0  
**Date:** 2026-01-25  
**Classification:** Internal Use  
**Framework:** AICPA Trust Services Criteria (2017, with 2022 revised points of focus)  
**Reference:** SOC 2 Type I - Security (Common Criteria)

**Applies to:** MacTech Solutions Application - CMMC 2.0 Level 2 System

---

## 1. Purpose

This document provides a structured mapping that correlates SOC 2 Trust Services Criteria (Security - Common Criteria) to existing NIST SP 800-171 controls and CMMC Level 2 practices. This mapping demonstrates design readiness alignment at the criterion level.

**Source of Truth:** All implementation status and references are derived from the System Control Traceability Matrix (SCTM): `../cmmc/level2/04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

**Important:** This document describes design intent alignment, not operating effectiveness assessment. It demonstrates how existing control design aligns with SOC 2 Trust Services Criteria expectations.

---

## 2. Mapping Methodology

### 2.1 Mapping Principles

1. **Objective-Based Mapping:** Map controls to SOC 2 criteria based on control objectives and security outcomes, not just control titles
2. **Design Intent:** Map controls based on design intent and control objectives
3. **Multiple Mappings:** One NIST 800-171 control may support multiple SOC 2 criteria
4. **One-to-Many:** One SOC 2 criterion may be supported by multiple NIST 800-171 controls
5. **Status Preservation:** Implementation status (Implemented/Inherited/POA&M/Not Applicable) is preserved from SCTM
6. **Evidence Traceability:** All mappings reference existing CMMC evidence documents

### 2.2 Design Readiness Approach

**Design Readiness:**
- Documents how control design aligns with SOC 2 Trust Services Criteria expectations
- Describes control intent and design approach
- References existing policies, procedures, and implementation artifacts
- Demonstrates architectural alignment with SOC 2 expectations

**Not Operating Effectiveness:**
- This mapping does not assess operating effectiveness
- This mapping does not claim control testing or validation
- This mapping does not represent a SOC 2 examination or audit

---

## 3. Common Criteria Mappings

### 3.1 CC1 - Control Environment

**SOC 2 Criterion:** CC1 - Control Environment

**Criterion Description:** The organization demonstrates a commitment to integrity and ethical values.

**Design Alignment:**
The control environment is established through governance structures, policies, procedures, and management oversight. The organization demonstrates commitment to security through comprehensive security policies, management oversight, and security program governance.

| SOC 2 Common Criterion | Criterion Description | NIST 800-171 Controls | CMMC Level 2 Practices | Implementation Status | Reference Documents |
|------------------------|----------------------|----------------------|----------------------|----------------------|---------------------|
| CC1 | Control Environment - Commitment to integrity and ethical values | 3.12.4 (SSP development), Policies and procedures | CMMC Level 2 | ✅ Implemented | MAC-POL-224, MAC-IT-304, MAC-IT-304 Section 7.12 |

**Supporting Controls:**
- **System Security Plan (3.12.4):** Comprehensive SSP documents security program and governance
- **Security Policies:** Security policies establish expectations and requirements
- **Management Oversight:** Security program managed and overseen by management
- **Governance Structure:** Security governance structure established

**Design Alignment Summary:**
Control environment design aligns with SOC 2 CC1 expectations through comprehensive security policies, System Security Plan, management oversight, and security program governance. All CC1 requirements are addressed through existing CMMC Level 2 controls.

**Reference:** `../cmmc/level2/01-system-scope/MAC-IT-304_System_Security_Plan.md`, `../cmmc/level2/02-policies-and-procedures/MAC-POL-224_Security_Assessment_Policy.md`

---

### 3.2 CC2 - Communication and Information

**SOC 2 Criterion:** CC2 - Communication and Information

**Criterion Description:** The organization obtains or generates and uses relevant, quality information to support the functioning of internal control.

**Design Alignment:**
Communication and information processes ensure that relevant security information is obtained, generated, and used to support security control functioning. This includes security policies, user agreements, security awareness, and information security communications.

| SOC 2 Common Criterion | Criterion Description | NIST 800-171 Controls | CMMC Level 2 Practices | Implementation Status | Reference Documents |
|------------------------|----------------------|----------------------|----------------------|----------------------|---------------------|
| CC2 | Communication and Information - Obtain, generate, and use relevant information | 3.1.9 (Privacy/security notices), 3.2.1 (Security awareness), 3.2.2 (Security training) | CMMC Level 2 | ✅ Implemented | MAC-POL-210, MAC-POL-219, User agreements, MAC-IT-304 Section 7.1, 7.3 |

**Supporting Controls:**
- **Privacy/Security Notices (3.1.9):** User agreements and security notices communicate security requirements
- **Security Awareness (3.2.1):** Security awareness program ensures personnel understand security responsibilities
- **Security Training (3.2.2):** Security training program provides relevant security information
- **Information Security Policies:** Security policies communicate security requirements and expectations

**Design Alignment Summary:**
Communication and information design aligns with SOC 2 CC2 expectations through security policies, user agreements, security awareness and training programs, and information security communications. All CC2 requirements are addressed through existing CMMC Level 2 controls.

**Reference:** `../cmmc/level2/02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`, `../cmmc/level2/02-policies-and-procedures/MAC-POL-219_Awareness_and_Training_Policy.md`, User agreements

---

### 3.3 CC3 - Risk Assessment

**SOC 2 Criterion:** CC3 - Risk Assessment

**Criterion Description:** The organization specifies suitable objectives and identifies risks to achievement of those objectives.

**Design Alignment:**
Risk assessment processes identify and assess risks to system security and operations. Risk assessment includes periodic risk assessments, vulnerability scanning, and vulnerability remediation processes.

| SOC 2 Common Criterion | Criterion Description | NIST 800-171 Controls | CMMC Level 2 Practices | Implementation Status | Reference Documents |
|------------------------|----------------------|----------------------|----------------------|----------------------|---------------------|
| CC3 | Risk Assessment - Specify objectives and identify risks | 3.11.1 (Periodically assess risk), 3.11.2 (Scan for vulnerabilities), 3.11.3 (Remediate vulnerabilities) | CMMC Level 2 | ✅ Implemented | MAC-POL-223, MAC-AUD-404, MAC-IT-304 Section 7.11 |

**Supporting Controls:**
- **Periodic Risk Assessment (3.11.1):** Risk assessment process established and conducted periodically
- **Vulnerability Scanning (3.11.2):** Vulnerability scanning conducted periodically (Dependabot, manual scans)
- **Vulnerability Remediation (3.11.3):** Vulnerability remediation process established with timelines

**Design Alignment Summary:**
Risk assessment design aligns with SOC 2 CC3 expectations through periodic risk assessments, vulnerability scanning, and vulnerability remediation processes. All CC3 requirements are addressed through existing CMMC Level 2 controls.

**Reference:** `../cmmc/level2/02-policies-and-procedures/MAC-POL-223_Risk_Assessment_Policy.md`, `../cmmc/level2/04-self-assessment/MAC-AUD-404_Risk_Assessment_Report.md`, `soc2-risk-assessment.md`

---

### 3.4 CC4 - Monitoring Activities

**SOC 2 Criterion:** CC4 - Monitoring Activities

**Criterion Description:** The organization selects, develops, and performs ongoing and/or separate evaluations to ascertain whether the components of internal control are present and functioning.

**Design Alignment:**
Monitoring activities include audit logging, audit log review, continuous monitoring, and security control assessments. These activities provide ongoing evaluation of control presence and functioning.

| SOC 2 Common Criterion | Criterion Description | NIST 800-171 Controls | CMMC Level 2 Practices | Implementation Status | Reference Documents |
|------------------------|----------------------|----------------------|----------------------|----------------------|---------------------|
| CC4 | Monitoring Activities - Ongoing and separate evaluations | 3.3.1 (Create and retain audit logs), 3.3.2 (Unique user traceability), 3.3.3 (Review logged events), 3.3.4 (Alert on failures), 3.3.5 (Correlate records), 3.12.1 (Assess controls), 3.12.3 (Monitor controls) | CMMC Level 2 | ✅ Implemented | MAC-POL-218, MAC-POL-224, MAC-SOP-226, lib/audit.ts, MAC-IT-304 Section 7.4, 7.12 |

**Supporting Controls:**
- **Audit Logging (3.3.1, 3.3.2):** Comprehensive audit logging with user traceability
- **Audit Log Review (3.3.3):** Audit log review procedures established
- **Audit Failure Alerts (3.3.4):** Audit logging failure alerts implemented
- **Audit Record Correlation (3.3.5):** Audit record correlation capabilities
- **Control Assessment (3.12.1):** Periodic security control assessments
- **Continuous Monitoring (3.12.3):** Continuous monitoring of security controls

**Design Alignment Summary:**
Monitoring activities design aligns with SOC 2 CC4 expectations through comprehensive audit logging, audit log review, continuous monitoring, and security control assessments. All CC4 requirements are addressed through existing CMMC Level 2 controls.

**Reference:** `../cmmc/level2/02-policies-and-procedures/MAC-POL-218_Audit_and_Accountability_Policy.md`, `../cmmc/level2/02-policies-and-procedures/MAC-POL-224_Security_Assessment_Policy.md`, `../cmmc/level2/02-policies-and-procedures/MAC-SOP-226_Audit_Log_Review_Procedure.md`, `lib/audit.ts`

---

### 3.5 CC5 - Control Activities

**SOC 2 Criterion:** CC5 - Control Activities

**Criterion Description:** The organization selects and develops control activities that contribute to the mitigation of risks.

**Design Alignment:**
Control activities include access controls, configuration management, security controls, and other control activities designed to mitigate security risks.

| SOC 2 Common Criterion | Criterion Description | NIST 800-171 Controls | CMMC Level 2 Practices | Implementation Status | Reference Documents |
|------------------------|----------------------|----------------------|----------------------|----------------------|---------------------|
| CC5 | Control Activities - Select and develop control activities | 3.1.x (Access Control), 3.4.x (Configuration Management), 3.5.x (Identification and Authentication), Security controls | CMMC Level 2 | ✅ Implemented | MAC-POL-210, MAC-POL-211, MAC-POL-220, MAC-IT-304 Section 7.1, 7.2, 7.5 |

**Supporting Controls:**
- **Access Control (3.1.x):** Comprehensive access control mechanisms (22 controls)
- **Configuration Management (3.4.x):** Configuration management and change control (9 controls)
- **Identification and Authentication (3.5.x):** User identification and authentication (11 controls)
- **Security Controls:** Various security controls across control families

**Design Alignment Summary:**
Control activities design aligns with SOC 2 CC5 expectations through comprehensive access controls, configuration management, authentication, and security controls. All CC5 requirements are addressed through existing CMMC Level 2 controls.

**Reference:** `../cmmc/level2/02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`, `../cmmc/level2/02-policies-and-procedures/MAC-POL-211_Identification_and_Authentication_Policy.md`, `../cmmc/level2/02-policies-and-procedures/MAC-POL-220_Configuration_Management_Policy.md`

---

### 3.6 CC6 - Logical and Physical Access Controls

**SOC 2 Criterion:** CC6 - Logical and Physical Access Controls

**Criterion Description:** The organization implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events.

**Design Alignment:**
Logical and physical access controls include access control mechanisms, authentication, authorization, and physical security controls designed to protect information assets.

| SOC 2 Common Criterion | Criterion Description | NIST 800-171 Controls | CMMC Level 2 Practices | Implementation Status | Reference Documents |
|------------------------|----------------------|----------------------|----------------------|----------------------|---------------------|
| CC6 | Logical and Physical Access Controls - Protect information assets | 3.1.x (Access Control - 22 controls), 3.5.x (Identification and Authentication - 11 controls), 3.10.x (Physical Protection - 6 controls) | CMMC Level 2 | ✅ Implemented / 🔄 Inherited | MAC-POL-210, MAC-POL-211, MAC-POL-212, MAC-IT-304 Section 7.1, 7.2, 7.8 |

**Supporting Controls:**

**Logical Access Controls:**
- **Access Control (3.1.x):** 22 access control controls including RBAC, least privilege, session management
- **Identification and Authentication (3.5.x):** 11 authentication controls including MFA, password policy
- **Account Management:** User account management and access control

**Physical Access Controls:**
- **Physical Protection (3.10.x):** 6 physical protection controls (some inherited from Railway)
- **Physical Access Logging (3.10.4):** Physical access audit logs
- **Facility Protection (3.10.2):** Facility protection and monitoring

**Design Alignment Summary:**
Logical and physical access controls design aligns with SOC 2 CC6 expectations through comprehensive access control, authentication, authorization, and physical security controls. Logical access controls are implemented internally; physical access controls are primarily inherited from Railway platform.

**Reference:** `../cmmc/level2/02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`, `../cmmc/level2/02-policies-and-procedures/MAC-POL-211_Identification_and_Authentication_Policy.md`, `../cmmc/level2/02-policies-and-procedures/MAC-POL-212_Physical_Security_Policy.md`, `../cmmc/level2/03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md`

---

### 3.7 CC7 - System Operations

**SOC 2 Criterion:** CC7 - System Operations

**Criterion Description:** The organization implements detection and monitoring procedures and verifies system components to meet objectives related to availability, processing integrity, confidentiality, and privacy.

**Design Alignment:**
System operations include system monitoring, maintenance, backup and recovery, and system operations procedures designed to ensure system availability and security.

| SOC 2 Common Criterion | Criterion Description | NIST 800-171 Controls | CMMC Level 2 Practices | Implementation Status | Reference Documents |
|------------------------|----------------------|----------------------|----------------------|----------------------|---------------------|
| CC7 | System Operations - Detection, monitoring, and verification | 3.7.x (Maintenance - 6 controls), 3.13.x (System and Communications Protection - 16 controls), 3.14.x (System and Information Integrity - 7 controls) | CMMC Level 2 | ✅ Implemented / 🔄 Inherited | MAC-POL-221, MAC-POL-225, MAC-POL-214, MAC-IT-304 Section 7.10, 7.13, 7.14 |

**Supporting Controls:**

**System Operations:**
- **Maintenance (3.7.x):** System maintenance procedures (some inherited from Railway)
- **System and Communications Protection (3.13.x):** Network security, encryption, system protection (16 controls)
- **System and Information Integrity (3.14.x):** System monitoring, flaw management, malware protection (7 controls)

**Monitoring and Detection:**
- **System Monitoring (3.14.6):** System and communications monitoring
- **Security Event Detection (3.14.7):** Unauthorized use detection and alerting
- **Audit Logging (3.3.x):** Comprehensive audit logging for system operations

**Design Alignment Summary:**
System operations design aligns with SOC 2 CC7 expectations through system maintenance, system and communications protection, system monitoring, and detection procedures. Many system operations controls are inherited from Railway platform.

**Reference:** `../cmmc/level2/02-policies-and-procedures/MAC-POL-221_Maintenance_Policy.md`, `../cmmc/level2/02-policies-and-procedures/MAC-POL-225_System_and_Communications_Protection_Policy.md`, `../cmmc/level2/02-policies-and-procedures/MAC-POL-214_System_Integrity_Policy.md`

---

### 3.8 CC8 - Change Management

**SOC 2 Criterion:** CC8 - Change Management

**Criterion Description:** The organization implements change management activities over system changes.

**Design Alignment:**
Change management includes configuration management, change control, security impact analysis, and change management procedures designed to ensure system changes are properly authorized, tested, and documented.

| SOC 2 Common Criterion | Criterion Description | NIST 800-171 Controls | CMMC Level 2 Practices | Implementation Status | Reference Documents |
|------------------------|----------------------|----------------------|----------------------|----------------------|---------------------|
| CC8 | Change Management - Implement change management activities | 3.4.1 (Baseline configurations), 3.4.2 (Security configuration settings), 3.4.3 (Change control), 3.4.4 (Security impact analysis), 3.4.5 (Change access restrictions) | CMMC Level 2 | ✅ Implemented | MAC-POL-220, MAC-SOP-225, MAC-IT-304 Section 7.5 |

**Supporting Controls:**
- **Baseline Configurations (3.4.1):** Configuration baseline established and maintained
- **Security Configuration Settings (3.4.2):** Security configuration settings documented and maintained
- **Change Control (3.4.3):** Change control process with version control and approval
- **Security Impact Analysis (3.4.4):** Security impact analysis for system changes
- **Change Access Restrictions (3.4.5):** Access restrictions for change management

**Design Alignment Summary:**
Change management design aligns with SOC 2 CC8 expectations through comprehensive configuration management, change control, security impact analysis, and change access restrictions. All CC8 requirements are addressed through existing CMMC Level 2 controls.

**Reference:** `../cmmc/level2/02-policies-and-procedures/MAC-POL-220_Configuration_Management_Policy.md`, `../cmmc/level2/02-policies-and-procedures/MAC-SOP-225_Security_Impact_Analysis_Procedure.md`, `../cmmc/level2/02-policies-and-procedures/MAC-CMP-001_Configuration_Management_Plan.md`

---

### 3.9 CC9 - Risk Mitigation

**SOC 2 Criterion:** CC9 - Risk Mitigation

**Criterion Description:** The organization identifies, selects, and develops risk mitigation activities for risks that are deemed to be outside of the organization's risk tolerance.

**Design Alignment:**
Risk mitigation includes incident response, vulnerability management, and risk mitigation activities designed to address risks outside of acceptable risk tolerance.

| SOC 2 Common Criterion | Criterion Description | NIST 800-171 Controls | CMMC Level 2 Practices | Implementation Status | Reference Documents |
|------------------------|----------------------|----------------------|----------------------|----------------------|---------------------|
| CC9 | Risk Mitigation - Identify, select, and develop risk mitigation activities | 3.6.x (Incident Response - 3 controls), 3.14.x (System and Information Integrity - 7 controls), 3.11.3 (Remediate vulnerabilities), 3.12.2 (POA&M) | CMMC Level 2 | ✅ Implemented | MAC-POL-215, MAC-POL-214, MAC-POL-223, MAC-POL-224, MAC-IT-304 Section 7.9, 7.14, 7.11, 7.12 |

**Supporting Controls:**

**Incident Response:**
- **Incident Response Capability (3.6.1):** Operational incident-handling capability
- **Incident Tracking (3.6.2):** Incident tracking, documentation, and reporting
- **Incident Response Testing (3.6.3):** Incident response capability testing

**Vulnerability Management:**
- **Vulnerability Remediation (3.11.3):** Vulnerability remediation process
- **Flaw Management (3.14.1):** Flaw identification, reporting, and correction
- **Malware Protection (3.14.2, 3.14.4):** Malicious code protection and updates

**Risk Management:**
- **POA&M (3.12.2):** Plan of Action and Milestones process for risk mitigation
- **Risk Assessment (3.11.1):** Periodic risk assessment to identify risks

**Design Alignment Summary:**
Risk mitigation design aligns with SOC 2 CC9 expectations through incident response capabilities, vulnerability management, and risk mitigation processes. All CC9 requirements are addressed through existing CMMC Level 2 controls.

**Reference:** `../cmmc/level2/02-policies-and-procedures/MAC-POL-215_Incident_Response_Policy.md`, `../cmmc/level2/02-policies-and-procedures/MAC-POL-214_System_Integrity_Policy.md`, `../cmmc/level2/02-policies-and-procedures/MAC-POL-223_Risk_Assessment_Policy.md`, `../cmmc/level2/04-self-assessment/MAC-AUD-405_POA&M_Tracking_Log.md`

---

## 4. Summary Statistics

### 4.1 Common Criteria Coverage

- **CC1 (Control Environment):** Fully aligned through governance and policy controls
- **CC2 (Communication and Information):** Fully aligned through security awareness and user agreements
- **CC3 (Risk Assessment):** Fully aligned through risk assessment processes
- **CC4 (Monitoring Activities):** Fully aligned through audit logging and continuous monitoring
- **CC5 (Control Activities):** Fully aligned through access control and configuration management
- **CC6 (Logical and Physical Access Controls):** Fully aligned through access control, authentication, and physical security
- **CC7 (System Operations):** Aligned through system operations, maintenance, and monitoring (some inherited)
- **CC8 (Change Management):** Fully aligned through configuration management and change control
- **CC9 (Risk Mitigation):** Fully aligned through incident response and vulnerability management

### 4.2 Readiness Completeness

**Design Readiness Status:**
- All 9 Common Criteria (CC1-CC9) are addressed
- Existing CMMC Level 2 controls support SOC 2 Common Criteria outcomes
- Inherited controls from Railway and GitHub support SOC 2 expectations
- POA&M items are actively managed (not blockers to design readiness)

**Gaps and Considerations:**
- Some SOC 2 Common Criteria may require additional design considerations beyond CMMC Level 2
- FIPS-validated cryptography (3.13.11) is tracked in POA&M
- Maintenance tool controls (3.7.2) are tracked in POA&M
- Design readiness demonstrates alignment, not operating effectiveness

---

## 5. Document Control

### 5.1 Version History

- **Version 1.0 (2026-01-25):** Initial Trust Services Criteria Mapping document creation

### 5.2 Review and Maintenance

**Review Schedule:**
- Annual review (scheduled)
- Review upon significant system changes
- Review upon CMMC documentation updates
- Review when SCTM is updated

**Next Review Date:** 2027-01-25

**Maintenance Responsibility:** Compliance Team

### 5.3 Related Documents

- SOC 2 Readiness Overview: `soc2-readiness-overview.md`
- System Description: `system-description.md`
- Risk Assessment: `soc2-risk-assessment.md`
- Claim Language: `soc2-claim-language.md`
- CMMC SCTM: `../cmmc/level2/04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- CMMC SSP: `../cmmc/level2/01-system-scope/MAC-IT-304_System_Security_Plan.md`

---

**Document Status:** This document is maintained under configuration control and is part of the MacTech Solutions compliance documentation package.

**Classification:** Internal Use

**Last Updated:** 2026-01-25

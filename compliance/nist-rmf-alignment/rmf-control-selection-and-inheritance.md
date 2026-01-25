# RMF Control Selection and Inheritance

**Document Version:** 1.0  
**Date:** 2026-01-25  
**Classification:** Internal Use  
**Framework:** NIST Risk Management Framework (RMF)  
**Reference:** NIST SP 800-53 Rev. 5, NIST SP 800-171 Rev. 2

**Applies to:** MacTech Solutions Application - CMMC 2.0 Level 2 System

---

## 1. Purpose

This document describes the control baseline rationale, control inheritance, and tailoring decisions for the MacTech Solutions Application in the context of RMF alignment. This document demonstrates how control selection and inheritance decisions align with RMF principles.

**Critical Statement:** This document describes control selection and inheritance for RMF alignment purposes. This document does not constitute a formal RMF control selection worksheet or formal control baseline documentation. This document demonstrates how existing control selection and inheritance decisions align with RMF principles.

**Source Documentation:** This document is derived from the existing System Control Traceability Matrix (SCTM) and Inherited Controls documentation: `../cmmc/level2/04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md` and `../cmmc/level2/03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md`.

---

## 2. Control Baseline Rationale

### 2.1 System Impact Level and Baseline Selection

**System Impact Level:** Moderate (as documented in `rmf-system-categorization.md`)

**Baseline Selection Rationale:**
- System is categorized as Moderate impact level (Confidentiality: Moderate, Integrity: Moderate, Availability: Low)
- NIST SP 800-53 Rev. 5 Moderate baseline is the appropriate control baseline for Moderate impact systems
- NIST SP 800-171 Rev. 2 controls are derived from NIST SP 800-53 Moderate baseline, tailored for non-federal systems handling CUI
- CMMC Level 2 requires implementation of all 110 NIST SP 800-171 Rev. 2 controls

**Control Baseline:**
- **Primary Baseline:** NIST SP 800-171 Rev. 2 (110 controls)
- **RMF Baseline Reference:** NIST SP 800-53 Rev. 5 Moderate baseline
- **Implementation Framework:** CMMC 2.0 Level 2

### 2.2 NIST 800-171 to NIST 800-53 Relationship

**Mapping Relationship:**
NIST SP 800-171 controls are derived from NIST SP 800-53 controls, tailored for non-federal systems handling CUI. The relationship is:

- **NIST 800-171** extracts relevant portions of **NIST 800-53** controls applicable to CUI protection
- **NIST 800-53** provides the broader control framework from which 800-171 requirements are derived
- Many NIST 800-171 controls map directly to corresponding NIST 800-53 controls
- Some NIST 800-53 control elements not essential to CUI protection are excluded from 800-171

**Example Mappings:**
- NIST 800-171 Control 3.1.1 (Limit system access) → NIST 800-53 AC-3 (Access Enforcement)
- NIST 800-171 Control 3.5.3 (MFA for privileged accounts) → NIST 800-53 IA-2 (1) (Multifactor Authentication)
- NIST 800-171 Control 3.3.1 (Create and retain audit logs) → NIST 800-53 AU-2 (Audit Events)
- NIST 800-171 Control 3.4.3 (Change control) → NIST 800-53 CM-3 (Configuration Change Control)
- NIST 800-171 Control 3.6.1 (Operational incident-handling capability) → NIST 800-53 IR-4 (Incident Handling)

**Important Note:** Satisfaction of a NIST 800-171 requirement does not automatically mean the full corresponding NIST 800-53 control has been met, since some control elements not essential to CUI protection are excluded from 800-171. This alignment documentation describes how existing CMMC Level 2 control selection aligns with RMF control baseline expectations.

### 2.3 Control Baseline Coverage

**Control Families Addressed:**
The NIST SP 800-171 Rev. 2 baseline addresses the following control families (mapped to NIST SP 800-53 Rev. 5 families):

- **AC (Access Control)** - 22 controls
- **IA (Identification and Authentication)** - 11 controls
- **AU (Audit and Accountability)** - 9 controls
- **CM (Configuration Management)** - 9 controls
- **IR (Incident Response)** - 3 controls
- **MA (Maintenance)** - 6 controls
- **MP (Media Protection)** - 9 controls
- **PS (Personnel Security)** - 2 controls
- **PE (Physical and Environmental Protection)** - 6 controls
- **RA (Risk Assessment)** - 3 controls
- **SA (System and Services Acquisition)** - Not directly addressed in 800-171
- **SC (System and Communications Protection)** - 16 controls
- **SI (System and Information Integrity)** - 7 controls
- **AT (Awareness and Training)** - 3 controls

**Total Controls:** 110 NIST SP 800-171 Rev. 2 controls

**Reference:** See `../cmmc/level2/04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md` for complete control listing and status.

---

## 3. Control Inheritance

### 3.1 Inheritance Model

**Shared Responsibility Model:**
The system operates under a shared responsibility model where certain security controls are inherited from third-party service providers, while organizational controls are implemented internally.

**Inheritance Documentation:**
All inherited controls are documented in the Inherited Controls Appendix: `../cmmc/level2/03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md`

### 3.2 Railway Platform - Inherited Controls

**Service Provider:** Railway Cloud Platform (Platform as a Service)

**Inherited Control Families:**

**Physical and Environmental Protection (PE):**
- Data center physical access controls
- Environmental controls (temperature, humidity, fire suppression)
- Facility security (guards, surveillance, access logs)
- Redundant power and cooling systems
- Physical infrastructure security

**System and Communications Protection (SC):**
- TLS/HTTPS termination and certificate management
- Network encryption (data in transit)
- DDoS protection
- Firewall rules and network security
- Database encryption at rest
- Automated backups

**System and Information Integrity (SI):**
- Platform-level malware protection
- Automated threat detection
- File scanning capabilities
- Platform update management

**Maintenance (MA):**
- Platform maintenance and patching
- Infrastructure maintenance

**Inherited Control Count:** 12 controls (11% of total)

**Organizational Responsibility:**
- Application-layer security controls
- Access control and authentication
- Audit logging and monitoring
- Configuration management
- Incident response
- Risk assessment
- Security assessment

**Reference:** See `../cmmc/level2/03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md` Section "Railway Platform - Inherited Controls" for detailed documentation.

### 3.3 GitHub Platform - Inherited Controls

**Service Provider:** GitHub (Source Code Repository)

**Inherited Control Families:**

**Access Control (AC):**
- Repository access controls
- Authentication and authorization
- Branch protection rules

**System and Information Integrity (SI):**
- Dependabot automated vulnerability scanning (weekly)
- Security advisories
- Dependency vulnerability alerts
- Automated pull requests for security updates

**Inherited Control Count:** Included in overall inheritance count

**Organizational Responsibility:**
- Repository access management
- Code review and approval processes
- Dependency update review and merging
- Vulnerability remediation

**Reference:** See `../cmmc/level2/03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md` Section "GitHub Platform - Source Control Security" for detailed documentation.

### 3.4 Inheritance Assurance

**Assurance Types:**
- **Platform Security Documentation:** Railway and GitHub provide security documentation and certifications
- **Operational Reliance:** Organization relies on platform providers for inherited control implementation
- **Documentation:** Inherited controls are documented with evidence locations

**Limitations:**
- Organization does not claim responsibility for third-party provider security posture
- Organization documents inherited controls but does not independently assess provider controls
- Inherited controls are documented for transparency and traceability

---

## 4. Tailoring Decisions

### 4.1 Tailoring Approach

**RMF Tailoring Principles:**
- Tailoring decisions are informed by system context and risk
- Tailoring rationale is documented
- Tailoring decisions are reviewed and approved
- Tailoring does not compromise security objectives

**Tailoring Authority:**
- System Administrator / Compliance Officer
- Tailoring decisions documented in SCTM
- Tailoring rationale documented in this document

### 4.2 Cloud-Only Architecture Tailoring

**Architecture Characteristics:**
- Cloud-hosted application (no on-premises infrastructure)
- Platform as a Service (PaaS) hosting model
- No physical infrastructure under organizational control

**Tailoring Decisions:**

**Controls Not Applicable (14 controls, 13%):**
- **Physical Security Controls:** Some physical security controls are not applicable due to cloud-only architecture (e.g., 3.10.x controls related to organizational facilities)
- **Wireless Access Controls:** Wireless access controls are not applicable (3.1.16, 3.1.17) - cloud-only, no organizational wireless infrastructure
- **Maintenance Controls:** Some maintenance controls are not applicable (3.7.3, 3.7.4, 3.7.6) - cloud-only, no customer equipment or maintenance personnel
- **Media Protection Controls:** Some media protection controls are not applicable (3.8.4, 3.8.5) - digital-only, no physical media

**Rationale:**
- Cloud-only architecture eliminates need for certain physical security controls
- Platform provider (Railway) provides physical security as inherited control
- Tailoring decisions are risk-informed and documented

**Reference:** See `../cmmc/level2/04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md` for complete list of not applicable controls.

### 4.3 SaaS Delivery Model Tailoring

**Service Model Characteristics:**
- Software as a Service (SaaS) delivery model
- Web-based application accessible via browser
- No client software installation required

**Tailoring Decisions:**

**Controls Tailored:**
- **Endpoint Controls:** Endpoint security controls are tailored to reflect browser-based access model (3.1.18, 3.1.19)
- **Mobile Device Controls:** Mobile device controls are tailored to reflect browser-based access (3.1.18, 3.1.19)
- **Client-Side Controls:** Some client-side controls are tailored or not applicable

**Rationale:**
- SaaS delivery model reduces need for certain client-side controls
- Browser-based access model simplifies endpoint security considerations
- Tailoring decisions are risk-informed and documented

### 4.4 Risk-Informed Tailoring

**Risk Assessment Basis:**
Tailoring decisions are informed by:
- System risk assessment (see `rmf-risk-assessment-and-treatment.md`)
- Threat analysis
- Vulnerability assessment
- System context and architecture

**Tailoring Documentation:**
- Tailoring decisions documented in SCTM
- Tailoring rationale documented in this document
- Tailoring decisions reviewed and approved

**Reference:** See `../cmmc/level2/04-self-assessment/MAC-AUD-404_Risk_Assessment_Report.md` for risk assessment details.

---

## 5. Control Selection Summary

### 5.1 Control Implementation Status

**Total Controls:** 110 (NIST SP 800-171 Rev. 2)

**Implementation Status:**
- **Implemented:** 81 controls (74%)
- **Inherited:** 12 controls (11%) - Railway and GitHub platform providers
- **POA&M:** 3 controls (3%) - Actively managed with remediation plans
- **Not Applicable:** 14 controls (13%) - Cloud-only architecture

**Overall Readiness:** 97% (Implemented + Inherited)

**Reference:** See `../cmmc/level2/00-cover-memo/MAC-FRM-202_CMMC_Level_2_Executive_Attestation.md` for implementation status summary.

### 5.2 Control Family Implementation

**Access Control (AC) - 22 controls:**
- Implemented: 20 controls
- Inherited: 2 controls
- Not Applicable: 0 controls
- Readiness: 100%

**Identification and Authentication (IA) - 11 controls:**
- Implemented: 11 controls
- Inherited: 0 controls
- Not Applicable: 0 controls
- Readiness: 100%

**Audit and Accountability (AU) - 9 controls:**
- Implemented: 8 controls
- Inherited: 1 control
- Not Applicable: 0 controls
- Readiness: 100%

**Configuration Management (CM) - 9 controls:**
- Implemented: 8 controls
- Inherited: 1 control
- Not Applicable: 0 controls
- Readiness: 100%

**System and Communications Protection (SC) - 16 controls:**
- Implemented: 1 control
- Inherited: 10 controls
- Not Applicable: 5 controls
- Readiness: 69% (implemented + inherited)

**System and Information Integrity (SI) - 7 controls:**
- Implemented: 4 controls
- Inherited: 2 controls
- Not Applicable: 1 control
- Readiness: 86% (implemented + inherited)

**Other Control Families:**
- Risk Assessment (RA): 3 controls - 100% implemented
- Security Assessment (SA): 4 controls - 100% implemented
- Incident Response (IR): 3 controls - 100% implemented
- Maintenance (MA): 6 controls - Mixed (inherited and not applicable)
- Media Protection (MP): 9 controls - Mixed (implemented and inherited)
- Personnel Security (PS): 2 controls - 100% implemented
- Physical Protection (PE): 6 controls - Mixed (inherited and not applicable)
- Awareness and Training (AT): 3 controls - 100% implemented

**Reference:** See `../cmmc/level2/04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md` for detailed control family breakdown.

---

## 6. Control Selection Alignment with RMF

### 6.1 RMF Step 2 - Select Alignment

**RMF Requirement:** Select appropriate security controls from NIST SP 800-53 based on impact level.

**Alignment Approach:**
- Control baseline is derived from NIST SP 800-171 Rev. 2 (110 controls) for CMMC Level 2
- NIST SP 800-171 controls map to NIST SP 800-53 Moderate baseline
- Control selection aligns with Moderate impact level categorization
- Control tailoring decisions are documented and risk-informed

**Alignment Status:** Aligned (control selection and tailoring decisions documented)

### 6.2 Control Baseline Rationale

**Baseline Selection:**
- System categorized as Moderate impact level
- NIST SP 800-53 Moderate baseline selected as reference
- NIST SP 800-171 Rev. 2 controls implemented (derived from 800-53 Moderate baseline)
- Control selection rationale documented

**Control Coverage:**
- All applicable NIST SP 800-171 controls are addressed (implemented, inherited, or POA&M)
- Control families align with RMF control family expectations
- Control implementation status documented in SCTM

### 6.3 Tailoring Alignment

**Tailoring Decisions:**
- Tailoring decisions are documented and risk-informed
- Tailoring rationale is provided for each tailoring decision
- Tailoring does not compromise security objectives
- Tailoring decisions align with RMF tailoring principles

**Tailoring Documentation:**
- Tailoring decisions documented in SCTM
- Tailoring rationale documented in this document
- Tailoring decisions reviewed and approved

---

## 7. Document Control

### 7.1 Version History

- **Version 1.0 (2026-01-25):** Initial Control Selection and Inheritance document creation

### 7.2 Review and Maintenance

**Review Schedule:**
- Annual review (scheduled)
- Review upon significant system changes
- Review upon changes to control baseline or inheritance
- Review when SCTM is updated

**Next Review Date:** 2027-01-25

**Maintenance Responsibility:** Compliance Team

### 7.3 Related Documents

- RMF Alignment Overview: `rmf-alignment-overview.md`
- System Categorization: `rmf-system-categorization.md`
- Implementation Summary: `rmf-implementation-summary.md`
- CMMC SCTM: `../cmmc/level2/04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- Inherited Controls: `../cmmc/level2/03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md`
- CMMC SSP: `../cmmc/level2/01-system-scope/MAC-IT-304_System_Security_Plan.md`

---

**Document Status:** This document is maintained under configuration control and is part of the MacTech Solutions compliance documentation package.

**Classification:** Internal Use

**Last Updated:** 2026-01-25

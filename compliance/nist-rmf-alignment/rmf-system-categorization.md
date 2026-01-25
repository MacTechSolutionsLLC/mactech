# RMF System Categorization

**Document Version:** 1.0  
**Date:** 2026-01-25  
**Classification:** Internal Use  
**Framework:** NIST Risk Management Framework (RMF)  
**Reference:** FIPS 199, NIST SP 800-60 Rev. 1

**Applies to:** MacTech Solutions Application - CMMC 2.0 Level 2 System

---

## 1. Purpose

This document provides a system categorization narrative for the MacTech Solutions Application using FIPS 199-style reasoning. This categorization demonstrates how the system would be categorized under RMF principles, based on the types of information processed and the potential impact of security breaches.

**Critical Statement:** This is a categorization narrative prepared for RMF alignment purposes. This document does not constitute a formal FIPS 199 security categorization worksheet or formal RMF categorization. This document demonstrates how existing system characteristics align with RMF categorization principles.

**Source Documentation:** This document is derived from the existing System Security Plan and System Architecture documentation: `../cmmc/level2/01-system-scope/MAC-IT-304_System_Security_Plan.md` and `../cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md`.

---

## 2. System Purpose and Mission Context

### 2.1 System Purpose

**System Name:** MacTech Solutions Application  
**System Type:** Web-based federal contract opportunity management and capture platform  
**Service Model:** Software as a Service (SaaS)  
**Hosting:** Railway Cloud Platform (Platform as a Service)

**Primary Functions:**
- Discovery and ingestion of federal contract opportunities from SAM.gov
- Storage and analysis of Federal Contract Information (FCI) and Controlled Unclassified Information (CUI)
- Contract opportunity scoring and relevance assessment
- Award history tracking via USAspending.gov integration
- Administrative portal for authorized users
- CUI file storage and password-protected access

### 2.2 Mission Context

**Mission Support:**
The MacTech Solutions Application supports DoD contractors and federal programs by providing tools for discovering, analyzing, and managing federal contracting opportunities. The system enables authorized personnel to:

- Identify relevant contract opportunities
- Analyze contract requirements and award history
- Manage contract-related information and documentation
- Support business development and proposal activities

**Mission Criticality:**
While the system supports important business functions, it is not directly involved in mission-critical operations that would result in immediate harm to national security or public safety if unavailable. The system primarily supports business development and administrative functions.

---

## 3. Information Types Processed

### 3.1 Federal Contract Information (FCI)

**Definition:** Only non-public information related to government contracts is treated as FCI. Publicly released information (e.g., SAM.gov postings) is not FCI unless combined with internal, non-public data.

**FCI Types:**
- Non-public contract opportunity data received, generated, or stored internally
- Internal analysis and annotations related to contract opportunities
- User-generated content that combines public data with internal, non-public information
- Derived data generated from internal processing of contract information

**FCI Handling:**
- FCI is stored in PostgreSQL database on Railway platform
- FCI access is restricted to authenticated users with appropriate authorization
- FCI is processed and analyzed within the application
- FCI is not stored on removable media

**Reference:** See `../cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md` Section 2.1 for detailed FCI handling procedures.

### 3.2 Controlled Unclassified Information (CUI)

**Definition:** CUI as defined by 32 CFR Part 2002 and the CUI Registry.

**CUI Types:**
- Contract proposals
- Statements of Work (SOWs)
- Contract documentation
- Other information containing CUI per Level 2 requirements

**CUI Handling:**
- CUI files are stored separately from FCI files in `StoredCUIFile` database table
- CUI files require password protection for access
- CUI keyword auto-detection for file classification
- CUI access attempts logged to audit log

**Reference:** See `../cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md` Section 2.2 for detailed CUI handling procedures.

### 3.3 User Authentication Data

**Data Types:**
- User account information (email, name, role)
- Password hashes (bcrypt, 12 rounds)
- Multi-factor authentication (MFA) data for ADMIN accounts
- Session tokens and authentication state

**Protection:**
- Passwords are hashed using bcrypt (12 rounds)
- MFA data is stored securely
- Session tokens are managed securely via NextAuth.js

### 3.4 System Configuration and Audit Logs

**Data Types:**
- System configuration data
- Audit logs and system events
- Security event logs
- Administrative action logs

**Protection:**
- Audit logs retained for minimum 90 days
- Audit logs stored in database
- Audit log export functionality available

---

## 4. Impact Level Assessment (FIPS 199-style)

### 4.1 FIPS 199 Impact Definitions

**Low Impact:** The loss of confidentiality, integrity, or availability could be expected to have a **limited** adverse effect on organizational operations, organizational assets, or individuals.

**Moderate Impact:** The loss of confidentiality, integrity, or availability could be expected to have a **serious** adverse effect on organizational operations, organizational assets, or individuals.

**High Impact:** The loss of confidentiality, integrity, or availability could be expected to have a **severe or catastrophic** adverse effect on organizational operations, organizational assets, or individuals.

### 4.2 Confidentiality Impact Assessment

**Information Types:**
- Controlled Unclassified Information (CUI)
- Federal Contract Information (FCI)
- User authentication data
- System configuration and audit logs

**Impact Analysis:**
- **CUI Disclosure:** Unauthorized disclosure of CUI could result in serious adverse effects, including compromise of contract information, competitive disadvantage, and potential harm to organizational reputation and business operations.
- **FCI Disclosure:** Unauthorized disclosure of FCI could result in serious adverse effects, including compromise of business development strategies and competitive information.
- **Authentication Data Disclosure:** Unauthorized disclosure of authentication data could result in serious adverse effects, including unauthorized system access and potential data breaches.

**Confidentiality Impact Level:** **MODERATE**

**Rationale:** The system processes CUI and FCI, which if disclosed could cause serious adverse effects on organizational operations and assets. While the impact would be serious, it would not be severe or catastrophic (no classified information, no life-threatening consequences).

### 4.3 Integrity Impact Assessment

**Information Types:**
- Controlled Unclassified Information (CUI)
- Federal Contract Information (FCI)
- User authentication data
- System configuration and audit logs

**Impact Analysis:**
- **CUI Modification:** Unauthorized modification of CUI could result in serious adverse effects, including incorrect contract information, compromised business decisions, and potential legal or contractual issues.
- **FCI Modification:** Unauthorized modification of FCI could result in serious adverse effects, including incorrect business intelligence and compromised decision-making.
- **Authentication Data Modification:** Unauthorized modification of authentication data could result in serious adverse effects, including unauthorized access and system compromise.
- **Audit Log Modification:** Unauthorized modification of audit logs could result in serious adverse effects, including loss of accountability and inability to detect security incidents.

**Integrity Impact Level:** **MODERATE**

**Rationale:** Unauthorized modification of CUI, FCI, or system data could cause serious adverse effects on organizational operations and assets. While the impact would be serious, it would not be severe or catastrophic (no direct impact on life, health, or national security).

### 4.4 Availability Impact Assessment

**System Functions:**
- Contract opportunity discovery and analysis
- CUI and FCI storage and retrieval
- Administrative functions
- User authentication and authorization

**Impact Analysis:**
- **Temporary Loss of Availability:** Temporary loss of system availability would cause limited adverse effects. The system supports business development and administrative functions, but these functions are not mission-critical in a way that would cause immediate harm if temporarily unavailable.
- **Extended Loss of Availability:** Extended loss of system availability could cause more significant adverse effects, but would still be limited compared to mission-critical systems. Alternative methods for accessing contract information exist (direct SAM.gov access, manual processes).

**Availability Impact Level:** **LOW**

**Rationale:** While the system supports important business functions, temporary loss of availability would cause limited adverse effects. The system is not directly involved in mission-critical operations that would result in immediate harm if unavailable.

### 4.5 Overall System Impact Level

**FIPS 199 Rule:** The overall system impact level is the highest impact level assigned to any of the three security objectives (Confidentiality, Integrity, Availability).

**Security Objectives:**
- **Confidentiality:** MODERATE
- **Integrity:** MODERATE
- **Availability:** LOW

**Overall System Impact Level:** **MODERATE**

**Rationale:** The system is assigned a Moderate impact level because at least one security objective (Confidentiality and Integrity) is rated Moderate, and no security objective is rated High. This aligns with the system's handling of CUI and FCI, which requires Moderate-level security controls.

---

## 5. Assumptions and Scoping Boundaries

### 5.1 System Boundary

**In-Scope Components:**
- Next.js 14 web application (TypeScript, React)
- PostgreSQL database (Railway managed service)
- User accounts and authentication data
- FCI and CUI data
- Audit logs and system events
- Railway hosting infrastructure (inherited controls)
- GitHub source code repository (inherited controls)

**Out-of-Scope Components:**
- Developer workstations and local development environments
- End-user devices and client browsers
- External APIs (SAM.gov API, USAspending.gov API) - read-only services
- Classified information (not applicable to this system)
- Enterprise IT systems beyond the application system

### 5.2 Cloud-Only Architecture Assumptions

**Architecture Characteristics:**
- Cloud-hosted application (no on-premises infrastructure)
- Platform as a Service (PaaS) hosting model
- No physical infrastructure under organizational control
- No organizational data center facilities

**Impact on Categorization:**
- Physical security controls are inherited from cloud provider
- Some controls related to physical infrastructure are not applicable
- Network security controls are primarily inherited
- System categorization focuses on logical security boundaries

### 5.3 Information Type Assumptions

**CUI Assumptions:**
- CUI is limited to contract-related information as defined by 32 CFR Part 2002
- CUI does not include classified information
- CUI does not include information that would result in High impact if disclosed

**FCI Assumptions:**
- FCI is limited to non-public contract information
- Publicly available information from SAM.gov is not FCI unless combined with internal data
- FCI does not include information that would result in High impact if disclosed

### 5.4 Mission Context Assumptions

**Mission Support Assumptions:**
- System supports business development and administrative functions
- System is not directly involved in mission-critical operations
- Temporary loss of availability would not cause immediate harm
- System supports DoD contractors but is not a DoD system itself

---

## 6. Categorization Summary

### 6.1 Security Impact Levels

| Security Objective | Impact Level | Rationale |
|-------------------|--------------|-----------|
| Confidentiality | MODERATE | CUI and FCI disclosure could cause serious adverse effects |
| Integrity | MODERATE | Unauthorized modification could cause serious adverse effects |
| Availability | LOW | Temporary loss would cause limited adverse effects |
| **Overall System Impact** | **MODERATE** | Highest impact level (Moderate) |

### 6.2 Categorization Narrative

The MacTech Solutions Application is categorized as a **MODERATE** impact system under FIPS 199-style reasoning. This categorization is based on:

1. **Confidentiality Impact (MODERATE):** The system processes CUI and FCI, which if disclosed could cause serious adverse effects on organizational operations and assets.

2. **Integrity Impact (MODERATE):** Unauthorized modification of CUI, FCI, or system data could cause serious adverse effects on organizational operations and assets.

3. **Availability Impact (LOW):** Temporary loss of system availability would cause limited adverse effects, as the system supports business development functions rather than mission-critical operations.

4. **Overall Impact (MODERATE):** The system is assigned a Moderate impact level because at least one security objective (Confidentiality and Integrity) is rated Moderate, and no security objective is rated High.

### 6.3 Control Baseline Implications

**Moderate Impact Level Baseline:**
- NIST SP 800-53 Rev. 5 Moderate baseline controls
- NIST SP 800-171 Rev. 2 controls (derived from 800-53 Moderate baseline)
- CMMC Level 2 controls (based on NIST 800-171)

**Control Selection:**
- Control baseline selection aligns with Moderate impact level
- Control tailoring decisions are informed by system context and risk
- Control inheritance from cloud providers is documented

**Reference:** See `rmf-control-selection-and-inheritance.md` for control baseline selection and tailoring decisions.

---

## 7. Document Control

### 7.1 Version History

- **Version 1.0 (2026-01-25):** Initial System Categorization document creation

### 7.2 Review and Maintenance

**Review Schedule:**
- Annual review (scheduled)
- Review upon significant system changes
- Review upon changes to information types processed
- Review upon changes to mission context

**Next Review Date:** 2027-01-25

**Maintenance Responsibility:** Compliance Team

### 7.3 Related Documents

- RMF Alignment Overview: `rmf-alignment-overview.md`
- Control Selection and Inheritance: `rmf-control-selection-and-inheritance.md`
- Implementation Summary: `rmf-implementation-summary.md`
- CMMC SSP: `../cmmc/level2/01-system-scope/MAC-IT-304_System_Security_Plan.md`
- CMMC Architecture: `../cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md`
- FedRAMP Architecture: `../fedramp-moderate-alignment/system-boundary-and-architecture.md`

---

**Document Status:** This document is maintained under configuration control and is part of the MacTech Solutions compliance documentation package.

**Classification:** Internal Use

**Last Updated:** 2026-01-25

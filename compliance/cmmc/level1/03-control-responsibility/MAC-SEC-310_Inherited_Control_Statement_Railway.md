# Inherited Control Statement - Railway Platform

**Document Version:** 1.0  
**Date:** 2026-01-21  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 1 (Foundational)  
**Reference:** FAR 52.204-21

**Applies to:** CMMC 2.0 Level 1 (FCI-only system)

---

## 1. Purpose

This document clearly states which security controls are inherited from the Railway cloud platform and establishes the organization's reliance on Railway for these controls. This statement addresses assessor concerns regarding substantiation of inherited controls and avoids overclaims about Railway's compliance posture.

---

## 2. Railway Platform Overview

**Platform:** Railway is a cloud Platform-as-a-Service (PaaS) provider that hosts the MacTech Solutions application and database infrastructure.

**Services Used:**
- Application hosting (Next.js application)
- PostgreSQL database hosting
- Network infrastructure
- TLS/HTTPS termination

**Contractual Relationship:** Organization has a service agreement with Railway for cloud hosting services.

---

## 3. Inherited Controls

The following security controls are **inherited** from the Railway platform. The organization **relies on Railway** for these controls but **does not claim responsibility for Railway's security posture**.

### 3.1 TLS/HTTPS Encryption

**Control:** All network communications are encrypted using TLS/HTTPS.

**Railway Implementation:**
- Railway platform provides automatic HTTPS/TLS for all applications
- TLS certificates are managed by Railway
- All client-to-application and application-to-database communications are encrypted

**Organization Reliance:**
- Organization relies on Railway platform for TLS/HTTPS encryption
- Organization does not manage TLS certificates or encryption configuration
- Organization does not claim responsibility for Railway's TLS implementation

**Status:** Inherited control from Railway platform.

**Evidence:** Railway platform configuration. All application URLs are served over HTTPS.

**Third-Party Assurance:** Inherited controls are validated via third-party assurance reports maintained by the hosting provider. These artifacts are reviewed annually and available upon request.

---

### 3.2 Physical Security

**Control:** Physical security of data center facilities.

**Railway Implementation:**
- Railway operates data centers with physical access controls
- Environmental controls (temperature, humidity, fire suppression)
- Facility security (guards, surveillance, access logs)
- Redundant power and cooling systems

**Organization Reliance:**
- Organization relies on Railway for physical security of cloud infrastructure
- Organization does not have physical access to Railway data centers
- Organization does not claim responsibility for Railway's physical security posture

**Status:** Inherited control from Railway platform.

**Evidence:** Railway platform operates cloud infrastructure. Organization does not manage physical facilities.

---

### 3.3 Infrastructure Security

**Control:** Network security and infrastructure-level security.

**Railway Implementation:**
- Railway provides network-level security capabilities
- Security capabilities are relied upon operationally from the service provider but are not independently assessed as part of this CMMC Level 1 self-assessment

**Organization Reliance:**
- Organization relies on Railway for infrastructure-level security
- Organization does not manage network infrastructure
- Organization does not claim responsibility for Railway's infrastructure security
- Security capabilities are relied upon operationally but are not independently verified

**Status:** Inherited control from Railway platform.

**Evidence:** Railway platform provides infrastructure services. Organization does not manage network infrastructure. Security capabilities are relied upon operationally but are not independently assessed.

---

### 3.4 Database Security

**Control:** Database security capabilities for stored data.

**Railway Implementation:**
- Railway PostgreSQL service provides security capabilities for database storage
- Security capabilities are relied upon operationally from the service provider but are not independently assessed as part of this CMMC Level 1 self-assessment

**Organization Reliance:**
- Organization relies on Railway for database security capabilities
- Organization does not manage database encryption or encryption keys
- Organization does not claim responsibility for Railway's security implementation
- Security capabilities are relied upon operationally but are not independently verified

**Status:** Inherited control from Railway platform.

**Evidence:** Railway PostgreSQL service provides database services. Organization uses Railway-managed database service. Security capabilities are relied upon operationally but are not independently assessed.

---

### 3.5 Malware Protection

**Control:** Malware protection at infrastructure level.

**Railway Implementation:**
- Railway platform includes infrastructure-level malware protection
- Automated threat detection and mitigation
- Platform-level security scanning

**Organization Reliance:**
- Organization relies on Railway for infrastructure-level malware protection
- Organization does not manage infrastructure-level malware protection
- Organization does not claim responsibility for Railway's malware protection

**Status:** Inherited control from Railway platform.

**Evidence:** Railway platform provides infrastructure-level security. Organization does not manage infrastructure-level malware protection.

---

## 4. Organization Responsibilities

### 4.1 Application-Level Controls

**Organization Responsibility:** The organization is responsible for:
- Application-level security controls
- Authentication and authorization
- Input validation and output encoding
- Application code security
- User access management

**Evidence:** Application code, authentication system, access control middleware. See policy documents for detailed implementation.

---

### 4.2 Data Management

**Organization Responsibility:** The organization is responsible for:
- FCI handling and protection
- User training and awareness
- Access control policies and procedures
- Data disposal procedures
- Incident response

**Evidence:** Policy documents, procedures, user acknowledgments. See policy documents for detailed implementation.

---

## 5. Limitations and Disclaimers

### 5.1 No Compliance Certification Claims

**Statement:** This document does not claim that Railway holds any specific compliance certifications (e.g., FedRAMP, SOC 2, ISO 27001) unless explicitly documented in Railway's publicly available documentation.

**Organization Position:** Organization relies on Railway for inherited controls but does not claim Railway's compliance certifications as organization certifications.

---

### 5.2 Responsibility Transfer

**Statement:** Organization does not claim that responsibility for inherited controls is transferred to Railway. Organization acknowledges reliance on Railway but maintains responsibility for overall system security and FCI protection.

**Organization Position:** Organization is responsible for ensuring that inherited controls are adequate for CMMC Level 1 compliance, but does not claim responsibility for Railway's security posture.

---

### 5.3 Service Agreement

**Statement:** Organization's reliance on Railway is based on service agreement and Railway's platform capabilities. Organization does not have direct control over Railway's security implementation.

**Organization Position:** Organization monitors Railway platform status and security but does not manage Railway's security controls directly.

---

## 6. Inherited Control Matrix

| Control | Inherited From | Organization Responsibility | Evidence |
|---------|----------------|----------------------------|----------|
| TLS/HTTPS Encryption | Railway | Reliance only | Railway platform |
| Physical Security | Railway | Reliance only | Railway platform |
| Infrastructure Security | Railway | Reliance only | Railway platform |
| Database Security | Railway | Reliance only | Railway PostgreSQL service |
| Malware Protection (Infrastructure) | Railway | Reliance only | Railway platform |

**Note:** "Reliance only" means organization relies on Railway for the control but does not claim responsibility for Railway's implementation.

**See also:** `Inherited_Controls_Railway.md` for detailed shared responsibility table.

---

## 7. Compliance Risks & Open Items

### 7.1 Railway Platform Changes

**Risk:** Railway platform changes may affect inherited controls.

**Mitigation:** Organization monitors Railway platform status and security announcements. Changes to inherited controls would be assessed for compliance impact.

---

### 7.2 Service Agreement Review

**Status:** Organization reviews Railway service agreement and platform capabilities. Formal assessment of Railway's security posture may be conducted as a future enhancement.

---

## 8. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be completed]

**Change History:**
- Version 1.0 (2026-01-21): Initial document creation to address assessor finding L1-INH-07

---

## Appendix A: Related Documents

- Inherited Controls Responsibility Matrix (`MAC-RPT-311_Inherited_Controls_Responsibility_Matrix.md`)
- System Description (`01-system-scope/MAC-IT-301_System_Description_and_Architecture.md`)
- Physical Security Policy (`02-policies-and-procedures/MAC-POL-212_Physical_Security_Policy.md`)

## Appendix B: Railway Platform Information

**Platform:** Railway (railway.app)  
**Services Used:** Application hosting, PostgreSQL database  
**Service Agreement:** [Reference service agreement if available]

**Note:** This document describes organization's reliance on Railway platform. For Railway's specific security capabilities and certifications, refer to Railway's publicly available documentation.

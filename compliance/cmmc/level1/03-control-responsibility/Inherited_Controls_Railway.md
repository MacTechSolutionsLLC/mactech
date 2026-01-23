# Inherited Controls - Railway Platform Shared Responsibility

**Document Version:** 1.0  
**Date:** 2026-01-22  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 1 (Foundational)  
**Reference:** FAR 52.204-21

**Applies to:** CMMC 2.0 Level 1 (FCI-only system)

---

## 1. Purpose

This document provides an explicit shared responsibility table for security controls between Railway (hosting provider) and the system owner (MacTech Solutions). This document establishes clear boundaries for inherited controls and ensures assessor-ready documentation.

---

## 2. Shared Responsibility Model

The following table explicitly defines what Railway provides and what the system owner is responsible for:

| Control Area | Railway Responsibility | System Owner Responsibility | Evidence Location |
|--------------|------------------------|----------------------------|-------------------|
| **TLS/HTTPS Encryption** | Provides automatic HTTPS/TLS termination<br>Manages TLS certificates<br>Encrypts all data in transit | Relies on Railway for TLS/HTTPS<br>Does not manage certificates<br>Does not claim responsibility for Railway's TLS implementation | Railway platform configuration<br>Application URLs served over HTTPS |
| **Physical Security** | Data center physical access controls<br>Environmental controls (temperature, humidity, fire suppression)<br>Facility security (guards, surveillance)<br>Redundant power and cooling | Relies on Railway for physical security<br>Does not have physical access to data centers<br>Does not claim responsibility for Railway's physical security | Railway platform operates cloud infrastructure<br>Organization does not manage physical facilities |
| **Host Patching** | Platform patching and updates<br>Operating system security updates<br>Infrastructure maintenance | Relies on Railway for host patching<br>Does not manage underlying infrastructure<br>Does not claim responsibility for Railway's patching | Railway platform manages infrastructure<br>Organization does not manage host-level patching |
| **Network Security** | Network-level security capabilities<br>DDoS protection<br>Firewall rules<br>Network infrastructure security | Relies on Railway for network security<br>Does not manage network infrastructure<br>Security capabilities relied upon operationally but not independently assessed | Railway platform provides infrastructure<br>Organization does not manage network infrastructure |
| **Database Security** | Database encryption at rest<br>Database access controls<br>Backup and recovery<br>Database infrastructure security | Relies on Railway for database security<br>Does not manage database encryption keys<br>Security capabilities relied upon operationally but not independently assessed | Railway PostgreSQL service<br>Organization uses Railway-managed database |
| **Malware Protection (Infrastructure)** | Infrastructure-level malware protection<br>Platform-level security scanning<br>Automated threat detection | Relies on Railway for infrastructure-level malware protection<br>Does not manage infrastructure-level malware protection<br>Does not claim responsibility for Railway's malware protection | Railway platform provides infrastructure-level security<br>Organization does not manage infrastructure-level malware protection |
| **Network Segmentation** | Network infrastructure and segmentation<br>Logical separation of application and database tiers<br>Network boundaries and access controls | Relies on Railway for network segmentation<br>Does not manage network infrastructure<br>Security capabilities relied upon operationally but not independently assessed | Railway platform provides network infrastructure<br>Application and database operate in separate network tiers |
| **Application Security** | N/A | Application-level security controls<br>Authentication and authorization<br>Input validation<br>Application code security<br>User access management | Application code (`lib/auth.ts`, `middleware.ts`)<br>Policy documents |
| **FCI Handling** | N/A | FCI handling and protection<br>User training and awareness<br>Access control policies<br>Data disposal procedures<br>Incident response | Policy documents<br>User acknowledgments<br>Procedures |

---

## 3. Inherited Controls Statement

The following controls are **inherited** from Railway:

- **TLS/HTTPS Encryption:** All network communications are encrypted using TLS. Railway provides automatic HTTPS/TLS termination and manages TLS certificates. The system owner does not manage TLS certificates or encryption configuration.

- **Physical Security:** Physical security of data center facilities is provided by Railway. Railway operates data centers with physical access controls, environmental controls, and facility security. The system owner does not have physical access to Railway data centers.

- **Host Patching:** Platform patching and updates are managed by Railway. The system owner does not manage underlying infrastructure or host-level patching.

- **Network Security:** Network-level security capabilities are provided by Railway. Security capabilities are relied upon operationally from the service provider but are not independently assessed as part of this CMMC Level 1 self-assessment.

- **Database Security:** Database security capabilities for stored data are provided by Railway PostgreSQL service. Security capabilities are relied upon operationally from the service provider but are not independently assessed as part of this CMMC Level 1 self-assessment.

- **Malware Protection (Infrastructure):** Infrastructure-level malware protection is provided by Railway platform. The system owner does not manage infrastructure-level malware protection.

- **Network Segmentation:** Network infrastructure and segmentation are provided by Railway platform. Railway provides logical network separation between publicly accessible system components (application tier) and internal network components (database tier). The application (Next.js) operates in a public-facing network tier, while the database (PostgreSQL) operates in an internal network tier with controlled access. Network boundaries and access controls are managed by Railway. The system owner does not manage network infrastructure or segmentation configuration.

---

## 4. Third-Party Assurance

**Inherited controls are validated via third-party assurance reports maintained by the hosting provider. These artifacts are reviewed annually and available upon request.**

The organization:
- Reviews Railway platform security documentation annually
- Monitors Railway platform status and security announcements
- Maintains service agreement documentation
- Does not independently assess Railway's security posture

---

## 5. System Owner Responsibilities

The system owner is responsible for:

1. **Application-Level Controls:**
   - Authentication and authorization
   - Input validation and output encoding
   - Application code security
   - User access management

2. **FCI Protection:**
   - FCI handling and protection
   - User training and awareness
   - Access control policies and procedures
   - Data disposal procedures
   - Incident response

3. **Compliance:**
   - Ensuring inherited controls are adequate for CMMC Level 1 compliance
   - Documenting reliance on Railway for inherited controls
   - Maintaining evidence of control implementation

---

## 6. Limitations

### 6.1 No Compliance Certification Claims

This document does not claim that Railway holds any specific compliance certifications (e.g., FedRAMP, SOC 2, ISO 27001) unless explicitly documented in Railway's publicly available documentation.

### 6.2 Responsibility Transfer

The organization does not claim that responsibility for inherited controls is transferred to Railway. The organization acknowledges reliance on Railway but maintains responsibility for overall system security and FCI protection.

### 6.3 Operational Reliance

Security capabilities are relied upon operationally from the service provider but are not independently assessed as part of this CMMC Level 1 self-assessment.

---

## 7. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be completed]

**Change History:**
- Version 1.0 (2026-01-22): Initial document creation with shared responsibility table

---

## Appendix A: Related Documents

- Inherited Control Statement Railway (`MAC-SEC-310_Inherited_Control_Statement_Railway.md`)
- Inherited Controls Appendix (`MAC-RPT-312_Inherited_Controls_Appendix.md`)
- System Description (`../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md`)

## Appendix B: Railway Platform Information

**Platform:** Railway (railway.app)  
**Services Used:** Application hosting, PostgreSQL database  
**Service Agreement:** [Reference service agreement if available]

**Note:** This document describes organization's reliance on Railway platform. For Railway's specific security capabilities and certifications, refer to Railway's publicly available documentation.

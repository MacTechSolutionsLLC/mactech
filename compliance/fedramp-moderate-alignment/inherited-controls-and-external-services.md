# Inherited Controls and External Services - FedRAMP Moderate Design Alignment

**Document Version:** 1.0  
**Date:** 2026-01-25  
**Classification:** Internal Use  
**Framework:** FedRAMP Moderate Baseline  
**Reference:** NIST SP 800-53 Rev. 5, FedRAMP Moderate Baseline

**Applies to:** MacTech Solutions Application - CMMC 2.0 Level 2 System

---

## 1. Purpose

This document identifies inherited controls from external service providers and external service dependencies in the context of FedRAMP Moderate design alignment. It documents shared responsibility boundaries and the types of assurance relied upon for inherited controls.

**Source Documentation:** This document is derived from existing inherited controls documentation: `../cmmc/level2/03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md`

**Critical Statement:** MacTech Solutions relies on third-party service providers for certain security capabilities, which are incorporated through inherited control design. This document describes how inherited controls align with FedRAMP Moderate baseline expectations.

---

## 2. Shared Responsibility Model

### 2.1 Shared Responsibility Statement

**Organizational Responsibility:**
MacTech Solutions is responsible for:
- Application security (authentication, authorization, access controls)
- Data protection (application-layer controls, CUI handling)
- Audit logging and monitoring (application events)
- Security policies and procedures
- User management and access control
- Incident response and security operations

**Provider Responsibility:**
Third-party service providers (Railway, GitHub) are responsible for:
- Infrastructure security (physical security, network security)
- Platform security (TLS/HTTPS, database encryption)
- Platform-level monitoring and logging
- Infrastructure maintenance and patching
- Data center physical security

**Shared Responsibility:**
- Security of the overall system depends on both organizational controls and provider controls
- Inherited controls are incorporated into system design
- Organizational controls complement inherited controls
- Shared responsibility boundaries are documented

### 2.2 Assurance Types

**Types of Assurance Relied Upon:**
- Platform security features (Railway, GitHub)
- Infrastructure controls (Railway platform)
- Service provider security documentation
- Platform security capabilities (as documented by providers)
- Operational reliance on provider security controls

**Note:** This document does not claim responsibility for the security posture of third-party providers. It documents what controls are inherited and how they align with FedRAMP Moderate expectations.

---

## 3. Railway Platform (Hosting Infrastructure)

### 3.1 Service Description

**Service Type:** Platform as a Service (PaaS)

**Services Provided:**
- Application hosting (Next.js web application)
- Database hosting (PostgreSQL managed service)
- TLS/HTTPS termination
- Network infrastructure and segmentation
- Physical security (data center facilities)
- Platform-level security controls

**Service Model:** Railway provides infrastructure and platform services; MacTech Solutions provides application and data security.

### 3.2 Inherited Controls

#### 3.2.1 Physical and Environmental Protection (PE)

**FedRAMP Moderate Controls:** PE-1 through PE-23

**What is Inherited:**
- Data center physical access controls
- Environmental controls (temperature, humidity, fire suppression)
- Facility security (guards, surveillance, access logs)
- Redundant power and cooling systems
- Physical infrastructure security
- Physical access monitoring and logging

**Design Alignment:**
Physical and environmental protection controls align with FedRAMP Moderate PE family expectations through Railway's data center facilities. These controls are incorporated into system design as inherited controls.

**Organizational Responsibility:**
- Organization relies on Railway for physical security of cloud infrastructure
- Organization documents Railway's physical security as inherited control
- Organization does not claim responsibility for Railway's physical security posture

**Evidence Locations:**
- Railway platform documentation
- Inherited controls documentation: `../cmmc/level2/03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md`
- Railway security documentation references

**What is NOT Inherited:**
- Physical access logs to organizational office facilities (implemented in application: `/admin/physical-access-logs`)
- Device security for endpoints used to access the system (endpoint inventory implemented)

---

#### 3.2.2 System and Communications Protection (SC)

**FedRAMP Moderate Controls:** SC-5, SC-7, SC-8, SC-17, SC-20, SC-21, SC-28

**What is Inherited:**

**TLS/HTTPS Encryption (SC-8):**
- TLS/HTTPS termination
- Certificate management
- Network encryption for all data in transit
- DDoS protection
- Firewall rules

**Network Security (SC-7):**
- Network infrastructure
- Logical network segmentation
- Boundary protection
- Denial of service protection

**Database Encryption (SC-28):**
- Database encryption at rest
- Automated backups with encryption
- Database access controls
- Platform-level database security

**Design Alignment:**
System and communications protection controls align with FedRAMP Moderate SC family expectations through Railway's platform security features. TLS/HTTPS, network security, and database encryption are incorporated into system design as inherited controls.

**Organizational Responsibility:**
- Application enforces HTTPS redirect (middleware.ts)
- Secure cookies configured (production)
- Organization documents Railway's TLS/HTTPS as inherited control
- Organization implements application-layer security controls

**Evidence Locations:**
- Railway dashboard: TLS/HTTPS configuration
- Application code: `middleware.ts` (HTTPS redirect)
- Application code: `next.config.js` (security headers)
- Inherited controls documentation

---

#### 3.2.3 System and Information Integrity (SI)

**FedRAMP Moderate Controls:** SI-3, SI-16

**What is Inherited:**
- Platform-level malware protection
- Automated threat detection
- File scanning capabilities
- Platform update management
- Memory protection

**Design Alignment:**
System and information integrity controls align with FedRAMP Moderate SI family expectations through Railway's platform-level security features. Malware protection and memory protection are incorporated into system design as inherited controls.

**Organizational Responsibility:**
- Organization relies on Railway for platform-level malware protection
- Organization implements application-layer security controls
- Organization documents Railway's malware protection as inherited control

**Evidence Locations:**
- Railway platform documentation
- Inherited controls documentation

---

#### 3.2.4 Maintenance (MA)

**FedRAMP Moderate Controls:** MA-2, MA-4

**What is Inherited:**
- Platform maintenance and patching
- Infrastructure maintenance
- MFA for platform access (maintenance access)

**Design Alignment:**
Maintenance controls align with FedRAMP Moderate MA family expectations through Railway's platform maintenance capabilities. Platform maintenance and MFA for maintenance access are incorporated into system design as inherited controls.

**Organizational Responsibility:**
- Organization performs application maintenance
- Organization relies on Railway for platform maintenance
- Organization documents Railway's maintenance capabilities as inherited control

**Evidence Locations:**
- Railway platform documentation
- Inherited controls documentation

---

### 3.3 Shared Responsibility Boundaries

**Railway Responsibilities:**
- Infrastructure security and availability
- Physical security of data centers
- Network security and segmentation
- Platform-level encryption
- Platform maintenance and patching
- Platform-level monitoring

**Organizational Responsibilities:**
- Application security and code security
- Authentication and authorization
- Application-layer access controls
- Data protection (application-layer)
- Audit logging (application events)
- Security policies and procedures
- User management

**Shared Responsibilities:**
- Overall system security (depends on both)
- Security monitoring (platform and application)
- Incident response coordination
- Security documentation

---

## 4. GitHub (Source Control)

### 4.1 Service Description

**Service Type:** Software Development Platform

**Services Provided:**
- Source code repository
- Version control
- Access controls
- Dependency scanning (Dependabot)
- Audit history (commit history)
- Code review processes

**Service Model:** GitHub provides platform services; MacTech Solutions manages repository access and code security.

### 4.2 Inherited Controls

#### 4.2.1 Access Control (AC)

**FedRAMP Moderate Controls:** AC-2, AC-3

**What is Inherited:**
- Repository access controls
- Authentication and authorization
- Branch protection rules
- Code review processes

**Design Alignment:**
Access control for source code repository aligns with FedRAMP Moderate AC family expectations through GitHub's access control features. Repository access controls are incorporated into system design as inherited controls.

**Organizational Responsibility:**
- Organization manages GitHub repository access
- Organization documents GitHub's access controls as inherited control
- Organization implements code review processes

**Evidence Locations:**
- GitHub repository settings
- Inherited controls documentation

---

#### 4.2.2 Audit and Accountability (AU)

**FedRAMP Moderate Controls:** AU-2, AU-3, AU-12

**What is Inherited:**
- Commit history and audit trail
- Repository access logging
- Code change tracking

**Design Alignment:**
Audit and accountability for source code repository aligns with FedRAMP Moderate AU family expectations through GitHub's commit history and audit capabilities. Repository audit logging is incorporated into system design as inherited control.

**Organizational Responsibility:**
- Organization uses GitHub commit history for code audit trail
- Organization documents GitHub's audit capabilities as inherited control

**Evidence Locations:**
- GitHub commit history
- Inherited controls documentation

---

#### 4.2.3 System and Information Integrity (SI)

**FedRAMP Moderate Controls:** SI-2

**What is Inherited:**
- Dependabot automated vulnerability scanning (weekly)
- Security advisories
- Dependency vulnerability alerts
- Automated pull requests for security updates

**Design Alignment:**
Vulnerability management for source code dependencies aligns with FedRAMP Moderate SI family expectations through GitHub's Dependabot service. Dependency vulnerability scanning is incorporated into system design as inherited control.

**Organizational Responsibility:**
- Organization reviews and merges Dependabot pull requests
- Organization documents Dependabot as inherited control
- Organization implements vulnerability remediation process

**Evidence Locations:**
- Dependabot configuration: `.github/dependabot.yml`
- Dependabot alerts and pull requests
- Inherited controls documentation

---

### 4.3 Shared Responsibility Boundaries

**GitHub Responsibilities:**
- Platform security
- Repository infrastructure security
- Dependabot vulnerability scanning service
- Platform access controls

**Organizational Responsibilities:**
- Repository access management
- Code security and review
- Dependency management
- Vulnerability remediation

**Shared Responsibilities:**
- Source code security (depends on both)
- Vulnerability awareness (Dependabot + organizational review)

---

## 5. External APIs (Read-Only Services)

### 5.1 SAM.gov API

**Service Type:** Read-only external API

**Service Description:**
- Public government API for contract opportunity data
- Read-only access (no write operations)
- Public data (not FCI unless combined with internal data)

**Trust Relationship:**
- No trust relationship established (read-only, public data)
- Out of scope for system boundary
- No inherited controls

**Data Flow:**
- Application queries SAM.gov API for public contract opportunity data
- Data is processed and stored in application database
- All communications encrypted via TLS/HTTPS

**Design Alignment:**
External API integration aligns with FedRAMP Moderate SA-9 (External System Services) expectations through external system verification processes. Read-only external services are documented but do not require inherited control documentation.

---

### 5.2 USAspending.gov API

**Service Type:** Read-only external API

**Service Description:**
- Public government API for award history data
- Read-only access (no write operations)
- Public data (not FCI unless combined with internal data)

**Trust Relationship:**
- No trust relationship established (read-only, public data)
- Out of scope for system boundary
- No inherited controls

**Data Flow:**
- Application queries USAspending.gov API for public award history data
- Data is processed and stored in application database
- All communications encrypted via TLS/HTTPS

**Design Alignment:**
External API integration aligns with FedRAMP Moderate SA-9 (External System Services) expectations through external system verification processes. Read-only external services are documented but do not require inherited control documentation.

---

## 6. Inherited Control Design Alignment

### 6.1 Design Alignment Approach

**Inherited Controls in System Design:**
- Inherited controls are incorporated into system design
- System architecture relies on inherited controls for certain security capabilities
- Inherited controls complement organizational controls
- Shared responsibility model is documented

**FedRAMP Moderate Alignment:**
- Inherited controls align with FedRAMP Moderate baseline expectations
- Inherited controls support FedRAMP Moderate control families (PE, SC, SI, MA)
- Design alignment demonstrates how inherited controls meet FedRAMP Moderate expectations
- Shared responsibility boundaries are clearly documented

### 6.2 Assurance Documentation

**Types of Assurance:**
- Platform security features (Railway, GitHub)
- Infrastructure controls (Railway platform)
- Service provider security documentation
- Operational reliance on provider security controls

**Documentation:**
- Inherited controls are documented in CMMC inherited controls documentation
- Inherited controls are referenced in System Security Plan
- Inherited controls are mapped to FedRAMP Moderate controls in control family alignment document

**Limitations:**
- Organization does not independently assess provider security posture
- Organization relies on provider security documentation and capabilities
- Inherited controls are incorporated into design but not independently validated

---

## 7. Shared Responsibility Statement

### 7.1 Organizational Statement

**MacTech Solutions relies on third-party service providers for certain security capabilities, which are incorporated through inherited control design.**

**Organizational Controls:**
- Application security (authentication, authorization, access controls)
- Data protection (application-layer controls, CUI handling)
- Audit logging and monitoring (application events)
- Security policies and procedures
- User management and access control
- Incident response and security operations

**Inherited Controls:**
- Infrastructure security (Railway platform)
- Physical security (Railway data centers)
- Platform security (Railway, GitHub)
- Network security (Railway platform)
- Database encryption (Railway platform)

**Shared Responsibility:**
- Overall system security depends on both organizational and inherited controls
- Inherited controls are incorporated into system design
- Organizational controls complement inherited controls
- Shared responsibility boundaries are documented

### 7.2 Provider Responsibilities

**Railway Platform:**
- Infrastructure security and availability
- Physical security of data centers
- Network security and segmentation
- Platform-level encryption
- Platform maintenance and patching

**GitHub:**
- Platform security
- Repository infrastructure security
- Dependabot vulnerability scanning service
- Platform access controls

---

## 8. Document Control

### 8.1 Version History

- **Version 1.0 (2026-01-25):** Initial Inherited Controls and External Services document creation

### 8.2 Review and Maintenance

**Review Schedule:**
- Annual review (scheduled)
- Review upon significant system changes
- Review upon provider changes
- Review upon CMMC documentation updates

**Next Review Date:** 2027-01-25

**Maintenance Responsibility:** Compliance Team

### 8.3 Related Documents

- FedRAMP Alignment Overview: `fedramp-alignment-overview.md`
- System Boundary and Architecture: `system-boundary-and-architecture.md`
- Control Family Alignment: `fedramp-control-family-alignment.md`
- Continuous Monitoring: `continuous-monitoring-concept.md`
- Claim Language: `fedramp-claim-language.md`
- CMMC Inherited Controls: `../cmmc/level2/03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md`
- CMMC SSP: `../cmmc/level2/01-system-scope/MAC-IT-304_System_Security_Plan.md`

---

**Document Status:** This document is maintained under configuration control and is part of the MacTech Solutions compliance documentation package.

**Classification:** Internal Use

**Last Updated:** 2026-01-25

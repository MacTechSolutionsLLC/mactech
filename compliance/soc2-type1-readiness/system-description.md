# System Description - SOC 2 Type I Readiness

**Document Version:** 1.0  
**Date:** 2026-01-25  
**Classification:** Internal Use  
**Framework:** AICPA Trust Services Criteria (2017, with 2022 revised points of focus)  
**Reference:** SOC 2 Type I - Security (Common Criteria)

**Applies to:** MacTech Solutions Application - CMMC 2.0 Level 2 System

---

## 1. Purpose

This document provides a System Description for the MacTech Solutions Application following AICPA SOC 2 System Description conventions. This document describes the system components, boundaries, services, and controls in a format consistent with SOC 2 reporting requirements.

**Critical Statement:** This is an internal system description prepared for SOC 2 Type I readiness assessment purposes. This document has not been reviewed, examined, or attested by an independent auditor. This document does not constitute a SOC 2 report or attestation.

**Source Documentation:** This document is derived from the existing System Security Plan and System Architecture documentation: `../cmmc/level2/01-system-scope/MAC-IT-304_System_Security_Plan.md` and `../cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md`.

---

## 2. Description of Services

### 2.1 Service Organization

**Service Organization:** MacTech Solutions  
**Service:** MacTech Solutions Application  
**Service Type:** Software as a Service (SaaS)  
**Service Delivery Model:** Cloud-hosted web application

### 2.2 Services Provided

MacTech Solutions provides a web-based federal contract opportunity management and capture platform as a service. The system enables authorized personnel to discover, analyze, and manage federal contracting opportunities from SAM.gov and related government procurement sources.

**Primary Service Functions:**

1. **Contract Opportunity Discovery:**
   - Automated ingestion of federal contract opportunities from SAM.gov
   - Contract opportunity data storage and management
   - Contract opportunity scoring and relevance assessment

2. **Award History Tracking:**
   - Integration with USAspending.gov for award history data
   - Award data correlation and analysis
   - Historical contract data management

3. **Data Management:**
   - Storage and management of Federal Contract Information (FCI)
   - Storage and management of Controlled Unclassified Information (CUI)
   - User-generated content and annotations

4. **Administrative Functions:**
   - User account management
   - Access control and authorization
   - System administration and configuration
   - Audit log management and reporting

5. **File Management:**
   - Secure file storage and retrieval
   - CUI file storage with password protection
   - File access controls and audit logging

### 2.3 Service Delivery Model

**Hosting Model:** Platform as a Service (PaaS)  
**Hosting Provider:** Railway Cloud Platform  
**Database:** PostgreSQL (Railway managed service)  
**Source Control:** GitHub (cloud-hosted repository)

**Service Availability:**
- Service is accessible via web browser over HTTPS
- Service operates 24/7 with platform-provided availability
- Service maintenance is performed with minimal disruption

---

## 3. System Components

### 3.1 Application Components

**Application Technology:**
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Frontend:** React
- **Authentication:** NextAuth.js with credentials provider
- **Session Management:** Token-based session handling via NextAuth.js
- **Access Control:** Role-based access control (RBAC) with USER and ADMIN roles

**Application Features:**
- Public-facing contract opportunity discovery interface
- Administrative portal for authorized administrators
- Authentication and authorization services
- File upload and management services
- Audit logging and event tracking

**Evidence:** Application code in repository, `lib/auth.ts`, `middleware.ts`, `lib/authz.ts`, `lib/audit.ts`

### 3.2 Infrastructure Components

**Hosting Infrastructure:**
- **Platform:** Railway Cloud Platform (PaaS)
- **Application Hosting:** Railway-managed application deployment
- **Database Hosting:** Railway PostgreSQL managed service
- **Network Infrastructure:** Railway-managed network and security

**Infrastructure Services:**
- TLS/HTTPS termination (inherited from Railway)
- Database encryption at rest (inherited from Railway)
- Network security and segmentation (inherited from Railway)
- Physical security (inherited from Railway data centers)
- Platform-level monitoring and logging (inherited from Railway)

**Reference:** See `../cmmc/level2/03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md` for detailed inherited controls documentation.

### 3.3 Data Components

**Database:**
- **Type:** PostgreSQL
- **Location:** Railway cloud platform (internal network segment)
- **ORM:** Prisma
- **Schema:** `prisma/schema.prisma`

**Data Types Stored:**
- User accounts and authentication data
- Federal Contract Information (FCI)
- Controlled Unclassified Information (CUI)
- Audit logs and system events
- Configuration and system data
- File metadata and storage references

**Data Protection:**
- Encryption at rest: Inherited from Railway platform
- Encryption in transit: TLS/HTTPS (inherited from Railway platform)
- Access controls: Application-layer RBAC and database access controls
- Backup and recovery: Inherited from Railway platform

### 3.4 People Components

**Authorized Users:**
- Standard users (USER role) with access to contract opportunity data
- Administrative users (ADMIN role) with enhanced access to administrative functions
- All users must authenticate before accessing the system

**Personnel:**
- System administrators responsible for system configuration and maintenance
- Developers responsible for application development and maintenance
- Compliance personnel responsible for security and compliance oversight

**Access Management:**
- User accounts are created and managed by administrators
- User access is controlled through role-based access control (RBAC)
- User access is logged and monitored through audit logging

### 3.5 Process Components

**Security Processes:**
- Authentication and authorization processes
- Access control enforcement
- Audit logging and monitoring
- Incident response procedures
- Change management processes
- Configuration management processes
- Risk assessment processes
- Vulnerability management processes

**Operational Processes:**
- Application deployment processes
- Database management processes
- System monitoring processes
- Backup and recovery processes (inherited from Railway)
- Maintenance processes

**Reference:** See `../cmmc/level2/02-policies-and-procedures/` for detailed policies and procedures.

---

## 4. System Boundaries

### 4.1 In-Scope Components

The system boundary encompasses the following components:

**Application Layer:**
- Next.js 14 web application (TypeScript, React)
- Application code and business logic
- Admin portal (`/admin/*`) and public-facing pages
- Authentication and authorization components
- Location: Railway cloud platform

**Data Layer:**
- PostgreSQL database (Railway managed service)
- User accounts and authentication data
- FCI data (non-public contract information)
- CUI data (contract proposals, SOWs, contract documentation)
- Audit logs and system events
- Location: Railway cloud platform (internal network segment)

**Infrastructure Layer:**
- Railway cloud platform (hosting infrastructure)
- Network infrastructure and segmentation
- TLS/HTTPS termination
- Database encryption at rest
- Physical security (inherited from Railway)

**Source Control:**
- GitHub repository (source code and documentation)
- Access controls and audit history
- Dependency scanning (Dependabot)

### 4.2 Out-of-Scope Components

The following components are explicitly out of scope:

- **Developer Workstations:** Local development environments and developer endpoints
- **End-User Devices:** Client browsers and user devices accessing the system
- **External APIs (Read-Only):** SAM.gov API and USAspending.gov API are read-only external services, not part of the system boundary
- **Classified Information:** Not applicable to this system
- **Enterprise IT Systems:** Organizational IT infrastructure beyond the application system

### 4.3 Trust Boundaries

**External Trust Boundary:**
- Public internet to Railway platform (HTTPS/TLS encrypted)
- Users access system via web browsers over HTTPS

**Internal Trust Boundary:**
- Application tier to database tier (internal Railway network)
- Application code to Railway platform services
- Source code repository (GitHub) to deployment pipeline

**Organizational Trust Boundary:**
- Authorized personnel access to GitHub repository
- Administrative access to Railway platform
- Application administrative functions

---

## 5. Data Types Handled

### 5.1 Federal Contract Information (FCI)

**Definition:** Only non-public information related to government contracts is treated as FCI. Publicly released information (e.g., SAM.gov postings) is not FCI unless combined with internal, non-public data.

**FCI Handling:**
- FCI is stored in PostgreSQL database on Railway platform
- FCI access is restricted to authenticated users with appropriate authorization
- FCI is processed and analyzed within the application
- FCI is not stored on removable media
- FCI handling procedures are documented in CMMC policies

**FCI Storage:**
- Database: PostgreSQL (Railway managed service)
- Encryption: Database encryption at rest (inherited from Railway)
- Access: Role-based access control (RBAC) enforced

### 5.2 Controlled Unclassified Information (CUI)

**Definition:** CUI as defined by 32 CFR Part 2002 and the CUI Registry.

**CUI Handling:**
- CUI files are stored separately from FCI files in `StoredCUIFile` database table
- CUI files require password protection for access
- CUI keyword auto-detection for file classification
- CUI access attempts logged to audit log
- CUI handling procedures are documented in CMMC policies

**CUI Storage:**
- Database: PostgreSQL `StoredCUIFile` table (Railway managed service)
- Encryption: Database encryption at rest (inherited from Railway)
- Access: Password-protected access in addition to authentication
- No CUI stored on removable media

### 5.3 User Authentication Data

**Data Types:**
- User account information (email, name, role)
- Password hashes (bcrypt, 12 rounds)
- Multi-factor authentication (MFA) data for ADMIN accounts
- Session tokens and authentication state

**Protection:**
- Passwords are hashed using bcrypt (12 rounds)
- MFA data is stored securely
- Session tokens are managed securely via NextAuth.js

### 5.4 Audit Logs and System Events

**Data Types:**
- Authentication events (login, logout, failed attempts)
- Administrative actions (user management, configuration changes)
- File operations (upload, download, access, CUI file access)
- Security events (access denials, privilege escalations)
- System events (configuration changes, policy updates)

**Retention:**
- Audit logs retained for minimum 90 days
- Audit logs stored in database
- Audit log export functionality available

---

## 6. Subservice Organizations

### 6.1 Railway Platform (Hosting Infrastructure)

**Service Type:** Platform as a Service (PaaS)

**Services Provided:**
- Application hosting (Next.js web application)
- Database hosting (PostgreSQL managed service)
- TLS/HTTPS termination
- Network infrastructure and segmentation
- Physical security (data center facilities)
- Platform-level security controls

**Inherited Controls:**
- Physical and environmental protection (data center facilities)
- System and communications protection (TLS/HTTPS, network security)
- Database encryption at rest
- Platform-level malware protection
- Infrastructure maintenance and patching

**Shared Responsibility:**
- Railway: Infrastructure security, physical security, platform security
- Organization: Application security, access controls, data protection, audit logging

**Reference:** See `../cmmc/level2/03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md` for detailed inherited controls documentation.

### 6.2 GitHub (Source Control)

**Service Type:** Software Development Platform

**Services Provided:**
- Source code repository
- Version control
- Access controls
- Dependency scanning (Dependabot)
- Audit history (commit history)

**Inherited Controls:**
- Repository access controls
- Commit history and audit trail
- Dependency vulnerability scanning

**Shared Responsibility:**
- GitHub: Platform security, repository infrastructure security
- Organization: Repository access management, code security, dependency management

**Reference:** See `../cmmc/level2/03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md` for detailed inherited controls documentation.

### 6.3 External APIs (Read-Only Services)

**SAM.gov API:**
- Service Type: Read-only external API
- Data Flow: Application queries SAM.gov API for public contract opportunity data
- Trust Relationship: None (read-only, public data)
- Scope: Out of scope (external service)

**USAspending.gov API:**
- Service Type: Read-only external API
- Data Flow: Application queries USAspending.gov API for public award history data
- Trust Relationship: None (read-only, public data)
- Scope: Out of scope (external service)

---

## 7. Complementary User Entity Controls (CUECs)

### 7.1 Purpose of CUECs

Complementary User Entity Controls (CUECs) are controls that user entities (customers) must implement to achieve the control objectives described in this system description. These controls are necessary because the service organization's controls alone are not sufficient to meet all control objectives.

### 7.2 Identified CUECs

**7.2.1 Endpoint Security**

**User Entity Responsibility:**
- Implement and maintain antivirus/anti-malware software on devices used to access the system
- Implement and maintain endpoint device management and security controls
- Ensure endpoint devices are kept up to date with security patches
- Implement endpoint security policies and procedures

**Rationale:**
The service organization provides web-based access to the system but does not control or manage user endpoint devices. User entities are responsible for securing the devices used to access the system.

**Reference:** See `../cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md` for endpoint inventory tracking.

---

**7.2.2 Physical Security of User Facilities**

**User Entity Responsibility:**
- Implement and maintain physical security controls for facilities where users access the system
- Control physical access to facilities and work areas
- Implement visitor management procedures
- Secure physical access to devices used to access the system

**Rationale:**
The service organization provides cloud-hosted services and does not control the physical security of user entity facilities. User entities are responsible for physical security of their facilities and devices.

---

**7.2.3 User Access Management**

**User Entity Responsibility:**
- Request user account creation and deprovisioning through appropriate channels
- Notify the service organization promptly when user access should be revoked
- Ensure users understand their responsibilities for account security
- Implement user access management policies and procedures

**Rationale:**
While the service organization manages user accounts within the system, user entities are responsible for requesting appropriate access levels and notifying the service organization when access should be modified or revoked.

**Reference:** See `../cmmc/level2/02-policies-and-procedures/MAC-POL-222_Personnel_Security_Policy.md` for personnel security procedures.

---

**7.2.4 Network Connectivity**

**User Entity Responsibility:**
- Implement secure network connectivity to access the system
- Ensure network security controls are in place (firewalls, network monitoring)
- Implement secure network policies and procedures
- Monitor network traffic for security events

**Rationale:**
The service organization provides secure access to the system via HTTPS, but user entities are responsible for securing their network infrastructure and connectivity to the internet.

---

**7.2.5 User Training and Awareness**

**User Entity Responsibility:**
- Provide security awareness training to users
- Ensure users understand their responsibilities for system security
- Implement user training and awareness programs
- Communicate security policies and procedures to users

**Rationale:**
While the service organization provides security notices and user agreements, user entities are responsible for ensuring their personnel receive appropriate security training and understand their security responsibilities.

**Reference:** See `../cmmc/level2/02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md` for user agreements and security notices.

---

**7.2.6 Data Classification and Handling**

**User Entity Responsibility:**
- Classify data appropriately before uploading to the system
- Ensure CUI is properly marked and handled
- Implement data classification and handling policies
- Train users on proper data handling procedures

**Rationale:**
While the service organization provides CUI detection and protection capabilities, user entities are responsible for properly classifying and marking data before uploading to the system.

---

### 7.3 CUEC Communication

**Communication Method:**
- CUECs are documented in this System Description
- CUECs are communicated to user entities through user agreements and security notices
- CUECs are available for review upon request

**User Entity Acknowledgment:**
- User entities acknowledge CUECs through user agreements
- User entities are responsible for implementing CUECs as appropriate for their environment

**Reference:** See `../cmmc/level2/02-policies-and-procedures/user-agreements/` for user agreement templates.

---

## 8. Document Control

### 8.1 Version History

- **Version 1.0 (2026-01-25):** Initial System Description document creation

### 8.2 Review and Maintenance

**Review Schedule:**
- Annual review (scheduled)
- Review upon significant system changes
- Review upon architecture modifications

**Next Review Date:** 2027-01-25

**Maintenance Responsibility:** Compliance Team

### 8.3 Related Documents

- SOC 2 Readiness Overview: `soc2-readiness-overview.md`
- Risk Assessment: `soc2-risk-assessment.md`
- Trust Services Criteria Mapping: `trust-services-criteria-mapping.md`
- Claim Language: `soc2-claim-language.md`
- CMMC SSP: `../cmmc/level2/01-system-scope/MAC-IT-304_System_Security_Plan.md`
- CMMC Architecture: `../cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md`
- FedRAMP Architecture: `../fedramp-moderate-alignment/system-boundary-and-architecture.md`

---

**Document Status:** This document is maintained under configuration control and is part of the MacTech Solutions compliance documentation package.

**Classification:** Internal Use

**Last Updated:** 2026-01-25

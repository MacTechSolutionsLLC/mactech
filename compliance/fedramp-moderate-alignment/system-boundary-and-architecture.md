# System Boundary and Architecture - FedRAMP Moderate Design Alignment

**Document Version:** 1.0  
**Date:** 2026-01-25  
**Classification:** Internal Use  
**Framework:** FedRAMP Moderate Baseline  
**Reference:** NIST SP 800-53 Rev. 5, FedRAMP Moderate Baseline

**Applies to:** MacTech Solutions Application - CMMC 2.0 Level 2 System

---

## 1. Purpose

This document describes the system boundary and architecture for the MacTech Solutions Application in the context of FedRAMP Moderate design alignment. This document uses FedRAMP-style language to describe system components, boundaries, and trust relationships, but does not constitute a full System Security Plan (SSP).

**Source Documentation:** This document is derived from the existing System Security Plan and System Architecture documentation: `../cmmc/level2/01-system-scope/MAC-IT-304_System_Security_Plan.md` and `../cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md`.

---

## 2. System Overview

### 2.1 System Identification

**System Name:** MacTech Solutions Application  
**System Type:** Cloud-hosted web application (Software as a Service - SaaS)  
**Hosting Model:** Platform as a Service (PaaS) - Railway Cloud Platform  
**Database:** PostgreSQL (Railway managed service)  
**Source Control:** GitHub (cloud-hosted repository)

### 2.2 System Purpose

The MacTech Solutions Application is a web-based federal contract opportunity management and capture platform. The system enables authorized personnel to discover, analyze, and manage federal contracting opportunities from SAM.gov and related government procurement sources.

**Primary Functions:**
- Discovery and ingestion of federal contract opportunities from SAM.gov
- Storage and analysis of Federal Contract Information (FCI) and Controlled Unclassified Information (CUI)
- Contract opportunity scoring and relevance assessment
- Award history tracking via USAspending.gov integration
- Administrative portal for authorized users
- CUI file storage and password-protected access

---

## 3. System Boundary

### 3.1 In-Scope Components

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

### 3.2 Out-of-Scope Components

The following components are explicitly out of scope:

- **Developer Workstations:** Local development environments and developer endpoints
- **End-User Devices:** Client browsers and user devices accessing the system
- **External APIs (Read-Only):** SAM.gov API and USAspending.gov API are read-only external services, not part of the system boundary
- **Classified Information:** Not applicable to this system
- **Enterprise IT Systems:** Organizational IT infrastructure beyond the application system

---

## 4. Data Types and Handling

### 4.1 Federal Contract Information (FCI)

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

### 4.2 Controlled Unclassified Information (CUI)

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

**Reference:** See `../cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md` Section 2 for detailed CUI handling procedures.

---

## 5. Architecture Components

### 5.1 Application Architecture

**Technology Stack:**
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Authentication:** NextAuth.js with credentials provider
- **Session Management:** Token-based session handling
- **Access Control:** Role-based access control (RBAC) with USER and ADMIN roles

**Application Components:**
- Public-facing pages (contract opportunity discovery)
- Admin portal (`/admin/*`) for authorized administrators
- Authentication endpoints (`/api/auth/*`)
- Administrative endpoints (`/api/admin/*`)
- File management endpoints

**Evidence:** Application code in repository, `lib/auth.ts`, `middleware.ts`, `lib/authz.ts`

### 5.2 Data Architecture

**Database:**
- **Type:** PostgreSQL
- **Location:** Railway cloud platform (internal network segment)
- **ORM:** Prisma
- **Schema:** `prisma/schema.prisma`

**Data Models:**
- User accounts and authentication data
- FCI data models (GovernmentContractDiscovery, UsaSpendingAward, etc.)
- CUI data model (StoredCUIFile)
- Audit logs and system events
- Configuration and system data

**Data Protection:**
- Encryption at rest: Inherited from Railway platform
- Encryption in transit: TLS/HTTPS (inherited from Railway platform)
- Access controls: Application-layer RBAC and database access controls

### 5.3 Network Architecture

**Network Segmentation:**
- **Public Network Segment:** Application tier (Next.js) - publicly accessible via HTTPS
- **Internal Network Segment:** Database tier (PostgreSQL) - internal access only
- **Network Boundary:** Managed by Railway platform
- **Encryption:** TLS/HTTPS for all external communications

**Network Security:**
- TLS/HTTPS termination: Inherited from Railway platform
- DDoS protection: Inherited from Railway platform
- Firewall rules: Inherited from Railway platform
- Network segmentation: Logical separation between application and database tiers

**Reference:** See `../cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md` Section 4.5 for network architecture details.

---

## 6. Logical Trust Boundaries

### 6.1 Trust Boundary Model

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

### 6.2 Trust Relationships

**Railway Platform:**
- Trusted for hosting infrastructure, network security, physical security
- Inherited controls documented in inherited controls documentation
- Shared responsibility model: Railway provides infrastructure, organization provides application security

**GitHub:**
- Trusted for source code repository and version control
- Inherited controls: Repository access controls, audit history, dependency scanning
- Shared responsibility model: GitHub provides platform security, organization manages repository access

**External APIs:**
- SAM.gov API: Read-only external service (out of scope)
- USAspending.gov API: Read-only external service (out of scope)
- No trust relationship established (read-only, public data)

---

## 7. External Service Dependencies

### 7.1 Railway Platform (Hosting Infrastructure)

**Service Type:** Platform as a Service (PaaS)

**Services Provided:**
- Application hosting (Next.js application)
- Database hosting (PostgreSQL managed service)
- TLS/HTTPS termination
- Network infrastructure
- Physical security (data center facilities)

**Inherited Controls:**
- Physical and environmental protection (PE)
- System and communications protection (SC) - encryption, network security
- Database encryption at rest
- Platform-level security controls

**Shared Responsibility:**
- Railway: Infrastructure security, physical security, platform security
- Organization: Application security, access controls, data protection, audit logging

**Reference:** See `inherited-controls-and-external-services.md` for detailed inherited controls documentation.

### 7.2 GitHub (Source Control)

**Service Type:** Software Development Platform

**Services Provided:**
- Source code repository
- Version control
- Access controls
- Dependency scanning (Dependabot)
- Audit history

**Inherited Controls:**
- Access controls (repository access)
- Audit logging (commit history)
- Vulnerability scanning (Dependabot)

**Shared Responsibility:**
- GitHub: Platform security, repository infrastructure
- Organization: Repository access management, code security, dependency management

**Reference:** See `inherited-controls-and-external-services.md` for detailed inherited controls documentation.

### 7.3 External APIs (Read-Only Services)

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

## 8. Data Flow

### 8.1 Data Ingress

**Contract Opportunity Data:**
- Source: SAM.gov API (read-only, public data)
- Flow: Application queries SAM.gov API → Application processes data → Database stores FCI
- Encryption: TLS/HTTPS for API communications

**CUI File Upload:**
- Source: Authorized users via web interface
- Flow: User uploads CUI file → Application validates and stores in StoredCUIFile table → Password protection applied
- Encryption: TLS/HTTPS for upload, database encryption at rest

**User Authentication:**
- Source: User credentials via web interface
- Flow: User submits credentials → NextAuth.js authenticates → Session established
- Encryption: TLS/HTTPS for authentication, password hashing (bcrypt)

### 8.2 Data Processing

**Internal Processing:**
- Application processes FCI and CUI within application tier
- Database queries and updates within internal network segment
- Audit logging of all security-relevant events
- Access control enforcement at application layer

**Data Analysis:**
- Contract opportunity scoring and analysis
- Award history correlation
- User-generated annotations and analysis

### 8.3 Data Egress

**User Access:**
- Authorized users access FCI and CUI via web interface
- Access controlled by authentication and authorization
- All access logged to audit log
- Encryption: TLS/HTTPS for all user access

**Administrative Functions:**
- Administrative users access administrative functions via `/admin/*` routes
- Enhanced access controls for administrative functions
- All administrative actions logged to audit log

---

## 9. Security Architecture

### 9.1 Authentication Architecture

**Authentication Mechanism:**
- NextAuth.js with credentials provider
- Password-based authentication with bcrypt hashing (12 rounds)
- Session management via NextAuth.js
- Multi-factor authentication (MFA) for ADMIN role accounts (TOTP-based)

**Authentication Flow:**
1. User submits credentials via HTTPS
2. Application validates credentials against database
3. Password verified using bcrypt
4. Session established via NextAuth.js
5. Session token stored securely

**Evidence:** `lib/auth.ts`, `lib/mfa.ts`, `app/api/auth/*`

### 9.2 Authorization Architecture

**Access Control Model:**
- Role-based access control (RBAC)
- Roles: USER (standard user), ADMIN (administrative user)
- Middleware-based route protection
- Function-level authorization checks

**Authorization Enforcement:**
- Middleware (`middleware.ts`) enforces route-level access
- Authorization functions (`lib/authz.ts`) enforce function-level access
- Database-level access controls complement application controls

**Evidence:** `middleware.ts`, `lib/authz.ts`, `lib/auth.ts`

### 9.3 Audit and Logging Architecture

**Audit Logging:**
- Comprehensive audit logging via `lib/audit.ts`
- All security-relevant events logged
- 90-day minimum retention
- Audit log export functionality (CSV format)

**Logged Events:**
- Authentication events (login, logout, failed attempts)
- Administrative actions
- File operations (upload, download, access)
- Security events (access denials, privilege escalations)
- CUI access attempts

**Evidence:** `lib/audit.ts`, `app/api/admin/events/export`, Audit and Accountability Policy

---

## 10. System Interconnections

### 10.1 Internal Interconnections

**Application to Database:**
- Connection: Internal Railway network
- Protocol: PostgreSQL connection (encrypted by Railway)
- Access: Application service account with database credentials
- Security: Database access controls, connection encryption

**Application to Platform Services:**
- Connection: Railway platform services
- Services: Logging, monitoring, deployment
- Security: Platform-managed access controls

### 10.2 External Interconnections

**Application to SAM.gov API:**
- Connection: Public internet (HTTPS)
- Type: Read-only API queries
- Data: Public contract opportunity data
- Security: TLS/HTTPS encryption

**Application to USAspending.gov API:**
- Connection: Public internet (HTTPS)
- Type: Read-only API queries
- Data: Public award history data
- Security: TLS/HTTPS encryption

**Users to Application:**
- Connection: Public internet (HTTPS)
- Type: Web browser access
- Data: FCI, CUI, system data
- Security: TLS/HTTPS encryption, authentication, authorization

---

## 11. Document Control

### 11.1 Version History

- **Version 1.0 (2026-01-25):** Initial System Boundary and Architecture document creation

### 11.2 Review and Maintenance

**Review Schedule:**
- Annual review (scheduled)
- Review upon significant system changes
- Review upon architecture modifications

**Next Review Date:** 2027-01-25

**Maintenance Responsibility:** Compliance Team

### 11.3 Related Documents

- FedRAMP Alignment Overview: `fedramp-alignment-overview.md`
- Control Family Alignment: `fedramp-control-family-alignment.md`
- Inherited Controls: `inherited-controls-and-external-services.md`
- Continuous Monitoring: `continuous-monitoring-concept.md`
- Claim Language: `fedramp-claim-language.md`
- CMMC SSP: `../cmmc/level2/01-system-scope/MAC-IT-304_System_Security_Plan.md`
- CMMC Architecture: `../cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md`

---

**Document Status:** This document is maintained under configuration control and is part of the MacTech Solutions compliance documentation package.

**Classification:** Internal Use

**Last Updated:** 2026-01-25

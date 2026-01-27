# System Description - CMMC Level 1

**Document Version:** 1.0  
**Date:** 2026-01-21  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 1 (Foundational)  
**Reference:** FAR 52.204-21

**Applies to:** CMMC 2.0 Level 1 (FCI-only system)

---

## 1. System Purpose

The MacTech Solutions system is a web-based federal contract opportunity management and capture platform. The system enables authorized personnel to discover, analyze, and manage federal contracting opportunities from SAM.gov and related government procurement sources.

**Primary Functions:**
- Discovery and ingestion of federal contract opportunities from SAM.gov
- Storage and analysis of Federal Contract Information (FCI)
- Contract opportunity scoring and relevance assessment
- Award history tracking via USAspending.gov integration
- Administrative portal for authorized users

---

## 2. Federal Contract Information (FCI) Handling

Only non-public information related to government contracts is treated as FCI. Publicly released information (e.g., SAM.gov postings, USAspending.gov data) is not FCI unless combined with internal, non-public data.

The system handles:
- **Non-public contract opportunity data** received, generated, or stored internally
- **Internal analysis and annotations** related to contract opportunities
- **User-generated content** that combines public data with internal, non-public information
- **Derived data** generated from internal processing of contract information

**Important:** Publicly available data from SAM.gov and USAspending.gov APIs is not FCI by itself. FCI exists only when such data is combined with internal, non-public information or when the system receives, generates, or stores non-public contract-related information.

**FCI Boundary:** See `MAC-SEC-302_FCI_Scope_and_Data_Boundary_Statement.md` for explicit FCI definition, prohibited data types, and data boundary enforcement.

**FCI Storage:**
- All FCI is stored in a PostgreSQL database hosted on Railway cloud platform
- No FCI is stored on removable media
- Source code and system documentation are stored in GitHub repositories

**FCI Processing:**
- FCI is ingested via automated processes from public government APIs (SAM.gov, USAspending.gov)
- FCI is processed, analyzed, and stored for authorized user access
- All FCI access is restricted to authenticated users with appropriate authorization

---

## 3. System Boundary

The system boundary encompasses the following components:

### In-Scope Components

1. **Next.js Web Application**
   - Location: Railway cloud platform
   - Technology: Next.js 14 (TypeScript), React
   - Purpose: User interface and business logic

2. **PostgreSQL Database**
   - Location: Railway cloud platform
   - Purpose: Storage of FCI, user accounts, and system data
   - Evidence: `prisma/schema.prisma`

3. **Authentication System**
   - Technology: NextAuth.js with credentials provider
   - Purpose: User identification and authentication
   - Evidence: `lib/auth.ts`

4. **GitHub Repository**
   - Purpose: Source code version control and documentation storage
   - Access: Restricted to authorized personnel

5. **Railway Hosting Infrastructure**
   - Purpose: Application and database hosting
   - Security: Inherited controls (see Section 4)

6. **CUI Vault Infrastructure**
   - Location: Google Compute Engine (GCE)
   - Purpose: Dedicated CUI storage infrastructure
   - Domain: vault.mactechsolutionsllc.com
   - Database: PostgreSQL on localhost with encrypted CUI records
   - Security: TLS 1.3 encryption, API key authentication, database encryption at rest

### Out-of-Scope Components

- Developer workstations and local development environments
- Third-party services accessed by the application (SAM.gov API, USAspending API)
- End-user browsers and client devices

---

## 4. Inherited Controls

The following security controls are inherited from the Railway cloud platform:

### 4.1 TLS/HTTPS Encryption
- **Control:** All network communications are encrypted using TLS
- **Provider:** Railway platform (automatic HTTPS)
- **Evidence:** Railway platform configuration, `railway.json`
- **Coverage:** All data in transit between clients and the application

### 4.2 Physical Security
- **Control:** Physical security of data center facilities
- **Provider:** Railway (hosted on cloud infrastructure)
- **Coverage:** Physical access controls, environmental controls, facility security

### 4.3 Infrastructure Security
- **Control:** Network security capabilities
- **Provider:** Railway platform
- **Coverage:** Security capabilities are relied upon operationally from the service provider but are not independently assessed as part of this CMMC Level 1 self-assessment

### 4.4 Database Security
- **Control:** Database security capabilities
- **Provider:** Railway PostgreSQL service
- **Coverage:** Security capabilities are relied upon operationally from the service provider but are not independently assessed as part of this CMMC Level 1 self-assessment

### 4.5 Network Segmentation
- **Control:** Network infrastructure and logical network segmentation
- **Provider:** Railway platform
- **Coverage:** Railway provides network infrastructure with logical separation between publicly accessible system components (application tier) and internal network components (database tier)
- **Architecture:** 
  - Public-facing application tier (Next.js) operates in a publicly accessible network segment
  - Internal database tier (PostgreSQL) operates in an internal network segment with controlled access
  - Network boundaries and access controls are managed by Railway
- **Evidence:** Railway platform network architecture, logical separation of application and database services

**Note:** These inherited controls satisfy certain CMMC Level 1 requirements. The organization relies on Railway platform for these controls. See `Inherited_Control_Statement_Railway.md` for detailed inherited control statement.

---

## 5. System Architecture

### 5.1 Application Layer
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Authentication:** NextAuth.js with credentials provider
- **Session Management:** Token-based session handling via NextAuth.js
- **Evidence:** `lib/auth.ts`, `middleware.ts`

### 5.2 Data Layer
- **Main Application Database:** PostgreSQL (Railway)
- **ORM:** Prisma
- **Schema Location:** `prisma/schema.prisma`
- **FCI Models:** `GovernmentContractDiscovery`, `UsaSpendingAward`, `OpportunityAwardLink`
- **CUI Vault Database:** PostgreSQL (Google Compute Engine, localhost only)
- **CUI Vault Schema:** `cui_records` table with encrypted fields (ciphertext, nonce, tag)

### 5.3 Access Control
- **Role-Based Access Control (RBAC):** USER and ADMIN roles
- **Admin Route Protection:** Middleware-based enforcement
- **Evidence:** `middleware.ts` (lines 19-40), `lib/auth.ts` (line 19)

### 5.4 Deployment
- **Platform:** Railway (cloud PaaS)
- **Configuration:** `railway.json`, `Procfile`
- **Database:** Railway PostgreSQL service
- **Environment:** Production environment on Railway infrastructure

### 5.5 Network Architecture
- **Main Application Network Segmentation:** Railway platform provides logical network separation
- **Public Tier:** Next.js application operates in publicly accessible network segment
  - Accepts HTTPS connections from internet
  - Handles user authentication and application logic
  - No direct database access from internet
- **Internal Tier:** PostgreSQL database operates in internal network segment
  - Accessible only from application tier via Railway-managed network
  - Not directly accessible from internet
  - Encrypted connections between application and database
- **Network Boundaries:** Railway manages network boundaries and access controls
- **CUI Vault Network Architecture:**
  - **Public Access:** HTTPS/TLS 1.3 (vault.mactechsolutionsllc.com, port 443)
  - **API Layer:** REST API with API key authentication
  - **Database Layer:** PostgreSQL bound to localhost only (127.0.0.1:5432)
  - **Network Isolation:** Database not accessible from external network
  - **Infrastructure:** Google Cloud Platform VPC network
- **Evidence:** Railway platform architecture, logical separation of services; CUI vault evidence documents

---

## 6. User Access

### 6.1 Authorized Users
- System access is restricted to authorized personnel only
- All users must have unique accounts (no shared accounts)
- User accounts are created and managed by administrators
- Evidence: `prisma/schema.prisma` (User model, lines 14-27)

### 6.2 Authentication Requirements
- All users must authenticate using email and password
- Passwords are hashed using bcrypt (12 rounds)
- Minimum password length: 8 characters
- Evidence: `lib/auth.ts` (lines 39-42), `app/api/auth/change-password/route.ts` (lines 26-31, 68)

### 6.3 Role-Based Access
- **ADMIN role:** Full access to admin portal and system management functions
- **USER role:** Limited access (if implemented)
- Admin routes are protected by middleware
- Evidence: `middleware.ts` (line 29)

---

## 7. Compliance Risks & Open Items

### 7.1 File Upload Storage
**Risk Description:** Uploaded files are currently stored locally within the application runtime in `/public/uploads/` directory. These files are limited to non-sensitive content and are not FCI.

**Mitigation:**
- No removable media is used for file storage
- Files are stored within the application runtime environment
- Future architectural changes may migrate uploads to managed cloud storage

**Status:** Acceptable for Level 1 compliance; enhancement opportunity for future architecture

### 7.2 Multi-Factor Authentication (MFA)
**Status:** MFA is not implemented. MFA is not required for CMMC Level 1 compliance but represents a security enhancement opportunity.

### 7.3 Audit Logging
**Status:** Formal audit logging system is not implemented. Application logs are available through Railway platform logging. Enhanced audit logging may be implemented as a future enhancement.

### 7.4 Non-Required Hardening Items (Out of Scope for Level 1)
The following items are not required for CMMC Level 1 but represent potential future enhancements:
- Rate limiting on API endpoints
- Explicit security headers configuration
- Automated vulnerability scanning
- Cloud-based file storage migration

---

**Document Status:** This document reflects the system state as of 2026-01-21 and is maintained under configuration control.

---

## 8. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be completed]

**Change History:**
- Version 1.0 (2026-01-21): Initial document creation

---

## Appendix A: Evidence Locations

| Control Area | Evidence Location |
|-------------|------------------|
| Authentication | `lib/auth.ts` |
| Access Control | `middleware.ts` (lines 19-40) |
| Password Handling | `app/api/auth/change-password/route.ts` (lines 26-31, 68) |
| Database Schema | `prisma/schema.prisma` (User model, lines 14-27) |
| FCI Storage | `prisma/schema.prisma` (GovernmentContractDiscovery model) |
| Deployment Config | `railway.json`, `Procfile` |
| Role-Based Access | `middleware.ts` (line 29), `lib/auth.ts` (line 19) |

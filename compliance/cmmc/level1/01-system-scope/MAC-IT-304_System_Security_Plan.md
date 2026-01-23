# System Security Plan - CMMC Level 1

**Document Version:** 2.1  
**Date:** 2026-01-22  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 1 (Foundational)  
**Reference:** FAR 52.204-21

**Applies to:** CMMC 2.0 Level 1 (FCI-only system)

---

## 1. System Overview

### 1.1 System Identification

**System Name:** MacTech Solutions Application  
**System Type:** Web Application  
**Hosting:** Railway Cloud Platform  
**Database:** PostgreSQL (Railway)  
**Source Control:** GitHub

### 1.2 System Purpose

The system processes, stores, and manages Federal Contract Information (FCI) related to non-public contract information received, generated, or stored internally. Only non-public information related to government contracts is treated as FCI. Publicly released information (e.g., SAM.gov postings) is not FCI unless combined with internal, non-public data. The system does not process proposals, Statements of Work (SOWs), or contract documentation that may contain CUI.

**System Scope:** FCI-only environment. CUI is prohibited and not intentionally processed or stored.

---

## 2. System Boundary

### 2.1 In-Scope Components

**Application Layer:**
- Next.js 14 web application
- TypeScript codebase
- Admin portal (`/admin/*`)
- Public-facing pages

**Data Layer:**
- PostgreSQL database (Railway)
- User accounts and authentication data
- FCI data (publicly available contract opportunities and opportunity tracking data only)
- Audit logs and system events

**Infrastructure:**
- Railway cloud platform (hosting)
- Railway PostgreSQL (database)
- GitHub (source code repository)

### 2.2 Out-of-Scope Components

- CUI (Controlled Unclassified Information) - Not processed or stored
- Classified information - Not applicable
- Third-party services (SAM.gov API, USAspending.gov API) - Read-only public APIs

### 2.3 System Boundary Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  System Boundary                       │
│                                                         │
│  ┌──────────────────────────────────────────────┐   │
│  │     PUBLIC NETWORK SEGMENT (Railway)            │   │
│  │  ┌──────────────┐                              │   │
│  │  │   Next.js    │                              │   │
│  │  │  Application │                              │   │
│  │  │  (Railway)   │                              │   │
│  │  └──────────────┘                              │   │
│  └──────────────┬─────────────────────────────────┘   │
│                 │ Network Boundary (Railway Managed)   │
│                 │ Encrypted Internal Connection        │
│  ┌──────────────▼─────────────────────────────────┐   │
│  │     INTERNAL NETWORK SEGMENT (Railway)           │   │
│  │  ┌──────────────┐                              │   │
│  │  │  PostgreSQL  │                              │   │
│  │  │   Database   │                              │   │
│  │  │   (Railway)   │                              │   │
│  │  └──────────────┘                              │   │
│  └─────────────────────────────────────────────────┘   │
│         │                                             │
│         │ HTTPS/TLS (Public Network)                  │
│         ▼                                             │
│  ┌──────────────┐                                     │
│  │    Users     │                                     │
│  │  (Browser)   │                                     │
│  └──────────────┘                                     │
│                                                         │
│  External (Read-Only):                                 │
│  - SAM.gov API                                         │
│  - USAspending.gov API                                 │
└─────────────────────────────────────────────────────────┘
```

**Network Segmentation (FAR 52.204-21(b)(1)(xi)):**
- Railway platform provides logical network separation between publicly accessible and internal components
- Public network segment: Next.js application (accepts HTTPS from internet)
- Internal network segment: PostgreSQL database (not directly accessible from internet)
- Network boundaries and access controls managed by Railway (inherited control)

---

## 3. Data Flow

### 3.1 FCI Data Flow

**Input:**
- Contract opportunities from SAM.gov API (read-only)
- User-entered data (opportunity analysis notes and tracking information - non-public data only)
- Note: File uploads are disabled

**Processing:**
- Data stored in PostgreSQL database
- Application logic processes and displays FCI
- Admin functions manage FCI

**Output:**
- FCI displayed to authorized users
- CSV exports (admin-only)
- Reports and dashboards

**Storage:**
- All FCI stored in PostgreSQL database (encrypted at rest)
- No FCI stored on local devices
- No removable media used

### 3.2 Authentication Flow

1. User accesses application
2. Unauthenticated users redirected to `/auth/signin`
3. User provides email and password
4. System validates credentials (bcrypt)
5. Session token created (JWT)
6. User accesses protected resources
7. Session expires after 8 hours

---

## 4. System Interconnections and External Dependencies

### 4.1 External System Connections

The system connects to the following external systems:

| External System | Connection Type | Purpose | Data Flow | Security Controls | Connection Method |
|----------------|-----------------|---------|-----------|-------------------|-------------------|
| **SAM.gov API** | HTTPS/TLS (read-only) | Retrieve public contract opportunity data | Outbound only | TLS encryption (inherited from Railway), read-only access | REST API calls |
| **USAspending.gov API** | HTTPS/TLS (read-only) | Retrieve public award history data | Outbound only | TLS encryption (inherited from Railway), read-only access | REST API calls |
| **Railway Platform** | HTTPS/TLS, Encrypted database connection | Application hosting, database hosting, CI/CD | Bidirectional | TLS encryption, database encryption at rest (inherited controls) | Platform service integration |
| **GitHub.com** | HTTPS/TLS | Source code repository, dependency scanning | Bidirectional | TLS encryption, repository access controls (inherited controls) | Git operations, API calls |

### 4.2 Connection Security Controls

**Network Encryption:**
- All external connections use HTTPS/TLS encryption
- TLS provided by Railway platform (inherited control)
- Database connections encrypted (Railway-managed)

**Access Controls:**
- External API access: Read-only, no authentication required (public APIs)
- GitHub repository access: Controlled via GitHub authentication and authorization
- Railway platform access: Controlled via Railway authentication

**Connection Monitoring:**
- Application logs available through Railway platform
- API call errors logged in application logs
- Connection failures monitored via Railway platform

### 4.3 Data Flow for External Systems

**SAM.gov API:**
- System initiates HTTPS connection to SAM.gov API
- Retrieves public contract opportunity data
- Data processed and stored in PostgreSQL database
- No FCI transmitted to SAM.gov (read-only, public data)

**USAspending.gov API:**
- System initiates HTTPS connection to USAspending.gov API
- Retrieves public award history data
- Data processed and stored in PostgreSQL database
- No FCI transmitted to USAspending.gov (read-only, public data)

**GitHub.com:**
- Source code push/pull operations via Git over HTTPS
- Dependabot automated scanning (weekly)
- Security advisories and dependency alerts
- No FCI stored in source code repository

**Railway Platform:**
- Application deployment via Railway platform
- Database hosting via Railway PostgreSQL service
- CI/CD integration for automated deployments
- All data transmission encrypted

### 4.4 Interconnection Agreements

**Public APIs (SAM.gov, USAspending.gov):**
- No formal interconnection agreements required (public APIs)
- Terms of service apply as published by respective agencies
- Read-only access, no authentication required

**Railway Platform:**
- Service agreement with Railway platform
- Terms of service as defined by Railway
- Inherited security controls documented in inherited controls documentation

**GitHub.com:**
- Terms of service as defined by GitHub
- Repository access controlled via GitHub authentication
- Inherited security controls documented in inherited controls documentation

**Related Documents:**
- FCI Data Handling: `MAC-SEC-303_FCI_Data_Handling_and_Flow_Summary.md`
- Inherited Controls: `../03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md`

---

## 5. User Roles and Access Model

### 4.1 User Roles

**ADMIN:**
- Full system access
- Admin portal access (`/admin/*`)
- User management
- System configuration
- Evidence export capabilities

**USER:**
- Limited access
- Cannot access admin portal
- Redirected from admin routes

### 4.2 Access Control

**Authentication:**
- Required for all system access
- NextAuth.js with credentials provider
- Password hashing (bcrypt, 12 rounds)

**Authorization:**
- Role-based access control (RBAC)
- Middleware enforces route protection
- Admin routes require ADMIN role

**Session Management:**
- JWT-based sessions
- 8-hour session expiration
- Secure, HttpOnly cookies (production)

### 5.3 User Agreements and Ongoing Requirements

**Initial User Agreement:**
- All users must complete and sign the User Access and FCI Handling Acknowledgement form before system access is granted
- Individual user agreements are maintained for each user (see Appendix A.2.1)
- User agreements document understanding of FCI protection requirements, CUI prohibition, and system access responsibilities

**Ongoing Compliance Requirements:**
- All users must comply with ongoing stakeholder requirements as documented in `MAC-POL-217_Ongoing_Stakeholder_Requirements.md`
- Ongoing requirements include: password management, access reviews, security awareness, incident reporting, physical access logging (if applicable), endpoint inventory maintenance, and annual re-acknowledgement
- ADMIN role users have additional administrative responsibilities (user account management, system administration, evidence maintenance)

**Related Documents:**
- User Access and FCI Handling Acknowledgement Template: `../02-policies-and-procedures/MAC-FRM-203_User_Access_and_FCI_Handling_Acknowledgement.md`
- Ongoing Stakeholder Requirements: `../02-policies-and-procedures/MAC-POL-217_Ongoing_Stakeholder_Requirements.md`
- Individual User Agreements: `../02-policies-and-procedures/user-agreements/` (see Appendix A.2.1)

---

## 6. Inherited Controls

### 5.1 Railway Platform

**Physical Security:**
- Data center physical access controls
- Environmental controls
- Facility security (guards, surveillance)
- Redundant power and cooling

**Network Security:**
- TLS/HTTPS termination
- Network security capabilities (relied upon operationally, not independently assessed)
- Network-level security
- Network segmentation: Logical separation between public-facing application tier and internal database tier
- Network boundaries and access controls managed by Railway

**Platform Security:**
- Platform patching and updates
- Malware protection
- File scanning
- Automated threat detection

**Database Security:**
- Database security capabilities (relied upon operationally, not independently assessed)
- Automated backups
- Access controls

**Evidence:** See `03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md`

### 5.2 GitHub Platform

**Repository Security:**
- Access controls
- Code review processes
- Branch protection

**Dependency Security:**
- Dependabot automated scanning (weekly)
- Security advisories
- Dependency vulnerability alerts

**Evidence:** See `03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md`

---

## 7. Security Controls

This section provides detailed implementation information for each of the 17 CMMC Level 1 practices. For comprehensive assessment details, see `04-self-assessment/MAC-AUD-401_Internal_Cybersecurity_Self-Assessment.md`.

### 7.1 Access Control (AC)

#### AC.L1-3.1.1: Limit information system access to authorized users, processes acting on behalf of authorized users, or devices

**Implementation:**
- All system access requires authentication via NextAuth.js
- Unauthenticated users are redirected to sign-in page (`/auth/signin`)
- Admin routes are protected by middleware
- Authentication status verified on every request
- All users must complete User Access and FCI Handling Acknowledgement before access is granted
- Ongoing compliance with stakeholder requirements is maintained (see `MAC-POL-217_Ongoing_Stakeholder_Requirements.md`)

**Evidence:**
- `middleware.ts` (lines 19-26)
- `lib/auth.ts` (lines 7-95)
- `prisma/schema.prisma` (User model)
- User agreements: `../02-policies-and-procedures/user-agreements/` (see Appendix A.2.1)

**Status:** ✅ Implemented

#### AC.L1-3.1.2: Limit information system access to the types of transactions and functions that authorized users are permitted to execute

**Implementation:**
- Role-based access control (RBAC) with USER and ADMIN roles
- Admin routes require ADMIN role (`/admin/*`)
- Non-admin users are redirected from admin routes
- Middleware checks user role before allowing access

**Evidence:**
- `middleware.ts` (lines 28-32)
- `prisma/schema.prisma` (User model, line 19: role field)
- `lib/auth.ts` (lines 86-93: session management)

**Status:** ✅ Implemented

#### AC.L1-3.1.3: Verify and control/limit connections to and use of external information systems

**Implementation:**
- All external connections are via HTTPS/TLS (inherited from Railway platform)
- Network security provided by Railway platform
- Firewall rules and DDoS protection (inherited)
- External API connections: SAM.gov API and USAspending.gov API (read-only, public APIs)

**Evidence:**
- Railway platform configuration (inherited control)
- Network encryption: Railway platform (inherited control)

**Status:** ✅ Inherited

#### AC.L1-3.1.4: Control information posted or processed on publicly accessible information systems

**Implementation:**
- No FCI is posted to publicly accessible systems
- FCI is stored in protected database (authentication required)
- Public pages do not display FCI
- Admin portal requires authentication

**Evidence:**
- `middleware.ts` (lines 19-40)
- `prisma/schema.prisma` (FCI models)

**Status:** ✅ Implemented

### 7.2 Identification and Authentication (IA)

#### IA.L1-3.5.1: Identify information system users, processes acting on behalf of users, or devices

**Implementation:**
- Users are identified by unique email addresses
- Each user has unique system identifier (CUID)
- User accounts stored in database with unique constraints
- User identification enforced at database level

**Evidence:**
- `prisma/schema.prisma` (User model, line 16: `email String @unique`)
- `app/api/admin/create-user/route.ts` (user creation)

**Status:** ✅ Implemented

#### IA.L1-3.5.2: Authenticate (or verify) the identities of those users, processes, or devices before allowing access

**Implementation:**
- All users must authenticate before accessing system
- Authentication via NextAuth.js with credentials provider
- Email and password authentication required
- Password verified using bcrypt (12 rounds)
- Session tokens used for authenticated access

**Evidence:**
- `lib/auth.ts` (lines 7-95)
- `lib/auth.ts` (lines 39-42: password verification)
- `lib/auth.ts` (lines 59-94: session management)

**Status:** ✅ Implemented

### 7.3 Media Protection (MP)

#### MP.L1-3.8.3: Sanitize or destroy information system media containing Federal Contract Information before disposal or release for reuse

**Implementation:**
- No removable media is used for FCI storage
- All FCI stored in cloud database (PostgreSQL)
- Database record deletion via Prisma ORM (permanent deletion)
- No FCI on physical media requiring sanitization

**Evidence:**
- `prisma/schema.prisma` (FCI models)
- Architecture: All cloud-based storage (no removable media)

**Status:** ✅ Implemented

**Related Policy:** See `02-policies-and-procedures/MAC-POL-213_Media_Handling_Policy.md`

### 7.4 Physical and Environmental Protection (PE)

#### PE.L1-3.10.1: Limit physical access to organizational information systems, equipment, and the respective operating environments to authorized individuals

**Implementation:**
- Office facilities: Physical access restricted to authorized personnel
- Cloud infrastructure: Physical security inherited from Railway platform
- Devices: Password-protected, screen locks enabled
- Physical access controls appropriate to operating environment

**Evidence:**
- Organizational procedures (office security)
- Railway platform (inherited physical security for infrastructure)

**Status:** ✅ Implemented (Office) / ✅ Inherited (Infrastructure)

#### PE.L1-3.10.2: Escort visitors and monitor visitor activity

**Implementation:**
- Visitors are escorted by authorized personnel
- Visitors are supervised during entire visit
- Visitors are not left unattended
- Visitors do not access system or view FCI

**Evidence:**
- Organizational procedures

**Status:** ✅ Implemented

#### PE.L1-3.10.4: Maintain audit logs of physical access

**Implementation:**
- Physical access logging module implemented in admin portal (`/admin/physical-access-logs`)
- Digital logbook accessible only by ADMIN users
- Records physical access entries for locations where systems used to process/store/access FCI exist
- Required fields: date, time-in, time-out, person name, purpose, host/escort, location, notes
- Tamper-evident: includes created_at, created_by_user_id; entries are immutable after creation
- CSV export functionality for evidence generation
- Database retention policy: configurable, default 90 days minimum

**Evidence:**
- Database: `PhysicalAccessLog` table (`prisma/schema.prisma`)
- Admin UI: `/admin/physical-access-logs` (`app/admin/physical-access-logs/page.tsx`)
- API Routes: `/api/admin/physical-access-logs` (`app/api/admin/physical-access-logs/route.ts`)
- Export: `/api/admin/physical-access-logs/export` (`app/api/admin/physical-access-logs/export/route.ts`)

**Status:** ✅ Implemented

**Related Policy:** See `02-policies-and-procedures/MAC-POL-212_Physical_Security_Policy.md`

### 7.5 System and Communications Protection (SC)

#### SC.L1-3.13.1: Implement subnetworks for publicly accessible system components that are physically or logically separated from internal networks

**Implementation:**
- Network infrastructure and segmentation provided by Railway platform
- Public-facing application tier (Next.js) operates in publicly accessible network segment
- Internal database tier (PostgreSQL) operates in internal network segment with controlled access
- Network boundaries and access controls managed by Railway
- Logical separation between application and database tiers

**Evidence:**
- Railway platform (inherited control)
- Network Architecture: `01-system-scope/MAC-IT-301_System_Description_and_Architecture.md` (Section 5.5)

**Status:** ✅ Inherited

#### SC.L1-3.13.2: Control and manage the use of administrative privileges

**Implementation:**
- Administrative privileges controlled via ADMIN role
- Only ADMIN users can access admin portal
- Admin route protection enforced by middleware
- Non-admin users redirected from admin routes

**Evidence:**
- `middleware.ts` (lines 28-32)
- `prisma/schema.prisma` (User model, line 19: role field)

**Status:** ✅ Implemented

#### SC.L1-3.13.8: Use encryption for FCI in transit

**Implementation:**
- All data in transit encrypted via HTTPS/TLS
- Encryption provided by Railway platform (automatic HTTPS)
- All communications encrypted
- FCI transmitted over encrypted connections
- Client to application: HTTPS/TLS
- Application to database: Encrypted connection

**Evidence:**
- Railway platform (inherited control)
- TLS/HTTPS: Railway platform (inherited control)

**Status:** ✅ Inherited

#### SC.L1-3.13.16: Use encryption for FCI at rest

**Implementation:**
- Database encryption at rest provided by Railway PostgreSQL service
- Passwords encrypted using bcrypt hashing (12 rounds)
- FCI stored in encrypted database

**Evidence:**
- Railway platform (inherited control for database encryption)
- Password Hashing: `lib/auth.ts` (bcrypt), `app/api/auth/change-password/route.ts` (line 68)

**Status:** ✅ Inherited

### 7.6 System and Information Integrity (SI)

#### SI.L1-3.14.1: Employ malicious code protection mechanisms at information system entry and exit points

**Implementation:**
- Malware protection provided by Railway platform
- Platform includes automated threat detection
- Network-level protections against malicious traffic
- Infrastructure-level malware protection (Railway)

**Evidence:**
- Railway platform (inherited control)

**Status:** ✅ Inherited

#### SI.L1-3.14.2: Identify, report, and correct information and information system flaws in a timely manner

**Implementation:**
- Dependencies managed via npm and `package.json`
- Security advisories monitored
- GitHub Dependabot performs automated weekly vulnerability scanning
- Vulnerabilities addressed during development cycles
- npm audit available for vulnerability identification
- Dependabot creates automated pull requests for security updates

**Evidence:**
- `package.json` (dependencies)
- `.github/dependabot.yml` (automated vulnerability scanning configuration)
- Dependency management process

**Status:** ✅ Implemented

**Related Policy:** See `02-policies-and-procedures/MAC-POL-214_System_Integrity_Policy.md`

#### SI.L1-3.14.3: Update malicious code protection mechanisms when new releases are available

**Implementation:**
- Malware protection updates managed by Railway platform
- Platform manages security updates
- No manual update process required

**Evidence:**
- Railway platform (inherited control)

**Status:** ✅ Inherited

#### SI.L1-3.14.4: Perform periodic scans of the information system and real-time scans of files from external sources

**Implementation:**
- File scanning provided by Railway platform
- Platform includes automated scanning capabilities
- Real-time protection against malicious files
- Infrastructure-level file scanning (Railway)

**Evidence:**
- Railway platform (inherited control)

**Status:** ✅ Inherited

#### SI.L1-3.14.5: Endpoint Protection Verification

**Implementation:**
- Endpoint inventory module tracks all endpoints used to access/administer the system (`/admin/endpoint-inventory`)
- Each endpoint entry includes: device identifier, owner name, operating system, antivirus enabled status, last verification date, verification method
- Endpoint antivirus status is verified using the Endpoint AV Verification template
- Verification records document the verification method used
- CSV export functionality for evidence generation

**Evidence:**
- Endpoint inventory: `/admin/endpoint-inventory`
- Database: `EndpointInventory` table (`prisma/schema.prisma`)
- Endpoint AV Verification template: `05-evidence/templates/endpoint-av-verification-template.md`
- Endpoint Protection document: `06-supporting-documents/MAC-SEC-101_Endpoint_Protection.md`

**Status:** ✅ Implemented

### 7.7 Incident Response (IR)

#### IR.L1-3.6.2: Establish an operational incident-handling capability for organizational information systems

**Implementation:**
- Incident response policy established
- Security contact defined (security@mactechsolutions.com)
- Reporting procedures documented
- Incident documentation requirements established
- Incident identification and reporting procedures implemented
- All stakeholders have ongoing incident reporting responsibilities (see `MAC-POL-217_Ongoing_Stakeholder_Requirements.md`)

**Evidence:**
- `02-policies-and-procedures/MAC-POL-215_Incident_Response_Policy.md`
- `02-policies-and-procedures/MAC-SOP-223_Incident_Identification_and_Reporting_Procedure.md`
- `06-supporting-documents/MAC-SEC-107_Incident_Response_Quick_Card.md`
- Ongoing Stakeholder Requirements: `../02-policies-and-procedures/MAC-POL-217_Ongoing_Stakeholder_Requirements.md` (Section 6)

**Status:** ✅ Implemented

### 7.8 Audit Logging

**Implementation:**
- **Append-Only Design:** Audit logs are append-only and cannot be modified by standard administrators
- **Immutability:** Audit log entries are created via `AppEvent` model with no update or delete operations
- **Events Logged:**
  - Authentication events (login, login_failed, logout)
  - Admin actions (user management, password resets, exports)
  - File operations (upload, download, delete)
  - Security events (CUI spill detection, permission denials)
  - System events (config changes, physical access logs, endpoint inventory)
- **Retention:** Minimum 90 days
- **Access:** Admin-only access via `/admin/events`
- **Export:** CSV export functionality for evidence generation

**Evidence:**
- Database Schema: `prisma/schema.prisma` (AppEvent model, lines 879-900)
- Implementation: `lib/audit.ts` - Only create operations, no update/delete functions
- Admin UI: `/admin/events` (`app/admin/events/page.tsx`)
- Export API: `/api/admin/events/export` (`app/api/admin/events/export/route.ts`)

**Status:** ✅ Implemented

---

## 8. System Configuration

### 8.1 Application Configuration

- Next.js 14 with TypeScript
- NextAuth.js for authentication
- Prisma ORM for database access
- PostgreSQL database

### 8.2 Security Configuration

- Security headers (next.config.js)
- HTTPS enforcement (middleware.ts)
- Secure cookies (production)
- Session expiration (8 hours)

---

## 9. Contingency Planning and Backup/Recovery

### 9.1 Backup Procedures

**Database Backups:**
- Railway platform provides automated database backups for PostgreSQL service
- Backup retention managed by Railway platform
- Backup restoration available through Railway platform dashboard
- Backups include all FCI data, user accounts, and system configuration

**Source Code Backups:**
- Source code version-controlled in GitHub repository
- All code changes tracked via Git version control
- Repository access controlled via GitHub authentication
- Code history maintained in Git repository

**Configuration Backups:**
- Environment variables stored in Railway platform
- Configuration changes documented per Configuration Change Awareness Procedure
- Version control for configuration where applicable

**Status:** Database backups are provided by Railway platform (inherited control)

### 9.2 Recovery Procedures

**Database Recovery:**
- Database restoration available through Railway platform
- Point-in-time recovery capabilities provided by Railway (if available)
- Recovery procedures documented in Railway platform documentation
- Recovery testing: Performed as needed during system maintenance

**Application Recovery:**
- Application deployment via Railway platform
- Deployment process includes build and migration steps
- Rollback capabilities available through Railway platform
- Recovery time: Dependent on Railway platform capabilities

**Recovery Time Objectives (RTO):**
- Target RTO: Dependent on Railway platform service level agreements
- Actual RTO determined by Railway platform capabilities and incident severity

**Recovery Point Objectives (RPO):**
- Target RPO: Dependent on Railway platform backup frequency
- Actual RPO determined by Railway platform backup schedule

### 9.3 Disaster Recovery Considerations

**Infrastructure:**
- Cloud infrastructure hosted on Railway platform
- Railway platform manages infrastructure redundancy and availability
- Platform-level disaster recovery provided by Railway (inherited control)

**Data Protection:**
- All FCI stored in Railway PostgreSQL database
- Database encryption at rest (inherited from Railway)
- No local data storage requiring backup procedures

**Business Continuity:**
- System availability dependent on Railway platform availability
- Platform status monitored via Railway dashboard
- Incident response procedures address system availability issues

**Related Documents:**
- Inherited Controls: `../03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md`
- Incident Response Policy: `../02-policies-and-procedures/MAC-POL-215_Incident_Response_Policy.md`

---

## 10. System Maintenance

### 10.1 Maintenance Procedures

**Application Maintenance:**
- Code updates deployed via Railway platform
- Deployment process includes build and migration steps
- Updates tested in development environment before production deployment
- Maintenance windows: As needed, typically during low-usage periods

**Dependency Updates:**
- Dependencies managed via npm and `package.json`
- GitHub Dependabot performs automated weekly vulnerability scanning
- Security updates applied during development cycles
- Updates tested before deployment

**Database Maintenance:**
- Database migrations managed via Prisma ORM
- Migrations version-controlled in `prisma/migrations/`
- Database maintenance performed by Railway platform (inherited control)

**Infrastructure Maintenance:**
- Platform patching and updates managed by Railway platform
- No manual infrastructure maintenance required
- Platform updates managed by Railway (inherited control)

### 10.2 Patch Management Process

**Process:**
1. Security advisories reviewed (automated via Dependabot, manual review)
2. Vulnerable dependencies identified
3. Updates tested in development environment
4. Updates applied to production via deployment
5. Deployment includes dependency updates via `npm install`
6. System functionality verified after deployment

**Timeline:**
- Critical vulnerabilities: Addressed promptly
- High-severity vulnerabilities: Addressed in next development cycle
- Medium and low-severity vulnerabilities: Addressed as resources permit
- Automated pull requests created by Dependabot for security updates

**Evidence:**
- `.github/dependabot.yml` (automated vulnerability scanning)
- `package.json` (dependency versions)
- Deployment logs via Railway platform

**Related Documents:**
- System Integrity Policy: `../02-policies-and-procedures/MAC-POL-214_System_Integrity_Policy.md`
- Dependabot Configuration: `../05-evidence/MAC-RPT-103_Dependabot_Configuration_Evidence.md`

### 10.3 Update Deployment Procedures

**Deployment Process:**
1. Review available updates and security advisories
2. Test updates in development environment
3. Update code and dependencies in version control
4. Run database migrations if needed (`npx prisma migrate deploy`)
5. Deploy updates via Railway platform
6. Verify system functionality
7. Monitor for issues via Railway platform logs

**Deployment Configuration:**
- Build process: Defined in `railway.json` and `Procfile`
- Environment variables: Managed via Railway platform
- Database migrations: Executed automatically during deployment

**Evidence:**
- `railway.json` (deployment configuration)
- `Procfile` (process configuration)
- `package.json` (build scripts)
- Railway platform deployment logs

### 10.4 Maintenance Responsibilities

**System Administrator:**
- Application code updates
- Dependency management
- Database migrations
- Configuration changes

**Railway Platform (Inherited):**
- Infrastructure patching
- Platform updates
- Database maintenance
- Network maintenance

---

## 11. Configuration Management

### 11.1 Configuration Management Process

**Code Configuration:**
- All code changes managed via Git version control
- Source code stored in GitHub repository
- Changes reviewed before merging
- Version control provides configuration history

**Application Configuration:**
- Configuration settings in code (e.g., `next.config.js`, `middleware.ts`)
- Environment variables managed via Railway platform
- Configuration changes documented per Configuration Change Awareness Procedure

**Database Configuration:**
- Database schema defined in `prisma/schema.prisma`
- Database migrations version-controlled in `prisma/migrations/`
- Schema changes tracked via Prisma migrations

**Security Configuration:**
- Authentication secrets stored as environment variables
- Database connection strings stored as environment variables
- No secrets committed to source code
- Evidence: `.gitignore` excludes `.env` files

### 11.2 Change Control Procedures

**Code Changes:**
- All code changes managed via Git
- Changes reviewed before merging
- Deployment via Railway platform
- Evidence: GitHub repository, Railway deployment logs

**Configuration Changes:**
- Configuration changes documented per Configuration Change Awareness Procedure
- Environment variable changes managed via Railway platform
- Changes reviewed and approved before implementation
- Change documentation maintained

**Database Changes:**
- Schema changes via Prisma migrations
- Migrations version-controlled
- Migrations tested before deployment
- Evidence: `prisma/migrations/` directory

**Related Documents:**
- Configuration Change Awareness Procedure: `../02-policies-and-procedures/MAC-SOP-225_Configuration_Change_Awareness_Procedure.md`
- System Integrity Policy: `../02-policies-and-procedures/MAC-POL-214_System_Integrity_Policy.md`

### 11.3 Version Control Practices

**Source Code:**
- Git version control for all source code
- GitHub repository for code storage
- Branch protection and code review processes
- Commit history provides audit trail

**Database Schema:**
- Prisma schema version-controlled in `prisma/schema.prisma`
- Database migrations version-controlled in `prisma/migrations/`
- Migration history provides database change audit trail

**Configuration Files:**
- Configuration files (e.g., `package.json`, `next.config.js`) version-controlled
- Environment variable templates version-controlled where applicable
- Actual environment variables managed via Railway platform (not in version control)

### 11.4 Configuration Baselines

**Application Baseline:**
- Application configuration defined in code and environment variables
- Baseline documented in system documentation
- Changes tracked via version control

**Database Baseline:**
- Database schema baseline defined in `prisma/schema.prisma`
- Baseline migrations in `prisma/migrations/`
- Schema changes tracked via migrations

**Infrastructure Baseline:**
- Infrastructure configuration managed by Railway platform
- Platform configuration documented in Railway dashboard
- Changes managed by Railway platform (inherited control)

---

## 12. Compliance Status

**CMMC Level 1 Practices:**
- Certain infrastructure-related practices are inherited from platform providers; all organizational responsibilities are implemented internally.
- All 17 practices are either implemented or inherited.
- No practices are not implemented.

**Detailed Assessment:** See `04-self-assessment/MAC-AUD-401_Internal_Cybersecurity_Self-Assessment.md`

---

## 13. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be completed]

**Change History:**
- Version 2.1 (2026-01-22): Updated Appendix A to include all compliance documents (Ongoing Stakeholder Requirements, user agreements, missing policies and evidence documents); added references to user agreements and ongoing requirements in body sections
- Version 2.0 (2026-01-22): Enhanced with detailed security control implementations, system interconnections, contingency planning, system maintenance, configuration management sections, and comprehensive document references
- Version 1.0 (2026-01-21): Initial document creation

---

## Appendix A: Related Documents and Evidence Index

### A.1 System Scope and Architecture Documents

| Document | Path | Description |
|----------|------|-------------|
| System Boundary | `MAC-IT-105_System_Boundary.md` | System boundary definition and components |
| System Description | `MAC-IT-301_System_Description_and_Architecture.md` | Detailed system architecture and description |
| FCI Scope Statement | `MAC-SEC-302_FCI_Scope_and_Data_Boundary_Statement.md` | FCI scope and data boundary definition |
| FCI Data Handling | `MAC-SEC-303_FCI_Data_Handling_and_Flow_Summary.md` | FCI data flow and handling procedures |

### A.2 Policies and Procedures

| Document | Path | Description |
|----------|------|-------------|
| Access Control Policy | `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md` | Access control requirements and procedures |
| Identification & Authentication Policy | `../02-policies-and-procedures/MAC-POL-211_Identification_and_Authentication_Policy.md` | User identification and authentication requirements |
| Physical Security Policy | `../02-policies-and-procedures/MAC-POL-212_Physical_Security_Policy.md` | Physical security requirements and procedures |
| Media Handling Policy | `../02-policies-and-procedures/MAC-POL-213_Media_Handling_Policy.md` | Media handling and data disposal procedures |
| System Integrity Policy | `../02-policies-and-procedures/MAC-POL-214_System_Integrity_Policy.md` | System integrity, patching, and vulnerability management |
| Incident Response Policy | `../02-policies-and-procedures/MAC-POL-215_Incident_Response_Policy.md` | Incident response procedures and requirements |
| System Integrity Policy Reference | `../02-policies-and-procedures/MAC-POL-216_System_Integrity_Policy_Reference.md` | System integrity policy reference document (internal reference) |
| Ongoing Stakeholder Requirements | `../02-policies-and-procedures/MAC-POL-217_Ongoing_Stakeholder_Requirements.md` | Ongoing compliance requirements for all stakeholders (password management, access reviews, incident reporting, etc.) |
| User Account Provisioning | `../02-policies-and-procedures/MAC-SOP-221_User_Account_Provisioning_and_Deprovisioning_Procedure.md` | User account lifecycle procedures |
| Account Lifecycle Enforcement | `../02-policies-and-procedures/MAC-SOP-222_Account_Lifecycle_Enforcement_Procedure.md` | Account lifecycle enforcement procedures |
| Incident Identification & Reporting | `../02-policies-and-procedures/MAC-SOP-223_Incident_Identification_and_Reporting_Procedure.md` | Incident identification and reporting procedures |
| Physical Environment Controls | `../02-policies-and-procedures/MAC-SOP-224_Physical_Environment_and_Remote_Work_Controls.md` | Physical environment and remote work controls |
| Configuration Change Awareness | `../02-policies-and-procedures/MAC-SOP-225_Configuration_Change_Awareness_Procedure.md` | Configuration change documentation procedures |

### A.2.1 User Agreements and Acknowledgements

| Document | Path | Description |
|----------|------|-------------|
| User Access and FCI Handling Acknowledgement (Template) | `../02-policies-and-procedures/MAC-FRM-203_User_Access_and_FCI_Handling_Acknowledgement.md` | User agreement template form for initial access acknowledgement |
| Patrick User Agreement | `../02-policies-and-procedures/user-agreements/MAC-USR-001-Patrick_User_Agreement.md` | Individual user agreement for patrick@mactechsolutionsllc.com (ADMIN role) |
| Jon User Agreement | `../02-policies-and-procedures/user-agreements/MAC-USR-002-Jon_User_Agreement.md` | Individual user agreement for jon@mactechsolutionsllc.com (USER role) |
| Brian User Agreement | `../02-policies-and-procedures/user-agreements/MAC-USR-003-Brian_User_Agreement.md` | Individual user agreement for brian@mactechsolutionsllc.com (ADMIN role) |
| James User Agreement | `../02-policies-and-procedures/user-agreements/MAC-USR-004-James_User_Agreement.md` | Individual user agreement for james@mactechsolutionsllc.com (ADMIN role) |

### A.3 Control Responsibility Documents

| Document | Path | Description |
|----------|------|-------------|
| Inherited Controls - Railway Platform | `../03-control-responsibility/Inherited_Controls_Railway.md` | Railway platform shared responsibility model and inherited controls |
| Inherited Controls Appendix | `../03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md` | Detailed inherited controls from Railway and GitHub |
| Inherited Controls Matrix | `../03-control-responsibility/MAC-RPT-102_Inherited_Controls_Matrix.md` | Inherited controls matrix |
| Inherited Controls Responsibility Matrix | `../03-control-responsibility/MAC-RPT-311_Inherited_Controls_Responsibility_Matrix.md` | Responsibility matrix for inherited controls |
| Inherited Control Statement Railway | `../03-control-responsibility/MAC-SEC-310_Inherited_Control_Statement_Railway.md` | Railway inherited control statement |
| Inherited Control Validation | `../03-control-responsibility/MAC-RPT-313_Inherited_Control_Validation.md` | Third-party inherited control validation methodology |

### A.4 Self-Assessment Documents

| Document | Path | Description |
|----------|------|-------------|
| Internal Cybersecurity Self-Assessment | `../04-self-assessment/MAC-AUD-401_Internal_Cybersecurity_Self-Assessment.md` | Detailed assessment of all 17 CMMC Level 1 practices |
| CMMC L1 Practices Matrix | `../04-self-assessment/MAC-AUD-402_CMMC_L1_Practices_Matrix.md` | Practices matrix with evidence references |
| Self-Assessment Reference | `../04-self-assessment/MAC-AUD-403_Self_Assessment_Reference.md` | Self-assessment reference document |
| FAR 52.204-21 Checklist | `../04-self-assessment/FAR_52_204_21_Checklist.md` | FAR 52.204-21 requirements checklist |
| Internal Audit Checklist | `../04-self-assessment/MAC-AUD-103_Internal_Audit_Checklist.md` | Internal audit checklist |
| Annual Self-Assessment Process | `../04-self-assessment/Annual_Self_Assessment_Process.md` | Annual self-assessment procedures |

### A.5 Evidence Documents

| Document | Path | Description |
|----------|------|-------------|
| Evidence Index | `../05-evidence/MAC-RPT-100_Evidence_Index.md` | Comprehensive evidence index |
| Evidence Index (Detailed) | `../05-evidence/evidence-index.md` | Detailed evidence index |
| CUI Blocking Technical Controls | `../05-evidence/MAC-RPT-101_CUI_Blocking_Technical_Controls_Evidence.md` | CUI blocking controls evidence |
| Dependabot Configuration Evidence | `../05-evidence/MAC-RPT-103_Dependabot_Configuration_Evidence.md` | Dependabot configuration and evidence |
| Sample Exports | `../05-evidence/sample-exports/` | Sample CSV exports (users, audit logs, physical access logs, endpoint inventory) |
| Evidence Templates | `../05-evidence/templates/` | Evidence collection templates |
| - Endpoint AV Verification Template | `../05-evidence/templates/endpoint-av-verification-template.md` | Endpoint AV verification template |
| - Physical Access Log Procedure | `../05-evidence/templates/physical-access-log-procedure.md` | Physical access log procedure template |
| - Vulnerability Remediation Log Template | `../05-evidence/templates/vuln-remediation-log-template.md` | Vulnerability remediation log template |
| Endpoint Verification Records | `../05-evidence/endpoint-verifications/` | Endpoint AV verification records (sample records) |
| Vulnerability Remediation Logs | `../05-evidence/vulnerability-remediation/recent-remediations.md` | Vulnerability remediation documentation |

### A.6 Supporting Documents

| Document | Path | Description |
|----------|------|-------------|
| Endpoint Protection | `../06-supporting-documents/MAC-SEC-101_Endpoint_Protection.md` | Endpoint protection requirements and procedures |
| Physical Security | `../06-supporting-documents/MAC-SEC-104_Physical_Security.md` | Physical security supporting documentation |
| Vulnerability Management | `../06-supporting-documents/MAC-SEC-106_Vulnerability_Management.md` | Vulnerability management procedures |
| Incident Response Quick Card | `../06-supporting-documents/MAC-SEC-107_Incident_Response_Quick_Card.md` | Incident response quick reference |

### A.7 Executive Attestation

| Document | Path | Description |
|----------|------|-------------|
| CMMC Level 1 Executive Attestation | `../00-cover-memo/MAC-FRM-202_CMMC_Level_1_Executive_Attestation.md` | Executive attestation statement (authoritative version) |
| CMMC Level 1 Executive Attestation (Internal Reference) | `../00-cover-memo/CMMC_Level_1_Executive_Attestation.md` | Executive attestation internal reference document (not for submission) |
| Assessor Cover Memorandum | `../00-cover-memo/MAC-RPT-201_CMMC_Level_1_Assessor_Cover_Memorandum.md` | Assessor cover memorandum |

### A.8 Evidence Location Quick Reference

**Code Evidence:**
- Authentication: `lib/auth.ts`
- Access Control: `middleware.ts`
- Password Policy: `lib/password-policy.ts`
- Audit Logging: `lib/audit.ts`
- Database Schema: `prisma/schema.prisma`
- Database Migrations: `prisma/migrations/`

**Configuration Evidence:**
- Application Config: `next.config.js`
- Deployment Config: `railway.json`, `Procfile`
- Dependencies: `package.json`
- Dependabot Config: `.github/dependabot.yml`

**Admin Portal Evidence:**
- Physical Access Logs: `/admin/physical-access-logs`
- Endpoint Inventory: `/admin/endpoint-inventory`
- Audit Logs: `/admin/events`
- User Management: `/admin/users`

**Provider Evidence:**
- Railway Evidence: `../05-evidence/provider/railway/`
- GitHub Evidence: `../05-evidence/provider/github/`

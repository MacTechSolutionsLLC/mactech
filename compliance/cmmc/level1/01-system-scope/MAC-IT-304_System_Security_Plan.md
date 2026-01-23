# System Security Plan - CMMC Level 1

**Document Version:** 1.0  
**Date:** 2026-01-21  
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

## 4. User Roles and Access Model

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

---

## 5. Inherited Controls

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

## 6. Security Controls

### 6.1 Access Control (AC)

- Authentication required for all access
- Role-based access control (RBAC)
- Admin route protection
- Session management

### 6.2 Identification and Authentication (IA)

- Unique user identification (email)
- Password authentication
- Session tokens
- Password policy enforcement

### 6.3 Media Protection (MP)

- No removable media used
- Database storage only
- Secure deletion procedures

### 6.4 Physical and Environmental Protection (PE)

- Office physical security
- Physical access is limited to authorized users and enforced through environmental controls appropriate to the operating environment
- Physical access logging (PE.L1-3.10.4)
- Device security requirements

### 6.5 System and Communications Protection (SC)

- HTTPS/TLS enforcement
- Security headers
- Secure cookies
- Network encryption

### 6.6 System and Information Integrity (SI)

- Vulnerability management (Dependabot, npm audit)
- Malware protection (Railway platform)
- Endpoint inventory (SI.L1-3.14.2)
- Security event logging

### 6.7 Incident Response (IR)

- Incident response policy
- Security contact defined
- Reporting procedures
- Incident documentation

### 6.8 Audit Logging

- **Append-Only Design:** Audit logs are append-only and cannot be modified by standard administrators
- **Immutability:** Audit log entries are created via `AppEvent` model with no update or delete operations
- **Events Logged:**
  - Authentication events (login, login_failed, logout)
  - Admin actions (user management, password resets, exports)
  - File operations (upload, download, delete)
  - Security events (CUI spill detection, permission denials)
  - System events (config changes, physical access logs, endpoint inventory)
- **Retention:** Minimum 90 days
- **Evidence:** Audit logs are reviewed during security assessments and exported for evidence
- **Database Schema:** `prisma/schema.prisma` (AppEvent model, lines 879-900)
- **Implementation:** `lib/audit.ts` - Only create operations, no update/delete functions

---

## 7. System Configuration

### 7.1 Application Configuration

- Next.js 14 with TypeScript
- NextAuth.js for authentication
- Prisma ORM for database access
- PostgreSQL database

### 7.2 Security Configuration

- Security headers (next.config.js)
- HTTPS enforcement (middleware.ts)
- Secure cookies (production)
- Session expiration (8 hours)

---

## 8. Compliance Status

**CMMC Level 1 Practices:**
- Certain infrastructure-related practices are inherited from platform providers; all organizational responsibilities are implemented internally.
- All 17 practices are either implemented or inherited.
- No practices are not implemented.

**Detailed Assessment:** See `04-self-assessment/MAC-AUD-401_Internal_Cybersecurity_Self-Assessment.md`

---

## 9. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be completed]

**Change History:**
- Version 1.0 (2026-01-21): Initial document creation

---

## Appendix A: Related Documents

- System Boundary: `MAC-IT-105_System_Boundary.md`
- FCI Scope: `MAC-SEC-302_FCI_Scope_and_Data_Boundary_Statement.md`
- System Description: `MAC-IT-301_System_Description_and_Architecture.md`
- Self-Assessment: `../04-self-assessment/MAC-AUD-401_Internal_Cybersecurity_Self-Assessment.md`
- Inherited Controls: `../03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md`

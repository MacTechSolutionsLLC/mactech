# CMMC Level 1 Self-Assessment Checklist

**Document Version:** 1.0  
**Date:** 2026-01-21  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 1 (Foundational)  
**Reference:** FAR 52.204-21

---

## 1. Assessment Overview

This self-assessment documents the implementation status of all 17 CMMC Level 1 practices aligned to FAR 52.204-21. Each practice is assessed as **Implemented** or **Inherited**, with specific evidence locations referenced.

**Note:** CMMC Level 1 includes 17 practices aligned to FAR 52.204-21 (which contains 15 basic safeguarding requirements).

**System Scope:** This system is scoped to FCI only. CUI is prohibited and not intentionally processed or stored.

**Assessment Methodology:**
- Code review of actual implementation
- Configuration file review
- Architecture documentation review
- Evidence-based assessment (no speculation)

---

## 2. CMMC Level 1 Practices Assessment

### Practice 1: Limit information system access to authorized users, processes acting on behalf of authorized users, or devices (including other information systems)

**FAR Reference:** 52.204-21(b)(1)

**Status:** ✅ **Implemented**

**Implementation:**
- All system access requires authentication via NextAuth.js
- Unauthenticated users are redirected to sign-in page
- Admin routes are protected by middleware
- Evidence: `middleware.ts` (lines 19-26), `lib/auth.ts` (lines 7-95)

**Access Control:**
- Middleware intercepts all requests to protected routes
- Authentication status verified on every request
- Evidence: `middleware.ts` (lines 5-43)

**Evidence Locations:**
- Authentication: `lib/auth.ts`
- Access Control: `middleware.ts` (lines 19-40)
- Session Management: `lib/auth.ts` (lines 59-94)

---

### Practice 2: Limit information system access to the types of transactions and functions that authorized users are permitted to execute

**FAR Reference:** 52.204-21(b)(1)

**Status:** ✅ **Implemented**

**Implementation:**
- Role-based access control (RBAC) with USER and ADMIN roles
- Admin routes require ADMIN role
- Non-admin users are redirected from admin routes
- Evidence: `middleware.ts` (lines 28-32)

**Role Enforcement:**
- Middleware checks user role before allowing access
- Role is stored in session token
- Evidence: `middleware.ts` (line 29: `session.user?.role !== "ADMIN"`)

**Evidence Locations:**
- Role-Based Access: `middleware.ts` (line 29)
- User Model: `prisma/schema.prisma` (User model, line 19)
- Session Management: `lib/auth.ts` (lines 86-93)

---

### Practice 3: Verify and control/limit connections to and use of external information systems

**FAR Reference:** 52.204-21(b)(1)

**Status:** ✅ **Inherited**

**Implementation:**
- No external systems initiate inbound connections to the system.
- All access is user-initiated via authenticated HTTPS sessions.
- There are no API listeners, VPN tunnels, or persistent external integrations.
- HTTPS/TLS enforced (Railway platform - inherited)
- Network security provided by Railway platform (inherited)
- Firewall rules and DDoS protection (inherited)

**External System Connections:**
- SAM.gov API (read-only, public API)
- USAspending.gov API (read-only, public API)
- All connections encrypted via HTTPS/TLS

**Evidence Locations:**
- Platform Security: Railway platform (inherited control)
- Network Encryption: Railway platform (inherited control)

---

### Practice 4: Control information posted or processed on publicly accessible information systems

**FAR Reference:** 52.204-21(b)(1)

**Status:** ✅ **Implemented**

**Implementation:**
- No FCI is posted to publicly accessible systems
- FCI is stored in protected database (authentication required)
- Public pages do not display FCI
- Admin portal requires authentication
- Evidence: `middleware.ts` (lines 19-40)

**Public vs. Protected:**
- Public pages: No FCI displayed
- Admin portal: Protected, requires authentication
- FCI storage: Database (protected, authentication required)

**Evidence Locations:**
- Access Control: `middleware.ts` (lines 19-40)
- Database Schema: `prisma/schema.prisma` (FCI models)

---

### Practice 5: Identify information system users, processes acting on behalf of users, or devices

**FAR Reference:** 52.204-21(b)(1)

**Status:** ✅ **Implemented**

**Implementation:**
- Users are identified by unique email addresses
- Each user has unique system identifier (CUID)
- User accounts stored in database with unique constraints
- Evidence: `prisma/schema.prisma` (User model, line 16: `email String @unique`)

**User Identification:**
- Primary identifier: Email address (unique)
- System identifier: CUID (cryptographically unique)
- Evidence: `prisma/schema.prisma` (User model, lines 14-27)

**Evidence Locations:**
- User Model: `prisma/schema.prisma` (User model, lines 14-27)
- User Creation: `app/api/admin/create-user/route.ts`

---

### Practice 6: Authenticate (or verify) the identities of those users, processes, or devices before allowing access to organizational information systems

**FAR Reference:** 52.204-21(b)(1)

**Status:** ✅ **Implemented**

**Implementation:**
- All users must authenticate before accessing system
- Authentication via NextAuth.js with credentials provider
- Email and password authentication required
- Session tokens used for authenticated access
- Evidence: `lib/auth.ts` (lines 7-95)

**Authentication Flow:**
- User provides email and password
- System validates credentials against database
- Password verified using bcrypt
- Session created upon successful authentication
- Evidence: `lib/auth.ts` (lines 18-56)

**Evidence Locations:**
- Authentication: `lib/auth.ts`
- Password Verification: `lib/auth.ts` (lines 39-42)
- Session Management: `lib/auth.ts` (lines 59-94)

---

### Practice 7: Sanitize or destroy information system media containing Federal Contract Information before disposal or release for reuse

**FAR Reference:** 52.204-21(b)(2)

**Status:** ✅ **Not Applicable**

**Implementation:**
- The system does not utilize removable or portable media for the storage or transfer of Federal Contract Information (FCI).
- If removable media were to be introduced, it would be sanitized or destroyed in accordance with NIST SP 800-88 prior to disposal or reuse.

**Evidence Locations:**
- Architecture: All cloud-based storage (no removable media)

---

### Practice 8: Limit physical access to organizational information systems, equipment, and the respective operating environments to authorized individuals

**FAR Reference:** 52.204-21(b)(1)

**Status:** ✅ **Inherited**

**Implementation:**
- Physical access controls for system infrastructure are inherited from the hosting provider.
- Contractor personnel access systems only via authenticated remote access.
- No customer-managed physical infrastructure is used to process or store FCI.

**Evidence Locations:**
- Infrastructure Security: Railway platform (inherited control)

---

### Practice 9: Escort visitors and monitor visitor activity

**FAR Reference:** 52.204-21(b)(1)

**Status:** ✅ **Implemented**

**Implementation:**
- Visitors are escorted by authorized personnel
- Visitors are supervised during entire visit
- Visitors are not left unattended
- Visitors do not access system or view FCI
- Evidence: Organizational procedures

**Visitor Procedures:**
- Visitors identified and authorized
- Visitors escorted and supervised
- Visitors not granted system access
- Evidence: Organizational procedures

**Evidence Locations:**
- Visitor Access: Organizational procedures

---

### Practice 10: Maintain audit logs of physical access

**FAR Reference:** 52.204-21(b)(1)  
**CMMC Practice:** PE.L1-3.10.4

**Status:** ✅ **Implemented**

**Implementation:**
- Physical access logging module implemented in admin portal
- Digital logbook accessible only by ADMIN users
- Records physical access entries for locations where systems used to process/store/access FCI exist
- Required fields: date, time-in, time-out, person name, purpose, host/escort, location, notes
- Tamper-evident: includes created_at, created_by_user_id; entries are immutable after creation
- CSV export functionality for evidence generation
- Database retention policy: configurable, default 90 days minimum

**Physical Access Log Features:**
- Admin-only access via `/admin/physical-access-logs`
- Create, view, filter, and export physical access log entries
- Immutable audit trail (entries cannot be edited after creation)
- Evidence export: CSV download with date range filtering

**Evidence Locations:**
- Database: `PhysicalAccessLog` table (prisma/schema.prisma)
- Admin UI: `/admin/physical-access-logs` (app/admin/physical-access-logs/page.tsx)
- API Routes: `/api/admin/physical-access-logs` (app/api/admin/physical-access-logs/route.ts)
- Export: `/api/admin/physical-access-logs/export` (app/api/admin/physical-access-logs/export/route.ts)
- Migration: `prisma/migrations/20250122000000_add_physical_access_logs_and_endpoint_inventory/`

---

### Practice 11: Implement subnetworks for publicly accessible system components that are physically or logically separated from internal networks

**FAR Reference:** 52.204-21(b)(1)(xi)

**Status:** ✅ **Not Applicable**

**Implementation:**
- The system is a single-tier web application hosted on a managed platform-as-a-service.
- Subnetworks are not implemented or required; therefore, this requirement is not applicable.

**Evidence Locations:**
- System architecture: Single-tier web application
- Hosting platform: Managed platform-as-a-service (Railway)

---

### Practice 12: Control and manage the use of administrative privileges

**FAR Reference:** 52.204-21(b)(1)(x)

**Status:** ✅ **Implemented**

**Implementation:**
- Administrative privileges controlled via ADMIN role
- Only ADMIN users can access admin portal
- Admin route protection enforced by middleware
- Evidence: `middleware.ts` (lines 28-32)

**Admin Privilege Control:**
- Role-based access: ADMIN vs USER
- Admin routes protected: `/admin/*` requires ADMIN role
- Non-admin users redirected from admin routes
- Evidence: `middleware.ts` (line 29)

**Evidence Locations:**
- Admin Access Control: `middleware.ts` (lines 28-32)
- Role Management: `prisma/schema.prisma` (User model, line 19)

---

### Practice 13: Use encryption for FCI in transit

**FAR Reference:** 52.204-21(b)(3)(i)

**Note:** This practice (originally written for CUI) is applied to FCI in this system. The system does not process, store, or transmit CUI.

**Status:** ✅ **Inherited**

**Implementation:**
- All data in transit encrypted via HTTPS/TLS
- Encryption provided by Railway platform (automatic HTTPS)
- All communications encrypted
- FCI transmitted over encrypted connections
- Evidence: Railway platform configuration

**Encryption Coverage:**
- Client to application: HTTPS/TLS
- Application to database: Encrypted connection
- All network communications: Encrypted
- All FCI transmission: Encrypted

**Evidence Locations:**
- Network Encryption: Railway platform (inherited control)
- TLS/HTTPS: Railway platform (inherited control)

---

### Practice 14: Use encryption for FCI at rest

**FAR Reference:** 52.204-21(b)(3)(ii)

**Note:** This practice (originally written for CUI) is applied to FCI in this system. The system does not process, store, or transmit CUI.

**Status:** ✅ **Inherited**

**Implementation:**
- Database encryption at rest provided by Railway PostgreSQL service
- Passwords encrypted using bcrypt hashing
- FCI stored in encrypted database
- Evidence: Railway platform, `lib/auth.ts` (bcrypt)

**Encryption Coverage:**
- Database storage: Encryption at rest (Railway PostgreSQL)
- Password storage: Bcrypt hashing (12 rounds)
- Evidence: Railway platform, `lib/auth.ts` (line 5, line 68)

**Evidence Locations:**
- Database Encryption: Railway platform (inherited control)
- Password Hashing: `lib/auth.ts` (bcrypt), `app/api/auth/change-password/route.ts` (line 68)

---

### Practice 15: Employ malicious code protection mechanisms at information system entry and exit points

**FAR Reference:** 52.204-21(b)(4)(i)

**Status:** ✅ **Inherited**

**Implementation:**
- Malicious code protection is provided by the hosting provider's managed infrastructure and endpoint protections.
- The contractor does not deploy or manage separate malware detection tooling.
- Inherited from hosting provider; customer has no direct configuration authority.

**Evidence Locations:**
- Malware Protection: Railway platform (inherited control)

---

### Practice 16: Identify, report, and correct information and information system flaws in a timely manner

**FAR Reference:** 52.204-21(b)(4)(ii)

**Status:** ✅ **Implemented**

**Implementation:**
- System flaws are identified and corrected as they are discovered.
- The contractor may use available tooling to assist with flaw identification; however, no automated or continuous remediation process is required or claimed.

**Evidence Locations:**
- Dependency Management: `package.json`
- Vulnerability Awareness: Manual review process, npm audit

---

### Practice 16: Update malicious code protection mechanisms when new releases are available

**FAR Reference:** 52.204-21(b)(3)

**Status:** ✅ **Inherited**

**Implementation:**
- Updates to malicious code protection mechanisms are managed by the hosting provider as part of the inherited infrastructure services.
- Inherited from hosting provider; customer has no direct configuration authority.

**Evidence Locations:**
- Malware Protection Updates: Railway platform (inherited control)

---

### Practice 17: Perform periodic scans of the information system and real-time scans of files from external sources as files are downloaded, opened, or executed

**FAR Reference:** 52.204-21(b)(3)

**Status:** ✅ **Implemented**

**Implementation:**
- Basic system scanning is performed using available development and platform tooling as needed.
- No scheduled or automated scanning cadence is required or claimed.

**Evidence Locations:**
- Development tooling (as needed)
- Platform tooling (as needed)

---

### Practice 18: Control execution of mobile code

**FAR Reference:** 52.204-21(a)(15)

**Status:** ✅ **Not Applicable**

**Implementation:**
- The system does not execute mobile code technologies such as Java applets, ActiveX controls, or equivalent mechanisms.

**Evidence Locations:**
- System architecture: Web application does not utilize mobile code technologies

---

## 3. Summary Statistics

| Status | Count |
|--------|-------|
| ✅ Implemented | 11 |
| ✅ Inherited | 4 |
| ✅ Not Applicable | 2 |
| ⚠️ Not Implemented | 0 | 0% |
| **Total Practices** | **17** | **100%** |

---

## 4. Compliance Risks & Open Items

### 4.1 Not Implemented Items

**None** - All 17 CMMC Level 1 practices are implemented, inherited, or not applicable.

### 4.2 Enhancement Opportunities

**Multi-Factor Authentication (MFA)**
- **Status:** Not implemented (not required for Level 1)
- **Enhancement:** MFA may be implemented as future security enhancement

**Vulnerability Management**
- **Status:** ✅ **Implemented** - System flaws are identified and corrected as they are discovered. Available tooling may be used to assist with flaw identification; however, no automated or continuous remediation process is required or claimed.
- **Evidence:** `package.json`, `SECURITY.md`

**Formal Audit Logging**
- **Status:** Application logs available via Railway platform
- **Enhancement:** Enhanced audit logging system may be implemented

**Rate Limiting**
- **Status:** Not implemented (not required for Level 1)
- **Enhancement:** Rate limiting may be implemented as security hardening

**Explicit Security Headers**
- **Status:** Not explicitly configured (not required for Level 1)
- **Enhancement:** Security headers may be configured as hardening measure

### 4.3 File Upload Storage

**Risk Description:** Uploaded files stored locally in `/public/uploads/` are limited to non-sensitive content. No removable media is used. Future architectural changes may migrate uploads to managed cloud storage.

**Status:** Acceptable for Level 1 compliance; enhancement opportunity

---

## 5. Evidence Index

| Practice | Primary Evidence | Secondary Evidence |
|----------|-----------------|-------------------|
| 1 | `middleware.ts` (lines 19-26), `lib/auth.ts` | `lib/auth.ts` (lines 59-94) |
| 2 | `middleware.ts` (line 29) | `prisma/schema.prisma` (User model) |
| 3 | Railway platform | Network configuration |
| 4 | `middleware.ts` (lines 19-40) | Database schema |
| 5 | `prisma/schema.prisma` (User model, line 16) | User creation API |
| 6 | `lib/auth.ts` | `lib/auth.ts` (lines 39-42) |
| 7 | `prisma/schema.prisma` (FCI models) | Architecture (no removable media) |
| 8 | Organizational procedures, Railway platform | Device security procedures |
| 9 | Organizational procedures | Visitor access procedures |
| 10 | `app/admin/physical-access-logs/page.tsx`<br>`app/api/admin/physical-access-logs/route.ts`<br>Database: `PhysicalAccessLog` table | CSV export: `/api/admin/physical-access-logs/export` |
| 11 | `middleware.ts` (lines 28-32) | `prisma/schema.prisma` (User model) |
| 12 | Railway platform | TLS/HTTPS configuration |
| 13 | Railway platform, `lib/auth.ts` (bcrypt) | Password hashing |
| 14 | Railway platform | Platform security features |
| 15 | `package.json` | Dependency management process |
| 16 | Railway platform | Platform update process |
| 17 | Railway platform | Platform scanning features |

---

## 6. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be completed]

**Change History:**
- Version 1.0 (2026-01-21): Initial document creation

---

**Document Status:** This document reflects the system state as of 2026-01-21 and is maintained under configuration control.

---

## Appendix A: FAR 52.204-21 Mapping

| FAR Clause | CMMC Practice | Status |
|------------|---------------|--------|
| 52.204-21(b)(1) | Practices 1-11 | ✅ Implemented/Inherited |
| 52.204-21(b)(2) | Practice 7 | ✅ Implemented |
| 52.204-21(b)(3) | Practices 12-17 | ✅ Implemented/Inherited |

---

## Appendix B: Related Documents

- System Description (`01-system-scope/MAC-IT-301_System_Description_and_Architecture.md`)
- Access Control Policy (`02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`)
- Identification & Authentication Policy (`02-policies-and-procedures/MAC-POL-211_Identification_and_Authentication_Policy.md`)
- Media Handling & Data Disposal Policy (`02-policies-and-procedures/MAC-POL-213_Media_Handling_Policy.md`)
- Physical Security Policy (`02-policies-and-procedures/MAC-POL-212_Physical_Security_Policy.md`)
- System & Information Integrity Policy (`02-policies-and-procedures/MAC-POL-214_System_Integrity_Policy.md`)
- Dependabot Configuration Evidence (`05-evidence/MAC-RPT-103_Dependabot_Configuration_Evidence.md`)

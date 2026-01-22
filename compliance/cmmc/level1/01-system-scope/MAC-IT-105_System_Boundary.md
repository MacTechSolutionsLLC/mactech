# System Boundary & Data Handling Statement

**Document Version:** 1.0  
**Date:** 2026-01-21  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 1 (Foundational)  
**Reference:** FAR 52.204-21

**Applies to:** CMMC 2.0 Level 1 (FCI-only system)

---

## 1. Scope Statement

**FCI Only; CUI Excluded**

This system processes and stores **Federal Contract Information (FCI) only**, as defined by FAR 52.204-21. Only non-public information related to government contracts is treated as FCI. Publicly released information (e.g., SAM.gov postings) is not FCI unless combined with internal, non-public data. **Controlled Unclassified Information (CUI) is explicitly excluded** and prohibited from being uploaded, stored, or processed in the system.

---

## 2. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser (HTTPS)                      │
│  - Authenticated access via NextAuth.js                      │
│  - Security headers enforced                                │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/TLS (Railway)
                       ↓
┌─────────────────────────────────────────────────────────────┐
│          Next.js Application (Railway Platform)              │
│  - Authentication & Authorization                           │
│  - Input validation & CUI blocking                           │
│  - Event logging                                             │
│  - File upload handling                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │ Encrypted Connection
                       ↓
┌─────────────────────────────────────────────────────────────┐
│         PostgreSQL Database (Railway Platform)               │
│  - FCI storage (GovernmentContractDiscovery, etc.)          │
│  - User accounts & authentication                            │
│  - Event logs (AppEvent table)                               │
│  - File storage (StoredFile table - BYTEA)                  │
│  - Database security capabilities (Railway managed, relied upon operationally) │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              File Access (Signed URLs)                       │
│  - Files accessible via signed URLs with expiration          │
│  - Access logged in AppEvent table                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. File Storage Location and Access Method

### 3.1 Storage Location

**Primary Storage:** PostgreSQL database (Railway platform)
- FCI data: Stored in database tables (GovernmentContractDiscovery, UsaSpendingAward, etc.)
- Files: Stored in `StoredFile` table using BYTEA column (PostgreSQL binary data type)
- **No local file system storage** (replaces previous `/public/uploads/` approach)

### 3.2 Access Method

**File Access:**
- Files are stored in database as binary data (BYTEA)
- Files are accessible only via signed URLs with expiration
- Signed URLs are generated using HMAC-SHA256 with secret key
- Default expiration: 1 hour
- Access is logged in AppEvent table

**Database Access:**
- Direct database access is restricted to application layer
- All database access requires authentication
- Database connection is encrypted (Railway managed)

---

## 4. Public Content Separation from FCI

### 4.1 Public Content Control

**PublicContent Model:**
- Public content requires ADMIN approval before being visible
- Approval is logged in AppEvent table
- Public content is stored separately from FCI

**Implementation:**
- Any content marked "public" requires `isPublic = true` flag
- `approvedBy` and `approvedAt` fields track approval
- Approval workflow is logged

### 4.2 FCI vs Public Content

**FCI (In-Scope):**
- Contract opportunities from SAM.gov
- Opportunity metadata
- Contract-related administrative data
- Historical award data from USAspending.gov

**Public Content (Out-of-Scope for FCI Protection):**
- Public-facing website content
- Marketing materials
- Public blog posts (if any)
- **Note:** Public content approval control is implemented but public content is not FCI

---

## 5. System Components

### 5.1 In-Scope Components

1. **Next.js Web Application**
   - Location: Railway cloud platform
   - Technology: Next.js 14 (TypeScript), React
   - Purpose: User interface and business logic
   - Evidence: `app/`, `components/`, `lib/`

2. **PostgreSQL Database**
   - Location: Railway cloud platform
   - Purpose: Storage of FCI, user accounts, event logs, files
   - Evidence: `prisma/schema.prisma`, Railway platform

3. **Authentication System**
   - Technology: NextAuth.js with credentials provider
   - Purpose: User identification and authentication
   - Evidence: `lib/auth.ts`

4. **File Storage System**
   - Technology: PostgreSQL BYTEA column
   - Purpose: Secure file storage with signed URLs
   - Evidence: `lib/file-storage.ts`, `prisma/schema.prisma` (StoredFile model)

5. **Event Logging System**
   - Technology: PostgreSQL table (AppEvent)
   - Purpose: Application event logging for audit trail
   - Evidence: `lib/audit.ts`, `prisma/schema.prisma` (AppEvent model)

6. **GitHub Repository**
   - Purpose: Source code version control
   - Access: Restricted to authorized personnel
   - Evidence: GitHub repository

### 5.2 Out-of-Scope Components

- **Developer workstations** - Local development environments
- **Third-party services** - SAM.gov API, USAspending.gov API (read-only, public APIs)
- **End-user browsers** - Client-side devices
- **Railway infrastructure** - Physical security, network infrastructure (inherited controls)

---

## 6. Data Handling

### 6.1 FCI Data Types

**FCI Stored in System:**
- Non-public contract opportunity data received, generated, or stored internally
- Internal analysis, annotations, and derived data related to contract opportunities
- User-generated content that combines public data with internal, non-public information

**Note:** Publicly available data from SAM.gov and USAspending.gov is not FCI by itself. FCI exists only when such data is combined with internal, non-public information.

### 6.2 Prohibited Data Types

**Explicitly Prohibited:**
- Controlled Unclassified Information (CUI)
- Classified information
- PII beyond publicly available FCI
- Any data not directly related to federal contract opportunity management

**Enforcement:**
- CUI keyword blocking in input validation (`lib/cui-blocker.ts`)
- User acknowledgment required (`MAC-FRM-203_User_Access_and_FCI_Handling_Acknowledgement.md`)
- Procedural controls and training

---

## 7. Evidence Locations

| Component | Evidence Location |
|-----------|------------------|
| Application Code | `app/`, `components/`, `lib/` |
| Database Schema | `prisma/schema.prisma` |
| File Storage | `lib/file-storage.ts`, `prisma/schema.prisma` (StoredFile model) |
| Event Logging | `lib/audit.ts`, `prisma/schema.prisma` (AppEvent model) |
| Authentication | `lib/auth.ts`, `middleware.ts` |
| CUI Blocking | `lib/cui-blocker.ts` |
| Security Headers | `lib/security-headers.ts`, `next.config.js` |

---

## 8. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be completed]

**Change History:**
- Version 1.0 (2026-01-21): Initial document creation

---

## Appendix A: Related Documents

- Evidence Index (`../05-evidence/MAC-RPT-100_Evidence_Index.md`)
- Inherited Controls Matrix (`../03-control-responsibility/MAC-RPT-102_Inherited_Controls_Matrix.md`)
- Internal Audit Checklist (`../04-self-assessment/MAC-AUD-103_Internal_Audit_Checklist.md`)
- FCI Scope and Data Boundary Statement (`MAC-SEC-302_FCI_Scope_and_Data_Boundary_Statement.md`)

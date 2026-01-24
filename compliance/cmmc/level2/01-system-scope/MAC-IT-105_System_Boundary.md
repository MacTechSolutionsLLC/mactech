# System Boundary & Data Handling Statement - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-23  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2

**Applies to:** CMMC 2.0 Level 2 (FCI and CUI system)

---

## 1. Scope Statement

**FCI and CUI Processing**

**Level 1 (FCI):** This system processes and stores **Federal Contract Information (FCI)**, as defined by FAR 52.204-21. Only non-public information related to government contracts is treated as FCI. Publicly released information (e.g., SAM.gov postings) is not FCI unless combined with internal, non-public data.

**Level 2 (CUI):** This system has been upgraded to also process and store **Controlled Unclassified Information (CUI)**, as defined by 32 CFR Part 2002 and the CUI Registry. CUI is handled according to established CUI handling procedures and security controls.

**System Scope:** The system processes both FCI and CUI. FCI handling remains as documented in Level 1. CUI handling is added per Level 2 requirements. All security controls protect both FCI and CUI unless otherwise specified.

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
│     PUBLIC NETWORK SEGMENT (Railway Platform)                │
│          Next.js Application (Public Tier)                   │
│  - Authentication & Authorization                           │
│  - Input validation & CUI blocking                           │
│  - Event logging                                             │
│  - File upload handling                                      │
│  - Publicly accessible network segment                       │
└──────────────────────┬──────────────────────────────────────┘
                       │ Encrypted Connection (Internal Network)
                       │ Network Boundary (Railway Managed)
                       ↓
┌─────────────────────────────────────────────────────────────┐
│     INTERNAL NETWORK SEGMENT (Railway Platform)              │
│         PostgreSQL Database (Internal Tier)                  │
│  - FCI storage (GovernmentContractDiscovery, etc.)          │
│  - CUI storage (contract proposals, SOWs, CUI documents)    │
│  - User accounts & authentication                            │
│  - Event logs (AppEvent table)                               │
│  - File storage (StoredFile table - BYTEA)                  │
│  - Database security capabilities (Railway managed)          │
│  - Not directly accessible from internet                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              File Access (Signed URLs)                       │
│  - Files accessible via signed URLs with expiration          │
│  - Access logged in AppEvent table                           │
└─────────────────────────────────────────────────────────────┘
```

**Network Segmentation:**
- **Public Network Segment:** Next.js application operates in publicly accessible network tier (accepts HTTPS from internet)
- **Internal Network Segment:** PostgreSQL database operates in internal network tier (not directly accessible from internet)
- **Network Boundary:** Railway platform manages network boundaries and access controls between tiers
- **Logical Separation:** Application and database are logically separated in different network segments

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
   - Purpose: Storage of FCI, CUI, user accounts, event logs, files
   - FCI files: StoredFile table
   - CUI files: StoredCUIFile table (separate storage with password protection)
   - Evidence: `prisma/schema.prisma`, Railway platform

3. **Authentication System**
   - Technology: NextAuth.js with credentials provider
   - Purpose: User identification and authentication
   - Evidence: `lib/auth.ts`

4. **File Storage System**
   - Technology: PostgreSQL BYTEA column
   - Purpose: Secure file storage with signed URLs
   - FCI files: StoredFile table
   - CUI files: StoredCUIFile table (password protected)
   - Evidence: `lib/file-storage.ts`, `prisma/schema.prisma` (StoredFile, StoredCUIFile models)

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

### 5.3 Network Architecture

**Network Segmentation (FAR 52.204-21(b)(1)(xi)):**
- Railway platform provides network infrastructure with logical network segmentation
- **Public Network Segment:** Next.js application operates in publicly accessible network tier
  - Accepts HTTPS connections from internet
  - Handles user authentication and application logic
  - No direct database access from internet
- **Internal Network Segment:** PostgreSQL database operates in internal network tier
  - Accessible only from application tier via Railway-managed network
  - Not directly accessible from internet
  - Encrypted connections between application and database
- **Network Boundaries:** Railway manages network boundaries and access controls between tiers
- **Logical Separation:** Application and database are logically separated in different network segments

**Evidence:** Railway platform network architecture, logical separation of application and database services. See Inherited Controls documentation for detailed reliance statement.

---

## 6. Data Handling

### 6.1 FCI Data Types

**FCI Stored in System:**
- Non-public contract opportunity data received, generated, or stored internally
- Internal analysis, annotations, and derived data related to contract opportunities
- User-generated content that combines public data with internal, non-public information

**Note:** Publicly available data from SAM.gov and USAspending.gov is not FCI by itself. FCI exists only when such data is combined with internal, non-public information.

### 6.2 CUI Data Types

**CUI Stored in System:**
- Controlled Unclassified Information (CUI) as defined by 32 CFR Part 2002 and the CUI Registry
- Contract proposals, Statements of Work (SOWs), and contract documentation containing CUI
- CUI files stored in separate StoredCUIFile table with password protection
- CUI handled according to established CUI handling procedures

**CUI Handling:**
- CUI files stored separately from FCI files
- CUI files require password protection for access (password: "cui" - temporary)
- CUI keyword detection for auto-classification
- User acknowledgment required for CUI handling (`MAC-FRM-203_User_Access_and_FCI_Handling_Acknowledgement.md`)
- Procedural controls and training

**Prohibited Data Types:**
- Classified information
- PII beyond publicly available FCI (unless part of CUI)
- Any data not directly related to federal contract opportunity management

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
- Version 2.0 (2026-01-23): **MAJOR UPGRADE - CMMC Level 1 to Level 2**
  - Upgraded from CMMC Level 1 to Level 2
  - Added CUI scope and data handling
  - Updated system boundary to include CUI
  - Preserved all Level 1 FCI statements
- Version 1.0 (2026-01-21): Initial document creation for CMMC Level 1

---

## Appendix A: Related Documents

- Evidence Index (`../05-evidence/MAC-RPT-100_Evidence_Index.md`)
- Inherited Controls Matrix (`../03-control-responsibility/MAC-RPT-102_Inherited_Controls_Matrix.md`)
- Internal Audit Checklist (`../04-self-assessment/MAC-AUD-103_Internal_Audit_Checklist.md`)
- FCI Scope and Data Boundary Statement (`MAC-SEC-302_FCI_Scope_and_Data_Boundary_Statement.md`)

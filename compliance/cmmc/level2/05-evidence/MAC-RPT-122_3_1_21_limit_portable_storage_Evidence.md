# Limit Portable Storage Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.1.21

**Control ID:** 3.1.21  
**Requirement:** Limit use of portable storage devices on external systems

---

## 1. Purpose

This document provides evidence of the implementation of controls to limit the use of portable storage devices on external systems for storing or accessing CUI, demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.1.21.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**Implementation Approach:**
- Cloud-based architecture prevents portable storage use
- All FCI and CUI stored in cloud database
- Browser-based access only (no direct file system access)
- Policy and procedural controls
- User agreements prohibit portable storage use

---

## 3. System Architecture Controls

### 3.1 Cloud-Based Storage

**Database Storage:**
- All FCI stored in PostgreSQL database (Railway platform)
- All CUI stored exclusively in CUI vault on Google Cloud Platform (FIPS-validated)
- Database location: Railway cloud platform
- No local file storage of FCI or CUI
- No portable storage device access to FCI or CUI

**Code References:**
- `prisma/schema.prisma` - Database schema
- FCI models: `GovernmentContractDiscovery`, `UsaSpendingAward`, `OpportunityAwardLink`
- CUI models: `StoredCUIFile` table
- All data stored in database, not on portable storage

**Evidence:**
- `prisma/schema.prisma` - Database schema shows all FCI/CUI in database
- No file system storage of FCI/CUI
- Cloud-based architecture prevents portable storage use

---

### 3.2 Browser-Based Access

**Access Method:**
- System accessed exclusively via web browser
- HTTPS/TLS encryption for all communications
- No direct file system access to CUI data
- No local file storage of CUI

**Code References:**
- Application architecture: Next.js web application
- Access method: Browser-based only
- No file system APIs exposed to users

**Evidence:**
- Application is web-based (Next.js)
- No direct file system access
- Browser-only access method

---

### 3.3 File Storage Implementation

**FCI Files:**
- Location: PostgreSQL database `StoredFile` table (BYTEA column)
- Storage Type: Database binary storage
- Access: Signed URLs with expiration
- No portable storage access

**CUI Files:**
- Location: PostgreSQL database `StoredCUIFile` table (BYTEA column)
- Storage Type: Database binary storage (separate from FCI files)
- Access: Password-protected access via `/api/files/cui/[id]` endpoint
- No portable storage access

**Code References:**
- `lib/file-storage.ts` - File storage functions (storeFile, storeCUIFile)
- `prisma/schema.prisma` - StoredFile and StoredCUIFile models
- Files stored in database, not on portable storage

**Evidence:**
- `lib/file-storage.ts` - File storage implementation
- `prisma/schema.prisma` - File storage models
- All files stored in database

---

### 3.4 Export Functions

**CSV Exports:**
- Export functions generate temporary files
- Exports require authentication and authorization
- Exports generated on-demand (not stored locally)
- No automatic file downloads of FCI/CUI data

**Code References:**
- `/api/admin/events/export` - Audit log export
- `/api/admin/physical-access-logs/export` - Physical access log export
- Export functions generate temporary files

**Evidence:**
- Export API endpoints exist
- Exports are temporary, not stored locally
- No persistent local storage of FCI/CUI

---

## 4. Policy and Procedural Controls

### 4.1 Media Handling Policy

**Document:** `../02-policies-and-procedures/MAC-POL-213_Media_Handling_Policy.md`

**Portable Storage Restrictions:**
- No portable storage devices (USB drives, external hard drives, SD cards) may be used to store FCI/CUI
- System does not support direct file transfers to portable storage
- Export functions generate temporary files that must be handled securely
- Users must not copy FCI/CUI data to portable storage devices

**Code References:**
- Policy document exists
- Policy prohibits portable storage use

**Evidence:**
- Media Handling Policy document exists
- Policy documents portable storage restrictions

---

### 4.2 User Agreements

**User Access and FCI/CUI Handling Acknowledgement:**
- All users must complete acknowledgment before system access
- Acknowledgment prohibits use of portable storage for FCI/CUI
- Users acknowledge they will not download FCI/CUI to portable storage devices

**Code References:**
- `app/auth/security-acknowledgment/page.tsx` - Security acknowledgment page
- User agreements: `../02-policies-and-procedures/user-agreements/`

**Evidence:**
- Security acknowledgment page exists
- User agreements document portable storage restrictions

---

### 4.3 Portable Storage Controls Evidence

**Document:** `MAC-RPT-118_Portable_Storage_Controls_Evidence.md`

**Purpose:** Comprehensive evidence document for portable storage controls.

**Evidence:**
- Portable Storage Controls Evidence document exists
- Document provides detailed evidence of controls

---

## 5. Technical Controls

### 5.1 Application Layer Controls

**No File System Access:**
- Application does not provide direct file system access
- All data access is through authenticated web interface
- Export functions generate temporary files (not stored locally)
- Database access restricted to application layer
- No local caching of sensitive data

**Code References:**
- Application architecture: Next.js web application
- No file system APIs exposed
- All access through web interface

**Evidence:**
- Application is web-based
- No file system access provided
- All access through authenticated interface

---

### 5.2 Database Access Controls

**Database Access:**
- Database access restricted to application layer
- No direct database access for users
- All database operations through Prisma ORM
- Access controlled via authentication and authorization

**Code References:**
- `lib/prisma.ts` - Prisma client configuration
- Database access through application layer only
- No direct database access

**Evidence:**
- Database access through application layer
- No direct database access for users

---

## 6. Related Documents

- Portable Storage Controls Evidence: `MAC-RPT-118_Portable_Storage_Controls_Evidence.md`
- Media Handling Policy: `../02-policies-and-procedures/MAC-POL-213_Media_Handling_Policy.md`
- System Description and Architecture: `../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md`
- User Access and FCI Handling Acknowledgement: `../02-policies-and-procedures/MAC-FRM-203_User_Access_and_FCI_Handling_Acknowledgement.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.1, 3.1.21)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 7. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate codebase evidence - Cloud-based architecture, database storage (prisma/schema.prisma), file storage implementation (lib/file-storage.ts), browser-based access, export functions, policy controls, user agreements, technical controls, and code references
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---

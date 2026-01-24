# Portable Storage Controls Evidence - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-23  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.1.21

**Control:** 3.1.21 - Limit use of portable storage devices on external systems

---

## 1. Purpose

This document provides evidence of the implementation of controls to limit the use of portable storage devices on external systems for storing or accessing CUI.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**Policy:** `../02-policies-and-procedures/MAC-POL-213_Media_Handling_Policy.md`

---

## 3. System Architecture

### 3.1 Cloud-Based Architecture

**Storage Architecture:**
- All CUI stored in cloud-based PostgreSQL database
- No local file storage of CUI
- No portable storage device access to CUI
- System accessed via web browser only

**Database Storage:**
- Location: Railway cloud platform (PostgreSQL)
- Access: Application layer only (no direct database access)
- Encryption: Database encryption at rest (inherited from Railway)
- Backup: Railway platform managed backups

**Evidence:**
- Database schema: `prisma/schema.prisma`
- CUI models: `GovernmentContractDiscovery`, `UsaSpendingAward`, `OpportunityAwardLink`
- All CUI stored in database, not on portable storage

---

### 3.2 Browser-Based Access

**Access Method:**
- System accessed exclusively via web browser
- HTTPS/TLS encryption for all communications
- No direct file system access to CUI data
- No local file storage of CUI

**Browser Restrictions:**
- No automatic file downloads of CUI data
- Export functions require authentication and authorization
- CSV exports generated on-demand (temporary files)
- No persistent local storage of CUI

**Evidence:**
- Application architecture: Next.js web application
- Access method: Browser-based only
- No file system access to CUI data

---

## 4. Technical Controls

### 4.1 Application Layer Controls

**File System Access:**
- Application does not provide direct file system access
- All data access through authenticated web interface
- Database access restricted to application layer
- No local caching of sensitive CUI data

**Export Functions:**
- Export functions require authentication: `/api/admin/events/export`
- Export functions require authorization (ADMIN role)
- CSV exports generated on-demand
- Temporary files generated (not stored locally)
- Export events logged in audit system

**Code Evidence:**
- Export API routes: `app/api/admin/events/export/route.ts`
- Export API routes: `app/api/admin/physical-access-logs/export/route.ts`
- Authentication required: Middleware enforces authentication
- Authorization required: ADMIN role required for exports

---

### 4.2 Database Access Controls

**Database Access:**
- Database access restricted to application layer
- No direct database access for users
- Prisma ORM provides database abstraction
- Connection strings secured via environment variables

**Access Control:**
- Application authentication required
- Role-based access control (RBAC)
- Database credentials not exposed to users
- Connection encryption (TLS)

**Evidence:**
- Database access: `lib/prisma.ts`
- ORM: Prisma ORM
- Environment variables: Database connection strings secured

---

## 5. Procedural Controls

### 5.1 User Agreements

**User Acknowledgment:**
- All users must complete User Access and FCI Handling Acknowledgement
- Acknowledgment explicitly prohibits upload of CUI
- Acknowledgment prohibits use of portable storage for CUI
- Users acknowledge understanding of portable storage restrictions

**Evidence:**
- User Agreement: `../02-policies-and-procedures/MAC-FRM-203_User_Access_and_FCI_Handling_Acknowledgement.md`
- User agreements stored: `../02-policies-and-procedures/user-agreements/`
- Acknowledgment required before system access

---

### 5.2 Organizational Policies

**Portable Storage Restrictions:**
- Policy prohibits use of portable storage devices for CUI
- Policy requires secure handling of exported data
- Policy requires workstations to restrict portable storage (organizational)
- Policy documented in Media Handling Policy

**Evidence:**
- Media Handling Policy: `../02-policies-and-procedures/MAC-POL-213_Media_Handling_Policy.md`
- Policy section: Section 3.1 (Removable Media and Portable Storage)

---

## 6. Export Function Controls

### 6.1 Audit Log Exports

**Export Function:**
- Location: `/api/admin/events/export`
- Authentication: Required (NextAuth.js)
- Authorization: ADMIN role required
- Format: CSV file
- Generation: On-demand (temporary file)

**Controls:**
- Export requires authentication
- Export requires ADMIN role
- Export events logged in audit system
- Temporary file generated (not stored locally)
- User must download file (browser download)

**Evidence:**
- Export route: `app/api/admin/events/export/route.ts`
- Authentication: Middleware enforces authentication
- Authorization: ADMIN role check in route handler

---

### 6.2 Physical Access Log Exports

**Export Function:**
- Location: `/api/admin/physical-access-logs/export`
- Authentication: Required (NextAuth.js)
- Authorization: ADMIN role required
- Format: CSV file
- Generation: On-demand (temporary file)

**Controls:**
- Export requires authentication
- Export requires ADMIN role
- Export events logged in audit system
- Temporary file generated (not stored locally)
- User must download file (browser download)

**Evidence:**
- Export route: `app/api/admin/physical-access-logs/export/route.ts`
- Authentication: Middleware enforces authentication
- Authorization: ADMIN role check in route handler

---

## 7. Browser-Based Restrictions

### 7.1 No Automatic Downloads

**Implementation:**
- System does not automatically download CUI data
- No background file transfers
- No persistent local storage of CUI
- All data access through authenticated web interface

**Browser Security:**
- HTTPS/TLS encryption for all communications
- Secure cookies for session management
- No local storage of sensitive data
- Session-based access only

---

### 7.2 Export Handling

**Export Process:**
1. User requests export (authenticated, authorized)
2. System generates CSV file on-demand
3. Temporary file created (not stored locally)
4. File sent to browser as download
5. User downloads file to local system
6. Temporary file deleted from server

**User Responsibility:**
- User must handle downloaded files securely
- User must not copy files to portable storage
- User must delete files after use (organizational policy)
- User must protect downloaded files

---

## 8. Workstation Controls

### 8.1 Organizational Policy

**Workstation Requirements:**
- Workstations accessing system should have portable storage restricted
- USB ports may be disabled or restricted (organizational policy)
- External storage devices may be blocked (organizational policy)
- Device control policies enforced (organizational)

**Note:** Workstation-level controls are organizational policy, not system-level controls. System provides application-level controls to limit portable storage use.

---

## 9. Compliance Verification

### 9.1 System Architecture Verification

**Verification:**
- ✅ All CUI stored in cloud database (no local storage)
- ✅ System accessed via browser only (no direct file system access)
- ✅ Export functions require authentication and authorization
- ✅ No automatic file downloads of CUI
- ✅ No persistent local storage of CUI

---

### 9.2 Procedural Verification

**Verification:**
- ✅ User agreements prohibit portable storage use
- ✅ Policy documents portable storage restrictions
- ✅ Export functions documented with controls
- ✅ User responsibilities documented

---

## 10. Related Documents

- Media Handling Policy: `../02-policies-and-procedures/MAC-POL-213_Media_Handling_Policy.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.1, 3.1.21)
- User Access and FCI Handling Acknowledgement: `../02-policies-and-procedures/MAC-FRM-203_User_Access_and_FCI_Handling_Acknowledgement.md`

---

## 11. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-23

**Change History:**
- Version 1.0 (2026-01-23): Initial evidence document creation

---

## Appendix: Code Evidence

**Export Functions:**
- Audit log export: `app/api/admin/events/export/route.ts`
- Physical access log export: `app/api/admin/physical-access-logs/export/route.ts`

**Database Access:**
- Prisma client: `lib/prisma.ts`
- Database schema: `prisma/schema.prisma`

**Authentication/Authorization:**
- Middleware: `middleware.ts`
- Auth library: `lib/auth.ts`

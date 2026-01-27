# CUI Data Flow Diagram - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Sections 3.1.3, 3.8.2, 3.13.11

**Applies to:** CMMC 2.0 Level 2 (CUI system)

---

## Purpose

This document provides the authoritative CUI data flow diagram for the MacTech Solutions Application, showing all points where CUI enters, is stored, processed, transmitted, and destroyed within the system. This diagram is referenced in the System Security Plan (Section 3.2) and maps to specific security controls.

---

## CUI Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CUI DATA FLOW - CMMC LEVEL 2                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   USER      │
│  (Browser)  │
└──────┬───────┘
       │ HTTPS/TLS (Encrypted)
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        INGRESS POINT                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ POST /api/files/upload                                               │  │
│  │ - Authentication required (NextAuth.js)                              │  │
│  │ - MFA required for all users (CMMC Level 2)                          │  │
│  │ - File upload with CUI flag or auto-detection                        │  │
│  │ - CUI keyword detection (lib/cui-blocker.ts)                          │  │
│  │ - File classification: CUI vs FCI                                    │  │
│  │ Control: 3.1.3 (Control CUI flow)                                   │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        STORAGE POINT                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ Primary: CUI Vault (Google Compute Engine)                          │  │
│  │ - Domain: vault.mactechsolutionsllc.com                              │  │
│  │ - PostgreSQL database (localhost only)                                │  │
│  │ - AES-256-GCM encrypted CUI records (ciphertext, nonce, tag)         │  │
│  │ - API key authentication                                              │  │
│  │ - TLS 1.3 encryption (AES-256-GCM-SHA384)                            │  │
│  │ - Google Cloud disk encryption at rest                                │  │
│  │ Control: 3.8.2 (Limit access to CUI on system media)                  │  │
│  │ Control: 3.13.11 (FIPS-validated cryptography for CUI)               │  │
│  │ Control: 3.13.16 (Protect CUI at rest)                                │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ Secondary: PostgreSQL Database (Railway)                            │  │
│  │ - Table: StoredCUIFile                                               │  │
│  │ - Encryption at rest (Railway platform)                              │  │
│  │ - Separate from FCI files (StoredFile table)                         │  │
│  │ - Password protection mechanism                                       │  │
│  │ - Access control: Admin role or file owner only                      │  │
│  │ Control: 3.8.2 (Limit access to CUI on system media)                 │  │
│  │ Control: 3.13.11 (FIPS-validated cryptography for CUI)              │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PROCESSING POINT                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ Application Logic                                                    │  │
│  │ - CUI file access control (lib/file-storage.ts)                     │  │
│  │ - Password verification for CUI access                                │  │
│  │ - Role-based authorization checks                                    │  │
│  │ - CUI access logging (audit system)                                  │  │
│  │ - CUI keyword monitoring and detection                               │  │
│  │ Control: 3.1.3 (Control CUI flow)                                   │  │
│  │ Control: 3.8.2 (Limit access to CUI on system media)               │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
       │
       ├─────────────────────────────────────┐
       │                                     │
       ▼                                     ▼
┌─────────────────────────────┐   ┌─────────────────────────────────────────┐
│      EGRESS POINT           │   │      ADMIN EXPORT EGRESS                │
│  ┌───────────────────────┐ │   │  ┌───────────────────────────────────┐  │
│  │ GET /api/files/cui/[id]│ │   │  │ Admin-only CUI exports           │  │
│  │ - Authentication req'd │ │   │  │ - CSV exports with CUI markings │  │
│  │ - MFA required         │ │   │  │ - Reports containing CUI        │  │
│  │ - Password verification│ │   │  │ - CUI-marked documents          │  │
│  │ - Role-based access    │ │   │  │ Control: 3.1.3 (Control CUI)    │  │
│  │ - Access logged        │ │   │  └───────────────────────────────────┘  │
│  │ Control: 3.1.3         │ │   └─────────────────────────────────────────┘
│  └───────────────────────┘ │
└─────────────────────────────┘
       │
       │ HTTPS/TLS (Encrypted)
       ▼
┌──────────────┐
│   USER      │
│  (Browser)  │
└──────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        DESTRUCTION POINT                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ Secure Deletion                                                      │  │
│  │ - Database record deletion via Prisma ORM                            │  │
│  │ - Permanent removal from StoredCUIFile table                         │  │
│  │ - No recovery of deleted records (unless backups exist)             │  │
│  │ - Secure deletion procedures documented                             │  │
│  │ Control: 3.8.2 (Limit access to CUI on system media)                 │  │
│  │ Control: Media Handling Policy (MAC-POL-213)                        │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Points and Security Controls

### 1. Ingress Point

**Location:** `/api/files/upload` endpoint  
**Function:** CUI file upload and classification

**Security Controls:**
- **3.1.3 (Control CUI flow):** CUI files are identified and routed to separate storage
- **3.5.3 (MFA):** All users must authenticate with MFA before uploading CUI
- **3.5.1 (Identify users):** Authentication required via NextAuth.js
- **3.3.1 (Audit logging):** All CUI uploads logged to audit system

**Implementation:**
- File upload API: `app/api/files/upload/route.ts`
- CUI detection: `lib/cui-blocker.ts` (`detectCUIKeywords`)
- Authentication: `lib/authz.ts` (`requireAuth`)
- Storage routing: `lib/file-storage.ts` (`storeCUIFile`)

---

### 2. Storage Point

**Primary Location:** CUI Vault (Google Cloud Platform) - vault.mactechsolutionsllc.com  
**Metadata Location:** PostgreSQL `StoredCUIFile` table (Railway platform) - for file metadata, access control, and backward compatibility with legacy files  
**Function:** CUI file storage with encryption at rest

**CUI Vault Storage:**
- Dedicated CUI storage infrastructure on Google Compute Engine
- PostgreSQL database on localhost only (127.0.0.1:5432)
- AES-256-GCM encryption for CUI records (ciphertext, nonce, tag fields)
- API key authentication for access
- TLS 1.3 encryption for data in transit (AES-256-GCM-SHA384)
- Google Cloud Platform disk encryption at rest

**Metadata Storage (Railway Platform):**
- Database table: `prisma/schema.prisma` (StoredCUIFile model)
- Storage function: `lib/file-storage.ts` (`storeCUIFile`)
- Purpose: Stores file metadata, access control data, and provides backward compatibility for legacy files
- New CUI files are stored in CUI vault; this table stores metadata and legacy files only
- Encryption: Railway PostgreSQL encryption at rest (inherited control)

**Security Controls:**
- **3.8.2 (Limit access to CUI on system media):** CUI stored separately from FCI, access-controlled (both CUI vault and application database)
- **3.13.11 (FIPS-validated cryptography):** Database encryption at rest (Railway platform and Google Cloud Platform), TLS 1.3 with FIPS-compliant cipher suite
- **3.13.16 (Protect CUI at rest):** Multi-layer encryption (application-level AES-256-GCM + infrastructure-level disk encryption)
- **3.5.1 (Identify users):** Access requires authenticated user and API key (CUI vault)
- **3.1.3 (Control CUI flow):** CUI segregated in dedicated infrastructure and dedicated table

**Evidence:**
- CUI vault deployment: `../05-evidence/MAC-RPT-125_CUI_Vault_Deployment_Evidence.md`
- CUI vault database encryption: `../05-evidence/MAC-RPT-127_CUI_Vault_Database_Encryption_Evidence.md`
- CUI vault TLS configuration: `../05-evidence/MAC-RPT-126_CUI_Vault_TLS_Configuration_Evidence.md`

---

### 3. Processing Point

**Location:** Application logic layer  
**Function:** CUI access control, authorization, and monitoring

**Security Controls:**
- **3.1.3 (Control CUI flow):** CUI access controlled via password verification and role-based access
- **3.8.2 (Limit access to CUI on system media):** Only authorized users (admin or file owner) can access CUI
- **3.3.1 (Audit logging):** All CUI access attempts logged
- **3.5.3 (MFA):** MFA required for all CUI system access

**Implementation:**
- Access control: `lib/file-storage.ts` (`getCUIFile`)
- Password verification: `lib/file-storage.ts` (`verifyCUIPassword`)
- Authorization: `lib/authz.ts` (role-based checks)
- Audit logging: `lib/audit.ts` (CUI access events)

---

### 4. Egress Point

**Location:** `/api/files/cui/[id]` endpoint and admin export functions  
**Function:** Authorized CUI file download and export

**Security Controls:**
- **3.1.3 (Control CUI flow):** CUI egress controlled via authentication, authorization, and password verification
- **3.5.3 (MFA):** MFA required for all users accessing CUI
- **3.8.2 (Limit access to CUI on system media):** Only authorized users can download CUI
- **3.3.1 (Audit logging):** All CUI downloads logged
- **3.13.11 (FIPS-validated cryptography):** CUI transmission encrypted via HTTPS/TLS

**Implementation:**
- Download API: `app/api/files/cui/[id]/route.ts`
- Export functions: Admin-only export capabilities
- Encryption in transit: HTTPS/TLS (Railway platform, inherited control)
- Access logging: `lib/audit.ts` (CUI file access events)

---

### 5. Destruction Point

**Location:** Database deletion operations  
**Function:** Secure deletion of CUI files

**Security Controls:**
- **3.8.2 (Limit access to CUI on system media):** CUI deletion requires authorization
- **Media Handling Policy:** Secure deletion procedures documented in MAC-POL-213
- **3.3.1 (Audit logging):** CUI deletion events logged

**Implementation:**
- Deletion: Prisma ORM delete operations
- Database: Permanent removal from `StoredCUIFile` table
- Procedures: Documented in `MAC-POL-213_Media_Handling_Policy.md`

---

## Control Mapping Summary

| Control ID | Control Name | Flow Point(s) | Implementation |
|------------|--------------|---------------|----------------|
| 3.1.3 | Control CUI flow | Ingress, Processing, Egress | CUI routing, access control, password protection |
| 3.8.2 | Limit access to CUI on system media | Storage, Processing, Egress, Destruction | Separate table, role-based access, secure deletion |
| 3.13.11 | FIPS-validated cryptography | Storage, Egress | Database encryption at rest, HTTPS/TLS in transit |
| 3.5.3 | Multifactor authentication | Ingress, Processing, Egress | MFA required for all users |
| 3.5.1 | Identify users | All points | NextAuth.js authentication |
| 3.3.1 | Audit logging | All points | Comprehensive audit logging |

---

## Related Documents

- System Security Plan: `MAC-IT-304_System_Security_Plan.md` (Section 3.2)
- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`
- Media Handling Policy: `../02-policies-and-procedures/MAC-POL-213_Media_Handling_Policy.md`
- CUI Blocking Technical Controls Evidence: `../05-evidence/MAC-RPT-101_CUI_Blocking_Technical_Controls_Evidence.md`
- FIPS Cryptography Assessment: `../05-evidence/MAC-RPT-110_FIPS_Cryptography_Assessment_Evidence.md`

---

## Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-02-24

**Change History:**
- Version 1.0 (2026-01-24): Initial CUI data flow diagram for CMMC Level 2 assessment

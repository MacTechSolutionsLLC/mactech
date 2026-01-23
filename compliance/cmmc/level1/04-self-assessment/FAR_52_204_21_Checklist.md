# FAR 52.204-21 Basic Safeguarding Requirements Checklist

**Document Version:** 1.0  
**Date:** 2026-01-22  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 1 (Foundational)  
**Reference:** FAR 52.204-21

**Applies to:** CMMC 2.0 Level 1 (FCI-only system)

---

## Purpose

This document maps all 15 basic safeguarding requirements in FAR 52.204-21 to CMMC Level 1 practices and provides a confirmation checklist for assessor review.

**Note:** CMMC Level 1 includes 17 practices aligned to FAR 52.204-21 (which contains 15 basic safeguarding requirements). Some FAR requirements map to multiple CMMC practices.

---

## FAR 52.204-21 Requirements Checklist

### 1. Limit information system access to authorized users, processes acting on behalf of authorized users, or devices

**FAR Reference:** 52.204-21(b)(1)(i)  
**CMMC Practice:** AC.L1-3.1.1  
**Status:** ✅ Implemented

**Implementation:**
- NextAuth.js authentication required for all access
- Middleware enforces authentication on protected routes
- User accounts with unique identifiers

**Evidence:**
- `middleware.ts` (lines 19-26)
- `lib/auth.ts`
- `prisma/schema.prisma` (User model)
- AppEvent table (login events)
- Admin UI: `/admin/users`

---

### 2. Limit information system access to the types of transactions and functions that authorized users are permitted to execute

**FAR Reference:** 52.204-21(b)(1)(ii)  
**CMMC Practice:** AC.L1-3.1.2  
**Status:** ✅ Implemented

**Implementation:**
- Role-based access control (RBAC) with USER and ADMIN roles
- Admin routes require ADMIN role
- Middleware enforces role-based access

**Evidence:**
- `middleware.ts` (line 29)
- `lib/authz.ts` (requireAdmin)
- User.role field
- Browser test: USER role cannot access `/admin`

---

### 3. Verify and control/limit connections to and use of external information systems

**FAR Reference:** 52.204-21(b)(1)(iii)  
**CMMC Practice:** AC.L1-3.1.3  
**Status:** ✅ Inherited

**Implementation:**
- HTTPS/TLS enforced (Railway platform)
- All external connections encrypted
- Network security capabilities (Railway platform - inherited)

**Evidence:**
- Railway platform (inherited)
- Browser test: HTTPS lock icon
- Network request inspection
- Inherited Controls Statement: `03-control-responsibility/MAC-SEC-310_Inherited_Control_Statement_Railway.md`

---

### 4. Control information posted or processed on publicly accessible information systems

**FAR Reference:** 52.204-21(b)(1)(iv)  
**CMMC Practice:** AC.L1-3.1.4  
**Status:** ✅ Implemented

**Implementation:**
- No FCI posted to public systems
- FCI stored in protected database
- Public content approval workflow

**Evidence:**
- `middleware.ts` (lines 19-40)
- PublicContent model
- Database schema
- FCI Scope Statement: `01-system-scope/MAC-SEC-302_FCI_Scope_and_Data_Boundary_Statement.md`

---

### 5. Identify information system users, processes acting on behalf of users, or devices

**FAR Reference:** 52.204-21(b)(1)(v)  
**CMMC Practice:** IA.L1-3.5.1  
**Status:** ✅ Implemented

**Implementation:**
- Unique email addresses, user IDs (CUID)
- User accounts stored with unique constraints
- System identifier: CUID (cryptographically unique identifier)

**Evidence:**
- `prisma/schema.prisma` (User model, email unique)
- Database: User table
- Admin UI: `/admin/users`

---

### 6. Authenticate (or verify) the identities of those users, processes, or devices before allowing access

**FAR Reference:** 52.204-21(b)(1)(vi)  
**CMMC Practice:** IA.L1-3.5.2  
**Status:** ✅ Implemented

**Implementation:**
- NextAuth.js with credentials provider
- Password authentication with bcrypt (12 rounds)
- Session tokens
- Session expiration (8 hours)

**Evidence:**
- `lib/auth.ts` (lines 18-56)
- AppEvent table (login, login_failed)
- Browser test: Login with invalid credentials
- Password policy: `lib/password-policy.ts`

---

### 7. Sanitize or destroy information system media containing Federal Contract Information before disposal or release for reuse

**FAR Reference:** 52.204-21(b)(2)  
**CMMC Practice:** MP.L1-3.8.3  
**Status:** ✅ Implemented

**Implementation:**
- No removable media used
- All FCI stored in cloud database
- Database record deletion via Prisma
- Secure deletion procedures

**Evidence:**
- `prisma/schema.prisma` (FCI models)
- StoredFile model (database storage)
- Database delete operations
- Media Handling Policy: `02-policies-and-procedures/MAC-POL-213_Media_Handling_Policy.md`

---

### 8. Limit physical access to organizational information systems, equipment, and the respective operating environments to authorized individuals

**FAR Reference:** 52.204-21(b)(1)(vii)  
**CMMC Practice:** PE.L1-3.10.1  
**Status:** ✅ Implemented / Inherited

**Implementation:**
- Office facilities: Physical access restricted
- Cloud infrastructure: Railway physical security (inherited)
- Devices: Password-protected, screen locks
- Physical access is limited to authorized users and enforced through environmental controls

**Evidence:**
- Physical Security Policy: `02-policies-and-procedures/MAC-POL-212_Physical_Security_Policy.md`
- Railway platform (inherited)
- Organizational procedures

---

### 9. Escort visitors and monitor visitor activity

**FAR Reference:** 52.204-21(b)(1)(viii)  
**CMMC Practice:** PE.L1-3.10.2  
**Status:** ✅ Implemented

**Implementation:**
- Physical access is limited to authorized users
- Visitors are not provided system access credentials
- Physical access enforced through environmental controls appropriate to the operating environment

**Evidence:**
- Physical Security Policy: `02-policies-and-procedures/MAC-POL-212_Physical_Security_Policy.md`
- Organizational procedures

---

### 10. Maintain audit logs of physical access

**FAR Reference:** 52.204-21(b)(1)(ix)  
**CMMC Practice:** PE.L1-3.10.4  
**Status:** ✅ Implemented

**Implementation:**
- Physical access logging module implemented
- Digital logbook in admin portal
- Immutable entries with CSV export
- Minimum 90-day retention

**Evidence:**
- `app/admin/physical-access-logs/page.tsx`
- `app/api/admin/physical-access-logs/route.ts`
- Database: `PhysicalAccessLog` table
- CSV export: `/api/admin/physical-access-logs/export`

---

### 11. Implement subnetworks for publicly accessible system components that are physically or logically separated from internal networks

**FAR Reference:** 52.204-21(b)(1)(xi)  
**CMMC Practice:** SC.L1-3.13.2  
**Status:** ✅ Inherited

**Implementation:**
- Railway platform provides network infrastructure with logical network segmentation
- Public-facing application tier (Next.js) is logically separated from internal database tier (PostgreSQL)
- Network boundaries and segmentation provided by Railway cloud platform
- Application and database services operate in separate network tiers with controlled access

**Evidence:**
- Railway platform network architecture (inherited)
- Logical separation: Application tier (public-facing) and Database tier (internal)
- Network boundary documentation: `01-system-scope/MAC-IT-301_System_Description_and_Architecture.md`
- Inherited Controls Statement: `03-control-responsibility/MAC-SEC-310_Inherited_Control_Statement_Railway.md`

---

### 12. Control and manage the use of administrative privileges

**FAR Reference:** 52.204-21(b)(1)(x)  
**CMMC Practice:** AC.L1-3.1.5  
**Status:** ✅ Implemented

**Implementation:**
- Admin role required for admin functions
- Admin re-authentication for sensitive actions
- Admin action logging

**Evidence:**
- `lib/admin-reauth.ts`
- `app/api/admin/reauth/route.ts`
- AppEvent table (admin_action events)
- Browser test: Admin re-auth required

---

### 13. Use encryption for Federal Contract Information in transit

**FAR Reference:** 52.204-21(b)(3)(i)  
**CMMC Practice:** SC.L1-3.13.1  
**Status:** ✅ Inherited

**Implementation:**
- HTTPS/TLS enforced (Railway platform)
- All communications encrypted
- TLS provided by Railway platform (inherited control)

**Evidence:**
- Railway platform (inherited)
- Browser test: HTTPS lock icon
- Middleware HTTPS redirect
- Inherited Controls Statement: `03-control-responsibility/MAC-SEC-310_Inherited_Control_Statement_Railway.md`

---

### 14. Use encryption for Federal Contract Information at rest

**FAR Reference:** 52.204-21(b)(3)(ii)  
**CMMC Practice:** SC.L1-3.13.5  
**Status:** ✅ Inherited

**Implementation:**
- Database encryption at rest (Railway PostgreSQL)
- Password hashing (bcrypt, 12 rounds)
- Database security capabilities (Railway - inherited)

**Evidence:**
- Railway platform (inherited)
- `lib/password-policy.ts` (bcryptRounds: 12)
- Database: User.password field
- Inherited Controls Statement: `03-control-responsibility/MAC-SEC-310_Inherited_Control_Statement_Railway.md`

---

### 15. Employ malicious code protection mechanisms at information system entry and exit points

**FAR Reference:** 52.204-21(b)(4)(i)  
**CMMC Practice:** SI.L1-3.14.1  
**Status:** ✅ Inherited / Implemented

**Implementation:**
- Railway platform malware protection (inherited)
- Endpoint inventory tracks AV status at designated locations
- Infrastructure-level malware protection (Railway - inherited)

**Evidence:**
- Railway platform (inherited)
- `app/admin/endpoint-inventory/page.tsx`
- Endpoint Protection document: `06-supporting-documents/MAC-SEC-101_Endpoint_Protection.md`

---

### 16. Identify, report, and correct information and information system flaws in a timely manner

**FAR Reference:** 52.204-21(b)(4)(ii)  
**CMMC Practice:** Practice 15 (Vulnerability Management)  
**Status:** ✅ Implemented

**Implementation:**
- Dependency management (npm audit)
- GitHub Dependabot (weekly scans)
- Vulnerability awareness and remediation
- Security contact defined

**Evidence:**
- `package.json`
- `.github/dependabot.yml`
- `SECURITY.md`
- GitHub Dependabot dashboard
- Vulnerability Management: `06-supporting-documents/MAC-SEC-106_Vulnerability_Management.md`

---

## Additional CMMC Practices (Beyond FAR 52.204-21)

### 16. Identify designated locations within organizational information systems for malicious code protection

**CMMC Practice:** SI.L1-3.14.2  
**Status:** ✅ Implemented

**Implementation:**
- Endpoint inventory module tracks all endpoints used to access/administer the system
- Tracks AV status, last verification date, and verification method

**Evidence:**
- `app/admin/endpoint-inventory/page.tsx`
- `app/api/admin/endpoint-inventory/route.ts`
- Database: `EndpointInventory` table
- CSV export: `/api/admin/endpoint-inventory/export`

---

### 17. Update malicious code protection mechanisms when new releases are available

**CMMC Practice:** SI.L1-3.14.3  
**Status:** ✅ Inherited

**Implementation:**
- Railway platform manages malware protection updates (inherited)

**Evidence:**
- Railway platform (inherited)
- Platform documentation

---

### 18. Perform periodic scans of the information system and real-time scans of files from external sources

**CMMC Practice:** SI.L1-3.14.4  
**Status:** ✅ Inherited

**Implementation:**
- Railway platform scanning (inherited)
- Real-time protection

**Evidence:**
- Railway platform (inherited)
- Platform documentation

---

### 19. Report incidents to designated personnel

**CMMC Practice:** IR.L1-3.6.2  
**Status:** ✅ Implemented

**Implementation:**
- Incident response policy and procedures
- Security contact defined
- Incident reporting quick card

**Evidence:**
- `MAC-POL-215_Incident_Response_Policy.md`
- `MAC-SEC-107_Incident_Response_Quick_Card.md`
- `SECURITY.md`
- Security contact: security@mactechsolutions.com

---

## Summary

**Total FAR 52.204-21 Requirements:** 15  
**Total CMMC Level 1 Practices:** 17  
**Requirements Implemented:** 12  
**Requirements Inherited:** 4 (TLS/HTTPS, Database Encryption, Malware Protection, Network Segmentation)  
**Requirements Not Implemented:** 0

**All 15 FAR 52.204-21 basic safeguarding requirements are either implemented or inherited. All 17 CMMC Level 1 practices are either implemented or inherited.**

---

## System Readiness Statement

**System is ready for CMMC 2.0 Level 1 assessment.**

All 17 CMMC Level 1 practices aligned to FAR 52.204-21 are implemented or inherited. Evidence is available and documented. The system handles FCI only and explicitly does not process, store, or transmit CUI.

---

## Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be completed]

**Change History:**
- Version 1.0 (2026-01-22): Initial document creation

---

## Appendix A: Related Documents

- Self-Assessment: `MAC-AUD-401_Internal_Cybersecurity_Self-Assessment.md`
- Practices Matrix: `MAC-AUD-402_CMMC_L1_Practices_Matrix.md`
- Executive Attestation: `../00-cover-memo/MAC-FRM-202_CMMC_Level_1_Executive_Attestation.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`

## Appendix B: FAR 52.204-21 Reference

- FAR 52.204-21: Basic Safeguarding of Covered Contractor Information Systems
- CMMC 2.0 Level 1 Assessment Guide

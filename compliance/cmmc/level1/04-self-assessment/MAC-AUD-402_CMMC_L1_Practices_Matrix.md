# CMMC Level 1 Practices Matrix

**Document Version:** 1.0  
**Date:** 2026-01-21  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 1 (Foundational)  
**Reference:** FAR 52.204-21

---

## Overview

This matrix maps all 17 CMMC Level 1 practices to implementation status, evidence locations, and responsible parties.

**Note:** CMMC Level 1 includes 17 practices aligned to FAR 52.204-21 (which contains 15 basic safeguarding requirements).

**System Scope:** This system is scoped to FCI only. CUI is prohibited and not intentionally processed or stored.

---

## Practices Matrix

| Practice ID | Requirement Summary | Implementation in Our System | Evidence | Responsible Party |
|-------------|---------------------|------------------------------|----------|-------------------|
| **AC.L1-3.1.1** | Limit information system access to authorized users, processes acting on behalf of authorized users, or devices | NextAuth.js authentication required for all access. Middleware enforces authentication on protected routes. | `middleware.ts` (lines 19-26)<br>`lib/auth.ts`<br>AppEvent table (login events)<br>Browser test: Attempt `/admin` without login | System Administrator |
| **AC.L1-3.1.2** | Limit information system access to the types of transactions and functions that authorized users are permitted to execute | Role-based access control (RBAC) with USER and ADMIN roles. Admin routes require ADMIN role. | `middleware.ts` (line 29)<br>`lib/authz.ts` (requireAdmin)<br>User.role field<br>Browser test: USER role cannot access `/admin` | System Administrator |
| **AC.L1-3.1.3** | Verify and control/limit connections to and use of external information systems | HTTPS/TLS enforced (Railway platform). All external connections encrypted. | Railway platform (inherited)<br>Browser test: HTTPS lock icon<br>Network request inspection | Railway Platform (inherited) |
| **AC.L1-3.1.4** | Control information posted or processed on publicly accessible information systems | No FCI posted to public systems. FCI stored in protected database. Public content approval workflow. | `middleware.ts` (lines 19-40)<br>PublicContent model<br>Database schema | System Administrator |
| **IA.L1-3.5.1** | Identify information system users, processes acting on behalf of users, or devices | Unique email addresses, user IDs (CUID). User accounts stored with unique constraints. | `prisma/schema.prisma` (User model, email unique)<br>Database: User table<br>Admin UI: `/admin/users` | System Administrator |
| **IA.L1-3.5.2** | Authenticate (or verify) the identities of those users, processes, or devices before allowing access | NextAuth.js with credentials provider. Password authentication with bcrypt. Session tokens. | `lib/auth.ts` (lines 18-56)<br>AppEvent table (login, login_failed)<br>Browser test: Login with invalid credentials | System Administrator |
| **MP.L1-3.8.3** | Sanitize or destroy information system media containing Federal Contract Information before disposal or release for reuse | No removable media used. All FCI stored in cloud database. Database record deletion via Prisma. | `prisma/schema.prisma` (FCI models)<br>StoredFile model (database storage)<br>Database delete operations | System Administrator |
| **PE.L1-3.10.1** | Limit physical access to organizational information systems, equipment, and the respective operating environments to authorized individuals | Office facilities: Physical access restricted. Cloud infrastructure: Railway physical security (inherited). Devices: Password-protected, screen locks. | Physical Security Policy<br>Railway platform (inherited)<br>Organizational procedures | Facilities Manager / Railway Platform |
| **PE.L1-3.10.2** | Escort visitors and monitor visitor activity | Visitors escorted and supervised. Visitor procedures documented. | Physical Security Policy<br>Organizational procedures | Facilities Manager |
| **PE.L1-3.10.4** | Maintain audit logs of physical access | Physical access logging module implemented. Digital logbook in admin portal. Immutable entries with CSV export. | `app/admin/physical-access-logs/page.tsx`<br>`app/api/admin/physical-access-logs/route.ts`<br>Database: `PhysicalAccessLog` table<br>CSV export: `/api/admin/physical-access-logs/export` | System Administrator |
| **AC.L1-3.1.5** | Control and manage the use of administrative privileges | Admin role required for admin functions. Admin re-authentication for sensitive actions. | `lib/admin-reauth.ts`<br>`app/api/admin/reauth/route.ts`<br>AppEvent table (admin_action events)<br>Browser test: Admin re-auth required | System Administrator |
| **SC.L1-3.13.1** | Use encryption for FCI in transit | HTTPS/TLS enforced (Railway platform). All communications encrypted. | Railway platform (inherited)<br>Browser test: HTTPS lock icon<br>Middleware HTTPS redirect | Railway Platform (inherited) |
| **SC.L1-3.13.5** | Use encryption for FCI at rest | Database encryption at rest (Railway PostgreSQL). Password hashing (bcrypt, 12 rounds). | Railway platform (inherited)<br>`lib/password-policy.ts` (bcryptRounds: 12)<br>Database: User.password field | Railway Platform (inherited) / System Administrator |
| **SC.L1-3.13.2** | Implement subnetworks for publicly accessible system components that are physically or logically separated from internal networks | Railway platform provides network infrastructure with logical network segmentation. Public-facing application tier (Next.js) operates in publicly accessible network segment. Internal database tier (PostgreSQL) operates in internal network segment with controlled access. | Railway platform (inherited)<br>`01-system-scope/MAC-IT-301_System_Description_and_Architecture.md` (Section 5.5)<br>`03-control-responsibility/MAC-SEC-310_Inherited_Control_Statement_Railway.md` (Section 3.6) | Railway Platform (inherited) |
| **SI.L1-3.14.1** | Employ malicious code protection mechanisms at information system entry and exit points | Railway platform malware protection (inherited). Endpoint inventory tracks AV status at designated locations. | Railway platform (inherited)<br>`app/admin/endpoint-inventory/page.tsx`<br>Endpoint Protection document | Railway Platform (inherited) / System Administrator |
| **SI.L1-3.14.2** | Identify designated locations within organizational information systems for malicious code protection | Endpoint inventory module tracks all endpoints used to access/administer the system. Tracks AV status, last verification date, and verification method. | `app/admin/endpoint-inventory/page.tsx`<br>`app/api/admin/endpoint-inventory/route.ts`<br>`app/api/admin/endpoint-inventory/export/route.ts`<br>Database: `EndpointInventory` table<br>CSV export: `/api/admin/endpoint-inventory/export` | System Administrator |
| **SI.L1-3.14.3** | Update malicious code protection mechanisms when new releases are available | Railway platform manages malware protection updates (inherited). | Railway platform (inherited)<br>Platform documentation | Railway Platform (inherited) |
| **SI.L1-3.14.4** | Perform periodic scans of the information system and real-time scans of files from external sources | Railway platform scanning (inherited). Real-time protection. | Railway platform (inherited)<br>Platform documentation | Railway Platform (inherited) |
| **Practice 15** | Identify, report, and correct information and information system flaws in a timely manner | Dependency management, npm audit, GitHub Dependabot (weekly). Vulnerability awareness and remediation. | `package.json`<br>`.github/dependabot.yml`<br>`SECURITY.md`<br>GitHub Dependabot dashboard | Development Team |
| **IR.L1-3.6.2** | Report incidents to designated personnel | Incident response policy and procedures. Security contact defined. Incident reporting quick card. | `MAC-POL-215_Incident_Response_Policy.md`<br>`MAC-SEC-107_Incident_Response_Quick_Card.md`<br>`SECURITY.md`<br>Security contact: security@mactechsolutions.com | Security Contact |

---

## Summary

Certain infrastructure-related practices are inherited from platform providers (Railway, GitHub); all organizational responsibilities are implemented internally. All 17 CMMC Level 1 practices are either implemented or inherited. No practices are not implemented.

---

## Evidence Generation

**Physical Access Logs:**
1. Navigate to `/admin/physical-access-logs`
2. Apply date range filter if needed
3. Click "Export CSV"
4. Evidence is generated on demand directly from the production system at the time of assessment

**Audit Log:**
1. Navigate to `/admin/events`
2. Apply filters if needed
3. Click "Export CSV"
4. Evidence is generated on demand directly from the production system at the time of assessment

**Endpoint Inventory:**
1. Navigate to `/admin/endpoint-inventory`
2. Click "Export CSV"
3. Evidence is generated on demand directly from the production system at the time of assessment

**Users List:**
1. Navigate to `/admin/users`
2. Use export functionality or run evidence generation script
3. Evidence is generated on demand directly from the production system at the time of assessment

**Note:** All exports include metadata headers (timestamp, system identifier, exporting admin username) and are immutable once generated.

---

## Related Documents

- Self-Assessment: `MAC-AUD-401_Internal_Cybersecurity_Self-Assessment.md`
- Evidence Index: `../05-evidence/MAC-RPT-100_Evidence_Index.md`
- Executive Attestation: `../00-cover-memo/MAC-FRM-202_CMMC_Level_1_Executive_Attestation.md`

---

**Document Status:** This document reflects the system state as of 2026-01-21 and is maintained under configuration control.

---

## Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be completed]

**Change History:**
- Version 1.0 (2026-01-21): Initial document creation
- Version 1.1 (2026-01-22): Corrected SI.L1-3.14.2 mapping to endpoint inventory (was incorrectly mapped to vulnerability management). Added endpoint inventory export route evidence. Practice 15 (vulnerability management) listed without CMMC practice ID as it doesn't map to SI.L1-3.14.5.

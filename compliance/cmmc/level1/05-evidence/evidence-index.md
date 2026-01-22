# Comprehensive Evidence Index

**Document Version:** 1.0  
**Date:** 2026-01-21  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 1 (Foundational)

---

## Purpose

This document provides a comprehensive index of all evidence objects for CMMC Level 1 compliance, including where to find them and how to generate them.

---

## Evidence Categories

### 1. Code Evidence

**Location:** Repository codebase

**Evidence Types:**
- Authentication implementation: `lib/auth.ts`
- Authorization implementation: `lib/authz.ts`
- Middleware protection: `middleware.ts`
- Security headers: `next.config.js`
- Password policy: `lib/password-policy.ts`
- Audit logging: `lib/audit.ts`
- Physical access logs: `app/admin/physical-access-logs/`
- Endpoint inventory: `app/admin/endpoint-inventory/`

**How to Access:**
- View in repository
- Code review
- Line number references in compliance documents

---

### 2. Database Evidence

**Location:** PostgreSQL database (Railway)

**Evidence Types:**
- User accounts: `User` table
- Audit events: `AppEvent` table
- Physical access logs: `PhysicalAccessLog` table
- Endpoint inventory: `EndpointInventory` table
- Stored files: `StoredFile` table

**How to Access:**
- Prisma Studio: `npm run db:studio`
- Database queries (see templates below)
- CSV exports via admin UI or script

**Sample Queries:**
```sql
-- Users
SELECT id, email, name, role, disabled, "lastLoginAt" FROM "User";

-- Recent login events
SELECT "timestamp", "actionType", "actorEmail", "ip", "success"
FROM "AppEvent"
WHERE "actionType" IN ('login', 'login_failed')
ORDER BY "timestamp" DESC LIMIT 50;

-- Physical access logs
SELECT * FROM "PhysicalAccessLog" ORDER BY "date" DESC;

-- Endpoint inventory
SELECT * FROM "EndpointInventory" ORDER BY "lastVerifiedDate" DESC;
```

---

### 3. Admin UI Evidence

**Location:** Application admin portal

**Evidence Types:**
- Physical access logs: `/admin/physical-access-logs`
- Endpoint inventory: `/admin/endpoint-inventory`
- Audit log: `/admin/events`
- User management: `/admin/users`

**How to Access:**
1. Login as ADMIN user
2. Navigate to admin portal
3. View, filter, and export evidence
4. Screenshot for documentation

**Export Methods:**
- CSV export buttons in each admin module
- Evidence generation script: `scripts/generate-evidence.ts`

---

### 4. Configuration Evidence

**Location:** Configuration files

**Evidence Types:**
- Security headers: `next.config.js`
- Dependabot config: `.github/dependabot.yml`
- Database schema: `prisma/schema.prisma`
- Migrations: `prisma/migrations/`

**How to Access:**
- View in repository
- Code review
- Configuration file inspection

---

### 5. Policy and Procedure Evidence

**Location:** `compliance/cmmc/level1/02-policies-and-procedures/`

**Evidence Types:**
- Access Control Policy: `MAC-POL-210_Access_Control_Policy.md`
- Identification & Authentication Policy: `MAC-POL-211_Identification_and_Authentication_Policy.md`
- Physical Security Policy: `MAC-POL-212_Physical_Security_Policy.md`
- Media Handling Policy: `MAC-POL-213_Media_Handling_Policy.md`
- System Integrity Policy: `MAC-POL-214_System_Integrity_Policy.md`
- Incident Response Policy: `MAC-POL-215_Incident_Response_Policy.md`
- Standard Operating Procedures: `MAC-SOP-*.md`

**How to Access:**
- View in repository
- Document review
- Policy compliance verification

---

### 6. Assessment Evidence

**Location:** `compliance/cmmc/level1/04-self-assessment/`

**Evidence Types:**
- Self-Assessment: `MAC-AUD-401_Internal_Cybersecurity_Self-Assessment.md`
- Practices Matrix: `MAC-AUD-402_CMMC_L1_Practices_Matrix.md`
- Internal Audit Checklist: `MAC-AUD-103_Internal_Audit_Checklist.md`

**How to Access:**
- View in repository
- Review assessment results
- Verify evidence pointers

---

### 7. System Documentation Evidence

**Location:** `compliance/cmmc/level1/01-system-scope/`

**Evidence Types:**
- System Security Plan: `MAC-IT-304_System_Security_Plan.md`
- System Boundary: `MAC-IT-105_System_Boundary.md`
- FCI Scope: `MAC-SEC-302_FCI_Scope_and_Data_Boundary_Statement.md`
- System Description: `MAC-IT-301_System_Description_and_Architecture.md`

**How to Access:**
- View in repository
- Document review
- System architecture verification

---

### 8. Inherited Controls Evidence

**Location:** `compliance/cmmc/level1/03-control-responsibility/` and `05-evidence/provider/`

**Evidence Types:**
- Inherited Controls Appendix: `MAC-RPT-312_Inherited_Controls_Appendix.md`
- Railway screenshots: `05-evidence/provider/railway/`
- GitHub screenshots: `05-evidence/provider/github/`

**How to Access:**
- View documentation
- Review screenshots
- Verify provider documentation references

---

### 9. CSV Export Evidence

**Location:** `compliance/cmmc/level1/05-evidence/sample-exports/`

**Evidence Types:**
- Users export: `users-export-sample.csv` (redacted)
- Physical access logs: `physical-access-logs-sample.csv` (redacted)
- Audit log: `audit-log-sample.csv` (redacted)
- Endpoint inventory: `endpoint-inventory-sample.csv` (redacted)

**Operational Evidence Exports:**
- Evidence is generated on demand directly from the production system at the time of assessment
- All personal data has been redacted for submission
- Live system exports are available upon request for assessor review

**How to Generate:**
1. Use admin UI export buttons, OR
2. Run evidence generation script: `tsx scripts/generate-evidence.ts`

**Redaction:**
- Review exports for personal data
- Redact sensitive information before external sharing
- See `sample-exports/README.md` for detailed redaction instructions

**Note:** Evidence is generated on demand directly from the production system at the time of assessment. Exports include metadata headers (timestamp, system identifier, exporting admin username) and are immutable once generated.

---

### 10. Template Evidence

**Location:** `compliance/cmmc/level1/05-evidence/templates/`

**Evidence Types:**
- Physical access log procedure: `physical-access-log-procedure.md`
- Endpoint AV verification: `endpoint-av-verification-template.md`
- Vulnerability remediation log: `vuln-remediation-log-template.md`

**How to Use:**
- Follow templates for evidence collection
- Complete templates with actual data
- Store completed templates in evidence folder

### 11. Completed Evidence Records

**Location:** `compliance/cmmc/level1/05-evidence/endpoint-verifications/` and `vulnerability-remediation/`

**Evidence Types:**
- Completed endpoint AV verification records (redacted samples)
- Vulnerability remediation documentation
- Recent remediation activity logs
- CUI blocking technical controls evidence

**Sample Records:**
- Endpoint verification samples: `endpoint-verifications/sample-verification-record-*-redacted.md`
- Vulnerability remediation: `vulnerability-remediation/recent-remediations.md`
- CUI blocking technical controls: `MAC-RPT-101_CUI_Blocking_Technical_Controls_Evidence.md`

**Note:** Verification records document operational evidence. Personal data has been redacted for submission.

### 12. Provider Evidence

**Location:** `compliance/cmmc/level1/05-evidence/provider/railway/` and `provider/github/`

**Evidence Types:**
- Railway platform screenshots (TLS/HTTPS, database encryption, security features)
- GitHub platform screenshots (Dependabot, access controls, security advisories)
- Tenant-specific configuration documentation

**Instructions:** See `.gitkeep` files in each provider directory for detailed capture instructions.

**Note:** Provider evidence demonstrates inherited controls from platform providers. Screenshots and configuration documentation should be captured and stored in respective directories.

---

## Evidence Generation Workflow

### Operational Evidence Exports

Evidence is generated on demand directly from the production system at the time of assessment. Example export structures (redacted) are available in `sample-exports/`:
- `physical-access-logs-sample.csv` - Physical access log entries (redacted)
- `audit-log-sample.csv` - Audit log entries (redacted)
- `endpoint-inventory-sample.csv` - Endpoint inventory (redacted)
- `users-export-sample.csv` - User list (redacted)

**Note:** Evidence is generated on demand directly from the production system at the time of assessment. All exports include metadata headers (timestamp, system identifier, exporting admin username).

### For Physical Access Logs (PE.L1-3.10.4)

1. Navigate to `/admin/physical-access-logs`
2. Apply date range filter if needed
3. Click "Export CSV"
4. Save to `05-evidence/sample-exports/`
5. Review and redact if needed

**Retention:** Physical access logs are retained for a minimum of 90 days in the database. CSV exports are retained per organizational retention policy.

**Review Responsibility:** Physical access logs are reviewed periodically by the System Administrator (or designated security contact) for accuracy and completeness. Review frequency: Quarterly or as needed.

**Sample Export:** See `sample-exports/physical-access-logs-sample.csv` for example structure.

### For Audit Log

1. Navigate to `/admin/events`
2. Apply filters (date range, event type, etc.)
3. Click "Export CSV"
4. Save to `05-evidence/sample-exports/`
5. Review and redact if needed

### For Endpoint Inventory (SI.L1-3.14.2)

1. Navigate to `/admin/endpoint-inventory`
2. Ensure each endpoint entry includes:
   - **Last verification date:** Required field documenting when AV status was last verified
   - **Verification method:** Required field documenting how verification was performed (e.g., "AV status check", "Defender screenshot", "EDR Dashboard")
3. Click "Export CSV"
4. Save to `05-evidence/sample-exports/`
5. Review and redact if needed

**Verification Evidence:** 
- Use the Endpoint AV Verification template (`templates/endpoint-av-verification-template.md`) to document endpoint antivirus verification
- Completed verification records are stored in `endpoint-verifications/` directory
- Sample verification records (redacted): `endpoint-verifications/sample-verification-record-*-redacted.md`
- Sample inventory export: `sample-exports/endpoint-inventory-sample.csv`

### For All Evidence (Automated)

1. Run: `tsx scripts/generate-evidence.ts`
2. Review generated files in `05-evidence/sample-exports/`
3. Redact personal data if needed
4. Store for assessor review

**Sample Exports:** Pre-generated sample exports (redacted) are available in `sample-exports/` directory for immediate assessor review.

---

## Evidence Retention

**Database:**
- AppEvent: 90 days minimum (configurable)
- PhysicalAccessLog: 90 days minimum (configurable)
- User: Permanent (until deleted)
- EndpointInventory: Permanent (until deleted)

**Exports:**
- CSV exports: Per organizational retention policy
- Screenshots: Per organizational retention policy
- Documentation: Permanent (version controlled)

---

## Evidence Handling and Chain-of-Custody

Exported evidence is generated on demand from the live system and stored in restricted-access locations. All evidence is treated as controlled internal records and protected from unauthorized modification. Evidence exports are timestamped and maintained in compliance with organizational retention policies.

---

## Evidence Verification

**For Each Practice:**
1. Review evidence location in Practices Matrix
2. Verify evidence exists and is current
3. Test evidence generation (export, query, etc.)
4. Document evidence location and access method
5. Prepare for assessor demonstration

---

## Related Documents

- Evidence Index: `MAC-RPT-100_Evidence_Index.md` (primary evidence index)
- Practices Matrix: `../04-self-assessment/MAC-AUD-402_CMMC_L1_Practices_Matrix.md`
- Self-Assessment: `../04-self-assessment/MAC-AUD-401_Internal_Cybersecurity_Self-Assessment.md`
- CUI Blocking Technical Controls: `MAC-RPT-101_CUI_Blocking_Technical_Controls_Evidence.md`
- Sample Exports: `sample-exports/README.md`

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

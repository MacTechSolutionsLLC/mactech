# Internal Audit Checklist - CMMC Level 1

**Document Version:** 1.0  
**Date:** 2026-01-21  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 1 (Foundational)  
**Reference:** FAR 52.204-21

---

## Purpose

This checklist provides step-by-step "show me" procedures for each of the 17 CMMC Level 1 practices aligned to FAR 52.204-21. Each item can be demonstrated live to an assessor with specific commands, screenshots, and expected results.

---

## Pre-Audit Preparation

1. Ensure database is accessible (Railway dashboard or direct connection)
2. Have admin account credentials ready
3. Open browser dev tools (Network tab, Console)
4. Have terminal access for commands
5. Prepare evidence export scripts

---

## Practice-by-Practice Checklist

### Practice 1: Limit access to authorized users

**FAR Reference:** 52.204-21(b)(1)

**Checklist:**
- [ ] **Step 1:** Open browser in incognito/private mode
- [ ] **Step 2:** Navigate to `https://your-domain.com/admin`
- [ ] **Expected:** Redirect to `/auth/signin` page
- [ ] **Evidence:** Browser URL shows `/auth/signin?callbackUrl=/admin`
- [ ] **Step 3:** Login with valid credentials
- [ ] **Expected:** Redirect to `/admin` and access granted
- [ ] **Step 4:** Query database for login events
  ```sql
  SELECT "timestamp", "actionType", "actorEmail", "ip", "success"
  FROM "AppEvent"
  WHERE "actionType" IN ('login', 'login_failed')
  ORDER BY "timestamp" DESC
  LIMIT 10;
  ```
- [ ] **Expected:** Recent login events visible
- [ ] **Evidence Location:** `middleware.ts` (lines 19-26), `lib/auth.ts`

**Screenshot:** Browser showing redirect to sign-in page

---

### Practice 2: Limit access to permitted transactions/functions

**FAR Reference:** 52.204-21(b)(1)

**Checklist:**
- [ ] **Step 1:** Query database for user roles
  ```sql
  SELECT email, role FROM "User";
  ```
- [ ] **Expected:** Users with USER and ADMIN roles visible
- [ ] **Step 2:** Login as USER role account
- [ ] **Step 3:** Attempt to access `/admin/users`
- [ ] **Expected:** Redirect to home page (`/`)
- [ ] **Step 4:** Login as ADMIN role account
- [ ] **Step 5:** Access `/admin/users`
- [ ] **Expected:** User management page loads successfully
- [ ] **Evidence Location:** `middleware.ts` (line 29), `lib/authz.ts`

**Screenshot:** USER role redirected, ADMIN role has access

---

### Practice 3: Verify/control external connections

**FAR Reference:** 52.204-21(b)(1)

**Checklist:**
- [ ] **Step 1:** Check browser address bar for HTTPS
- [ ] **Expected:** HTTPS lock icon visible
- [ ] **Step 2:** Inspect network requests (browser dev tools)
- [ ] **Expected:** All requests use `https://` protocol
- [ ] **Step 3:** Railway dashboard: Review TLS/SSL settings
- [ ] **Expected:** TLS enabled, certificate valid
- [ ] **Step 4:** Terminal command:
  ```bash
  curl -I https://your-domain.com | grep -i "strict-transport-security"
  ```
- [ ] **Expected:** HSTS header present (in production)
- [ ] **Evidence Location:** Railway platform (inherited), `middleware.ts` (HTTPS redirect)

**Screenshot:** Browser HTTPS indicator, Railway TLS settings

---

### Practice 4: Control information on publicly accessible systems

**FAR Reference:** 52.204-21(b)(1)

**Checklist:**
- [ ] **Step 1:** Review PublicContent model in schema
  ```sql
  SELECT * FROM "PublicContent" WHERE "isPublic" = true;
  ```
- [ ] **Expected:** Public content requires approval
- [ ] **Step 2:** Check approval workflow in code
- [ ] **Evidence Location:** `prisma/schema.prisma` (PublicContent model)
- [ ] **Note:** If public content feature not implemented, document as "not applicable"

**Screenshot:** Database query results or code review

---

### Practice 5: Identify system users

**FAR Reference:** 52.204-21(b)(1)

**Checklist:**
- [ ] **Step 1:** Query User table
  ```sql
  SELECT id, email, name, role, "createdAt"
  FROM "User"
  ORDER BY "createdAt" DESC;
  ```
- [ ] **Expected:** All users have unique email addresses
- [ ] **Step 2:** Verify unique constraint
  ```sql
  SELECT email, COUNT(*) as count
  FROM "User"
  GROUP BY email
  HAVING COUNT(*) > 1;
  ```
- [ ] **Expected:** No duplicate emails (empty result)
- [ ] **Step 3:** Admin UI: Navigate to `/admin/users`
- [ ] **Expected:** User list displays with unique identifiers
- [ ] **Evidence Location:** `prisma/schema.prisma` (User model, line 16: `email String @unique`)

**Screenshot:** Database query results, Admin UI user list

---

### Practice 6: Authenticate users before access

**FAR Reference:** 52.204-21(b)(1)

**Checklist:**
- [ ] **Step 1:** Attempt login with invalid password
- [ ] **Expected:** Login fails, error message displayed
- [ ] **Step 2:** Query failed login event
  ```sql
  SELECT "timestamp", "actorEmail", "ip", "success"
  FROM "AppEvent"
  WHERE "actionType" = 'login_failed'
  ORDER BY "timestamp" DESC
  LIMIT 5;
  ```
- [ ] **Expected:** Failed login event logged
- [ ] **Step 3:** Login with valid credentials
- [ ] **Expected:** Login succeeds, redirect to admin
- [ ] **Step 4:** Query successful login event
  ```sql
  SELECT "timestamp", "actorEmail", "ip", "success"
  FROM "AppEvent"
  WHERE "actionType" = 'login' AND "success" = true
  ORDER BY "timestamp" DESC
  LIMIT 5;
  ```
- [ ] **Expected:** Successful login event logged
- [ ] **Step 5:** Verify lastLoginAt updated
  ```sql
  SELECT email, "lastLoginAt"
  FROM "User"
  WHERE email = 'test@example.com';
  ```
- [ ] **Expected:** lastLoginAt timestamp is recent
- [ ] **Evidence Location:** `lib/auth.ts` (lines 18-56), AppEvent table

**Screenshot:** Login flow, Event log showing login events

---

### Practice 7: Sanitize/destroy FCI media before disposal

**FAR Reference:** 52.204-21(b)(2)

**Checklist:**
- [ ] **Step 1:** Verify no removable media used
- [ ] **Expected:** All storage is cloud-based (PostgreSQL)
- [ ] **Step 2:** Query for deleted files
  ```sql
  SELECT COUNT(*) as deleted_count
  FROM "StoredFile"
  WHERE "deletedAt" IS NOT NULL;
  ```
- [ ] **Step 3:** Delete a test file via admin UI
- [ ] **Step 4:** Verify logical deletion
  ```sql
  SELECT id, filename, "deletedAt"
  FROM "StoredFile"
  WHERE id = 'test-file-id';
  ```
- [ ] **Expected:** deletedAt timestamp set
- [ ] **Step 5:** Verify FCI stored only in database
  ```sql
  SELECT COUNT(*) as fci_records
  FROM "GovernmentContractDiscovery";
  ```
- [ ] **Expected:** FCI records in database, not on removable media
- [ ] **Evidence Location:** `prisma/schema.prisma` (FCI models, StoredFile model), `lib/file-storage.ts`

**Screenshot:** Database queries, Admin UI file deletion

---

### Practice 8: Limit physical access

**FAR Reference:** 52.204-21(b)(1)

**Checklist:**
- [ ] **Step 1:** Review Physical Security document
- [ ] **File:** `../06-supporting-documents/MAC-SEC-104_Physical_Security.md`
- [ ] **Step 2:** Verify Railway physical security (inherited)
- [ ] **Railway Dashboard:** Review infrastructure security
- [ ] **Step 3:** Document office security procedures
- [ ] **Expected:** Physical security procedures documented
- [ ] **Evidence Location:** `../06-supporting-documents/MAC-SEC-104_Physical_Security.md`, Railway platform (inherited)

**Screenshot:** Physical Security document, Railway dashboard

---

### Practice 9: Escort visitors

**FAR Reference:** 52.204-21(b)(1)

**Checklist:**
- [ ] **Step 1:** Review Physical Security document
- [ ] **File:** `../06-supporting-documents/MAC-SEC-104_Physical_Security.md`
- [ ] **Step 2:** Verify visitor escort procedures documented
- [ ] **Expected:** Visitor procedures clearly stated
- [ ] **Evidence Location:** `compliance/Physical-Security.md`

**Screenshot:** Physical Security document (visitor section)

---

### Practice 10: Maintain audit logs of physical access

**FAR Reference:** 52.204-21(b)(1)  
**CMMC Practice:** PE.L1-3.10.4

**Checklist:**
- [ ] **Status:** ✅ Implemented
- [ ] Navigate to `/admin/physical-access-logs` and verify admin-only access
- [ ] Create a sample physical access log entry
- [ ] Verify required fields: date, time-in, time-out, person name, purpose, location
- [ ] Verify entries are immutable (tamper-evident with created_at, created_by_user_id)
- [ ] Export CSV and verify format
- [ ] Verify database retention: minimum 90 days
- [ ] Verify review responsibility: System Administrator, quarterly
- [ ] **Evidence Location:** 
  - Admin UI: `/admin/physical-access-logs`
  - Database: `PhysicalAccessLog` table
  - API: `/api/admin/physical-access-logs`
  - Procedure: `05-evidence/templates/physical-access-log-procedure.md`

---

### Practice 11: Control administrative privileges

**FAR Reference:** 52.204-21(b)(1)

**Checklist:**
- [ ] **Step 1:** Verify admin role enforcement
  ```sql
  SELECT email, role FROM "User" WHERE role = 'ADMIN';
  ```
- [ ] **Step 2:** Login as ADMIN
- [ ] **Step 3:** Attempt to create user without re-auth
- [ ] **Expected:** Error: "Admin re-authentication required"
- [ ] **Step 4:** Call re-auth endpoint
  ```bash
  curl -X POST https://your-domain.com/api/admin/reauth \
    -H "Content-Type: application/json" \
    -d '{"password":"admin-password"}' \
    --cookie "next-auth.session-token=..."
  ```
- [ ] **Expected:** Re-auth successful
- [ ] **Step 5:** Update session with re-auth flag
- [ ] **Step 6:** Attempt user creation again
- [ ] **Expected:** User creation succeeds
- [ ] **Step 7:** Query admin action events
  ```sql
  SELECT "timestamp", "actionType", "actorEmail", "details"
  FROM "AppEvent"
  WHERE "actionType" = 'admin_action'
  ORDER BY "timestamp" DESC
  LIMIT 10;
  ```
- [ ] **Expected:** Admin actions logged
- [ ] **Evidence Location:** `lib/admin-reauth.ts`, `app/api/admin/reauth/route.ts`, AppEvent table

**Screenshot:** Re-auth flow, Event log showing admin actions

---

### Practice 12: Use encryption for FCI in transit

**FAR Reference:** 52.204-21(b)(3)

**Checklist:**
- [ ] **Step 1:** Check browser for HTTPS
- [ ] **Expected:** HTTPS lock icon in address bar
- [ ] **Step 2:** Inspect certificate
- [ ] **Expected:** Valid TLS certificate
- [ ] **Step 3:** Railway dashboard: Verify TLS configuration
- [ ] **Expected:** TLS enabled on Railway platform
- [ ] **Step 4:** Terminal command:
  ```bash
  curl -v https://your-domain.com 2>&1 | grep -i "SSL\|TLS"
  ```
- [ ] **Expected:** TLS handshake successful
- [ ] **Step 5:** Check HSTS header (production)
  ```bash
  curl -I https://your-domain.com | grep -i "strict-transport-security"
  ```
- [ ] **Expected:** HSTS header present
- [ ] **Evidence Location:** Railway platform (inherited), `middleware.ts` (HTTPS redirect), `next.config.js` (HSTS header)

**Screenshot:** Browser HTTPS indicator, Certificate details, Terminal output

---

### Practice 13: Use encryption for FCI at rest

**FAR Reference:** 52.204-21(b)(3)

**Checklist:**
- [ ] **Step 1:** Verify Railway PostgreSQL encryption
- [ ] **Railway Dashboard:** Check database encryption settings
- [ ] **Expected:** Encryption at rest enabled
- [ ] **Step 2:** Verify password hashing
  ```sql
  SELECT email, 
         LENGTH(password) as hash_length,
         SUBSTRING(password, 1, 10) as hash_preview
  FROM "User"
  WHERE password IS NOT NULL
  LIMIT 5;
  ```
- [ ] **Expected:** Passwords are hashed (not plaintext)
- [ ] **Step 3:** Verify bcrypt cost factor
  ```bash
  grep "bcryptRounds\|bcrypt.*12" lib/password-policy.ts
  ```
- [ ] **Expected:** Cost factor is 12
- [ ] **Step 4:** Code review: Password hashing implementation
- [ ] **File:** `lib/password-policy.ts`, `lib/auth.ts`
- [ ] **Expected:** bcrypt.hash() with rounds = 12
- [ ] **Evidence Location:** Railway platform (database encryption), `lib/password-policy.ts` (PASSWORD_POLICY.bcryptRounds = 12)

**Screenshot:** Railway database settings, Database query (hashed passwords), Code review

---

### Practice 14: Employ malicious code protection

**FAR Reference:** 52.204-21(b)(3)

**Checklist:**
- [ ] **Step 1:** Review Railway security features
- [ ] **Railway Dashboard:** Check security and malware protection
- [ ] **Expected:** Platform-level protection enabled
- [ ] **Step 2:** Review Endpoint Protection document
- [ ] **File:** `compliance/MAC-SEC-101_Endpoint_Protection.md`
- [ ] **Step 3:** Verify OS AV/EDR on developer endpoints
- [ ] **Expected:** Windows Defender (Win) or equivalent (Mac) enabled
- [ ] **Evidence Location:** Railway platform (inherited), `compliance/MAC-SEC-101_Endpoint_Protection.md`

**Screenshot:** Railway security features, Endpoint Protection document

---

### Practice 15: Identify/report/correct flaws

**FAR Reference:** 52.204-21(b)(3)

**Checklist:**
- [ ] **Step 1:** Run npm audit
  ```bash
  npm audit
  ```
- [ ] **Expected:** Vulnerability report generated
- [ ] **Step 2:** Export audit report
  ```bash
  npm audit > audit-report-$(date +%Y%m%d).txt
  ```
- [ ] **Step 3:** Review dependency versions
  ```bash
  cat package.json | grep -A 20 "dependencies"
  ```
- [ ] **Step 4:** Review vulnerability management process
- [ ] **File:** `../06-supporting-documents/MAC-SEC-106_Vulnerability_Management.md`
- [ ] **Step 5:** Check for Dependabot configuration (if GitHub)
- [ ] **File:** `.github/dependabot.yml`
- [ ] **Expected:** Dependency update workflow documented
- [ ] **Evidence Location:** `package.json`, `../06-supporting-documents/MAC-SEC-106_Vulnerability_Management.md`, npm audit output

**Screenshot:** npm audit output, Vulnerability Management document

---

### Practice 16: Update malicious code protection

**FAR Reference:** 52.204-21(b)(3)

**Checklist:**
- [ ] **Step 1:** Review Railway update process
- [ ] **Railway Dashboard:** Check platform update settings
- [ ] **Expected:** Platform manages updates automatically
- [ ] **Step 2:** Review Railway documentation on updates
- [ ] **Expected:** Update process documented by Railway
- [ ] **Evidence Location:** Railway platform (inherited)

**Screenshot:** Railway dashboard, Platform documentation

---

### Practice 17: Perform periodic scans

**FAR Reference:** 52.204-21(b)(3)

**Checklist:**
- [ ] **Step 1:** Review Railway security scanning
- [ ] **Railway Dashboard:** Check security scanning features
- [ ] **Expected:** Platform-level scanning enabled
- [ ] **Step 2:** Review Railway security documentation
- [ ] **Expected:** Scanning capabilities documented
- [ ] **Evidence Location:** Railway platform (inherited)

**Screenshot:** Railway security features, Platform documentation

---

## Quick Reference Commands

### Database Queries

```sql
-- User accounts and access
SELECT id, email, role, disabled, "lastLoginAt", "createdAt" 
FROM "User" 
ORDER BY "createdAt" DESC;

-- Recent events
SELECT "timestamp", "actionType", "actorEmail", "ip", "success"
FROM "AppEvent"
ORDER BY "timestamp" DESC
LIMIT 50;

-- Login events
SELECT "timestamp", "actionType", "actorEmail", "ip", "success"
FROM "AppEvent"
WHERE "actionType" IN ('login', 'login_failed')
ORDER BY "timestamp" DESC
LIMIT 20;

-- Admin actions
SELECT "timestamp", "actionType", "actorEmail", "targetType", "details"
FROM "AppEvent"
WHERE "actionType" = 'admin_action'
ORDER BY "timestamp" DESC
LIMIT 20;

-- File operations
SELECT "timestamp", "actionType", "actorEmail", "targetId"
FROM "AppEvent"
WHERE "actionType" IN ('file_upload', 'file_download', 'file_delete')
ORDER BY "timestamp" DESC
LIMIT 20;
```

### Terminal Commands

```bash
# Security audit
npm audit

# Export users
tsx compliance/scripts/export-users.ts > users-export.csv

# Export events
tsx compliance/scripts/export-events.ts > events-export.csv

# Check security headers
curl -I https://your-domain.com

# Verify HTTPS
curl -v https://your-domain.com 2>&1 | grep -i "SSL\|TLS"
```

---

## Evidence File Locations

| Evidence Type | Location | Format |
|---------------|----------|--------|
| Code Evidence | `lib/`, `app/`, `middleware.ts` | TypeScript files |
| Database Evidence | PostgreSQL (Railway) | SQL queries |
| Configuration | `next.config.js`, `package.json` | Config files |
| Event Logs | AppEvent table, CSV exports | Database, CSV |
| User Data | User table, CSV exports | Database, CSV |
| Documentation | `compliance/` directory | Markdown files |

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

---

## Appendix A: Related Documents

- Evidence Index (`../05-evidence/MAC-RPT-100_Evidence_Index.md`)
- Inherited Controls Matrix (`../03-control-responsibility/MAC-RPT-102_Inherited_Controls_Matrix.md`)
- System Boundary (`../01-system-scope/MAC-IT-105_System_Boundary.md`)
- Self-Assessment (`../cmmc/level2/04-self-assessment/MAC-AUD-401_Internal_Cybersecurity_Self-Assessment.md`)

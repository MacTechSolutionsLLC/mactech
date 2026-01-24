# Evidence Index - CMMC Level 1

**Document Version:** 1.0  
**Date:** 2026-01-21  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 1 (Foundational)  
**Reference:** FAR 52.204-21

**Note:** This is the primary evidence index. For comprehensive evidence details, see `evidence-index.md` in the same directory.

**Applies to:** CMMC 2.0 Level 1 (FCI-only system)

---

## Purpose

This document maps each of the 17 CMMC Level 1 practices aligned to FAR 52.204-21 to implemented controls, demonstration procedures, evidence locations, and capture methods. This index enables live "show me" demonstrations for assessors.

**Note:** CMMC Level 1 includes 17 practices aligned to FAR 52.204-21 (which contains 15 basic safeguarding requirements).

**System Scope:** This system is scoped to FCI and CUI (CMMC Level 2). CUI files are stored separately and require password protection for access.

---

## Evidence Index Table

| Practice | FAR Clause | Control | Demonstration | Evidence Location | Capture Method |
|----------|------------|---------|---------------|-------------------|---------------|
| 1. Limit access to authorized users | 52.204-21(b)(1) | Authentication required for all access | 1. Attempt to access `/admin` without login<br>2. Verify redirect to `/auth/signin`<br>3. Login and verify access granted | `middleware.ts` (lines 19-26)<br>`lib/auth.ts`<br>AppEvent table (login events) | Browser test<br>Database query: `SELECT * FROM "AppEvent" WHERE "actionType" = 'login' ORDER BY "timestamp" DESC LIMIT 10;` |
| 2. Limit access to permitted transactions/functions | 52.204-21(b)(1) | Role-based access control (RBAC) | 1. Login as USER role<br>2. Attempt to access `/admin`<br>3. Verify redirect to home<br>4. Login as ADMIN and verify access | `middleware.ts` (line 29)<br>`lib/authz.ts`<br>User.role field | Browser test<br>Database query: `SELECT email, role FROM "User";` |
| 3. Verify/control external connections | 52.204-21(b)(1) | HTTPS/TLS enforced, Railway network security | 1. Check Railway dashboard for TLS configuration<br>2. Verify all API calls use HTTPS<br>3. Check network security settings | Railway platform dashboard<br>Network configuration<br>Inherited Controls Matrix | Railway dashboard screenshot<br>Network request logs (browser dev tools) |
| 4. Control information on publicly accessible systems | 52.204-21(b)(1) | Public content approval required | 1. Navigate to public content creation<br>2. Verify approval workflow<br>3. Check PublicContent table | `prisma/schema.prisma` (PublicContent model)<br>AppEvent table (public_content_approve) | Database query: `SELECT * FROM "PublicContent" WHERE "isPublic" = true;`<br>Admin UI test |
| 5. Identify system users | 52.204-21(b)(1) | Unique email addresses, user IDs | 1. Query User table<br>2. Verify unique email constraint<br>3. Check user identification fields | `prisma/schema.prisma` (User model, line 16: `email String @unique`)<br>Database: User table | Database query: `SELECT id, email, name, role FROM "User";`<br>Admin UI: `/admin/users` |
| 6. Authenticate users before access | 52.204-21(b)(1) | NextAuth.js authentication | 1. Attempt login with invalid credentials<br>2. Verify failure logged<br>3. Login with valid credentials<br>4. Verify success logged | `lib/auth.ts` (lines 18-56)<br>AppEvent table (login, login_failed events) | Browser test<br>Database query: `SELECT * FROM "AppEvent" WHERE "actionType" IN ('login', 'login_failed') ORDER BY "timestamp" DESC LIMIT 20;` |
| 7. Sanitize/destroy FCI media before disposal | 52.204-21(b)(2) | Database record deletion, no removable media | 1. Delete a record via admin UI<br>2. Verify deletion in database<br>3. Confirm no removable media used | `prisma/schema.prisma` (FCI models)<br>Database delete operations<br>AppEvent table (file_delete events) | Database query: `SELECT COUNT(*) FROM "StoredFile" WHERE "deletedAt" IS NOT NULL;`<br>Admin UI: Delete file and verify |
| 8. Limit physical access | 52.204-21(b)(1) | Office security, Railway physical security | 1. Review Physical Security document<br>2. Verify Railway physical security (inherited)<br>3. Check device security procedures | `../06-supporting-documents/MAC-SEC-104_Physical_Security.md`<br>Railway platform (inherited)<br>Organizational procedures | Document review<br>Railway platform documentation |
| 9. Escort visitors | 52.204-21(b)(1) | Visitor escort procedures | 1. Review Physical Security document<br>2. Verify visitor procedures documented | `../06-supporting-documents/MAC-SEC-104_Physical_Security.md`<br>Organizational procedures | Document review |
| 10. Maintain audit logs of physical access | 52.204-21(b)(1) | Physical access logging module (PE.L1-3.10.4) | 1. Navigate to `/admin/physical-access-logs`<br>2. View/create physical access log entries<br>3. Export CSV: Click "Export CSV" button<br>4. Database query: `SELECT * FROM "PhysicalAccessLog" ORDER BY "date" DESC;` | `app/admin/physical-access-logs/page.tsx`<br>`app/api/admin/physical-access-logs/route.ts`<br>Database: `PhysicalAccessLog` table | Browser test<br>CSV export<br>Database query |
| 11. Control administrative privileges | 52.204-21(b)(1) | Admin role required, admin re-auth for sensitive actions | 1. Attempt admin action without re-auth<br>2. Verify re-auth required<br>3. Complete re-auth and verify action allowed | `lib/admin-reauth.ts`<br>`app/api/admin/reauth/route.ts`<br>AppEvent table (admin_action events) | Browser test<br>Database query: `SELECT * FROM "AppEvent" WHERE "actionType" = 'admin_action' ORDER BY "timestamp" DESC LIMIT 10;` |
| 12. Use encryption for FCI in transit | 52.204-21(b)(3) | HTTPS/TLS (Railway platform) | 1. Check browser for HTTPS indicator<br>2. Verify TLS certificate<br>3. Check Railway dashboard for TLS config | Railway platform (inherited)<br>Browser security indicators<br>Network request inspection | Browser test (HTTPS lock icon)<br>Railway dashboard screenshot |
| 13. Use encryption for FCI at rest | 52.204-21(b)(3) | Database encryption at rest (Railway), password hashing (bcrypt) | 1. Verify Railway PostgreSQL encryption<br>2. Check password hashing in User table<br>3. Verify bcrypt cost factor (12) | Railway platform (inherited)<br>`lib/password-policy.ts` (bcryptRounds: 12)<br>Database: User.password field | Railway dashboard<br>Code review: `lib/password-policy.ts`<br>Database query: `SELECT email, LENGTH(password) as hash_length FROM "User" WHERE password IS NOT NULL;` |
| 14. Employ malicious code protection | 52.204-21(b)(3) | Railway platform malware protection (inherited). Endpoint inventory tracks AV status (SI.L1-3.14.2). | 1. Review Railway security features (inherited)<br>2. Navigate to `/admin/endpoint-inventory`<br>3. Verify endpoints tracked with AV status, last verification date, verification method<br>4. Export endpoint inventory CSV | Railway platform (inherited)<br>`compliance/MAC-SEC-101_Endpoint_Protection.md`<br>`app/admin/endpoint-inventory/page.tsx`<br>`app/api/admin/endpoint-inventory/export/route.ts`<br>Database: `EndpointInventory` table | Railway documentation<br>Endpoint Protection document<br>Browser test: `/admin/endpoint-inventory`<br>CSV export<br>Database query: `SELECT * FROM "EndpointInventory" ORDER BY "lastVerifiedDate" DESC;` |
| 15. Identify/report/correct flaws | 52.204-21(b)(3) | Dependency management, npm audit, GitHub Dependabot, vulnerability awareness | 1. Run `npm audit`<br>2. Review Dependabot configuration<br>3. Check GitHub Dependabot alerts/PRs<br>4. Review dependency update process | `package.json`<br>`.github/dependabot.yml`<br>`compliance/MAC-SEC-106_Vulnerability_Management.md`<br>GitHub Dependabot dashboard | Terminal: `npm audit`<br>GitHub: Dependabot alerts<br>Document review<br>Code review: `.github/dependabot.yml` |
| 16. Update malicious code protection | 52.204-21(b)(3) | Railway platform updates | 1. Review Railway update process<br>2. Verify platform manages updates | Railway platform (inherited) | Railway dashboard<br>Platform documentation |
| 17. Perform periodic scans | 52.204-21(b)(3) | Railway platform scanning | 1. Review Railway security scanning<br>2. Verify platform-level protection | Railway platform (inherited) | Railway dashboard<br>Platform documentation |

---

## Detailed Evidence Locations

### Practice 1: Authorized Users Only

**Control:** Authentication middleware, NextAuth.js

**How to Demonstrate:**
1. Open browser in incognito mode
2. Navigate to `/admin`
3. Observe redirect to `/auth/signin`
4. Login with valid credentials
5. Verify access to `/admin`

**Evidence:**
- Code: `middleware.ts` (lines 19-26)
- Code: `lib/auth.ts` (authentication system)
- Database: `SELECT * FROM "AppEvent" WHERE "actionType" = 'login' ORDER BY "timestamp" DESC LIMIT 10;`

**Capture Method:**
- Browser screenshot of redirect
- Database query results
- Code file review

---

### Practice 2: Limit Transactions/Functions

**Control:** Role-based access control (RBAC)

**How to Demonstrate:**
1. Create test USER account
2. Login as USER
3. Attempt to access `/admin/users`
4. Verify redirect to home page
5. Login as ADMIN
6. Verify access to `/admin/users`

**Evidence:**
- Code: `middleware.ts` (line 29: role check)
- Code: `lib/authz.ts` (requireAdmin function)
- Database: `SELECT email, role FROM "User";`

**Capture Method:**
- Browser test with screenshots
- Database query showing roles
- Code review of authorization logic

---

### Practice 6: Authenticate Users

**Control:** NextAuth.js with credentials provider, password hashing

**How to Demonstrate:**
1. Attempt login with invalid password
2. Check AppEvent table for `login_failed` event
3. Login with valid credentials
4. Check AppEvent table for `login` event
5. Verify `lastLoginAt` updated in User table

**Evidence:**
- Code: `lib/auth.ts` (lines 18-56, login logic)
- Code: `lib/audit.ts` (logLogin function)
- Database: `SELECT * FROM "AppEvent" WHERE "actionType" IN ('login', 'login_failed') ORDER BY "timestamp" DESC LIMIT 20;`
- Database: `SELECT email, "lastLoginAt" FROM "User" ORDER BY "lastLoginAt" DESC;`

**Capture Method:**
- Browser test
- Database queries
- Event log export: `/admin/events` page

---

### Practice 11: Control Administrative Privileges

**Control:** Admin role enforcement, admin re-authentication

**How to Demonstrate:**
1. Login as ADMIN
2. Attempt to create user without re-auth
3. Verify re-auth required error
4. Call `/api/admin/reauth` with password
5. Update session with re-auth flag
6. Verify user creation succeeds

**Evidence:**
- Code: `lib/admin-reauth.ts` (requireAdminReauth function)
- Code: `app/api/admin/reauth/route.ts`
- Code: `app/api/admin/create-user/route.ts` (requires re-auth)
- Database: `SELECT * FROM "AppEvent" WHERE "actionType" = 'admin_action' ORDER BY "timestamp" DESC LIMIT 10;`

**Capture Method:**
- Browser test with network tab
- API response inspection
- Event log review

---

### Practice 13: Encryption at Rest

**Control:** Database encryption (Railway), password hashing (bcrypt)

**How to Demonstrate:**
1. Verify Railway PostgreSQL encryption (inherited)
2. Check password hashing implementation
3. Verify bcrypt cost factor is 12
4. Query User table to verify passwords are hashed

**Evidence:**
- Code: `lib/password-policy.ts` (PASSWORD_POLICY.bcryptRounds = 12)
- Code: `lib/auth.ts` (bcrypt usage)
- Railway platform: Database encryption settings
- Database: `SELECT email, SUBSTRING(password, 1, 10) as hash_preview FROM "User" WHERE password IS NOT NULL;`

**Capture Method:**
- Code review
- Railway dashboard screenshot
- Database query (showing hashed passwords, not plaintext)

---

### Practice 15: Identify/Report/Correct Flaws

**Control:** Dependency management, npm audit, vulnerability awareness

**How to Demonstrate:**
1. Run `npm audit` command
2. Review output for vulnerabilities
3. Check `package.json` for dependency versions
4. Review vulnerability management process document

**Evidence:**
- Code: `package.json` (dependencies)
- Code: `.github/dependabot.yml` (automated vulnerability scanning configuration)
- Document: `compliance/MAC-SEC-106_Vulnerability_Management.md`
- GitHub: Dependabot alerts and pull requests
- Terminal output: `npm audit` results

**Capture Method:**
- Terminal command: `npm audit > audit-report.txt`
- Code review of `package.json` and `.github/dependabot.yml`
- GitHub: Screenshot of Dependabot alerts dashboard
- GitHub: List of Dependabot pull requests: `gh pr list --label "dependencies" --label "security"`
- Document review

---

## Evidence Capture Commands

### Database Queries

```sql
-- User accounts and roles
SELECT id, email, name, role, disabled, "lastLoginAt", "createdAt" 
FROM "User" 
ORDER BY "createdAt" DESC;

-- Recent login events
SELECT "timestamp", "actionType", "actorEmail", "ip", "success"
FROM "AppEvent"
WHERE "actionType" IN ('login', 'login_failed')
ORDER BY "timestamp" DESC
LIMIT 50;

-- Admin actions
SELECT "timestamp", "actionType", "actorEmail", "targetType", "targetId", "details"
FROM "AppEvent"
WHERE "actionType" = 'admin_action'
ORDER BY "timestamp" DESC
LIMIT 50;

-- File uploads
SELECT "timestamp", "actionType", "actorEmail", "targetId", "details"
FROM "AppEvent"
WHERE "actionType" = 'file_upload'
ORDER BY "timestamp" DESC
LIMIT 50;

-- User access review (as needed)
SELECT email, name, role, "lastLoginAt", disabled, "createdAt"
FROM "User"
WHERE disabled = false
ORDER BY "lastLoginAt" DESC NULLS LAST;

-- Endpoint inventory (SI.L1-3.14.2)
SELECT "deviceIdentifier", owner, os, "avEnabled", "lastVerifiedDate", "verificationMethod", "createdAt", "updatedAt"
FROM "EndpointInventory"
ORDER BY "lastVerifiedDate" DESC NULLS LAST;

-- Physical access logs (PE.L1-3.10.4)
SELECT date, "timeIn", "timeOut", "personName", purpose, "hostEscort", location, "createdAt", "createdByUserId"
FROM "PhysicalAccessLog"
ORDER BY date DESC, "timeIn" DESC
LIMIT 100;
```

### Terminal Commands

```bash
# Export users CSV
tsx compliance/scripts/export-users.ts > users-export-$(date +%Y%m%d).csv

# Export events CSV
tsx compliance/scripts/export-events.ts --start=2026-01-01 --end=2026-01-31 > events-export-$(date +%Y%m%d).csv

# Security audit
npm audit

# Verify Dependabot configuration
cat .github/dependabot.yml

# List Dependabot pull requests
gh pr list --label "dependencies" --label "security" --author "app/dependabot"

# Check Dependabot alerts (requires GitHub CLI)
gh api repos/:owner/:repo/dependabot/alerts

# Generate config snapshot
tsx compliance/scripts/config-snapshot.ts > config-snapshot-$(date +%Y%m%d).md

# Check password policy
grep -A 5 "PASSWORD_POLICY" lib/password-policy.ts

# Verify security headers
curl -I https://your-domain.com | grep -i "strict-transport-security\|x-content-type-options\|x-frame-options"
```

---

## Evidence Storage Locations

| Evidence Type | Storage Location | Retention |
|---------------|------------------|-----------|
| Application Events | AppEvent table (PostgreSQL) | 90 days minimum |
| User Accounts | User table (PostgreSQL) | Permanent (until deleted) |
| Files | StoredFile table (PostgreSQL) | Until deleted |
| Configuration | Code files, Railway dashboard | Permanent |
| Audit Logs | AppEvent table, exported CSVs | 90 days (database), permanent (exports) |
| Security Headers | Response headers, `next.config.js` | Permanent (code) |
| Password Hashes | User.password field (PostgreSQL) | Permanent |

---

## Live Demonstration Procedures

### For Each Practice:

1. **Code Review:** Show relevant code file and line numbers
2. **Database Query:** Execute SQL query to show evidence
3. **Browser Test:** Demonstrate control in running application
4. **Export Evidence:** Generate CSV or document export
5. **Documentation:** Reference policy/procedure documents

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

- Self-Assessment (`../cmmc/level1/04-self-assessment/MAC-AUD-401_Internal_Cybersecurity_Self-Assessment.md`)
- Internal Audit Checklist (`../04-self-assessment/MAC-AUD-103_Internal_Audit_Checklist.md`)
- Inherited Controls Matrix (`../03-control-responsibility/MAC-RPT-102_Inherited_Controls_Matrix.md`)
- System Boundary (`../01-system-scope/MAC-IT-105_System_Boundary.md`)

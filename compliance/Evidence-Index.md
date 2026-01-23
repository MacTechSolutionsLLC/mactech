# Evidence Index - CMMC Level 1

**Document Version:** 1.0  
**Date:** 2026-01-21  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 1 (Foundational)  
**Reference:** FAR 52.204-21

---

## Purpose

This document maps each of the 17 CMMC Level 1 practices aligned to FAR 52.204-21 to implemented controls, demonstration procedures, evidence locations, and capture methods. This index enables live "show me" demonstrations for assessors.

---

## Evidence Index Table

| Practice | FAR Clause | Control | Demonstration | Evidence Location | Capture Method |
|----------|------------|---------|---------------|-------------------|---------------|
| 1. Limit access to authorized users | 52.204-21(b)(1) | Authentication required for all access | **Step 1:** Open a new incognito/private browser window (to ensure no existing session). **Step 2:** Type the full URL `https://your-domain.com/admin` in the address bar and press Enter. **Step 3:** Observe that the browser automatically redirects to `/auth/signin` - verify the URL bar shows the sign-in page. **Step 4:** Enter valid admin credentials (email and password) and click "Sign In". **Step 5:** Verify you are successfully redirected to `/admin` dashboard and can see admin navigation menu. **Step 6:** Open browser DevTools (F12) → Network tab → Filter for "login" → Verify a successful login API call was made. **Step 7:** Execute database query to show login event was logged: `SELECT * FROM "AppEvent" WHERE "actionType" = 'login' ORDER BY "timestamp" DESC LIMIT 10;` | `middleware.ts` (lines 19-26)<br>`lib/auth.ts`<br>AppEvent table (login events) | Browser test<br>Database query: `SELECT * FROM "AppEvent" WHERE "actionType" = 'login' ORDER BY "timestamp" DESC LIMIT 10;` |
| 2. Limit access to permitted transactions/functions | 52.204-21(b)(1) | Role-based access control (RBAC) | **Step 1:** Query database to identify a USER role account: `SELECT email, role FROM "User" WHERE role = 'USER';` (or create a test USER account via admin panel). **Step 2:** Logout from current session (or use incognito window). **Step 3:** Login with USER role credentials (not ADMIN). **Step 4:** After successful login, manually type `https://your-domain.com/admin` in the address bar and press Enter. **Step 5:** Observe that the browser redirects you back to the home page (`/`) - verify the URL changes and you see the user dashboard, not admin dashboard. **Step 6:** Logout and login with ADMIN role credentials. **Step 7:** Navigate to `https://your-domain.com/admin` - verify you can access the admin dashboard and see admin navigation menu. **Step 8:** Execute database query to show user roles: `SELECT email, role FROM "User";` - verify USER and ADMIN roles are distinct. | `middleware.ts` (line 29)<br>`lib/authz.ts`<br>User.role field | Browser test<br>Database query: `SELECT email, role FROM "User";` |
| 3. Verify/control external connections | 52.204-21(b)(1) | HTTPS/TLS enforced, Railway network security | **Step 1:** Open Railway dashboard (https://railway.app) and navigate to your project. **Step 2:** Click on your service/deployment → Settings → Verify "HTTPS" is enabled and TLS certificate is configured (should show certificate issuer and expiration date). **Step 3:** In your application, open browser DevTools (F12) → Network tab → Reload the page. **Step 4:** Inspect each network request - verify all requests show "Protocol: h2" or "h3" (HTTP/2 or HTTP/3 over TLS) and the "Scheme" column shows "https://" for all requests. **Step 5:** Click on any API request → Headers tab → Verify "Request URL" starts with `https://` (not `http://`). **Step 6:** Check the "Security" tab in DevTools → Verify "Connection secure" and certificate details are displayed. **Step 7:** Review Inherited Controls Matrix document to confirm Railway platform provides network security controls. | Railway platform dashboard<br>Network configuration<br>Inherited Controls Matrix | Railway dashboard screenshot<br>Network request logs (browser dev tools) |
| 4. Control information on publicly accessible systems | 52.204-21(b)(1) | Public content approval required | **Step 1:** Login as ADMIN user. **Step 2:** Navigate to the public content creation/management page (if available in admin UI). **Step 3:** Attempt to create or modify public content - verify there is an approval workflow (e.g., content is marked as "pending approval" or requires admin approval checkbox). **Step 4:** If approval workflow exists in UI, create a test public content item and verify it requires approval before being published. **Step 5:** Execute database query to see approved public content: `SELECT * FROM "PublicContent" WHERE "isPublic" = true;` - verify only approved content is marked as public. **Step 6:** Query AppEvent table for approval events: `SELECT * FROM "AppEvent" WHERE "actionType" = 'public_content_approve' ORDER BY "timestamp" DESC LIMIT 10;` - verify approval actions are logged. **Step 7:** Review `prisma/schema.prisma` PublicContent model to verify `isPublic` field and any approval-related fields exist. | `prisma/schema.prisma` (PublicContent model)<br>AppEvent table (public_content_approve) | Database query: `SELECT * FROM "PublicContent" WHERE "isPublic" = true;`<br>Admin UI test |
| 5. Identify system users | 52.204-21(b)(1) | Unique email addresses, user IDs | **Step 1:** Execute database query to list all users: `SELECT id, email, name, role FROM "User" ORDER BY "createdAt" DESC;` - verify each user has a unique `id` (UUID) and unique `email` address. **Step 2:** Attempt to create a duplicate user (via admin UI or API) with an email that already exists - verify the system rejects the creation with an error message indicating email must be unique. **Step 3:** Review `prisma/schema.prisma` User model - locate line with `email String @unique` to verify the unique constraint is defined at the database schema level. **Step 4:** Navigate to `/admin/users` in the admin panel - verify the user list displays all users with their unique identifiers (ID, email, name, role). **Step 5:** Click on any user to view details - verify user identification fields (id, email, name) are displayed and cannot be duplicated. **Step 6:** Execute query to verify uniqueness: `SELECT email, COUNT(*) as count FROM "User" GROUP BY email HAVING COUNT(*) > 1;` - this should return zero rows if uniqueness is enforced. | `prisma/schema.prisma` (User model, line 16: `email String @unique`)<br>Database: User table | Database query: `SELECT id, email, name, role FROM "User";`<br>Admin UI: `/admin/users` |
| 6. Authenticate users before access | 52.204-21(b)(1) | NextAuth.js authentication | **Step 1:** Navigate to `/auth/signin` page. **Step 2:** Enter a valid email address but an incorrect password - click "Sign In". **Step 3:** Verify an error message appears (e.g., "Invalid credentials" or "Login failed"). **Step 4:** Execute database query to verify failed login was logged: `SELECT * FROM "AppEvent" WHERE "actionType" = 'login_failed' ORDER BY "timestamp" DESC LIMIT 5;` - verify the failed attempt appears with `success: false` and includes the email and timestamp. **Step 5:** Now enter correct credentials (valid email and password) and click "Sign In". **Step 6:** Verify successful login redirects you to the dashboard. **Step 7:** Execute database query to verify successful login was logged: `SELECT * FROM "AppEvent" WHERE "actionType" = 'login' AND "success" = true ORDER BY "timestamp" DESC LIMIT 5;` - verify the successful login event includes your email, timestamp, IP address, and `success: true`. **Step 8:** Query User table to verify `lastLoginAt` was updated: `SELECT email, "lastLoginAt" FROM "User" WHERE email = 'your-email@example.com';` - verify the timestamp matches recent login time. **Step 9:** Review code in `lib/auth.ts` (lines 18-56) to show authentication logic and password verification process. | `lib/auth.ts` (lines 18-56)<br>AppEvent table (login, login_failed events) | Browser test<br>Database query: `SELECT * FROM "AppEvent" WHERE "actionType" IN ('login', 'login_failed') ORDER BY "timestamp" DESC LIMIT 20;` |
| 7. Sanitize/destroy FCI media before disposal | 52.204-21(b)(2) | Database record deletion, no removable media | **Step 1:** Login as ADMIN user. **Step 2:** Navigate to file management/admin UI where files can be deleted (e.g., `/admin/files` or similar). **Step 3:** Identify a test file that can be safely deleted (or upload a test file first). **Step 4:** Click delete/remove button for the test file - verify a confirmation dialog appears asking to confirm deletion. **Step 5:** Confirm deletion and verify the file is removed from the UI list. **Step 6:** Execute database query to verify soft deletion: `SELECT id, filename, "deletedAt" FROM "StoredFile" WHERE "deletedAt" IS NOT NULL ORDER BY "deletedAt" DESC LIMIT 10;` - verify the deleted file appears with a `deletedAt` timestamp (soft delete pattern). **Step 7:** Query AppEvent table for deletion events: `SELECT * FROM "AppEvent" WHERE "actionType" = 'file_delete' ORDER BY "timestamp" DESC LIMIT 10;` - verify the deletion action was logged with actor email and file details. **Step 8:** Review `prisma/schema.prisma` StoredFile model to verify `deletedAt` field exists (soft delete pattern). **Step 9:** Document that no removable media (USB drives, external hard drives) are used for FCI storage - all data is stored in cloud database (Railway PostgreSQL) with no physical media disposal required. | `prisma/schema.prisma` (FCI models)<br>Database delete operations<br>AppEvent table (file_delete events) | Database query: `SELECT COUNT(*) FROM "StoredFile" WHERE "deletedAt" IS NOT NULL;`<br>Admin UI: Delete file and verify |
| 8. Limit physical access | 52.204-21(b)(1) | Office security, Railway physical security | **Step 1:** Open and review the Physical Security Policy document: `compliance/cmmc/level1/02-policies-and-procedures/MAC-POL-212_Physical_Security_Policy.md`. **Step 2:** Verify the document describes office access controls (e.g., locked doors, keycard access, visitor procedures). **Step 3:** Verify the document describes device security procedures (e.g., laptops locked when unattended, screen locks, device encryption). **Step 4:** Navigate to Railway platform documentation (https://docs.railway.app) → Search for "physical security" or "data center security". **Step 5:** Review Railway's inherited physical security controls - verify they describe data center access controls, physical security measures, and facility protections. **Step 6:** Review Inherited Controls Matrix document to confirm Railway physical security is documented as an inherited control. **Step 7:** Document that application infrastructure (Railway) provides physical security controls, and organizational procedures (Physical Security Policy) cover office and device physical access. | `compliance/Physical-Security.md`<br>Railway platform (inherited)<br>Organizational procedures | Document review<br>Railway platform documentation |
| 9. Escort visitors | 52.204-21(b)(1) | Visitor escort procedures | **Step 1:** Open the Physical Security Policy document: `compliance/cmmc/level1/02-policies-and-procedures/MAC-POL-212_Physical_Security_Policy.md`. **Step 2:** Search for "visitor" or "escort" sections in the document. **Step 3:** Verify the document describes visitor escort procedures, including: (a) Visitors must be escorted at all times, (b) Visitor log/registration process, (c) Host responsibilities for escorting visitors, (d) Areas where visitors are allowed/restricted. **Step 4:** Review Physical Access Logs module (`/admin/physical-access-logs`) to verify visitor entries can be logged with escort information (hostEscort field). **Step 5:** If applicable, demonstrate creating a visitor log entry with escort information via the admin UI. **Step 6:** Document that visitor escort procedures are defined in the Physical Security Policy and enforced through organizational procedures and physical access logging. | `compliance/Physical-Security.md`<br>Organizational procedures | Document review |
| 10. Maintain audit logs of physical access | 52.204-21(b)(1) | Physical access logging module (PE.L1-3.10.4) | **Step 1:** Login as ADMIN user. **Step 2:** Navigate to `/admin/physical-access-logs` in the admin panel. **Step 3:** Verify the page displays a list of existing physical access log entries (if any) with columns: Date, Time In, Time Out, Person Name, Purpose, Location, Host Escort, Created By. **Step 4:** Click "Create New Entry" or "Add Log Entry" button (if available). **Step 5:** Fill in the form with test data: Date (today's date), Time In (e.g., "09:00"), Time Out (e.g., "17:00"), Person Name, Purpose (e.g., "Office visit"), Location (e.g., "Main Office"), Host Escort (if applicable), Notes (optional). **Step 6:** Submit the form and verify the new entry appears in the log list. **Step 7:** Click the "Export CSV" button (if available) - verify a CSV file downloads with all log entries. **Step 8:** Execute database query to view all logs: `SELECT * FROM "PhysicalAccessLog" ORDER BY "date" DESC LIMIT 20;` - verify the newly created entry appears with all fields populated, including `createdByUserId` and `createdAt` timestamps (tamper-evident). **Step 9:** Verify retention: Query logs older than 90 days: `SELECT COUNT(*) FROM "PhysicalAccessLog" WHERE "date" < NOW() - INTERVAL '90 days';` - verify logs are retained for at least 90 days. **Step 10:** Document that logs are reviewed quarterly by System Administrator (review process documented in Physical Security Policy). | `app/admin/physical-access-logs/page.tsx`<br>`app/api/admin/physical-access-logs/route.ts`<br>Database: `PhysicalAccessLog` table | Browser test<br>CSV export<br>Database query |
| 11. Control administrative privileges | 52.204-21(b)(1) | Admin role required, admin re-auth for sensitive actions | **Step 1:** Login as ADMIN user. **Step 2:** Navigate to a sensitive admin action (e.g., `/admin/users` → "Create User" button, or similar admin action that requires re-auth). **Step 3:** Attempt to perform the action (e.g., fill out user creation form and click "Create User"). **Step 4:** Verify an error message or modal appears indicating "Admin re-authentication required" or similar message. **Step 5:** Open browser DevTools (F12) → Network tab → Verify the API call to create user returns a 401 or 403 status with error message about re-auth. **Step 6:** Call the re-auth endpoint: Open browser console or use curl/Postman to POST to `/api/admin/reauth` with body `{"password": "your-admin-password"}` (include session cookie). **Step 7:** Verify re-auth response returns `{"success": true}`. **Step 8:** Update your session (if using browser, the UI should handle this automatically; if testing via API, update session token with re-auth flag). **Step 9:** Retry the admin action (e.g., create user again) - verify it now succeeds. **Step 10:** Execute database query to verify admin action was logged: `SELECT * FROM "AppEvent" WHERE "actionType" = 'admin_action' ORDER BY "timestamp" DESC LIMIT 10;` - verify both the re-auth attempt and the final admin action are logged with actor email, timestamp, and success status. **Step 11:** Review code in `lib/admin-reauth.ts` to show the `requireAdminReauth` function that enforces re-authentication. | `lib/admin-reauth.ts`<br>`app/api/admin/reauth/route.ts`<br>AppEvent table (admin_action events) | Browser test<br>Database query: `SELECT * FROM "AppEvent" WHERE "actionType" = 'admin_action' ORDER BY "timestamp" DESC LIMIT 10;` |
| 12. Use encryption for FCI in transit | 52.204-21(b)(3) | HTTPS/TLS (Railway platform) | **Step 1:** Open your application in a browser (e.g., Chrome, Firefox). **Step 2:** Look at the address bar - verify a lock icon (🔒) appears next to the URL, indicating HTTPS is active. **Step 3:** Click on the lock icon - verify a security popup shows "Connection is secure" and displays certificate information (issuer, expiration date). **Step 4:** Open browser DevTools (F12) → Security tab → Verify "This page is secure (valid HTTPS)" is displayed. **Step 5:** In DevTools → Network tab → Reload the page → Click on any API request → Headers tab → Verify "Request URL" starts with `https://` (not `http://`). **Step 6:** In the same request headers, verify "Protocol" shows "h2" or "h3" (HTTP/2 or HTTP/3 over TLS). **Step 7:** Navigate to Railway dashboard (https://railway.app) → Your project → Service settings → Verify TLS/SSL certificate is configured and shows certificate details (issuer, expiration). **Step 8:** Verify Railway automatically provisions and renews TLS certificates (inherited control). **Step 9:** Document that all FCI in transit is encrypted via HTTPS/TLS provided by Railway platform. | Railway platform (inherited)<br>Browser security indicators<br>Network request inspection | Browser test (HTTPS lock icon)<br>Railway dashboard screenshot |
| 13. Use encryption for FCI at rest | 52.204-21(b)(3) | Database encryption at rest (Railway), password hashing (bcrypt) | **Step 1:** Navigate to Railway dashboard → Your project → Database (PostgreSQL) → Settings → Verify encryption at rest is enabled (Railway PostgreSQL databases are encrypted at rest by default - this is an inherited control). **Step 2:** Review code file `lib/password-policy.ts` - locate the `PASSWORD_POLICY` constant and verify `bcryptRounds: 12` is set (this determines password hashing strength). **Step 3:** Review `lib/auth.ts` - verify password hashing uses `bcrypt.hash()` function when creating/updating passwords. **Step 4:** Execute database query to verify passwords are hashed (not plaintext): `SELECT email, LENGTH(password) as hash_length, SUBSTRING(password, 1, 10) as hash_preview FROM "User" WHERE password IS NOT NULL LIMIT 5;` - verify: (a) `hash_length` is approximately 60 characters (bcrypt hash length), (b) `hash_preview` starts with `$2b$` or `$2a$` (bcrypt hash prefix), (c) No plaintext passwords are visible. **Step 5:** Attempt to query for a specific user's password: `SELECT password FROM "User" WHERE email = 'test@example.com';` - verify the result is a bcrypt hash, not the original password. **Step 6:** Document that: (a) Database encryption at rest is provided by Railway platform (inherited), (b) Password hashing uses bcrypt with cost factor 12 (application-level control), (c) All FCI stored in database is encrypted at rest via Railway PostgreSQL encryption. | Railway platform (inherited)<br>`lib/password-policy.ts` (bcryptRounds: 12)<br>Database: User.password field | Railway dashboard<br>Code review: `lib/password-policy.ts`<br>Database query: `SELECT email, LENGTH(password) as hash_length FROM "User" WHERE password IS NOT NULL;` |
| 14. Employ malicious code protection | 52.204-21(b)(3) | Railway platform malware protection | **Step 1:** Navigate to Railway platform documentation (https://docs.railway.app) → Search for "security" or "malware protection" → Review Railway's security features and platform-level protections. **Step 2:** Verify Railway provides infrastructure-level malware protection (this is an inherited control - Railway's platform handles this). **Step 3:** Open the Endpoint Protection document: `compliance/cmmc/level1/05-evidence/endpoint-verifications/` or `compliance/Endpoint-Protection.md` (if exists). **Step 4:** Review the document to verify it describes endpoint protection measures (e.g., operating system antivirus/EDR on developer endpoints, device security requirements). **Step 5:** Navigate to `/admin/endpoint-inventory` (if available) → Verify endpoint inventory shows devices with `avEnabled: true` status and `lastVerifiedDate` timestamps. **Step 6:** Execute database query to verify endpoint protection status: `SELECT * FROM "EndpointInventory" WHERE "avEnabled" = true ORDER BY "lastVerifiedDate" DESC;` - verify endpoints have antivirus enabled and recent verification dates. **Step 7:** Review Inherited Controls Matrix to confirm Railway platform malware protection is documented as inherited. **Step 8:** Document that: (a) Application infrastructure (Railway) provides platform-level malware protection (inherited), (b) Endpoint protection (OS AV/EDR) is managed at the organizational level per Endpoint Protection procedures. | Railway platform (inherited)<br>`compliance/Endpoint-Protection.md` | Railway documentation<br>Endpoint Protection document |
| 15. Identify/report/correct flaws | 52.204-21(b)(3) | Dependency management, npm audit, GitHub Dependabot, vulnerability awareness | **Step 1:** Open terminal/command prompt in the project root directory. **Step 2:** Run `npm audit` command - review the output to see current vulnerabilities (if any) with severity levels (Low, Moderate, High, Critical). **Step 3:** Run `npm audit --json > audit-report.json` to export audit results for documentation. **Step 4:** Open `.github/dependabot.yml` file in code editor - verify Dependabot is configured to scan: (a) npm dependencies (package.json), (b) Frequency (e.g., weekly), (c) Security updates enabled. **Step 5:** Navigate to GitHub repository → Security tab → Dependabot alerts → Review any open security alerts (if any) - verify alerts show vulnerability details, affected packages, and recommended fixes. **Step 6:** Navigate to GitHub repository → Pull requests → Filter by author "dependabot" → Review Dependabot pull requests that automatically propose dependency updates for security vulnerabilities. **Step 7:** Open vulnerability management document: `compliance/cmmc/level1/02-policies-and-procedures/` or `compliance/Vuln-Management.md` (if exists) → Review the process for identifying, reporting, and correcting security flaws. **Step 8:** Review `package.json` to verify dependency versions and identify any known vulnerable packages. **Step 9:** Document the vulnerability management process: (a) Automated scanning via npm audit and Dependabot, (b) Review and triage alerts, (c) Apply patches via Dependabot PRs or manual updates, (d) Verify fixes are tested and deployed. | `package.json`<br>`.github/dependabot.yml`<br>`compliance/Vuln-Management.md`<br>GitHub Dependabot dashboard | Terminal: `npm audit`<br>GitHub: Dependabot alerts<br>Document review<br>Code review: `.github/dependabot.yml` |
| 16. Update malicious code protection | 52.204-21(b)(3) | Railway platform updates | **Step 1:** Navigate to Railway platform documentation (https://docs.railway.app) → Search for "updates" or "platform maintenance" → Review Railway's platform update and maintenance procedures. **Step 2:** Verify Railway automatically manages platform-level updates (infrastructure, security patches, malware protection updates) - this is an inherited control where Railway handles updates without customer intervention. **Step 3:** Navigate to Railway dashboard → Your project → Activity/Deployments → Review deployment history to verify platform updates are applied automatically. **Step 4:** Review Railway status page (https://status.railway.app) or release notes to see recent platform updates and security patches. **Step 5:** Review Inherited Controls Matrix document to confirm Railway platform update management is documented as an inherited control. **Step 6:** Document that malicious code protection updates (antivirus signatures, security patches) are managed automatically by Railway platform - no customer action required for platform-level protection updates. **Step 7:** Note that application-level dependency updates are handled separately via Practice 15 (npm audit, Dependabot). | Railway platform (inherited) | Railway dashboard<br>Platform documentation |
| 17. Perform periodic scans | 52.204-21(b)(3) | Railway platform scanning | **Step 1:** Navigate to Railway platform documentation (https://docs.railway.app) → Search for "security scanning" or "vulnerability scanning" → Review Railway's security scanning capabilities and frequency. **Step 2:** Verify Railway performs periodic security scans at the platform/infrastructure level (this is an inherited control - Railway manages scanning). **Step 3:** Navigate to Railway dashboard → Your project → Security or Monitoring section (if available) → Review any security scan results or reports (if accessible). **Step 4:** Review Railway's security documentation to verify: (a) Scanning frequency (e.g., continuous, daily, weekly), (b) Types of scans performed (vulnerability scans, malware scans, infrastructure scans), (c) How scan results are handled and reported. **Step 5:** Review Inherited Controls Matrix to confirm Railway platform scanning is documented as an inherited control. **Step 6:** Document that periodic security scans are performed by Railway platform automatically - this includes infrastructure scanning, vulnerability scanning, and malware detection at the platform level. **Step 7:** Note that application-level dependency scanning is handled separately via Practice 15 (npm audit, Dependabot). **Step 8:** If applicable, review any internal scanning procedures or tools used for application code scanning (beyond platform-level scans). | Railway platform (inherited) | Railway dashboard<br>Platform documentation |

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
- Document: `compliance/Vuln-Management.md`
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

-- User access review (quarterly)
SELECT email, name, role, "lastLoginAt", disabled, "createdAt"
FROM "User"
WHERE disabled = false
ORDER BY "lastLoginAt" DESC NULLS LAST;
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

- Self-Assessment (`cmmc/level1/04-self-assessment/MAC-AUD-401_Internal_Cybersecurity_Self-Assessment.md`)
- Internal Audit Checklist (`cmmc/level1/04-self-assessment/MAC-AUD-103_Internal_Audit_Checklist.md`)
- Inherited Controls Matrix (`cmmc/level1/03-control-responsibility/MAC-RPT-102_Inherited_Controls_Matrix.md`)
- System Boundary (`cmmc/level1/01-system-scope/MAC-IT-105_System_Boundary.md`)

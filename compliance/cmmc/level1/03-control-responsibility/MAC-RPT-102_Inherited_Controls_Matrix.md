# Inherited Controls Matrix - CMMC Level 1

**Document Version:** 1.0  
**Date:** 2026-01-21  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 1 (Foundational)  
**Reference:** FAR 52.204-21

**Applies to:** CMMC 2.0 Level 1 (FCI-only system)

---

## Purpose

This document clearly distinguishes between controls provided by the Railway platform (inherited) and controls implemented by the organization (customer responsibility). This matrix enables accurate assessment of control ownership and evidence capture.

---

## Control Responsibility Matrix

| Control | Provider | Responsibility | Evidence/Proof Location | How to Verify |
|---------|----------|---------------|-------------------------|---------------|
| TLS/HTTPS Encryption | Railway | Provider | Railway platform dashboard<br>Browser HTTPS indicator<br>Network request inspection | 1. Check browser for HTTPS lock icon<br>2. Inspect network requests (dev tools)<br>3. Railway dashboard: SSL/TLS settings<br>4. Verify certificate validity |
| Physical Security | Railway | Provider | Railway platform documentation<br>Data center certifications | 1. Review Railway physical security documentation<br>2. Check Railway compliance certifications<br>3. Railway dashboard: Infrastructure details |
| Infrastructure Security | Railway | Provider | Railway platform<br>Network security settings | 1. Railway dashboard: Network settings<br>2. Security capabilities relied upon operationally but not independently assessed |
| Database Security | Railway | Provider | Railway PostgreSQL service documentation<br>Database configuration | 1. Railway dashboard: PostgreSQL service settings<br>2. Security capabilities relied upon operationally but not independently assessed |
| Malware Protection (Infrastructure) | Railway | Provider | Railway platform security features | 1. Railway dashboard: Security features<br>2. Platform-level protection status<br>3. Railway security documentation |
| Application Authentication | Customer | Customer | `lib/auth.ts`<br>`middleware.ts`<br>AppEvent table | 1. Code review: `lib/auth.ts`<br>2. Database: Login events<br>3. Browser test: Login flow |
| Role-Based Access Control | Customer | Customer | `lib/authz.ts`<br>`middleware.ts`<br>User.role field | 1. Code review: Authorization logic<br>2. Database: User roles<br>3. Browser test: Role enforcement |
| Password Policy | Customer | Customer | `lib/password-policy.ts`<br>`app/api/auth/change-password/route.ts` | 1. Code review: Password validation<br>2. Test: Attempt weak password<br>3. Verify policy enforcement |
| Admin Re-authentication | Customer | Customer | `lib/admin-reauth.ts`<br>`app/api/admin/reauth/route.ts` | 1. Code review: Re-auth logic<br>2. Browser test: Admin action flow<br>3. Event log: Re-auth events |
| Event Logging | Customer | Customer | `lib/audit.ts`<br>AppEvent table | 1. Code review: Logging functions<br>2. Database: Event records<br>3. Admin UI: `/admin/events` |
| File Storage Security | Customer | Customer | `lib/file-storage.ts`<br>StoredFile table | 1. Code review: File storage logic<br>2. Database: File records<br>3. Test: File upload/download |
| CUI Keyword Blocking | Customer | Customer | `lib/cui-blocker.ts` | 1. Code review: CUI validation<br>2. Test: Attempt CUI upload<br>3. Verify blocking |
| Security Headers | Customer | Customer | `lib/security-headers.ts`<br>`next.config.js` | 1. Code review: Headers configuration<br>2. Browser: Inspect response headers<br>3. Terminal: `curl -I` command |
| HTTPS Enforcement | Customer | Customer | `middleware.ts` (HTTP redirect) | 1. Code review: Redirect logic<br>2. Test: HTTP request redirects to HTTPS |
| Session Management | Customer | Customer | `lib/auth.ts` (session config) | 1. Code review: Session settings<br>2. Test: Session timeout<br>3. Verify secure cookies |
| User Account Management | Customer | Customer | `app/api/admin/users/`<br>User table | 1. Code review: User management APIs<br>2. Database: User records<br>3. Admin UI: User management |

---

## Detailed Control Descriptions

### Inherited Controls (Railway Platform)

#### TLS/HTTPS Encryption

**Provider:** Railway Platform  
**Responsibility:** Provider  
**Evidence:**
- Railway platform automatically provides HTTPS/TLS
- TLS certificates managed by Railway
- All traffic encrypted in transit

**How to Verify:**
1. Navigate to application URL
2. Check browser address bar for HTTPS lock icon
3. Inspect certificate: Click lock icon → Certificate
4. Railway dashboard: Check SSL/TLS configuration
5. Network inspection: All requests use HTTPS

**Documentation:**
- Railway platform documentation
- Browser security indicators
- Network request logs

---

#### Physical Security

**Provider:** Railway Platform  
**Responsibility:** Provider  
**Evidence:**
- Railway operates data centers with physical security
- Physical access controls managed by Railway
- Environmental controls (temperature, humidity, fire suppression)

**How to Verify:**
1. Review Railway physical security documentation
2. Check Railway compliance certifications (if available)
3. Railway dashboard: Infrastructure location details

**Note:** Organization does not claim responsibility for Railway's physical security posture. Organization relies on Railway for this control.

---

#### Infrastructure Security

**Provider:** Railway Platform  
**Responsibility:** Provider  
**Evidence:**
- Network-level security (Railway managed)
- Network security capabilities (Railway provided, relied upon operationally, not independently assessed)

**How to Verify:**
1. Railway dashboard: Network security settings
2. Review Railway security features documentation
3. Note: Security capabilities are relied upon operationally but not independently assessed

**Note:** Organization does not manage network infrastructure. Organization relies on Railway for this control.

---

#### Database Encryption at Rest

**Provider:** Railway PostgreSQL Service  
**Responsibility:** Provider  
**Evidence:**
- Railway PostgreSQL provides encryption at rest
- Encryption keys managed by Railway
- Database storage encrypted

**How to Verify:**
1. Railway dashboard: PostgreSQL service settings
2. Review Railway encryption documentation
3. Database connection uses encrypted connection string

**Note:** Organization does not manage database encryption or encryption keys. Organization relies on Railway for this control.

---

#### Malware Protection (Infrastructure)

**Provider:** Railway Platform  
**Responsibility:** Provider  
**Evidence:**
- Railway platform includes infrastructure-level malware protection
- Automated threat detection (Railway managed)

**How to Verify:**
1. Railway dashboard: Security features
2. Review Railway security documentation
3. Check platform-level protection status

**Note:** Organization does not manage infrastructure-level malware protection. Organization relies on Railway for this control.

---

### Customer-Implemented Controls

#### Application Authentication

**Provider:** Customer (MacTech Solutions)  
**Responsibility:** Customer  
**Evidence:**
- Code: `lib/auth.ts` (NextAuth.js implementation)
- Code: `middleware.ts` (authentication enforcement)
- Database: AppEvent table (login events)

**How to Verify:**
1. Code review: `lib/auth.ts` lines 18-56
2. Database query: `SELECT * FROM "AppEvent" WHERE "actionType" IN ('login', 'login_failed') ORDER BY "timestamp" DESC LIMIT 20;`
3. Browser test: Attempt access without login

**Capture Method:**
- Code file review
- Database query execution
- Browser test with screenshots

---

#### Role-Based Access Control

**Provider:** Customer  
**Responsibility:** Customer  
**Evidence:**
- Code: `lib/authz.ts` (authorization functions)
- Code: `middleware.ts` (role enforcement)
- Database: User.role field

**How to Verify:**
1. Code review: `middleware.ts` line 29
2. Database query: `SELECT email, role FROM "User";`
3. Browser test: USER role cannot access `/admin`

**Capture Method:**
- Code review
- Database query
- Browser test

---

#### Password Policy

**Provider:** Customer  
**Responsibility:** Customer  
**Evidence:**
- Code: `lib/password-policy.ts` (PASSWORD_POLICY.minLength = 14, bcryptRounds = 12)
- Code: `app/api/auth/change-password/route.ts` (policy enforcement)

**How to Verify:**
1. Code review: `lib/password-policy.ts`
2. Test: Attempt password change with < 14 characters
3. Test: Attempt common password
4. Verify bcrypt cost factor: Check `PASSWORD_POLICY.bcryptRounds`

**Capture Method:**
- Code review
- Browser test (password change form)
- Terminal: `grep -A 3 "PASSWORD_POLICY" lib/password-policy.ts`

---

#### Admin Re-authentication

**Provider:** Customer  
**Responsibility:** Customer  
**Evidence:**
- Code: `lib/admin-reauth.ts`
- Code: `app/api/admin/reauth/route.ts`
- Database: AppEvent table (admin_action events)

**How to Verify:**
1. Code review: `lib/admin-reauth.ts`
2. Browser test: Attempt admin action without re-auth
3. Complete re-auth and verify action succeeds
4. Database: Check admin_action events

**Capture Method:**
- Code review
- Browser test with network inspection
- Event log review

---

#### Event Logging

**Provider:** Customer  
**Responsibility:** Customer  
**Evidence:**
- Code: `lib/audit.ts` (logging functions)
- Database: AppEvent table
- Admin UI: `/admin/events` page

**How to Verify:**
1. Code review: `lib/audit.ts`
2. Database query: `SELECT COUNT(*) FROM "AppEvent";`
3. Admin UI: Navigate to `/admin/events`
4. Export events CSV

**Capture Method:**
- Code review
- Database query
- Admin UI screenshots
- CSV export

---

#### File Storage Security

**Provider:** Customer  
**Responsibility:** Customer  
**Evidence:**
- Code: `lib/file-storage.ts` (file storage service)
- Database: StoredFile table (BYTEA storage)
- Signed URL generation and verification

**How to Verify:**
1. Code review: `lib/file-storage.ts`
2. Database query: `SELECT COUNT(*) FROM "StoredFile" WHERE "deletedAt" IS NULL;`
3. Test: Upload file and verify storage
4. Test: Download via signed URL

**Capture Method:**
- Code review
- Database query
- Browser test (file upload/download)

---

#### CUI Keyword Blocking

**Provider:** Customer  
**Responsibility:** Customer  
**Evidence:**
- Code: `lib/cui-blocker.ts` (CUI validation functions)

**How to Verify:**
1. Code review: `lib/cui-blocker.ts`
2. Test: Attempt to upload file with "CUI" in filename
3. Test: Attempt to create user with CUI-related field name
4. Verify error message returned

**Capture Method:**
- Code review
- Browser test (attempt CUI upload)
- Error message capture

---

#### Security Headers

**Provider:** Customer  
**Responsibility:** Customer  
**Evidence:**
- Code: `lib/security-headers.ts`
- Code: `next.config.js` (headers configuration)

**How to Verify:**
1. Code review: `next.config.js` (headers function)
2. Terminal: `curl -I https://your-domain.com | grep -i "strict-transport-security\|x-content-type-options\|x-frame-options"`
3. Browser: Inspect response headers (dev tools → Network → Headers)

**Capture Method:**
- Code review
- Terminal command output
- Browser dev tools screenshot

---

## Verification Procedures

### For Inherited Controls:

1. **Railway Dashboard Review:**
   - Log into Railway dashboard
   - Navigate to service settings
   - Review security and encryption settings
   - Screenshot relevant configurations

2. **Railway Documentation:**
   - Review Railway platform documentation
   - Check for security certifications
   - Review compliance statements

3. **Platform Evidence:**
   - Network request inspection (HTTPS)
   - Database connection encryption
   - Platform security features

### For Customer Controls:

1. **Code Review:**
   - Show relevant code files
   - Explain implementation
   - Reference line numbers

2. **Database Queries:**
   - Execute SQL queries
   - Show evidence in database
   - Export query results

3. **Live Demonstration:**
   - Browser test of control
   - Show control in action
   - Capture screenshots/video

4. **Admin UI:**
   - Navigate to admin pages
   - Show control interfaces
   - Demonstrate functionality

---

## Responsibility Summary

**Provider (Railway) Responsibilities:**
- TLS/HTTPS encryption
- Physical security
- Infrastructure security
- Database security capabilities (relied upon operationally, not independently assessed)
- Infrastructure-level malware protection

**Customer (MacTech Solutions) Responsibilities:**
- Application-level security controls
- Authentication and authorization
- Password policy enforcement
- Event logging
- File storage security
- CUI keyword blocking
- Security headers
- User account management
- FCI handling and protection

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

- Inherited Control Statement Railway (`../cmmc/level1/03-control-responsibility/MAC-SEC-310_Inherited_Control_Statement_Railway.md`)
- Evidence Index (`../05-evidence/MAC-RPT-100_Evidence_Index.md`)
- System Boundary (`../01-system-scope/MAC-IT-105_System_Boundary.md`)

## Appendix B: Railway Platform Information

**Platform:** Railway (railway.app)  
**Services Used:** Application hosting, PostgreSQL database  
**Service Agreement:** [Reference service agreement if available]

**Note:** For Railway's specific security capabilities and certifications, refer to Railway's publicly available documentation. This document describes organization's reliance on Railway platform.

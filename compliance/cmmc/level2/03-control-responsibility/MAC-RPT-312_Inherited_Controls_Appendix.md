# Inherited Controls Appendix

**Document Version:** 1.0  
**Date:** 2026-01-21  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 1 (Foundational)  
**Reference:** FAR 52.204-21

---

## Purpose

This document identifies controls that are inherited from third-party service providers (Railway and GitHub) and clarifies organizational responsibility for these controls.

**Important:** This document does not claim responsibility for the security posture of third-party providers. It documents what controls are inherited and where evidence can be found.

---

## Railway Platform - Inherited Controls

### Physical Security (PE)

**What is Inherited:**
- Data center physical access controls
- Environmental controls (temperature, humidity, fire suppression)
- Facility security (guards, surveillance, access logs)
- Redundant power and cooling systems
- Physical infrastructure security

**Organizational Responsibility:**
- Organization relies on Railway for physical security of cloud infrastructure
- Organization does not claim responsibility for Railway's physical security posture
- Organization documents Railway's physical security as inherited control

**Evidence Locations:**
- Railway platform documentation
- Screenshots: `05-evidence/provider/railway/`
- Railway security documentation references

**What is NOT Inherited:**
- Physical access logs to our office facilities (implemented in application)
- Device security for endpoints used to access the system (endpoint inventory implemented)

---

## Railway Platform - Network Security (SC)

### Encryption in Transit (SC.L1-3.13.1)

**What is Inherited:**
- TLS/HTTPS termination
- Certificate management
- Network encryption
- DDoS protection
- Firewall rules

**Organizational Responsibility:**
- Application enforces HTTPS redirect (middleware.ts)
- Secure cookies configured (production)
- Organization documents Railway's TLS/HTTPS as inherited control

**Evidence Locations:**
- Railway dashboard: TLS/HTTPS configuration
- Application code: `middleware.ts` (HTTPS redirect)
- Application code: `next.config.js` (security headers)
- Browser test: HTTPS lock icon
- Screenshots: `05-evidence/provider/railway/`

---

## Railway Platform - Database Security (SC)

### Encryption at Rest (SC.L1-3.13.5)

**What is Inherited:**
- Database encryption at rest
- Automated backups
- Database access controls
- Platform-level database security

**Organizational Responsibility:**
- Application uses Railway PostgreSQL service
- Password hashing implemented (bcrypt, 12 rounds)
- Organization documents Railway's database encryption as inherited control

**Evidence Locations:**
- Railway dashboard: Database encryption settings
- Application code: `lib/password-policy.ts` (bcrypt configuration)
- Screenshots: `05-evidence/provider/railway/`

---

## Railway Platform - Malware Protection (SI)

### Malware Protection (SI.L1-3.14.1, SI.L1-3.14.3, SI.L1-3.14.4)

**What is Inherited:**
- Platform-level malware protection
- Automated threat detection
- File scanning capabilities
- Platform update management

**Organizational Responsibility:**
- Organization relies on Railway for platform-level malware protection
- Organization implements endpoint inventory (SI.L1-3.14.2) to track endpoint AV status
- Organization documents Railway's malware protection as inherited control

**Evidence Locations:**
- Railway platform documentation
- Endpoint inventory: `/admin/endpoint-inventory`
- Screenshots: `05-evidence/provider/railway/`

**What is NOT Inherited:**
- Endpoint antivirus on devices used to access the system (tracked via endpoint inventory)
- Endpoint protection verification (implemented in endpoint inventory module)

---

## GitHub Platform - Source Control Security

### Repository Access Controls

**What is Inherited:**
- Repository access controls
- Authentication and authorization
- Branch protection rules
- Code review processes

**Organizational Responsibility:**
- Organization manages GitHub repository access
- Organization documents GitHub's access controls as inherited control

**Evidence Locations:**
- GitHub repository settings
- Screenshots: `05-evidence/provider/github/`

---

## GitHub Platform - Dependency Security (SI)

### Vulnerability Management (SI.L1-3.14.1)

**What is Inherited:**
- Dependabot automated vulnerability scanning (weekly)
- Security advisories
- Dependency vulnerability alerts
- Automated pull requests for security updates

**Organizational Responsibility:**
- Organization reviews and merges Dependabot pull requests
- Organization runs npm audit manually as needed
- Organization documents vulnerability remediation
- Organization maintains SECURITY.md

**Evidence Locations:**
- `.github/dependabot.yml` (configuration)
- GitHub Dependabot dashboard
- npm audit (manual execution)
- Screenshots: `05-evidence/provider/github/`
- `SECURITY.md` (vulnerability reporting process)

---

## What is NOT Inherited

The following controls are **NOT** inherited and are implemented by the organization:

1. **Physical Access Logs (PE.L1-3.10.4)** - Implemented in application (`/admin/physical-access-logs`)
2. **Endpoint Inventory (SI.L1-3.14.2)** - Implemented in application (`/admin/endpoint-inventory`)
3. **User Lifecycle Management** - Implemented in application (user creation, role management)
4. **Application Authentication** - Implemented in application (NextAuth.js)
5. **Application Authorization** - Implemented in application (RBAC)
6. **Security Event Logging** - Implemented in application (AppEvent table)
7. **Incident Response Reporting** - Implemented by organization (policy and procedures)
8. **Vulnerability Remediation** - Managed by organization (Dependabot + manual review)

---

## Evidence Storage

### Railway Evidence

**Location:** `05-evidence/provider/railway/`

**What to Capture:**
- TLS/HTTPS configuration screenshots
- Database encryption settings screenshots
- Platform security feature documentation
- Physical security documentation references

**Tenant-Specific Configuration Evidence:**
- Railway project configuration showing HTTPS/TLS enabled
- PostgreSQL service encryption at rest (enabled)
- Environment variables configuration (redacted - secure configuration documented)
- Platform security features active status

**Instructions:** See `05-evidence/provider/railway/.gitkeep` for detailed capture instructions.

### GitHub Evidence

**Location:** `05-evidence/provider/github/`

**What to Capture:**
- Dependabot configuration screenshots
- Security advisory screenshots
- Repository access control documentation
- Code review process documentation

**Tenant-Specific Configuration Evidence:**
- Repository access controls (collaborators, roles)
- Branch protection rules (if configured)
- Dependabot active status and configuration
- Security advisories and Dependabot PR history

**Instructions:** See `05-evidence/provider/github/.gitkeep` for detailed capture instructions.

---

## Responsibility Matrix

| Control | Provider | Organization Responsibility | Evidence Location |
|---------|----------|----------------------------|-------------------|
| Physical data center security | Railway | Document as inherited | Railway docs, screenshots (`05-evidence/provider/railway/`) |
| TLS/HTTPS termination | Railway | Enforce HTTPS redirect, document tenant config | Railway dashboard, middleware.ts, tenant screenshots |
| Database encryption at rest | Railway | Use Railway PostgreSQL, document tenant config | Railway dashboard, tenant-specific screenshots |
| Platform malware protection | Railway | Document as inherited | Railway docs, screenshots (`05-evidence/provider/railway/`) |
| Repository access controls | GitHub | Manage access, document tenant config | GitHub settings, screenshots (`05-evidence/provider/github/`) |
| Dependency vulnerability scanning | GitHub | Review and merge PRs, document activity | Dependabot dashboard, .github/, screenshots |
| Physical access logs | N/A | Implemented in application | /admin/physical-access-logs, sample exports |
| Endpoint inventory | N/A | Implemented in application | /admin/endpoint-inventory, sample exports |
| User lifecycle | N/A | Implemented in application | /admin/users, sample exports |
| Application authentication | N/A | Implemented in application | lib/auth.ts, audit log exports |
| Security event logging | N/A | Implemented in application | /admin/events, sample exports |

## Tenant-Specific Configuration Evidence

**Railway Tenant Configuration:**
- HTTPS/TLS: Enabled (verified via Railway dashboard)
- Database Encryption: Enabled (PostgreSQL service, verified via Railway dashboard)
- Environment Variables: Securely configured (redacted in evidence)
- Platform Security: Active (verified via Railway dashboard)

**GitHub Tenant Configuration:**
- Repository Access: Controlled via GitHub collaborator settings
- Dependabot: Active (weekly scans, verified via GitHub dashboard)
- Branch Protection: [Status] (verified via GitHub repository settings)
- Security Features: Enabled (Dependabot, security advisories)

**Evidence Storage:**
- Railway evidence: `05-evidence/provider/railway/`
- GitHub evidence: `05-evidence/provider/github/`
- See README files in each directory for capture instructions

---

## Provider Documentation Availability

**Third-Party Assurance:** Inherited controls are validated via third-party assurance reports maintained by the hosting provider. These artifacts are reviewed annually and available upon request.

Provider security documentation and evidence are available upon request. The organization reviews Railway and GitHub platform security documentation annually and monitors platform status and security announcements.

---

## Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be completed]

**Change History:**
- Version 1.0 (2026-01-21): Initial document creation

---

**Document Status:** This document reflects the system state as of 2026-01-21 and is maintained under configuration control.

---

## Related Documents

- Inherited Controls Matrix: `MAC-RPT-102_Inherited_Controls_Matrix.md`
- Inherited Controls Responsibility Matrix: `MAC-RPT-311_Inherited_Controls_Responsibility_Matrix.md`
- Inherited Control Statement Railway: `MAC-SEC-310_Inherited_Control_Statement_Railway.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`

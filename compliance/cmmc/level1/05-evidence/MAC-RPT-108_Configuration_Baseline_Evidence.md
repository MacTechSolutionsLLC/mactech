# Configuration Baseline Evidence - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-23  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.4.2

**Control:** 3.4.2 - Establish and enforce security configuration settings for information technology products

---

## 1. Purpose

This document provides evidence of the establishment and maintenance of configuration baselines for the MacTech Solutions system.

---

## 2. Configuration Baseline Summary

**Status:** ✅ Fully Implemented

**Baseline Establishment Date:** 2026-01-23

**Baseline Version:** BASELINE-2026-01-23

---

## 3. Configuration Baseline Inventory

### 3.1 Application Configuration Baseline

**Source Code:**
- Repository: GitHub
- Version Control: Git
- Baseline Tag: BASELINE-2026-01-23

**Dependencies:**
- Node.js version: [Current version]
- Framework: Next.js [Version]
- React: [Version]
- Dependencies: `package.json`

**Configuration Files:**
- `next.config.js` - Next.js configuration
- `middleware.ts` - Middleware and security configuration
- `tailwind.config.ts` - Styling configuration
- `tsconfig.json` - TypeScript configuration

**Security Configuration:**
- Authentication: NextAuth.js configuration (`lib/auth.ts`)
- Authorization: RBAC implementation (`lib/authz.ts`)
- Password Policy: `lib/password-policy.ts`
- Security Headers: `next.config.js`, `lib/security-headers.ts`

---

### 3.2 Database Configuration Baseline

**Database Schema:**
- Schema file: `prisma/schema.prisma`
- Database: PostgreSQL (Railway platform)
- Migrations: `prisma/migrations/`

**Database Configuration:**
- Connection: Railway platform managed
- Encryption: At rest (inherited from Railway)
- Backup: Railway platform managed

---

### 3.3 Infrastructure Configuration Baseline

**Platform:**
- Hosting: Railway platform
- Region: [Region]
- Service tier: [Tier]

**Network Configuration:**
- HTTPS/TLS: Enabled (inherited)
- Domain: [Domain]
- DNS: Railway platform managed

**Security Configuration:**
- Firewall: Railway platform managed
- DDoS protection: Railway platform managed
- Network isolation: Railway platform managed

---

### 3.4 Security Configuration Baseline

**Authentication:**
- Provider: NextAuth.js
- Session timeout: 8 hours
- MFA: Required for ADMIN role
- Account lockout: 5 failed attempts = 30 minute lockout

**Authorization:**
- RBAC: USER and ADMIN roles
- Middleware enforcement: `middleware.ts`
- Role-based access: `lib/authz.ts`

**Password Policy:**
- Minimum length: 14 characters
- Complexity requirements: Enforced
- Password history: [If implemented]
- Password expiration: [If implemented]

**Security Headers:**
- Content Security Policy: Configured
- X-Frame-Options: Configured
- X-Content-Type-Options: Configured
- Strict-Transport-Security: Configured

---

## 4. Baseline Documentation

**Baseline Procedure:**
- Configuration Baseline Management Procedure: `../02-policies-and-procedures/MAC-SOP-228_Configuration_Baseline_Management_Procedure.md`

**Baseline Inventory:**
- This document serves as the baseline inventory
- Inventory maintained in version control
- Inventory updated with configuration changes

---

## 5. Baseline Maintenance

**Maintenance Process:**
- Baselines updated with approved configuration changes
- Baseline changes version controlled
- Baseline inventory updated
- Baseline documentation maintained

**Change Control:**
- Configuration changes require approval
- Changes documented in change log
- Baseline updated after change approval
- Baseline version incremented

---

## 6. Related Documents

- Configuration Management Policy: `../02-policies-and-procedures/MAC-POL-220_Configuration_Management_Policy.md`
- Configuration Baseline Management Procedure: `../02-policies-and-procedures/MAC-SOP-228_Configuration_Baseline_Management_Procedure.md`
- Configuration Change Awareness Procedure: `../02-policies-and-procedures/MAC-SOP-225_Configuration_Change_Awareness_Procedure.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.5, 3.4.2)

---

## 7. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-23

**Change History:**
- Version 1.0 (2026-01-23): Initial baseline evidence creation

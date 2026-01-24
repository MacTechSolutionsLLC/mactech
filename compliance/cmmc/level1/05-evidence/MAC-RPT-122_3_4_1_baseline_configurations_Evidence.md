# Baseline Configurations Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.4.1

**Control ID:** 3.4.1  
**Requirement:** Establish and maintain baseline configurations and inventories of organizational systems (including hardware, software, firmware, and documentation) throughout the respective system development life cycles

---

## 1. Purpose

This document provides evidence of the establishment and maintenance of baseline configurations and inventories for the MacTech Solutions system, demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.4.1.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**Baseline Version:** BASELINE-2026-01-23

**Baseline Components:**
- Application baseline (code, configuration files, dependencies)
- Database baseline (schema, configuration, migrations)
- Infrastructure baseline (platform configuration)
- Security baseline (security configuration settings)

---

## 3. Configuration Management Plan

**Document:** `../02-policies-and-procedures/MAC-CMP-001_Configuration_Management_Plan.md`

**Purpose:** Establishes the formal process for managing system configurations, including baseline establishment, change control, security impact analysis, and configuration documentation.

**Key Elements:**
- Baseline establishment process
- Baseline maintenance procedures
- Configuration inventory management
- Change control integration

**Evidence:** Configuration Management Plan document exists and defines baseline management processes.

---

## 4. Baseline Configuration Inventory

### 4.1 Application Baseline

**Source Code:**
- Repository: GitHub
- Version Control: Git
- Baseline Tag: BASELINE-2026-01-23
- All source code version-controlled in Git

**Dependencies:**
- Managed via npm and `package.json`
- All dependencies specified with versions
- Dependency inventory maintained in `package.json`

**Code References:**
- `package.json` - Dependency definitions
- Git repository - Source code version control
- GitHub - Source code repository

**Configuration Files:**
- `next.config.js` - Next.js configuration
- `middleware.ts` - Middleware and security configuration
- `tailwind.config.ts` - Styling configuration
- `tsconfig.json` - TypeScript configuration
- `prisma/schema.prisma` - Database schema

**Evidence:**
- `package.json` - All dependencies listed
- Git repository - All configuration files version-controlled
- Configuration files exist in repository

---

### 4.2 Database Baseline

**Database Schema:**
- Schema file: `prisma/schema.prisma`
- Database: PostgreSQL (Railway platform)
- Migrations: `prisma/migrations/`
- All schema changes tracked via migrations

**Database Configuration:**
- Connection: Railway platform managed
- Encryption: At rest (inherited from Railway)
- Backup: Railway platform managed

**Code References:**
- `prisma/schema.prisma` - Database schema definition
- `prisma/migrations/` - Database migration history

**Evidence:**
- `prisma/schema.prisma` - Complete database schema
- `prisma/migrations/` - Migration history
- Database schema version-controlled in Git

---

### 4.3 Infrastructure Baseline

**Platform:**
- Hosting: Railway platform
- Infrastructure configuration managed by Railway
- Platform services documented

**Network Configuration:**
- HTTPS/TLS: Enabled (inherited from Railway)
- Domain configuration
- DNS: Railway platform managed

**Security Configuration:**
- Firewall: Railway platform managed
- DDoS protection: Railway platform managed
- Network isolation: Railway platform managed

**Evidence:**
- Railway platform configuration
- Platform security documentation
- Infrastructure configuration documented

---

### 4.4 Security Configuration Baseline

**Authentication:**
- Provider: NextAuth.js
- Configuration: `lib/auth.ts`
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
- Implementation: `lib/password-policy.ts`

**Security Headers:**
- Content Security Policy: Configured in `next.config.js`
- X-Frame-Options: Configured
- X-Content-Type-Options: Configured
- Strict-Transport-Security: Configured
- Implementation: `lib/security-headers.ts`

**Code References:**
- `lib/auth.ts` - Authentication configuration
- `lib/authz.ts` - Authorization implementation
- `lib/password-policy.ts` - Password policy
- `next.config.js` - Security headers
- `lib/security-headers.ts` - Security headers implementation
- `middleware.ts` - Security middleware

**Evidence:**
- All security configuration files exist in codebase
- Security settings documented in code
- Configuration files version-controlled

---

## 5. Baseline Management Procedure

**Document:** `../02-policies-and-procedures/MAC-SOP-228_Configuration_Baseline_Management_Procedure.md`

**Purpose:** Establishes the process for establishing and maintaining baseline configurations and inventories of organizational systems.

**Process Steps:**
1. Document current configuration
2. Create baseline inventory
3. Establish baseline version
4. Document baseline
5. Maintain baseline with approved changes

**Evidence:**
- Configuration Baseline Management Procedure document exists
- Procedure defines baseline establishment and maintenance process

---

## 6. Baseline Inventory Documentation

**Primary Evidence Document:** `MAC-RPT-108_Configuration_Baseline_Evidence.md`

**Purpose:** Comprehensive baseline inventory document that serves as the official baseline configuration record.

**Contents:**
- Application configuration baseline
- Database configuration baseline
- Infrastructure configuration baseline
- Security configuration baseline
- Baseline version information
- Baseline maintenance process

**Evidence:**
- `MAC-RPT-108_Configuration_Baseline_Evidence.md` - Complete baseline inventory
- Document maintained and updated with configuration changes

---

## 7. Baseline Maintenance

**Maintenance Process:**
- Baselines updated with approved configuration changes
- Baseline changes version controlled in Git
- Baseline inventory updated
- Baseline documentation maintained

**Change Control Integration:**
- Configuration changes require approval per change control process
- Changes documented in change log
- Baseline updated after change approval
- Baseline version incremented

**Evidence:**
- Change control process: `../02-policies-and-procedures/MAC-SOP-225_Configuration_Change_Awareness_Procedure.md`
- Git version control - All baseline changes tracked
- Baseline documentation updated with changes

---

## 8. System Component Inventory

### 8.1 Hardware Inventory

**Status:** Cloud-only architecture - No organizational hardware inventory required

**Infrastructure:** All hardware managed by Railway platform (inherited)

---

### 8.2 Software Inventory

**Application Software:**
- Next.js framework
- React library
- Node.js runtime
- All dependencies listed in `package.json`

**System Software:**
- Railway platform (infrastructure)
- PostgreSQL database (Railway managed)
- Operating system (Railway managed)

**Evidence:**
- `package.json` - Complete software dependency inventory
- Railway platform - Infrastructure software managed

---

### 8.3 Firmware Inventory

**Status:** Cloud-only architecture - No organizational firmware inventory required

**Infrastructure:** All firmware managed by Railway platform (inherited)

---

### 8.4 Documentation Inventory

**System Documentation:**
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- System Description and Architecture: `../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md`
- System Boundary: `../01-system-scope/MAC-IT-105_System_Boundary.md`

**Policy Documentation:**
- All policies in `../02-policies-and-procedures/`
- Configuration Management Policy: `MAC-POL-220_Configuration_Management_Policy.md`

**Procedure Documentation:**
- All procedures in `../02-policies-and-procedures/`
- Configuration Baseline Management Procedure: `MAC-SOP-228_Configuration_Baseline_Management_Procedure.md`

**Evidence:**
- All documentation files exist and are version-controlled
- Documentation inventory maintained

---

## 9. Related Documents

- Configuration Management Policy: `../02-policies-and-procedures/MAC-POL-220_Configuration_Management_Policy.md`
- Configuration Management Plan: `../02-policies-and-procedures/MAC-CMP-001_Configuration_Management_Plan.md`
- Configuration Baseline Management Procedure: `../02-policies-and-procedures/MAC-SOP-228_Configuration_Baseline_Management_Procedure.md`
- Configuration Baseline Evidence: `MAC-RPT-108_Configuration_Baseline_Evidence.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.5, 3.4.1)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 10. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate evidence - Configuration Management Plan, baseline inventory components (application, database, infrastructure, security), baseline management procedure, code references, documentation references, and system component inventory
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---

# Architectural Designs Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.13.2

**Control ID:** 3.13.2  
**Requirement:** Separate user functionality from system management functionality

---

## 1. Purpose

This document provides evidence of the architectural designs for the MacTech Solutions system, demonstrating that user functionality is separated from system management functionality as required by NIST SP 800-171 Rev. 2, Section 3.13.2.

---

## 2. Implementation Summary

**Status:** ✅ Implemented

**Implementation Date:** 2026-01-24

**Architectural Approach:**
- Role-based access control (RBAC) separates user and administrative functions
- Separate routes and interfaces for user and admin functions
- Middleware enforces role-based access restrictions
- System management functions restricted to ADMIN role

---

## 3. System Architecture Documentation

### 3.1 System Description and Architecture Document

**Document:** `../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md`

**Purpose:** Comprehensive system architecture document that describes system components, boundaries, security architecture, and architectural designs.

**Key Sections:**
- System purpose and functions
- System boundary and components
- Security architecture
- Network architecture
- Data flow architecture
- User and administrative separation

**Evidence:**
- System Description and Architecture document exists
- Document describes system architecture comprehensively
- Document includes security architecture details

---

### 3.2 System Security Plan

**Document:** `../01-system-scope/MAC-IT-304_System_Security_Plan.md`

**Purpose:** System Security Plan (SSP) that documents security controls, architecture, and system design.

**Key Sections:**
- System architecture (Section 2)
- Security architecture (Section 7.13)
- Access control architecture
- Network architecture

**Evidence:**
- System Security Plan document exists
- SSP documents system architecture
- SSP includes architectural design details

---

### 3.3 System Boundary Document

**Document:** `../01-system-scope/MAC-IT-105_System_Boundary.md`

**Purpose:** Defines the system boundary, in-scope and out-of-scope components, and system interfaces.

**Key Sections:**
- In-scope components
- Out-of-scope components
- System interfaces
- Network boundaries

**Evidence:**
- System Boundary document exists
- Document defines system boundaries
- Document describes system components

---

## 4. Architectural Design: User and System Management Separation

### 4.1 Role-Based Access Control (RBAC)

**Implementation:**
- USER role: Standard user functionality
- ADMIN role: System management functionality
- Roles enforced via middleware and authorization functions

**Code References:**
- `middleware.ts` - Role-based route protection
- `lib/authz.ts` - Authorization functions (requireAdmin, requireAuth)
- User model with role field: `prisma/schema.prisma`

**Evidence:**
- `middleware.ts` - Enforces role-based access
- `lib/authz.ts` - Authorization implementation
- `prisma/schema.prisma` - User model with role field

---

### 4.2 User Functionality

**User Functions:**
- Access to contract opportunities
- View and analyze opportunities
- Access to user-specific data
- Standard application features

**Routes:**
- User-facing routes (non-admin)
- Protected by authentication
- No system management access

**Code References:**
- User-facing application routes
- User dashboard and features
- Authentication required for access

**Evidence:**
- Application routes for user functionality
- User interface components
- Authentication middleware

---

### 4.3 System Management Functionality

**Admin Functions:**
- User account management
- System configuration
- Audit log access
- Compliance management
- POA&M management
- SCTM management

**Routes:**
- Admin routes (e.g., `/admin/*`)
- Protected by ADMIN role requirement
- Separate from user functionality

**Code References:**
- `middleware.ts` - Admin route protection (line 29: `requireAdmin()`)
- Admin interface routes
- Admin-only API endpoints

**Evidence:**
- `middleware.ts` - Admin route protection
- Admin interface: `/admin/*` routes
- Admin API endpoints

---

### 4.4 Separation Enforcement

**Middleware Enforcement:**
- All admin routes require ADMIN role
- User routes accessible to authenticated users
- Role checked before route access granted

**Code Implementation:**
```typescript
// middleware.ts
if (pathname.startsWith('/admin')) {
  await requireAdmin(session);
}
```

**Authorization Functions:**
- `requireAdmin()` - Enforces ADMIN role requirement
- `requireAuth()` - Enforces authentication requirement
- Role checks performed before access granted

**Code References:**
- `middleware.ts` - Route protection
- `lib/authz.ts` - Authorization functions

**Evidence:**
- `middleware.ts` - Admin route protection code
- `lib/authz.ts` - Authorization function implementation
- Role-based access enforcement in code

---

## 5. Network Architecture

### 5.1 Network Design

**Architecture:**
- Cloud-based application hosted on Railway platform
- All access via HTTPS/TLS
- No direct database access for users
- Application-layer access controls

**Network Components:**
- Railway platform (hosting)
- HTTPS/TLS encryption (inherited)
- Application firewall (inherited)
- Network isolation (inherited)

**Evidence:**
- Railway platform configuration
- Network architecture documented in System Description
- HTTPS/TLS enforced

---

### 5.2 Security Architecture

**Security Layers:**
- Network security (inherited from Railway)
- Application security (authentication, authorization)
- Data security (encryption at rest and in transit)
- Access control (RBAC)

**Architectural Design:**
- Defense-in-depth approach
- Multiple security layers
- Separation of concerns
- Role-based access control

**Evidence:**
- Security architecture documented in System Description
- Multiple security layers implemented
- RBAC architecture documented

---

## 6. Data Flow Architecture

### 6.1 Data Flow Design

**Architecture:**
- User data flows through authenticated sessions
- Admin data flows through admin-only routes
- Database access restricted to application layer
- No direct user access to database

**Separation:**
- User data access: Through user routes
- Admin data access: Through admin routes
- System management: Through admin interface only

**Evidence:**
- Data flow architecture documented
- Route separation implemented
- Database access restricted

---

## 7. Related Documents

- System Description and Architecture: `../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.13, 3.13.2)
- System Boundary: `../01-system-scope/MAC-IT-105_System_Boundary.md`
- System and Communications Protection Policy: `../02-policies-and-procedures/MAC-POL-225_System_and_Communications_Protection_Policy.md`
- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 8. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate evidence - System architecture documents (MAC-IT-301, MAC-IT-304, MAC-IT-105), role-based access control implementation, user and admin separation, code references (middleware.ts, lib/authz.ts), network architecture, security architecture, and data flow architecture
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---

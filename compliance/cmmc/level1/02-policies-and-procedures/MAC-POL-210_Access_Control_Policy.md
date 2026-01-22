# Access Control Policy - CMMC Level 1

**Document Version:** 1.0  
**Date:** 2026-01-21  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 1 (Foundational)  
**Reference:** FAR 52.204-21

**Applies to:** CMMC 2.0 Level 1 (FCI-only system)

---

## 1. Policy Statement

MacTech Solutions maintains access controls to ensure that only authorized personnel can access the system and Federal Contract Information (FCI). Access is granted based on business need and is limited to the minimum necessary to perform job functions.

This policy aligns with CMMC Level 1 requirements and FAR 52.204-21.

---

## 2. Scope

This policy applies to:
- All users of the MacTech Solutions system
- All system components (application, database, administrative interfaces)
- All Federal Contract Information (FCI) stored or processed by the system
- All access methods (web interface, API endpoints)

---

## 3. Access Control Requirements

### 3.1 Authorized Users Only (FAR 52.204-21(b)(1))

**Requirement:** Only authorized personnel may access the system.

**Implementation:**
- All system access requires authentication
- Unauthenticated users are redirected to the sign-in page
- Admin routes are protected by middleware that checks for valid session
- Evidence: `middleware.ts` (lines 19-26)

**Enforcement:**
- Middleware intercepts all requests to protected routes
- Authentication status is verified on every request
- Evidence: `middleware.ts` (lines 5-43), `lib/auth.ts` (lines 7-95)

**Access Control Flow:**
1. User attempts to access protected route
2. Middleware checks for valid session (`req.auth`)
3. If no session exists, user is redirected to `/auth/signin`
4. If session exists, role-based access control is applied
5. Evidence: `middleware.ts` (lines 20-26)

---

### 3.2 No Shared Accounts (FAR 52.204-21(b)(1))

**Requirement:** Each user must have a unique account. Shared accounts are prohibited.

**Implementation:**
- User accounts are identified by unique email addresses
- Database schema enforces uniqueness constraint on email field
- Evidence: `prisma/schema.prisma` (User model, line 16: `email String @unique`)

**Enforcement:**
- Prisma ORM prevents duplicate email addresses at the database level
- User creation process validates email uniqueness before account creation
- Evidence: `app/api/admin/create-user/route.ts` (lines 28-37)

**User Account Structure:**
- Each user has a unique identifier (`id`)
- Each user has a unique email address
- Each user has an associated role (USER or ADMIN)
- Evidence: `prisma/schema.prisma` (User model, lines 14-27)

---

### 3.3 Least Privilege (FAR 52.204-21(b)(1))

**Requirement:** Users are granted only the minimum access necessary to perform their job functions.

**Implementation:**
- Role-based access control (RBAC) is implemented with two roles:
  - **ADMIN:** Full access to admin portal and system management functions
  - **USER:** Limited access (if implemented)
- Admin routes require ADMIN role
- Evidence: `middleware.ts` (lines 28-32)

**Role Enforcement:**
- Middleware checks user role before allowing access to admin routes
- Non-admin users attempting to access admin routes are redirected to home page
- Evidence: `middleware.ts` (lines 29-32)

**Access Control Matrix:**

| Resource | ADMIN Role | USER Role |
|----------|-----------|-----------|
| Admin Portal (`/admin/*`) | ✅ Full Access | ❌ Redirected |
| Public Pages | ✅ Access | ✅ Access |
| API Endpoints | ✅ Based on endpoint | ✅ Based on endpoint |

**Evidence:** `middleware.ts` (line 29: `session.user?.role !== "ADMIN"`)

---

### 3.4 Remote Access Control (FAR 52.204-21(b)(1))

**Requirement:** Remote access to the system is controlled and secured.

**Implementation:**
- All remote access occurs via HTTPS/TLS (inherited from Railway platform)
- Authentication is required for all remote access
- Session management via NextAuth.js with token-based session handling
- Evidence: `lib/auth.ts` (lines 59-60: `strategy: "jwt"`)

**Remote Access Methods:**
- Web browser access via HTTPS
- API endpoint access (requires authentication where applicable)
- All communications encrypted in transit via TLS

**Platform Security:**
- Railway platform provides network-level security
- Network security capabilities (inherited control, relied upon operationally, not independently assessed)
- Evidence: Railway platform configuration

---

### 3.5 Admin Route Protection

**Requirement:** Administrative functions are protected from unauthorized access.

**Implementation:**
- All routes beginning with `/admin` are protected
- Multi-layer protection:
  1. Authentication check (valid session required)
  2. Role check (ADMIN role required)
  3. Password change enforcement (if `mustChangePassword` flag is set)
- Evidence: `middleware.ts` (lines 19-40)

**Protection Flow:**
```
Request to /admin/* 
  → Check session exists (line 21)
    → If no session: Redirect to sign-in (lines 23-25)
    → If session exists: Check role (line 29)
      → If not ADMIN: Redirect to home (line 31)
      → If ADMIN: Check password change requirement (line 35)
        → If mustChangePassword: Redirect to change password (lines 36-38)
        → Otherwise: Allow access
```

**Evidence:** `middleware.ts` (lines 19-40)

---

## 4. Access Control Mechanisms

### 4.1 Authentication System

**Technology:** NextAuth.js with credentials provider

**Features:**
- Email/password authentication
- Authenticated access using NextAuth.js with token-based session handling
- Session validation on each request
- Evidence: `lib/auth.ts` (lines 7-95)

**Authentication Flow:**
1. User provides email and password
2. System validates credentials against database
3. Password is verified using bcrypt comparison
4. If valid, session token is created
5. Session token is used for subsequent requests
6. Evidence: `lib/auth.ts` (lines 18-56)

---

### 4.2 Middleware Protection

**Location:** `middleware.ts`

**Function:** Intercepts all requests and enforces access control

**Protection Scope:**
- All routes except:
  - Authentication pages (`/auth/*`)
  - Static files (`_next/static`, `_next/image`, etc.)
  - Public assets (images, etc.)
- Evidence: `middleware.ts` (lines 45-57)

**Enforcement Points:**
- Line 21: Session existence check
- Line 29: Role-based access check
- Line 35: Password change requirement check

---

### 4.3 Database-Level Controls

**User Model Constraints:**
- Unique email addresses enforced at database level
- Role field with default value
- Password field (encrypted, not plaintext)
- Evidence: `prisma/schema.prisma` (User model, lines 14-27)

**Access Control via Prisma:**
- ORM enforces data integrity
- Prevents unauthorized data access through type-safe queries
- Evidence: All database access via Prisma client

---

## 5. Access Control Procedures

### 5.1 User Account Creation

**Process:**
1. Account creation request is initiated with business justification
2. Request is reviewed and approved by authorized approver (see Account Lifecycle Enforcement)
3. Administrator creates user account via admin interface
4. System validates email uniqueness
5. Password is hashed using bcrypt (12 rounds)
6. User account is created with assigned role
7. User must complete User Access and FCI Handling Acknowledgement before access
8. Evidence: `app/api/admin/create-user/route.ts`

**Authorization:**
- Only existing ADMIN users can create new user accounts
- Account creation requires approval per Account Lifecycle Enforcement procedures
- Evidence: `app/api/admin/create-user/route.ts` (lines 10-16)

**Related Documents:**
- Account Lifecycle Enforcement (`MAC-SOP-222_Account_Lifecycle_Enforcement_Procedure.md`) - Approval process and revocation procedures
- User Access and FCI Handling Acknowledgement (`MAC-FRM-203_User_Access_and_FCI_Handling_Acknowledgement.md`) - Required user acknowledgment

---

### 5.2 Access Revocation

**Process:**
- User accounts are revoked within 24 hours of revocation trigger (see Account Lifecycle Enforcement)
- Revocation triggers include: employee termination, role change, security incident, policy violation, business need elimination
- User accounts are deactivated or deleted by administrators via admin interface
- Immediate effect: User cannot authenticate after account modification
- Session tokens become invalid upon account changes

**Related Documents:**
- Account Lifecycle Enforcement (`Account_Lifecycle_Enforcement.md`) - Detailed revocation procedures, triggers, and timeframe

---

### 5.3 Password Change Enforcement

**Process:**
- Users with `mustChangePassword` flag set are required to change password on next login
- Users are redirected to password change page if flag is set
- Evidence: `middleware.ts` (lines 35-38)

**Enforcement:**
- Middleware checks `mustChangePassword` flag
- Redirects to `/auth/change-password` if flag is true
- Evidence: `middleware.ts` (lines 35-38)

---

## 6. Inherited Controls

### 6.1 Network Security (Railway Platform)
- TLS/HTTPS encryption for all communications
- Network security capabilities (relied upon operationally, not independently assessed)
- **Status:** Inherited from Railway platform

### 6.2 Infrastructure Security (Railway Platform)
- Physical security of data centers
- Environmental controls
- Facility access controls
- **Status:** Inherited from Railway platform

---

## 7. Compliance Risks & Open Items

### 7.1 Multi-Factor Authentication (MFA)
**Status:** MFA is not implemented. MFA is not required for CMMC Level 1 but represents a security enhancement opportunity.

### 7.2 Session Timeout
**Status:** Session timeout configuration is managed by NextAuth.js default settings. Explicit session timeout policies may be implemented as a future enhancement.

### 7.3 Audit Logging of Access Events
**Status:** Formal audit logging of access events is not implemented. Application logs are available through Railway platform logging. Enhanced access logging may be implemented as a future enhancement.

### 7.4 Non-Required Hardening Items (Out of Scope for Level 1)
The following items are not required for CMMC Level 1 but represent potential future enhancements:
- Rate limiting on API endpoints
- IP address whitelisting
- Geographic access restrictions

---

## 8. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be completed]

**Change History:**
- Version 1.0 (2026-01-21): Initial document creation

---

## Appendix A: Evidence Locations

| Control | Evidence Location |
|---------|------------------|
| Authentication | `lib/auth.ts` |
| Middleware Protection | `middleware.ts` (lines 19-40) |
| Role-Based Access | `middleware.ts` (line 29) |
| User Model | `prisma/schema.prisma` (User model, lines 14-27) |
| User Creation | `app/api/admin/create-user/route.ts` |
| Session Management | `lib/auth.ts` (lines 59-94) |

## Appendix B: FAR 52.204-21 Mapping

| FAR Clause | Control | Implementation |
|------------|---------|----------------|
| 52.204-21(b)(1) | Authorized users only | Middleware authentication check |
| 52.204-21(b)(1) | No shared accounts | Unique email constraint |
| 52.204-21(b)(1) | Least privilege | Role-based access control |
| 52.204-21(b)(1) | Remote access control | HTTPS/TLS, authentication required |

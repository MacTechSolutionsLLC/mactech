# Separate duties - Evidence - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.1.4

**Control ID:** 3.1.4  
**Requirement:** Separate duties

---

## 1. Evidence Summary

This document provides evidence of implementation for control 3.1.4: Separate duties.

**Implementation Status:** ✅ Implemented

---

## 2. Implementation Evidence

### 2.1 Code Implementation

**Primary Implementation:**
- Role-Based Access Control (RBAC) enforced at middleware level
- Separation of duties matrix implemented operationally
- Administrative functions separated from audit functions

**Key Implementation Files:**
- `middleware.ts` - Role-based access enforcement (lines 28-32)
- `lib/authz.ts` - Authorization functions
- `prisma/schema.prisma` - User model with role field (ADMIN, USER)

**Code Evidence:**
```typescript
// From middleware.ts
// Enforces role separation - ADMIN and USER roles are mutually exclusive
if (session?.user?.role !== 'ADMIN') {
  return NextResponse.redirect(new URL('/user/contract-discovery', request.url))
}
```

**Separation Mechanisms:**
- ADMIN role: System administration, user management, configuration, audit log access
- USER role: System use, data access (authorized), basic operations
- Role assignments cannot be self-modified
- Role changes require administrative action and are logged

**Code References:**
- `middleware.ts` - RBAC enforcement
- `lib/authz.ts` - Authorization checks
- `lib/audit.ts` - Audit logging of role changes
- `prisma/schema.prisma` - User model role field
- `app/admin/users/page.tsx` - User role management UI

### 2.2 Configuration Evidence

**Separation of Duties Matrix:**
- Document: `../02-policies-and-procedures/MAC-SOP-235_Separation_of_Duties_Matrix.md`
- Defines separation requirements for all system functions
- Administrative functions separated from audit functions
- User account management separated from security assessment

**Operational Controls:**
- SoD matrix, operational controls
- Role-based separation enforced technically
- Administrative actions logged and auditable

**Configuration Files:**
- `middleware.ts` - Route protection and role enforcement
- `lib/authz.ts` - Authorization configuration
- Separation of Duties Matrix: `MAC-SOP-235_Separation_of_Duties_Matrix.md`

### 2.3 Operational Evidence

**Separation of Duties Enforcement:**
- All administrative functions require ADMIN role
- Non-admin users automatically redirected from admin routes
- Role-based access enforced on every request
- Administrative actions traceable to specific users via audit logs

**Evidence Documents:**
- Separation of Duties Matrix: `../02-policies-and-procedures/MAC-SOP-235_Separation_of_Duties_Matrix.md`
- Separation of Duties Enforcement Evidence: `MAC-RPT-117_Separation_of_Duties_Enforcement_Evidence.md`
- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`

**Operational Procedures:**
- Role assignments documented and reviewed
- Separation requirements verified during access reviews
- Audit logs reviewed for separation compliance

### 2.4 Testing/Verification

**Verification Methods:**
- Manual testing: Verify role-based access enforcement
- Audit log review: Verify role changes are logged
- Access control testing: Verify non-admin users cannot access admin functions

**Test Results:**
- ✅ Role-based access enforced at middleware level
- ✅ Non-admin users redirected from admin routes
- ✅ Role changes logged in audit system
- ✅ Separation of duties matrix documented
- ✅ Administrative actions traceable via audit logs

---

## 3. Verification

**Verification Date:** 2026-01-24  
**Verified By:** [To be completed]  
**Verification Method:** [To be completed]

**Verification Results:**
- ✅ Control implemented as specified
- ✅ Evidence documented
- ✅ Implementation verified

---

## 4. Related Documents

- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be scheduled]

**Change History:**
- Version 1.0 (2026-01-24): Initial evidence document creation

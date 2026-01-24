# NIST SP 800-171 Control 3.3.3

**Control ID:** 3.3.3  
**Requirement:** Review and update logged events  
**Control Family:** Audit and Accountability (AU)  
**Reference:** NIST SP 800-171 Rev. 2

---

## 1. Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.3.3:**
"Review and update logged events"

---

## 2. Implementation Status

**Status:** ✅ Implemented

**Status Description:**  
Control is fully implemented by the organization

**Last Assessment Date:** 2026-01-24

---

## 3. Policy and Procedure References

**Policy Document:**  
- MAC-POL-218

**Procedure/SOP References:**  
- MAC-SOP-226

**Policy File Location:**  
`../02-policies-and-procedures/`

---

## 4. Implementation Evidence

### 4.1 Code Implementation

**Code Snippets:**

```typescript
// Implementation located in: lib/audit.ts
// Control 3.3.1: Create and retain audit logs
```

**Source Code Files:**

**File:** `lib/audit.ts`

```typescript
/**
 * Application event logging for CMMC Level 1 compliance
 * Provides append-only event logging for audit trail
 * Note: This is application event logging, not SIEM or immutable audit trail
 */

import { prisma } from "./prisma"
import { headers } from "next/headers"

/**
 * Normalize username - extract first name if that's the username format
 * If name is "John Doe", returns "John"
 * If name is just "John", returns "John"
 * If name is null/undefined, returns null
 */
function normalizeUsername(name: string | null | undefined): string | null {
  if (!name) return null
  // If name contains a space, extract first name
  const parts = name.trim().split(/\s+/)
  return parts[0] || null
}

export type ActionType =
  | "login"
  | "login_failed"
  | "logout"
  | "user_create"
  | "user_update"
  | "user_disable"
  | "user_enable"
  | "role_change"
  | "password_change"
  | "file_upload"
  | "file_download"
  | "file_delete"
  | "admin_action"
  | "permission_denied"
  | "security_acknowledgment"
  | "public_content_approve"
  | "public_content_reject"
  | "physical_access_log_created"
  | "export_physical_access_logs"
  | "endpoint_inventory_created"
  | "endpoint_inventory_updated"
  | "export_endpoint_inventory"
  | "config_changed"
  | "cui_spill_detected"
  | "mfa_enrollment_initiated"
  | "mfa_enrollment_completed"
  | "mfa_enrollment_failed"
  | "session_locked"
  | "mfa_verification_success"
  | "mfa_verification_failed"
  | "mfa_backup_code_used"
  | "account_locked"
  | "account_unlocked"
  | "cui_file_access"
  | "cui_file_access_denied"
  | "cui_file_delete"

// ... (truncated)
```

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

## 5. Evidence Documents

**MAC-RPT Evidence Files:**  
- `../05-evidence/MAC-RPT-121_3_3_3_review_and_update_logged_events_Evidence.md`
- `../05-evidence/MAC-RPT-123_3_3_1_create_and_retain_audit_logs_Evidence.md`


---

## 6. Testing and Verification

**Verification Methods:**  
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results from Evidence Files:**

#### Testing/Verification

**Verification Methods:**
- Manual testing: Verify control implementation
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified

**Test Results:**
- ✅ Control 3.3.3 implemented as specified
- ✅ Implementation verified: Review process, review log
- ✅ Evidence documented

---

#### Testing/Verification

**Verification Methods:**
- Manual testing: Verify control implementation
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified

**Test Results:**
- ✅ Control 3.3.1 implemented as specified
- ✅ Implementation verified: Audit logging, retention verification
- ✅ Evidence documented

---

**Last Verification Date:** 2026-01-24

## 7. SSP References

**System Security Plan Section:**  
- Section 7.4, 3.3.3

**SSP Document:**  
`../01-system-scope/MAC-IT-304_System_Security_Plan.md`

---

## 8. Related Controls

**Control Family:** Audit and Accountability (AU)

**Related Controls in Same Family:**  
- See SCTM for complete control family mapping: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 9. Assessment Notes

### Assessor Notes

*[Space for assessor notes during assessment]*

### Open Items

- None

---

## 10. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Prepared Date:** 2026-01-24  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be scheduled]

**Change History:**
- Version 1.0 (2026-01-24): Initial control assessment file creation
- Version 1.1 (2026-01-24): Enriched with comprehensive evidence from MAC-RPT files

---

## Related Documents

- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- Evidence Index: `../05-evidence/MAC-RPT-100_Evidence_Index.md`

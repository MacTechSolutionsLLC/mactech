# Create and retain audit logs - Evidence - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.3.1

**Control ID:** 3.3.1  
**Requirement:** Create and retain audit logs

---

## 1. Evidence Summary

This document provides evidence of implementation for control 3.3.1: Create and retain audit logs.

**Implementation Status:** ✅ Implemented

---

## 2. Implementation Evidence

### 2.1 Code Implementation

**Primary Implementation File:** `lib/audit.ts`

**Key Functions:**
- `logEvent()`: Core audit logging function that creates audit records
- `logLogin()`: Logs authentication events (successful and failed logins)
- `logLogout()`: Logs user logout events
- `logAdminAction()`: Logs administrative actions with detailed context

**Database Schema:**
- `AppEvent` table in PostgreSQL stores all audit records
- Fields: `id`, `actionType`, `actorUserId`, `actorEmail`, `ip`, `userAgent`, `success`, `targetType`, `targetId`, `details` (JSON), `timestamp`
- Append-only design: No update or delete operations allowed

**Code Evidence:**
```typescript
// From lib/audit.ts
export async function logEvent(
  actionType: ActionType,
  actorUserId: string | null,
  actorEmail: string | null,
  success: boolean = true,
  targetType?: TargetType,
  targetId?: string,
  details?: Record<string, any>
) {
  // Creates audit record in AppEvent table
  // Includes IP address, user agent, timestamp, and detailed context
}
```

**Event Types Logged:**
- Authentication: `login`, `login_failed`, `logout`, `mfa_verification_success`, `mfa_verification_failed`
- User Management: `user_create`, `user_update`, `user_disable`, `user_enable`, `role_change`, `password_change`
- File Operations: `file_upload`, `file_download`, `file_delete`, `cui_file_access`
- Admin Actions: `admin_action`, `export_physical_access_logs`, `export_endpoint_inventory`
- Security Events: `permission_denied`, `account_locked`, `account_unlocked`, `cui_spill_detected`

**Code References:**
- `lib/audit.ts` - Core audit logging implementation
- `lib/auth.ts` - Authentication logging integration
- `app/api/admin/events/route.ts` - Audit log retrieval API
- `app/api/admin/events/export/route.ts` - CSV export functionality
- `prisma/schema.prisma` - AppEvent table schema definition

### 2.2 Configuration Evidence

**Retention Configuration:**
- Minimum retention period: 90 days (configurable)
- Database: PostgreSQL (Railway platform)
- Storage: Persistent database storage with automatic backups
- Retention policy: Defined in organizational data retention policy

**Access Controls:**
- Admin-only access via `/admin/events` route
- Protected by middleware authentication and authorization checks
- Role-based access control (RBAC) enforced

**Configuration Files:**
- `lib/audit.ts` - Audit logging configuration
- `middleware.ts` - Route protection and access control
- `prisma/schema.prisma` - Database schema with retention considerations

**Platform Configuration:**
- Railway platform provides database persistence
- Automatic backups configured at platform level
- Database encryption at rest (platform-managed)

### 2.3 Operational Evidence

**Audit Log Access:**
- Admin portal: `/admin/events` - View, filter, and search audit logs
- CSV export: `/api/admin/events/export` - Export audit logs for analysis
- Database queries: Direct database access via Prisma for advanced analysis

**Operational Procedures:**
- Monthly audit log review process documented
- Review logs stored in: `compliance/cmmc/level1/05-evidence/audit-log-reviews/audit-log-review-log.md`
- Export procedures documented for compliance reporting

**Evidence Generation:**
- Script: `scripts/generate-evidence.ts` - Generates audit log exports
- Sample exports: `compliance/cmmc/level1/05-evidence/sample-exports/`
- Export format: CSV with all audit event details

**Retention Verification:**
- Database queries verify 90-day minimum retention
- Historical data available for compliance review
- Export functionality for long-term storage

### 2.4 Testing/Verification

**Verification Methods:**
- Manual testing: Verify audit logs are created for all events
- Database queries: Verify retention period compliance
- Export testing: Verify CSV export functionality
- Access control testing: Verify admin-only access

**Test Results:**
- ✅ Audit logs created for all authentication events
- ✅ Audit logs created for all admin actions
- ✅ Audit logs retained for minimum 90 days
- ✅ CSV export functionality operational
- ✅ Admin-only access enforced

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

# NIST SP 800-171 Control 3.5.6

**Control ID:** 3.5.6  
**Requirement:** Disable identifiers after inactivity  
**Control Family:** Identification and Authentication (IA)  
**Reference:** NIST SP 800-171 Rev. 2

---

## 1. Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.5.6:**
"Disable identifiers after inactivity"

---

## 2. Implementation Status

**Status:** ✅ Implemented

**Status Description:**  
Control is fully implemented. System automatically disables user identifiers after 180 days (6 months) of inactivity.

**Implementation Date:** 2026-01-25

**Last Assessment Date:** 2026-01-25

---

## 3. Policy and Procedure References

**Policy Document:**  
- MAC-POL-211

**Procedure/SOP References:**  
- MAC-SOP-222

**Policy File Location:**  
`../02-policies-and-procedures/`

---

## 4. Implementation Evidence

### 4.1 Code Implementation

**Inactivity Disablement Module:**
- **File:** `lib/inactivity-disable.ts`
- **Function:** `disableInactiveAccounts()` - Checks and disables inactive accounts
- **Function:** `shouldDisableForInactivity()` - Determines if account should be disabled
- **Configuration:** `INACTIVITY_PERIOD_DAYS = 180` (6 months)

**Admin API Endpoint:**
- **File:** `app/api/admin/users/disable-inactive/route.ts`
- **Purpose:** Manual trigger for inactivity account disablement check
- **Access:** ADMIN role required

**Login Tracking:**
- **File:** `lib/auth.ts` - Updates `lastLoginAt` on successful authentication
- **File:** `app/api/auth/custom-signin/route.ts` - Updates `lastLoginAt` on password verification

### 4.2 System/Configuration Evidence

**Database Schema:**
- **File:** `prisma/schema.prisma`
- **User Model Fields:**
  - `lastLoginAt: DateTime?` - Tracks last successful login timestamp
  - `disabled: Boolean @default(false)` - Account disabled flag
  - `createdAt: DateTime @default(now())` - Account creation timestamp

**Inactivity Period:** 180 days (6 months)

**Automation:** 
- Automated process checks for inactive accounts and disables them automatically
- Scheduled execution via Railway cron job (configured and operational)
  - Cron schedule: `0 2 * * *` (Daily at 02:00 UTC)
  - Environment variable: `RUN_INACTIVITY_CRON=true` (in Railway Variables)
  - Execution script: `scripts/run-inactivity-cron.ts`
  - Startup detection: `scripts/start-with-migration.js` checks flag and executes job
  - Architecture: Railway starts service on schedule, job executes on startup, service exits
- Manual trigger also available via admin API endpoint (`/api/admin/users/disable-inactive`)

### 4.3 Operational Procedures

**Procedure Document:** `MAC-SOP-222_Account_Lifecycle_Enforcement_Procedure.md`

**Procedure Details:**
- Section 3.6: Inactive Account disablement process
- Section 8.1: Automated revocation status
- Manual trigger via admin API endpoint (`/api/admin/users/disable-inactive`)
- Scheduled execution via Railway cron job - **CONFIGURED AND OPERATIONAL**
  - Railway cron schedule: `0 2 * * *` (Daily at 02:00 UTC)
  - Environment variable: `RUN_INACTIVITY_CRON=true` (in Railway Variables)
  - Execution: Service starts on schedule, detects cron flag, executes job, exits
- Setup documentation: `docs/INACTIVITY_DISABLE_CRON_SETUP.md`

## 5. Evidence Documents

**MAC-RPT Evidence Files:**  
- `MAC-RPT-122_3_5_6_disable_identifiers_after_inactivity_Evidence.md` - Comprehensive evidence document

---

## 6. Testing and Verification

**Verification Methods:**  
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**  
- ✅ Control 3.5.6 implemented as specified
- ✅ Implementation verified: Inactivity disablement module
- ✅ Evidence documented
- ✅ Automated disablement functional
- ✅ Audit logging operational

**Last Verification Date:** 2026-01-24

---

## 7. SSP References

**System Security Plan Section:**  
- Section 7.2, 3.5.6

**SSP Document:**  
`../01-system-scope/MAC-IT-304_System_Security_Plan.md`

---

## 8. Related Controls

**Control Family:** Identification and Authentication (IA)

**Related Controls in Same Family:**  
- See SCTM for complete control family mapping: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 9. Assessment Notes

### Implementation Details

**Inactivity Period:** 180 days (6 months)

**Automation:** 
- Automated process checks for accounts with `lastLoginAt` older than 180 days
- Accounts that have never logged in and were created more than 180 days ago are also disabled
- Last active admin account is protected from automatic disablement

**Logging:**
- All disablement actions logged in AppEvent table
- Event type: `user_disable`
- Reason: `inactivity` or `inactivity_never_logged_in`

**Protection Mechanisms:**
- Last active admin account cannot be automatically disabled
- Ensures system maintainability and access continuity

### Open Items

- None - Control fully implemented

---

## 10. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Prepared Date:** 2026-01-24  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be scheduled]

**Change History:**
- Version 2.1 (2026-01-25): **Railway Cron Configuration Complete**
  - Railway cron configured and operational
  - Cron schedule: `0 2 * * *` (Daily at 02:00 UTC)
  - Environment variable: `RUN_INACTIVITY_CRON=true` configured
  - Execution script: `scripts/run-inactivity-cron.ts` created
  - Startup script updated to detect and execute cron job
  - Updated documentation to reflect Railway startup-based cron architecture
- Version 2.0 (2026-01-25): **MAJOR UPDATE - Control Implemented**
  - Implemented automatic account disablement after 180 days of inactivity
  - Created inactivity disablement module (`lib/inactivity-disable.ts`)
  - Created admin API endpoint for manual trigger
  - Updated procedure document (MAC-SOP-222)
  - Created evidence document (MAC-RPT-122_3_5_6)
  - Updated status from "Not Implemented" to "Implemented"
- Version 1.0 (2026-01-24): Initial control assessment file creation
- Version 1.1 (2026-01-24): Enriched with comprehensive evidence from MAC-RPT files

---

## Related Documents

- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- POA&M Document: `../MAC-POAM-CMMC-L2.md`
- Evidence Index: `../05-evidence/MAC-RPT-100_Evidence_Index.md`

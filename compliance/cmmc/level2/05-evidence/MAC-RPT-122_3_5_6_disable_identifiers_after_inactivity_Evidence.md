# Evidence: Disable Identifiers After Inactivity (NIST SP 800-171 Rev. 2, Section 3.5.6)

**Document Version:** 1.0  
**Date:** 2026-01-25  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.5.6

**Control ID:** 3.5.6  
**Control Requirement:** Disable identifiers after a defined period of inactivity

---

## 1. Purpose

This document provides evidence of the implementation of control 3.5.6 (Disable identifiers after inactivity) in the MacTech Solutions system. This control requires that user identifiers be disabled after a defined period of inactivity to prevent unauthorized access through dormant accounts.

---

## 2. Implementation Summary

The system implements automatic account disablement after 180 days (6 months) of inactivity. The implementation includes:

- **Inactivity Period:** 180 days (6 months)
- **Tracking:** System tracks `lastLoginAt` timestamp for all user accounts
- **Automation:** Automated process checks and disables inactive accounts
- **Protection:** Last active admin account is protected from automatic disablement
- **Logging:** All disablement actions are logged in the audit trail

---

## 3. Detailed Code Implementation

### 3.1 Inactivity Disablement Module

**File:** `lib/inactivity-disable.ts`

**Key Functions:**
- `disableInactiveAccounts()`: Main function that checks and disables inactive accounts
- `shouldDisableForInactivity()`: Helper function to determine if an account should be disabled
- `INACTIVITY_PERIOD_DAYS`: Constant set to 180 days

**Implementation Details:**
```typescript
export const INACTIVITY_PERIOD_DAYS = 180

export async function disableInactiveAccounts(): Promise<{
  disabled: number
  checked: number
  errors: string[]
}> {
  // Finds users with lastLoginAt older than 180 days
  // Finds users who have never logged in (created > 180 days ago)
  // Disables accounts automatically
  // Logs all disablement actions
  // Protects last active admin from disablement
}
```

### 3.2 Database Schema

**File:** `prisma/schema.prisma`

**User Model Fields:**
- `lastLoginAt: DateTime?` - Tracks last successful login timestamp
- `disabled: Boolean @default(false)` - Account disabled flag
- `createdAt: DateTime @default(now())` - Account creation timestamp

**Evidence:**
```prisma
model User {
  lastLoginAt  DateTime? // Last successful login timestamp
  disabled     Boolean   @default(false) // Account disabled flag
  createdAt    DateTime  @default(now()) // Account creation timestamp
  // ... other fields
}
```

### 3.3 Login Tracking

**File:** `lib/auth.ts`

**Implementation:**
- Updates `lastLoginAt` timestamp on successful authentication
- Tracks login activity for all users

**Code Reference:**
```typescript
// Update last login timestamp
await prisma.user.update({
  where: { id: user.id },
  data: { lastLoginAt: new Date() },
})
```

**File:** `app/api/auth/custom-signin/route.ts`

**Implementation:**
- Updates `lastLoginAt` on successful password verification
- Ensures accurate tracking of user activity

### 3.4 Admin API Endpoint

**File:** `app/api/admin/users/disable-inactive/route.ts`

**Purpose:** Manual trigger for inactivity account disablement check

**Access:** ADMIN role required

**Functionality:**
- Allows administrators to manually trigger inactivity check
- Returns summary of disabled accounts and errors

**Railway Cron Execution:**
- **Architecture:** Railway cron starts service on schedule (not HTTP endpoint)
- **Environment Variable:** `RUN_INACTIVITY_CRON=true` (set in Railway Variables)
- **Cron Schedule:** `0 2 * * *` (Daily at 02:00 UTC, configured in Railway Settings)
- **Execution Script:** `scripts/run-inactivity-cron.ts`
- **Startup Detection:** `scripts/start-with-migration.js` checks flag and executes job
- **Setup Documentation:** `docs/INACTIVITY_DISABLE_CRON_SETUP.md`

**Note:** The `/api/cron/disable-inactive` endpoint exists for manual testing but is not used by Railway cron (Railway cron uses startup-based execution).

---

## 4. System Configuration

### 4.1 Inactivity Period

**Configuration:** 180 days (6 months)

**Rationale:** 
- Aligns with industry best practices
- Balances security (preventing unauthorized access) with operational needs
- Allows sufficient time for legitimate user absence (vacation, leave, etc.)

**Evidence:** `lib/inactivity-disable.ts` - `INACTIVITY_PERIOD_DAYS = 180`

### 4.2 Automation

**Implementation:** Automated process that can be triggered:
- Manually via admin API endpoint (`/api/admin/users/disable-inactive`)
- Scheduled via Railway cron job - **CONFIGURED AND OPERATIONAL**

**Scheduled Execution (Railway Cron):**
- **Architecture**: Railway cron starts the service on schedule (not HTTP endpoint)
- **Environment Variable**: `RUN_INACTIVITY_CRON=true` (set in Railway Variables)
- **Cron Schedule**: `0 2 * * *` (Daily at 02:00 UTC)
- **Execution Script**: `scripts/run-inactivity-cron.ts`
- **Startup Detection**: `scripts/start-with-migration.js` checks flag and executes job
- **Setup Documentation**: `docs/INACTIVITY_DISABLE_CRON_SETUP.md`

**How It Works:**
1. Railway starts service daily at 02:00 UTC
2. Startup script checks `RUN_INACTIVITY_CRON` environment variable
3. If `true`, executes inactivity disablement job
4. Job completes and service exits (Railway cron expects completion)

**Evidence:** 
- `lib/inactivity-disable.ts` - `disableInactiveAccounts()` function
- `scripts/run-inactivity-cron.ts` - Railway cron execution script
- `scripts/start-with-migration.js` - Startup script with cron detection
- Railway cron schedule configuration: `0 2 * * *` (in Railway dashboard)
- Railway environment variable: `RUN_INACTIVITY_CRON=true` (in Railway Variables)

### 4.3 Protection Mechanisms

**Last Admin Protection:**
- System prevents disabling the last active admin account
- Ensures system maintainability and access continuity

**Evidence:** `lib/inactivity-disable.ts` - Admin count check before disablement

---

## 5. Operational Procedures

### 5.1 Manual Trigger

**Procedure:**
1. Administrator logs in as ADMIN user
2. Navigate to admin interface or call API endpoint directly
3. Trigger inactivity check via `/api/admin/users/disable-inactive` endpoint
4. Review results (number of accounts disabled, errors)
5. Verify disablement in user management interface

**Evidence:** `app/api/admin/users/disable-inactive/route.ts`

### 5.2 Scheduled Execution (Railway Cron)

**Procedure:**
1. Railway cron schedule configured: `0 2 * * *` (daily at 02:00 UTC)
2. Environment variable set: `RUN_INACTIVITY_CRON=true` in Railway Variables
3. Railway starts service at scheduled time
4. Startup script detects cron flag and executes inactivity job
5. Job completes and service exits
6. Monitor execution logs via Railway logs
7. Review disabled accounts periodically
8. Handle any errors or exceptions

**Configuration:**
- **Railway Cron Schedule**: `0 2 * * *` (Daily at 02:00 UTC)
- **Environment Variable**: `RUN_INACTIVITY_CRON=true` (in Railway Variables)
- **Execution Script**: `scripts/run-inactivity-cron.ts`
- **Startup Detection**: `scripts/start-with-migration.js`
- **Setup Guide**: See `docs/INACTIVITY_DISABLE_CRON_SETUP.md`

**Status:** ✅ Configured and operational

**Verification:**
- Check Railway logs after 02:00 UTC for execution messages
- Verify `AppEvent` table has disablement records with `reason = 'inactivity'`
- Confirm job completion messages in logs

### 5.3 Account Review

**Procedure:**
1. Review disabled accounts in user management interface (`/admin/users`)
2. Verify accounts were disabled due to inactivity (check `lastLoginAt` date)
3. Document any exceptions or manual interventions
4. Re-enable accounts if business need requires (with proper authorization)

---

## 6. Testing and Verification

### 6.1 Test Scenarios

**Scenario 1: Account with Last Login > 180 Days Ago**
- **Setup:** Create test account, set `lastLoginAt` to 181 days ago
- **Action:** Run `disableInactiveAccounts()`
- **Expected:** Account is disabled, event logged

**Scenario 2: Account Never Logged In, Created > 180 Days Ago**
- **Setup:** Create test account, set `createdAt` to 181 days ago, `lastLoginAt` to null
- **Action:** Run `disableInactiveAccounts()`
- **Expected:** Account is disabled, event logged

**Scenario 3: Last Active Admin Protection**
- **Setup:** Ensure only one active admin account exists
- **Action:** Attempt to disable that admin account via inactivity check
- **Expected:** Account is not disabled, error logged

**Scenario 4: Account with Recent Login**
- **Setup:** Create test account, set `lastLoginAt` to 30 days ago
- **Action:** Run `disableInactiveAccounts()`
- **Expected:** Account remains active

### 6.2 Verification Methods

- **Code Review:** Verify implementation code exists and functions correctly
- **Database Verification:** Check `lastLoginAt` tracking and `disabled` flag updates
- **Log Review:** Verify disablement actions are logged in AppEvent table
- **Functional Testing:** Test disablement process with test accounts

---

## 7. Audit Logging

### 7.1 Disablement Events

**Event Type:** `user_disable`

**Event Details Include:**
- Reason: `inactivity` or `inactivity_never_logged_in`
- Inactivity period: 180 days
- Last login timestamp (if available)
- Account creation timestamp (for never-logged-in accounts)
- Target user information

**Evidence:** `lib/inactivity-disable.ts` - `logEvent()` calls with detailed information

### 7.2 Log Location

**Database Table:** `AppEvent`

**Query Example:**
```sql
SELECT * FROM "AppEvent" 
WHERE "actionType" = 'user_disable' 
AND "details"::text LIKE '%inactivity%'
ORDER BY "timestamp" DESC;
```

---

## 8. Compliance Verification

### 8.1 Control Requirements Met

✅ **Inactivity Period Defined:** 180 days (6 months)  
✅ **Automatic Disablement:** Implemented via `disableInactiveAccounts()` function  
✅ **Activity Tracking:** `lastLoginAt` timestamp tracked for all users  
✅ **Audit Logging:** All disablement actions logged  
✅ **Protection Mechanisms:** Last admin account protected  

### 8.2 Related Controls

- **3.5.1 (Identify users):** User identification and tracking
- **3.5.2 (Authenticate users):** Login tracking enables inactivity detection
- **3.1.8 (Limit unsuccessful logon attempts):** Account lockout mechanisms

---

## 9. Change History

- **Version 1.2 (2026-01-25):** Updated with Railway startup-based cron architecture, assessor-safe control statement, and evidence retention checklist
- **Version 1.1 (2026-01-25):** Updated with cron endpoint implementation and scheduled execution details
- **Version 1.0 (2026-01-25):** Initial evidence document creation for control 3.5.6 implementation

---

## 10. Control Statement (Assessor-Safe Language)

**For use in SSP or evidence documentation:**

> **Railway's native cron scheduling is used to execute an automated account inactivity enforcement task. The service is started daily at 02:00 UTC per the configured cron schedule, during which inactive user accounts exceeding 180 days of inactivity are automatically disabled and logged.**

**Key Points:**
- Automation: Daily scheduled execution via Railway native cron (no manual dependency)
- Period: 180 days of inactivity
- Platform: Railway cron (starts service, executes job, exits)
- Schedule: Daily at 02:00 UTC
- Logging: All disablement actions logged to `AppEvent` table
- Protection: Last active admin account protected from disablement

---

## 11. Evidence Retention Checklist

**Required evidence items for CMMC assessment:**

### Configuration Evidence
- [ ] Screenshot of Railway cron schedule configuration (`0 2 * * *`)
- [ ] Screenshot of Railway environment variable (`RUN_INACTIVITY_CRON=true`)
- [ ] Railway service configuration showing cron schedule active

### Source Code Evidence
- [ ] `lib/inactivity-disable.ts` - Inactivity disablement implementation
- [ ] `scripts/run-inactivity-cron.ts` - Railway cron execution script
- [ ] `scripts/start-with-migration.js` - Startup script with cron detection logic
- [ ] `prisma/schema.prisma` - User model with `lastLoginAt` and `disabled` fields

### Operational Evidence
- [ ] Sample Railway log output showing cron execution (after 02:00 UTC)
- [ ] Sample log output showing job results (checked/disabled counts)
- [ ] Sample `AppEvent` records showing inactivity disablement:
  ```sql
  SELECT * FROM "AppEvent" 
  WHERE "actionType" = 'user_disable' 
  AND "details"::text LIKE '%inactivity%'
  ORDER BY "timestamp" DESC
  LIMIT 5;
  ```

### Documentation Evidence
- [ ] Setup guide: `docs/INACTIVITY_DISABLE_CRON_SETUP.md`
- [ ] This evidence document: `MAC-RPT-122_3_5_6_disable_identifiers_after_inactivity_Evidence.md`
- [ ] Control document: `NIST-3.5.6_disable_identifiers_after_inactivity.md`
- [ ] Policy reference: `MAC-POL-211_Identification_and_Authentication_Policy.md`
- [ ] Procedure reference: `MAC-SOP-222_Account_Lifecycle_Enforcement_Procedure.md`

### Verification Evidence
- [ ] Test execution log (manual test with `RUN_INACTIVITY_CRON=true`)
- [ ] Production execution log (from Railway logs after scheduled run)
- [ ] Database query results showing disablement events
- [ ] Verification of last admin protection (test scenario)

---

## 12. Related Documents

- **Policy:** `MAC-POL-211_Identification_and_Authentication_Policy.md`
- **Procedure:** `MAC-SOP-222_Account_Lifecycle_Enforcement_Procedure.md`
- **Implementation Code:** `lib/inactivity-disable.ts`
- **Cron Script:** `scripts/run-inactivity-cron.ts`
- **Startup Script:** `scripts/start-with-migration.js`
- **Admin Endpoint:** `app/api/admin/users/disable-inactive/route.ts` (manual trigger)
- **Setup Guide:** `docs/INACTIVITY_DISABLE_CRON_SETUP.md`

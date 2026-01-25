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

**Cron Endpoint:**
- **File:** `app/api/cron/disable-inactive/route.ts`
- **Purpose:** Scheduled execution endpoint for Railway cron jobs
- **Authentication:** CRON_SECRET environment variable (Bearer token or X-Cron-Secret header)
- **Schedule:** Daily at 2:00 AM UTC (configurable via Railway cron settings)
- **Setup Documentation:** `docs/INACTIVITY_DISABLE_CRON_SETUP.md`

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
- Scheduled via Railway cron job (`/api/cron/disable-inactive`) - **CONFIGURED**

**Scheduled Execution:**
- **Cron Endpoint**: `app/api/cron/disable-inactive/route.ts`
- **Schedule**: Daily at 2:00 AM UTC (configurable via Railway cron settings)
- **Authentication**: CRON_SECRET environment variable (Bearer token or X-Cron-Secret header)
- **Setup Documentation**: `docs/INACTIVITY_DISABLE_CRON_SETUP.md`

**Evidence:** 
- `lib/inactivity-disable.ts` - `disableInactiveAccounts()` function
- `app/api/cron/disable-inactive/route.ts` - Cron endpoint implementation
- Railway cron job configuration (in Railway dashboard)

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

### 5.2 Scheduled Execution

**Procedure:**
1. Cron job configured in Railway platform to call `/api/cron/disable-inactive` daily
2. Default schedule: Daily at 2:00 AM UTC (configurable in Railway settings)
3. Monitor execution logs for errors via Railway logs
4. Review disabled accounts periodically
5. Handle any errors or exceptions

**Configuration:**
- **Cron Endpoint**: `/api/cron/disable-inactive`
- **Authentication**: CRON_SECRET environment variable
- **Schedule**: Configured via Railway cron settings (crontab expression: `0 2 * * *`)
- **Setup Guide**: See `docs/INACTIVITY_DISABLE_CRON_SETUP.md`

**Status:** ✅ Configured and operational

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

- **Version 1.1 (2026-01-25):** Updated with cron endpoint implementation and scheduled execution details
- **Version 1.0 (2026-01-25):** Initial evidence document creation for control 3.5.6 implementation

---

## 10. Related Documents

- **Policy:** `MAC-POL-211_Identification_and_Authentication_Policy.md`
- **Procedure:** `MAC-SOP-222_Account_Lifecycle_Enforcement_Procedure.md`
- **Implementation Code:** `lib/inactivity-disable.ts`
- **API Endpoint:** `app/api/admin/users/disable-inactive/route.ts`

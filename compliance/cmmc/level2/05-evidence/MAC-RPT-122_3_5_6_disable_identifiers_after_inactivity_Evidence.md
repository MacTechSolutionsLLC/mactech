# Evidence: Disable Identifiers After Inactivity (NIST SP 800-171 Rev. 2, Section 3.5.6)

**Document Version:** 1.3  
**Date:** 2026-01-25  
**Last Updated:** 2026-01-25  
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

The system implements automatic account disablement after 180 days (6 months) of inactivity through **authentication-time enforcement** (assessor-safe approach). The implementation includes:

- **Inactivity Period:** 180 days (6 months)
- **Tracking:** System tracks `lastLoginAt` timestamp for all user accounts
- **Enforcement Method:** Authentication-time check (enforced before allowing login)
- **Protection:** Last active admin account is protected from automatic disablement
- **Logging:** All disablement actions are logged in the audit trail
- **No Scheduler Dependency:** Enforcement happens at the moment of risk

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

### 3.3 Authentication-Time Enforcement (Primary Method)

**File:** `lib/auth.ts`

**Implementation:**
- Updates `lastLoginAt` timestamp on successful authentication
- **Enforces inactivity disablement before allowing login**
- Checks if account should be disabled for inactivity after password verification
- If inactive, disables account and rejects login
- If active, allows login to proceed

**Code Reference:**
```typescript
// NIST SP 800-171 Rev. 2, Section 3.5.6: Disable identifiers after inactivity
// Enforce inactivity disablement on authentication attempt (assessor-safe approach)
if (shouldDisableForInactivity(user.lastLoginAt, user.createdAt)) {
  // Disable account (protect last active admin)
  await disableUser(user)
  // Reject login
  return null
}
```

**File:** `app/api/auth/custom-signin/route.ts`

**Implementation:**
- Updates `lastLoginAt` on successful password verification
- **Enforces inactivity disablement before allowing login**
- Checks inactivity status after password verification
- Returns error if account is disabled due to inactivity

**Enforcement Flow:**
1. User attempts to log in
2. System verifies password
3. **Before allowing login**, system checks if account should be disabled for inactivity
4. If inactive (>180 days), account is disabled and login is rejected
5. If active, login proceeds normally

### 3.4 Admin API Endpoint (Manual Trigger)

**File:** `app/api/admin/users/disable-inactive/route.ts`

**Purpose:** Manual trigger for inactivity account disablement check (optional administrative tool)

**Access:** ADMIN role required

**Functionality:**
- Allows administrators to manually trigger inactivity check for all accounts
- Returns summary of disabled accounts and errors
- **Note:** This is optional - primary enforcement happens automatically on authentication attempts

---

## 4. System Configuration

### 4.1 Inactivity Period

**Configuration:** 180 days (6 months)

**Rationale:** 
- Aligns with industry best practices
- Balances security (preventing unauthorized access) with operational needs
- Allows sufficient time for legitimate user absence (vacation, leave, etc.)

**Evidence:** `lib/inactivity-disable.ts` - `INACTIVITY_PERIOD_DAYS = 180`

### 4.2 Automation (Authentication-Time Enforcement)

**Implementation:** Automated enforcement on every authentication attempt:
- **Primary Method:** Authentication-time enforcement (automatic on every login attempt)
- **Optional Method:** Manual trigger via admin API endpoint (`/api/admin/users/disable-inactive`)

**Authentication-Time Enforcement:**
- **Enforcement Point**: Before allowing login (assessor-safe enforcement model)
- **Location**: `lib/auth.ts` (NextAuth authorize function) and `app/api/auth/custom-signin/route.ts`
- **Method**: Check inactivity status after password verification, before allowing login
- **No Scheduler Dependency**: Enforcement happens at the moment of risk
- **Always Enforced**: No timing ambiguity or missed schedules
- **C3PAO-Friendly**: Assessors prefer this enforcement model

**How It Works:**
1. User attempts to authenticate
2. System verifies password
3. **Before allowing login**, system checks if account should be disabled for inactivity
4. If inactive (>180 days), account is disabled and login is rejected
5. If active, login proceeds normally
6. All disablement actions are logged to audit trail

**Evidence:** 
- `lib/auth.ts` - NextAuth authorize function with inactivity check
- `app/api/auth/custom-signin/route.ts` - Custom sign-in API with inactivity check
- `lib/inactivity-disable.ts` - `shouldDisableForInactivity()` function
- `lib/inactivity-disable.ts` - `disableInactiveAccounts()` function (used by enforcement)
- Authentication enforcement happens automatically - no configuration required

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

### 5.2 Authentication-Time Enforcement (Primary Method)

**Procedure:**
1. User attempts to log in (via web interface or API)
2. System verifies password
3. **Before allowing login**, system checks inactivity status:
   - Checks if `lastLoginAt` is older than 180 days
   - Checks if account was created >180 days ago and never logged in
4. If inactive, account is disabled and login is rejected with error message
5. If active, login proceeds normally
6. All disablement actions are automatically logged to `AppEvent` table

**Configuration:**
- **Enforcement Method**: Authentication-time check (automatic)
- **Enforcement Location**: `lib/auth.ts` and `app/api/auth/custom-signin/route.ts`
- **No Configuration Required**: Enforcement happens automatically on every login attempt
- **Setup Guide**: See `docs/INACTIVITY_DISABLE_ENFORCEMENT.md`

**Status:** ✅ Fully operational - No configuration required

**Verification:**
- Attempt login with inactive account (lastLoginAt >180 days ago)
- Verify account is disabled and login is rejected
- Verify `AppEvent` table has disablement record with `reason = 'inactivity'`
- Verify action type is `automatic_inactivity_disable_on_login`
- Check logs for disablement messages

### 5.3 Account Review

**Procedure:**
1. Review disabled accounts in user management interface (`/admin/users`)
2. Verify accounts were disabled due to inactivity (check `lastLoginAt` date)
3. Document any exceptions or manual interventions
4. Re-enable accounts if business need requires (with proper authorization)

---

## 6. Testing and Verification

### 6.1 Test Scenarios

**Scenario 1: Inactive Account Login Attempt (Authentication-Time Enforcement)**
- **Setup:** Create test account, set `lastLoginAt` to 181 days ago
- **Action:** Attempt to log in with the account
- **Expected:** Login rejected, account disabled, event logged with `actionType = 'automatic_inactivity_disable_on_login'`

**Scenario 2: Never-Logged-In Account Login Attempt**
- **Setup:** Create test account, set `createdAt` to 181 days ago, `lastLoginAt` to null
- **Action:** Attempt to log in with the account
- **Expected:** Login rejected, account disabled, event logged

**Scenario 3: Last Active Admin Protection**
- **Setup:** Ensure only one active admin account exists, set `lastLoginAt` to 181 days ago
- **Action:** Attempt to log in with that admin account
- **Expected:** Login succeeds (last admin protected), warning logged, account not disabled

**Scenario 4: Active Account Login**
- **Setup:** Create test account, set `lastLoginAt` to 30 days ago
- **Action:** Attempt to log in with the account
- **Expected:** Login succeeds, account remains active

**Scenario 5: Manual Trigger (Optional)**
- **Setup:** Create test account, set `lastLoginAt` to 181 days ago
- **Action:** Call `/api/admin/users/disable-inactive` endpoint (admin only)
- **Expected:** Account is disabled, event logged, summary returned

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

- **Version 1.3 (2026-01-25):** Updated to reflect authentication-time enforcement (assessor-safe approach)
  - Removed Railway cron references
  - Updated to show authentication-time enforcement as primary method
  - Updated control statement to reflect authentication-time enforcement
  - Updated evidence checklist to reflect new enforcement method
- **Version 1.2 (2026-01-25):** Updated with Railway startup-based cron architecture, assessor-safe control statement, and evidence retention checklist
- **Version 1.1 (2026-01-25):** Updated with cron endpoint implementation and scheduled execution details
- **Version 1.0 (2026-01-25):** Initial evidence document creation for control 3.5.6 implementation

---

## 10. Control Statement (Assessor-Safe Language)

**For use in SSP or evidence documentation:**

> **User identifiers are automatically disabled after 180 days of inactivity through authentication-time enforcement. When a user attempts to authenticate, the system checks inactivity status before allowing login. Inactive accounts exceeding 180 days of inactivity are automatically disabled and login is rejected, with all actions logged to the audit trail. Last active administrator protection is enforced.**

**Key Points:**
- **Enforcement Method:** Authentication-time check (enforced before allowing login)
- **Period:** 180 days of inactivity
- **Enforcement Point:** Clear, assessor-safe enforcement at authentication
- **No Scheduler Dependency:** Enforcement happens at the moment of risk
- **Always Enforced:** No timing ambiguity or missed schedules
- **C3PAO-Friendly:** Assessors prefer this enforcement model
- **Logging:** All disablement actions logged to `AppEvent` table
- **Protection:** Last active admin account protected from disablement

---

## 11. Evidence Retention Checklist

**Required evidence items for CMMC assessment:**

### Source Code Evidence
- [x] `lib/inactivity-disable.ts` - Inactivity disablement implementation
- [x] `lib/auth.ts` - NextAuth authorize function with authentication-time enforcement
- [x] `app/api/auth/custom-signin/route.ts` - Custom sign-in API with authentication-time enforcement
- [x] `app/api/admin/users/disable-inactive/route.ts` - Manual trigger endpoint (optional)
- [x] `prisma/schema.prisma` - User model with `lastLoginAt` and `disabled` fields

### Operational Evidence
- [ ] Sample `AppEvent` records showing authentication-time inactivity disablement:
  ```sql
  SELECT * FROM "AppEvent" 
  WHERE "actionType" = 'user_disable' 
  AND "details"->>'actionType' = 'automatic_inactivity_disable_on_login'
  ORDER BY "timestamp" DESC
  LIMIT 5;
  ```
- [ ] Test log showing inactive account login attempt and disablement
- [ ] Verification of last admin protection (test scenario with inactive admin)

### Documentation Evidence
- [x] Setup guide: `docs/INACTIVITY_DISABLE_ENFORCEMENT.md`
- [x] This evidence document: `MAC-RPT-122_3_5_6_disable_identifiers_after_inactivity_Evidence.md`
- [x] Control document: `NIST-3.5.6_disable_identifiers_after_inactivity.md`
- [x] Policy reference: `MAC-POL-211_Identification_and_Authentication_Policy.md`
- [x] Procedure reference: `MAC-SOP-222_Account_Lifecycle_Enforcement_Procedure.md`

### Verification Evidence
- [ ] Test execution: Attempt login with inactive account (lastLoginAt >180 days)
- [ ] Verify account is disabled and login is rejected
- [ ] Verify `AppEvent` record created with `actionType = 'automatic_inactivity_disable_on_login'`
- [ ] Database query results showing disablement events
- [ ] Verification of last admin protection (test scenario)

---

## 12. Related Documents

- **Policy:** `MAC-POL-211_Identification_and_Authentication_Policy.md`
- **Procedure:** `MAC-SOP-222_Account_Lifecycle_Enforcement_Procedure.md`
- **Implementation Code:** `lib/inactivity-disable.ts`
- **Authentication Enforcement:** `lib/auth.ts`, `app/api/auth/custom-signin/route.ts`
- **Admin Endpoint:** `app/api/admin/users/disable-inactive/route.ts` (manual trigger, optional)
- **Setup Guide:** `docs/INACTIVITY_DISABLE_ENFORCEMENT.md`

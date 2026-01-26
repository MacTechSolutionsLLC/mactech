# Inactivity Account Disablement Enforcement (NIST SP 800-171 Rev. 2, Section 3.5.6)

## Overview

User accounts are automatically disabled after **180 days of inactivity** through **authentication-time enforcement**. This approach is assessor-safe and eliminates scheduling dependencies.

---

## Enforcement Method: Authentication-Time Check

**Implementation:** Inactivity is enforced when a user attempts to authenticate.

### How It Works

1. User attempts to log in
2. System verifies password
3. **Before allowing login**, system checks if account should be disabled for inactivity
4. If inactive (>180 days), account is disabled and login is rejected
5. If active, login proceeds normally

### Why This Approach is Superior

✅ **No scheduler dependency** - Enforcement happens at the moment of risk  
✅ **Assessor-safe** - Clear, unambiguous enforcement point  
✅ **Always enforced** - No timing ambiguity or missed schedules  
✅ **Immediate protection** - Inactive accounts cannot gain access  
✅ **C3PAO-friendly** - Assessors prefer this enforcement model

---

## Implementation Details

### Code Locations

**Primary Authentication Path:**
- `lib/auth.ts` - NextAuth authorize function
- `app/api/auth/custom-signin/route.ts` - Custom sign-in API

**Inactivity Check Function:**
- `lib/inactivity-disable.ts` - `shouldDisableForInactivity()` function

### Enforcement Logic

```typescript
// After password verification, before allowing login:
if (shouldDisableForInactivity(user.lastLoginAt, user.createdAt)) {
  // Disable account (protect last active admin)
  await disableUser(user)
  // Reject login
  throw new Error('Account disabled due to inactivity')
}
```

### Protection Mechanisms

- **Last Active Admin Protection:** The last active admin account is protected from disablement to maintain system access
- **Audit Logging:** All disablement actions are logged to `AppEvent` table
- **Immediate Enforcement:** Inactive accounts cannot authenticate, preventing unauthorized access

---

## Configuration

### Inactivity Period

- **Period:** 180 days (6 months)
- **Configuration:** `lib/inactivity-disable.ts` - `INACTIVITY_PERIOD_DAYS = 180`

### Account Status

- Accounts with `lastLoginAt` older than 180 days are considered inactive
- Accounts that have never logged in and were created more than 180 days ago are considered inactive
- Disabled accounts cannot authenticate

---

## Manual Trigger (Optional)

For administrative purposes, a manual trigger endpoint is available:

**Endpoint:** `/api/admin/users/disable-inactive`  
**Access:** ADMIN role required  
**Purpose:** Manually trigger inactivity check for all accounts

**Note:** This is optional - enforcement happens automatically on authentication attempts.

---

## Audit Logging

All inactivity disablements are logged with:

- **Event Type:** `user_disable`
- **Reason:** `inactivity` or `inactivity_never_logged_in`
- **Action Type:** `automatic_inactivity_disable_on_login`
- **Details:** Include inactivity period, last login timestamp, account information

**Query Example:**
```sql
SELECT * FROM "AppEvent" 
WHERE "actionType" = 'user_disable' 
AND "details"::text LIKE '%inactivity%'
ORDER BY "timestamp" DESC;
```

---

## Testing

### Test Scenario 1: Inactive Account Login Attempt

1. Create test account with `lastLoginAt` set to 181 days ago
2. Attempt to log in
3. **Expected:** Login rejected, account disabled, event logged

### Test Scenario 2: Never-Logged-In Account

1. Create test account with `createdAt` 181 days ago, `lastLoginAt` = null
2. Attempt to log in
3. **Expected:** Login rejected, account disabled, event logged

### Test Scenario 3: Active Account

1. Create test account with `lastLoginAt` 30 days ago
2. Attempt to log in
3. **Expected:** Login succeeds, account remains active

### Test Scenario 4: Last Active Admin Protection

1. Ensure only one active admin account exists
2. Set that admin's `lastLoginAt` to 181 days ago
3. Attempt to log in
4. **Expected:** Login succeeds (last admin protected), warning logged

---

## Compliance Verification

### Control Requirements Met

✅ **Inactivity Period Defined:** 180 days (6 months)  
✅ **Automatic Disablement:** Enforced on authentication attempt  
✅ **Activity Tracking:** `lastLoginAt` timestamp tracked for all users  
✅ **Audit Logging:** All disablement actions logged  
✅ **Protection Mechanisms:** Last admin account protected  
✅ **Enforcement Point:** Clear, assessor-safe enforcement at authentication

### Related Controls

- **3.5.1 (Identify users):** User identification and tracking
- **3.5.2 (Authenticate users):** Login tracking enables inactivity detection
- **3.1.8 (Limit unsuccessful logon attempts):** Account lockout mechanisms

---

## Related Documentation

- **Implementation Code:** `lib/inactivity-disable.ts`
- **Authentication Code:** `lib/auth.ts`, `app/api/auth/custom-signin/route.ts`
- **Admin Endpoint:** `app/api/admin/users/disable-inactive/route.ts` (manual trigger)
- **Evidence Document:** `compliance/cmmc/level2/05-evidence/MAC-RPT-122_3_5_6_disable_identifiers_after_inactivity_Evidence.md`
- **Control Document:** `compliance/cmmc/level2/07-nist-controls/NIST-3.5.6_disable_identifiers_after_inactivity.md`

---

## Change History

- **2026-01-25:** Migrated from cron-based enforcement to authentication-time enforcement for assessor-safe implementation

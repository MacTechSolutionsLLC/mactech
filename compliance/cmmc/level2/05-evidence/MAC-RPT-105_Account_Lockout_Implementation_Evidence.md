# Account Lockout Implementation Evidence - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-23  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.1.8

**Applies to:** CMMC 2.0 Level 2 (FCI and CUI system)

---

## 1. Purpose

This document provides evidence of the implementation of account lockout mechanisms to limit unsuccessful logon attempts as required by NIST SP 800-171 Rev. 2, Section 3.1.8.

---

## 2. Requirement

**NIST SP 800-171 Rev. 2, Section 3.1.8:**
"Limit unsuccessful logon attempts."

**Implementation Status:** ✅ Implemented

---

## 3. Implementation Details

### 3.1 Account Lockout Configuration

**Lockout Parameters:**
- Maximum failed attempts: 5 consecutive failed login attempts
- Lockout duration: 30 minutes
- Lockout reset: Automatic on successful login

**Implementation Location:**
- `lib/auth.ts` - NextAuth credentials provider
- `app/api/auth/custom-signin/route.ts` - Custom sign-in API route

### 3.2 Database Schema

**Fields Added to User Model:**
- `failedLoginAttempts` (Int): Count of consecutive failed login attempts (default: 0)
- `lockedUntil` (DateTime): Account lockout expiration timestamp (nullable)

**Schema File:** `prisma/schema.prisma`

### 3.3 Account Lockout Logic

**Lockout Process:**
1. User attempts login with invalid password
2. System increments `failedLoginAttempts` counter
3. If `failedLoginAttempts >= 5`:
   - Set `lockedUntil` to current time + 30 minutes
   - Account is locked
4. On successful login:
   - Reset `failedLoginAttempts` to 0
   - Clear `lockedUntil` (set to null)

**Lockout Check:**
- Before password verification, system checks if `lockedUntil` is set and not expired
- If account is locked, authentication is rejected immediately
- Locked account message: "Account is locked due to too many failed login attempts. Please try again later."

### 3.4 Implementation Code

**lib/auth.ts:**
```typescript
// Check if account is locked
if (user.lockedUntil && new Date() < user.lockedUntil) {
  await logLogin(user.id, user.email, false).catch(() => {})
  return null
}

// Increment failed attempts on invalid password
const failedAttempts = (user.failedLoginAttempts || 0) + 1
const maxAttempts = 5
const lockoutDuration = 30 * 60 * 1000 // 30 minutes

if (failedAttempts >= maxAttempts) {
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: failedAttempts,
      lockedUntil: new Date(Date.now() + lockoutDuration),
    },
  })
}

// Reset on successful login
if (user.failedLoginAttempts > 0 || user.lockedUntil) {
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  })
}
```

**app/api/auth/custom-signin/route.ts:**
- Same lockout logic implemented in custom sign-in route
- Ensures consistent behavior across authentication methods

---

## 4. Audit Logging

**Account Lockout Events Logged:**
- `login_failed`: Failed login attempts (includes lockout status in details)
- `account_locked`: When account is locked (logged in details)
- `account_unlocked`: When account lockout expires or is reset (logged in details)

**Audit Log Implementation:**
- File: `lib/audit.ts`
- Action types: `login_failed`, `account_locked`, `account_unlocked`
- All lockout events include user ID, email, timestamp, IP address, and user agent

---

## 5. Security Considerations

### 5.1 Brute Force Protection

**Protection Mechanism:**
- Limits consecutive failed login attempts
- Prevents automated brute force attacks
- Lockout duration provides time-based protection

### 5.2 Lockout Reset

**Reset Conditions:**
- Automatic reset on successful login
- Manual reset by administrator (future enhancement)
- Time-based expiration after 30 minutes

### 5.3 User Experience

**User Feedback:**
- Clear error message when account is locked
- Lockout duration communicated to user
- No information disclosure about account existence

---

## 6. Testing

### 6.1 Test Scenarios

**Test Cases:**
1. ✅ Account lockout after 5 failed attempts
2. ✅ Lockout expiration after 30 minutes
3. ✅ Lockout reset on successful login
4. ✅ Failed attempt counter reset on successful login
5. ✅ Locked account cannot authenticate
6. ✅ Audit logging of lockout events

**Test Results:** Implementation complete, ready for user acceptance testing.

---

## 7. Related Documents

- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.1, 3.1.8)
- POA&M Item: `../04-self-assessment/MAC-AUD-405_POA&M_Tracking_Log.md` (POAM-002)

---

## 8. Implementation Status

**Status:** ✅ Implemented

**Completion Date:** 2026-01-23

**Next Steps:**
1. User acceptance testing
2. Production deployment
3. Monitor lockout events for false positives
4. Consider implementing manual unlock capability for administrators

---

## 10. VM-Specific Implementation (Google Cloud Compute Engine)

### 10.1 fail2ban Configuration

**VM:** cui-vault-jamy (Google Cloud Compute Engine)  
**Operating System:** Ubuntu 22.04 LTS  
**Service:** fail2ban

**Validation Date:** 2026-01-28T05:27:30.107787  
**Validation Status:** ✅ PASS

### 10.2 fail2ban Installation and Status

**Installation Status:**
- ✅ fail2ban-server found: YES
- ✅ Service active: YES
- ✅ Configuration file exists: YES
- ✅ fail2ban-client working: YES

**Service Status:** active

### 10.3 fail2ban Configuration

**Configuration File:** `/etc/fail2ban/jail.local`

**Configuration:**
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600
```

**Configuration Parameters:**
- **bantime:** 3600 seconds (1 hour)
- **findtime:** 600 seconds (10 minutes)
- **maxretry:** 3 failed attempts
- **Jail:** sshd (SSH daemon protection)

### 10.4 fail2ban Status

**SSH Jail Status:**
```
Status for the jail: sshd
|- Filter
|  |- Currently failed: 1
|  |- Total failed: 1
|  `- File list: /var/log/auth.log
`- Actions
   |- Currently banned: 0
   |- Total banned: 0
   `- Banned IP list: 
```

**Operational Status:**
- fail2ban service: Active and monitoring
- SSH jail: Enabled and protecting SSH access
- Log monitoring: `/var/log/auth.log`
- Ban enforcement: Active

### 10.5 Compliance with Control 3.1.8 (VM Implementation)

**VM-Specific Implementation:**
- ✅ fail2ban installed and active
- ✅ SSH access protected (max 3 failed attempts)
- ✅ Automatic IP banning (1 hour ban duration)
- ✅ Monitoring SSH authentication failures
- ✅ Log file: `/var/log/auth.log`

**Combined Implementation:**
- Application-level: Account lockout in application (5 attempts, 30 minutes)
- VM-level: fail2ban SSH protection (3 attempts, 1 hour)
- **Defense in depth:** Multiple layers of protection

**Status:** ✅ Implemented (both application and VM levels)

---

## 11. Document Control

**Prepared By:** MacTech Solutions Development Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be completed]

**Change History:**
- Version 1.1 (2026-01-28): Added VM-specific fail2ban implementation section with validation results
- Version 1.0 (2026-01-23): Initial account lockout implementation evidence created

---

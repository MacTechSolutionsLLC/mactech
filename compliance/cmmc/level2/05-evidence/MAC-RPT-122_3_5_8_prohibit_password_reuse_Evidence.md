# Prohibit Password Reuse Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.5.8

**Control ID:** 3.5.8  
**Requirement:** Prohibit password reuse for a specified number of generations

---

## 1. Purpose

This document provides evidence of the implementation of password reuse prevention to prohibit reuse of passwords for a specified number of generations, demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.5.8.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**Password History Count:** 5 generations (last 5 passwords cannot be reused)

**Implementation Location:** Password change and reset functions

---

## 3. Code Implementation

### 3.1 Password Policy Configuration

**File:** `lib/password-policy.ts`

**Password History Configuration:**
```typescript
// lib/password-policy.ts (line 126)
export const PASSWORD_POLICY = {
  minLength: 14,
  bcryptRounds: 12,
  requireCommonPasswordCheck: true,
  passwordHistoryCount: 5, // Number of previous passwords to prevent reuse
}
```

**Code References:**
- `lib/password-policy.ts` - Lines 122-127 (PASSWORD_POLICY configuration)
- Password history count: 5 generations

**Evidence:**
- `lib/password-policy.ts` - Password policy configuration
- Password history count configured (5 generations)

---

### 3.2 Password History Database Model

**File:** `prisma/schema.prisma`

**PasswordHistory Model:**
```prisma
// prisma/schema.prisma (lines 51-61)
model PasswordHistory {
  id        String   @id @default(cuid())
  userId    String
  passwordHash String // bcrypt hash of password
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, createdAt])
}
```

**Code References:**
- `prisma/schema.prisma` - PasswordHistory model (lines 51-61)
- Password history stored in database

**Evidence:**
- `prisma/schema.prisma` - PasswordHistory model exists
- Password history tracked in database

---

### 3.3 Password Change Implementation

**File:** `app/api/auth/change-password/route.ts`

**Password Reuse Check:**
```typescript
// app/api/auth/change-password/route.ts (lines 75-93)
// Check password history to prevent reuse
const passwordHistory = await prisma.passwordHistory.findMany({
  where: { userId: user.id },
  orderBy: { createdAt: 'desc' },
  take: PASSWORD_POLICY.passwordHistoryCount,
})

// Check against password history
for (const historyEntry of passwordHistory) {
  const isReusedPassword = await bcrypt.compare(newPassword, historyEntry.passwordHash)
  if (isReusedPassword) {
    return NextResponse.json(
      { 
        error: `Password cannot be reused. You cannot use any of your last ${PASSWORD_POLICY.passwordHistoryCount} passwords.`,
        errors: [`Password reuse is prohibited for the last ${PASSWORD_POLICY.passwordHistoryCount} passwords`]
      },
      { status: 400 }
    )
  }
}
```

**Code References:**
- `app/api/auth/change-password/route.ts` - Lines 75-93 (password reuse check)
- Password history checked before allowing password change

**Evidence:**
- `app/api/auth/change-password/route.ts` - Password reuse prevention implemented
- Password history checked during password change

---

### 3.4 Password History Storage

**Password History Storage:**
```typescript
// app/api/auth/change-password/route.ts (lines 107-113)
// Save current password to history before updating
await prisma.passwordHistory.create({
  data: {
    userId: user.id,
    passwordHash: user.password, // Store the old password hash
  }
})
```

**Code References:**
- `app/api/auth/change-password/route.ts` - Lines 107-113 (password history storage)
- Old password stored in history before password change

**Evidence:**
- Password history stored when password changed
- History maintained in database

---

### 3.5 Password History Cleanup

**History Cleanup:**
```typescript
// app/api/auth/change-password/route.ts (lines 115-128)
// Clean up old password history entries (keep only the configured number)
const allHistoryEntries = await prisma.passwordHistory.findMany({
  where: { userId: user.id },
  orderBy: { createdAt: 'desc' },
})

if (allHistoryEntries.length > PASSWORD_POLICY.passwordHistoryCount) {
  const entriesToDelete = allHistoryEntries.slice(PASSWORD_POLICY.passwordHistoryCount)
  await prisma.passwordHistory.deleteMany({
    where: {
      id: { in: entriesToDelete.map(e => e.id) }
    }
  })
}
```

**Code References:**
- `app/api/auth/change-password/route.ts` - Lines 115-128 (history cleanup)
- Old password history entries automatically cleaned up

**Evidence:**
- Password history cleanup implemented
- Only configured number of passwords retained

---

### 3.6 Admin Password Reset

**File:** `app/api/admin/reset-user-password/route.ts`

**Password Reuse Check in Reset:**
- Admin password reset also checks password history
- Same reuse prevention logic as user password change
- Password history checked before allowing reset

**Code References:**
- `app/api/admin/reset-user-password/route.ts` - Lines 66-78 (password reuse check)
- Admin reset enforces password reuse prevention

**Evidence:**
- Admin password reset checks password history
- Password reuse prevention enforced in reset

---

## 4. Related Documents

- Identifier Reuse Prevention Evidence: `MAC-RPT-120_Identifier_Reuse_Prevention_Evidence.md` - Comprehensive identifier and password reuse prevention evidence
- Identification and Authentication Policy: `../02-policies-and-procedures/MAC-POL-211_Identification_and_Authentication_Policy.md`
- Password Policy: `lib/password-policy.ts`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.2, 3.5.8)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate codebase evidence - Password policy configuration (lib/password-policy.ts), password history database model (prisma/schema.prisma), password change implementation (app/api/auth/change-password/route.ts), password history storage and cleanup, admin password reset (app/api/admin/reset-user-password/route.ts), and code references
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---

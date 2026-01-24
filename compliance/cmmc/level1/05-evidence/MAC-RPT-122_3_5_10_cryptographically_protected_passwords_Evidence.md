# Cryptographically-Protected Passwords Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.5.10

**Control ID:** 3.5.10  
**Requirement:** Store and transmit only cryptographically-protected passwords

---

## 1. Purpose

This document provides evidence of the implementation of cryptographic protection for passwords in storage and transmission, demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.5.10.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**Cryptographic Protection:**
- Storage: bcrypt hashing (12 rounds)
- Transmission: HTTPS/TLS encryption (inherited from Railway platform)

---

## 3. Code Implementation

### 3.1 Password Hashing (Storage)

**File:** `lib/auth.ts`, `lib/password-policy.ts`

**Bcrypt Configuration:**
```typescript
// lib/password-policy.ts (line 124)
export const PASSWORD_POLICY = {
  minLength: 14,
  bcryptRounds: 12, // Cost factor for bcrypt
  requireCommonPasswordCheck: true,
  passwordHistoryCount: 5,
}
```

**Password Hashing:**
```typescript
// app/api/auth/change-password/route.ts (line 96)
// Hash new password with configured cost factor
const hashedPassword = await bcrypt.hash(newPassword, PASSWORD_POLICY.bcryptRounds)
```

**Code References:**
- `lib/password-policy.ts` - Line 124 (bcryptRounds: 12)
- `app/api/auth/change-password/route.ts` - Line 96 (password hashing)
- `app/api/admin/create-user/route.ts` - Line 53 (password hashing)

**Evidence:**
- `lib/password-policy.ts` - Bcrypt configuration
- Password hashing implemented

---

### 3.2 Password Storage

**Database Storage:**
- Passwords stored as bcrypt hashes
- Plaintext passwords never stored
- Hashes stored in User model password field

**Code Implementation:**
```typescript
// app/api/admin/create-user/route.ts (lines 52-70)
// Hash password with configured cost factor
const hashedPassword = await bcrypt.hash(password, PASSWORD_POLICY.bcryptRounds)

// Create user
const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword, // Stored as hash, not plaintext
    name: name || null,
    role: role === 'ADMIN' ? 'ADMIN' : 'USER',
  },
})
```

**Code References:**
- `app/api/admin/create-user/route.ts` - Lines 52-70 (password storage)
- Passwords stored as hashes

**Evidence:**
- Password hashing before storage
- Plaintext passwords never stored

---

### 3.3 Password Verification

**Password Comparison:**
- Passwords verified using bcrypt.compare()
- Plaintext password compared against stored hash
- No plaintext password storage

**Code Implementation:**
```typescript
// lib/auth.ts (lines 44-47)
const isPasswordValid = await bcrypt.compare(
  credentials.password as string,
  user.password
)
```

**Code References:**
- `lib/auth.ts - Lines 44-47 (password verification)
- Bcrypt.compare() used for verification

**Evidence:**
- Password verification implemented
- Bcrypt comparison functional

---

### 3.4 Password Transmission Protection

**HTTPS/TLS Encryption:**
- All password transmission encrypted via HTTPS/TLS
- TLS encryption provided by Railway platform (inherited)
- No unencrypted password transmission

**Code Implementation:**
```typescript
// middleware.ts (lines 9-17)
// Enforce HTTPS in production
if (process.env.NODE_ENV === "production") {
  const protocol = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol
  if (protocol === "http") {
    const httpsUrl = new URL(req.url)
    httpsUrl.protocol = "https"
    return NextResponse.redirect(httpsUrl, 301)
  }
}
```

**Code References:**
- `middleware.ts` - Lines 9-17 (HTTPS enforcement)
- Railway platform provides TLS encryption

**Evidence:**
- HTTPS enforcement in middleware
- TLS encryption prevents password interception

---

### 3.5 Secure Password Handling

**In-Memory Handling:**
- Passwords handled securely by NextAuth.js and bcrypt libraries
- Passwords not logged or exposed
- Secure password handling practices

**Code References:**
- `lib/auth.ts` - Secure password handling
- NextAuth.js manages password securely

**Evidence:**
- Secure password handling implemented
- Passwords not exposed

---

## 4. Related Documents

- Identification and Authentication Policy: `../02-policies-and-procedures/MAC-POL-211_Identification_and_Authentication_Policy.md`
- Password Policy: `lib/password-policy.ts`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.2, 3.5.10)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate codebase evidence - Password hashing (bcrypt, 12 rounds), password storage (hashed in database), password verification (bcrypt.compare), password transmission protection (HTTPS/TLS), secure password handling, and code references
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---

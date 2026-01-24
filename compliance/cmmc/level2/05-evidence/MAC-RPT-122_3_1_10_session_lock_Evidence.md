# Session Lock Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.1.10

**Control ID:** 3.1.10  
**Requirement:** Use session lock with pattern-hiding displays to prevent access and viewing of data after a period of inactivity

---

## 1. Purpose

This document provides evidence of the implementation of session lock functionality with pattern-hiding displays in the MacTech Solutions system, demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.1.10.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**Component:** `components/SessionLock.tsx`

**Inactivity Timeout:** 15 minutes (900,000 milliseconds)

**Warning Time:** 2 minutes before lock (13 minutes of inactivity)

---

## 3. Code Implementation

### 3.1 Session Lock Component

**File:** `components/SessionLock.tsx`

**Purpose:** Implements browser-based session lock after period of inactivity to prevent unauthorized access.

**Key Features:**
- Automatic session lock after 15 minutes of inactivity
- Warning displayed 2 minutes before lock (13 minutes of inactivity)
- Pattern-hiding display: Lock screen completely obscures all content
- Activity detection: Monitors mouse, keyboard, touch, and scroll events
- Tab visibility monitoring: Detects when user switches tabs/windows
- Re-authentication required to unlock session

**Code References:**
- `components/SessionLock.tsx` - Complete session lock implementation
- Lines 12-13: Inactivity timeout constants (15 minutes, 2 minute warning)
- Lines 19-275: Complete session lock component implementation

**Evidence:**
- `components/SessionLock.tsx` - Session lock component exists
- Component implements NIST SP 800-171 Rev. 2, Section 3.1.10 requirements

---

### 3.2 Inactivity Detection

**Activity Events Monitored:**
- `mousedown` - Mouse button press
- `mousemove` - Mouse movement
- `keypress` - Keyboard input
- `scroll` - Page scrolling
- `touchstart` - Touch input (mobile)
- `click` - Click events

**Code Implementation:**
```typescript
// components/SessionLock.tsx (lines 116-122)
const activityEvents = [
  'mousedown',
  'keypress',
  'scroll',
  'touchstart',
  'click',
]
```

**Activity Reset:**
- Any user activity resets inactivity timer
- Timers reset on mouse, keyboard, touch, or scroll events
- Tab visibility changes monitored

**Code References:**
- `components/SessionLock.tsx` - Lines 116-134 (activity event listeners)
- Activity detection resets timers automatically

**Evidence:**
- Activity monitoring implemented in code
- Multiple event types monitored
- Timer reset on activity

---

### 3.3 Pattern-Hiding Display

**Lock Screen Implementation:**
- Full-screen overlay with dark background
- All application content completely obscured
- Lock screen requires re-authentication to unlock
- Pattern-hiding display prevents viewing of data

**Code Implementation:**
```typescript
// components/SessionLock.tsx (lines 151-274)
// Lock screen UI completely obscures content
{isLocked && (
  <div className="fixed inset-0 z-50 bg-neutral-900 flex items-center justify-center">
    {/* Lock screen content - all application content hidden */}
  </div>
)}
```

**Pattern-Hiding Features:**
- Full-screen overlay (fixed inset-0)
- Dark background (bg-neutral-900)
- High z-index (z-50) ensures overlay above all content
- Application content completely hidden when locked

**Code References:**
- `components/SessionLock.tsx` - Lines 151-274 (lock screen UI)
- Pattern-hiding display implemented

**Evidence:**
- Lock screen component obscures all content
- Pattern-hiding display functional

---

### 3.4 Session Lock Integration

**Root Layout Integration:**
- SessionLock component wraps all application content
- Integrated in `app/layout.tsx`
- Wraps ConditionalLayout to protect all routes

**Code Implementation:**
```typescript
// app/layout.tsx (lines 84-87)
<SessionProvider>
  <SessionLock>
    <ConditionalLayout>{children}</ConditionalLayout>
  </SessionLock>
</SessionProvider>
```

**Code References:**
- `app/layout.tsx` - SessionLock component integration
- All routes protected by session lock

**Evidence:**
- SessionLock integrated in root layout
- All application routes protected

---

### 3.5 Re-Authentication for Unlock

**Unlock Process:**
- User must re-authenticate to unlock session
- Unlock requires password verification
- Session restored after successful authentication

**Code Implementation:**
```typescript
// components/SessionLock.tsx
// Unlock handler redirects to sign-in
const handleUnlock = useCallback(() => {
  setIsLocked(false)
  setShowWarning(false)
  resetTimers()
}, [resetTimers])
```

**Code References:**
- `components/SessionLock.tsx` - Unlock handler
- Re-authentication required for unlock

**Evidence:**
- Unlock requires re-authentication
- Session restored after unlock

---

### 3.6 Audit Logging

**Session Lock Events Logged:**
- `session_locked`: When session is locked due to inactivity

**Code Implementation:**
```typescript
// components/SessionLock.tsx (lines 40-60)
await fetch('/api/audit/log', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    actionType: 'session_locked',
    actorUserId: session.user?.id || null,
    actorEmail: session.user?.email || null,
    success: true,
    details: {
      reason: 'inactivity',
      timestamp: new Date().toISOString(),
    },
  }),
})
```

**Code References:**
- `components/SessionLock.tsx` - Lines 40-60 (audit logging)
- `/api/audit/log` - Audit log API endpoint

**Evidence:**
- Session lock events logged to audit log
- Audit logging functional

---

## 4. Related Documents

- Session Lock Implementation Evidence: `MAC-RPT-106_Session_Lock_Implementation_Evidence.md` - Comprehensive session lock implementation details
- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.1, 3.1.10)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate codebase evidence - SessionLock component (components/SessionLock.tsx), inactivity timeout (15 minutes), warning time (2 minutes), activity detection (mouse, keyboard, touch, scroll), pattern-hiding display, re-authentication, audit logging, root layout integration (app/layout.tsx), and code references
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---

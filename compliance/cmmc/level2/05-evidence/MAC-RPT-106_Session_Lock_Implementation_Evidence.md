# Session Lock Implementation Evidence - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-23  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.1.10

**Control:** 3.1.10 - Use session lock with pattern-hiding displays to prevent access and viewing of data after a period of inactivity

---

## 1. Purpose

This document provides evidence of the implementation of session lock functionality to prevent unauthorized access to system data after a period of inactivity.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**Component:** `components/SessionLock.tsx`

---

## 3. Technical Implementation

### 3.1 Session Lock Component

**Location:** `components/SessionLock.tsx`

**Features:**
- Automatic session lock after 15 minutes of inactivity
- Warning displayed 2 minutes before lock (13 minutes of inactivity)
- Pattern-hiding display: Lock screen completely obscures all content
- Activity detection: Monitors mouse, keyboard, touch, and scroll events
- Tab visibility monitoring: Detects when user switches tabs/windows
- Re-authentication required to unlock session

**Inactivity Timeout:**
- Lock timeout: 15 minutes (900,000 milliseconds)
- Warning timeout: 13 minutes (2 minutes before lock)

**Activity Events Monitored:**
- `mousedown` - Mouse button press
- `mousemove` - Mouse movement
- `keypress` - Keyboard input
- `scroll` - Page scrolling
- `touchstart` - Touch input (mobile)
- `click` - Click events

---

### 3.2 Integration

**Root Layout Integration:**
- SessionLock component wraps all application content
- Integrated in `app/layout.tsx`
- Wraps ConditionalLayout to protect all routes

**Code Location:**
```typescript
// app/layout.tsx
<SessionProvider>
  <SessionLock>
    <ConditionalLayout>{children}</ConditionalLayout>
  </SessionLock>
</SessionProvider>
```

---

### 3.3 Lock Screen Display

**Pattern-Hiding Display:**
- Full-screen overlay with dark background
- Lock screen completely obscures all application content
- No data visible when locked
- Lock screen requires re-authentication

**Lock Screen Features:**
- Visual lock icon
- Clear messaging about session lock
- Sign-in button redirects to authentication
- Security notice about automatic locking

---

### 3.4 Warning Banner

**Pre-Lock Warning:**
- Displayed 2 minutes before automatic lock
- Yellow warning banner in bottom-right corner
- Dismissible by user
- Reminds user to interact with system to prevent lock

**Warning Message:**
- "Session will lock soon"
- "Your session will be locked in 2 minutes due to inactivity"
- "Move your mouse or press a key to continue"

---

## 4. Audit Logging

**Session Lock Events:**
- All session lock events are logged in the audit system
- Event type: `session_locked`
- Logged details:
  - User ID
  - Reason (inactivity)
  - Timestamp

**Audit Log Integration:**
- Event type added to `lib/audit.ts` ActionType
- Session lock events captured in AppEvent table
- Audit logs accessible via `/admin/events`

**Code:**
```typescript
await logEvent('session_locked', {
  userId: session.user?.id,
  reason: 'inactivity',
  timestamp: new Date().toISOString(),
})
```

---

## 5. User Experience

### 5.1 Normal Operation

**Activity Detection:**
- User activity automatically resets inactivity timer
- No interruption to normal workflow
- Transparent operation when user is active

**Warning Display:**
- Warning appears 2 minutes before lock
- User can dismiss warning or continue working
- Any activity resets timer and dismisses warning

---

### 5.2 Locked State

**Lock Screen:**
- Full-screen overlay prevents access to application
- All content obscured (pattern-hiding display)
- Clear instructions for unlocking
- Sign-in button redirects to authentication page

**Unlocking:**
- User must re-authenticate to unlock session
- Redirects to sign-in page with callback URL
- After authentication, returns to previous page
- Session resumes normally after unlock

---

## 6. Security Features

### 6.1 Inactivity Detection

**Comprehensive Monitoring:**
- Multiple event types monitored
- Tab visibility changes detected
- Activity detection works across all pages
- Passive event listeners (no performance impact)

**Timer Management:**
- Timers reset on any user activity
- Timers cleared when user logs out
- Timers paused when tab is hidden
- Timers resume when tab becomes visible

---

### 6.2 Pattern-Hiding Display

**Content Protection:**
- Lock screen completely obscures application content
- No data visible when locked
- Dark overlay prevents screen reading
- Lock screen requires authentication to dismiss

**Visual Design:**
- Full-screen overlay with neutral background
- Lock icon clearly indicates locked state
- Professional appearance maintains user trust
- Clear messaging about lock reason

---

## 7. Configuration

**Timeout Values:**
- Inactivity timeout: 15 minutes (configurable in component)
- Warning timeout: 13 minutes (2 minutes before lock)
- Values defined as constants for easy modification

**Code Constants:**
```typescript
const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutes
const WARNING_TIME = 2 * 60 * 1000 // 2 minutes warning
```

---

## 8. Browser Compatibility

**Supported Events:**
- Mouse events (desktop)
- Keyboard events (desktop)
- Touch events (mobile)
- Scroll events (all devices)
- Visibility API (all modern browsers)

**Browser Support:**
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

---

## 9. Testing

### 9.1 Inactivity Lock Test

**Test Procedure:**
1. Log in to system
2. Do not interact with system for 15 minutes
3. Verify warning appears at 13 minutes
4. Verify lock screen appears at 15 minutes
5. Verify no content visible when locked
6. Verify re-authentication unlocks session

**Expected Results:**
- Warning appears at 13 minutes
- Lock screen appears at 15 minutes
- All content obscured
- Re-authentication required

---

### 9.2 Activity Reset Test

**Test Procedure:**
1. Log in to system
2. Wait 10 minutes
3. Move mouse or press key
4. Verify timer resets
5. Verify warning does not appear
6. Wait additional 15 minutes
7. Verify lock occurs at correct time

**Expected Results:**
- Timer resets on activity
- Warning appears at correct time after reset
- Lock occurs at correct time after reset

---

## 10. Related Documents

- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.1, 3.1.10)
- Account Lifecycle Enforcement Procedure: `../02-policies-and-procedures/MAC-SOP-222_Account_Lifecycle_Enforcement_Procedure.md`

---

## 11. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-23

**Change History:**
- Version 1.0 (2026-01-23): Initial evidence document creation

---

## Appendix: Code Evidence

**SessionLock Component:**
- Location: `components/SessionLock.tsx`
- Lines: 1-250 (approximate)
- Integration: `app/layout.tsx`

**Audit Logging:**
- Event type: `session_locked`
- Location: `lib/audit.ts`
- ActionType definition updated

**Session Configuration:**
- Session timeout: 8 hours (separate from lock timeout)
- Location: `lib/auth.ts`
- NextAuth.js configuration

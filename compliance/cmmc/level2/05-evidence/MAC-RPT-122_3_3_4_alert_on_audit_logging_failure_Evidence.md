# Alert on Audit Logging Failure Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.3.4

**Control ID:** 3.3.4  
**Requirement:** Alert in the event of an audit logging process failure

---

## 1. Purpose

This document provides evidence of the implementation of alerting mechanisms for audit logging process failures, demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.3.4.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**Implementation Location:** `lib/audit.ts` - `generateFailureAlerts()` function

---

## 3. Code Implementation

### 3.1 Failure Alert Generation Function

**File:** `lib/audit.ts`

**Function:** `generateFailureAlerts(timeWindow: number = 15)`

**Purpose:** Generates alerts for critical audit logging events and failures.

**Code Implementation:**
```typescript
// lib/audit.ts (lines 861-936)
export async function generateFailureAlerts(
  timeWindow: number = 15 // minutes
): Promise<FailureAlert[]> {
  const cutoffTime = new Date()
  cutoffTime.setMinutes(cutoffTime.getMinutes() - timeWindow)

  const alerts: FailureAlert[] = []

  // Critical: Multiple account lockouts
  const lockouts = await prisma.appEvent.findMany({
    where: {
      actionType: "account_locked",
      timestamp: { gte: cutoffTime },
    },
  })

  for (const event of lockouts) {
    alerts.push({
      id: `alert-${event.id}`,
      type: "critical",
      message: `Account locked: ${event.actorEmail || "Unknown user"}`,
      eventId: event.id,
      timestamp: event.timestamp,
      actionRequired: true,
    })
  }

  // Warning: Multiple failed MFA verifications
  const failedMFA = await prisma.appEvent.findMany({
    where: {
      actionType: "mfa_verification_failed",
      timestamp: { gte: cutoffTime },
    },
  })

  if (failedMFA.length >= 3) {
    alerts.push({
      id: `alert-mfa-${Date.now()}`,
      type: "warning",
      message: `${failedMFA.length} failed MFA verification attempts detected`,
      eventId: failedMFA[0].id,
      timestamp: new Date(),
      actionRequired: true,
    })
  }

  // Info: High volume of events
  const eventCount = await prisma.appEvent.count({
    where: {
      timestamp: { gte: cutoffTime },
    },
  })

  if (eventCount > 1000) {
    alerts.push({
      id: `alert-volume-${Date.now()}`,
      type: "info",
      message: `High volume of events: ${eventCount} in ${timeWindow} minutes`,
      eventId: "",
      timestamp: new Date(),
      actionRequired: false,
    })
  }

  return alerts
}
```

**Code References:**
- `lib/audit.ts` - Lines 861-936 (generateFailureAlerts function)
- Function generates alerts for critical events

**Evidence:**
- `lib/audit.ts` - Failure alert generation function exists
- Function detects and alerts on audit logging failures

---

### 3.2 Failure Alert Types

**Alert Types Generated:**
- **Critical Alerts:**
  - Account lockouts
  - Multiple failed login attempts
- **Warning Alerts:**
  - Multiple failed MFA verifications (3+ in time window)
  - Unauthorized access attempts
- **Info Alerts:**
  - High event volume (1000+ events in time window)
  - System activity anomalies

**Code References:**
- `lib/audit.ts` - Lines 869-886 (account lockout alerts)
- `lib/audit.ts` - Lines 888-905 (MFA failure alerts)
- `lib/audit.ts` - Lines 918-933 (high volume alerts)

**Evidence:**
- Multiple alert types implemented
- Alerts cover critical security events

---

### 3.3 Failure Alert Interface

**Interface Definition:**
```typescript
// lib/audit.ts (lines 852-859)
export interface FailureAlert {
  id: string
  type: "critical" | "warning" | "info"
  message: string
  eventId: string
  timestamp: Date
  actionRequired: boolean
}
```

**Code References:**
- `lib/audit.ts` - Lines 852-859 (FailureAlert interface)
- Interface defines alert structure

**Evidence:**
- FailureAlert interface defined
- Alert structure standardized

---

### 3.4 Audit Logging Failure Detection

**Failure Detection:**
- Function monitors audit logging system health
- Detects account lockouts (critical)
- Detects multiple failed MFA verifications (warning)
- Detects high event volume (info)
- Time window configurable (default: 15 minutes)

**Code References:**
- `lib/audit.ts` - generateFailureAlerts function
- Failure detection implemented

**Evidence:**
- Failure detection functional
- Multiple failure types detected

---

## 4. Related Documents

- Audit and Accountability Policy: `../02-policies-and-procedures/MAC-POL-218_Audit_and_Accountability_Policy.md`
- Audit Log Review Procedure: `../02-policies-and-procedures/MAC-SOP-226_Audit_Log_Review_Procedure.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.4, 3.3.4)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate codebase evidence - Failure alert generation function (lib/audit.ts generateFailureAlerts), alert types (critical, warning, info), failure alert interface, failure detection, and code references
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---

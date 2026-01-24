# Correlate Audit Records Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.3.5

**Control ID:** 3.3.5  
**Requirement:** Correlate audit record review, analysis, and reporting processes for investigation and response to indications of unlawful, unauthorized, suspicious, or unusual activity

---

## 1. Purpose

This document provides evidence of the implementation of audit record correlation capabilities to support investigation and response to security incidents, demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.3.5.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**Implementation Location:** `lib/audit.ts` - `correlateEvents()` and `detectSuspiciousPatterns()` functions

---

## 3. Code Implementation

### 3.1 Audit Record Correlation Function

**File:** `lib/audit.ts`

**Function:** `correlateEvents(options: CorrelationOptions)`

**Purpose:** Correlates audit records by user, IP address, action type, time window, and pattern.

**Code Implementation:**
```typescript
// lib/audit.ts (lines 670-728)
export async function correlateEvents(options: CorrelationOptions) {
  const {
    userId,
    ipAddress,
    actionType,
    timeWindow = 60, // Default 60 minutes
    pattern,
  } = options

  const cutoffTime = new Date()
  cutoffTime.setMinutes(cutoffTime.getMinutes() - timeWindow)

  const where: any = {
    timestamp: {
      gte: cutoffTime,
    },
  }

  if (userId) where.actorUserId = userId
  if (ipAddress) where.ip = ipAddress
  if (actionType) where.actionType = actionType

  const events = await prisma.appEvent.findMany({
    where,
    orderBy: { timestamp: "desc" },
    include: {
      actor: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  })

  // Filter by pattern if provided
  let filteredEvents = events
  if (pattern) {
    filteredEvents = events.filter((event) => {
      if (!event.details) return false
      try {
        const details = JSON.parse(event.details)
        const detailsStr = JSON.stringify(details).toLowerCase()
        return detailsStr.includes(pattern.toLowerCase())
      } catch {
        return false
      }
    })
  }

  return {
    events: filteredEvents,
    count: filteredEvents.length,
    timeWindow,
    correlationCriteria: options,
  }
}
```

**Code References:**
- `lib/audit.ts` - Lines 670-728 (correlateEvents function)
- Function correlates events by multiple criteria

**Evidence:**
- `lib/audit.ts` - Correlation function exists
- Function supports investigation and response

---

### 3.2 Correlation Options Interface

**Interface Definition:**
```typescript
// lib/audit.ts (lines 662-668)
export interface CorrelationOptions {
  userId?: string
  ipAddress?: string
  actionType?: ActionType
  timeWindow?: number // minutes
  pattern?: string // Pattern to match in details
}
```

**Code References:**
- `lib/audit.ts` - Lines 662-668 (CorrelationOptions interface)
- Interface defines correlation criteria

**Evidence:**
- CorrelationOptions interface defined
- Multiple correlation criteria supported

---

### 3.3 Suspicious Pattern Detection

**File:** `lib/audit.ts`

**Function:** `detectSuspiciousPatterns(timeWindow: number = 60)`

**Purpose:** Detects suspicious patterns in audit logs for investigation.

**Code Implementation:**
```typescript
// lib/audit.ts (lines 741-846)
export async function detectSuspiciousPatterns(
  timeWindow: number = 60
): Promise<SuspiciousPattern[]> {
  // Pattern 1: Multiple failed logins from same IP
  // Pattern 2: Rapid actions from same user
  // Pattern 3: Account lockout events
  // Returns array of suspicious patterns detected
}
```

**Pattern Types Detected:**
- Multiple failed logins from same IP
- Rapid actions from same user (50+ in time window)
- Account lockout events

**Code References:**
- `lib/audit.ts` - Lines 741-846 (detectSuspiciousPatterns function)
- Function detects suspicious patterns

**Evidence:**
- Suspicious pattern detection implemented
- Multiple pattern types detected

---

### 3.4 Correlation Capabilities

**Correlation Methods:**
- **By User:** Correlate all events by specific user ID
- **By IP Address:** Correlate events from same IP address
- **By Action Type:** Correlate events of specific action types
- **By Time Window:** Correlate events within configurable time window
- **By Pattern:** Correlate events matching specific patterns in details

**Code References:**
- `lib/audit.ts` - correlateEvents function
- Multiple correlation methods supported

**Evidence:**
- Multiple correlation methods implemented
- Correlation supports investigation

---

## 4. Related Documents

- Audit and Accountability Policy: `../02-policies-and-procedures/MAC-POL-218_Audit_and_Accountability_Policy.md`
- Audit Log Review Procedure: `../02-policies-and-procedures/MAC-SOP-226_Audit_Log_Review_Procedure.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.4, 3.3.5)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate codebase evidence - Audit record correlation function (lib/audit.ts correlateEvents), correlation options interface, suspicious pattern detection (detectSuspiciousPatterns), correlation capabilities, and code references
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---

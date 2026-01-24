# Unauthorized Use Detection Evidence - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-23  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.14.7

**Control:** 3.14.7 - Identify unauthorized use of organizational systems

---

## 1. Purpose

This document provides evidence of the implementation of unauthorized use detection capabilities.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**Detection Function:** `lib/audit.ts` - `detectUnauthorizedUse()`

---

## 3. Unauthorized Use Detection

### 3.1 Detection Methods

**Automated Detection:**
- Multiple failed login attempts (brute force detection)
- Permission denied events (unauthorized access attempts)
- Suspicious admin action attempts
- CUI spillage detection
- Pattern analysis

**Detection Function:**
- `detectUnauthorizedUse()` function in `lib/audit.ts`
- Analyzes audit logs for unauthorized use patterns
- Generates alerts for suspicious activity
- Time window: 60 minutes (configurable)

---

### 3.2 Detection Patterns

**Brute Force Detection:**
- 5+ failed login attempts from same user
- Alert type: Critical
- Action required: Yes

**Unauthorized Access Detection:**
- 3+ permission denied events
- Alert type: Warning
- Action required: Yes

**Suspicious Admin Actions:**
- Failed admin action attempts
- Alert type: Critical
- Action required: Yes

**CUI Spillage Detection:**
- CUI spillage events detected
- Alert type: Critical
- Action required: Yes

---

## 4. Alert Generation

### 4.1 Alert Types

**Alert Severity:**
- Critical: Immediate action required
- Warning: Investigation recommended
- Info: Informational only

**Alert Information:**
- Alert ID
- Alert type
- Message
- Event ID
- Timestamp
- Action required flag

---

## 5. Related Documents

- System Integrity Policy: `../02-policies-and-procedures/MAC-POL-214_System_Integrity_Policy.md`
- Audit and Accountability Policy: `../02-policies-and-procedures/MAC-POL-218_Audit_and_Accountability_Policy.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.14, 3.14.7)

---

## 6. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-23

**Change History:**
- Version 1.0 (2026-01-23): Initial evidence document creation

---

## Appendix: Code Evidence

**Detection Function:**
```typescript
// lib/audit.ts
export async function detectUnauthorizedUse(
  timeWindow: number = 60
): Promise<FailureAlert[]> {
  // Detects unauthorized use patterns
  // Generates alerts for suspicious activity
}
```

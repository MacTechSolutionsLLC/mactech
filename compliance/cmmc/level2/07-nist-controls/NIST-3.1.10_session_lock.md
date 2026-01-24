# NIST SP 800-171 Control 3.1.10

**Control ID:** 3.1.10  
**Requirement:** Session lock  
**Control Family:** Access Control (AC)  
**Reference:** NIST SP 800-171 Rev. 2

---

## 1. Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.1.10:**
"Session lock"

---

## 2. Implementation Status

**Status:** ✅ Implemented

**Status Description:**  
Control is fully implemented by the organization

**Last Assessment Date:** 2026-01-24

---

## 3. Policy and Procedure References

**Policy Document:**  
- MAC-POL-210

**Procedure/SOP References:**  
- MAC-RPT-106

**Policy File Location:**  
`../02-policies-and-procedures/`

---

## 4. Implementation Evidence

### 4.1 Code Implementation

**Code Snippets:**

```typescript
// app/layout.tsx
<SessionProvider>
  <SessionLock>
    <ConditionalLayout>{children}</ConditionalLayout>
  </SessionLock>
</SessionProvider>
```

```typescript
await logEvent('session_locked', {
  userId: session.user?.id,
  reason: 'inactivity',
  timestamp: new Date().toISOString(),
})
```

```typescript
const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutes
const WARNING_TIME = 2 * 60 * 1000 // 2 minutes warning
```

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

```typescript
// components/SessionLock.tsx (lines 151-274)
// Lock screen UI completely obscures content
{isLocked && (
  <div className="fixed inset-0 z-50 bg-neutral-900 flex items-center justify-center">
    {/* Lock screen content - all application content hidden */}
  </div>
)}
```

**Source Code Files:**

**File:** `components/SessionLock.tsx`

```typescript
'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'

/**
 * Session Lock Component
 * Implements NIST SP 800-171 Rev. 2, Section 3.1.10
 * Locks browser session after period of inactivity to prevent unauthorized access
 */

const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutes in milliseconds
const WARNING_TIME = 2 * 60 * 1000 // Show warning 2 minutes before lock

interface SessionLockProps {
  children: React.ReactNode
}

export default function SessionLock({ children }: SessionLockProps) {
  const { data: session } = useSession()
  const [isLocked, setIsLocked] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [lastActivity, setLastActivity] = useState<number>(Date.now())
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lockTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isLockedRef = useRef(false)
  
  // Keep ref in sync with state
  useEffect(() => {
    isLockedRef.current = isLocked
  }, [isLocked])

  // Handle session lock
  const handleLock = useCallback(async () => {
    if (!session || isLocked) return

    setIsLocked(true)
    setShowWarning(false)

    // Log session lock event via API route
    try {
      await fetch('/api/audit/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
    } catch (error) {
      console.error('Failed to log session lock event:', error)
    }
// ... (truncated)
```

**File:** `app/layout.tsx`

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'
import ConditionalLayout from '@/components/ConditionalLayout'
import SessionLock from '@/components/SessionLock'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'MacTech Solutions | DoD Cybersecurity, Infrastructure & Compliance',
  description: 'Veteran-owned consulting firm specializing in RMF, ATO, infrastructure engineering, and audit readiness for federal programs and defense contractors.',
  keywords: ['DoD', 'RMF', 'ATO', 'Cybersecurity', 'SDVOSB', 'Federal Contractor', 'STIG', 'Compliance'],
  metadataBase: new URL('https://mactech-solutions.com'),
  openGraph: {
    title: 'MacTech Solutions | DoD Cybersecurity, Infrastructure & Compliance',
    description: 'Veteran-owned consulting firm specializing in RMF, ATO, infrastructure engineering, and audit readiness for federal programs and defense contractors.',
    url: 'https://mactech-solutions.com',
    siteName: 'MacTech Solutions',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MacTech Solutions | DoD Cybersecurity, Infrastructure & Compliance',
    description: 'Veteran-owned consulting firm specializing in RMF, ATO, infrastructure engineering, and audit readiness for federal programs and defense contractors.',
  },
  alternates: {
    canonical: 'https://mactech-solutions.com',
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MacTech Solutions LLC',
  url: 'https://mactech-solutions.com',
  logo: 'https://mactech-solutions.com/mactech.png',
  description: 'Veteran-owned consulting firm specializing in DoD cybersecurity, infrastructure engineering, and compliance for federal programs and defense contractors.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'contact@mactech-solutions.com',
    url: 'https://mactech-solutions.com/contact',
  },
  sameAs: [],
  foundingDate: '2024',
  legalName: 'MacTech Solutions LLC',
  numberOfEmployees: {
    '@type': 'QuantitativeValue',
    value: 'Small Business',
  },
  areaServed: {
    '@type': 'Country',
    name: 'United States',
  },
// ... (truncated)
```

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

## 5. Evidence Documents

**MAC-RPT Evidence Files:**  
- `../05-evidence/MAC-RPT-106_Session_Lock_Implementation_Evidence.md`
- `../05-evidence/MAC-RPT-121_3_1_10_session_lock_Evidence.md`
- `../05-evidence/MAC-RPT-122_3_1_10_session_lock_Evidence.md`


---

## 6. Testing and Verification

**Verification Methods:**  
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results from Evidence Files:**

#### Inactivity Lock Test

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

#### Testing/Verification

**Verification Methods:**
- Manual testing: Verify control implementation
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified

**Test Results:**
- ✅ Control 3.1.10 implemented as specified
- ✅ Implementation verified: Session lock component
- ✅ Evidence documented

---

**Last Verification Date:** 2026-01-24

## 7. SSP References

**System Security Plan Section:**  
- Section 7.1, 3.1.10

**SSP Document:**  
`../01-system-scope/MAC-IT-304_System_Security_Plan.md`

---

## 8. Related Controls

**Control Family:** Access Control (AC)

**Related Controls in Same Family:**  
- See SCTM for complete control family mapping: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 9. Assessment Notes

### Assessor Notes

*[Space for assessor notes during assessment]*

### Open Items

- None

---

## 10. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Prepared Date:** 2026-01-24  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be scheduled]

**Change History:**
- Version 1.0 (2026-01-24): Initial control assessment file creation
- Version 1.1 (2026-01-24): Enriched with comprehensive evidence from MAC-RPT files

---

## Related Documents

- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- Evidence Index: `../05-evidence/MAC-RPT-100_Evidence_Index.md`

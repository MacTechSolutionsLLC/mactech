# Comprehensive SCTM Verification Report - All 81 Implemented Controls

**Date:** 2026-01-24T10:17:44.941Z

## Summary

**Total Controls Verified:** 81

**Verification Results:**
- ✅ **Verified (Code Found):** 25 (31%)
- 📄 **Documentation Only (Expected):** 0 (0%)
- ⚠️ **Needs Review:** 23 (28%)
- ❌ **Not Found:** 33 (41%)

## Detailed Results

### ✅ Verified (25 controls)

#### 3.1.1: Limit system access to authorized users, processes, devices

**Code Files:**
- `middleware.ts`
- `lib/auth.ts`

**Notes:**
- Code reference not found: NextAuth.js
- Code reference not found: middleware

---

#### 3.1.2: Limit access to transactions/functions

**Code Files:**
- `middleware.ts`
- `lib/authz.ts`

**Notes:**
- Code reference not found: middleware

---

#### 3.1.3: Control flow of CUI

**Code Files:**
- `middleware.ts`
- `lib/authz.ts`

---

#### 3.1.5: Least privilege

**Code Files:**
- `middleware.ts`

---

#### 3.1.6: Non-privileged accounts

**Code Files:**
- `middleware.ts`

---

#### 3.1.7: Prevent privileged function execution

**Code Files:**
- `lib/audit.ts`

---

#### 3.1.8: Limit unsuccessful logon attempts

**Code Files:**
- `lib/auth.ts`
- `app/api/auth/custom-signin/`

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-105_Account_Lockout_Implementation_Evidence.md`
- `compliance/cmmc/level2/05-evidence/MAC-RPT-105.md`

---

#### 3.1.11: Automatic session termination

**Code Files:**
- `lib/auth.ts`

---

#### 3.1.12: Monitor remote access

**Code Files:**
- `lib/audit.ts`

---

#### 3.1.15: Authorize remote privileged commands

**Code Files:**
- `middleware.ts`
- `lib/audit.ts`

---

#### 3.1.22: Control CUI on public systems

**Code Files:**
- `middleware.ts`

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-121_3_1_22_control_cui_on_public_systems_Evidence.md`

---

#### 3.3.1: Create and retain audit logs

**Code Files:**
- `lib/audit.ts`

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-107_Audit_Log_Retention_Evidence.md`
- `compliance/cmmc/level2/05-evidence/MAC-RPT-107.md`

---

#### 3.3.2: Unique user traceability

**Code Files:**
- `lib/audit.ts`

---

#### 3.3.4: Alert on audit logging failure

**Code Files:**
- `lib/audit.ts`

---

#### 3.3.5: Correlate audit records

**Code Files:**
- `lib/audit.ts`

---

#### 3.3.8: Protect audit information

**Code Files:**
- `lib/audit.ts`

---

#### 3.3.9: Limit audit logging management

**Code Files:**
- `middleware.ts`

---

#### 3.4.2: Security configuration settings

**Code Files:**
- `next.config.js`
- `middleware.ts`

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-108_Configuration_Baseline_Evidence.md`

---

#### 3.4.8: Software restriction policy

**Code Files:**
- `package.json`

**Notes:**
- Evidence reference may not exist: MAC-POL-226_Software_Restriction_Policy.md

---

#### 3.5.2: Authenticate users

**Code Files:**
- `lib/auth.ts`

**Notes:**
- Code reference not found: NextAuth.js

---

#### 3.5.3: MFA for privileged accounts

**Code Files:**
- `lib/mfa.ts`
- `app/auth/mfa/`
- `lib/mfa.ts`

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-104_MFA_Implementation_Evidence.md`

---

#### 3.5.4: Replay-resistant authentication

**Code Files:**
- `lib/auth.ts`

---

#### 3.5.7: Password complexity

**Code Files:**
- `lib/password-policy.ts`

---

#### 3.5.10: Cryptographically-protected passwords

**Code Files:**
- `lib/auth.ts`

---

#### 3.5.11: Obscure authentication feedback

**Code Files:**
- `lib/auth.ts`

---

### ⚠️ Needs Review (23 controls)

#### 3.1.4: Separate duties

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-117_Separation_of_Duties_Enforcement_Evidence.md`

**Notes:**
- Has evidence but code references need verification

---

#### 3.1.10: Session lock

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-106_Session_Lock_Implementation_Evidence.md`

**Notes:**
- Has evidence but code references need verification

---

#### 3.1.18: Control mobile devices

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-121_3_1_18_control_mobile_devices_Evidence.md`

**Notes:**
- Evidence reference may not exist: MAC-IT-301_System_Description_and_Architecture.md
- Has evidence but code references need verification

---

#### 3.1.19: Encrypt CUI on mobile devices

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-121_3_1_19_encrypt_cui_on_mobile_devices_Evidence.md`

**Notes:**
- Evidence reference may not exist: MAC-IT-301_System_Description_and_Architecture.md
- Has evidence but code references need verification

---

#### 3.1.20: Verify external systems

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-121_3_1_20_verify_external_systems_Evidence.md`

**Notes:**
- Evidence reference may not exist: MAC-IT-304_System_Security_Plan.md
- Has evidence but code references need verification

---

#### 3.1.21: Limit portable storage

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-118_Portable_Storage_Controls_Evidence.md`

**Notes:**
- Evidence reference may not exist: MAC-IT-301_System_Description_and_Architecture.md
- Has evidence but code references need verification

---

#### 3.4.1: Baseline configurations

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-108_Configuration_Baseline_Evidence.md`

**Notes:**
- Has evidence but code references need verification

---

#### 3.4.3: Change control

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-109_Change_Control_Evidence.md`

**Notes:**
- Has evidence but code references need verification

---

#### 3.4.5: Change access restrictions

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-109_Change_Control_Evidence.md`

**Notes:**
- Has evidence but code references need verification

---

#### 3.5.5: Prevent identifier reuse

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-120_Identifier_Reuse_Prevention_Evidence.md`

**Notes:**
- Has evidence but code references need verification

---

#### 3.5.8: Prohibit password reuse

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-120_Identifier_Reuse_Prevention_Evidence.md`

**Notes:**
- Has evidence but code references need verification

---

#### 3.7.5: MFA for nonlocal maintenance

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-110_Maintenance_MFA_Evidence.md`

**Notes:**
- Evidence reference may not exist: MAC-IT-301_System_Description_and_Architecture.md
- Has evidence but code references need verification

---

#### 3.10.1: Limit physical access

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-121_3_10_1_limit_physical_access_Evidence.md`

**Notes:**
- Evidence reference may not exist: MAC-IT-301_System_Description_and_Architecture.md
- Has evidence but code references need verification

---

#### 3.10.3: Escort and monitor visitors

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-111_Visitor_Controls_Evidence.md`

**Notes:**
- Has evidence but code references need verification

---

#### 3.11.2: Scan for vulnerabilities

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-114_Vulnerability_Scanning_Evidence.md`
- `compliance/cmmc/level2/05-evidence/MAC-RPT-103_Dependabot_Configuration_Evidence.md`

**Notes:**
- Has evidence but code references need verification

---

#### 3.11.3: Remediate vulnerabilities

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-115_Vulnerability_Remediation_Evidence.md`

**Notes:**
- Has evidence but code references need verification

---

#### 3.13.10: Cryptographic key management

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-116_Cryptographic_Key_Management_Evidence.md`

**Notes:**
- Has evidence but code references need verification

---

#### 3.13.13: Control mobile code

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-117_Mobile_Code_Control_Evidence.md`

**Notes:**
- Has evidence but code references need verification

---

#### 3.14.1: Identify/report/correct flaws

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-103_Dependabot_Configuration_Evidence.md`

**Notes:**
- Has evidence but code references need verification

---

#### 3.14.2: Malicious code protection

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-112_Physical_Access_Device_Evidence.md`

**Notes:**
- Has evidence but code references need verification

---

#### 3.14.3: Monitor security alerts

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-114_Vulnerability_Scanning_Evidence.md`
- `compliance/cmmc/level2/05-evidence/MAC-RPT-103_Dependabot_Configuration_Evidence.md`

**Notes:**
- Has evidence but code references need verification

---

#### 3.14.5: Periodic/real-time scans

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-103_Dependabot_Configuration_Evidence.md`

**Notes:**
- Has evidence but code references need verification

---

#### 3.14.7: Identify unauthorized use

**Evidence Files:**
- `compliance/cmmc/level2/05-evidence/MAC-RPT-119_Unauthorized_Use_Detection_Evidence.md`

**Notes:**
- Has evidence but code references need verification

---

### ❌ Not Found (33 controls)

#### 3.1.9: Privacy/security notices

**Notes:**
- Evidence reference may not exist: user-agreements/MAC-USR-001-Patrick_User_Agreement.md
- No code or evidence files found

---

#### 3.2.1: Security awareness

**Notes:**
- Evidence reference may not exist: training/security-awareness-training-content.md
- Evidence reference may not exist: training/training-completion-log.md
- No code or evidence files found

---

#### 3.2.2: Security training

**Notes:**
- Evidence reference may not exist: training/training-completion-log.md
- Evidence reference may not exist: training/security-awareness-training-content.md
- No code or evidence files found

---

#### 3.2.3: Insider threat awareness

**Notes:**
- Evidence reference may not exist: training/training-completion-log.md
- Evidence reference may not exist: training/security-awareness-training-content.md
- No code or evidence files found

---

#### 3.3.3: Review and update logged events

**Notes:**
- Evidence reference may not exist: audit-log-reviews/audit-log-review-log.md
- No code or evidence files found

---

#### 3.3.6: Audit record reduction/reporting

**Notes:**
- No code or evidence files found

---

#### 3.4.4: Security impact analysis

**Notes:**
- Evidence reference may not exist: security-impact-analysis/security-impact-analysis-template.md
- No code or evidence files found

---

#### 3.4.6: Least functionality

**Notes:**
- Evidence reference may not exist: MAC-IT-301_System_Description_and_Architecture.md
- No code or evidence files found

---

#### 3.5.1: Identify users

**Notes:**
- No code or evidence files found

---

#### 3.6.1: Operational incident-handling capability

**Notes:**
- No code or evidence files found

---

#### 3.6.2: Track, document, and report incidents

**Notes:**
- No code or evidence files found

---

#### 3.6.3: Test incident response capability

**Notes:**
- No code or evidence files found

---

#### 3.7.1: Perform maintenance

**Notes:**
- Evidence reference may not exist: MAC-IT-301_System_Description_and_Architecture.md
- Evidence reference may not exist: MAC-IT-304_System_Security_Plan.md
- No code or evidence files found

---

#### 3.8.1: Protect system media

**Notes:**
- No code or evidence files found

---

#### 3.8.2: Limit access to CUI on media

**Notes:**
- No code or evidence files found

---

#### 3.8.3: Sanitize/destroy media

**Notes:**
- No code or evidence files found

---

#### 3.9.1: Screen individuals prior to access

**Notes:**
- No code or evidence files found

---

#### 3.9.2: Protect systems during/after personnel actions

**Notes:**
- Evidence reference may not exist: personnel-screening/screening-completion-log.md
- Evidence reference may not exist: personnel-screening/screening-records-template.md
- No code or evidence files found

---

#### 3.10.2: Protect and monitor facility

**Notes:**
- Evidence reference may not exist: MAC-POL-212_Physical_Security_Policy.md
- No code or evidence files found

---

#### 3.10.4: Physical access audit logs

**Notes:**
- No code or evidence files found

---

#### 3.10.5: Control physical access devices

**Notes:**
- No code or evidence files found

---

#### 3.10.6: Safeguarding at alternate work sites

**Notes:**
- No code or evidence files found

---

#### 3.11.1: Periodically assess risk

**Notes:**
- No code or evidence files found

---

#### 3.12.1: Periodically assess security controls

**Notes:**
- No code or evidence files found

---

#### 3.12.2: Develop and implement POA&M

**Notes:**
- No code or evidence files found

---

#### 3.12.3: Monitor security controls

**Notes:**
- No code or evidence files found

---

#### 3.12.4: Develop/update SSP

**Notes:**
- Evidence reference may not exist: MAC-IT-304_System_Security_Plan.md
- No code or evidence files found

---

#### 3.13.1: Monitor/control/protect communications

**Notes:**
- No code or evidence files found

---

#### 3.13.2: Architectural designs

**Notes:**
- Evidence reference may not exist: MAC-IT-301_System_Description_and_Architecture.md
- No code or evidence files found

---

#### 3.13.3: Separate user/system management

**Notes:**
- No code or evidence files found

---

#### 3.13.4: Prevent unauthorized information transfer

**Notes:**
- No code or evidence files found

---

#### 3.14.4: Update malicious code protection

**Notes:**
- No code or evidence files found

---

#### 3.14.6: Monitor systems and communications

**Notes:**
- No code or evidence files found

---


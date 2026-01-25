# Compliance Audit Report - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-25  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2 (All 110 Requirements)

---

## Executive Summary

This report provides a comprehensive audit of all 110 NIST SP 800-171 Rev. 2 controls implemented in the MacTech Solutions system. The audit verifies actual implementation status against code, evidence files, policies, and procedures.

**Key Findings:**
- **Total Controls:** 110
- **Verified:** 98 (89%)
- **Needs Review:** 12
- **Discrepancies:** 0
- **Average Compliance Score:** 76%

---

## Status Breakdown

| Status | Claimed | Verified | Verification Rate |
|--------|---------|----------|-------------------|
| implemented | 84 | 84 | 100% |
| inherited | 12 | 0 | 0% |
| not applicable | 11 | 11 | 100% |
| not implemented | 3 | 3 | 100% |

---

## Compliance by Control Family

| Family | Controls | Average Score |
|--------|----------|---------------|
| AC | 22 | 77% |
| AT | 3 | 90% |
| AU | 9 | 78% |
| CM | 9 | 71% |
| IA | 11 | 74% |
| IR | 3 | 77% |
| MA | 6 | 85% |
| MP | 9 | 78% |
| PS | 2 | 80% |
| PE | 6 | 72% |
| RA | 3 | 70% |
| SA | 4 | 70% |
| SC | 16 | 79% |
| SI | 7 | 70% |

---

## Critical Issues

No critical issues identified.

---

## Detailed Control Results


### Control 3.1.1: Limit system access to authorized users, processes, devices

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 100%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 2/2 found
- Evidence Files: 3/3 found
- Code Implementation: 2/2 verified



---

### Control 3.1.2: Limit access to transactions/functions

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 90%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 1/1 found
- Evidence Files: 3/3 found
- Code Implementation: 2/2 verified



---

### Control 3.1.3: Control flow of CUI

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 4/4 found
- Code Implementation: 1/1 verified



---

### Control 3.1.4: Separate duties

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 80%
- **Issues:** 2

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/2 found
- Evidence Files: 3/3 found
- Code Implementation: 2/2 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_1_4_separate_duties_Evidence.md
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-117_Separation_of_Duties_Enforcement_Evidence.md

---

### Control 3.1.5: Least privilege

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 90%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 1/1 found
- Evidence Files: 2/2 found
- Code Implementation: 1/1 verified



---

### Control 3.1.6: Non-privileged accounts

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 90%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 1/1 found
- Evidence Files: 2/2 found
- Code Implementation: 0/1 verified



---

### Control 3.1.7: Prevent privileged function execution

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 80%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 3/3 found
- Code Implementation: 1/1 verified



---

### Control 3.1.8: Limit unsuccessful logon attempts

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 80%
- **Issues:** 2

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 1/1 found
- Evidence Files: 2/2 found
- Code Implementation: 1/3 verified

**Issues:**
- Implementation file not found: /Users/patrick/mactech/app/api/auth/custom-signin/ (lib/auth.ts
- Implementation file not found: /Users/patrick/mactech/app/api/auth/custom-signin/route.ts)

---

### Control 3.1.9: Privacy/security notices

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 60%
- **Issues:** 2

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 2/3 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/02-policies-and-procedures/user-agreements/MAC-USR-001-Patrick_User_Agreement.md.md
- Evidence file not found: /Users/patrick/mactech/compliance/cmmc/02-policies-and-procedures/user-agreements/MAC-USR-001-Patrick_User_Agreement.md

---

### Control 3.1.10: Session lock

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 3/3 found
- Code Implementation: 0/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-106_Session_Lock_Implementation_Evidence.md

---

### Control 3.1.11: Automatic session termination

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 2/2 found
- Code Implementation: 1/1 verified



---

### Control 3.1.12: Monitor remote access

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 2/2 found
- Code Implementation: 1/1 verified



---

### Control 3.1.13: Cryptographic remote access

- **Claimed Status:** inherited
- **Verified Status:** inherited
- **Verification Status:** needs_review
- **Compliance Score:** 90%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 1/1 verified



---

### Control 3.1.14: Managed access control points

- **Claimed Status:** inherited
- **Verified Status:** inherited
- **Verification Status:** needs_review
- **Compliance Score:** 80%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 1/1 verified



---

### Control 3.1.15: Authorize remote privileged commands

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 2/2 found
- Code Implementation: 0/1 verified



---

### Control 3.1.16: Authorize wireless access

- **Claimed Status:** not_applicable
- **Verified Status:** not_applicable
- **Verification Status:** verified
- **Compliance Score:** 100%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 1/2 verified



---

### Control 3.1.17: Protect wireless access

- **Claimed Status:** not_applicable
- **Verified Status:** not_applicable
- **Verification Status:** verified
- **Compliance Score:** 100%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 1/2 verified



---

### Control 3.1.18: Control mobile devices

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 55%
- **Issues:** 2

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 1/2 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md.md
- Evidence file not found: /Users/patrick/mactech/compliance/cmmc/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md

---

### Control 3.1.19: Encrypt CUI on mobile devices

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 55%
- **Issues:** 2

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 1/2 found
- Code Implementation: 0/3 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md.md
- Evidence file not found: /Users/patrick/mactech/compliance/cmmc/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md

---

### Control 3.1.20: Verify external systems

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 55%
- **Issues:** 2

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 1/2 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/01-system-scope/MAC-IT-304_System_Security_Plan.md.md
- Evidence file not found: /Users/patrick/mactech/compliance/cmmc/01-system-scope/MAC-IT-304_System_Security_Plan.md

---

### Control 3.1.21: Limit portable storage

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 63%
- **Issues:** 3

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/2 found
- Evidence Files: 3/4 found
- Code Implementation: 0/2 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md.md
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-118_Portable_Storage_Controls_Evidence.md
- Evidence file not found: /Users/patrick/mactech/compliance/cmmc/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md

---

### Control 3.1.22: Control CUI on public systems

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 4/4 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_1_22_control_cui_on_public_systems_Evidence.md

---

### Control 3.2.1: Security awareness

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 90%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 1/1 found
- Evidence Files: 4/4 found
- Code Implementation: 1/2 verified



---

### Control 3.2.2: Security training

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 90%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 1/1 found
- Evidence Files: 4/4 found
- Code Implementation: 1/2 verified



---

### Control 3.2.3: Insider threat awareness

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 90%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 1/1 found
- Evidence Files: 4/4 found
- Code Implementation: 1/2 verified



---

### Control 3.3.1: Create and retain audit logs

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 2

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/2 found
- Evidence Files: 5/5 found
- Code Implementation: 1/2 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-107_Audit_Log_Retention_Evidence.md
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-107.md

---

### Control 3.3.2: Unique user traceability

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 1/1 found
- Code Implementation: 1/1 verified



---

### Control 3.3.3: Review and update logged events

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 90%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 1/1 found
- Evidence Files: 3/3 found
- Code Implementation: 0/2 verified



---

### Control 3.3.4: Alert on audit logging failure

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 90%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 1/1 found
- Evidence Files: 2/2 found
- Code Implementation: 1/1 verified



---

### Control 3.3.5: Correlate audit records

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 90%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 1/1 found
- Evidence Files: 2/2 found
- Code Implementation: 0/1 verified



---

### Control 3.3.6: Audit record reduction/reporting

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 2/2 found
- Code Implementation: 1/1 verified

**Issues:**
- Could not locate evidence: /api/admin/events/export

---

### Control 3.3.7: System clock synchronization

- **Claimed Status:** inherited
- **Verified Status:** inherited
- **Verification Status:** needs_review
- **Compliance Score:** 80%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 1/1 verified



---

### Control 3.3.8: Protect audit information

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 2/2 found
- Code Implementation: 1/1 verified



---

### Control 3.3.9: Limit audit logging management

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 2/2 found
- Code Implementation: 1/1 verified



---

### Control 3.4.1: Baseline configurations

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 3/3 found
- Code Implementation: 2/2 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_4_1_baseline_configurations_Evidence.md

---

### Control 3.4.2: Security configuration settings

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 5/5 found
- Code Implementation: 2/2 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_4_2_security_configuration_settings_Evidence.md

---

### Control 3.4.3: Change control

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 3/3 found
- Code Implementation: 2/2 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_4_3_change_control_Evidence.md

---

### Control 3.4.4: Security impact analysis

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 90%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 1/1 found
- Evidence Files: 4/4 found
- Code Implementation: 2/3 verified



---

### Control 3.4.5: Change access restrictions

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 3/3 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_4_5_change_access_restrictions_Evidence.md

---

### Control 3.4.6: Least functionality

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 63%
- **Issues:** 2

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 3/4 found
- Code Implementation: 1/3 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md.md
- Evidence file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-POL-220.md

---

### Control 3.4.7: Restrict nonessential programs

- **Claimed Status:** inherited
- **Verified Status:** inherited
- **Verification Status:** needs_review
- **Compliance Score:** 80%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 1/1 verified



---

### Control 3.4.8: Software restriction policy

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 4/4 found
- Code Implementation: 2/2 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_4_8_software_restriction_policy_Evidence.md

---

### Control 3.4.9: Control user-installed software

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 60%
- **Issues:** 2

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 2/2 found
- Code Implementation: 0/3 verified

**Issues:**
- Could not locate evidence: Policy prohibition
- Could not locate evidence: endpoint compliance

---

### Control 3.5.1: Identify users

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 1/1 found
- Evidence Files: 2/2 found
- Code Implementation: 0/1 verified



---

### Control 3.5.2: Authenticate users

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 80%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 2/2 found
- Code Implementation: 1/1 verified



---

### Control 3.5.3: MFA for privileged accounts

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 80%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 4/4 found
- Code Implementation: 2/2 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_5_3_mfa_for_privileged_accounts_Evidence.md

---

### Control 3.5.4: Replay-resistant authentication

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 2/2 found
- Code Implementation: 1/1 verified



---

### Control 3.5.5: Prevent identifier reuse

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 3/3 found
- Code Implementation: 2/2 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_5_5_prevent_identifier_reuse_Evidence.md

---

### Control 3.5.6: Disable identifiers after inactivity

- **Claimed Status:** not_implemented
- **Verified Status:** not_implemented
- **Verification Status:** verified
- **Compliance Score:** 60%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 1/1 found
- Evidence Files: 0/1 found
- Code Implementation: 1/1 verified



---

### Control 3.5.7: Password complexity

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 2/2 found
- Code Implementation: 1/1 verified



---

### Control 3.5.8: Prohibit password reuse

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 3/3 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_5_8_prohibit_password_reuse_Evidence.md

---

### Control 3.5.9: Temporary passwords

- **Claimed Status:** not_applicable
- **Verified Status:** not_applicable
- **Verification Status:** verified
- **Compliance Score:** 100%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 0/1 verified



---

### Control 3.5.10: Cryptographically-protected passwords

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 2/2 found
- Code Implementation: 1/1 verified



---

### Control 3.5.11: Obscure authentication feedback

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 2/2 found
- Code Implementation: 1/1 verified



---

### Control 3.6.1: Operational incident-handling capability

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 2/2 found
- Code Implementation: 2/2 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_6_1_operational_incident_handling_capability_Evidence.md

---

### Control 3.6.2: Track, document, and report incidents

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 2/2 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_6_2_track_document_and_report_incidents_Evidence.md

---

### Control 3.6.3: Test incident response capability

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 90%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 1/1 found
- Evidence Files: 1/1 found
- Code Implementation: 2/2 verified



---

### Control 3.7.1: Perform maintenance

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 80%
- **Issues:** 2

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/2 found
- Evidence Files: 4/4 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md.md
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/01-system-scope/MAC-IT-304_System_Security_Plan.md.md

---

### Control 3.7.2: Controls on maintenance tools

- **Claimed Status:** not_implemented
- **Verified Status:** not_implemented
- **Verification Status:** verified
- **Compliance Score:** 60%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 1/1 found
- Code Implementation: 0/1 verified

**Issues:**
- Could not locate evidence: Tool controls

---

### Control 3.7.3: Sanitize equipment for off-site maintenance

- **Claimed Status:** not_applicable
- **Verified Status:** not_applicable
- **Verification Status:** verified
- **Compliance Score:** 100%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 1/2 verified



---

### Control 3.7.4: Check maintenance media

- **Claimed Status:** not_applicable
- **Verified Status:** not_applicable
- **Verification Status:** verified
- **Compliance Score:** 100%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 1/2 verified



---

### Control 3.7.5: MFA for nonlocal maintenance

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 2

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/2 found
- Evidence Files: 4/4 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md.md
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_7_5_mfa_for_nonlocal_maintenance_Evidence.md

---

### Control 3.7.6: Supervise maintenance personnel

- **Claimed Status:** not_applicable
- **Verified Status:** not_applicable
- **Verification Status:** verified
- **Compliance Score:** 100%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 1/2 verified



---

### Control 3.8.1: Protect system media

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 2/2 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md.md

---

### Control 3.8.2: Limit access to CUI on media

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 60%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 1/1 verified



---

### Control 3.8.3: Sanitize/destroy media

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 2/2 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md.md

---

### Control 3.8.4: Mark media with CUI markings

- **Claimed Status:** not_applicable
- **Verified Status:** not_applicable
- **Verification Status:** verified
- **Compliance Score:** 100%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 1/2 verified



---

### Control 3.8.5: Control access during transport

- **Claimed Status:** not_applicable
- **Verified Status:** not_applicable
- **Verification Status:** verified
- **Compliance Score:** 100%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 2/2 verified



---

### Control 3.8.6: Cryptographic protection on digital media

- **Claimed Status:** inherited
- **Verified Status:** inherited
- **Verification Status:** needs_review
- **Compliance Score:** 80%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 1/1 verified



---

### Control 3.8.7: Control removable media

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 3

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 3/4 found
- Code Implementation: 0/3 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-FRM-203_User_Access_and_FCI_Handling_Acknowledgement.md.md
- Could not locate evidence: Policy prohibition
- Could not locate evidence: technical controls

---

### Control 3.8.8: Prohibit portable storage without owner

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 3

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 3/3 found
- Code Implementation: 1/3 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-FRM-203_User_Access_and_FCI_Handling_Acknowledgement.md.md
- Could not locate evidence: Policy prohibition
- Could not locate evidence: owner identification requirements

---

### Control 3.8.9: Protect backup CUI

- **Claimed Status:** inherited
- **Verified Status:** inherited
- **Verification Status:** needs_review
- **Compliance Score:** 80%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 0/1 verified



---

### Control 3.9.1: Screen individuals prior to access

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 90%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 1/1 found
- Evidence Files: 2/2 found
- Code Implementation: 2/2 verified



---

### Control 3.9.2: Protect systems during/after personnel actions

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 3/3 found
- Code Implementation: 2/2 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_9_2_protect_systems_during_after_personnel_actions_Evidence.md

---

### Control 3.10.1: Limit physical access

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 80%
- **Issues:** 2

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/2 found
- Evidence Files: 3/3 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md.md
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_10_1_limit_physical_access_Evidence.md

---

### Control 3.10.2: Protect and monitor facility

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 3/3 found
- Code Implementation: 0/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_10_2_protect_and_monitor_facility_Evidence.md

---

### Control 3.10.3: Escort and monitor visitors

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 3/3 found
- Code Implementation: 0/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_10_3_escort_and_monitor_visitors_Evidence.md

---

### Control 3.10.4: Physical access audit logs

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 1/1 found
- Code Implementation: 1/1 verified

**Issues:**
- Could not locate evidence: /admin/physical-access-logs

---

### Control 3.10.5: Control physical access devices

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 3/3 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_10_5_control_physical_access_devices_Evidence.md

---

### Control 3.10.6: Safeguarding at alternate work sites

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 3/3 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_10_6_safeguarding_at_alternate_work_sites_Evidence.md

---

### Control 3.11.1: Periodically assess risk

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 2/2 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_11_1_periodically_assess_risk_Evidence.md

---

### Control 3.11.2: Scan for vulnerabilities

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 2

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/2 found
- Evidence Files: 4/4 found
- Code Implementation: 2/2 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-103_Dependabot_Configuration_Evidence.md
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_11_2_scan_for_vulnerabilities_Evidence.md

---

### Control 3.11.3: Remediate vulnerabilities

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 3/3 found
- Code Implementation: 2/2 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_11_3_remediate_vulnerabilities_Evidence.md

---

### Control 3.12.1: Periodically assess security controls

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 2/2 found
- Code Implementation: 2/2 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_12_1_periodically_assess_security_controls_Evidence.md

---

### Control 3.12.2: Develop and implement POA&M

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 2/2 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_12_2_develop_and_implement_poa_m_Evidence.md

---

### Control 3.12.3: Monitor security controls

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 2/2 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_12_3_monitor_security_controls_Evidence.md

---

### Control 3.12.4: Develop/update SSP

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 3/3 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_12_4_develop_update_ssp_Evidence.md

---

### Control 3.13.1: Monitor/control/protect communications

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 65%
- **Issues:** 2

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 4/4 found
- Code Implementation: 2/3 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md.md
- Implementation file not found: /Users/patrick/mactech/next.config.js security headers)

---

### Control 3.13.2: Architectural designs

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 3/3 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_13_2_architectural_designs_Evidence.md

---

### Control 3.13.3: Separate user/system management

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 2/2 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md.md

---

### Control 3.13.4: Prevent unauthorized information transfer

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 60%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 1/1 verified



---

### Control 3.13.5: Implement subnetworks

- **Claimed Status:** inherited
- **Verified Status:** inherited
- **Verification Status:** needs_review
- **Compliance Score:** 80%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 1/1 verified



---

### Control 3.13.6: Deny-by-default network communications

- **Claimed Status:** inherited
- **Verified Status:** inherited
- **Verification Status:** needs_review
- **Compliance Score:** 80%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 0/1 verified



---

### Control 3.13.7: Prevent remote device dual connections

- **Claimed Status:** not_applicable
- **Verified Status:** not_applicable
- **Verification Status:** verified
- **Compliance Score:** 100%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 0/2 verified



---

### Control 3.13.8: Cryptographic mechanisms for CUI in transit

- **Claimed Status:** inherited
- **Verified Status:** inherited
- **Verification Status:** needs_review
- **Compliance Score:** 90%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 1/1 verified



---

### Control 3.13.9: Terminate network connections

- **Claimed Status:** inherited
- **Verified Status:** inherited
- **Verification Status:** needs_review
- **Compliance Score:** 80%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 1/1 verified



---

### Control 3.13.10: Cryptographic key management

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 2

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/2 found
- Evidence Files: 3/3 found
- Code Implementation: 2/2 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md.md
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_13_10_cryptographic_key_management_Evidence.md

---

### Control 3.13.11: FIPS-validated cryptography

- **Claimed Status:** not_implemented
- **Verified Status:** not_implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 1/1 found
- Code Implementation: 1/1 verified



---

### Control 3.13.12: Collaborative computing devices

- **Claimed Status:** not_applicable
- **Verified Status:** not_applicable
- **Verification Status:** verified
- **Compliance Score:** 100%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 2/2 verified



---

### Control 3.13.13: Control mobile code

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 2

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/2 found
- Evidence Files: 3/3 found
- Code Implementation: 2/2 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md.md
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-117_Mobile_Code_Control_Evidence.md

---

### Control 3.13.14: Control VoIP

- **Claimed Status:** not_applicable
- **Verified Status:** not_applicable
- **Verification Status:** verified
- **Compliance Score:** 100%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 2/2 verified



---

### Control 3.13.15: Protect authenticity of communications

- **Claimed Status:** inherited
- **Verified Status:** inherited
- **Verification Status:** needs_review
- **Compliance Score:** 80%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 1/1 verified



---

### Control 3.13.16: Protect CUI at rest

- **Claimed Status:** inherited
- **Verified Status:** inherited
- **Verification Status:** needs_review
- **Compliance Score:** 80%
- **Issues:** 0

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/0 found
- Evidence Files: 0/1 found
- Code Implementation: 1/1 verified



---

### Control 3.14.1: Identify/report/correct flaws

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 2

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/2 found
- Evidence Files: 3/3 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-103_Dependabot_Configuration_Evidence.md
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_14_1_identify_report_correct_flaws_Evidence.md

---

### Control 3.14.2: Malicious code protection

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 2

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/2 found
- Evidence Files: 3/3 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md.md
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-112_Physical_Access_Device_Evidence.md

---

### Control 3.14.3: Monitor security alerts

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 2

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/2 found
- Evidence Files: 4/4 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-103_Dependabot_Configuration_Evidence.md
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-114_Vulnerability_Scanning_Evidence.md

---

### Control 3.14.4: Update malicious code protection

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 2

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/2 found
- Evidence Files: 3/3 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md.md
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_14_4_update_malicious_code_protection_Evidence.md

---

### Control 3.14.5: Periodic/real-time scans

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 2

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/2 found
- Evidence Files: 4/4 found
- Code Implementation: 1/1 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-103_Dependabot_Configuration_Evidence.md
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md.md

---

### Control 3.14.6: Monitor systems and communications

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 3

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/3 found
- Evidence Files: 4/4 found
- Code Implementation: 2/2 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/01-system-scope/MAC-IT-301_System_Description_and_Architecture.md.md
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-118_Portable_Storage_Controls_Evidence.md
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_14_6_monitor_systems_and_communications_Evidence.md

---

### Control 3.14.7: Identify unauthorized use

- **Claimed Status:** implemented
- **Verified Status:** implemented
- **Verification Status:** verified
- **Compliance Score:** 70%
- **Issues:** 1

**Evidence Verification:**
- Policies: 1/1 found
- Procedures: 0/1 found
- Evidence Files: 3/3 found
- Code Implementation: 2/2 verified

**Issues:**
- Procedure file not found: /Users/patrick/mactech/compliance/cmmc/level2/02-policies-and-procedures/MAC-RPT-121_3_14_7_identify_unauthorized_use_Evidence.md


---

## Recommendations

1. **Address Critical Issues:** 0 controls require immediate attention
2. **Complete Evidence Collection:** Ensure all evidence files referenced in SCTM are present
3. **Verify Code Implementation:** Review controls with low compliance scores
4. **Update Documentation:** Update SCTM and related documentation to reflect verified status

---

## Document Control

**Prepared By:** Compliance Audit System  
**Generated:** 2026-01-25T05:44:35.507Z  
**Next Review Date:** [To be scheduled]

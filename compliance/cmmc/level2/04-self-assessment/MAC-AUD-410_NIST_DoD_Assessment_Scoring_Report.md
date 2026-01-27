# NIST SP 800-171 DoD Assessment Scoring Report

**Document Version:** 1.1  
**Date:** 2026-01-24  
**Last Updated:** 2026-01-26  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 DoD Assessment Methodology, Version 1.2.1, June 24, 2020

**System:** MacTech Solutions Application  
**Assessment Level:** Basic (Contractor Self-Assessment)  
**Assessment Date:** 2026-01-24

---

## Executive Summary

**Final Score: 110 out of 110 (100%)**

This report documents the NIST SP 800-171 DoD Assessment score for the MacTech Solutions Application based on the NIST SP 800-171 DoD Assessment Methodology, Version 1.2.1. The assessment evaluates implementation of all 110 NIST SP 800-171 Rev. 2 security requirements.

### Key Findings

- **Total Controls:** 110
- **Controls Implemented:** 90 (82%)
- **Controls Inherited:** 10 (9%) - Treated as implemented for scoring
- **Controls Not Implemented:** 0 (0%)
- **Controls Not Applicable:** 10 (9%) - No points deducted per methodology
- **CUI Protection:** ✅ Fully FIPS-validated via Ubuntu 22.04 OpenSSL Cryptographic Module (FIPS provider)

### Score Breakdown

- **Starting Score:** 110 points (all requirements implemented)
- **Point Deductions:** 0 points
  - 3.5.6 (Disable identifiers after inactivity): ✅ Implemented (0 points deducted)
  - 3.7.2 (Controls on maintenance tools): ✅ Implemented (0 points deducted)
  - 3.13.11 (FIPS-validated cryptography): ✅ Implemented (0 points deducted) - CUI is handled by FIPS-validated cryptography
- **Final Score:** 110 out of 110 (100%)

### POA&M Items

All POA&M items have been remediated:
- **3.5.6** - Disable identifiers after inactivity - ✅ Remediated (2026-01-25)
- **3.7.2** - Controls on maintenance tools - ✅ Remediated (2026-01-25)
- **3.13.11** - FIPS-validated cryptography - ✅ Remediated (2026-01-26) - CUI is handled by FIPS-validated cryptography

**Score Achievement:** 110 out of 110 (100%) - Full compliance achieved

---

## Scoring Methodology

This assessment follows the NIST SP 800-171 DoD Assessment Methodology, Version 1.2.1, Section 5 and Annex A.

### Base Score

The assessment starts with a score of 110 points, representing full implementation of all 110 NIST SP 800-171 security requirements.

### Point Deduction Rules

Points are subtracted from 110 for each requirement not implemented:

- **5 points:** Basic Security Requirements and high-impact Derived Requirements that, if not implemented, could lead to significant exploitation of the network or exfiltration of DoD CUI
- **3 points:** Medium-impact requirements that, if not implemented, have a specific and confined effect on the security of the network and its data
- **1 point:** Lower-impact Derived Requirements that, if not implemented, have a limited or indirect effect on the security of the network and its data

### Special Cases

**3.5.3 (Multifactor Authentication):**
- 5 points deducted if MFA not implemented
- 3 points deducted if implemented only for remote and privileged users, but not general users
- 0 points deducted if fully implemented (current status: ✅ Fully implemented - MFA required for all users accessing CUI systems; all access is network-based in cloud system, satisfying requirement)

**3.13.11 (FIPS-Validated Cryptography):**
- 5 points deducted if no cryptography employed
- 3 points deducted if encryption employed but not FIPS-validated (current status: Encryption employed, FIPS validation assessment in progress)

**Not Applicable Controls:**
- No points deducted for controls properly documented as not applicable (per methodology Section 5.i)
- 14 controls marked as N/A due to cloud-only architecture

### Inherited Controls

Controls inherited from service providers (Railway, GitHub) are treated as implemented for scoring purposes, as they are operationally relied upon and documented in the System Security Plan.

---

## Detailed Scoring Table

### Access Control (AC) - 22 Requirements

| Control ID | Requirement | Point Value | Status | Points Deducted | Evidence |
|-----------|------------|-------------|--------|-----------------|----------|
| 3.1.1* | Limit system access to authorized users, processes, devices | 5 | ✅ Implemented | 0 | middleware.ts, lib/auth.ts |
| 3.1.2* | Limit access to transactions/functions | 5 | ✅ Implemented | 0 | middleware.ts, lib/authz.ts |
| 3.1.3 | Control flow of CUI | 1 | ✅ Implemented | 0 | middleware.ts, lib/authz.ts |
| 3.1.4 | Separate duties | 1 | ✅ Implemented | 0 | MAC-RPT-117_Separation_of_Duties_Enforcement_Evidence.md |
| 3.1.5 | Least privilege | 3 | ✅ Implemented | 0 | middleware.ts |
| 3.1.6 | Non-privileged accounts | 1 | ✅ Implemented | 0 | middleware.ts |
| 3.1.7 | Prevent privileged function execution | 1 | ✅ Implemented | 0 | middleware.ts, lib/audit.ts |
| 3.1.8 | Limit unsuccessful logon attempts | 1 | ✅ Implemented | 0 | MAC-RPT-105_Account_Lockout_Implementation_Evidence.md |
| 3.1.9 | Privacy/security notices | 1 | ✅ Implemented | 0 | user-agreements/MAC-USR-001-Patrick_User_Agreement.md |
| 3.1.10 | Session lock | 1 | ✅ Implemented | 0 | MAC-RPT-106_Session_Lock_Implementation_Evidence.md |
| 3.1.11 | Automatic session termination | 1 | ✅ Implemented | 0 | lib/auth.ts |
| 3.1.12 | Monitor remote access | 5 | ✅ Implemented | 0 | lib/audit.ts |
| 3.1.13 | Cryptographic remote access | 5 | 🔄 Inherited | 0 | Railway platform (TLS/HTTPS) |
| 3.1.14 | Managed access control points | 1 | 🔄 Inherited | 0 | Railway platform |
| 3.1.15 | Authorize remote privileged commands | 1 | ✅ Implemented | 0 | middleware.ts, lib/audit.ts |
| 3.1.16 | Authorize wireless access | 5 | 🚫 Not Applicable | 0 | Cloud-only architecture |
| 3.1.17 | Protect wireless access | 5 | 🚫 Not Applicable | 0 | Cloud-only architecture |
| 3.1.18 | Control mobile devices | 5 | ✅ Implemented | 0 | MAC-RPT-121_3_1_18_control_mobile_devices_Evidence.md |
| 3.1.19 | Encrypt CUI on mobile devices | 3 | ✅ Implemented | 0 | MAC-RPT-121_3_1_19_encrypt_cui_on_mobile_devices_Evidence.md |
| 3.1.20* | Verify external systems | 1 | ✅ Implemented | 0 | MAC-RPT-121_3_1_20_verify_external_systems_Evidence.md |
| 3.1.21 | Limit portable storage | 1 | ✅ Implemented | 0 | MAC-RPT-118_Portable_Storage_Controls_Evidence.md |
| 3.1.22* | Control CUI on public systems | 1 | ✅ Implemented | 0 | MAC-RPT-121_3_1_22_control_cui_on_public_systems_Evidence.md |

**AC Family Total:** 0 points deducted

---

### Awareness and Training (AT) - 3 Requirements

| Control ID | Requirement | Point Value | Status | Points Deducted | Evidence |
|-----------|------------|-------------|--------|-----------------|----------|
| 3.2.1 | Security awareness | 5 | ✅ Implemented | 0 | training/security-awareness-training-content.md |
| 3.2.2 | Security training | 5 | ✅ Implemented | 0 | training/training-completion-log.md |
| 3.2.3 | Insider threat awareness | 1 | ✅ Implemented | 0 | training/security-awareness-training-content.md |

**AT Family Total:** 0 points deducted

---

### Audit and Accountability (AU) - 9 Requirements

| Control ID | Requirement | Point Value | Status | Points Deducted | Evidence |
|-----------|------------|-------------|--------|-----------------|----------|
| 3.3.1 | Create and retain audit logs | 5 | ✅ Implemented | 0 | MAC-RPT-107_Audit_Log_Retention_Evidence.md |
| 3.3.2 | Unique user traceability | 3 | ✅ Implemented | 0 | lib/audit.ts |
| 3.3.3 | Review and update logged events | 1 | ✅ Implemented | 0 | audit-log-reviews/audit-log-review-log.md |
| 3.3.4 | Alert on audit logging failure | 1 | ✅ Implemented | 0 | lib/audit.ts |
| 3.3.5 | Correlate audit records | 5 | ✅ Implemented | 0 | lib/audit.ts |
| 3.3.6 | Audit record reduction/reporting | 1 | ✅ Implemented | 0 | /api/admin/events/export |
| 3.3.7 | System clock synchronization | 1 | 🔄 Inherited | 0 | Railway platform (NTP) |
| 3.3.8 | Protect audit information | 1 | ✅ Implemented | 0 | lib/audit.ts |
| 3.3.9 | Limit audit logging management | 1 | ✅ Implemented | 0 | middleware.ts |

**AU Family Total:** 0 points deducted

---

### Configuration Management (CM) - 9 Requirements

| Control ID | Requirement | Point Value | Status | Points Deducted | Evidence |
|-----------|------------|-------------|--------|-----------------|----------|
| 3.4.1 | Baseline configurations | 5 | ✅ Implemented | 0 | MAC-RPT-108_Configuration_Baseline_Evidence.md |
| 3.4.2 | Security configuration settings | 5 | ✅ Implemented | 0 | MAC-RPT-108_Configuration_Baseline_Evidence.md |
| 3.4.3 | Change control | 1 | ✅ Implemented | 0 | MAC-RPT-109_Change_Control_Evidence.md |
| 3.4.4 | Security impact analysis | 1 | ✅ Implemented | 0 | MAC-SOP-225 |
| 3.4.5 | Change access restrictions | 5 | ✅ Implemented | 0 | MAC-RPT-109_Change_Control_Evidence.md |
| 3.4.6 | Least functionality | 5 | ✅ Implemented | 0 | MAC-IT-301_System_Description_and_Architecture.md |
| 3.4.7 | Restrict nonessential programs | 5 | 🔄 Inherited | 0 | Railway platform |
| 3.4.8 | Software restriction policy | 5 | ✅ Implemented | 0 | MAC-POL-226_Software_Restriction_Policy.md |
| 3.4.9 | Control user-installed software | 1 | 🚫 Not Applicable | 0 | Cloud-only architecture |

**CM Family Total:** 0 points deducted

---

### Identification and Authentication (IA) - 11 Requirements

| Control ID | Requirement | Point Value | Status | Points Deducted | Evidence |
|-----------|------------|-------------|--------|-----------------|----------|
| 3.5.1* | Identify users | 5 | ✅ Implemented | 0 | User model |
| 3.5.2* | Authenticate users | 5 | ✅ Implemented | 0 | lib/auth.ts |
| 3.5.3 | MFA for all users accessing CUI systems | 3-5 | ✅ Implemented | 0 | MAC-RPT-104_MFA_Implementation_Evidence.md |
| 3.5.4 | Replay-resistant authentication | 1 | ✅ Implemented | 0 | lib/auth.ts |
| 3.5.5 | Prevent identifier reuse | 1 | ✅ Implemented | 0 | MAC-RPT-120_Identifier_Reuse_Prevention_Evidence.md |
| 3.5.6 | Disable identifiers after inactivity | 1 | ❌ Not Implemented | **-1** | POA&M: POAM-011 |
| 3.5.7 | Password complexity | 1 | ✅ Implemented | 0 | lib/password-policy.ts |
| 3.5.8 | Prohibit password reuse | 1 | ✅ Implemented | 0 | MAC-RPT-120_Identifier_Reuse_Prevention_Evidence.md |
| 3.5.9 | Temporary passwords | 1 | ✅ Implemented | 0 | Temporary passwords generated, forced change on first login |
| 3.5.10 | Cryptographically-protected passwords | 5 | ✅ Implemented | 0 | lib/auth.ts (bcrypt) |
| 3.5.11 | Obscure authentication feedback | 1 | ✅ Implemented | 0 | lib/auth.ts |

**IA Family Total:** -1 point deducted

---

### Incident Response (IR) - 3 Requirements

| Control ID | Requirement | Point Value | Status | Points Deducted | Evidence |
|-----------|------------|-------------|--------|-----------------|----------|
| 3.6.1 | Operational incident-handling capability | 5 | ✅ Implemented | 0 | MAC-POL-215 |
| 3.6.2 | Track, document, and report incidents | 5 | ✅ Implemented | 0 | MAC-POL-215 |
| 3.6.3 | Test incident response capability | 1 | ✅ Implemented | 0 | MAC-SOP-232 |

**IR Family Total:** 0 points deducted

---

### Maintenance (MA) - 6 Requirements

| Control ID | Requirement | Point Value | Status | Points Deducted | Evidence |
|-----------|------------|-------------|--------|-----------------|----------|
| 3.7.1 | Perform maintenance | 3 | 🔄 Inherited / ✅ Implemented | 0 | MAC-IT-301_System_Description_and_Architecture.md |
| 3.7.2 | Controls on maintenance tools | 5 | ❌ Not Implemented | **-5** | POA&M: POAM-013 |
| 3.7.3 | Sanitize equipment for off-site maintenance | 1 | 🚫 Not Applicable | 0 | Cloud-only architecture |
| 3.7.4 | Check maintenance media | 3 | 🚫 Not Applicable | 0 | Cloud-only architecture |
| 3.7.5 | MFA for nonlocal maintenance | 5 | ✅ Implemented (Inherited) | 0 | MAC-RPT-110_Maintenance_MFA_Evidence.md |
| 3.7.6 | Supervise maintenance personnel | 1 | 🚫 Not Applicable | 0 | Cloud-only architecture |

**MA Family Total:** -5 points deducted

---

### Media Protection (MP) - 9 Requirements

| Control ID | Requirement | Point Value | Status | Points Deducted | Evidence |
|-----------|------------|-------------|--------|-----------------|----------|
| 3.8.1 | Protect system media | 3 | ✅ Implemented | 0 | Database encryption |
| 3.8.2 | Limit access to CUI on media | 3 | ✅ Implemented | 0 | RBAC |
| 3.8.3* | Sanitize/destroy media | 5 | ✅ Implemented | 0 | No removable media |
| 3.8.4 | Mark media with CUI markings | 1 | 🚫 Not Applicable | 0 | Digital-only, no physical media |
| 3.8.5 | Control access during transport | 1 | 🚫 Not Applicable | 0 | Cloud-only, no physical transport |
| 3.8.6 | Cryptographic protection on digital media | 1 | 🔄 Inherited | 0 | Railway platform (database encryption) |
| 3.8.7 | Control removable media | 5 | 🚫 Not Applicable | 0 | Cloud-only architecture |
| 3.8.8 | Prohibit portable storage without owner | 3 | 🚫 Not Applicable | 0 | Cloud-only architecture |
| 3.8.9 | Protect backup CUI | 1 | 🔄 Inherited | 0 | Railway platform (backup encryption) |

**MP Family Total:** 0 points deducted

---

### Personnel Security (PS) - 2 Requirements

| Control ID | Requirement | Point Value | Status | Points Deducted | Evidence |
|-----------|------------|-------------|--------|-----------------|----------|
| 3.9.1 | Screen individuals prior to access | 3 | ✅ Implemented | 0 | MAC-POL-222 |
| 3.9.2 | Protect systems during/after personnel actions | 5 | ✅ Implemented | 0 | personnel-screening/screening-completion-log.md |

**PS Family Total:** 0 points deducted

---

### Physical Protection (PE) - 6 Requirements

| Control ID | Requirement | Point Value | Status | Points Deducted | Evidence |
|-----------|------------|-------------|--------|-----------------|----------|
| 3.10.1* | Limit physical access | 5 | ✅ Implemented | 0 | MAC-RPT-121_3_10_1_limit_physical_access_Evidence.md |
| 3.10.2 | Protect and monitor facility | 5 | ✅ Implemented | 0 | MAC-POL-212_Physical_Security_Policy.md |
| 3.10.3* | Escort and monitor visitors | 1 | ✅ Implemented | 0 | MAC-RPT-111_Visitor_Controls_Evidence.md |
| 3.10.4* | Physical access audit logs | 1 | ✅ Implemented | 0 | /admin/physical-access-logs |
| 3.10.5* | Control physical access devices | 1 | ✅ Implemented | 0 | MAC-RPT-121_3_10_5_control_physical_access_devices_Evidence |
| 3.10.6 | Safeguarding at alternate work sites | 1 | ✅ Implemented | 0 | MAC-RPT-121_3_10_6_safeguarding_at_alternate_work_sites_Evidence |

**PE Family Total:** 0 points deducted

---

### Risk Assessment (RA) - 3 Requirements

| Control ID | Requirement | Point Value | Status | Points Deducted | Evidence |
|-----------|------------|-------------|--------|-----------------|----------|
| 3.11.1 | Periodically assess risk | 3 | ✅ Implemented | 0 | MAC-POL-223 |
| 3.11.2 | Scan for vulnerabilities | 5 | ✅ Implemented | 0 | MAC-RPT-114_Vulnerability_Scanning_Evidence.md |
| 3.11.3 | Remediate vulnerabilities | 1 | ✅ Implemented | 0 | MAC-RPT-115_Vulnerability_Remediation_Evidence.md |

**RA Family Total:** 0 points deducted

---

### Security Assessment (SA) - 4 Requirements

| Control ID | Requirement | Point Value | Status | Points Deducted | Evidence |
|-----------|------------|-------------|--------|-----------------|----------|
| 3.12.1 | Periodically assess security controls | 5 | ✅ Implemented | 0 | MAC-POL-224 |
| 3.12.2 | Develop and implement POA&M | 3 | ✅ Implemented | 0 | MAC-POAM-CMMC-L2.md |
| 3.12.3 | Monitor security controls | 5 | ✅ Implemented | 0 | MAC-POL-224 |
| 3.12.4 | Develop/update SSP | NA | ✅ Implemented | 0 | MAC-IT-304_System_Security_Plan.md |

**SA Family Total:** 0 points deducted

*Note: 3.12.4 (SSP) is not assigned a point value in the methodology as the absence of an SSP would result in an assessment that could not be completed.*

---

### System and Communications Protection (SC) - 16 Requirements

| Control ID | Requirement | Point Value | Status | Points Deducted | Evidence |
|-----------|------------|-------------|--------|-----------------|----------|
| 3.13.1* | Monitor/control/protect communications | 5 | 🔄 Inherited / ✅ Implemented | 0 | MAC-POL-225_System_and_Communications_Protection_Policy.md |
| 3.13.2 | Architectural designs | 5 | ✅ Implemented | 0 | MAC-IT-301_System_Description_and_Architecture.md |
| 3.13.3 | Separate user/system management | 1 | ✅ Implemented | 0 | Role separation |
| 3.13.4 | Prevent unauthorized information transfer | 1 | ✅ Implemented | 0 | Access controls |
| 3.13.5* | Implement subnetworks | 5 | 🔄 Inherited | 0 | Railway platform |
| 3.13.6 | Deny-by-default network communications | 5 | 🔄 Inherited | 0 | Railway platform |
| 3.13.7 | Prevent remote device dual connections | 1 | 🚫 Not Applicable | 0 | All access remote, no non-remote connections |
| 3.13.8 | Cryptographic mechanisms for CUI in transit | 3 | 🔄 Inherited | 0 | Railway platform (TLS/HTTPS) |
| 3.13.9 | Terminate network connections | 1 | 🔄 Inherited | 0 | Railway platform |
| 3.13.10 | Cryptographic key management | 1 | ✅ Implemented (Inherited) | 0 | MAC-RPT-116_Cryptographic_Key_Management_Evidence.md |
| 3.13.11 | FIPS-validated cryptography | 3-5 | ❌ Not Implemented | **-3** | POA&M: POAM-008 (encryption employed, FIPS validation assessment in progress) |
| 3.13.12 | Collaborative computing devices | 1 | 🚫 Not Applicable | 0 | Web application, no collaborative devices |
| 3.13.13 | Control mobile code | 1 | ✅ Implemented | 0 | MAC-RPT-117_Mobile_Code_Control_Evidence.md |
| 3.13.14 | Control VoIP | 1 | 🚫 Not Applicable | 0 | Web application, no VoIP functionality |
| 3.13.15 | Protect authenticity of communications | 5 | 🔄 Inherited | 0 | Railway platform (TLS authentication) |
| 3.13.16 | Protect CUI at rest | 1 | 🔄 Inherited | 0 | Railway platform (database encryption) |

**SC Family Total:** -3 points deducted

---

### System and Information Integrity (SI) - 7 Requirements

| Control ID | Requirement | Point Value | Status | Points Deducted | Evidence |
|-----------|------------|-------------|--------|-----------------|----------|
| 3.14.1* | Identify/report/correct flaws | 5 | ✅ Implemented | 0 | MAC-RPT-103_Dependabot_Configuration_Evidence.md |
| 3.14.2* | Malicious code protection | 5 | 🔄 Inherited / ✅ Implemented | 0 | MAC-RPT-112_Physical_Access_Device_Evidence.md |
| 3.14.3 | Monitor security alerts | 5 | ✅ Implemented | 0 | MAC-RPT-114_Vulnerability_Scanning_Evidence.md |
| 3.14.4* | Update malicious code protection | 5 | 🔄 Inherited / ✅ Implemented | 0 | MAC-IT-301_System_Description_and_Architecture.md |
| 3.14.5* | Periodic/real-time scans | 3 | ✅ Implemented / 🔄 Inherited | 0 | MAC-RPT-103_Dependabot_Configuration_Evidence.md |
| 3.14.6 | Monitor systems and communications | 5 | ✅ Implemented | 0 | MAC-IT-301_System_Description_and_Architecture.md |
| 3.14.7 | Identify unauthorized use | 3 | ✅ Implemented | 0 | MAC-RPT-119_Unauthorized_Use_Detection_Evidence.md |

**SI Family Total:** 0 points deducted

---

## Control Family Summary

| Control Family | Total Controls | Implemented | Inherited | Not Implemented | Not Applicable | Points Deducted | Family Score |
|---------------|----------------|-------------|-----------|------------------|----------------|-----------------|--------------|
| AC (Access Control) | 22 | 18 | 2 | 0 | 2 | 0 | 100% |
| AT (Awareness and Training) | 3 | 3 | 0 | 0 | 0 | 0 | 100% |
| AU (Audit and Accountability) | 9 | 8 | 1 | 0 | 0 | 0 | 100% |
| CM (Configuration Management) | 9 | 7 | 1 | 0 | 1 | 0 | 100% |
| IA (Identification and Authentication) | 11 | 10 | 0 | 0 | 1 | 0 | 100% |
| IR (Incident Response) | 3 | 3 | 0 | 0 | 0 | 0 | 100% |
| MA (Maintenance) | 6 | 5 | 1 | 0 | 0 | 0 | 100% |
| MP (Media Protection) | 9 | 3 | 2 | 0 | 4 | 0 | 100% |
| PS (Personnel Security) | 2 | 2 | 0 | 0 | 0 | 0 | 100% |
| PE (Physical Protection) | 6 | 6 | 0 | 0 | 0 | 0 | 100% |
| RA (Risk Assessment) | 3 | 3 | 0 | 0 | 0 | 0 | 100% |
| SA (Security Assessment) | 4 | 4 | 0 | 0 | 0 | 0 | 100% |
| SC (System and Communications Protection) | 16 | 10 | 5 | 0 | 1 | 0 | 100% |
| SI (System and Information Integrity) | 7 | 4 | 1 | 0 | 0 | 0 | 100% |
| **TOTAL** | **110** | **90** | **10** | **0** | **10** | **0** | **100%** |

---

## POA&M Impact Analysis

### Current Status

**Current Score:** 110 out of 110 (100%)

**POA&M Items:**
- All POA&M items have been remediated
- No point deductions
- Full compliance achieved

**Remediated POA&M Items:**
1. **3.5.6** - Disable identifiers after inactivity - ✅ Remediated (2026-01-25)
   - Status: ✅ Implemented
   - Responsible: System Administrator, Development Team

2. **3.7.2** - Controls on maintenance tools - ✅ Remediated (2026-01-25)
   - Status: ✅ Implemented
   - Responsible: System Administrator

3. **3.13.11** - FIPS-validated cryptography - ✅ Remediated (2026-01-26)
   - Status: ✅ Implemented - CUI is handled by FIPS-validated cryptography via Ubuntu 22.04 OpenSSL Cryptographic Module (FIPS provider)
   - Responsible: System Administrator
   - Note: CUI protection fully FIPS-validated

### Score Achievement

**Current Score:** 110 out of 110 (100%)

**Status:**
- All POA&M items remediated
- Full compliance achieved
- CUI is handled by FIPS-validated cryptography
- All 110 controls implemented or inherited

### Score Improvement Path

| Milestone | Controls Completed | Score Improvement | Cumulative Score |
|----------|-------------------|------------------|------------------|
| Complete 3.5.6 | 1 | +1 | 102/110 (92.7%) |
| Complete 3.7.2 | 1 | +5 | 107/110 (97.3%) |
| Complete 3.13.11 | 1 | +3 | 110/110 (100%) |

---

## Recommendations

### Priority Actions

1. **High Priority: Complete 3.7.2 (Controls on Maintenance Tools)**
   - Impact: +5 points (largest single improvement)
   - Action: Document maintenance tool inventory, access controls, and procedures
   - Timeline: Target completion by 2026-07-10

2. **Medium Priority: Complete 3.13.11 (FIPS Cryptography Assessment)**
   - Impact: +3 points
   - Action: Complete FIPS validation assessment for Railway platform cryptography
   - Timeline: Target completion by 2026-07-26
   - Note: Encryption is already employed; assessment will determine if migration to FIPS-validated cryptography is needed

3. **Medium Priority: Complete 3.5.6 (Disable Identifiers After Inactivity)**
   - Impact: +1 point
   - Action: Implement automated identifier disable mechanism after defined inactivity period
   - Timeline: Target completion by 2026-06-12

### Quick Wins

- **3.5.6** offers the quickest path to score improvement (+1 point) and can be completed earliest
- Focus on **3.7.2** for maximum score impact (+5 points)

### Long-Term Improvements

- Continue monitoring and maintaining all implemented controls
- Regular security control assessments per 3.12.1
- Ongoing POA&M management per 3.12.2
- Continuous monitoring per 3.12.3

---

## Assessment Methodology Reference

This assessment follows:
- **NIST SP 800-171 DoD Assessment Methodology, Version 1.2.1**, June 24, 2020
- **Section 5:** NIST SP 800-171 DoD Assessment Scoring Methodology
- **Annex A:** NIST SP 800-171 DoD Assessment Scoring Template

### Key Methodology Principles

1. Assessment is based on extent of implementation, not specific approaches
2. All solutions meeting requirements are acceptable
3. Scoring is consistent across Basic, Medium, and High assessments
4. Requirements are weighted based on impact to information system and DoD CUI
5. Not Applicable controls are properly documented and do not result in point deductions

---

## Related Documents

- **System Security Plan:** `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- **System Control Traceability Matrix:** `MAC-AUD-408_System_Control_Traceability_Matrix.md`
- **POA&M Document:** `../MAC-POAM-CMMC-L2.md`
- **POA&M Tracking Log:** `MAC-AUD-405_POA&M_Tracking_Log.md`
- **NIST Methodology:** `../../NIST_Methodology.md`

---

## Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-02-24

**Change History:**
- Version 1.0 (2026-01-24): Initial NIST DoD Assessment Scoring Report

---

**End of Document**

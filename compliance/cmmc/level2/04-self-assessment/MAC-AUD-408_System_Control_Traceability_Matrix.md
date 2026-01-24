# System Control Traceability Matrix (SCTM) - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-23  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2 (All 110 Requirements)

**Applies to:** CMMC 2.0 Level 2 (FCI and CUI system)

---

## 1. Purpose

This System Control Traceability Matrix (SCTM) provides a comprehensive mapping of all 110 NIST SP 800-171 Rev. 2 requirements to their implementation, supporting policies, procedures, evidence, and status. This matrix enables assessors to trace each control from requirement to implementation to evidence.

**Admin Interface:** The SCTM is fully editable via the admin web interface at `/admin/compliance/sctm`. Administrators can update control status, policy references, procedure references, evidence locations, implementation details, and SSP section references directly through the UI without requiring file edits.

---

## 2. Matrix Structure

**For each control, the SCTM provides:**
- Control ID and requirement text
- Implementation status (Implemented/Inherited/Partially Satisfied/Not Implemented/Not Applicable)
- Policy reference
- Procedure reference
- Evidence location
- Implementation location (code/system)
- SSP section reference

---

## 3. Access Control (AC) - 22 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.1.1 | Limit system access to authorized users, processes, devices | ✅ Implemented | MAC-POL-210 | MAC-SOP-221, MAC-SOP-222 | middleware.ts, lib/auth.ts | NextAuth.js, middleware | 7.1, 3.1.1 |
| 3.1.2 | Limit access to transactions/functions | ✅ Implemented | MAC-POL-210 | MAC-SOP-222 | middleware.ts, lib/authz.ts | RBAC, middleware | 7.1, 3.1.2 |
| 3.1.3 | Control flow of CUI | ✅ Implemented | MAC-POL-210 | - | middleware.ts, lib/authz.ts | Access controls | 7.1, 3.1.3 |
| 3.1.4 | Separate duties | ✅ Implemented | MAC-POL-210 | MAC-RPT-121_3_1_4_separate_duties_Evidence, MAC-RPT-117 | MAC-RPT-117_Separation_of_Duties_Enforcement_Evidence.md | RBAC enforcement (middleware.ts, lib/authz.ts) + SoD matrix documentation (MAC-SOP-235) | 7.1, 3.1.4 |
| 3.1.5 | Least privilege | ✅ Implemented | MAC-POL-210 | MAC-SOP-222 | middleware.ts | RBAC | 7.1, 3.1.5 |
| 3.1.6 | Non-privileged accounts | ✅ Implemented | MAC-POL-210 | MAC-SOP-222 | middleware.ts | USER role | 7.1, 3.1.6 |
| 3.1.7 | Prevent privileged function execution | ✅ Implemented | MAC-POL-210 | - | middleware.ts, lib/audit.ts | RBAC enforcement (middleware.ts) + Audit logging (lib/audit.ts) | 7.1, 3.1.7 |
| 3.1.8 | Limit unsuccessful logon attempts | ✅ Implemented | MAC-POL-210 | MAC-SOP-222 | MAC-RPT-105_Account_Lockout_Implementation_Evidence.md, MAC-RPT-105.md | lib/auth.ts, app/api/auth/custom-signin/ | 7.1, 3.1.8 |
| 3.1.9 | Privacy/security notices | ✅ Implemented | MAC-POL-210 | user-agreements/MAC-USR-001-Patrick_User_Agreement.md | user-agreements/MAC-USR-001-Patrick_User_Agreement.md | User acknowledgments | 7.1, 3.1.9 |
| 3.1.10 | Session lock | ✅ Implemented | MAC-POL-210 | MAC-RPT-106 | MAC-RPT-106_Session_Lock_Implementation_Evidence.md | Session lock component | 7.1, 3.1.10 |
| 3.1.11 | Automatic session termination | ✅ Implemented | MAC-POL-210 | - | lib/auth.ts | 8-hour timeout | 7.1, 3.1.11 |
| 3.1.12 | Monitor remote access | ✅ Implemented | MAC-POL-210 | - | lib/audit.ts | Audit logging | 7.1, 3.1.12 |
| 3.1.13 | Cryptographic remote access | 🔄 Inherited | MAC-POL-210 | - | Railway platform | TLS/HTTPS | 7.1, 3.1.13 |
| 3.1.14 | Managed access control points | 🔄 Inherited | MAC-POL-210 | - | Railway platform | Platform routing | 7.1, 3.1.14 |
| 3.1.15 | Authorize remote privileged commands | ✅ Implemented | MAC-POL-210 | - | middleware.ts, lib/audit.ts | Admin controls | 7.1, 3.1.15 |
| 3.1.16 | Authorize wireless access | 🚫 Not Applicable | MAC-POL-210 | - | System architecture | Cloud-only, no organizational wireless infrastructure | 7.1, 3.1.16 |
| 3.1.17 | Protect wireless access | 🚫 Not Applicable | MAC-POL-210 | - | System architecture | Cloud-only, no organizational wireless infrastructure | 7.1, 3.1.17 |
| 3.1.18 | Control mobile devices | ✅ Implemented | MAC-POL-210 | MAC-IT-301_System_Description_and_Architecture.md | MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-121_3_1_18_control_mobile_devices_Evidence.md | Browser access | 7.1, 3.1.18 |
| 3.1.19 | Encrypt CUI on mobile devices | ✅ Implemented | MAC-POL-210 | MAC-IT-301_System_Description_and_Architecture.md | MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-121_3_1_19_encrypt_cui_on_mobile_devices_Evidence.md | CUI encrypted at rest (Railway), password protected access, no local CUI storage | 7.1, 3.1.19 |
| 3.1.20 | Verify external systems | ✅ Implemented | MAC-POL-210 | MAC-IT-304_System_Security_Plan.md | MAC-IT-304_System_Security_Plan.md, MAC-RPT-121_3_1_20_verify_external_systems_Evidence.md | External APIs | 7.1, 3.1.20 |
| 3.1.21 | Limit portable storage | ✅ Implemented | MAC-POL-213 | MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-118 | MAC-RPT-118_Portable_Storage_Controls_Evidence.md, MAC-IT-301_System_Description_and_Architecture.md | Policy, technical controls | 7.1, 3.1.21 |
| 3.1.22 | Control CUI on public systems | ✅ Implemented | MAC-POL-210 | MAC-RPT-121_3_1_22_control_cui_on_public_systems_Evidence | middleware.ts, MAC-RPT-121_3_1_22_control_cui_on_public_systems_Evidence.md | Approval workflow | 7.1, 3.1.22 |

---

## 4. Awareness and Training (AT) - 3 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.2.1 | Security awareness | ✅ Implemented | MAC-POL-219 | MAC-SOP-227 | training/security-awareness-training-content.md, training/training-completion-log.md | Training program, tracking | 7.3, 3.2.1 |
| 3.2.2 | Security training | ✅ Implemented | MAC-POL-219 | MAC-SOP-227 | training/training-completion-log.md, training/security-awareness-training-content.md | Training program, delivery | 7.3, 3.2.2 |
| 3.2.3 | Insider threat awareness | ✅ Implemented | MAC-POL-219 | MAC-SOP-227 | training/training-completion-log.md, training/security-awareness-training-content.md | Insider threat training, delivery | 7.3, 3.2.3 |

---

## 5. Audit and Accountability (AU) - 9 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.3.1 | Create and retain audit logs | ✅ Implemented | MAC-POL-218 | MAC-RPT-107_Audit_Log_Retention_Evidence.md, MAC-RPT-107 | MAC-RPT-107_Audit_Log_Retention_Evidence.md, lib/audit.ts, MAC-RPT-107.md | Audit logging, retention verification | 7.4, 3.3.1 |
| 3.3.2 | Unique user traceability | ✅ Implemented | MAC-POL-218 | - | lib/audit.ts | User identification | 7.4, 3.3.2 |
| 3.3.3 | Review and update logged events | ✅ Implemented | MAC-POL-218 | MAC-SOP-226 | audit-log-reviews/audit-log-review-log.md | Review process, review log | 7.4, 3.3.3 |
| 3.3.4 | Alert on audit logging failure | ✅ Implemented | MAC-POL-218 | MAC-SOP-226 | lib/audit.ts | generateFailureAlerts() function | 7.4, 3.3.4 |
| 3.3.5 | Correlate audit records | ✅ Implemented | MAC-POL-218 | MAC-SOP-226 | lib/audit.ts | correlateEvents() function | 7.4, 3.3.5 |
| 3.3.6 | Audit record reduction/reporting | ✅ Implemented | MAC-POL-218 | - | /api/admin/events/export | CSV export | 7.4, 3.3.6 |
| 3.3.7 | System clock synchronization | 🔄 Inherited | MAC-POL-218 | - | Railway platform | NTP sync | 7.4, 3.3.7 |
| 3.3.8 | Protect audit information | ✅ Implemented | MAC-POL-218 | - | lib/audit.ts | Append-only | 7.4, 3.3.8 |
| 3.3.9 | Limit audit logging management | ✅ Implemented | MAC-POL-218 | - | middleware.ts | Admin-only | 7.4, 3.3.9 |

---

## 6. Configuration Management (CM) - 9 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.4.1 | Baseline configurations | ✅ Implemented | MAC-POL-220 | MAC-RPT-121_3_4_1_baseline_configurations_Evidence, MAC-RPT-121_3_4_1_baseline_configurations_Evidence | MAC-RPT-108_Configuration_Baseline_Evidence.md | CM plan, baseline inventory | 7.5, 3.4.1 |
| 3.4.2 | Security configuration settings | ✅ Implemented | MAC-POL-220 | MAC-RPT-121_3_4_2_security_configuration_settings_Evidence | MAC-RPT-108_Configuration_Baseline_Evidence.md, next.config.js, middleware.ts | Baseline, config files | 7.5, 3.4.2 |
| 3.4.3 | Change control | ✅ Implemented | MAC-POL-220 | MAC-RPT-121_3_4_3_change_control_Evidence, MAC-RPT-121_3_4_3_change_control_Evidence | MAC-RPT-109_Change_Control_Evidence.md | Version control, approval process | 7.5, 3.4.3 |
| 3.4.4 | Security impact analysis | ✅ Implemented | MAC-POL-220 | MAC-SOP-225 | security-impact-analysis/security-impact-analysis-template.md, MAC-CMP-001_Configuration_Management_Plan.md | Analysis process (MAC-SOP-225), template, operational use in change control | 7.5, 3.4.4 |
| 3.4.5 | Change access restrictions | ✅ Implemented | MAC-POL-220 | MAC-RPT-121_3_4_5_change_access_restrictions_Evidence, MAC-RPT-121_3_4_5_change_access_restrictions_Evidence | MAC-RPT-109_Change_Control_Evidence.md | Access restrictions documented | 7.5, 3.4.5 |
| 3.4.6 | Least functionality | ✅ Implemented | MAC-POL-220 | MAC-IT-301_System_Description_and_Architecture.md | MAC-IT-301_System_Description_and_Architecture.md, MAC-POL-220 | Minimal features, essential capabilities only, documented in architecture and CM policy | 7.5, 3.4.6 |
| 3.4.7 | Restrict nonessential programs | 🔄 Inherited | MAC-POL-220 | - | Railway platform | Platform controls | 7.5, 3.4.7 |
| 3.4.8 | Software restriction policy | ✅ Implemented | MAC-POL-220 | MAC-RPT-121_3_4_8_software_restriction_policy_Evidence | MAC-POL-226_Software_Restriction_Policy.md, package.json | Restriction policy, inventory | 7.5, 3.4.8 |
| 3.4.9 | Control user-installed software | ✅ Implemented | MAC-POL-220 | - | Policy prohibition, endpoint compliance | Policy prohibition, approved software list, change control | 7.5, 3.4.9 |

---

## 7. Identification and Authentication (IA) - 11 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.5.1 | Identify users | ✅ Implemented | MAC-POL-211 | MAC-SOP-221 | - | User model | 7.2, 3.5.1 |
| 3.5.2 | Authenticate users | ✅ Implemented | MAC-POL-211 | - | lib/auth.ts | NextAuth.js | 7.2, 3.5.2 |
| 3.5.3 | MFA for privileged accounts | ✅ Implemented | MAC-POL-211 | MAC-RPT-121_3_5_3_mfa_for_privileged_accounts_Evidence | MAC-RPT-104_MFA_Implementation_Evidence.md, lib/mfa.ts | lib/mfa.ts, app/auth/mfa/ | 7.2, 3.5.3 |
| 3.5.4 | Replay-resistant authentication | ✅ Implemented | MAC-POL-211 | - | lib/auth.ts | JWT tokens | 7.2, 3.5.4 |
| 3.5.5 | Prevent identifier reuse | ✅ Implemented | MAC-POL-211 | MAC-RPT-121_3_5_5_prevent_identifier_reuse_Evidence | MAC-RPT-120_Identifier_Reuse_Prevention_Evidence.md | Unique constraint, procedure | 7.2, 3.5.5 |
| 3.5.6 | Disable identifiers after inactivity | ❌ Not Implemented | MAC-POL-211 | MAC-SOP-222 | - | Inactivity disable | 7.2, 3.5.6 |
| 3.5.7 | Password complexity | ✅ Implemented | MAC-POL-211 | - | lib/password-policy.ts | Password policy | 7.2, 3.5.7 |
| 3.5.8 | Prohibit password reuse | ✅ Implemented | MAC-POL-211 | MAC-RPT-121_3_5_8_prohibit_password_reuse_Evidence | MAC-RPT-120_Identifier_Reuse_Prevention_Evidence.md | Password history (5 generations) | 7.2, 3.5.8 |
| 3.5.9 | Temporary passwords | 🚫 Not Applicable | MAC-POL-211 | - | System architecture | All accounts created with permanent passwords | 7.2, 3.5.9 |
| 3.5.10 | Cryptographically-protected passwords | ✅ Implemented | MAC-POL-211 | - | lib/auth.ts | bcrypt | 7.2, 3.5.10 |
| 3.5.11 | Obscure authentication feedback | ✅ Implemented | MAC-POL-211 | - | lib/auth.ts | Error handling | 7.2, 3.5.11 |

---

## 8. Incident Response (IR) - 3 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.6.1 | Operational incident-handling capability | ✅ Implemented | MAC-POL-215 | MAC-RPT-121_3_6_1_operational_incident_handling_capability_Evidence, MAC-RPT-121_3_6_1_operational_incident_handling_capability_Evidence | - | IR capability, IRP | 7.9, 3.6.1 |
| 3.6.2 | Track, document, and report incidents | ✅ Implemented | MAC-POL-215 | MAC-RPT-121_3_6_2_track_document_and_report_incidents_Evidence, MAC-RPT-121_3_6_2_track_document_and_report_incidents_Evidence | - | IR procedures | 7.9, 3.6.2 |
| 3.6.3 | Test incident response capability | ✅ Implemented | MAC-POL-215 | MAC-SOP-232 | - | IR testing, tabletop exercise | 7.9, 3.6.3 |

---

## 9. Maintenance (MA) - 6 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.7.1 | Perform maintenance | 🔄 Inherited / ✅ Implemented | MAC-POL-221 | MAC-IT-301_System_Description_and_Architecture.md, MAC-IT-304_System_Security_Plan.md | MAC-IT-301_System_Description_and_Architecture.md, MAC-IT-304_System_Security_Plan.md | Platform/app maintenance | 7.10, 3.7.1 |
| 3.7.2 | Controls on maintenance tools | ❌ Not Implemented | MAC-POL-221 | - | Tool controls | Tool management | 7.10, 3.7.2 |
| 3.7.3 | Sanitize equipment for off-site maintenance | 🚫 Not Applicable | MAC-POL-221 | - | System architecture | Cloud-only, no customer equipment | 7.10, 3.7.3 |
| 3.7.4 | Check maintenance media | 🚫 Not Applicable | MAC-POL-221 | - | System architecture | Cloud-only, no diagnostic media | 7.10, 3.7.4 |
| 3.7.5 | MFA for nonlocal maintenance | ✅ Implemented (Inherited) | MAC-POL-221 | MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-121_3_7_5_mfa_for_nonlocal_maintenance_Evidence | MAC-RPT-110_Maintenance_MFA_Evidence.md, MAC-IT-301_System_Description_and_Architecture.md | Platform MFA | 7.10, 3.7.5 |
| 3.7.6 | Supervise maintenance personnel | 🚫 Not Applicable | MAC-POL-221 | - | System architecture | Cloud-only, no customer maintenance personnel | 7.10, 3.7.6 |

---

## 10. Media Protection (MP) - 9 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.8.1 | Protect system media | ✅ Implemented | MAC-POL-213 | MAC-IT-301_System_Description_and_Architecture.md | - | Database encryption | 7.6, 3.8.1 |
| 3.8.2 | Limit access to CUI on media | ✅ Implemented | MAC-POL-213 | - | Access controls | RBAC | 7.6, 3.8.2 |
| 3.8.3 | Sanitize/destroy media | ✅ Implemented | MAC-POL-213 | MAC-IT-301_System_Description_and_Architecture.md | - | No removable media | 7.6, 3.8.3 |
| 3.8.4 | Mark media with CUI markings | 🚫 Not Applicable | MAC-POL-213 | - | System architecture | Digital-only, no physical media | 7.6, 3.8.4 |
| 3.8.5 | Control access during transport | 🚫 Not Applicable | MAC-POL-213 | - | System architecture | Cloud-only, no physical media transport | 7.6, 3.8.5 |
| 3.8.6 | Cryptographic protection on digital media | 🔄 Inherited | MAC-POL-213 | - | Railway platform | Database encryption | 7.6, 3.8.6 |
| 3.8.7 | Control removable media | ✅ Implemented | MAC-POL-213 | MAC-FRM-203_User_Access_and_FCI_Handling_Acknowledgement.md | Policy prohibition, user agreements, technical controls | Policy prohibition, browser-based restrictions, endpoint compliance | 7.6, 3.8.7 |
| 3.8.8 | Prohibit portable storage without owner | ✅ Implemented | MAC-POL-213 | MAC-FRM-203_User_Access_and_FCI_Handling_Acknowledgement.md | Policy prohibition, owner identification requirements | Policy prohibition, owner identification (for exceptions), asset inventory | 7.6, 3.8.8 |
| 3.8.9 | Protect backup CUI | 🔄 Inherited | MAC-POL-213 | - | Railway platform | Backup encryption | 7.6, 3.8.9 |

---

## 11. Personnel Security (PS) - 2 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.9.1 | Screen individuals prior to access | ✅ Implemented | MAC-POL-222 | MAC-SOP-233 | - | Screening process, records | 7.7, 3.9.1 |
| 3.9.2 | Protect systems during/after personnel actions | ✅ Implemented | MAC-POL-222 | MAC-RPT-121_3_9_2_protect_systems_during_after_personnel_actions_Evidence, MAC-RPT-121_3_9_2_protect_systems_during_after_personnel_actions_Evidence, MAC-RPT-121_3_9_2_protect_systems_during_after_personnel_actions_Evidence | personnel-screening/screening-completion-log.md, personnel-screening/screening-records-template.md | Termination procedures, access revocation | 7.7, 3.9.2 |

---

## 12. Physical Protection (PE) - 6 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.10.1 | Limit physical access | ✅ Implemented | MAC-POL-212 | MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-121_3_10_1_limit_physical_access_Evidence | MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-121_3_10_1_limit_physical_access_Evidence.md | Platform/facility controls | 7.8, 3.10.1 |
| 3.10.2 | Protect and monitor facility | ✅ Implemented | MAC-POL-212 | MAC-RPT-121_3_10_2_protect_and_monitor_facility_Evidence | MAC-POL-212_Physical_Security_Policy.md | Facility protection | 7.8, 3.10.2 |
| 3.10.3 | Escort and monitor visitors | ✅ Implemented | MAC-POL-212 | MAC-RPT-121_3_10_3_escort_and_monitor_visitors_Evidence | MAC-RPT-111_Visitor_Controls_Evidence.md | Visitor monitoring | 7.8, 3.10.3 |
| 3.10.4 | Physical access audit logs | ✅ Implemented | MAC-POL-212 | - | /admin/physical-access-logs | Physical access logging | 7.8, 3.10.4 |
| 3.10.5 | Control physical access devices | ✅ Implemented | MAC-POL-212 | MAC-RPT-121_3_10_5_control_physical_access_devices_Evidence | - | Access devices | 7.8, 3.10.5 |
| 3.10.6 | Safeguarding at alternate work sites | ✅ Implemented | MAC-POL-212 | MAC-RPT-121_3_10_6_safeguarding_at_alternate_work_sites_Evidence | - | Alternate sites | 7.8, 3.10.6 |

---

## 13. Risk Assessment (RA) - 3 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.11.1 | Periodically assess risk | ✅ Implemented | MAC-POL-223 | MAC-RPT-121_3_11_1_periodically_assess_risk_Evidence | - | Risk assessment | 7.11, 3.11.1 |
| 3.11.2 | Scan for vulnerabilities | ✅ Implemented | MAC-POL-223 | MAC-RPT-103_Dependabot_Configuration_Evidence.md, MAC-RPT-103_Dependabot_Configuration_Evidence.md, MAC-RPT-121_3_11_2_scan_for_vulnerabilities_Evidence | MAC-RPT-114_Vulnerability_Scanning_Evidence.md, MAC-RPT-103_Dependabot_Configuration_Evidence.md | Vulnerability scanning, schedule | 7.11, 3.11.2 |
| 3.11.3 | Remediate vulnerabilities | ✅ Implemented | MAC-POL-223 | MAC-RPT-121_3_11_3_remediate_vulnerabilities_Evidence | MAC-RPT-115_Vulnerability_Remediation_Evidence.md | Remediation process, timelines | 7.11, 3.11.3 |

---

## 14. Security Assessment (SA) - 4 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.12.1 | Periodically assess security controls | ✅ Implemented | MAC-POL-224 | MAC-RPT-121_3_12_1_periodically_assess_security_controls_Evidence, MAC-RPT-121_3_12_1_periodically_assess_security_controls_Evidence, MAC-RPT-121_3_12_1_periodically_assess_security_controls_Evidence | - | Control assessment, assessment report | 7.12, 3.12.1 |
| 3.12.2 | Develop and implement POA&M | ✅ Implemented | MAC-POL-224 | MAC-RPT-121_3_12_2_develop_and_implement_poa_m_Evidence | - | POA&M process | 7.12, 3.12.2 |
| 3.12.3 | Monitor security controls | ✅ Implemented | MAC-POL-224 | MAC-RPT-121_3_12_3_monitor_security_controls_Evidence | - | Continuous monitoring log | 7.12, 3.12.3 |
| 3.12.4 | Develop/update SSP | ✅ Implemented | MAC-POL-224 | MAC-RPT-121_3_12_4_develop_update_ssp_Evidence | MAC-IT-304_System_Security_Plan.md | System Security Plan | 7.12, 3.12.4 |

---

## 15. System and Communications Protection (SC) - 16 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.13.1 | Monitor/control/protect communications | 🔄 Inherited / ✅ Implemented | MAC-POL-225 | MAC-IT-301_System_Description_and_Architecture.md | MAC-POL-225_System_and_Communications_Protection_Policy.md, MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-126_Communications_Protection_Operational_Evidence.md | Network security (Railway inherited), Application-layer controls (middleware.ts HTTPS enforcement, next.config.js security headers) | 7.13, 3.13.1 |
| 3.13.2 | Architectural designs | ✅ Implemented | MAC-POL-225 | MAC-RPT-121_3_13_2_architectural_designs_Evidence | MAC-IT-301_System_Description_and_Architecture.md | System architecture | 7.13, 3.13.2 |
| 3.13.3 | Separate user/system management | ✅ Implemented | MAC-POL-225 | MAC-IT-301_System_Description_and_Architecture.md | - | Role separation | 7.13, 3.13.3 |
| 3.13.4 | Prevent unauthorized information transfer | ✅ Implemented | MAC-POL-225 | - | Access controls | Information flow | 7.13, 3.13.4 |
| 3.13.5 | Implement subnetworks | 🔄 Inherited | MAC-POL-225 | - | Railway platform | Network segmentation | 7.13, 3.13.5 |
| 3.13.6 | Deny-by-default network communications | 🔄 Inherited | MAC-POL-225 | - | Railway platform | Network controls | 7.13, 3.13.6 |
| 3.13.7 | Prevent remote device dual connections | 🚫 Not Applicable | MAC-POL-225 | - | System architecture | All access remote, no non-remote connections | 7.13, 3.13.7 |
| 3.13.8 | Cryptographic mechanisms for CUI in transit | 🔄 Inherited | MAC-POL-225 | - | Railway platform | TLS/HTTPS | 7.13, 3.13.8 |
| 3.13.9 | Terminate network connections | 🔄 Inherited | MAC-POL-225 | - | Railway platform | Connection management | 7.13, 3.13.9 |
| 3.13.10 | Cryptographic key management | ✅ Implemented (Inherited) | MAC-POL-225 | MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-121_3_13_10_cryptographic_key_management_Evidence | MAC-RPT-116_Cryptographic_Key_Management_Evidence.md | Key management, documentation | 7.13, 3.13.10 |
| 3.13.11 | FIPS-validated cryptography | ❌ Not Implemented | MAC-POL-225 | - | MAC-RPT-110 | FIPS assessment | 7.13, 3.13.11 |
| 3.13.12 | Collaborative computing devices | 🚫 Not Applicable | MAC-POL-225 | - | System architecture | Web application, no collaborative devices | 7.13, 3.13.12 |
| 3.13.13 | Control mobile code | ✅ Implemented | MAC-POL-225 | MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-117 | MAC-RPT-117_Mobile_Code_Control_Evidence.md | Mobile code policy, CSP | 7.13, 3.13.13 |
| 3.13.14 | Control VoIP | 🚫 Not Applicable | MAC-POL-225 | - | System architecture | Web application, no VoIP functionality | 7.13, 3.13.14 |
| 3.13.15 | Protect authenticity of communications | 🔄 Inherited | MAC-POL-225 | - | Railway platform | TLS authentication | 7.13, 3.13.15 |
| 3.13.16 | Protect CUI at rest | 🔄 Inherited | MAC-POL-225 | - | Railway platform | Database encryption | 7.13, 3.13.16 |

---

## 16. System and Information Integrity (SI) - 7 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.14.1 | Identify/report/correct flaws | ✅ Implemented | MAC-POL-214 | MAC-RPT-103_Dependabot_Configuration_Evidence.md, MAC-RPT-121_3_14_1_identify_report_correct_flaws_Evidence | MAC-RPT-103_Dependabot_Configuration_Evidence.md | Flaw management | 7.14, 3.14.1 |
| 3.14.2 | Malicious code protection | 🔄 Inherited / ✅ Implemented | MAC-POL-214 | MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-112_Physical_Access_Device_Evidence.md | MAC-RPT-112_Physical_Access_Device_Evidence.md | Malware protection | 7.14, 3.14.2 |
| 3.14.3 | Monitor security alerts | ✅ Implemented | MAC-POL-214 | MAC-RPT-103_Dependabot_Configuration_Evidence.md, MAC-RPT-114_Vulnerability_Scanning_Evidence.md | MAC-RPT-114_Vulnerability_Scanning_Evidence.md, MAC-RPT-103_Dependabot_Configuration_Evidence.md | Alert monitoring | 7.14, 3.14.3 |
| 3.14.4 | Update malicious code protection | 🔄 Inherited / ✅ Implemented | MAC-POL-214 | MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-121_3_14_4_update_malicious_code_protection_Evidence | - | Protection updates | 7.14, 3.14.4 |
| 3.14.5 | Periodic/real-time scans | ✅ Implemented / 🔄 Inherited | MAC-POL-214 | MAC-RPT-103_Dependabot_Configuration_Evidence.md, MAC-IT-301_System_Description_and_Architecture.md | MAC-RPT-103_Dependabot_Configuration_Evidence.md | Vulnerability scanning | 7.14, 3.14.5 |
| 3.14.6 | Monitor systems and communications | ✅ Implemented | MAC-POL-214 | MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-118, MAC-RPT-121_3_14_6_monitor_systems_and_communications_Evidence | - | System monitoring, procedures | 7.14, 3.14.6 |
| 3.14.7 | Identify unauthorized use | ✅ Implemented | MAC-POL-214 | MAC-RPT-121_3_14_7_identify_unauthorized_use_Evidence | MAC-RPT-119_Unauthorized_Use_Detection_Evidence.md | Automated detection, alerts | 7.14, 3.14.7 |

---

## 17. Summary Statistics

**Total Controls:** 110

**Status Breakdown:**
- ✅ **Implemented:** 84 controls (76%)
- 🔄 **Inherited:** 20 controls (18%)
- ⚠️ **Partially Satisfied:** 0 controls (0%)
- ❌ **Not Implemented:** 3 controls (3%)
- 🚫 **Not Applicable:** 11 controls (10%)

**Control Families:**
- AC (Access Control): 22 controls
- AT (Awareness and Training): 3 controls
- AU (Audit and Accountability): 9 controls
- CM (Configuration Management): 9 controls
- IA (Identification and Authentication): 11 controls
- IR (Incident Response): 3 controls
- MA (Maintenance): 6 controls
- MP (Media Protection): 9 controls
- PS (Personnel Security): 2 controls
- PE (Physical Protection): 6 controls
- RA (Risk Assessment): 3 controls
- SA (Security Assessment): 4 controls
- SC (System and Communications Protection): 16 controls
- SI (System and Information Integrity): 7 controls

---

## 18. Related Documents

- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- Internal Cybersecurity Self-Assessment: `MAC-AUD-401_Internal_Cybersecurity_Self-Assessment.md`
- POA&M Tracking Log: `MAC-AUD-405_POA&M_Tracking_Log.md`
- Risk Assessment Report: `MAC-AUD-404_Risk_Assessment_Report.md`

---

## 19. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be completed]

**Change History:**
- Version 1.2 (2026-01-24): Converted 3 N/A controls (3.4.9, 3.8.7, 3.8.8) to Implemented with policy prohibition and endpoint compliance requirements
- Version 1.1 (2026-01-24): Updated to reflect current implementation state (97% readiness, 81 implemented, 12 inherited, 3 in POA&M)
- Version 1.0 (2026-01-23): Initial SCTM creation for CMMC Level 2 migration

---

## Appendix A: Status Legend

- ✅ **Implemented:** Control is fully implemented by the organization
- 🔄 **Inherited:** Control is provided by service provider (Railway, GitHub) and relied upon operationally
- ⚠️ **Partially Satisfied:** Control is partially implemented, requires enhancement
- ❌ **Not Implemented:** Control requires implementation (tracked in POA&M)
- 🚫 **Not Applicable:** Control is not applicable to system architecture (justification provided)

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
| 3.1.1 | Limit system access to authorized users, processes, devices | ✅ Implemented | MAC-POL-210 | MAC-SOP-221, MAC-SOP-222 | middleware.ts, lib/auth.ts, MAC-RPT-122_3_1_1_limit_system_access_Evidence | NextAuth.js, middleware | 7.1, 3.1.1 |
| 3.1.2 | Limit access to transactions/functions | ✅ Implemented | MAC-POL-210 | MAC-SOP-222 | middleware.ts, lib/authz.ts, MAC-RPT-122_3_1_2_limit_access_to_transactions_functions_Evidence | RBAC, middleware | 7.1, 3.1.2 |
| 3.1.3 | Control flow of CUI | ✅ Implemented | MAC-POL-210 | - | middleware.ts, lib/authz.ts, MAC-RPT-101_CUI_Blocking_Technical_Controls_Evidence, MAC-RPT-122_3_1_3_control_flow_of_cui_Evidence | Access controls | 7.1, 3.1.3 |
| 3.1.4 | Separate duties | ✅ Implemented | MAC-POL-210 | MAC-RPT-121_3_1_4_separate_duties_Evidence, MAC-RPT-117_Separation_of_Duties_Enforcement_Evidence | MAC-RPT-117_Separation_of_Duties_Enforcement_Evidence, MAC-RPT-121_3_1_4_separate_duties_Evidence, MAC-RPT-122_3_1_4_separate_duties_Evidence | RBAC enforcement (middleware.ts, lib/authz.ts) + SoD matrix documentation (MAC-SOP-235) | 7.1, 3.1.4 |
| 3.1.5 | Least privilege | ✅ Implemented | MAC-POL-210 | MAC-SOP-222 | middleware.ts, MAC-RPT-122_3_1_5_least_privilege_Evidence | RBAC | 7.1, 3.1.5 |
| 3.1.6 | Non-privileged accounts | ✅ Implemented | MAC-POL-210 | MAC-SOP-222 | middleware.ts, MAC-RPT-122_3_1_6_non_privileged_accounts_Evidence | prisma/schema.prisma, middleware.ts, lib/authz.ts | 7.1, 3.1.6 |
| 3.1.7 | Prevent privileged function execution | ✅ Implemented | MAC-POL-210 | - | middleware.ts, lib/audit.ts, MAC-RPT-122_3_1_7_prevent_privileged_function_execution_Evidence | RBAC enforcement (middleware.ts) + Audit logging (lib/audit.ts) | 7.1, 3.1.7 |
| 3.1.8 | Limit unsuccessful logon attempts | ✅ Implemented | MAC-POL-210 | MAC-SOP-222 | MAC-RPT-105_Account_Lockout_Implementation_Evidence, MAC-RPT-105 | lib/auth.ts, app/api/auth/custom-signin/route.ts | 7.1, 3.1.8 |
| 3.1.9 | Privacy/security notices | ✅ Implemented | MAC-POL-210 | ../02-policies-and-procedures/user-agreements/MAC-USR-001-Patrick_User_Agreement.md | ../02-policies-and-procedures/user-agreements/MAC-USR-001-Patrick_User_Agreement.md, MAC-RPT-121_3_1_9_privacy_security_notices_Evidence, MAC-RPT-122_3_1_9_privacy_security_notices_Evidence | User acknowledgments | 7.1, 3.1.9 |
| 3.1.10 | Session lock | ✅ Implemented | MAC-POL-210 | MAC-RPT-106_Session_Lock_Implementation_Evidence | MAC-RPT-106_Session_Lock_Implementation_Evidence, MAC-RPT-121_3_1_10_session_lock_Evidence, MAC-RPT-122_3_1_10_session_lock_Evidence | components/SessionLock.tsx | 7.1, 3.1.10 |
| 3.1.11 | Automatic session termination | ✅ Implemented | MAC-POL-210 | - | lib/auth.ts, MAC-RPT-122_3_1_11_automatic_session_termination_Evidence | 8-hour timeout | 7.1, 3.1.11 |
| 3.1.12 | Monitor remote access | ✅ Implemented | MAC-POL-210 | - | lib/audit.ts, MAC-RPT-122_3_1_12_monitor_remote_access_Evidence | Audit logging | 7.1, 3.1.12 |
| 3.1.13 | Cryptographic remote access | 🔄 Inherited | MAC-POL-210 | - | Railway platform | TLS/HTTPS | 7.1, 3.1.13 |
| 3.1.14 | Managed access control points | 🔄 Inherited | MAC-POL-210 | - | Railway platform | Platform routing | 7.1, 3.1.14 |
| 3.1.15 | Authorize remote privileged commands | ✅ Implemented | MAC-POL-210 | - | middleware.ts, lib/audit.ts | middleware.ts, lib/authz.ts | 7.1, 3.1.15 |
| 3.1.16 | Authorize wireless access | 🚫 Not Applicable | MAC-POL-210 | - | System architecture | Cloud-only, no organizational wireless infrastructure | 7.1, 3.1.16 |
| 3.1.17 | Protect wireless access | 🚫 Not Applicable | MAC-POL-210 | - | System architecture | Cloud-only, no organizational wireless infrastructure | 7.1, 3.1.17 |
| 3.1.18 | Control mobile devices | ✅ Implemented | MAC-POL-210 | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-121_3_1_18_control_mobile_devices_Evidence | Browser access | 7.1, 3.1.18 |
| 3.1.19 | Encrypt CUI on mobile devices | ✅ Implemented | MAC-POL-210 | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-121_3_1_19_encrypt_cui_on_mobile_devices_Evidence | CUI encrypted at rest (Railway), password protected access, no local CUI storage | 7.1, 3.1.19 |
| 3.1.20 | Verify external systems | ✅ Implemented | MAC-POL-210 | ../01-system-scope/MAC-IT-304_System_Security_Plan.md | ../01-system-scope/MAC-IT-304_System_Security_Plan.md, MAC-RPT-121_3_1_20_verify_external_systems_Evidence | External APIs | 7.1, 3.1.20 |
| 3.1.21 | Limit portable storage | ✅ Implemented | MAC-POL-213 | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-118_Portable_Storage_Controls_Evidence | MAC-RPT-118_Portable_Storage_Controls_Evidence, ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-121_3_1_21_limit_portable_storage_Evidence, MAC-RPT-122_3_1_21_limit_portable_storage_Evidence | Policy, technical controls | 7.1, 3.1.21 |
| 3.1.22 | Control CUI on public systems | ✅ Implemented | MAC-POL-210 | MAC-RPT-121_3_1_22_control_cui_on_public_systems_Evidence | middleware.ts, MAC-RPT-121_3_1_22_control_cui_on_public_systems_Evidence, MAC-RPT-101_CUI_Blocking_Technical_Controls_Evidence, MAC-RPT-122_3_1_22_control_cui_on_public_systems_Evidence | Approval workflow | 7.1, 3.1.22 |

---

## 4. Awareness and Training (AT) - 3 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.2.1 | Security awareness | ✅ Implemented | MAC-POL-219 | MAC-SOP-227 | training/security-awareness-training-content.md, training/training-completion-log.md, MAC-RPT-121_3_2_1_security_awareness_Evidence, MAC-RPT-122_3_2_1_security_awareness_Evidence | Training program, tracking | 7.3, 3.2.1 |
| 3.2.2 | Security training | ✅ Implemented | MAC-POL-219 | MAC-SOP-227 | training/training-completion-log.md, training/security-awareness-training-content.md, MAC-RPT-121_3_2_2_security_training_Evidence, MAC-RPT-122_3_2_2_security_training_Evidence | Training program, delivery | 7.3, 3.2.2 |
| 3.2.3 | Insider threat awareness | ✅ Implemented | MAC-POL-219 | MAC-SOP-227 | training/training-completion-log.md, training/security-awareness-training-content.md, MAC-RPT-121_3_2_3_insider_threat_awareness_Evidence, MAC-RPT-122_3_2_3_insider_threat_awareness_Evidence | Insider threat training, delivery | 7.3, 3.2.3 |

---

## 5. Audit and Accountability (AU) - 9 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.3.1 | Create and retain audit logs | ✅ Implemented | MAC-POL-218 | MAC-RPT-107_Audit_Log_Retention_Evidence, MAC-RPT-107 | MAC-RPT-107_Audit_Log_Retention_Evidence, lib/audit.ts, MAC-RPT-107, MAC-RPT-121_3_3_1_create_and_retain_audit_logs_Evidence, MAC-RPT-122_3_3_1_create_and_retain_audit_logs_Evidence | Audit logging, retention verification | 7.4, 3.3.1 |
| 3.3.2 | Unique user traceability | ✅ Implemented | MAC-POL-218 | - | lib/audit.ts | User identification | 7.4, 3.3.2 |
| 3.3.3 | Review and update logged events | ✅ Implemented | MAC-POL-218 | MAC-SOP-226 | audit-log-reviews/audit-log-review-log.md, MAC-RPT-121_3_3_3_review_and_update_logged_events_Evidence, MAC-RPT-123_3_3_1_create_and_retain_audit_logs_Evidence | MAC-SOP-226_Audit_Log_Review_Procedure.md | 7.4, 3.3.3 |
| 3.3.4 | Alert on audit logging failure | ✅ Implemented | MAC-POL-218 | MAC-SOP-226 | lib/audit.ts, MAC-RPT-122_3_3_4_alert_on_audit_logging_failure_Evidence | generateFailureAlerts() function | 7.4, 3.3.4 |
| 3.3.5 | Correlate audit records | ✅ Implemented | MAC-POL-218 | MAC-SOP-226 | lib/audit.ts, MAC-RPT-122_3_3_5_correlate_audit_records_Evidence | lib/audit.ts | 7.4, 3.3.5 |
| 3.3.6 | Audit record reduction/reporting | ✅ Implemented | MAC-POL-218 | - | /api/admin/events/export, MAC-RPT-122_3_3_6_audit_record_reduction_reporting_Evidence | CSV export | 7.4, 3.3.6 |
| 3.3.7 | System clock synchronization | 🔄 Inherited | MAC-POL-218 | - | Railway platform | NTP sync | 7.4, 3.3.7 |
| 3.3.8 | Protect audit information | ✅ Implemented | MAC-POL-218 | - | lib/audit.ts, MAC-RPT-122_3_3_8_protect_audit_information_Evidence | Append-only | 7.4, 3.3.8 |
| 3.3.9 | Limit audit logging management | ✅ Implemented | MAC-POL-218 | - | middleware.ts, MAC-RPT-122_3_3_9_limit_audit_logging_management_Evidence | Admin-only | 7.4, 3.3.9 |

---

## 6. Configuration Management (CM) - 9 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.4.1 | Baseline configurations | ✅ Implemented | MAC-POL-220 | MAC-RPT-121_3_4_1_baseline_configurations_Evidence | MAC-RPT-108_Configuration_Baseline_Evidence, MAC-RPT-121_3_4_1_baseline_configurations_Evidence, MAC-RPT-122_3_4_1_baseline_configurations_Evidence | CM plan, baseline inventory | 7.5, 3.4.1 |
| 3.4.2 | Security configuration settings | ✅ Implemented | MAC-POL-220 | MAC-RPT-121_3_4_2_security_configuration_settings_Evidence | MAC-RPT-108_Configuration_Baseline_Evidence, next.config.js, middleware.ts, MAC-RPT-121_3_4_2_security_configuration_settings_Evidence, MAC-RPT-122_3_4_2_security_configuration_settings_Evidence | Baseline, config files | 7.5, 3.4.2 |
| 3.4.3 | Change control | ✅ Implemented | MAC-POL-220 | MAC-RPT-121_3_4_3_change_control_Evidence | MAC-RPT-109_Change_Control_Evidence, MAC-RPT-121_3_4_3_change_control_Evidence, MAC-RPT-122_3_4_3_change_control_Evidence | Version control, approval process | 7.5, 3.4.3 |
| 3.4.4 | Security impact analysis | ✅ Implemented | MAC-POL-220 | MAC-SOP-225 | security-impact-analysis/security-impact-analysis-template.md, ../02-policies-and-procedures/MAC-CMP-001_Configuration_Management_Plan.md, MAC-RPT-121_3_4_4_security_impact_analysis_Evidence, MAC-RPT-124_Security_Impact_Analysis_Operational_Evidence | Analysis process (MAC-SOP-225), template, operational use in change control | 7.5, 3.4.4 |
| 3.4.5 | Change access restrictions | ✅ Implemented | MAC-POL-220 | MAC-RPT-121_3_4_5_change_access_restrictions_Evidence | MAC-RPT-109_Change_Control_Evidence, MAC-RPT-121_3_4_5_change_access_restrictions_Evidence, MAC-RPT-122_3_4_5_change_access_restrictions_Evidence | Access restrictions documented | 7.5, 3.4.5 |
| 3.4.6 | Least functionality | ✅ Implemented | MAC-POL-220 | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md, ../02-policies-and-procedures/MAC-POL-220_Configuration_Management_Policy.md, MAC-RPT-121_3_4_6_least_functionality_Evidence, MAC-RPT-125_Least_Functionality_Operational_Evidence | Minimal features, essential capabilities only, documented in architecture and CM policy | 7.5, 3.4.6 |
| 3.4.7 | Restrict nonessential programs | 🔄 Inherited | MAC-POL-220 | - | Railway platform | Platform controls | 7.5, 3.4.7 |
| 3.4.8 | Software restriction policy | ✅ Implemented | MAC-POL-220 | MAC-RPT-121_3_4_8_software_restriction_policy_Evidence | ../02-policies-and-procedures/MAC-POL-226_Software_Restriction_Policy.md, package.json, MAC-RPT-121_3_4_8_software_restriction_policy_Evidence, MAC-RPT-122_3_4_8_software_restriction_policy_Evidence | Restriction policy, inventory | 7.5, 3.4.8 |
| 3.4.9 | Control user-installed software | ✅ Implemented | MAC-POL-220 | - | ../02-policies-and-procedures/MAC-POL-220_Configuration_Management_Policy.md, Policy prohibition, endpoint compliance | Policy prohibition, approved software list, change control | 7.5, 3.4.9 |

---

## 7. Identification and Authentication (IA) - 11 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.5.1 | Identify users | ✅ Implemented | MAC-POL-211 | MAC-SOP-221, MAC-SOP-222 | MAC-RPT-122_3_5_1_identify_users_Evidence, MAC-RPT-130_3_5_1_identify_users_Evidence | User model | 7.2, 3.5.1 |
| 3.5.2 | Authenticate users | ✅ Implemented | MAC-POL-211 | - | lib/auth.ts, MAC-RPT-122_3_5_2_authenticate_users_Evidence | NextAuth.js | 7.2, 3.5.2 |
| 3.5.3 | MFA for privileged accounts | ✅ Implemented | MAC-POL-211 | MAC-RPT-121_3_5_3_mfa_for_privileged_accounts_Evidence | MAC-RPT-104_MFA_Implementation_Evidence, lib/mfa.ts, MAC-RPT-121_3_5_3_mfa_for_privileged_accounts_Evidence, MAC-RPT-122_3_5_3_mfa_for_privileged_accounts_Evidence | lib/mfa.ts, app/auth/mfa/ | 7.2, 3.5.3 |
| 3.5.4 | Replay-resistant authentication | ✅ Implemented | MAC-POL-211 | MAC-SOP-222 | lib/auth.ts, MAC-RPT-122_3_5_4_replay_resistant_authentication_Evidence | JWT tokens | 7.2, 3.5.4 |
| 3.5.5 | Prevent identifier reuse | ✅ Implemented | MAC-POL-211 | MAC-RPT-121_3_5_5_prevent_identifier_reuse_Evidence | MAC-RPT-120_Identifier_Reuse_Prevention_Evidence, MAC-RPT-121_3_5_5_prevent_identifier_reuse_Evidence, MAC-RPT-122_3_5_5_prevent_identifier_reuse_Evidence | Unique constraint, procedure | 7.2, 3.5.5 |
| 3.5.6 | Disable identifiers after inactivity | ✅ Implemented | MAC-POL-211 | MAC-SOP-222 | MAC-RPT-122_3_5_6_disable_identifiers_after_inactivity_Evidence | lib/inactivity-disable.ts, app/api/admin/users/disable-inactive/route.ts | 7.2, 3.5.6 |
| 3.5.7 | Password complexity | ✅ Implemented | MAC-POL-211 | MAC-SOP-222 | lib/password-policy.ts, MAC-RPT-122_3_5_7_password_complexity_Evidence | Password policy | 7.2, 3.5.7 |
| 3.5.8 | Prohibit password reuse | ✅ Implemented | MAC-POL-211 | MAC-RPT-121_3_5_8_prohibit_password_reuse_Evidence | MAC-RPT-120_Identifier_Reuse_Prevention_Evidence, MAC-RPT-121_3_5_8_prohibit_password_reuse_Evidence, MAC-RPT-122_3_5_8_prohibit_password_reuse_Evidence | Password history (5 generations) | 7.2, 3.5.8 |
| 3.5.9 | Temporary passwords | ✅ Implemented | MAC-POL-211 | MAC-SOP-221 | lib/temporary-password.ts, app/api/admin/create-user/route.ts, app/api/admin/reset-user-password/route.ts, lib/auth.ts, app/api/auth/change-password/route.ts, middleware.ts, app/api/auth/custom-signin/route.ts, app/auth/signin/page.tsx, app/api/auth/mfa/enroll/route.ts, prisma/schema.prisma, MAC-RPT-122_3_5_9_temporary_passwords_Evidence | lib/temporary-password.ts, app/api/admin/create-user/route.ts, app/api/admin/reset-user-password/route.ts, lib/auth.ts, app/api/auth/change-password/route.ts, middleware.ts | 7.2, 3.5.9 |
| 3.5.10 | Cryptographically-protected passwords | ✅ Implemented | MAC-POL-211 | MAC-SOP-222 | lib/auth.ts, MAC-RPT-122_3_5_10_cryptographically_protected_passwords_Evidence | bcrypt | 7.2, 3.5.10 |
| 3.5.11 | Obscure authentication feedback | ✅ Implemented | MAC-POL-211 | MAC-SOP-222 | lib/auth.ts, MAC-RPT-122_3_5_11_obscure_authentication_feedback_Evidence | Error handling | 7.2, 3.5.11 |

---

## 8. Incident Response (IR) - 3 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.6.1 | Operational incident-handling capability | ✅ Implemented | MAC-POL-215 | MAC-RPT-121_3_6_1_operational_incident_handling_capability_Evidence | MAC-RPT-121_3_6_1_operational_incident_handling_capability_Evidence, MAC-RPT-122_3_6_1_operational_incident_handling_capability_Evidence | IR capability, IRP | 7.9, 3.6.1 |
| 3.6.2 | Track, document, and report incidents | ✅ Implemented | MAC-POL-215 | MAC-RPT-121_3_6_2_track_document_and_report_incidents_Evidence | MAC-RPT-121_3_6_2_track_document_and_report_incidents_Evidence, MAC-RPT-122_3_6_2_track_document_and_report_incidents_Evidence | IR procedures | 7.9, 3.6.2 |
| 3.6.3 | Test incident response capability | ✅ Implemented | MAC-POL-215 | MAC-SOP-232 | MAC-RPT-121_3_6_3_test_incident_response_capability_Evidence | IR testing, tabletop exercise | 7.9, 3.6.3 |

---

## 9. Maintenance (MA) - 6 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.7.1 | Perform maintenance | 🔄 Inherited / ✅ Implemented | MAC-POL-221 | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md, ../01-system-scope/MAC-IT-304_System_Security_Plan.md | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md, ../01-system-scope/MAC-IT-304_System_Security_Plan.md, MAC-RPT-121_3_7_1_perform_maintenance_Evidence, MAC-RPT-122_3_7_1_perform_maintenance_Evidence | Platform/app maintenance | 7.10, 3.7.1 |
| 3.7.2 | Controls on maintenance tools | ❌ Not Implemented | MAC-POL-221 | - | Tool controls | Tool management | 7.10, 3.7.2 |
| 3.7.3 | Sanitize equipment for off-site maintenance | 🚫 Not Applicable | MAC-POL-221 | - | System architecture | Cloud-only, no customer equipment | 7.10, 3.7.3 |
| 3.7.4 | Check maintenance media | 🚫 Not Applicable | MAC-POL-221 | - | System architecture | Cloud-only, no diagnostic media | 7.10, 3.7.4 |
| 3.7.5 | MFA for nonlocal maintenance | ✅ Implemented (Inherited) | MAC-POL-221 | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-121_3_7_5_mfa_for_nonlocal_maintenance_Evidence | MAC-RPT-110_Maintenance_MFA_Evidence, ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-121_3_7_5_mfa_for_nonlocal_maintenance_Evidence, MAC-RPT-122_3_7_5_mfa_for_nonlocal_maintenance_Evidence | Platform MFA | 7.10, 3.7.5 |
| 3.7.6 | Supervise maintenance personnel | 🚫 Not Applicable | MAC-POL-221 | - | System architecture | Cloud-only, no customer maintenance personnel | 7.10, 3.7.6 |

---

## 10. Media Protection (MP) - 9 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.8.1 | Protect system media | ✅ Implemented | MAC-POL-213 | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-121_3_8_1_protect_system_media_Evidence | Database encryption | 7.6, 3.8.1 |
| 3.8.2 | Limit access to CUI on media | ✅ Implemented | MAC-POL-213 | - | Access controls | RBAC | 7.6, 3.8.2 |
| 3.8.3 | Sanitize/destroy media | ✅ Implemented | MAC-POL-213 | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-121_3_8_3_sanitize_destroy_media_Evidence | No removable media | 7.6, 3.8.3 |
| 3.8.4 | Mark media with CUI markings | 🚫 Not Applicable | MAC-POL-213 | - | System architecture | Digital-only, no physical media | 7.6, 3.8.4 |
| 3.8.5 | Control access during transport | 🚫 Not Applicable | MAC-POL-213 | - | System architecture | Cloud-only, no physical media transport | 7.6, 3.8.5 |
| 3.8.6 | Cryptographic protection on digital media | 🔄 Inherited | MAC-POL-213 | - | Railway platform | Database encryption | 7.6, 3.8.6 |
| 3.8.7 | Control removable media | ✅ Implemented | MAC-POL-213 | ../02-policies-and-procedures/MAC-FRM-203_User_Access_and_FCI_Handling_Acknowledgement.md | ../02-policies-and-procedures/MAC-POL-213_Media_Handling_Policy.md, ../02-policies-and-procedures/MAC-FRM-203_User_Access_and_FCI_Handling_Acknowledgement.md, Policy prohibition, user agreements, technical controls | Policy prohibition, browser-based restrictions, endpoint compliance | 7.6, 3.8.7 |
| 3.8.8 | Prohibit portable storage without owner | ✅ Implemented | MAC-POL-213 | ../02-policies-and-procedures/MAC-FRM-203_User_Access_and_FCI_Handling_Acknowledgement.md | ../02-policies-and-procedures/MAC-POL-213_Media_Handling_Policy.md, ../02-policies-and-procedures/MAC-FRM-203_User_Access_and_FCI_Handling_Acknowledgement.md, ../07-nist-controls/NIST-3.8.8_prohibit_portable_storage_without_owner.md, Policy prohibition, owner identification requirements | Policy prohibition, owner identification (for exceptions), asset inventory | 7.6, 3.8.8 |
| 3.8.9 | Protect backup CUI | 🔄 Inherited | MAC-POL-213 | - | Railway platform | Backup encryption | 7.6, 3.8.9 |

---

## 11. Personnel Security (PS) - 2 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.9.1 | Screen individuals prior to access | ✅ Implemented | MAC-POL-222 | MAC-SOP-233 | MAC-RPT-121_3_9_1_screen_individuals_prior_to_access_Evidence, MAC-RPT-122_3_9_1_screen_individuals_prior_to_access_Evidence | Screening process, records | 7.7, 3.9.1 |
| 3.9.2 | Protect systems during/after personnel actions | ✅ Implemented | MAC-POL-222 | MAC-RPT-121_3_9_2_protect_systems_during_after_personnel_actions_Evidence | personnel-screening/screening-completion-log.md, personnel-screening/screening-records-template.md, MAC-RPT-121_3_9_2_protect_systems_during_after_personnel_actions_Evidence | Termination procedures, access revocation | 7.7, 3.9.2 |

---

## 12. Physical Protection (PE) - 6 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.10.1 | Limit physical access | ✅ Implemented | MAC-POL-212 | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-121_3_10_1_limit_physical_access_Evidence | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-121_3_10_1_limit_physical_access_Evidence, MAC-RPT-122_3_10_1_limit_physical_access_Evidence | Platform/facility controls | 7.8, 3.10.1 |
| 3.10.2 | Protect and monitor facility | ✅ Implemented | MAC-POL-212 | MAC-RPT-121_3_10_2_protect_and_monitor_facility_Evidence | ../02-policies-and-procedures/MAC-POL-212_Physical_Security_Policy.md, MAC-RPT-121_3_10_2_protect_and_monitor_facility_Evidence, MAC-RPT-122_3_10_2_protect_and_monitor_facility_Evidence | Facility protection | 7.8, 3.10.2 |
| 3.10.3 | Escort and monitor visitors | ✅ Implemented | MAC-POL-212 | MAC-RPT-121_3_10_3_escort_and_monitor_visitors_Evidence | MAC-RPT-111_Visitor_Controls_Evidence, MAC-RPT-121_3_10_3_escort_and_monitor_visitors_Evidence, MAC-RPT-122_3_10_3_escort_and_monitor_visitors_Evidence | Visitor monitoring | 7.8, 3.10.3 |
| 3.10.4 | Physical access audit logs | ✅ Implemented | MAC-POL-212 | - | /admin/physical-access-logs | Physical access logging | 7.8, 3.10.4 |
| 3.10.5 | Control physical access devices | ✅ Implemented | MAC-POL-212 | MAC-RPT-121_3_10_5_control_physical_access_devices_Evidence | MAC-RPT-112_Physical_Access_Device_Evidence, MAC-RPT-121_3_10_5_control_physical_access_devices_Evidence, MAC-RPT-122_3_10_5_control_physical_access_devices_Evidence | Access devices | 7.8, 3.10.5 |
| 3.10.6 | Safeguarding at alternate work sites | ✅ Implemented | MAC-POL-212 | MAC-RPT-121_3_10_6_safeguarding_at_alternate_work_sites_Evidence | MAC-RPT-113_Alternate_Work_Site_Safeguarding_Evidence, MAC-RPT-121_3_10_6_safeguarding_at_alternate_work_sites_Evidence, MAC-RPT-122_3_10_6_safeguarding_at_alternate_work_sites_Evidence | Alternate sites | 7.8, 3.10.6 |

---

## 13. Risk Assessment (RA) - 3 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.11.1 | Periodically assess risk | ✅ Implemented | MAC-POL-223 | MAC-RPT-121_3_11_1_periodically_assess_risk_Evidence | MAC-RPT-121_3_11_1_periodically_assess_risk_Evidence, MAC-RPT-122_3_11_1_periodically_assess_risk_Evidence | Risk assessment | 7.11, 3.11.1 |
| 3.11.2 | Scan for vulnerabilities | ✅ Implemented | MAC-POL-223 | MAC-RPT-103_Dependabot_Configuration_Evidence, MAC-RPT-121_3_11_2_scan_for_vulnerabilities_Evidence | MAC-RPT-114_Vulnerability_Scanning_Evidence, MAC-RPT-103_Dependabot_Configuration_Evidence, MAC-RPT-121_3_11_2_scan_for_vulnerabilities_Evidence, MAC-RPT-122_3_11_2_scan_for_vulnerabilities_Evidence | Vulnerability scanning, schedule | 7.11, 3.11.2 |
| 3.11.3 | Remediate vulnerabilities | ✅ Implemented | MAC-POL-223 | MAC-RPT-121_3_11_3_remediate_vulnerabilities_Evidence | MAC-RPT-115_Vulnerability_Remediation_Evidence, MAC-RPT-121_3_11_3_remediate_vulnerabilities_Evidence, MAC-RPT-122_3_11_3_remediate_vulnerabilities_Evidence | Remediation process, timelines | 7.11, 3.11.3 |

---

## 14. Security Assessment (SA) - 4 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.12.1 | Periodically assess security controls | ✅ Implemented | MAC-POL-224 | MAC-RPT-121_3_12_1_periodically_assess_security_controls_Evidence | MAC-RPT-121_3_12_1_periodically_assess_security_controls_Evidence, MAC-RPT-122_3_12_1_periodically_assess_security_controls_Evidence | Control assessment, assessment report | 7.12, 3.12.1 |
| 3.12.2 | Develop and implement POA&M | ✅ Implemented | MAC-POL-224 | MAC-RPT-121_3_12_2_develop_and_implement_poa_m_Evidence | MAC-RPT-121_3_12_2_develop_and_implement_poa_m_Evidence, MAC-RPT-122_3_12_2_develop_and_implement_poa_m_Evidence | POA&M process | 7.12, 3.12.2 |
| 3.12.3 | Monitor security controls | ✅ Implemented | MAC-POL-224 | MAC-RPT-121_3_12_3_monitor_security_controls_Evidence | MAC-RPT-121_3_12_3_monitor_security_controls_Evidence, MAC-RPT-122_3_12_3_monitor_security_controls_Evidence | Continuous monitoring log | 7.12, 3.12.3 |
| 3.12.4 | Develop/update SSP | ✅ Implemented | MAC-POL-224 | MAC-RPT-121_3_12_4_develop_update_ssp_Evidence | ../01-system-scope/MAC-IT-304_System_Security_Plan.md, MAC-RPT-121_3_12_4_develop_update_ssp_Evidence, MAC-RPT-122_3_12_4_develop_update_ssp_Evidence | System Security Plan | 7.12, 3.12.4 |

---

## 15. System and Communications Protection (SC) - 16 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.13.1 | Monitor/control/protect communications | 🔄 Inherited / ✅ Implemented | MAC-POL-225 | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md | ../02-policies-and-procedures/MAC-POL-225_System_and_Communications_Protection_Policy.md, ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-126_Communications_Protection_Operational_Evidence, MAC-RPT-121_3_13_1_monitor_control_protect_communications_Evidence | Network security (Railway inherited), Application-layer controls (middleware.ts HTTPS enforcement, next.config.js, security headers) | 7.13, 3.13.1 |
| 3.13.2 | Architectural designs | ✅ Implemented | MAC-POL-225 | MAC-RPT-121_3_13_2_architectural_designs_Evidence | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-121_3_13_2_architectural_designs_Evidence, MAC-RPT-122_3_13_2_architectural_designs_Evidence | System architecture | 7.13, 3.13.2 |
| 3.13.3 | Separate user/system management | ✅ Implemented | MAC-POL-225 | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-121_3_13_3_separate_user_system_management_Evidence | Role separation | 7.13, 3.13.3 |
| 3.13.4 | Prevent unauthorized information transfer | ✅ Implemented | MAC-POL-225 | - | Access controls | Information flow | 7.13, 3.13.4 |
| 3.13.5 | Implement subnetworks | 🔄 Inherited | MAC-POL-225 | - | Railway platform | Network segmentation | 7.13, 3.13.5 |
| 3.13.6 | Deny-by-default network communications | 🔄 Inherited | MAC-POL-225 | - | Railway platform | Network controls | 7.13, 3.13.6 |
| 3.13.7 | Prevent remote device dual connections | 🚫 Not Applicable | MAC-POL-225 | - | System architecture | All access remote, no non-remote connections | 7.13, 3.13.7 |
| 3.13.8 | Cryptographic mechanisms for CUI in transit | 🔄 Inherited | MAC-POL-225 | - | Railway platform | TLS/HTTPS | 7.13, 3.13.8 |
| 3.13.9 | Terminate network connections | 🔄 Inherited | MAC-POL-225 | - | Railway platform | Connection management | 7.13, 3.13.9 |
| 3.13.10 | Cryptographic key management | ✅ Implemented (Inherited) | MAC-POL-225 | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-121_3_13_10_cryptographic_key_management_Evidence | MAC-RPT-116_Cryptographic_Key_Management_Evidence, MAC-RPT-121_3_13_10_cryptographic_key_management_Evidence, MAC-RPT-122_3_13_10_cryptographic_key_management_Evidence | Key management, documentation | 7.13, 3.13.10 |
| 3.13.11 | FIPS-validated cryptography | ❌ Not Implemented | MAC-POL-225 | - | MAC-RPT-110_FIPS_Cryptography_Assessment_Evidence | FIPS assessment | 7.13, 3.13.11 |
| 3.13.12 | Collaborative computing devices | 🚫 Not Applicable | MAC-POL-225 | - | System architecture | Web application, no collaborative devices | 7.13, 3.13.12 |
| 3.13.13 | Control mobile code | ✅ Implemented | MAC-POL-225 | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-117_Mobile_Code_Control_Evidence | MAC-RPT-117_Mobile_Code_Control_Evidence, MAC-RPT-121_3_13_13_control_mobile_code_Evidence, MAC-RPT-122_3_13_13_control_mobile_code_Evidence | Mobile code policy, CSP | 7.13, 3.13.13 |
| 3.13.14 | Control VoIP | 🚫 Not Applicable | MAC-POL-225 | - | System architecture | Web application, no VoIP functionality | 7.13, 3.13.14 |
| 3.13.15 | Protect authenticity of communications | 🔄 Inherited | MAC-POL-225 | - | Railway platform | TLS authentication | 7.13, 3.13.15 |
| 3.13.16 | Protect CUI at rest | 🔄 Inherited | MAC-POL-225 | - | Railway platform | Database encryption | 7.13, 3.13.16 |

---

## 16. System and Information Integrity (SI) - 7 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.14.1 | Identify/report/correct flaws | ✅ Implemented | MAC-POL-214 | MAC-RPT-103_Dependabot_Configuration_Evidence, MAC-RPT-121_3_14_1_identify_report_correct_flaws_Evidence | MAC-RPT-103_Dependabot_Configuration_Evidence, MAC-RPT-121_3_14_1_identify_report_correct_flaws_Evidence, MAC-RPT-122_3_14_1_identify_report_correct_flaws_Evidence | Flaw management | 7.14, 3.14.1 |
| 3.14.2 | Malicious code protection | 🔄 Inherited / ✅ Implemented | MAC-POL-214 | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-112_Physical_Access_Device_Evidence | MAC-RPT-112_Physical_Access_Device_Evidence, MAC-RPT-121_3_14_2_malicious_code_protection_Evidence, MAC-RPT-122_3_14_2_malicious_code_protection_Evidence | Malware protection | 7.14, 3.14.2 |
| 3.14.3 | Monitor security alerts | ✅ Implemented | MAC-POL-214 | MAC-RPT-103_Dependabot_Configuration_Evidence, MAC-RPT-114_Vulnerability_Scanning_Evidence | MAC-RPT-114_Vulnerability_Scanning_Evidence, MAC-RPT-103_Dependabot_Configuration_Evidence, MAC-RPT-121_3_14_3_monitor_security_alerts_Evidence, MAC-RPT-122_3_14_3_monitor_security_alerts_Evidence | Alert monitoring | 7.14, 3.14.3 |
| 3.14.4 | Update malicious code protection | 🔄 Inherited / ✅ Implemented | MAC-POL-214 | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-121_3_14_4_update_malicious_code_protection_Evidence | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-121_3_14_4_update_malicious_code_protection_Evidence, MAC-RPT-122_3_14_4_update_malicious_code_protection_Evidence | Protection updates | 7.14, 3.14.4 |
| 3.14.5 | Periodic/real-time scans | ✅ Implemented / 🔄 Inherited | MAC-POL-214 | MAC-RPT-103_Dependabot_Configuration_Evidence, ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md | MAC-RPT-103_Dependabot_Configuration_Evidence, ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-121_3_14_5_periodic_real_time_scans_Evidence, MAC-RPT-122_3_14_5_periodic_real_time_scans_Evidence | Vulnerability scanning | 7.14, 3.14.5 |
| 3.14.6 | Monitor systems and communications | ✅ Implemented | MAC-POL-214 | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-118_Portable_Storage_Controls_Evidence, MAC-RPT-121_3_14_6_monitor_systems_and_communications_Evidence | ../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md, MAC-RPT-118_Portable_Storage_Controls_Evidence, MAC-RPT-121_3_14_6_monitor_systems_and_communications_Evidence, MAC-RPT-122_3_14_6_monitor_systems_and_communications_Evidence | System monitoring, procedures | 7.14, 3.14.6 |
| 3.14.7 | Identify unauthorized use | ✅ Implemented | MAC-POL-214 | MAC-RPT-121_3_14_7_identify_unauthorized_use_Evidence | MAC-RPT-119_Unauthorized_Use_Detection_Evidence, MAC-RPT-121_3_14_7_identify_unauthorized_use_Evidence, MAC-RPT-122_3_14_7_identify_unauthorized_use_Evidence | Automated detection, alerts | 7.14, 3.14.7 |

---

## 17. Summary Statistics

**Total Controls:** 110

**Status Breakdown:**
- ✅ **Implemented:** 85 controls (77%)
- 🔄 **Inherited:** 20 controls (18%)
- ⚠️ **Partially Satisfied:** 0 controls (0%)
- ❌ **Not Implemented:** 3 controls (3%)
- 🚫 **Not Applicable:** 10 controls (9%)

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


---

## 17.1. Control Implementation Details (Enriched from NIST Control Files)

This section provides detailed implementation information extracted from NIST SP 800-171 control assessment files.

### AC - 22 Controls

<details>
<summary><strong>3.1.1</strong> - Limit system access to authorized users, processes, devices</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation











 `middleware.ts`



 `lib/auth.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.1.1 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-122_3_1_1_limit_system_access_Evidence`

</details>

<details>
<summary><strong>3.1.10</strong> - Session lock</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation















 `components/SessionLock.tsx`



 `app/layout.tsx`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.1.10 implemented as specified
- ✅ Implementation verified: Session lock component
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-106_Session_Lock_Implementation_Evidence`
- `MAC-RPT-121_3_1_10_session_lock_Evidence`
- `MAC-RPT-122_3_1_10_session_lock_Evidence`

</details>

<details>
<summary><strong>3.1.11</strong> - Automatic session termination</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation











 `lib/auth.ts`



 `middleware.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.1.11 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-122_3_1_11_automatic_session_termination_Evidence`

</details>

<details>
<summary><strong>3.1.12</strong> - Monitor remote access</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation









 `lib/audit.ts`



 `middleware.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.1.12 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-122_3_1_12_monitor_remote_access_Evidence`

</details>

<details>
<summary><strong>3.1.13</strong> - Cryptographic remote access</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures


### 4.4 Inherited Control Details

 Railway Platform

  
This control is provided by the Railway Platform and relied upon operationally. The organization does not imple...

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Inherited control validated through provider assurance artifacts
- ✅ Provider controls verified
- ✅ Validation documented

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.1.14</strong> - Managed access control points</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures


### 4.4 Inherited Control Details

 Railway Platform

  
This control is provided by the Railway Platform and relied upon operationally. The organization does not imple...

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Inherited control validated through provider assurance artifacts
- ✅ Provider controls verified
- ✅ Validation documented

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.1.15</strong> - Authorize remote privileged commands</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

  
Admin controls



 `middleware.ts`



 `lib/audit.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.1.15 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.1.16</strong> - Authorize wireless access</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Verification Details

**Justification/Rationale for Not Applicable Status:**

This control requires organizations to authorize wireless access before allowing such connections. However, this control is not applicable to our environment because:

1. **Cloud-Only Architecture**: The system operates entirely in a cloud environment (Railway platform). The organization does not maintain any on-premises infrastructure, servers, or network equipment that would require wireless access authorization.

2. **No Organizational Wireless Infrastructure**: The organization does not deploy, manage, or maintain any wireless access points, wireless networks, or wireless infrastructure. All system access occurs through standard web browsers over HTTPS connections to the cloud-hosted application.

3. **Remote Access Model**: All user access to the system is remote and occurs through standard web browsers. There are no organizational wireless networks that users connect to in order to access the system. Users access the system from their own networks (home, office, mobile) using standard internet connectivity.

4. **Control Scope**: This control applies to organizational infrastructure where the organization directly manages wireless access points and must authorize wireless connections. Since the organization has no such infrastructure, this control is outside the scope of our system architecture.

**Conclusion**: This control is not applicable because the organization does not maintain any wireless infrastructure that would require authorization controls. All system access is cloud-based and occurs through standard web browsers over standard internet connections.

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Not applicable justification documented
- ✅ Architecture review confirms non-applicability

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.1.17</strong> - Protect wireless access</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Verification Details

**Justification/Rationale for Not Applicable Status:**

This control requires organizations to protect wireless access using authentication and encryption. However, this control is not applicable to our environment because:

1. **Cloud-Only Architecture**: The system operates entirely in a cloud environment (Railway platform). The organization does not maintain any on-premises infrastructure, servers, or network equipment that would require wireless access protection.

2. **No Organizational Wireless Infrastructure**: The organization does not deploy, manage, or maintain any wireless access points, wireless networks, or wireless infrastructure. All system access occurs through standard web browsers over HTTPS connections to the cloud-hosted application.

3. **Remote Access Model**: All user access to the system is remote and occurs through standard web browsers. There are no organizational wireless networks that users connect to in order to access the system. Users access the system from their own networks (home, office, mobile) using standard internet connectivity.

4. **Control Scope**: This control applies to organizational infrastructure where the organization directly manages wireless access points and must protect wireless connections. Since the organization has no such infrastructure, this control is outside the scope of our system architecture.

**Conclusion**: This control is not applicable because the organization does not maintain any wireless infrastructure that would require protection controls. All system access is cloud-based and occurs through standard web browsers over standard internet connections, with protection provided by TLS/HTTPS encryption.

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Not applicable justification documented
- ✅ Architecture review confirms non-applicability

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.1.18</strong> - Control mobile devices</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation









 `middleware.ts`



 `lib/auth.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.1.18 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_1_18_control_mobile_devices_Evidence`

</details>

<details>
<summary><strong>3.1.19</strong> - Encrypt CUI on mobile devices</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation









 `lib/file-storage.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.1.19 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_1_19_encrypt_cui_on_mobile_devices_Evidence`

</details>

<details>
<summary><strong>3.1.2</strong> - Limit access to transactions/functions</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation













 `middleware.ts`



 `lib/authz.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.1.2 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-122_3_1_2_limit_access_to_transactions_functions_Evidence`

</details>

<details>
<summary><strong>3.1.20</strong> - Verify external systems</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation











 `lib/sam/samClient.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.1.20 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_1_20_verify_external_systems_Evidence`

</details>

<details>
<summary><strong>3.1.21</strong> - Limit portable storage</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation



 `prisma/schema.prisma`



 `app/api/admin/events/export/route.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.1.21 implemented as specified
- ✅ Implementation verified: Policy, technical controls
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-118_Portable_Storage_Controls_Evidence`
- `MAC-RPT-121_3_1_21_limit_portable_storage_Evidence`
- `MAC-RPT-122_3_1_21_limit_portable_storage_Evidence`

</details>

<details>
<summary><strong>3.1.22</strong> - Control CUI on public systems</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation















 `lib/cui-blocker.ts`



 `lib/file-storage.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.1.22 implemented as specified
- ✅ Implementation verified: Approval workflow
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-101_CUI_Blocking_Technical_Controls_Evidence`
- `MAC-RPT-121_3_1_22_control_cui_on_public_systems_Evidence`
- `MAC-RPT-122_3_1_22_control_cui_on_public_systems_Evidence`

</details>

<details>
<summary><strong>3.1.3</strong> - Control flow of CUI</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation















 `lib/cui-blocker.ts`



 `lib/file-storage.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-101_CUI_Blocking_Technical_Controls_Evidence`
- `MAC-RPT-122_3_1_3_control_flow_of_cui_Evidence`

</details>

<details>
<summary><strong>3.1.4</strong> - Separate duties</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation















 `middleware.ts`



 `lib/authz.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Role-based access enforced at middleware level
- ✅ Non-admin users redirected from admin routes
- ✅ Role changes logged in audit system
- ✅ Separation of duties matrix documented
- ✅ Administrative actions traceable via audit logs

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-117_Separation_of_Duties_Enforcement_Evidence`
- `MAC-RPT-121_3_1_4_separate_duties_Evidence`
- `MAC-RPT-122_3_1_4_separate_duties_Evidence`

</details>

<details>
<summary><strong>3.1.5</strong> - Least privilege</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation











 `middleware.ts`



 `lib/authz.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.1.5 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-122_3_1_5_least_privilege_Evidence`

</details>

<details>
<summary><strong>3.1.6</strong> - Non-privileged accounts</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation











 `prisma/schema.prisma`



 `middleware.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.1.6 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-122_3_1_6_non_privileged_accounts_Evidence`

</details>

<details>
<summary><strong>3.1.7</strong> - Prevent privileged function execution</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation













 `middleware.ts`



 `lib/authz.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.1.7 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-122_3_1_7_prevent_privileged_function_execution_Evidence`

</details>

<details>
<summary><strong>3.1.8</strong> - Limit unsuccessful logon attempts</summary>

#### Implementation Details

**Code Files:**
- `lib/auth.ts` - NextAuth credentials provider
- `app/api/auth/custom-signin/route.ts` - Custom sign-in API route

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation


- Maximum failed attempts: 5 consecutive failed login attempts
- Lockout duration: 30 minutes
- Lockout reset: Automatic on successful login


- `lib/auth.ts` - NextAuth credentials provider
- `app/api/auth/custom-signin/route.ts` - Custom...

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-105`
- `MAC-RPT-105_Account_Lockout_Implementation_Evidence`

</details>

<details>
<summary><strong>3.1.9</strong> - Privacy/security notices</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation







 `app/auth/security-acknowledgment/page.tsx`



 `prisma/schema.prisma`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.1.9 implemented as specified
- ✅ Implementation verified: User acknowledgments
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_1_9_privacy_security_notices_Evidence`
- `MAC-RPT-122_3_1_9_privacy_security_notices_Evidence`

</details>

### AT - 3 Controls

<details>
<summary><strong>3.2.1</strong> - Security awareness</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.2.1 implemented as specified
- ✅ Implementation verified: Training program, tracking
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_2_1_security_awareness_Evidence`
- `MAC-RPT-122_3_2_1_security_awareness_Evidence`

</details>

<details>
<summary><strong>3.2.2</strong> - Security training</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.2.2 implemented as specified
- ✅ Implementation verified: Training program, delivery
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_2_2_security_training_Evidence`
- `MAC-RPT-122_3_2_2_security_training_Evidence`

</details>

<details>
<summary><strong>3.2.3</strong> - Insider threat awareness</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.2.3 implemented as specified
- ✅ Implementation verified: Insider threat training, delivery
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_2_3_insider_threat_awareness_Evidence`
- `MAC-RPT-122_3_2_3_insider_threat_awareness_Evidence`

</details>

### AU - 9 Controls

<details>
<summary><strong>3.3.1</strong> - Create and retain audit logs</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation













 `lib/audit.ts`



 `lib/auth.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Audit logs created for all authentication events
- ✅ Audit logs created for all admin actions
- ✅ Audit logs retained for minimum 90 days
- ✅ CSV export functionality operational
- ✅ Admin-only access enforced

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-107`
- `MAC-RPT-107_Audit_Log_Retention_Evidence`
- `MAC-RPT-121_3_3_1_create_and_retain_audit_logs_Evidence`
- `MAC-RPT-122_3_3_1_create_and_retain_audit_logs_Evidence`

</details>

<details>
<summary><strong>3.3.2</strong> - Unique user traceability</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

  
User identification



 `lib/audit.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.3.2 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.3.3</strong> - Review and update logged events</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation







 `lib/audit.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.3.3 implemented as specified
- ✅ Implementation verified: Review process, review log
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_3_3_review_and_update_logged_events_Evidence`
- `MAC-RPT-123_3_3_1_create_and_retain_audit_logs_Evidence`

</details>

<details>
<summary><strong>3.3.4</strong> - Alert on audit logging failure</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation









 `lib/audit.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.3.4 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-122_3_3_4_alert_on_audit_logging_failure_Evidence`

</details>

<details>
<summary><strong>3.3.5</strong> - Correlate audit records</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation











 `lib/audit.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.3.5 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-122_3_3_5_correlate_audit_records_Evidence`

</details>

<details>
<summary><strong>3.3.6</strong> - Audit record reduction/reporting</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation









 `lib/audit.ts`



 `app/api/admin/events/export/route.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.3.6 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-122_3_3_6_audit_record_reduction_reporting_Evidence`

</details>

<details>
<summary><strong>3.3.7</strong> - System clock synchronization</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures


### 4.4 Inherited Control Details

 Railway Platform

  
This control is provided by the Railway Platform and relied upon operationally. The organization does not imple...

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Inherited control validated through provider assurance artifacts
- ✅ Provider controls verified
- ✅ Validation documented

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.3.8</strong> - Protect audit information</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation









 `lib/audit.ts`



 `prisma/schema.prisma`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.3.8 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-122_3_3_8_protect_audit_information_Evidence`

</details>

<details>
<summary><strong>3.3.9</strong> - Limit audit logging management</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation











 `middleware.ts`



 `app/api/admin/events/export/route.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.3.9 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-122_3_3_9_limit_audit_logging_management_Evidence`

</details>

### CM - 9 Controls

<details>
<summary><strong>3.4.1</strong> - Baseline configurations</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation



 `next.config.js`



 `middleware.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.4.1 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-108_Configuration_Baseline_Evidence`
- `MAC-RPT-121_3_4_1_baseline_configurations_Evidence`
- `MAC-RPT-122_3_4_1_baseline_configurations_Evidence`

</details>

<details>
<summary><strong>3.4.2</strong> - Security configuration settings</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation







 `next.config.js`



 `middleware.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.4.2 implemented as specified
- ✅ Implementation verified: Baseline, config files
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-108_Configuration_Baseline_Evidence`
- `MAC-RPT-121_3_4_2_security_configuration_settings_Evidence`
- `MAC-RPT-122_3_4_2_security_configuration_settings_Evidence`

</details>

<details>
<summary><strong>3.4.3</strong> - Change control</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.4.3 implemented as specified
- ✅ Implementation verified: Version control, approval process
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-109_Change_Control_Evidence`
- `MAC-RPT-121_3_4_3_change_control_Evidence`
- `MAC-RPT-122_3_4_3_change_control_Evidence`

</details>

<details>
<summary><strong>3.4.4</strong> - Security impact analysis</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.4.4 implemented as specified
- ✅ Implementation verified: Analysis process, template
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_4_4_security_impact_analysis_Evidence`
- `MAC-RPT-124_Security_Impact_Analysis_Operational_Evidence`

</details>

<details>
<summary><strong>3.4.5</strong> - Change access restrictions</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.4.5 implemented as specified
- ✅ Implementation verified: Access restrictions documented
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-109_Change_Control_Evidence`
- `MAC-RPT-121_3_4_5_change_access_restrictions_Evidence`
- `MAC-RPT-122_3_4_5_change_access_restrictions_Evidence`

</details>

<details>
<summary><strong>3.4.6</strong> - Least functionality</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.4.6 implemented as specified
- ✅ Implementation verified: Minimal features
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_4_6_least_functionality_Evidence`
- `MAC-RPT-125_Least_Functionality_Operational_Evidence`

</details>

<details>
<summary><strong>3.4.7</strong> - Restrict nonessential programs</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures


### 4.4 Inherited Control Details

 Railway Platform

  
This control is provided by the Railway Platform and relied upon operationally. The organization does not imple...

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Inherited control validated through provider assurance artifacts
- ✅ Provider controls verified
- ✅ Validation documented

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.4.8</strong> - Software restriction policy</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation





### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.4.8 implemented as specified
- ✅ Implementation verified: Restriction policy, inventory
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_4_8_software_restriction_policy_Evidence`
- `MAC-RPT-122_3_4_8_software_restriction_policy_Evidence`

</details>

<details>
<summary><strong>3.4.9</strong> - Control user-installed software</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation


The organization implements control of user-installed software through explicit policy prohibition on endpoints accessing CUI systems. While the cloud-hosted application infrastructure does not allow user software installation, endpoints u...

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Policy prohibition documented
- ✅ Endpoint compliance requirements established
- ✅ Approved software list process implemented
- ✅ Change control process for software installation established
- ✅ Software inventory process documented
- ✅ Exception handling process established

**Last Verification Date:** 2026-01-24

</details>

### IA - 11 Controls

<details>
<summary><strong>3.5.1</strong> - Identify users</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation









 `prisma/schema.prisma`



 `app/api/admin/create-user/route.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.5.1 implemented as specified
- ✅ Implementation verified: User model
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-122_3_5_1_identify_users_Evidence`
- `MAC-RPT-130_3_5_1_identify_users_Evidence`

</details>

<details>
<summary><strong>3.5.10</strong> - Cryptographically-protected passwords</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation















 `lib/auth.ts`



 `lib/password-policy.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.5.10 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-122_3_5_10_cryptographically_protected_passwords_Evidence`

</details>

<details>
<summary><strong>3.5.11</strong> - Obscure authentication feedback</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation











 `lib/auth.ts`



 `app/api/auth/custom-signin/route.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.5.11 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-122_3_5_11_obscure_authentication_feedback_Evidence`

</details>

<details>
<summary><strong>3.5.2</strong> - Authenticate users</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation















 `lib/auth.ts`



 `lib/password-policy.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.5.2 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-122_3_5_2_authenticate_users_Evidence`

</details>

<details>
<summary><strong>3.5.3</strong> - MFA for privileged accounts</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

 NextAuth.js with TOTP (Time-based One-Time Password) Provider


- NextAuth.js v5.0.0-beta.30
- @otplib/preset-default v12.0.1
- qrcode library for QR code generation
- bcryptjs for backup code hashing

 TOTP (RFC 6238)
- Algorithm: SHA1
- ...

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.5.3 implemented as specified
- ✅ Implementation verified: lib/mfa.ts, app/auth/mfa/
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-104_MFA_Implementation_Evidence`
- `MAC-RPT-121_3_5_3_mfa_for_privileged_accounts_Evidence`
- `MAC-RPT-122_3_5_3_mfa_for_privileged_accounts_Evidence`

</details>

<details>
<summary><strong>3.5.4</strong> - Replay-resistant authentication</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation













 `lib/auth.ts`



 `middleware.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.5.4 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-122_3_5_4_replay_resistant_authentication_Evidence`

</details>

<details>
<summary><strong>3.5.5</strong> - Prevent identifier reuse</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation











 `prisma/schema.prisma`



 `app/api/admin/create-user/route.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.5.5 implemented as specified
- ✅ Implementation verified: Unique constraint, procedure
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-120_Identifier_Reuse_Prevention_Evidence`
- `MAC-RPT-121_3_5_5_prevent_identifier_reuse_Evidence`
- `MAC-RPT-122_3_5_5_prevent_identifier_reuse_Evidence`

</details>

<details>
<summary><strong>3.5.6</strong> - Disable identifiers after inactivity</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ⚠️ Control requires implementation (see POA&M)

**Last Verification Date:** 2026-01-24

#### Assessment Notes

**Open Items:**
- POA&M item open - see POA&M document for details

</details>

<details>
<summary><strong>3.5.7</strong> - Password complexity</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation















 `lib/password-policy.ts`



 `app/api/auth/change-password/route.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.5.7 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-122_3_5_7_password_complexity_Evidence`

</details>

<details>
<summary><strong>3.5.8</strong> - Prohibit password reuse</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation















 `prisma/schema.prisma`



 `app/api/admin/create-user/route.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.5.8 implemented as specified
- ✅ Implementation verified: Password history (5 generations)
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-120_Identifier_Reuse_Prevention_Evidence`
- `MAC-RPT-121_3_5_8_prohibit_password_reuse_Evidence`
- `MAC-RPT-122_3_5_8_prohibit_password_reuse_Evidence`

</details>

<details>
<summary><strong>3.5.9</strong> - Temporary passwords</summary>

#### Implementation Details

**Summary:** Temporary password functionality implemented. System generates cryptographically secure temporary passwords for new user accounts and password resets. Users must change temporary passwords to permanent passwords immediately upon first login. Temporary passwords expire after 72 hours.

### 4.1 Code Implementation

#### Temporary Password Generation

**Implementation Files:**
- `lib/temporary-password.ts` - Core temporary password generation library
  - `generateTemporaryPassword()` (lines 30-60) - Generates 20-character cryptographically secure random password using `crypto.randomBytes()`
  - `getTemporaryPasswordExpiration()` (lines 95-100) - Returns expiration timestamp (72 hours from now)
  - `TEMPORARY_PASSWORD_CONFIG` (lines 10-18) - Configuration constants (minLength: 16, defaultLength: 20, expirationHours: 72)

**User Creation:**
- `app/api/admin/create-user/route.ts` (lines 41-43, 49-56, 114-120)
  - Line 42: `generateTemporaryPassword()` - Generates temporary password
  - Line 43: `getTemporaryPasswordExpiration()` - Sets 72-hour expiration
  - Lines 49-56: Creates user with `isTemporaryPassword: true`, `temporaryPasswordExpiresAt`, `mustChangePassword: true`
  - Lines 114-120: Returns temporary password in API response

**Password Reset:**
- `app/api/admin/reset-user-password/route.ts` (lines 48-50, 65-74, 104-111)
  - Line 49: `generateTemporaryPassword()` - Generates temporary password
  - Line 50: `getTemporaryPasswordExpiration()` - Sets 72-hour expiration
  - Lines 65-74: Updates user with `isTemporaryPassword: true`, `temporaryPasswordExpiresAt`, `mustChangePassword: true`
  - Lines 104-111: Returns temporary password in API response

#### Expiration Checking

**Implementation Files:**
- `lib/temporary-password.ts`
  - `isTemporaryPasswordExpired()` (lines 82-89) - Validates if temporary password has expired
  - `validateTemporaryPasswordExpiration()` (lines 131-137 in `lib/password-policy.ts`) - Additional validation function

**Authentication:**
- `lib/auth.ts` (lines 83-93)
  - Lines 86-93: Checks `user.isTemporaryPassword` and `user.temporaryPasswordExpiresAt`
  - Line 88: Calls `isTemporaryPasswordExpired()` to validate expiration
  - Line 92: Rejects login if temporary password expired

**Database Schema:**
- `prisma/schema.prisma` (lines 22-23)
  - `isTemporaryPassword: Boolean @default(false)` - Flag indicating temporary password
  - `temporaryPasswordExpiresAt: DateTime?` - Expiration timestamp

#### Forced Password Change

**Implementation Files:**
- `middleware.ts` (lines 38-43, 61-66)
  - Lines 39-42: Checks `session.user?.mustChangePassword` for `/user` routes, redirects to `/auth/change-password`
  - Lines 62-65: Checks `session.user?.mustChangePassword` for `/admin` routes, redirects to `/auth/change-password`
  - Lines 20-22: Allows `/auth/change-password` route without restriction

**Password Change:**
- `app/api/auth/change-password/route.ts` (lines 95-105, 131-147)
  - Lines 97-98: Detects if changing from temporary password (`wasTemporaryPassword`)
  - Lines 99-105: Updates user with `isTemporaryPassword: false`, `temporaryPasswordExpiresAt: null`, `mustChangePassword: false`
  - Lines 131-147: Logs temporary to permanent password change in audit trail

**Sign-In Flow:**
- `app/api/auth/custom-signin/route.ts` (lines 99-110)
  - Lines 100-110: Checks `user.mustChangePassword` BEFORE MFA enrollment
  - Returns `requiresPasswordChange: true` if password change needed
- `app/auth/signin/page.tsx` (lines 37-44)
  - Lines 37-44: Redirects to `/auth/change-password?required=true` if password change required
  - Ensures password change happens before MFA enrollment

**MFA Enrollment Protection:**
- `app/api/auth/mfa/enroll/route.ts` (lines 22-30)
  - Lines 22-30: Checks for `mustChangePassword` and rejects MFA enrollment if password change required
- `app/auth/mfa/enroll/page.tsx` (lines 18-38)
  - Lines 18-38: Client-side check for password change requirement, redirects if needed

**Features:**
- Cryptographically secure random password generation (20 characters) - `lib/temporary-password.ts:generateTemporaryPassword()`
- 72-hour expiration for temporary passwords - `lib/temporary-password.ts:getTemporaryPasswordExpiration()`
- Forced password change on first login - `middleware.ts` (lines 38-43, 61-66)
- Expired temporary passwords rejected at login - `lib/auth.ts` (lines 83-93)
- Audit logging for temporary password operations - `app/api/admin/create-user/route.ts`, `app/api/admin/reset-user-password/route.ts`, `app/api/auth/change-password/route.ts`

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Temporary password generation implemented
- ✅ Temporary password expiration checking implemented
- ✅ Forced password change on first login implemented
- ✅ Temporary to permanent password transition implemented
- ✅ Expired temporary passwords rejected at login

**Last Verification Date:** 2026-01-25

</details>

### IR - 3 Controls

<details>
<summary><strong>3.6.1</strong> - Operational incident-handling capability</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.6.1 implemented as specified
- ✅ Implementation verified: IR capability, IRP
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_6_1_operational_incident_handling_capability_Evidence`
- `MAC-RPT-122_3_6_1_operational_incident_handling_capability_Evidence`

</details>

<details>
<summary><strong>3.6.2</strong> - Track, document, and report incidents</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.6.2 implemented as specified
- ✅ Implementation verified: IR procedures
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_6_2_track_document_and_report_incidents_Evidence`
- `MAC-RPT-122_3_6_2_track_document_and_report_incidents_Evidence`

</details>

<details>
<summary><strong>3.6.3</strong> - Test incident response capability</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.6.3 implemented as specified
- ✅ Implementation verified: IR testing, tabletop exercise
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_6_3_test_incident_response_capability_Evidence`

</details>

### MA - 6 Controls

<details>
<summary><strong>3.7.1</strong> - Perform maintenance</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.7.1 implemented as specified
- ✅ Implementation verified: Platform/app maintenance
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_7_1_perform_maintenance_Evidence`
- `MAC-RPT-122_3_7_1_perform_maintenance_Evidence`

</details>

<details>
<summary><strong>3.7.2</strong> - Controls on maintenance tools</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ⚠️ Control requires implementation (see POA&M)

**Last Verification Date:** 2026-01-24

#### Assessment Notes

**Open Items:**
- POA&M item open - see POA&M document for details

</details>

<details>
<summary><strong>3.7.3</strong> - Sanitize equipment for off-site maintenance</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Verification Details

**Justification/Rationale for Not Applicable Status:**

This control requires organizations to sanitize equipment containing CUI before releasing it for off-site maintenance. However, this control is not applicable to our environment because:

1. **Cloud-Only Architecture**: The system operates entirely in a cloud environment (Railway platform). The organization does not own, maintain, or have physical custody of any equipment (servers, storage devices, network equipment) that contains CUI or system components.

2. **No Customer Equipment**: The organization does not maintain any physical equipment that would require off-site maintenance. All system infrastructure is managed by the cloud service provider (Railway), and the organization has no physical access to or ownership of the underlying hardware.

3. **No Physical Media**: The system operates entirely in a digital environment with no physical media (hard drives, tapes, USB devices) that could be removed for maintenance. All data is stored in cloud databases with no physical storage components under organizational control.

4. **Service Provider Responsibility**: Equipment maintenance, including any sanitization requirements, is the responsibility of the cloud service provider (Railway). The organization has no equipment to sanitize or release for maintenance.

**Conclusion**: This control is not applicable because the organization does not own, maintain, or have physical custody of any equipment that would require sanitization before off-site maintenance. All system infrastructure is cloud-based and managed by the service provider.

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Not applicable justification documented
- ✅ Architecture review confirms non-applicability

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.7.4</strong> - Check maintenance media</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Verification Details

**Justification/Rationale for Not Applicable Status:**

This control requires organizations to check maintenance media for malicious code before use in system maintenance. However, this control is not applicable to our environment because:

1. **Cloud-Only Architecture**: The system operates entirely in a cloud environment (Railway platform). The organization does not own, maintain, or have physical custody of any equipment that would require maintenance media.

2. **No Diagnostic Media**: The organization does not use, maintain, or have access to any diagnostic media (CDs, DVDs, USB drives, external hard drives) that would be used for system maintenance. All system maintenance is performed by the cloud service provider through their management interfaces.

3. **No Physical Equipment**: The organization does not maintain any physical equipment (servers, storage devices, network equipment) that would require maintenance media. All system infrastructure is managed by the cloud service provider (Railway), and the organization has no physical access to the underlying hardware.

4. **Service Provider Responsibility**: Equipment maintenance, including any diagnostic media checks, is the responsibility of the cloud service provider (Railway). The organization does not perform physical maintenance activities that would require diagnostic media.

**Conclusion**: This control is not applicable because the organization does not use, maintain, or have access to any diagnostic media for system maintenance. All system infrastructure is cloud-based and maintenance is performed by the service provider through their management interfaces.

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Not applicable justification documented
- ✅ Architecture review confirms non-applicability

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.7.5</strong> - MFA for nonlocal maintenance</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.7.5 implemented as specified
- ✅ Implementation verified: Platform MFA
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-110_Maintenance_MFA_Evidence`
- `MAC-RPT-121_3_7_5_mfa_for_nonlocal_maintenance_Evidence`
- `MAC-RPT-122_3_7_5_mfa_for_nonlocal_maintenance_Evidence`

</details>

<details>
<summary><strong>3.7.6</strong> - Supervise maintenance personnel</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Verification Details

**Justification/Rationale for Not Applicable Status:**

This control requires organizations to supervise maintenance personnel who perform maintenance on organizational systems. However, this control is not applicable to our environment because:

1. **Cloud-Only Architecture**: The system operates entirely in a cloud environment (Railway platform). The organization does not own, maintain, or have physical custody of any equipment that would require on-site maintenance personnel.

2. **No Customer Maintenance Personnel**: The organization does not employ, contract, or supervise any maintenance personnel who perform physical maintenance on system equipment. All system infrastructure is managed by the cloud service provider (Railway), and the organization has no physical access to or ownership of the underlying hardware.

3. **No Physical Equipment**: The organization does not maintain any physical equipment (servers, storage devices, network equipment) that would require maintenance personnel. All system infrastructure is managed by the cloud service provider, and the organization has no physical access to the underlying hardware.

4. **Service Provider Responsibility**: Equipment maintenance, including supervision of maintenance personnel, is the responsibility of the cloud service provider (Railway). The organization does not perform or supervise physical maintenance activities.

**Conclusion**: This control is not applicable because the organization does not employ, contract, or supervise any maintenance personnel who perform physical maintenance on system equipment. All system infrastructure is cloud-based and maintenance is performed by the service provider.

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Not applicable justification documented
- ✅ Architecture review confirms non-applicability

**Last Verification Date:** 2026-01-24

</details>

### MP - 9 Controls

<details>
<summary><strong>3.8.1</strong> - Protect system media</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.8.1 implemented as specified
- ✅ Implementation verified: Database encryption
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_8_1_protect_system_media_Evidence`

</details>

<details>
<summary><strong>3.8.2</strong> - Limit access to CUI on media</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.8.2 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.8.3</strong> - Sanitize/destroy media</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.8.3 implemented as specified
- ✅ Implementation verified: No removable media
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_8_3_sanitize_destroy_media_Evidence`

</details>

<details>
<summary><strong>3.8.4</strong> - Mark media with CUI markings</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Verification Details

**Justification/Rationale for Not Applicable Status:**

This control requires organizations to mark media containing CUI with appropriate CUI markings. However, this control is not applicable to our environment because:

1. **Digital-Only Environment**: The system operates entirely in a digital environment with no physical media (hard drives, tapes, USB devices, CDs, DVDs, printed materials) that contains CUI. All CUI is stored in cloud databases and accessed through web browsers.

2. **No Physical Media**: The organization does not create, use, or maintain any physical media (removable storage devices, printed documents, backup tapes) that would require CUI markings. All data storage and access is digital and cloud-based.

3. **Cloud Storage**: All CUI is stored in cloud databases (Railway platform) with no physical storage components under organizational control. There are no physical media items that could be marked with CUI designations.

4. **Control Scope**: This control applies to physical media that contains CUI and must be marked to indicate the presence and handling requirements of CUI. Since the organization does not use physical media, this control is outside the scope of our system architecture.

**Conclusion**: This control is not applicable because the organization does not use, maintain, or have custody of any physical media that contains CUI. All CUI is stored digitally in cloud databases with no physical media requiring markings.

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Not applicable justification documented
- ✅ Architecture review confirms non-applicability

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.8.5</strong> - Control access during transport</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Verification Details

**Justification/Rationale for Not Applicable Status:**

This control requires organizations to control access to media containing CUI during transport. However, this control is not applicable to our environment because:

1. **Cloud-Only Architecture**: The system operates entirely in a cloud environment (Railway platform). The organization does not transport any physical media (hard drives, tapes, USB devices, printed documents) that contains CUI.

2. **No Physical Media Transport**: The organization does not create, use, or transport any physical media (removable storage devices, printed documents, backup tapes) that would require access controls during transport. All data storage and access is digital and cloud-based.

3. **Digital Data Transfer**: All CUI is transferred digitally over encrypted connections (TLS/HTTPS) through web browsers. There is no physical transport of media containing CUI that would require access controls.

4. **Control Scope**: This control applies to physical media containing CUI that must be transported and requires access controls during transport. Since the organization does not transport physical media, this control is outside the scope of our system architecture.

**Conclusion**: This control is not applicable because the organization does not transport any physical media containing CUI. All CUI is transferred digitally over encrypted connections with no physical media requiring transport controls.

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Not applicable justification documented
- ✅ Architecture review confirms non-applicability

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.8.6</strong> - Cryptographic protection on digital media</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures


### 4.4 Inherited Control Details

 Railway Platform

  
This control is provided by the Railway Platform and relied upon operationally. The organization does not imple...

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Inherited control validated through provider assurance artifacts
- ✅ Provider controls verified
- ✅ Validation documented

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.8.7</strong> - Control removable media</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation


The organization implements control of removable media through explicit policy prohibition, technical controls, and user agreements. The Media Handling Policy (MAC-POL-213) prohibits the use of removable media for storing or processing FCI...

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Policy prohibition documented in MAC-POL-213
- ✅ User acknowledgment requirement implemented
- ✅ Browser-based technical controls verified
- ✅ Database storage architecture confirmed (no removable media)
- ✅ Endpoint compliance requirements documented
- ✅ Exception handling process established

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.8.8</strong> - Prohibit portable storage without owner</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation


The organization prohibits the use of portable storage devices for CUI, and requires owner identification for any authorized portable storage. The Media Handling Policy (MAC-POL-213) explicitly prohibits portable storage devices for storin...

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Policy prohibition documented in MAC-POL-213
- ✅ User acknowledgment requirement implemented
- ✅ Portable storage prohibition enforced
- ✅ Owner identification requirements documented (for authorized exceptions)
- ✅ Asset inventory process established
- ✅ Exception handling process documented

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.8.9</strong> - Protect backup CUI</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures


### 4.4 Inherited Control Details

 Railway Platform

  
This control is provided by the Railway Platform and relied upon operationally. The organization does not imple...

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Inherited control validated through provider assurance artifacts
- ✅ Provider controls verified
- ✅ Validation documented

**Last Verification Date:** 2026-01-24

</details>

### PE - 6 Controls

<details>
<summary><strong>3.10.1</strong> - Limit physical access</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.10.1 implemented as specified
- ✅ Implementation verified: Platform/facility controls
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_10_1_limit_physical_access_Evidence`
- `MAC-RPT-122_3_10_1_limit_physical_access_Evidence`

</details>

<details>
<summary><strong>3.10.2</strong> - Protect and monitor facility</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.10.2 implemented as specified
- ✅ Implementation verified: Facility protection
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_10_2_protect_and_monitor_facility_Evidence`
- `MAC-RPT-122_3_10_2_protect_and_monitor_facility_Evidence`

</details>

<details>
<summary><strong>3.10.3</strong> - Escort and monitor visitors</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.10.3 implemented as specified
- ✅ Implementation verified: Visitor monitoring
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-111_Visitor_Controls_Evidence`
- `MAC-RPT-121_3_10_3_escort_and_monitor_visitors_Evidence`
- `MAC-RPT-122_3_10_3_escort_and_monitor_visitors_Evidence`

</details>

<details>
<summary><strong>3.10.4</strong> - Physical access audit logs</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.10.4 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.10.5</strong> - Control physical access devices</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.10.5 implemented as specified
- ✅ Implementation verified: Access devices
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-112_Physical_Access_Device_Evidence`
- `MAC-RPT-121_3_10_5_control_physical_access_devices_Evidence`
- `MAC-RPT-122_3_10_5_control_physical_access_devices_Evidence`

</details>

<details>
<summary><strong>3.10.6</strong> - Safeguarding at alternate work sites</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.10.6 implemented as specified
- ✅ Implementation verified: Alternate sites
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-113_Alternate_Work_Site_Safeguarding_Evidence`
- `MAC-RPT-121_3_10_6_safeguarding_at_alternate_work_sites_Evidence`
- `MAC-RPT-122_3_10_6_safeguarding_at_alternate_work_sites_Evidence`

</details>

### PS - 2 Controls

<details>
<summary><strong>3.9.1</strong> - Screen individuals prior to access</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.9.1 implemented as specified
- ✅ Implementation verified: Screening process, records
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_9_1_screen_individuals_prior_to_access_Evidence`
- `MAC-RPT-122_3_9_1_screen_individuals_prior_to_access_Evidence`

</details>

<details>
<summary><strong>3.9.2</strong> - Protect systems during/after personnel actions</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.9.2 implemented as specified
- ✅ Implementation verified: Termination procedures, access revocation
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_9_2_protect_systems_during_after_personnel_a_Evidence`
- `MAC-RPT-121_3_9_2_protect_systems_during_after_personnel_actions_Evidence`

</details>

### RA - 3 Controls

<details>
<summary><strong>3.11.1</strong> - Periodically assess risk</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.11.1 implemented as specified
- ✅ Implementation verified: Risk assessment
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_11_1_periodically_assess_risk_Evidence`
- `MAC-RPT-122_3_11_1_periodically_assess_risk_Evidence`

</details>

<details>
<summary><strong>3.11.2</strong> - Scan for vulnerabilities</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation









### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.11.2 implemented as specified
- ✅ Implementation verified: Vulnerability scanning, schedule
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-103_Dependabot_Configuration_Evidence`
- `MAC-RPT-114_Vulnerability_Scanning_Evidence`
- `MAC-RPT-121_3_11_2_scan_for_vulnerabilities_Evidence`
- `MAC-RPT-122_3_11_2_scan_for_vulnerabilities_Evidence`

</details>

<details>
<summary><strong>3.11.3</strong> - Remediate vulnerabilities</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.11.3 implemented as specified
- ✅ Implementation verified: Remediation process, timelines
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-115_Vulnerability_Remediation_Evidence`
- `MAC-RPT-121_3_11_3_remediate_vulnerabilities_Evidence`
- `MAC-RPT-122_3_11_3_remediate_vulnerabilities_Evidence`

</details>

### SA - 4 Controls

<details>
<summary><strong>3.12.1</strong> - Periodically assess security controls</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.12.1 implemented as specified
- ✅ Implementation verified: Control assessment, assessment report
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_12_1_periodically_assess_security_controls_Evidence`
- `MAC-RPT-122_3_12_1_periodically_assess_security_controls_Evidence`

</details>

<details>
<summary><strong>3.12.2</strong> - Develop and implement POA&M</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.12.2 implemented as specified
- ✅ Implementation verified: POA&M process
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Assessment Notes

**Open Items:**
- POA&M item open - see POA&M document for details

#### Evidence Files

- `MAC-RPT-121_3_12_2_develop_and_implement_poa_m_Evidence`
- `MAC-RPT-122_3_12_2_develop_and_implement_poa_m_Evidence`

</details>

<details>
<summary><strong>3.12.3</strong> - Monitor security controls</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.12.3 implemented as specified
- ✅ Implementation verified: Continuous monitoring log
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_12_3_monitor_security_controls_Evidence`
- `MAC-RPT-122_3_12_3_monitor_security_controls_Evidence`

</details>

<details>
<summary><strong>3.12.4</strong> - Develop/update SSP</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.12.4 implemented as specified
- ✅ Implementation verified: System Security Plan
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_12_4_develop_update_ssp_Evidence`
- `MAC-RPT-122_3_12_4_develop_update_ssp_Evidence`

</details>

### SC - 16 Controls

<details>
<summary><strong>3.13.1</strong> - Monitor/control/protect communications</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation







 `middleware.ts`



 `lib/auth.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.13.1 implemented as specified
- ✅ Implementation verified: Network security
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_13_1_monitor_control_protect_communications_Evidence`
- `MAC-RPT-126_Communications_Protection_Operational_Evidence`

</details>

<details>
<summary><strong>3.13.10</strong> - Cryptographic key management</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.13.10 implemented as specified
- ✅ Implementation verified: Key management, documentation
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-116_Cryptographic_Key_Management_Evidence`
- `MAC-RPT-121_3_13_10_cryptographic_key_management_Evidence`
- `MAC-RPT-122_3_13_10_cryptographic_key_management_Evidence`

</details>

<details>
<summary><strong>3.13.11</strong> - FIPS-validated cryptography</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

 ⚠️ FIPS Validation Assessment In Progress


- TLS/HTTPS encryption (CUI in transit) - Provided by Railway platform
- Database encryption at rest (CUI at rest) - Provided by Railway PostgreSQL service
- Password hashing (bcrypt) - Applicati...

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ⚠️ Control requires implementation (see POA&M)

**Last Verification Date:** 2026-01-24

#### Assessment Notes

**Open Items:**
- POA&M item open - see POA&M document for details

#### Evidence Files

- `MAC-RPT-110_FIPS_Cryptography_Assessment_Evidence`

</details>

<details>
<summary><strong>3.13.12</strong> - Collaborative computing devices</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Verification Details

**Justification/Rationale for Not Applicable Status:**

This control requires organizations to establish usage restrictions and implementation guidance for collaborative computing devices. However, this control is not applicable to our environment because:

1. **Web Application Architecture**: The system is a web application accessed through standard web browsers. The organization does not deploy, manage, or maintain any collaborative computing devices (video conferencing systems, interactive whiteboards, shared displays, telepresence systems) that are part of the system infrastructure.

2. **No Collaborative Devices**: The organization does not use or maintain any collaborative computing devices that are integrated with or provide access to the system. All system access occurs through standard web browsers on user-owned devices (laptops, desktops, mobile devices).

3. **User-Controlled Devices**: Any collaborative computing devices that users may use (such as video conferencing systems for meetings) are user-controlled and not part of the system infrastructure. The system itself does not include or integrate with collaborative computing devices.

4. **Control Scope**: This control applies to organizational collaborative computing devices that are part of the system infrastructure and require usage restrictions and implementation guidance. Since the system is a web application with no integrated collaborative devices, this control is outside the scope of our system architecture.

**Conclusion**: This control is not applicable because the system is a web application with no integrated collaborative computing devices. All system access occurs through standard web browsers, and the organization does not deploy or maintain collaborative computing devices as part of the system infrastructure.

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Not applicable justification documented
- ✅ Architecture review confirms non-applicability

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.13.13</strong> - Control mobile code</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation



 `next.config.js`



 `lib/security-headers.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.13.13 implemented as specified
- ✅ Implementation verified: Mobile code policy, CSP
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-117_Mobile_Code_Control_Evidence`
- `MAC-RPT-121_3_13_13_control_mobile_code_Evidence`
- `MAC-RPT-122_3_13_13_control_mobile_code_Evidence`

</details>

<details>
<summary><strong>3.13.14</strong> - Control VoIP</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Verification Details

**Justification/Rationale for Not Applicable Status:**

This control requires organizations to implement controls for Voice over Internet Protocol (VoIP) technologies. However, this control is not applicable to our environment because:

1. **Web Application Architecture**: The system is a web application accessed through standard web browsers. The system does not include, integrate with, or provide VoIP functionality as part of its core capabilities.

2. **No VoIP Functionality**: The organization does not deploy, manage, or maintain any VoIP systems, VoIP infrastructure, or VoIP services as part of the system. The system does not provide voice communication capabilities, VoIP calling features, or integration with VoIP technologies.

3. **System Scope**: The system is designed for web-based data management and compliance tracking. It does not include voice communication features, telephony services, or VoIP components that would require control implementation.

4. **Control Scope**: This control applies to organizational VoIP systems and services that are part of the system infrastructure and require security controls. Since the system is a web application with no VoIP functionality, this control is outside the scope of our system architecture.

**Conclusion**: This control is not applicable because the system is a web application with no VoIP functionality. The system does not include, integrate with, or provide VoIP services, and therefore does not require VoIP control implementation.

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Not applicable justification documented
- ✅ Architecture review confirms non-applicability

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.13.15</strong> - Protect authenticity of communications</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures


### 4.4 Inherited Control Details

 Railway Platform

  
This control is provided by the Railway Platform and relied upon operationally. The organization does not imple...

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Inherited control validated through provider assurance artifacts
- ✅ Provider controls verified
- ✅ Validation documented

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.13.16</strong> - Protect CUI at rest</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures


### 4.4 Inherited Control Details

 Railway Platform

  
This control is provided by the Railway Platform and relied upon operationally. The organization does not imple...

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Inherited control validated through provider assurance artifacts
- ✅ Provider controls verified
- ✅ Validation documented

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.13.2</strong> - Architectural designs</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation







 `middleware.ts`



 `lib/authz.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.13.2 implemented as specified
- ✅ Implementation verified: System architecture
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_13_2_architectural_designs_Evidence`
- `MAC-RPT-122_3_13_2_architectural_designs_Evidence`

</details>

<details>
<summary><strong>3.13.3</strong> - Separate user/system management</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.13.3 implemented as specified
- ✅ Implementation verified: Role separation
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_13_3_separate_user_system_management_Evidence`

</details>

<details>
<summary><strong>3.13.4</strong> - Prevent unauthorized information transfer</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.13.4 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.13.5</strong> - Implement subnetworks</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures


### 4.4 Inherited Control Details

 Railway Platform

  
This control is provided by the Railway Platform and relied upon operationally. The organization does not imple...

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Inherited control validated through provider assurance artifacts
- ✅ Provider controls verified
- ✅ Validation documented

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.13.6</strong> - Deny-by-default network communications</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures


### 4.4 Inherited Control Details

 Railway Platform

  
This control is provided by the Railway Platform and relied upon operationally. The organization does not imple...

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Inherited control validated through provider assurance artifacts
- ✅ Provider controls verified
- ✅ Validation documented

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.13.7</strong> - Prevent remote device dual connections</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Verification Details

**Justification/Rationale for Not Applicable Status:**

This control requires organizations to prevent remote devices from maintaining simultaneous non-remote and remote connections. However, this control is not applicable to our environment because:

1. **All Access is Remote**: The system operates entirely in a cloud environment (Railway platform), and all user access to the system is remote. There are no non-remote connections to the system, as the organization does not maintain any on-premises infrastructure or local network connections.

2. **No Non-Remote Connections**: The organization does not maintain any on-premises infrastructure, local area networks, or direct physical connections to system components. All system access occurs remotely through web browsers over the internet.

3. **Cloud-Only Architecture**: The system infrastructure is entirely cloud-based, and users access the system from remote locations (home, office, mobile) using standard web browsers. There are no scenarios where a device could maintain both a non-remote and remote connection simultaneously.

4. **Control Scope**: This control applies to environments where devices can maintain both non-remote (local network) and remote (internet) connections simultaneously. Since all system access is remote with no non-remote connections possible, this control is outside the scope of our system architecture.

**Conclusion**: This control is not applicable because all system access is remote, and there are no non-remote connections to the system. The system architecture does not support scenarios where dual connections (non-remote and remote) could occur simultaneously.

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Not applicable justification documented
- ✅ Architecture review confirms non-applicability

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.13.8</strong> - Cryptographic mechanisms for CUI in transit</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures


### 4.4 Inherited Control Details

 Railway Platform

  
This control is provided by the Railway Platform and relied upon operationally. The organization does not imple...

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Inherited control validated through provider assurance artifacts
- ✅ Provider controls verified
- ✅ Validation documented

**Last Verification Date:** 2026-01-24

</details>

<details>
<summary><strong>3.13.9</strong> - Terminate network connections</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures


### 4.4 Inherited Control Details

 Railway Platform

  
This control is provided by the Railway Platform and relied upon operationally. The organization does not imple...

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Inherited control validated through provider assurance artifacts
- ✅ Provider controls verified
- ✅ Validation documented

**Last Verification Date:** 2026-01-24

</details>

### SI - 7 Controls

<details>
<summary><strong>3.14.1</strong> - Identify/report/correct flaws</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation









### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.14.1 implemented as specified
- ✅ Implementation verified: Flaw management
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-103_Dependabot_Configuration_Evidence`
- `MAC-RPT-121_3_14_1_identify_report_correct_flaws_Evidence`
- `MAC-RPT-122_3_14_1_identify_report_correct_flaws_Evidence`

</details>

<details>
<summary><strong>3.14.2</strong> - Malicious code protection</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation



 `lib/prisma.ts`



 `prisma/schema.prisma`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.14.2 implemented as specified
- ✅ Implementation verified: Malware protection
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-112_Physical_Access_Device_Evidence`
- `MAC-RPT-121_3_14_2_malicious_code_protection_Evidence`
- `MAC-RPT-122_3_14_2_malicious_code_protection_Evidence`

</details>

<details>
<summary><strong>3.14.3</strong> - Monitor security alerts</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation









### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.14.3 implemented as specified
- ✅ Implementation verified: Alert monitoring
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-103_Dependabot_Configuration_Evidence`
- `MAC-RPT-114_Vulnerability_Scanning_Evidence`
- `MAC-RPT-121_3_14_3_monitor_security_alerts_Evidence`
- `MAC-RPT-122_3_14_3_monitor_security_alerts_Evidence`

</details>

<details>
<summary><strong>3.14.4</strong> - Update malicious code protection</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.14.4 implemented as specified
- ✅ Implementation verified: Protection updates
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-121_3_14_4_update_malicious_code_protection_Evidence`
- `MAC-RPT-122_3_14_4_update_malicious_code_protection_Evidence`

</details>

<details>
<summary><strong>3.14.5</strong> - Periodic/real-time scans</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation









### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.14.5 implemented as specified
- ✅ Implementation verified: Vulnerability scanning
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-103_Dependabot_Configuration_Evidence`
- `MAC-RPT-121_3_14_5_periodic_real_time_scans_Evidence`
- `MAC-RPT-122_3_14_5_periodic_real_time_scans_Evidence`

</details>

<details>
<summary><strong>3.14.6</strong> - Monitor systems and communications</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation



 `lib/audit.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.14.6 implemented as specified
- ✅ Implementation verified: System monitoring, procedures
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-118_System_Monitoring_Evidence`
- `MAC-RPT-121_3_14_6_monitor_systems_and_communications_Evidence`
- `MAC-RPT-122_3_14_6_monitor_systems_and_communications_Evidence`

</details>

<details>
<summary><strong>3.14.7</strong> - Identify unauthorized use</summary>

#### Implementation Details

**Summary:** ## 4. Implementation Evidence

### 4.1 Code Implementation







 `lib/audit.ts`



### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

#### Testing and Verification

**Verification Methods:**
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**
- ✅ Control 3.14.7 implemented as specified
- ✅ Implementation verified: Automated detection, alerts
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

#### Evidence Files

- `MAC-RPT-119_Unauthorized_Use_Detection_Evidence`
- `MAC-RPT-121_3_14_7_identify_unauthorized_use_Evidence`
- `MAC-RPT-122_3_14_7_identify_unauthorized_use_Evidence`

</details>

---


## 18. Related Documents

- System Security Plan: `../../01-system-scope/MAC-IT-304_System_Security_Plan.md`
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

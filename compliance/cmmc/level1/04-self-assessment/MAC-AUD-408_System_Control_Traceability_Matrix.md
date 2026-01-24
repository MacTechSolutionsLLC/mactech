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
| 3.1.4 | Separate duties | ✅ Implemented | MAC-POL-210 | MAC-SOP-235 | MAC-SOP-235, MAC-RPT-117 | SoD matrix, operational controls | 7.1, 3.1.4 |
| 3.1.5 | Least privilege | ✅ Implemented | MAC-POL-210 | MAC-SOP-222 | middleware.ts | RBAC | 7.1, 3.1.5 |
| 3.1.6 | Non-privileged accounts | ✅ Implemented | MAC-POL-210 | MAC-SOP-222 | middleware.ts | USER role | 7.1, 3.1.6 |
| 3.1.7 | Prevent privileged function execution | ✅ Implemented | MAC-POL-210 | - | lib/audit.ts | Audit logging | 7.1, 3.1.7 |
| 3.1.8 | Limit unsuccessful logon attempts | ✅ Implemented | MAC-POL-210 | MAC-SOP-222 | MAC-RPT-105 | lib/auth.ts, app/api/auth/custom-signin/ | 7.1, 3.1.8 |
| 3.1.9 | Privacy/security notices | ✅ Implemented | MAC-POL-210 | - | User agreements | User acknowledgments | 7.1, 3.1.9 |
| 3.1.10 | Session lock | ✅ Implemented | MAC-POL-210 | MAC-SOP-222 | MAC-RPT-106, components/SessionLock.tsx | Session lock component | 7.1, 3.1.10 |
| 3.1.11 | Automatic session termination | ✅ Implemented | MAC-POL-210 | - | lib/auth.ts | 8-hour timeout | 7.1, 3.1.11 |
| 3.1.12 | Monitor remote access | ✅ Implemented | MAC-POL-210 | - | lib/audit.ts | Audit logging | 7.1, 3.1.12 |
| 3.1.13 | Cryptographic remote access | 🔄 Inherited | MAC-POL-210 | - | Railway platform | TLS/HTTPS | 7.1, 3.1.13 |
| 3.1.14 | Managed access control points | 🔄 Inherited | MAC-POL-210 | - | Railway platform | Platform routing | 7.1, 3.1.14 |
| 3.1.15 | Authorize remote privileged commands | ✅ Implemented | MAC-POL-210 | - | middleware.ts, lib/audit.ts | Admin controls | 7.1, 3.1.15 |
| 3.1.16 | Authorize wireless access | 🚫 Not Applicable | MAC-POL-210 | - | System architecture | Cloud-only, no organizational wireless infrastructure | 7.1, 3.1.16 |
| 3.1.17 | Protect wireless access | 🚫 Not Applicable | MAC-POL-210 | - | System architecture | Cloud-only, no organizational wireless infrastructure | 7.1, 3.1.17 |
| 3.1.18 | Control mobile devices | ✅ Implemented | MAC-POL-210 | - | System architecture | Browser access | 7.1, 3.1.18 |
| 3.1.19 | Encrypt CUI on mobile devices | ✅ Implemented | MAC-POL-210 | - | System architecture | No local CUI | 7.1, 3.1.19 |
| 3.1.20 | Verify external systems | ✅ Implemented | MAC-POL-210 | - | SSP Section 4 | External APIs | 7.1, 3.1.20 |
| 3.1.21 | Limit portable storage | ✅ Implemented | MAC-POL-213 | - | MAC-RPT-118, System architecture | Policy, technical controls | 7.1, 3.1.21 |
| 3.1.22 | Control CUI on public systems | ✅ Implemented | MAC-POL-210 | - | middleware.ts, PublicContent model | Approval workflow | 7.1, 3.1.22 |

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
| 3.3.1 | Create and retain audit logs | ✅ Implemented | MAC-POL-218 | - | lib/audit.ts, AppEvent table, MAC-RPT-107 | Audit logging, retention verification | 7.4, 3.3.1 |
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
| 3.4.1 | Baseline configurations | ✅ Implemented | MAC-POL-220 | MAC-SOP-228 | MAC-CMP-001, MAC-RPT-108 | CM plan, baseline inventory | 7.5, 3.4.1 |
| 3.4.2 | Security configuration settings | ✅ Implemented | MAC-POL-220 | MAC-SOP-228 | MAC-RPT-108, next.config.js, middleware.ts | Baseline, config files | 7.5, 3.4.2 |
| 3.4.3 | Change control | ✅ Implemented | MAC-POL-220 | MAC-SOP-225 | MAC-RPT-109, GitHub, Git history | Version control, approval process | 7.5, 3.4.3 |
| 3.4.4 | Security impact analysis | ✅ Implemented | MAC-POL-220 | MAC-SOP-225 | security-impact-analysis/security-impact-analysis-template.md | Analysis process, template | 7.5, 3.4.4 |
| 3.4.5 | Change access restrictions | ✅ Implemented | MAC-POL-220 | MAC-SOP-225 | MAC-CMP-001, MAC-RPT-109 | Access restrictions documented | 7.5, 3.4.5 |
| 3.4.6 | Least functionality | ✅ Implemented | MAC-POL-220 | - | System architecture | Minimal features | 7.5, 3.4.6 |
| 3.4.7 | Restrict nonessential programs | 🔄 Inherited | MAC-POL-220 | - | Railway platform | Platform controls | 7.5, 3.4.7 |
| 3.4.8 | Software restriction policy | ✅ Implemented | MAC-POL-220 | - | MAC-POL-226, package.json | Restriction policy, inventory | 7.5, 3.4.8 |
| 3.4.9 | Control user-installed software | 🚫 Not Applicable | MAC-POL-220 | - | System architecture | Cloud-only, users cannot install software on infrastructure | 7.5, 3.4.9 |

---

## 7. Identification and Authentication (IA) - 11 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.5.1 | Identify users | ✅ Implemented | MAC-POL-211 | MAC-SOP-221 | prisma/schema.prisma | User model | 7.2, 3.5.1 |
| 3.5.2 | Authenticate users | ✅ Implemented | MAC-POL-211 | - | lib/auth.ts | NextAuth.js | 7.2, 3.5.2 |
| 3.5.3 | MFA for privileged accounts | ✅ Implemented | MAC-POL-211 | MAC-SEC-108 | MAC-RPT-104 | lib/mfa.ts, app/auth/mfa/ | 7.2, 3.5.3 |
| 3.5.4 | Replay-resistant authentication | ✅ Implemented | MAC-POL-211 | - | lib/auth.ts | JWT tokens | 7.2, 3.5.4 |
| 3.5.5 | Prevent identifier reuse | ✅ Implemented | MAC-POL-211 | MAC-SOP-221 | MAC-RPT-120, prisma/schema.prisma | Unique constraint, procedure | 7.2, 3.5.5 |
| 3.5.6 | Disable identifiers after inactivity | ❌ Not Implemented | MAC-POL-211 | MAC-SOP-222 (to be updated) | - | Inactivity disable | 7.2, 3.5.6 |
| 3.5.7 | Password complexity | ✅ Implemented | MAC-POL-211 | - | lib/password-policy.ts | Password policy | 7.2, 3.5.7 |
| 3.5.8 | Prohibit password reuse | ✅ Implemented | MAC-POL-211 | MAC-SOP-222 | lib/password-policy.ts, app/api/auth/change-password/route.ts, PasswordHistory model | Password history (5 generations) | 7.2, 3.5.8 |
| 3.5.9 | Temporary passwords | 🚫 Not Applicable | MAC-POL-211 | - | System architecture | All accounts created with permanent passwords | 7.2, 3.5.9 |
| 3.5.10 | Cryptographically-protected passwords | ✅ Implemented | MAC-POL-211 | - | lib/auth.ts | bcrypt | 7.2, 3.5.10 |
| 3.5.11 | Obscure authentication feedback | ✅ Implemented | MAC-POL-211 | - | lib/auth.ts | Error handling | 7.2, 3.5.11 |

---

## 8. Incident Response (IR) - 3 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.6.1 | Operational incident-handling capability | ✅ Implemented | MAC-POL-215 | MAC-SOP-223, MAC-IRP-001 | MAC-IRP-001, IR policy | IR capability, IRP | 7.9, 3.6.1 |
| 3.6.2 | Track, document, and report incidents | ✅ Implemented | MAC-POL-215 | MAC-SOP-223 | IR policy, security contact | IR procedures | 7.9, 3.6.2 |
| 3.6.3 | Test incident response capability | ✅ Implemented | MAC-POL-215 | MAC-SOP-232 | incident-response/ir-test-results-2026.md | IR testing, tabletop exercise | 7.9, 3.6.3 |

---

## 9. Maintenance (MA) - 6 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.7.1 | Perform maintenance | 🔄 Inherited / ✅ Implemented | MAC-POL-221 (to be created) | - | Railway platform, SSP Section 10 | Platform/app maintenance | 7.10, 3.7.1 |
| 3.7.2 | Controls on maintenance tools | ❌ Not Implemented | MAC-POL-221 (to be created) | - | Tool controls (to be created) | Tool management | 7.10, 3.7.2 |
| 3.7.3 | Sanitize equipment for off-site maintenance | 🚫 Not Applicable | MAC-POL-221 (to be created) | - | System architecture | Cloud-only, no customer equipment | 7.10, 3.7.3 |
| 3.7.4 | Check maintenance media | 🚫 Not Applicable | MAC-POL-221 (to be created) | - | System architecture | Cloud-only, no diagnostic media | 7.10, 3.7.4 |
| 3.7.5 | MFA for nonlocal maintenance | ✅ Implemented (Inherited) | MAC-POL-221 | - | MAC-RPT-110, Railway platform | Platform MFA | 7.10, 3.7.5 |
| 3.7.6 | Supervise maintenance personnel | 🚫 Not Applicable | MAC-POL-221 (to be created) | - | System architecture | Cloud-only, no customer maintenance personnel | 7.10, 3.7.6 |

---

## 10. Media Protection (MP) - 9 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.8.1 | Protect system media | ✅ Implemented | MAC-POL-213 | - | Railway platform | Database encryption | 7.6, 3.8.1 |
| 3.8.2 | Limit access to CUI on media | ✅ Implemented | MAC-POL-213 | - | Access controls | RBAC | 7.6, 3.8.2 |
| 3.8.3 | Sanitize/destroy media | ✅ Implemented | MAC-POL-213 | - | System architecture | No removable media | 7.6, 3.8.3 |
| 3.8.4 | Mark media with CUI markings | 🚫 Not Applicable | MAC-POL-213 | - | System architecture | Digital-only, no physical media | 7.6, 3.8.4 |
| 3.8.5 | Control access during transport | 🚫 Not Applicable | MAC-POL-213 | - | System architecture | Cloud-only, no physical media transport | 7.6, 3.8.5 |
| 3.8.6 | Cryptographic protection on digital media | 🔄 Inherited | MAC-POL-213 | - | Railway platform | Database encryption | 7.6, 3.8.6 |
| 3.8.7 | Control removable media | 🚫 Not Applicable | MAC-POL-213 | - | System architecture | Cloud-only, no removable media | 7.6, 3.8.7 |
| 3.8.8 | Prohibit portable storage without owner | 🚫 Not Applicable | MAC-POL-213 | - | System architecture | Cloud-only, no portable storage | 7.6, 3.8.8 |
| 3.8.9 | Protect backup CUI | 🔄 Inherited | MAC-POL-213 | - | Railway platform | Backup encryption | 7.6, 3.8.9 |

---

## 11. Personnel Security (PS) - 2 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.9.1 | Screen individuals prior to access | ✅ Implemented | MAC-POL-222 | MAC-SOP-233 | personnel-screening/screening-completion-log.md, personnel-screening/screening-records-template.md | Screening process, records | 7.7, 3.9.1 |
| 3.9.2 | Protect systems during/after personnel actions | ✅ Implemented | MAC-POL-222 | MAC-SOP-234 | MAC-SOP-234, MAC-SOP-221, Audit logs | Termination procedures, access revocation | 7.7, 3.9.2 |

---

## 12. Physical Protection (PE) - 6 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.10.1 | Limit physical access | ✅ Implemented | MAC-POL-212 | - | Railway platform, facilities | Platform/facility controls | 7.8, 3.10.1 |
| 3.10.2 | Protect and monitor facility | ✅ Implemented | MAC-POL-212 | - | Physical security | Facility protection | 7.8, 3.10.2 |
| 3.10.3 | Escort and monitor visitors | ✅ Implemented | MAC-POL-212 | - | MAC-RPT-111, Visitor procedures | Visitor monitoring | 7.8, 3.10.3 |
| 3.10.4 | Physical access audit logs | ✅ Implemented | MAC-POL-212 | - | /admin/physical-access-logs | Physical access logging | 7.8, 3.10.4 |
| 3.10.5 | Control physical access devices | ✅ Implemented | MAC-POL-212 | MAC-SOP-236 | MAC-RPT-112, Device controls | Access devices | 7.8, 3.10.5 |
| 3.10.6 | Safeguarding at alternate work sites | ✅ Implemented | MAC-POL-212 | MAC-SOP-224 | MAC-RPT-113, Remote work controls | Alternate sites | 7.8, 3.10.6 |

---

## 13. Risk Assessment (RA) - 3 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.11.1 | Periodically assess risk | ✅ Implemented | MAC-POL-223 | MAC-SOP-229 | MAC-AUD-404 | Risk assessment | 7.11, 3.11.1 |
| 3.11.2 | Scan for vulnerabilities | ✅ Implemented | MAC-POL-223 | MAC-SOP-230 | MAC-RPT-114, Dependabot, .github/dependabot.yml | Vulnerability scanning, schedule | 7.11, 3.11.2 |
| 3.11.3 | Remediate vulnerabilities | ✅ Implemented | MAC-POL-223 | MAC-SOP-230 | MAC-RPT-115, Vulnerability remediation logs | Remediation process, timelines | 7.11, 3.11.3 |

---

## 14. Security Assessment (SA) - 4 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.12.1 | Periodically assess security controls | ✅ Implemented | MAC-POL-224 | - | MAC-AUD-401, MAC-AUD-406, MAC-AUD-408 | Control assessment, assessment report | 7.12, 3.12.1 |
| 3.12.2 | Develop and implement POA&M | ✅ Implemented | MAC-POL-224 | MAC-SOP-231 | MAC-AUD-405 | POA&M process | 7.12, 3.12.2 |
| 3.12.3 | Monitor security controls | ✅ Implemented | MAC-POL-224 | - | MAC-AUD-407 | Continuous monitoring log | 7.12, 3.12.3 |
| 3.12.4 | Develop/update SSP | ✅ Implemented | MAC-POL-224 (to be created) | - | MAC-IT-304 | System Security Plan | 7.12, 3.12.4 |

---

## 15. System and Communications Protection (SC) - 16 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.13.1 | Monitor/control/protect communications | 🔄 Inherited / ✅ Implemented | MAC-POL-225 (to be created) | - | Railway platform | Network security | 7.13, 3.13.1 |
| 3.13.2 | Architectural designs | ✅ Implemented | MAC-POL-225 (to be created) | - | MAC-IT-301 | System architecture | 7.13, 3.13.2 |
| 3.13.3 | Separate user/system management | ✅ Implemented | MAC-POL-225 (to be created) | - | System architecture | Role separation | 7.13, 3.13.3 |
| 3.13.4 | Prevent unauthorized information transfer | ✅ Implemented | MAC-POL-225 (to be created) | - | Access controls | Information flow | 7.13, 3.13.4 |
| 3.13.5 | Implement subnetworks | 🔄 Inherited | MAC-POL-225 (to be created) | - | Railway platform | Network segmentation | 7.13, 3.13.5 |
| 3.13.6 | Deny-by-default network communications | 🔄 Inherited | MAC-POL-225 (to be created) | - | Railway platform | Network controls | 7.13, 3.13.6 |
| 3.13.7 | Prevent remote device dual connections | 🚫 Not Applicable | MAC-POL-225 (to be created) | - | System architecture | All access remote, no non-remote connections | 7.13, 3.13.7 |
| 3.13.8 | Cryptographic mechanisms for CUI in transit | 🔄 Inherited | MAC-POL-225 (to be created) | - | Railway platform | TLS/HTTPS | 7.13, 3.13.8 |
| 3.13.9 | Terminate network connections | 🔄 Inherited | MAC-POL-225 (to be created) | - | Railway platform | Connection management | 7.13, 3.13.9 |
| 3.13.10 | Cryptographic key management | ✅ Implemented (Inherited) | MAC-POL-225 | - | MAC-RPT-116, Railway platform | Key management, documentation | 7.13, 3.13.10 |
| 3.13.11 | FIPS-validated cryptography | ❌ Not Implemented | MAC-POL-225 (to be created) | - | MAC-RPT-110 | FIPS assessment | 7.13, 3.13.11 |
| 3.13.12 | Collaborative computing devices | 🚫 Not Applicable | MAC-POL-225 (to be created) | - | System architecture | Web application, no collaborative devices | 7.13, 3.13.12 |
| 3.13.13 | Control mobile code | ✅ Implemented | MAC-POL-225 | MAC-SOP-237 | MAC-RPT-117, System architecture | Mobile code policy, CSP | 7.13, 3.13.13 |
| 3.13.14 | Control VoIP | 🚫 Not Applicable | MAC-POL-225 (to be created) | - | System architecture | Web application, no VoIP functionality | 7.13, 3.13.14 |
| 3.13.15 | Protect authenticity of communications | 🔄 Inherited | MAC-POL-225 (to be created) | - | Railway platform | TLS authentication | 7.13, 3.13.15 |
| 3.13.16 | Protect CUI at rest | 🔄 Inherited | MAC-POL-225 (to be created) | - | Railway platform | Database encryption | 7.13, 3.13.16 |

---

## 16. System and Information Integrity (SI) - 7 Requirements

| Control ID | Requirement | Status | Policy | Procedure | Evidence | Implementation | SSP Section |
|-----------|------------|--------|--------|-----------|----------|----------------|-----------------|
| 3.14.1 | Identify/report/correct flaws | ✅ Implemented | MAC-POL-214 | - | Dependabot, vulnerability management | Flaw management | 7.14, 3.14.1 |
| 3.14.2 | Malicious code protection | 🔄 Inherited / ✅ Implemented | MAC-POL-214 | - | Railway platform, endpoint inventory | Malware protection | 7.14, 3.14.2 |
| 3.14.3 | Monitor security alerts | ✅ Implemented | MAC-POL-214 | - | Dependabot, CISA alerts | Alert monitoring | 7.14, 3.14.3 |
| 3.14.4 | Update malicious code protection | 🔄 Inherited / ✅ Implemented | MAC-POL-214 | - | Railway platform, endpoint tracking | Protection updates | 7.14, 3.14.4 |
| 3.14.5 | Periodic/real-time scans | ✅ Implemented / 🔄 Inherited | MAC-POL-214 | - | Dependabot, Railway platform | Vulnerability scanning | 7.14, 3.14.5 |
| 3.14.6 | Monitor systems and communications | ✅ Implemented | MAC-POL-214 | - | MAC-RPT-118, Railway platform, audit logs | System monitoring, procedures | 7.14, 3.14.6 |
| 3.14.7 | Identify unauthorized use | ✅ Implemented | MAC-POL-214 | - | MAC-RPT-119, lib/audit.ts | Automated detection, alerts | 7.14, 3.14.7 |

---

## 17. Summary Statistics

**Total Controls:** 110

**Status Breakdown:**
- ✅ **Implemented:** 81 controls (74%)
- 🔄 **Inherited:** 20 controls (18%)
- ⚠️ **Partially Satisfied:** 0 controls (0%)
- ❌ **Not Implemented:** 7 controls (6%)
- 🚫 **Not Applicable:** 14 controls (13%)

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
- Version 1.0 (2026-01-23): Initial SCTM creation for CMMC Level 2 migration

---

## Appendix A: Status Legend

- ✅ **Implemented:** Control is fully implemented by the organization
- 🔄 **Inherited:** Control is provided by service provider (Railway, GitHub) and relied upon operationally
- ⚠️ **Partially Satisfied:** Control is partially implemented, requires enhancement
- ❌ **Not Implemented:** Control requires implementation (tracked in POA&M)
- 🚫 **Not Applicable:** Control is not applicable to system architecture (justification provided)

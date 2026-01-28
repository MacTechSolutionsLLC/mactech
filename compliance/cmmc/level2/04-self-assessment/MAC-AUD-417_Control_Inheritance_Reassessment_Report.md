# Control Inheritance Reassessment Report - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-28  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2

**Applies to:** CMMC 2.0 Level 2 (FCI and CUI system)

---

## 1. Purpose

This report documents the reassessment of control inheritance status to align with the assessor-defensible inheritance matrix. The goal is to avoid overclaim findings by ensuring controls are correctly attributed to the appropriate third-party providers (Google Cloud, Railway, GitHub) or marked as implemented/N/A where appropriate.

---

## 2. Executive Summary

**Total Controls Analyzed:** 110  
**Currently Inherited Controls:** 9  
**Changes Required:** 20

**Key Findings:**
- 18 high-priority changes (overclaims that must be corrected)
- 2 medium-priority changes (missing inheritance)
- 0 low-priority changes (documentation improvements)

---

## 3. Current State Analysis

### 3.1 Currently Inherited Controls

| Control ID | Requirement | Current Provider | Implementation Notes |
|------------|-------------|------------------|----------------------|
| 3.1.13 | Cryptographic remote access... | Unknown | TLS/HTTPS... |
| 3.1.14 | Managed access control points... | Unknown | Platform routing... |
| 3.3.7 | System clock synchronization... | Unknown | NTP sync... |
| 3.4.7 | Restrict nonessential programs... | Unknown | Platform controls... |
| 3.8.6 | Cryptographic protection on digital media... | Unknown | Database encryption... |
| 3.13.5 | Implement subnetworks... | Unknown | Network segmentation... |
| 3.13.6 | Deny-by-default network communications... | Unknown | Network controls... |
| 3.13.9 | Terminate network connections... | Unknown | Connection management... |
| 3.13.15 | Protect authenticity of communications... | Unknown | TLS authentication... |

---

## 4. Required Changes

### 4.1 High Priority Changes (Overclaims)

These controls are incorrectly marked as inherited and must be corrected to avoid assessor findings:


#### 1. Control 3.1.13: Cryptographic remote access

**Current Status:** 🔄 inherited (Railway)  
**Target Status:** ✅ implemented

**Justification:**  
CUI vault uses GCP, not Railway. Customer implements cryptographic remote access.

**Action Required:**  
Update SCTM to change status from "inherited" to "implemented".


#### 2. Control 3.1.14: Managed access control points

**Current Status:** 🔄 inherited (Railway)  
**Target Status:** ✅ implemented

**Justification:**  
Should be partial from GCP for CUI vault, not Railway

**Action Required:**  
Update SCTM to change status from "inherited" to "implemented".


#### 3. Control 3.3.7: System clock synchronization

**Current Status:** 🔄 inherited (Railway)  
**Target Status:** ✅ implemented

**Justification:**  
VM-specific implementation required (NTP sync on Google VM)

**Action Required:**  
Update SCTM to change status from "inherited" to "implemented".


#### 4. Control 3.4.7: Restrict nonessential programs

**Current Status:** 🔄 inherited (Railway)  
**Target Status:** ✅ implemented

**Justification:**  
VM-specific implementation required (restrict programs on Google VM)

**Action Required:**  
Update SCTM to change status from "inherited" to "implemented".


#### 5. Control 3.8.6: Cryptographic protection on digital media

**Current Status:** 🔄 inherited (Railway)  
**Target Status:** ✅ implemented

**Justification:**  
CUI vault uses GCP encryption, not Railway. Customer implements database encryption.

**Action Required:**  
Update SCTM to change status from "inherited" to "implemented".


#### 6. Control 3.13.6: Deny-by-default network communications

**Current Status:** 🔄 inherited (Railway)  
**Target Status:** ⚠️ partially_satisfied (GCP)

**Justification:**  
Infrastructure routing only

**Action Required:**  
Update SCTM to change status from "inherited" to "partially_satisfied" with provider "GCP".


#### 7. Control 3.13.15: Protect authenticity of communications

**Current Status:** 🔄 inherited (Railway)  
**Target Status:** ⚠️ partially_satisfied (GCP)

**Justification:**  
TLS authentication at infrastructure level

**Action Required:**  
Update SCTM to change status from "inherited" to "partially_satisfied" with provider "GCP".


#### 8. Control 3.10.1: Limit physical access

**Current Status:** ✅ implemented (Unknown provider)  
**Target Status:** 🔄 inherited (GCP)

**Justification:**  
GCP data center physical security

**Action Required:**  
Update SCTM to change status from "implemented" to "inherited" with provider "GCP".


#### 9. Control 3.10.2: Protect and monitor facility

**Current Status:** ✅ implemented (Unknown provider)  
**Target Status:** 🔄 inherited (GCP)

**Justification:**  
GCP data center physical security

**Action Required:**  
Update SCTM to change status from "implemented" to "inherited" with provider "GCP".


#### 10. Control 3.10.3: Escort and monitor visitors

**Current Status:** ✅ implemented (Unknown provider)  
**Target Status:** 🔄 inherited (GCP)

**Justification:**  
GCP data center physical security

**Action Required:**  
Update SCTM to change status from "implemented" to "inherited" with provider "GCP".


#### 11. Control 3.10.4: Physical access audit logs

**Current Status:** ✅ implemented (Unknown provider)  
**Target Status:** 🔄 inherited (GCP)

**Justification:**  
GCP data center physical security

**Action Required:**  
Update SCTM to change status from "implemented" to "inherited" with provider "GCP".


#### 12. Control 3.10.5: Control physical access devices

**Current Status:** ✅ implemented (Unknown provider)  
**Target Status:** 🔄 inherited (GCP)

**Justification:**  
GCP data center physical security

**Action Required:**  
Update SCTM to change status from "implemented" to "inherited" with provider "GCP".


#### 13. Control 3.10.6: Safeguarding at alternate work sites

**Current Status:** ✅ implemented (Unknown provider)  
**Target Status:** 🔄 inherited (GCP)

**Justification:**  
GCP data center physical security

**Action Required:**  
Update SCTM to change status from "implemented" to "inherited" with provider "GCP".


#### 14. Control 3.13.1: Monitor/control/protect communications

**Current Status:** ✅ implemented (Unknown provider)  
**Target Status:** ⚠️ partially_satisfied (GCP)

**Justification:**  
Cloud perimeter only; VM/network config is customer

**Action Required:**  
Update SCTM to change status from "implemented" to "partially_satisfied" with provider "GCP".


#### 15. Control 3.13.5: Implement subnetworks

**Current Status:** 🔄 inherited (Unknown provider)  
**Target Status:** ⚠️ partially_satisfied (GCP)

**Justification:**  
VPC/hypervisor separation

**Action Required:**  
Update SCTM to change status from "inherited" to "partially_satisfied" with provider "GCP".


#### 16. Control 3.13.6: Deny-by-default network communications

**Current Status:** 🔄 inherited (Unknown provider)  
**Target Status:** ⚠️ partially_satisfied (GCP)

**Justification:**  
Infrastructure routing only

**Action Required:**  
Update SCTM to change status from "inherited" to "partially_satisfied" with provider "GCP".


#### 17. Control 3.13.8: Cryptographic mechanisms for CUI in transit

**Current Status:** ✅ implemented (Unknown provider)  
**Target Status:** ⚠️ partially_satisfied (Railway)

**Justification:**  
Platform TLS only (non-CUI)

**Action Required:**  
Update SCTM to change status from "implemented" to "partially_satisfied" with provider "Railway".


#### 18. Control 3.13.9: Terminate network connections

**Current Status:** 🔄 inherited (Unknown provider)  
**Target Status:** ⚠️ partially_satisfied (GCP)

**Justification:**  
Fabric-level only

**Action Required:**  
Update SCTM to change status from "inherited" to "partially_satisfied" with provider "GCP".


### 4.2 Medium Priority Changes (Missing Inheritance)

These controls should be marked as inherited/partial but are currently not:


#### 1. Control 3.4.8: Software restriction policy

**Current Status:** ✅ implemented  
**Target Status:** ⚠️ partially_satisfied (GitHub)

**Justification:**  
Branch protection

**Action Required:**  
Update SCTM to change status to "partially_satisfied" with provider "GitHub".


#### 2. Control 3.5.2: Authenticate users

**Current Status:** ✅ implemented  
**Target Status:** ⚠️ partially_satisfied (GitHub)

**Justification:**  
GitHub org-level MFA

**Action Required:**  
Update SCTM to change status to "partially_satisfied" with provider "GitHub".




---

## 5. Provider-Specific Recommendations

### 5.1 Google Cloud Platform (CUI Vault Infrastructure)

**Controls to Mark as Inherited:**
- 3.10.1-3.10.6 (PE - Physical Protection) - ✅ Fully Inherited from GCP data centers

**Controls to Mark as Partial:**
- 3.13.1 (SC - Boundary Protection) - ⚠️ Partial (Cloud perimeter only; VM/network config is customer)
- 3.13.5 (SC - Network Segmentation) - ⚠️ Partial (VPC/hypervisor separation)
- 3.13.6 (SC - Default Deny) - ⚠️ Partial (Infrastructure routing only)
- 3.13.9 (SC - Session Termination) - ⚠️ Partial (Fabric-level only)

**Controls NOT Inherited from GCP:**
- AC, AU, IA (OS users), FIPS crypto, logging, patching, sshd, database security, CUI handling - These are customer-implemented

### 5.2 Railway (Main Application Hosting - non-CUI)

**Controls to Mark as Partial:**
- 3.13.8 (SC - TLS/Transport Security) - ⚠️ Partial (Platform TLS only, non-CUI)

**Controls to REMOVE from Railway Inheritance:**
- 3.1.13 - Cryptographic remote access
- 3.1.14 - Managed access control points
- 3.3.7 - System clock synchronization
- 3.4.7 - Restrict nonessential programs
- 3.8.6 - Cryptographic protection on digital media
- 3.13.6 - Deny-by-default network communications
- 3.13.15 - Protect authenticity of communications

**Important Constraint:**
- No CUI is stored or processed on Railway
- No FIPS claims are inherited from Railway

### 5.3 GitHub (Source Code Repository)

**Controls to Mark as Inherited:**
- 3.10.1-3.10.6 (PE - Physical Protection) - ✅ Fully Inherited from GitHub facilities

**Controls to Mark as Partial:**
- 3.13.1 (SC - Boundary Protection) - ⚠️ Partial (Platform edge security)
- 3.5.2 (IA - MFA for Platform Accounts) - ⚠️ Partial (GitHub org-level MFA)
- 3.4.8 (CM - Repo Integrity) - ⚠️ Partial (Branch protection)

**Controls NOT Inherited from GitHub:**
- Code quality, secrets handling, secure development practices, CI/CD security decisions

---

## 6. Implementation Plan

1. **Update SCTM Control Statuses**
   - Change status from "Inherited" to "Implemented" for overclaimed controls
   - Change status from "Inherited" to "Partial" where appropriate
   - Add GCP and GitHub inheritance where missing
   - Update implementation notes to reflect correct provider

2. **Update Inherited Controls Documentation**
   - File: `compliance/cmmc/level2/03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md`
   - Add GCP section
   - Update Railway section (remove CUI-related claims)
   - Add GitHub section
   - Add assessor-grade summary statement

3. **Update System Security Plan**
   - Update external service provider sections
   - Add inheritance justification statements

4. **Recalculate Summary Statistics**
   - Update inherited vs. implemented counts
   - Update control family breakdowns

---

## 7. Assessor-Grade Summary Statement

> **MacTech Solutions implements the majority of CMMC Level 2 controls internally.
> Limited infrastructure-level controls are inherited from Google Cloud Platform, Railway, and GitHub under the shared responsibility model.
> No cryptographic, identity, access control, logging, or CUI handling controls are inherited from third-party providers.**

This statement prevents overclaim failures.

---

## 8. Related Documents

- System Control Traceability Matrix: `MAC-AUD-408_System_Control_Traceability_Matrix.md`
- Inherited Controls Appendix: `../03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`

---

## 9. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2027-01-28

**Change History:**
- Version 1.0 (2026-01-28): Initial control inheritance reassessment report

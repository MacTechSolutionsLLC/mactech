# FIPS Cryptography Migration Plan - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-25  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.13.11

**Control ID:** 3.13.11  
**Control Requirement:** Employ FIPS-validated cryptography when used to protect the confidentiality of CUI

**Status:** ✅ CUI confidentiality satisfied via vault boundary; retained as optional non-CUI hardening plan

---

## 1. Purpose

This document provides a migration plan for implementing FIPS-validated cryptography where required.\n+\n+**Approved architecture note (assessor-safe):**\n+- CUI confidentiality cryptography (SC.L2-3.13.11) is provided by the dedicated CUI vault cryptographic boundary (Ubuntu 22.04 OpenSSL Cryptographic Module, CMVP Certificate #4794).\n+- The main application does not encrypt/decrypt CUI bytes and does not terminate TLS for CUI bytes in the approved direct-to-vault model.\n+\n+Therefore, a migration of the main application runtime OpenSSL for JWT/session signing is treated as **optional defense-in-depth** and is not required to demonstrate SC.L2-3.13.11 compliance for CUI bytes.

---

## 2. Current Cryptography Assessment

### 2.1 Components Assessed

| Component | Provider | Current Status | FIPS Validation Status |
|-----------|----------|----------------|------------------------|
| TLS/HTTPS (CUI in Transit) | CUI Vault (GCE) | ✅ Operational | ✅ CMVP Certificate #4794 |
| Database Encryption (CUI at Rest) | CUI Vault (GCE) | ✅ Operational | ✅ CMVP Certificate #4794 |
| Password Hashing (bcrypt) | Application | ✅ Operational | ✅ Not Required (password hashing) |
| JWT/Session Signing | Application | ✅ Operational | N/A for SC.L2-3.13.11 (does not encrypt/decrypt CUI bytes) |

### 2.2 Verification Status

**CUI Vault:**
- FIPS mode enabled and provider active on vault host (see `docs/FIPS_VERIFICATION_RESULTS.md`)\n+- CMVP verification: ✅ Certificate #4794 (Canonical Ltd. Ubuntu 22.04 OpenSSL Cryptographic Module)

**Application Runtime (non-CUI):**
- JWT/session signing cryptography is treated as defense-in-depth and is addressed under IA/AC controls as applicable.\n+- No migration is required for demonstrating SC.L2-3.13.11 CUI confidentiality protections in the approved architecture.

---

## 3. Migration Scenarios

### Scenario A: All Components FIPS-Validated

**Status:** ✅ No migration required

**Actions:**
1. Document FIPS validation evidence
2. Update control implementation status to "Implemented"
3. Close POA&M item

**Timeline:** Immediate (documentation only)

---

### Scenario B: Railway Platform Not FIPS-Validated

**Impact:** High - Affects TLS/HTTPS and database encryption

**Migration Options:**

**Option 1: Migrate to FIPS-Validated Platform**
- **Alternative Platforms:**
  - AWS (FIPS-validated services available)
  - Azure (FIPS-validated services available)
  - Google Cloud (FIPS-validated services available)
- **Effort:** High (platform migration)
- **Timeline:** 3-6 months
- **Cost:** Significant (platform migration costs)

**Option 2: Accept Risk with Justification**
- **Justification Requirements:**
  - Risk assessment
  - Compensating controls
  - Business justification
  - Risk owner approval
- **Effort:** Low (documentation)
- **Timeline:** 1-2 weeks
- **Cost:** Low

**Option 3: Railway Platform FIPS Validation Roadmap**
- **Action:** Coordinate with Railway on FIPS validation roadmap
- **Effort:** Medium (coordination)
- **Timeline:** Dependent on Railway roadmap
- **Cost:** Low

---

### Scenario C: Application JWT/Session Cryptography

**Status:** Not required for SC.L2-3.13.11 CUI confidentiality in the approved architecture.\n+\n+**Rationale:** JWT/session cryptography is used for access control and session management. It does not encrypt/decrypt CUI bytes, and CUI confidentiality cryptography is provided by the dedicated CUI vault boundary (CMVP Certificate #4794). Any migration of application runtime cryptography is treated as optional defense-in-depth and tracked under IA/AC as applicable.

---

### Scenario D: Multiple Components Not FIPS-Validated

**Impact:** High - Multiple components affected

**Migration Strategy:**
1. Prioritize components by risk
2. Develop phased migration plan
3. Implement highest priority components first
4. Document risk acceptance for lower priority components (if applicable)

**Timeline:** 6-12 months (depending on components)

---

## 4. Migration Plan Template

### 4.1 Migration Decision Matrix

**Decision Criteria:**
- FIPS validation status
- Risk level
- Migration effort
- Business impact
- Cost

**Decision Process:**
1. Assess FIPS validation status
2. Evaluate risk level
3. Identify migration options
4. Select migration approach
5. Develop implementation plan
6. Execute migration
7. Verify and document

### 4.2 Implementation Steps

**Step 1: Verification (CUI confidentiality cryptography)**\n+- ✅ Vault FIPS mode verified (kernel FIPS enabled; FIPS provider active)\n+- ✅ CMVP verification documented (Certificate #4794)\n+\n+**Step 2: Migration Decision (SC.L2-3.13.11)**\n+- ✅ No migration required for CUI confidentiality cryptography (vault boundary provides FIPS-validated crypto)\n+\n+**Step 3: Optional hardening (non-CUI)**\n+- Optional workstreams for application JWT/session cryptography may be tracked under IA/AC controls if pursued. They are not required to demonstrate SC.L2-3.13.11 for CUI bytes.

---

## 5. Risk Acceptance (If Applicable)

### 5.1 Risk Assessment

**Risk Level:** [To be determined after verification]

**Risk Factors:**
- Non-FIPS-validated cryptography in use
- Potential compliance gaps
- Security implications

**Compensating Controls:**
- [List compensating controls if applicable]

### 5.2 Risk Acceptance Criteria

**Acceptance Requirements:**
- Risk assessment completed
- Compensating controls documented
- Business justification provided
- Risk owner approval obtained
- Documentation updated

**Risk Owner:** System Administrator

**Approval Date:** [Date]

---

## 6. Timeline

**Verification Phase:** [Start Date] - [End Date]
- Railway platform verification
- Node.js/OpenSSL verification
- NIST CMVP database verification

**Migration Planning Phase:** [Start Date] - [End Date]
- Migration decision
- Plan development
- Resource allocation

**Migration Implementation Phase:** [Start Date] - [End Date]
- Migration execution
- Testing and verification
- Documentation

**Target Completion:** Within 180 days (per POA&M timeline)

---

## 7. Related Documents

- **FIPS Assessment Evidence:** `MAC-RPT-110_FIPS_Cryptography_Assessment_Evidence.md`
- **FIPS Verification Process:** `../../docs/FIPS_VERIFICATION_PROCESS.md`
- **FIPS Migration Implementation:** `../../docs/FIPS_MIGRATION_IMPLEMENTATION.md`
- **Control Document:** `../07-nist-controls/NIST-3.13.11_fips_validated_cryptography.md`
- **POA&M Document:** `../04-self-assessment/MAC-POAM-CMMC-L2.md`

---

## 8. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be scheduled after verification]

**Change History:**
- Version 1.0 (2026-01-25): Initial migration plan template creation

**Status:** ⚠️ Template - To be completed after FIPS validation verification

---

## Notes

- This migration plan is a template and will be completed after FIPS validation verification
- Migration approach will be determined based on verification results
- Timeline and effort estimates are preliminary and subject to change
- Risk acceptance may be required if migration is not feasible

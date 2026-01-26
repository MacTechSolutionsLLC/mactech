# Plan of Action and Milestones (POA&M) - CMMC Level 2

**Document Version:** 1.1  
**Date:** 2026-01-24  
**Last Updated:** 2026-01-25  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.12.2

**Applies to:** CMMC 2.0 Level 2 (CUI system)

---

## Purpose

This document identifies and tracks Plans of Action and Milestones (POA&M) for security controls that are not yet fully implemented in the MacTech Solutions Application CMMC 2.0 Level 2 system. All POA&M items are tracked with planned remediation activities, responsible roles, and target completion timeframes.

This document is maintained as part of the CMMC Level 2 assessment package and is referenced in the System Security Plan (Section 14).

---

## POA&M Governance and Rules of Engagement

### Risk Owner

**Primary Risk Owner:** System Administrator  
**Secondary Risk Owner:** Compliance Officer  
**Escalation:** Items exceeding timelines or without progress are escalated to Compliance Officer

**Responsibilities:**
- Approve risk acceptance for POA&M items
- Review and approve timeline extensions (if required)
- Make closure decisions based on closure criteria
- Ensure remediation activities are properly documented

---

### Timelines

**Maximum POA&M Item Age:**
- Standard POA&M items: **180 days maximum** from creation date
- High-priority (security-critical) items: **90 days maximum** from creation date
- Timeline extensions require risk owner approval and documented justification

**Review Frequency:**
- **Monthly review** of all open POA&M items
- Review includes: progress assessment, timeline compliance, risk reassessment
- Review documented in POA&M Tracking Log (`04-self-assessment/MAC-AUD-405_POA&M_Tracking_Log.md`)

**Target Completion Timeframes:**
- All POA&M items have explicit target completion dates
- Target dates calculated from item creation date + maximum age (180 days for standard, 90 days for high-priority)
- Target dates are non-negotiable without risk owner approval

---

### Closure Criteria

A POA&M item may be closed only when **all** of the following criteria are met:

1. **Implementation Complete:**
   - Remediation activities fully implemented
   - Implementation tested and verified
   - Code changes deployed (if applicable)
   - Configuration changes applied (if applicable)

2. **Evidence Documented:**
   - Evidence document created or updated
   - Evidence demonstrates control implementation
   - Evidence references code, configuration, or procedures as applicable

3. **Control Verified:**
   - Control verified in self-assessment
   - Control status updated to "Implemented" in System Security Plan
   - Control traceability matrix updated (if applicable)

4. **Status Updated:**
   - POA&M item status changed to "Closed" in this document
   - POA&M Tracking Log updated with closure date
   - Closure documented with evidence references

**Closure Process:**
1. Responsible role completes implementation and testing
2. Evidence document created/updated
3. Self-assessment updated to reflect implemented control
4. Risk owner reviews and approves closure
5. Status updated to "Closed" in POA&M document and tracking log

---

### Disqualification Rules

**Assessment Disqualification Criteria:**

1. **Timeline Exceeded:**
   - Any POA&M item exceeding 180 days (standard) or 90 days (high-priority) without approved extension = **assessment disqualification**
   - Timeline extensions must be approved by risk owner before expiration
   - Extension approvals must be documented with justification

2. **High-Priority Items:**
   - High-priority (security-critical) items exceeding 90 days = **assessment disqualification**
   - High-priority items cannot be extended beyond 90 days without exceptional circumstances and documented risk acceptance

3. **Lack of Progress:**
   - Items without documented remediation progress for **60 consecutive days** = **escalation required**
   - Escalated items without progress for additional 30 days (90 days total) = **assessment disqualification**
   - Progress must be documented in monthly reviews

4. **Risk Owner Approval:**
   - Items requiring risk acceptance must have explicit risk owner approval
   - Unapproved risk acceptance = **assessment disqualification**

**Disqualification Process:**
- Disqualification status documented in POA&M item
- Disqualification communicated to Compliance Officer
- Assessment cannot proceed until disqualification resolved
- Resolution requires immediate remediation or risk owner-approved exception

---

### Risk Acceptance

**Risk Acceptance Authority:**
- Risk acceptance decisions made by System Administrator (primary risk owner)
- High-risk items require Compliance Officer approval
- Risk acceptance must be documented with justification

**Risk Acceptance Criteria:**
- Risk must be assessed and documented
- Risk acceptance must be temporary (not permanent)
- Risk acceptance must include remediation timeline
- Risk acceptance cannot be used to bypass disqualification rules

---

## POA&M Items

### POAM-011: Disable Identifiers After Inactivity

**Control ID:** NIST SP 800-171 Rev. 2, Section 3.5.6

**Description:** System does not automatically disable user identifiers after a defined period of inactivity as required by NIST SP 800-171 Rev. 2, Section 3.5.6.

**Planned Remediation:**
- Define inactivity period (180 days)
- Implement automated identifier disable mechanism
- Update Account Lifecycle Enforcement Procedure (MAC-SOP-222)
- Test identifier disable functionality
- Document implementation
- Configure scheduled execution (Railway cron)

**Responsible Role:** System Administrator, Development Team

**Target Completion Timeframe:** ≤ 180 days (by 2026-06-12)

**Status:** Remediated

**Priority:** Medium

**Interim Mitigation:**
- Manual account review process: System administrators review user accounts quarterly and disable inactive accounts manually
- Account lockout mechanism: Accounts are locked after 5 failed login attempts, reducing risk of unauthorized access to inactive accounts
- User acknowledgment: Users acknowledge during account creation that inactive accounts may be disabled
- Monitoring: System administrators monitor for inactive accounts through audit log review
- Risk Reduction: Manual review process provides interim protection while automated mechanism is implemented

**Residual Risk Acceptance:**
- Residual Risk: Low - Manual review process provides adequate interim protection for 180-day remediation window
- Risk Owner Approval: System Administrator (Primary Risk Owner)
- Justification: Manual quarterly review combined with account lockout mechanisms provides sufficient interim protection. Automated mechanism will be implemented within 180 days to eliminate residual risk.
- Acceptance Date: 2026-01-24

**Remediation Summary:**
- Inactivity disablement module implemented (`lib/inactivity-disable.ts`)
- Authentication-time enforcement implemented (assessor-safe approach):
  - Enforcement in `lib/auth.ts` (NextAuth authorize function)
  - Enforcement in `app/api/auth/custom-signin/route.ts` (custom sign-in API)
  - Inactive accounts disabled immediately when attempting to authenticate
  - No scheduler dependency - enforcement happens at moment of risk
- Admin API endpoint created (`app/api/admin/users/disable-inactive/route.ts`) - for manual triggers
- Inactivity period: 180 days (6 months)
- Last active admin protection implemented
- Audit logging for all disablement actions
- Evidence document created: `MAC-RPT-122_3_5_6_disable_identifiers_after_inactivity_Evidence.md`
- Setup guide created: `docs/INACTIVITY_DISABLE_ENFORCEMENT.md`

**Remediation Date:** 2026-01-25

**Remediation Status:** ✅ Fully Implemented - Authentication-time enforcement (assessor-safe, C3PAO-friendly)

---

### POAM-013: Controls on Maintenance Tools

**Control ID:** NIST SP 800-171 Rev. 2, Section 3.7.2

**Description:** Controls on maintenance tools are not established as required by NIST SP 800-171 Rev. 2, Section 3.7.2.

**Planned Remediation:**
- Create Maintenance Policy (MAC-POL-221)
- Inventory maintenance tools
- Document tool controls and access restrictions
- Implement tool access controls
- Create maintenance tool evidence

**Responsible Role:** System Administrator

**Target Completion Timeframe:** ≤ 180 days (by 2026-07-10)

**Status:** Remediated

**Priority:** Medium

**Interim Mitigation:**
- Maintenance tool inventory: System administrators maintain informal inventory of maintenance tools
- Access controls: Maintenance tool access is restricted to system administrators only
- Railway platform controls: Infrastructure maintenance tools are managed by Railway platform (inherited control)
- Procedural controls: Maintenance activities are documented and logged
- Risk Reduction: Existing access restrictions and Railway platform controls provide interim protection

**Residual Risk Acceptance:**
- Residual Risk: Low - Existing access controls and Railway platform management provide adequate interim protection
- Risk Owner Approval: System Administrator (Primary Risk Owner)
- Justification: Maintenance tools are limited and access is restricted. Formal documentation and controls will be implemented within 180 days to fully satisfy control requirements.
- Acceptance Date: 2026-01-24

**Remediation Summary:**
- Maintenance tool inventory created (`MAC-RPT-123_Maintenance_Tool_Inventory_Evidence.md`)
- Maintenance tool control procedure created (`MAC-SOP-238_Maintenance_Tool_Control_Procedure.md`)
- Tool logging implementation complete (`lib/maintenance-tool-logging.ts`, `lib/maintenance-tool-logging-node.ts`)
- Logging integrated into migration API and startup scripts
- Access controls documented and implemented
- Tool approval process established
- Monitoring and review procedures documented
- All maintenance tools inventoried with versions and access levels

**Remediation Date:** 2026-01-25

**Remediation Status:** ✅ Fully Implemented

---

### POAM-008: FIPS Cryptography Assessment

**Control ID:** NIST SP 800-171 Rev. 2, Section 3.13.11

**Description:** FIPS-validated cryptography assessment is not conducted as required by NIST SP 800-171 Rev. 2, Section 3.13.11.

**Planned Remediation:**
- ✅ Assess FIPS validation status of cryptography used
- ✅ Document cryptography implementation
- ✅ Identify FIPS-validated vs non-FIPS-validated cryptography
- ✅ Create FIPS assessment evidence
- ✅ Document POA&M items for non-FIPS-validated cryptography
- ✅ Plan migration to FIPS-validated cryptography
- ✅ Implement FIPS-validated cryptographic library (Option 2)
- ⚠️ Activate FIPS mode (requires OpenSSL 3.0.8 FIPS Provider)
- ⚠️ Verify FIPS mode is active and operational
- ⚠️ Update control status to "Implemented" after verification

**Responsible Role:** System Administrator

**Target Completion Timeframe:** ≤ 180 days (by 2026-07-22)

**Status:** ⚠️ Partially Satisfied (Code Implementation Complete - FIPS Mode Activation Pending)

**Control Implementation Status:** ⚠️ Partially Satisfied
- ✅ Assessment: Complete
- ✅ Documentation: Complete  
- ✅ Code Implementation: Complete
- ⚠️ FIPS Mode Activation: Pending (external dependency - OpenSSL 3.0.8 FIPS Provider required)
- ⚠️ Verification: Pending (cannot verify until FIPS mode is active)

**CMMC Assessment Status:** Acceptable - Partially Satisfied status is acceptable for CMMC Level 2 assessment when tracked in POA&M with remediation plan.

**Priority:** Medium

**Interim Mitigation:**
- Encryption in use: All CUI is encrypted in transit (HTTPS/TLS) and at rest (database encryption)
- Railway platform encryption: Database encryption provided by Railway platform (industry-standard encryption)
- Encryption assessment in progress: FIPS validation assessment is actively being conducted
- Risk Reduction: Encryption is employed even if not yet FIPS-validated, providing protection while assessment completes

**Residual Risk Acceptance:**
- Residual Risk: Low - Encryption is employed providing protection. FIPS validation assessment will determine if migration is needed.
- Risk Owner Approval: System Administrator (Primary Risk Owner)
- Justification: Encryption is in place providing confidentiality protection. FIPS validation assessment will be completed within 180 days to determine if additional controls are needed.
- Acceptance Date: 2026-01-24

**Remediation Summary:**
- ✅ FIPS verification complete: OpenSSL 3.3.2/3.6.0 identified (NOT FIPS-validated)
- ✅ CMVP Certificate #4282: OpenSSL FIPS Provider 3.0.8 is validated (confirmed)
- ✅ FIPS-validated JWT implementation complete (Option 2):
  - FIPS crypto wrapper (`lib/fips-crypto.ts`)
  - FIPS JWT encoder/decoder (`lib/fips-jwt.ts`)
  - NextAuth.js integration (`lib/fips-nextauth-config.ts`)
  - NextAuth configuration updated to use FIPS JWT (with optional disable flag)
- ✅ FIPS verification tools created:
  - FIPS verification module (`lib/fips-verification.ts`)
  - FIPS verification script (`scripts/verify-fips-status.ts`)
  - FIPS status API (`app/api/admin/fips-status/route.ts`)
- ✅ Migration plan created (`MAC-RPT-124_FIPS_Migration_Plan.md`)
- ✅ Implementation guide created (`docs/FIPS_MIGRATION_OPTION2_IMPLEMENTATION.md`)
- ✅ Verification process documented (`docs/FIPS_VERIFICATION_PROCESS.md`, `docs/FIPS_VERIFICATION_CHECKLIST.md`)
- ✅ Code implementation: Complete
- ✅ Testing: FIPS JWT test suite created (`scripts/test-fips-jwt.ts`)
- ⚠️ FIPS mode activation: Pending (requires OpenSSL 3.0.8 FIPS Provider)
- ⚠️ FIPS verification: Pending (cannot verify until FIPS mode is active)

**Remediation Date:** 2026-01-25 (Code Implementation)

**Remediation Status:** ⚠️ Partially Satisfied - Code Implementation Complete, FIPS Mode Activation Pending

**Partial Implementation Details:**
- **Implemented Components:**
  - ✅ FIPS assessment and verification complete
  - ✅ FIPS-validated JWT code implementation complete
  - ✅ NextAuth.js integration complete
  - ✅ FIPS verification tools operational
  - ✅ Documentation and evidence complete
  - ✅ Test suite created and operational
  
- **Pending Components:**
  - ⚠️ FIPS mode activation (requires OpenSSL 3.0.8 FIPS Provider)
  - ⚠️ Runtime FIPS verification (cannot verify until FIPS mode is active)
  - ⚠️ Control status update to "Implemented" (pending FIPS activation)

**Assessment Acceptability:**
- Partially Satisfied status is acceptable for CMMC Level 2 assessment
- POA&M item tracks remediation with clear milestones
- Target completion within 180 days (by 2026-07-22)
- Code ready for immediate activation when FIPS runtime is available

**Milestones:**
- [x] **Milestone 1: FIPS Assessment** (Completed 2026-01-25)
  - [x] Assess FIPS validation status of all cryptography components
  - [x] Verify OpenSSL version in runtime (OpenSSL 3.3.2/3.6.0 identified)
  - [x] Search CMVP database for validated versions (OpenSSL 3.0.8 FIPS Provider #4282 found)
  - [x] Document assessment findings
  
- [x] **Milestone 2: Documentation** (Completed 2026-01-25)
  - [x] Create FIPS assessment evidence document (MAC-RPT-110)
  - [x] Create FIPS migration plan (MAC-RPT-124)
  - [x] Document verification process and checklist
  - [x] Create implementation guide
  
- [x] **Milestone 3: Code Implementation** (Completed 2026-01-25)
  - [x] Implement FIPS crypto wrapper (`lib/fips-crypto.ts`)
  - [x] Implement FIPS JWT encoder/decoder (`lib/fips-jwt.ts`)
  - [x] Integrate with NextAuth.js (`lib/fips-nextauth-config.ts`)
  - [x] Update NextAuth configuration (`lib/auth.ts`)
  - [x] Create FIPS verification tools
  - [x] Create test suite (`scripts/test-fips-jwt.ts`)
  - [x] Add optional disable flag for troubleshooting (`DISABLE_FIPS_JWT`)
  
- [ ] **Milestone 4: FIPS Mode Activation** (In Progress - External Dependency)
  - [ ] Contact Railway support about OpenSSL 3.0.8 FIPS Provider availability
  - [ ] OR: Implement custom Docker image with OpenSSL 3.0.8 FIPS Provider
  - [ ] Configure runtime to use OpenSSL 3.0.8 FIPS Provider
  - [ ] Verify FIPS provider is loaded and active
  - [ ] Remove `DISABLE_FIPS_JWT` environment variable (if set)
  
- [ ] **Milestone 5: Verification and Testing** (Pending FIPS Mode Activation)
  - [ ] Run FIPS verification script (`scripts/verify-fips-status.ts`)
  - [ ] Verify FIPS status API shows active FIPS mode
  - [ ] Test FIPS JWT encoding/decoding with active FIPS mode
  - [ ] Verify NextAuth.js sessions use FIPS-validated JWT
  - [ ] Document FIPS activation evidence
  
- [ ] **Milestone 6: Control Closure** (Pending Verification)
  - [ ] Update control status to "Implemented" in SCTM
  - [ ] Update SSP with FIPS activation details
  - [ ] Close POA&M item
  - [ ] Update SPRS score (109 → 110)
  - [ ] Document completion in evidence files

**Next Steps:**
1. **Immediate:** Contact Railway support to inquire about OpenSSL 3.0.8 FIPS Provider availability
2. **Alternative:** Research and implement custom Docker image with FIPS-validated OpenSSL
3. **After FIPS Activation:** Run verification tests and update documentation
4. **Final:** Close POA&M item and update compliance status

---

## Summary

**Total Open POA&M Items:** 1 (3.13.11 - Partially Satisfied, FIPS mode activation pending)

**Total Remediated POA&M Items:** 2
- POAM-011: 3.5.6 - Disable identifiers after inactivity (✅ Remediated)
- POAM-013: 3.7.2 - Controls on maintenance tools (✅ Remediated)

**Total Partially Satisfied POA&M Items:** 1
- POAM-008: 3.13.11 - FIPS-validated cryptography (⚠️ Partially Satisfied - Code complete, FIPS mode activation pending)

**Controls Affected:**
- 3.5.6 - Disable identifiers after a defined period of inactivity (✅ Remediated)
- 3.7.2 - Provide controls on the tools, techniques, mechanisms, and personnel used to conduct system maintenance (✅ Remediated)
- 3.13.11 - Employ FIPS-validated cryptography when used to protect the confidentiality of CUI (⚠️ Partially Satisfied - Code implementation complete, FIPS mode activation pending)

**All POA&M items are tracked with:**
- Clear deficiency descriptions
- Planned remediation activities
- Responsible roles (not individual names)
- Target completion timeframes (all within 180 days)
- Priority assignments

**Related Documents:**
- System Security Plan: `01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 14)
- POA&M Tracking Log: `04-self-assessment/MAC-AUD-405_POA&M_Tracking_Log.md` (operational tracking)
- POA&M Process Procedure: `02-policies-and-procedures/MAC-SOP-231_POA&M_Process_Procedure.md`

---

## Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-02-24

**Change History:**
- Version 1.1 (2026-01-25): Updated POAM-011, POAM-013, and POAM-008 with remediation summaries. POAM-011 and POAM-013 marked as Remediated. POAM-008 marked as In Progress (code complete). Updated summary counts.
- Version 1.0 (2026-01-24): Initial standalone POA&M document for CMMC Level 2 assessment package

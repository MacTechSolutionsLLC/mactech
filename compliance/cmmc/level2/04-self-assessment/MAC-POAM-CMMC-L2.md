# Plan of Action and Milestones (POA&M) - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-24  
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
- Define inactivity period (e.g., 90 days)
- Implement automated identifier disable mechanism
- Update Account Lifecycle Enforcement Procedure (MAC-SOP-222)
- Test identifier disable functionality
- Document implementation

**Responsible Role:** System Administrator, Development Team

**Target Completion Timeframe:** ≤ 180 days (by 2026-06-12)

**Status:** Open

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

**Status:** Open

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

---

### POAM-008: FIPS Cryptography Assessment

**Control ID:** NIST SP 800-171 Rev. 2, Section 3.13.11

**Description:** FIPS-validated cryptography assessment is not conducted as required by NIST SP 800-171 Rev. 2, Section 3.13.11.

**Planned Remediation:**
- Assess FIPS validation status of cryptography used
- Document cryptography implementation
- Identify FIPS-validated vs non-FIPS-validated cryptography
- Create FIPS assessment evidence
- Document POA&M items for non-FIPS-validated cryptography (if applicable)
- Plan migration to FIPS-validated cryptography (if needed)

**Responsible Role:** System Administrator

**Target Completion Timeframe:** ≤ 180 days (by 2026-07-22)

**Status:** Open

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

---

## Summary

**Total Open POA&M Items:** 3

**Controls Affected:**
- 3.5.6 - Disable identifiers after a defined period of inactivity
- 3.7.2 - Provide controls on the tools, techniques, mechanisms, and personnel used to conduct system maintenance
- 3.13.11 - Employ FIPS-validated cryptography when used to protect the confidentiality of CUI

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
- Version 1.0 (2026-01-24): Initial standalone POA&M document for CMMC Level 2 assessment package

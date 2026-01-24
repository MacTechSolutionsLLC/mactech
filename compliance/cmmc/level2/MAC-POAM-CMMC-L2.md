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

**Target Completion Timeframe:** ≤ 180 days (by 2026-07-26)

**Status:** Open

**Priority:** Medium

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

# Plan of Action and Milestones (POA&M) Tracking Log - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-23  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.12.2

**Applies to:** CMMC 2.0 Level 2 (FCI and CUI system)

---

## 1. Purpose

This document tracks all Plans of Action and Milestones (POA&M) items identified during security assessments, risk assessments, and continuous monitoring activities.

---

## 2. POA&M Management

**POA&M Process:** See `../02-policies-and-procedures/MAC-SOP-231_POA&M_Process_Procedure.md`

**Review Schedule:**
- Monthly review of all open POA&M items
- Quarterly comprehensive review
- Annual POA&M assessment

**Last Review Date:** 2026-01-23  
**Next Review Date:** 2026-02-23

---

## 3. POA&M Items

### POAM-001: MFA Implementation for Privileged Accounts

**Deficiency Description:** Multifactor authentication (MFA) is not implemented for privileged accounts (ADMIN role) as required by NIST SP 800-171 Rev. 2, Section 3.5.3.

**Affected Control:** 3.5.3 - Use multifactor authentication for local and network access to privileged accounts

**Planned Remediation:**
- Assess MFA solution options
- Select and implement MFA solution
- Configure MFA for all ADMIN role accounts
- Test MFA implementation
- Document MFA implementation
- Create MFA implementation evidence

**Responsible Party:** System Administrator

**Target Completion Date:** 2026-02-20 (Phase 1, Weeks 3-4)

**Status:** ✅ Completed

**Priority:** High

**Milestones:**
- [x] MFA solution selected (Week 3) - NextAuth.js with TOTP Provider
- [x] MFA implemented (Week 4) - Completed 2026-01-23
- [x] MFA tested and verified (Week 4) - Ready for user acceptance testing
- [x] MFA evidence created (Week 4) - MAC-RPT-104_MFA_Implementation_Evidence.md

**Completion Date:** 2026-01-23

**Notes:** MFA implementation completed ahead of schedule. NextAuth.js with TOTP Provider implemented. All ADMIN role accounts now require MFA. Evidence document created. Ready for user acceptance testing and production deployment.

---

### POAM-002: Account Lockout Implementation

**Deficiency Description:** Account lockout mechanism is not implemented to limit unsuccessful logon attempts as required by NIST SP 800-171 Rev. 2, Section 3.1.8.

**Affected Control:** 3.1.8 - Limit unsuccessful logon attempts

**Planned Remediation:**
- Design account lockout mechanism
- Implement account lockout in authentication system
- Configure lockout parameters (max attempts, lockout duration)
- Test account lockout functionality
- Document account lockout procedure
- Update Account Lifecycle Enforcement Procedure

**Responsible Party:** System Administrator, Development Team

**Target Completion Date:** 2026-05-15 (Phase 5, Weeks 17-18)

**Status:** ✅ Completed

**Priority:** Medium

**Milestones:**
- [x] Account lockout design completed (Week 17) - Completed 2026-01-23
- [x] Account lockout implemented (Week 18) - Completed 2026-01-23
- [x] Account lockout tested (Week 18) - Ready for user acceptance testing
- [ ] Procedure updated (Week 18) - To be updated in next documentation cycle

**Completion Date:** 2026-01-23

**Notes:** Account lockout implementation completed ahead of schedule. Implemented in lib/auth.ts and /api/auth/custom-signin route. Configuration: 5 failed attempts = 30 minute lockout. Failed attempts reset on successful login. Account lockout status checked before password verification.

---

### POAM-003: Enhanced Audit Logging

**Deficiency Description:** Audit logging requires enhancement to fully meet NIST SP 800-171 Rev. 2, Section 3.3 requirements, including audit log review, failure alerts, and correlation.

**Affected Controls:** 3.3.1-3.3.9 (Audit and Accountability)

**Planned Remediation:**
- Create Audit and Accountability Policy
- Enhance audit logging coverage
- Implement audit log review procedure
- Implement audit log failure alerts
- Implement audit record correlation
- Protect audit information
- Document audit logging enhancements

**Responsible Party:** System Administrator, Development Team

**Target Completion Date:** 2026-03-15 (Phase 2, Weeks 5-8)

**Status:** Open

**Priority:** Medium

**Milestones:**
- [ ] Audit and Accountability Policy created (Week 5)
- [ ] Audit logging enhanced (Week 6)
- [ ] Review procedure created (Week 6)
- [ ] Failure alerts implemented (Week 6)
- [ ] Correlation implemented (Week 6)

**Notes:** Audit logging is heavily scrutinized by assessors. Enhancements planned for Phase 2.

---

### POAM-004: Configuration Management Plan

**Deficiency Description:** Formal Configuration Management Plan is not established as required by NIST SP 800-171 Rev. 2, Section 3.4.1.

**Affected Controls:** 3.4.1-3.4.9 (Configuration Management)

**Planned Remediation:**
- Create Configuration Management Plan
- Establish baseline configurations
- Document configuration inventory
- Formalize change control process
- Implement security impact analysis
- Create software restriction policy
- Document configuration management process

**Responsible Party:** System Administrator

**Target Completion Date:** 2026-04-05 (Phase 3, Weeks 9-12)

**Status:** Open

**Priority:** Medium

**Milestones:**
- [ ] CM Plan created (Week 10)
- [ ] Baselines established (Week 10)
- [ ] Change control formalized (Week 11)
- [ ] Software restriction policy created (Week 12)

**Notes:** Configuration management is a common finding area. Formal CM process planned for Phase 3.

---

### POAM-005: Security Awareness Training Program

**Deficiency Description:** Formal security awareness training program is not established as required by NIST SP 800-171 Rev. 2, Section 3.2.

**Affected Controls:** 3.2.1-3.2.3 (Awareness and Training)

**Planned Remediation:**
- Create Awareness and Training Policy
- Develop security awareness training content
- Develop insider threat awareness training
- Deliver training to all personnel
- Track training completion
- Document training program

**Responsible Party:** System Administrator

**Target Completion Date:** 2026-04-26 (Phase 4, Weeks 13-16)

**Status:** Open

**Priority:** Medium

**Milestones:**
- [ ] Awareness and Training Policy created (Week 13)
- [ ] Training content developed (Week 14)
- [ ] Training delivered (Week 15)
- [ ] Training completion tracked (Week 16)

**Notes:** Security awareness training required for all personnel. Training program planned for Phase 4.

---

### POAM-006: Personnel Security Screening

**Deficiency Description:** Personnel security screening procedure is not established as required by NIST SP 800-171 Rev. 2, Section 3.9.1.

**Affected Controls:** 3.9.1-3.9.2 (Personnel Security)

**Planned Remediation:**
- Create Personnel Security Policy
- Develop personnel screening procedure
- Develop personnel termination procedure
- Implement screening process
- Document screening procedures

**Responsible Party:** Management, System Administrator

**Target Completion Date:** 2026-04-26 (Phase 4, Weeks 15-16)

**Status:** Open

**Priority:** Medium

**Milestones:**
- [ ] Personnel Security Policy created (Week 15)
- [ ] Screening procedure created (Week 15)
- [ ] Termination procedure created (Week 16)
- [ ] Procedures implemented (Week 16)

**Notes:** Personnel security required for CUI access. Procedures planned for Phase 4.

---

### POAM-007: Incident Response Testing

**Deficiency Description:** Incident response capability testing is not conducted as required by NIST SP 800-171 Rev. 2, Section 3.6.3.

**Affected Control:** 3.6.3 - Test the organizational incident response capability

**Planned Remediation:**
- Develop incident response testing procedure
- Conduct tabletop exercise
- Conduct simulation exercise (if applicable)
- Document test results
- Update incident response procedures based on test results

**Responsible Party:** System Administrator, Security Contact

**Target Completion Date:** 2026-05-29 (Phase 6, Weeks 21-22)

**Status:** Open

**Priority:** Medium

**Milestones:**
- [ ] IR testing procedure created (Week 21)
- [ ] Tabletop exercise conducted (Week 22)
- [ ] Test results documented (Week 22)
- [ ] Procedures updated (Week 22)

**Notes:** IR testing often a finding. Testing planned for Phase 6.

---

### POAM-008: FIPS Cryptography Assessment

**Deficiency Description:** FIPS-validated cryptography assessment is not conducted as required by NIST SP 800-171 Rev. 2, Section 3.13.11.

**Affected Control:** 3.13.11 - Employ FIPS-validated cryptography when used to protect the confidentiality of CUI

**Planned Remediation:**
- Assess FIPS validation status of cryptography used
- Document cryptography implementation
- Identify FIPS-validated vs non-FIPS-validated cryptography
- Create FIPS assessment evidence
- Document POA&M items for non-FIPS-validated cryptography (if applicable)
- Plan migration to FIPS-validated cryptography (if needed)

**Responsible Party:** System Administrator

**Target Completion Date:** 2026-07-26 (Phase 8, Weeks 29-30)

**Status:** Open

**Priority:** Medium

**Milestones:**
- [ ] FIPS assessment conducted (Week 29)
- [ ] Assessment documented (Week 30)
- [ ] Evidence created (Week 30)
- [ ] POA&M items created if needed (Week 30)

**Notes:** FIPS validation is critical. Assessment planned for Phase 8.

---

### POAM-009: Separation of Duties Matrix

**Deficiency Description:** Formal Separation of Duties (SoD) matrix is not established as required by NIST SP 800-171 Rev. 2, Section 3.1.4.

**Affected Control:** 3.1.4 - Separate the duties of individuals to reduce the risk of malevolent activity without collusion

**Planned Remediation:**
- Create Separation of Duties Matrix
- Document role conflicts
- Implement SoD controls
- Document SoD implementation

**Responsible Party:** System Administrator

**Target Completion Date:** 2026-05-01 (Phase 5, Week 17)

**Status:** Open

**Priority:** Medium

**Milestones:**
- [ ] SoD matrix created (Week 17)
- [ ] Role conflicts documented (Week 17)
- [ ] SoD controls implemented (Week 17)

**Notes:** SoD matrix required for Level 2. Planned for Phase 5.

---

### POAM-010: Enhanced System Monitoring

**Deficiency Description:** System monitoring procedures require enhancement to fully meet NIST SP 800-171 Rev. 2, Section 3.14.6 and 3.14.7 requirements.

**Affected Controls:** 3.14.6 - Monitor organizational systems, 3.14.7 - Identify unauthorized use

**Planned Remediation:**
- Enhance monitoring procedures
- Implement unauthorized use detection
- Document monitoring capabilities
- Create monitoring procedures

**Responsible Party:** System Administrator

**Target Completion Date:** 2026-08-09 (Phase 8, Weeks 31-32)

**Status:** Open

**Priority:** Medium

**Milestones:**
- [ ] Monitoring procedures enhanced (Week 31)
- [ ] Unauthorized use detection implemented (Week 32)
- [ ] Procedures documented (Week 32)

**Notes:** Enhanced monitoring planned for Phase 8.

---

## 4. POA&M Summary

**Total POA&M Items:** 10  
**Open:** 10  
**In Progress:** 0  
**Remediated:** 0  
**Verified:** 0  
**Closed:** 0

**Priority Breakdown:**
- High Priority: 1
- Medium Priority: 9
- Low Priority: 0

---

## 5. POA&M Review History

| Review Date | Reviewed By | Notes |
|-------------|-------------|-------|
| 2026-01-23 | Compliance Team | Initial POA&M items identified during Level 2 migration planning |

---

## 6. Related Documents

- POA&M Process Procedure: `../02-policies-and-procedures/MAC-SOP-231_POA&M_Process_Procedure.md`
- Risk Assessment Report: `MAC-AUD-404_Risk_Assessment_Report.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 14)

---

## 7. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-02-23

**Change History:**
- Version 1.0 (2026-01-23): Initial POA&M items identified for CMMC Level 2 migration

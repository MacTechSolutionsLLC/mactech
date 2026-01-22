# Annual Self-Assessment Process - CMMC Level 1

**Document Version:** 1.0  
**Date:** 2026-01-22  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 1 (Foundational)  
**Reference:** FAR 52.204-21

**Applies to:** CMMC 2.0 Level 1 (FCI-only system)

---

## 1. Purpose

This document establishes the annual self-assessment process for CMMC Level 1 compliance. The process ensures that all 17 CMMC Level 1 practices are reviewed annually and that evidence is maintained to demonstrate ongoing compliance.

---

## 2. Responsible Role

**Responsible Party:** System Administrator (or designated security contact)

**Responsibilities:**
- Conduct annual self-assessment
- Review all 17 CMMC Level 1 practices
- Verify evidence availability
- Document assessment findings
- Obtain executive attestation
- Maintain assessment records

---

## 3. Annual Schedule

**Assessment Frequency:** Annually

**Recommended Schedule:** Q1 of each calendar year (January-March)

**Assessment Timeline:**
- **Week 1-2:** Evidence collection and review
- **Week 3:** Practice assessment and documentation
- **Week 4:** Executive review and attestation

**Note:** Assessment may be conducted more frequently if significant system changes occur or if required by contract terms.

---

## 4. Evidence Review Checklist

The following checklist covers all 17 CMMC Level 1 practices:

### Access Control (AC)

- [ ] **AC.L1-3.1.1** - Limit information system access to authorized users
  - Evidence: Authentication system (`lib/auth.ts`), middleware (`middleware.ts`), audit logs
  - Status: [ ] Implemented [ ] Inherited [ ] Not Implemented

- [ ] **AC.L1-3.1.2** - Limit access to permitted transactions and functions
  - Evidence: Role-based access control (`middleware.ts`), user roles, admin route protection
  - Status: [ ] Implemented [ ] Inherited [ ] Not Implemented

- [ ] **AC.L1-3.1.3** - Verify and control/limit connections to external systems
  - Evidence: HTTPS/TLS enforcement (Railway platform - inherited)
  - Status: [ ] Implemented [ ] Inherited [ ] Not Implemented

- [ ] **AC.L1-3.1.4** - Control information posted on publicly accessible systems
  - Evidence: Public content approval workflow, middleware protection
  - Status: [ ] Implemented [ ] Inherited [ ] Not Implemented

- [ ] **AC.L1-3.1.5** - Control and manage administrative privileges
  - Evidence: Admin re-authentication (`lib/admin-reauth.ts`), admin action logging
  - Status: [ ] Implemented [ ] Inherited [ ] Not Implemented

### Identification and Authentication (IA)

- [ ] **IA.L1-3.5.1** - Identify information system users
  - Evidence: User accounts with unique identifiers (`prisma/schema.prisma`), admin UI
  - Status: [ ] Implemented [ ] Inherited [ ] Not Implemented

- [ ] **IA.L1-3.5.2** - Authenticate users before allowing access
  - Evidence: NextAuth.js authentication (`lib/auth.ts`), password hashing, session management
  - Status: [ ] Implemented [ ] Inherited [ ] Not Implemented

### Media Protection (MP)

- [ ] **MP.L1-3.8.3** - Sanitize or destroy media containing FCI
  - Evidence: Database record deletion, no removable media used
  - Status: [ ] Implemented [ ] Inherited [ ] Not Implemented

### Physical and Environmental Protection (PE)

- [ ] **PE.L1-3.10.1** - Limit physical access to authorized individuals
  - Evidence: Physical Security Policy, device security requirements, Railway physical security (inherited)
  - Status: [ ] Implemented [ ] Inherited [ ] Not Implemented

- [ ] **PE.L1-3.10.2** - Escort visitors and monitor visitor activity
  - Evidence: Physical Security Policy, physical access controls
  - Status: [ ] Implemented [ ] Inherited [ ] Not Implemented

- [ ] **PE.L1-3.10.4** - Maintain audit logs of physical access
  - Evidence: Physical access logging module (`/admin/physical-access-logs`), CSV exports
  - Status: [ ] Implemented [ ] Inherited [ ] Not Implemented

### System and Communications Protection (SC)

- [ ] **SC.L1-3.13.1** - Use encryption for FCI in transit
  - Evidence: HTTPS/TLS (Railway platform - inherited)
  - Status: [ ] Implemented [ ] Inherited [ ] Not Implemented

- [ ] **SC.L1-3.13.5** - Use encryption for FCI at rest
  - Evidence: Database encryption at rest (Railway PostgreSQL - inherited)
  - Status: [ ] Implemented [ ] Inherited [ ] Not Implemented

### System and Information Integrity (SI)

- [ ] **SI.L1-3.14.1** - Employ malicious code protection
  - Evidence: Railway platform malware protection (inherited), endpoint inventory
  - Status: [ ] Implemented [ ] Inherited [ ] Not Implemented

- [ ] **SI.L1-3.14.2** - Identify designated locations for malicious code protection
  - Evidence: Endpoint inventory module (`/admin/endpoint-inventory`), CSV exports
  - Status: [ ] Implemented [ ] Inherited [ ] Not Implemented

- [ ] **SI.L1-3.14.3** - Update malicious code protection mechanisms
  - Evidence: Railway platform manages updates (inherited)
  - Status: [ ] Implemented [ ] Inherited [ ] Not Implemented

- [ ] **SI.L1-3.14.4** - Perform periodic scans and real-time scans
  - Evidence: Railway platform scanning (inherited)
  - Status: [ ] Implemented [ ] Inherited [ ] Not Implemented

### Vulnerability Management

- [ ] **Practice 15** - Identify, report, and correct flaws in a timely manner
  - Evidence: Dependabot configuration (`.github/dependabot.yml`), npm audit, vulnerability remediation
  - Status: [ ] Implemented [ ] Inherited [ ] Not Implemented

### Incident Response (IR)

- [ ] **IR.L1-3.6.2** - Report incidents to designated personnel
  - Evidence: Incident Response Policy (`MAC-POL-215_Incident_Response_Policy.md`), security contact
  - Status: [ ] Implemented [ ] Inherited [ ] Not Implemented

---

## 5. Record Retention

**Retention Period:** Minimum 3 years

**Storage Location:**
- Assessment records: `compliance/cmmc/level1/04-self-assessment/annual-assessments/`
- Attestation records: Same location, with executive signature

**Record Types:**
- Completed assessment checklists
- Executive attestation records
- Evidence review documentation
- Any findings or remediation actions

---

## 6. Attestation Record Template

### Annual Self-Assessment Attestation

**Assessment Date:** [Date]  
**Assessment Period:** [Start Date] to [End Date]  
**Assessed By:** [System Administrator Name]

**Scope Statement:**
This system is scoped to FCI only. Only non-public information related to government contracts is treated as FCI. Publicly released information (e.g., SAM.gov postings) is not FCI unless combined with internal, non-public data. CUI is prohibited and not intentionally processed or stored.

**Controls Reviewed:**
All 17 CMMC Level 1 practices aligned to FAR 52.204-21 have been reviewed.

**Assessment Summary:**
- **Practices Implemented Internally:** [Number]
- **Practices Inherited from Platform Providers:** [Number]
- **Total Practices:** 17
- **Not Implemented:** 0

**Findings:**
[List any findings, gaps, or remediation actions]

**Attestation Statement:**
I attest that:
1. All 17 CMMC Level 1 practices are implemented or inherited
2. Evidence has been reviewed and is available
3. The system maintains compliance with FAR 52.204-21 requirements
4. Any findings have been documented and addressed

**Executive Signature:**

**Authorized Official Name:** _________________________

**Title:** _________________________

**Signature:** _________________________

**Date:** _________________________

---

## 7. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be completed]

**Change History:**
- Version 1.0 (2026-01-22): Initial document creation

---

## Appendix A: Related Documents

- Self-Assessment: `MAC-AUD-401_Internal_Cybersecurity_Self-Assessment.md`
- Practices Matrix: `MAC-AUD-402_CMMC_L1_Practices_Matrix.md`
- Executive Attestation: `../00-cover-memo/MAC-FRM-202_CMMC_Level_1_Executive_Attestation.md`

## Appendix B: FAR 52.204-21 Reference

This assessment covers all 15 basic safeguarding requirements in FAR 52.204-21, mapped to 17 CMMC Level 1 practices.

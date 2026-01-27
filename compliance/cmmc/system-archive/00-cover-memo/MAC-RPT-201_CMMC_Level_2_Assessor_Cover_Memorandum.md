# CMMC 2.0 Level 2 Assessment Package – MacTech Solutions

**System:** Cloud-Hosted Web Application  
**Scope:** Federal Contract Information (FCI) and Controlled Unclassified Information (CUI)  
**Standard:** NIST SP 800-171 Rev. 2 / CMMC 2.0 Level 2 (Advanced)

---

## Purpose

This package supports CMMC 2.0 Level 2 assessment for the MacTech Solutions application. The system processes and stores both Federal Contract Information (FCI) and Controlled Unclassified Information (CUI) in accordance with NIST SP 800-171 Rev. 2 requirements.

---

## Scope Summary

- **Hosting:** Railway Platform (cloud PaaS)
- **Source Control:** GitHub
- **Data Types:** FCI and CUI
- **System Type:** Cloud-based web application (Next.js, PostgreSQL)
- **Out of Scope:** Enterprise IT systems, organizational wireless infrastructure

---

## Control Implementation Approach

**Total Controls:** 110 (NIST SP 800-171 Rev. 2)

**Implementation Status:**
- ✅ **Implemented:** 81 controls (74%) - Implemented internally by the organization
- 🔄 **Inherited:** 20 controls (18%) - Provided by platform providers (Railway, GitHub)
- ❌ **Not Implemented:** 3 controls (3%) - Tracked in POA&M
- 🚫 **Not Applicable:** 14 controls (13%) - Not applicable to system architecture

**Control Approach:**
Controls are implemented or inherited in alignment with NIST SP 800-171 Rev. 2 requirements. All organizational responsibilities (authentication, authorization, access controls, logging, incident response, configuration management, etc.) are implemented internally. Infrastructure-related controls (TLS/HTTPS, database encryption, platform malware protection, physical security) are inherited from platform providers.

---

## Inherited Controls

**Railway Platform:**
- TLS/HTTPS encryption for all network communications
- Database encryption at rest
- Physical security and facility protection
- Network boundary protection
- System clock synchronization (NTP)
- Platform-level malware protection

**GitHub:**
- Source code repository access controls
- Git commit history and audit trail
- Dependabot vulnerability scanning
- Repository security features

**Inherited Controls Documentation:**
See `../03-control-responsibility/MAC-SEC-310_Inherited_Control_Statement_Railway.md` for detailed documentation of inherited controls.

---

## Key Documentation

1. **System Security Plan (SSP):** `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
   - Comprehensive documentation of all 110 controls
   - System architecture and data flow
   - Control implementation details

2. **System Control Traceability Matrix (SCTM):** `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
   - Complete mapping of all 110 controls to implementation, policies, procedures, and evidence
   - Status of each control (Implemented/Inherited/Not Implemented/Not Applicable)

3. **Internal Cybersecurity Self-Assessment:** `../04-self-assessment/MAC-AUD-401_Internal_Cybersecurity_Self-Assessment.md`
   - Detailed assessment of control implementation
   - Evidence references

4. **POA&M Tracking Log:** `../04-self-assessment/MAC-AUD-405_POA&M_Tracking_Log.md`
   - Plan of Action and Milestones for controls not yet implemented
   - Remediation timelines and status

5. **Risk Assessment Report:** `../04-self-assessment/MAC-AUD-404_Risk_Assessment_Report.md`
   - Risk assessment methodology and results
   - Identified threats and vulnerabilities

6. **Evidence Files:** `../05-evidence/`
   - Evidence files for all 110 controls (MAC-RPT-***)
   - Code-based evidence with file references and line numbers

---

## Readiness Statement

This documentation reflects actual operational practices and is appropriate for CMMC Level 2 assessment. All controls are documented with evidence-based implementation details. The system has achieved a NIST SP 800-171 DoD Assessment score of 101 out of 110 (91.8%), with 3 controls tracked in POA&M (3.5.6: -1 point, 3.7.2: -5 points, 3.13.11: -3 points).

---

## Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Date:** 2026-01-24  
**Version:** 1.0

**Change History:**
- Version 1.0 (2026-01-24): Initial document creation for CMMC Level 2 assessment package

---

## Contact Information

For questions regarding this assessment package, please contact:

**Organization:** MacTech Solutions LLC  
**Compliance Contact:** [To be completed]  
**Email:** [To be completed]

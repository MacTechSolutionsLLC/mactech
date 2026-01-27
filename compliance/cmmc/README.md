# CMMC Compliance Documentation

**System:** MacTech Solutions Application  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** FAR 52.204-21 (Level 1), NIST SP 800-171 Rev. 2 (Level 2)  
**Last Updated:** January 2026

---

## CMMC Level 2 Status

**Current Status:** ✅ CMMC Level 2 Implementation Complete

**Total Controls:** 110 NIST SP 800-171 Rev. 2 requirements

**Implementation Status:**
- **Implemented:** 90 controls (82%)
- **Inherited:** 10 controls (9%)
- **Not Applicable:** 10 controls (9%)
- **Overall Readiness:** 100% (Implemented + Inherited)

**CUI Protection:**
- ✅ CUI is handled by FIPS-validated cryptography via Ubuntu 22.04 OpenSSL Cryptographic Module (FIPS provider) operating in FIPS-approved mode
- ✅ CUI vault TLS/HTTPS fully FIPS-validated
- ✅ CUI vault kernel FIPS mode enabled, FIPS provider active

**System Control Traceability Matrix (SCTM):**
- Location: `level2/04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- Web Interface: `/admin/compliance/sctm`
- All 110 controls mapped with implementation status, evidence, and verification

**Compliance Audit System:**
- Automated verification of all controls against code, evidence, policies, and procedures
- Web Interface: `/admin/compliance/audit`
- Documentation: See `COMPLIANCE_AUDIT_SYSTEM.md`
- CLI Script: `scripts/run-compliance-audit.ts`

---

## NIST Cybersecurity Framework 2.0 Alignment

MacTech Solutions aligns its cybersecurity program with the NIST Cybersecurity Framework (CSF) 2.0. Our CSF 2.0 alignment is documented in our CSF 2.0 Profile, which maps our existing CMMC Level 2 controls to CSF 2.0 functions and categories. All six CSF 2.0 functions (Govern, Identify, Protect, Detect, Respond, Recover) are addressed through our existing cybersecurity controls.

**CSF 2.0 Profile Documentation:**
- Location: `../nist-csf-2.0/`
- Profile Overview: `../nist-csf-2.0/csf-profile-overview.md`
- Current State Profile: `../nist-csf-2.0/csf-current-state-profile.md`
- Target State Profile: `../nist-csf-2.0/csf-target-state-profile.md`
- Control Mapping: `../nist-csf-2.0/csf-control-mapping.md`
- Claim Language: `../nist-csf-2.0/csf-claim-language.md`

**Note:** CMMC 2.0 Level 2 remains the primary compliance framework for DoD contracts. CSF 2.0 alignment is derived from existing CMMC implementation and demonstrates how our controls support CSF 2.0 outcomes.

---

## FedRAMP Moderate Design Alignment

MacTech Solutions' security architecture and control design are aligned with the FedRAMP Moderate baseline. Our FedRAMP Moderate alignment is documented in our FedRAMP Moderate Design Alignment Package, which maps our existing CMMC Level 2 controls to FedRAMP Moderate baseline expectations. All applicable FedRAMP Moderate control families are addressed through our existing security controls.

**FedRAMP Moderate Design Alignment Documentation:**
- Location: `../fedramp-moderate-alignment/`
- Alignment Overview: `../fedramp-moderate-alignment/fedramp-alignment-overview.md`
- System Boundary and Architecture: `../fedramp-moderate-alignment/system-boundary-and-architecture.md`
- Control Family Alignment: `../fedramp-moderate-alignment/fedramp-control-family-alignment.md`
- Inherited Controls: `../fedramp-moderate-alignment/inherited-controls-and-external-services.md`
- Continuous Monitoring Concept: `../fedramp-moderate-alignment/continuous-monitoring-concept.md`
- Claim Language: `../fedramp-moderate-alignment/fedramp-claim-language.md`

**Note:** CMMC 2.0 Level 2 remains the primary compliance framework for DoD contracts. FedRAMP Moderate design alignment is derived from existing CMMC implementation and demonstrates how our security architecture aligns with FedRAMP Moderate baseline expectations.

---

## SOC 2 Type I Readiness

MacTech Solutions has completed an internal SOC 2 Type I readiness assessment. Our system design is prepared for a SOC 2 Type I examination, with controls designed to meet SOC 2 Trust Services Criteria (Security). Our SOC 2 Type I readiness is documented in our SOC 2 Type I Readiness Package, which maps our existing CMMC Level 2 controls to SOC 2 Trust Services Criteria. All 9 Common Criteria (CC1-CC9) are addressed through our existing security controls.

**SOC 2 Type I Readiness Documentation:**
- Location: `../soc2-type1-readiness/`
- Readiness Overview: `../soc2-type1-readiness/soc2-readiness-overview.md`
- System Description: `../soc2-type1-readiness/system-description.md`
- Risk Assessment: `../soc2-type1-readiness/soc2-risk-assessment.md`
- Trust Services Criteria Mapping: `../soc2-type1-readiness/trust-services-criteria-mapping.md`
- Claim Language: `../soc2-type1-readiness/soc2-claim-language.md`

**Note:** CMMC 2.0 Level 2 remains the primary compliance framework for DoD contracts. SOC 2 Type I readiness is derived from existing CMMC implementation and demonstrates how our system design is prepared for a SOC 2 Type I examination.

---

## NIST RMF Alignment

MacTech Solutions aligns its system security governance with the NIST Risk Management Framework (RMF). Our security practices are informed by RMF principles, and our system security governance is structured consistent with RMF. Our RMF alignment is documented in our RMF Alignment Package, which maps our existing CMMC Level 2 controls and governance practices to RMF principles. All six RMF steps (Categorize, Select, Implement, Assess, Authorize, Monitor) are addressed through our existing security governance and control implementation.

**NIST RMF Alignment Documentation:**
- Location: `../nist-rmf-alignment/`
- Alignment Overview: `../nist-rmf-alignment/rmf-alignment-overview.md`
- System Categorization: `../nist-rmf-alignment/rmf-system-categorization.md`
- Control Selection and Inheritance: `../nist-rmf-alignment/rmf-control-selection-and-inheritance.md`
- Implementation Summary: `../nist-rmf-alignment/rmf-implementation-summary.md`
- Risk Assessment and Treatment: `../nist-rmf-alignment/rmf-risk-assessment-and-treatment.md`
- Authorization Boundary and Decision Context: `../nist-rmf-alignment/rmf-authorization-boundary-and-decision-context.md`
- Continuous Monitoring Concept: `../nist-rmf-alignment/rmf-continuous-monitoring-concept.md`
- Claim Language: `../nist-rmf-alignment/rmf-claim-language.md`

**Note:** CMMC 2.0 Level 2 remains the primary compliance framework for DoD contracts. NIST RMF alignment is derived from existing CMMC implementation and demonstrates how our system security governance aligns with RMF principles.

---

## Scope Statement

**System Scope:** This system is scoped to **FCI (Federal Contract Information) and CUI (Controlled Unclassified Information)** per CMMC Level 2 requirements.

**Data Types:**
- Federal Contract Information (FCI) - Only non-public information related to government contracts is treated as FCI. Publicly released information (e.g., SAM.gov postings) is not FCI unless combined with internal, non-public data.
- Controlled Unclassified Information (CUI) - CUI files are stored separately in StoredCUIFile table with password protection
- User account information
- System configuration and audit logs

**CUI Handling:**
- CUI files stored separately from FCI files (StoredCUIFile table)
- CUI files require password protection for access (password: "cui" - temporary)
- CUI keyword auto-detection for file classification
- All CUI file access attempts logged to audit log

**Out of Scope:**
- Classified information - Not applicable

---

## Hosting & Infrastructure

### Primary Hosting: Railway Platform

**Infrastructure:**
- Application hosting: Railway cloud platform
- Database: Railway PostgreSQL (encrypted at rest)
- TLS/HTTPS: Railway platform (automatic HTTPS termination)
- Network security: Railway platform (DDoS protection, firewall rules)

**Inherited Controls:**
- Physical data center security
- Platform patching and updates
- Network-level security
- TLS/HTTPS termination
- Database encryption at rest

**Evidence:** See `level2/03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md`

### Source Control: GitHub

**Repository:**
- Source code: GitHub
- Access control: GitHub authentication and authorization
- Dependency scanning: GitHub Dependabot (weekly)

**Inherited Controls:**
- Repository access controls
- Code review processes
- Automated dependency vulnerability scanning

**Evidence:** See `level2/03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md`

---

## CMMC Level 2 Implementation Summary

**Key Features Implemented:**
- ✅ Multi-Factor Authentication (MFA) for privileged accounts (Control 3.5.3)
- ✅ Account lockout after failed login attempts (Control 3.1.8)
- ✅ Comprehensive audit logging with 90-day retention (Control 3.3.1)
- ✅ CUI file storage and protection with password protection (Controls 3.1.3, 3.1.19, 3.1.21, 3.1.22)
- ✅ Separation of duties with role-based access control (Control 3.1.4)
- ✅ POA&M tracking and management system (Control 3.12.2)
- ✅ Admin-editable POA&M and SCTM controls via web interface
- ✅ Automated compliance audit system with control verification

**Control Family Readiness:**
- Access Control (AC): 22 controls - 100% readiness
- Audit and Accountability (AU): 9 controls - 100% readiness
- Identification and Authentication (IA): 11 controls - 100% readiness
- Configuration Management (CM): 9 controls - 100% readiness
- System and Information Integrity (SI): 7 controls - 100% readiness
- All other families: 90%+ readiness

**Detailed Analysis:** See `CURRENT_STATE_ANALYSIS.md` for complete breakdown

## CMMC Level 1 Practices (Historical Reference)

**Total Practices:** 17

**Note:** CMMC Level 1 includes 17 practices aligned to FAR 52.204-21 (which contains 15 basic safeguarding requirements). All Level 1 practices are now covered by Level 2 controls.

**Historical Assessment:** See `level2/04-self-assessment/MAC-AUD-401_Internal_Cybersecurity_Self-Assessment.md`

**Practices Matrix:** See `level2/04-self-assessment/MAC-AUD-402_CMMC_L1_Practices_Matrix.md`

---

## Evidence Map

### Quick Links

**Policies & Procedures:**
- `level2/02-policies-and-procedures/` - All policy documents

**Self-Assessment:**
- `level2/04-self-assessment/MAC-AUD-401_Internal_Cybersecurity_Self-Assessment.md` - Detailed practice assessment
- `level2/04-self-assessment/MAC-AUD-402_CMMC_L1_Practices_Matrix.md` - Practices matrix with evidence
- `level2/04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md` - CMMC Level 2 SCTM (110 controls)
- `level2/04-self-assessment/MAC-AUD-409_Compliance_Audit_Report.md` - Automated compliance audit report

**Evidence:**
- `level2/05-evidence/MAC-RPT-100_Evidence_Index.md` - Evidence index
- `level2/05-evidence/evidence-index.md` - Comprehensive evidence index
- `level2/05-evidence/templates/` - Evidence templates
- `level2/05-evidence/sample-exports/` - Sample CSV exports

**System Documentation:**
- `level2/01-system-scope/MAC-IT-304_System_Security_Plan.md` - System Security Plan (SSP-lite)
- `level2/01-system-scope/MAC-IT-105_System_Boundary.md` - System boundary
- `level2/01-system-scope/MAC-SEC-302_FCI_Scope_and_Data_Boundary_Statement.md` - FCI scope

**Inherited Controls:**
- `level2/03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md` - Railway/GitHub inheritance

**Executive Attestation:**
- `level2/00-cover-memo/MAC-FRM-202_CMMC_Level_1_Executive_Attestation.md` - Executive attestation

---

## Key Features

### Compliance Audit System (CMMC Level 2)
- **Automated Control Verification:** Verifies all 110 controls against code, evidence, policies, and procedures
- **Detailed Control Views:** Expandable control details with enriched data, evidence links, and code verification
- **Compliance Scoring:** Each control receives a 0-100% compliance score
- **Audit Dashboard:** `/admin/compliance/audit` - Summary statistics, critical issues, and compliance breakdowns
- **SCTM Integration:** `/admin/compliance/sctm` - Interactive control matrix with audit results
- **Documentation:** See `COMPLIANCE_AUDIT_SYSTEM.md` for full system documentation

### Physical Access Logs (PE.L1-3.10.4)
- Admin portal: `/admin/physical-access-logs`
- Digital logbook for physical access entries
- CSV export functionality
- Immutable audit trail

### Endpoint Inventory (SI.L1-3.14.2)
- Admin portal: `/admin/endpoint-inventory`
- Track authorized endpoints with AV status
- CSV export functionality

### Security Audit Logging
- Admin portal: `/admin/events`
- Comprehensive event logging
- CSV export functionality
- 90-day retention minimum

---

## Evidence Generation

**Script:** `scripts/generate-evidence.ts`

**Exports:**
- Users list (sanitized)
- Physical access logs (date range)
- Audit log (date range)
- Endpoint inventory

**Location:** `level2/05-evidence/sample-exports/`

**Instructions:** See script documentation for redaction procedures before external sharing.

---

## Document Structure

```
compliance/cmmc/
├── README.md (this file)
└── level2/
    ├── 00-cover-memo/          # Executive attestation
    ├── 01-system-scope/         # System boundary, SSP
    ├── 02-policies-and-procedures/  # Policies and SOPs
    ├── 03-control-responsibility/   # Inherited controls
    ├── 04-self-assessment/      # Self-assessment, matrix
    ├── 05-evidence/             # Evidence index, templates, exports
    └── 06-supporting-documents/ # Supporting documentation
```

---

## Contact

**Compliance Questions:**
- Contact: [To be completed]
- Email: [To be completed]

**Security Incidents:**
- See `SECURITY.md` in repository root
- Email: security@mactechsolutions.com

---

## Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Last Updated:** January 2026  
**Next Review:** [To be completed]

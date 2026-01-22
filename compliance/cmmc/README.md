# CMMC Level 1 Compliance Documentation

**System:** MacTech Solutions Application  
**Compliance Framework:** CMMC 2.0 Level 1 (Foundational)  
**Reference:** FAR 52.204-21  
**Last Updated:** January 2026

---

## Scope Statement

**System Scope:** This system is scoped to **FCI (Federal Contract Information) only**. 

**CUI Prohibition:** CUI is prohibited and not intentionally processed or stored in this system. The system operates within an FCI-only boundary.

**Data Types:**
- Federal Contract Information (FCI) - Only non-public information related to government contracts is treated as FCI. Publicly released information (e.g., SAM.gov postings) is not FCI unless combined with internal, non-public data.
- User account information
- System configuration and audit logs

**Out of Scope:**
- CUI (Controlled Unclassified Information) - Not processed or stored
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

**Evidence:** See `level1/03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md`

### Source Control: GitHub

**Repository:**
- Source code: GitHub
- Access control: GitHub authentication and authorization
- Dependency scanning: GitHub Dependabot (weekly)

**Inherited Controls:**
- Repository access controls
- Code review processes
- Automated dependency vulnerability scanning

**Evidence:** See `level1/03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md`

---

## CMMC Level 1 Practices

**Total Practices:** 17

**Note:** CMMC Level 1 includes 17 practices aligned to FAR 52.204-21 (which contains 15 basic safeguarding requirements).

**Implementation Status:**
- **Implemented:** 13 practices (76.5%)
- **Inherited:** 4 practices (23.5%)
- **Not Implemented:** 0 practices

**Detailed Assessment:** See `level1/04-self-assessment/MAC-AUD-401_Internal_Cybersecurity_Self-Assessment.md`

**Practices Matrix:** See `level1/04-self-assessment/MAC-AUD-402_CMMC_L1_Practices_Matrix.md`

---

## Evidence Map

### Quick Links

**Policies & Procedures:**
- `level1/02-policies-and-procedures/` - All policy documents

**Self-Assessment:**
- `level1/04-self-assessment/MAC-AUD-401_Internal_Cybersecurity_Self-Assessment.md` - Detailed practice assessment
- `level1/04-self-assessment/MAC-AUD-402_CMMC_L1_Practices_Matrix.md` - Practices matrix with evidence

**Evidence:**
- `level1/05-evidence/MAC-RPT-100_Evidence_Index.md` - Evidence index
- `level1/05-evidence/evidence-index.md` - Comprehensive evidence index
- `level1/05-evidence/templates/` - Evidence templates
- `level1/05-evidence/sample-exports/` - Sample CSV exports

**System Documentation:**
- `level1/01-system-scope/MAC-IT-304_System_Security_Plan.md` - System Security Plan (SSP-lite)
- `level1/01-system-scope/MAC-IT-105_System_Boundary.md` - System boundary
- `level1/01-system-scope/MAC-SEC-302_FCI_Scope_and_Data_Boundary_Statement.md` - FCI scope

**Inherited Controls:**
- `level1/03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md` - Railway/GitHub inheritance

**Executive Attestation:**
- `level1/00-cover-memo/MAC-FRM-202_CMMC_Level_1_Executive_Attestation.md` - Executive attestation

---

## Key Features

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

**Location:** `level1/05-evidence/sample-exports/`

**Instructions:** See script documentation for redaction procedures before external sharing.

---

## Document Structure

```
compliance/cmmc/
├── README.md (this file)
└── level1/
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

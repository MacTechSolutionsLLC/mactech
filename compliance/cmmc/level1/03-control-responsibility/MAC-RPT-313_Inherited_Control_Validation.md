# Inherited Control Validation

**Document Version:** 1.0  
**Date:** 2026-01-22  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 1 (Foundational)  
**Reference:** FAR 52.204-21

**Applies to:** CMMC 2.0 Level 1 (FCI-only system)

---

## 1. Purpose

This document identifies **security controls inherited from third-party service providers** and documents how those controls are **validated through independent assurance artifacts** during CMMC Level 1 assessment.

This document serves as the primary **Basis of Evidence (BOE)** for inherited control validation by:

- Identifying third-party services that provide inherited security controls
- Documenting the independent assurance artifacts reviewed to validate those controls
- Establishing the validation methodology used to assess inherited control adequacy
- Providing a formal record of review activities

**Important:** Third-party assurance reports (SOC reports, ISO certificates, etc.) are **retained internally** and are **available upon request** subject to provider terms and non-disclosure agreements. This document itself constitutes the primary BOE for inherited control validation, documenting what was reviewed, when it was reviewed, and by whom.

---

## 2. Scope

This validation applies only to third-party services that provide **infrastructure and platform-level controls**:

- **Hosting:** Cloud hosting platform (Railway)
- **Source Control:** Source code repository platform (GitHub.com)
- **CI/CD Platforms:** Continuous integration and deployment platforms (integrated with hosting platform)

**Clarification:**

- **Application-level controls** remain the responsibility of MacTech Solutions and are not covered by this validation document
- **Inherited controls** are limited to infrastructure and platform layers where the organization relies on third-party providers
- This validation does not cover third-party services that do not provide security controls (e.g., external APIs consumed by the application)

---

## 3. Validation Methodology

The following process is used to validate inherited controls from third-party service providers:

### 3.1 Identification

Third-party services that provide inherited security controls are identified through:

- Review of system architecture and infrastructure components
- Analysis of shared responsibility models
- Documentation of service provider relationships

### 3.2 Assurance Artifact Review

For each identified third-party service, the following assurance artifacts are reviewed:

- **Independent third-party audit reports** (e.g., SOC 2 Type II, SOC 3, ISO/IEC 27001)
- **Publicly available security documentation** from the service provider
- **Service agreements and terms of service** that define security responsibilities

### 3.3 Coverage Period Confirmation

For each assurance artifact reviewed:

- **Coverage period** is confirmed to ensure the report covers the current assessment period
- **Report date** is documented to establish currency
- **Gap analysis** is performed if coverage period has expired or is approaching expiration

### 3.4 Annual Review Requirement

All inherited control validations are subject to **annual review** to ensure:

- Assurance artifacts remain current
- Service provider relationships remain active
- No material changes to inherited controls have occurred
- Coverage periods are still valid

### 3.5 Documentation

For each validation activity, the following is documented:

- **Reviewer name** and role
- **Review date**
- **Artifacts reviewed** (report type, provider, date)
- **Coverage period** confirmed
- **Validation outcome** (controls adequate, gaps identified, etc.)

**Note:** This methodology does **not** describe the internal controls of third-party providers. It documents the process used by MacTech Solutions to validate reliance on those controls.

---

## 4. Inherited Controls Summary Table

| Provider | Service Used | Controls Inherited | Assurance Artifact Reviewed | Coverage Period | Review Frequency | Owner |
|----------|--------------|-------------------|----------------------------|-----------------|------------------|-------|
| **GitHub.com** | Source code repository<br>Dependency scanning (Dependabot) | • Repository access controls<br>• Physical security of data centers<br>• Environmental protections<br>• Underlying infrastructure security<br>• Platform operational controls<br>• Code review workflow controls | • SOC 3 Report<br>• ISO/IEC 27001:2022 Certificate | Current (as of review date) | Annual | MacTech Solutions Compliance Team |
| **Railway** | Application hosting<br>PostgreSQL database hosting<br>CI/CD deployment | • Physical security of data centers<br>• Environmental protections<br>• Underlying infrastructure security<br>• Platform operational controls<br>• TLS/HTTPS termination<br>• Database encryption at rest | • Platform security documentation<br>• Service agreement terms | Current (as of review date) | Annual | MacTech Solutions Compliance Team |

### 4.1 GitHub.com Validation Details

**Service:** GitHub.com (github.com)  
**Usage:** Source code repository, dependency vulnerability scanning via Dependabot

**Assurance Artifacts Reviewed:**
- **SOC 3 Report:** Publicly available System and Organization Controls 3 report
- **ISO/IEC 27001:2022 Certificate:** Information security management system certification

**Note:** SOC 2 Type II reports are **not applicable** for GitHub.com usage as the organization does not use GitHub Enterprise. SOC 3 reports provide publicly available assurance for standard GitHub.com usage.

**Controls Inherited:**
- Physical security of GitHub data center facilities
- Environmental protections (temperature, humidity, fire suppression)
- Underlying infrastructure security (network, compute, storage)
- Platform operational controls (access management, monitoring, incident response)
- Repository access control infrastructure
- Code review workflow infrastructure

### 4.2 Railway Validation Details

**Service:** Railway (railway.app)  
**Usage:** Application hosting, PostgreSQL database hosting, automated CI/CD deployments

**Assurance Artifacts Reviewed:**
- Platform security documentation (publicly available)
- Service agreement terms and conditions
- Platform security features documentation

**Note:** Railway platform security capabilities are validated through publicly available documentation and service agreements. If Railway provides SOC 2 Type II or equivalent assurance reports, those are reviewed when available.

**Controls Inherited:**
- Physical security of Railway data center facilities
- Environmental protections (temperature, humidity, fire suppression)
- Underlying infrastructure security (network, compute, storage)
- Platform operational controls (access management, monitoring, incident response)
- TLS/HTTPS termination and certificate management
- Database encryption at rest (PostgreSQL service)

---

## 5. Shared Responsibility Statement

Inherited controls from third-party service providers do **not** relieve MacTech Solutions of responsibility for:

### 5.1 Application-Level Controls

- **User Access Control:** Authentication and authorization within the application
- **Authentication:** User identity verification (NextAuth.js implementation)
- **Audit Logging:** Security event logging and monitoring within the application
- **Data Handling:** FCI handling, processing, and protection within the application

### 5.2 Complementary User Entity Controls (CUECs)

Where applicable, **Complementary User Entity Controls (CUECs)** are reviewed and implemented:

- Configuration of third-party services (e.g., GitHub repository access settings)
- Application-level security controls that complement inherited controls
- User training and awareness related to third-party service usage
- Incident response procedures that account for third-party service dependencies

**Responsibility:** MacTech Solutions maintains responsibility for overall system security and FCI protection, even when relying on inherited controls from third-party providers.

---

## 6. Evidence Handling

### 6.1 Third-Party Assurance Reports

**Status:** Third-party assurance reports (SOC reports, ISO certificates, etc.) are **not attached** to this document.

**Storage:** Assurance reports are maintained internally in secure storage and are available for review during assessment activities.

**Availability:** Report availability is subject to:
- Provider terms of service
- Non-disclosure agreements (NDAs) where applicable
- Provider distribution policies

### 6.2 Review Records as BOE

**Primary Evidence:** Review records documented in this document constitute the **Basis of Evidence (BOE)** for inherited control validation, including:

- Documentation of which artifacts were reviewed
- Review dates and reviewer information
- Coverage period confirmations
- Validation outcomes

**Supporting Evidence:** When available and permitted by provider terms, copies of assurance reports may be retained internally for reference but are not required to be attached to this document.

---

## 7. Review and Maintenance

### 7.1 Annual Review Requirement

All inherited control validations are subject to **annual review** to ensure:

- Assurance artifacts remain current and valid
- Coverage periods are still applicable
- Service provider relationships remain active
- No material changes to inherited controls have occurred

### 7.2 Trigger Events

In addition to annual review, validation is triggered by:

- **Provider Change:** When a third-party service provider is changed or added
- **Service Change:** When new services are adopted from existing providers
- **Coverage Expiration:** When assurance artifact coverage periods expire
- **Material Changes:** When providers announce material changes to security controls or assurance programs

### 7.3 Responsible Role

**Owner:** MacTech Solutions Compliance Team  
**Reviewer:** Designated compliance personnel with appropriate access to review assurance artifacts  
**Approval:** Compliance review and approval process as defined in organizational procedures

---

## 8. Attestation

### 8.1 Validation Attestation

The undersigned attests that:

- Inherited controls from third-party service providers have been reviewed
- Independent assurance artifacts were current at the time of review
- Coverage periods were confirmed to be applicable
- No material gaps were identified that would prevent reliance on inherited controls for CMMC Level 1 compliance

### 8.2 Review Information

**Reviewer Name:** [To be completed]  
**Reviewer Role:** [To be completed]  
**Review Date:** [To be completed]  
**Next Review Date:** [To be completed - one year from review date]

**Signature (if applicable):** [To be completed]

---

## Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be completed]

**Change History:**
- Version 1.0 (2026-01-22): Initial document creation with inherited control validation methodology and summary table

---

## Related Documents

- Inherited Controls - Railway Platform Shared Responsibility (`Inherited_Controls_Railway.md`)
- Inherited Controls Appendix (`MAC-RPT-312_Inherited_Controls_Appendix.md`)
- Inherited Controls Responsibility Matrix (`MAC-RPT-311_Inherited_Controls_Responsibility_Matrix.md`)
- System Description (`../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md`)

---

**Document Status:** This document reflects the system state as of 2026-01-22 and is maintained under configuration control.

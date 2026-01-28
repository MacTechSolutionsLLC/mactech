# Inherited Controls Appendix - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-27  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2

**Applies to:** CMMC 2.0 Level 2 (FCI and CUI system)

---

## Purpose

This document identifies controls that are inherited from third-party service providers (Google Cloud Platform, Railway, and GitHub) and clarifies organizational responsibility for these controls.

**Important:** This document does not claim responsibility for the security posture of third-party providers. It documents what controls are inherited and where evidence can be found.

**Assessor-Grade Summary Statement:**

> **MacTech Solutions implements the majority of CMMC Level 2 controls internally.
> Limited infrastructure-level controls are inherited from Google Cloud Platform, Railway, and GitHub under the shared responsibility model.
> No cryptographic, identity, access control, logging, or CUI handling controls are inherited from third-party providers.**

---

## Google Cloud Platform (GCP) - CUI Vault Infrastructure

### Service Description

**Service Type:** Infrastructure as a Service (IaaS)  
**Service:** Google Compute Engine (GCE)  
**VM Name:** cui-vault-jamy  
**Purpose:** Dedicated CUI storage infrastructure

### Physical Protection (PE) - Fully Inherited

**Controls Inherited:** 3.10.1-3.10.6

**What is Inherited:**
- Data center physical access controls
- Environmental controls (temperature, humidity, fire suppression)
- Facility security (guards, surveillance, access logs)
- Redundant power and cooling systems
- Physical infrastructure security
- Physical access monitoring and logging

**Organizational Responsibility:**
- Organization relies on GCP for physical security of CUI vault infrastructure
- Organization does not claim responsibility for GCP's physical security posture
- Organization documents GCP's physical security as inherited control

**Evidence Locations:**
- GCP data center physical security documentation
- GCP compliance certifications (SOC 2, ISO 27001)
- Screenshots: `05-evidence/provider/gcp/`

**What is NOT Inherited from GCP:**
- AC, AU, IA (OS users), FIPS crypto, logging, patching, sshd, database security, CUI handling - These are customer-implemented

---

### System and Communications Protection (SC) - Partially Inherited

#### 3.13.1 - Monitor/control/protect communications

**What is Inherited:**
- Cloud perimeter security
- Infrastructure-level network security

**What is Customer-Implemented:**
- VM/network configuration
- Application-layer controls (middleware.ts HTTPS enforcement, next.config.js, security headers)

**Status:** ⚠️ Partially Satisfied

#### 3.13.5 - Implement subnetworks

**What is Inherited:**
- VPC/hypervisor separation
- Infrastructure-level network segmentation

**What is Customer-Implemented:**
- VM network configuration
- Application-level network controls

**Status:** ⚠️ Partially Satisfied

#### 3.13.6 - Deny-by-default network communications

**What is Inherited:**
- Infrastructure routing controls
- GCP VPC firewall rules

**What is Customer-Implemented:**
- VM firewall configuration (UFW)
- Application-level access controls

**Status:** ⚠️ Partially Satisfied

#### 3.13.9 - Terminate network connections

**What is Inherited:**
- Fabric-level connection management
- Infrastructure session termination

**What is Customer-Implemented:**
- VM session management
- Application-level session controls

**Status:** ⚠️ Partially Satisfied

#### 3.13.15 - Protect authenticity of communications

**What is Inherited:**
- TLS certificate validation at infrastructure level
- GCP-managed TLS certificates

**What is Customer-Implemented:**
- Application-level TLS configuration
- Certificate management procedures

**Status:** ⚠️ Partially Satisfied

---

## Railway Platform - Main Application Hosting (non-CUI)

### Service Description

**Service Type:** Platform as a Service (PaaS)  
**Services Provided:**
- Application hosting (Next.js application)
- Database hosting (PostgreSQL managed service - **non-CUI only**)
- TLS/HTTPS termination
- Network infrastructure

**Important Constraint:**
- **No CUI is stored or processed on Railway**
- **No FIPS claims are inherited from Railway**

### System and Communications Protection (SC) - Partially Inherited

#### 3.13.8 - Cryptographic mechanisms for CUI in transit

**What is Inherited:**
- Platform TLS/HTTPS termination (**non-CUI only**)
- Certificate management for non-CUI application

**What is Customer-Implemented:**
- CUI vault TLS (GCP, FIPS-validated)
- Application-layer encryption controls

**Status:** ⚠️ Partially Satisfied (Platform TLS only, non-CUI)

**Note:** CUI in transit is protected by customer-implemented FIPS-validated cryptography on GCP, not Railway.

#### 3.13.1 - Monitor/control/protect communications

**What is Inherited:**
- Edge routing/load balancing
- Platform-level network security (**non-CUI only**)

**What is Customer-Implemented:**
- Application-layer controls
- CUI vault network security (GCP)

**Status:** ⚠️ Partially Satisfied

#### 3.13.5 - Implement subnetworks

**What is Inherited:**
- Logical app/db separation
- Platform-level network segmentation (**non-CUI only**)

**What is Customer-Implemented:**
- Application architecture
- CUI vault network segmentation (GCP)

**Status:** ⚠️ Partially Satisfied

#### 3.13.9 - Terminate network connections

**What is Inherited:**
- Platform session handling
- Infrastructure-level connection management (**non-CUI only**)

**What is Customer-Implemented:**
- Application session management
- CUI vault connection controls (GCP)

**Status:** ⚠️ Partially Satisfied

---

### What is NOT Inherited from Railway

The following controls are **NOT** inherited from Railway and are implemented by the organization:

1. **3.1.13 - Cryptographic remote access** - Customer implements TLS 1.3 (CUI vault FIPS-validated), SSH key-based authentication (Google VM)
2. **3.1.14 - Managed access control points** - Customer implements GCP VPC firewall (CUI vault), Railway edge routing (non-CUI app)
3. **3.3.7 - System clock synchronization** - Customer implements NTP configuration (Google VM)
4. **3.4.7 - Restrict nonessential programs** - Customer implements VM-specific program restrictions (Google VM)
5. **3.8.6 - Cryptographic protection on digital media** - Customer implements database encryption (CUI vault GCP), not Railway
6. **Database encryption for CUI** - CUI is stored on GCP, not Railway. Railway PostgreSQL is non-CUI only.
7. **FIPS-validated cryptography** - No FIPS claims are inherited from Railway
8. **CUI handling** - No CUI is stored or processed on Railway

---

## GitHub Platform - Source Code Repository

### Service Description

**Service Type:** Software Development Platform  
**Services Provided:**
- Source code repository
- Version control
- Access controls
- Dependency scanning (Dependabot)
- Audit history

### Physical Protection (PE) - Fully Inherited

**Controls Inherited:** 3.10.1-3.10.6

**What is Inherited:**
- GitHub data center physical access controls
- Environmental controls (temperature, humidity, fire suppression)
- Facility security (guards, surveillance, access logs)
- Redundant power and cooling systems
- Physical infrastructure security

**Organizational Responsibility:**
- Organization relies on GitHub for physical security of source code repository
- Organization does not claim responsibility for GitHub's physical security posture
- Organization documents GitHub's physical security as inherited control

**Evidence Locations:**
- GitHub SOC 3 Report
- GitHub ISO/IEC 27001:2022 Certificate
- Screenshots: `05-evidence/provider/github/`

---

### System and Communications Protection (SC) - Partially Inherited

#### 3.13.1 - Monitor/control/protect communications

**What is Inherited:**
- Platform edge security
- Infrastructure-level network protection

**What is Customer-Implemented:**
- Repository access controls
- Code security practices

**Status:** ⚠️ Partially Satisfied

---

### Identification and Authentication (IA) - Partially Inherited

#### 3.5.2 - Authenticate users

**What is Inherited:**
- GitHub org-level MFA
- Platform account authentication

**What is Customer-Implemented:**
- Application authentication (NextAuth.js)
- User account management

**Status:** ⚠️ Partially Satisfied (GitHub org-level MFA)

---

### Configuration Management (CM) - Partially Inherited

#### 3.4.8 - Software restriction policy

**What is Inherited:**
- Branch protection
- Repository integrity controls
- Code review workflow controls

**What is Customer-Implemented:**
- Software restriction policy
- Approved software inventory
- Application-level controls

**Status:** ⚠️ Partially Satisfied (Branch protection)

---

### What is NOT Inherited from GitHub

The following controls are **NOT** inherited from GitHub and are implemented by the organization:

1. **Code quality** - Organization implements code review processes
2. **Secrets handling** - Organization manages secrets securely
3. **Secure development practices** - Organization implements secure coding standards
4. **CI/CD security decisions** - Organization configures CI/CD security

---

## What is NOT Inherited (Customer-Implemented)

The following controls are **NOT** inherited and are implemented by the organization:

1. **Access Control (AC)** - All AC controls are customer-implemented
2. **Audit and Accountability (AU)** - All AU controls are customer-implemented (except 3.3.7 NTP on VM)
3. **Identification and Authentication (IA)** - All IA controls are customer-implemented (except 3.5.2 partial GitHub MFA)
4. **Cryptographic controls** - All cryptographic controls are customer-implemented (FIPS-validated on GCP)
5. **Logging** - All logging controls are customer-implemented
6. **Patching** - All patching controls are customer-implemented
7. **Database security** - All database security controls are customer-implemented
8. **CUI handling** - All CUI handling controls are customer-implemented

---

## Evidence Storage

### Google Cloud Platform Evidence

**Location:** `05-evidence/provider/gcp/`

**What to Capture:**
- GCP data center physical security documentation
- GCP compliance certifications (SOC 2, ISO 27001)
- VPC firewall configuration screenshots
- VM security configuration evidence

**Tenant-Specific Configuration Evidence:**
- GCP project configuration
- VPC network configuration
- VM security settings
- Disk encryption settings

**Instructions:** See `05-evidence/provider/gcp/.gitkeep` for detailed capture instructions.

### Railway Evidence

**Location:** `05-evidence/provider/railway/`

**What to Capture:**
- TLS/HTTPS configuration screenshots (**non-CUI only**)
- Platform security feature documentation
- Network configuration screenshots

**Tenant-Specific Configuration Evidence:**
- Railway project configuration showing HTTPS/TLS enabled (**non-CUI only**)
- PostgreSQL service configuration (**non-CUI only**)
- Environment variables configuration (redacted - secure configuration documented)
- Platform security features active status

**Important:** Railway evidence does NOT include CUI-related controls. CUI is stored on GCP, not Railway.

**Instructions:** See `05-evidence/provider/railway/.gitkeep` for detailed capture instructions.

### GitHub Evidence

**Location:** `05-evidence/provider/github/`

**What to Capture:**
- Dependabot configuration screenshots
- Security advisory screenshots
- Repository access control documentation
- Branch protection rules
- GitHub org MFA configuration

**Tenant-Specific Configuration Evidence:**
- Repository access controls (collaborators, roles)
- Branch protection rules
- Dependabot active status and configuration
- Security advisories and Dependabot PR history
- GitHub org-level MFA status

**Instructions:** See `05-evidence/provider/github/.gitkeep` for detailed capture instructions.

---

## Responsibility Matrix

| Control | Provider | Organization Responsibility | Evidence Location |
|---------|----------|----------------------------|-------------------|
| Physical data center security (CUI vault) | GCP | Document as inherited | GCP docs, compliance certs, screenshots (`05-evidence/provider/gcp/`) |
| Physical data center security (source code) | GitHub | Document as inherited | GitHub SOC 3, ISO cert, screenshots (`05-evidence/provider/github/`) |
| VPC network segmentation (CUI vault) | GCP | Configure VM network, document tenant config | GCP VPC config, VM network settings |
| TLS/HTTPS termination (non-CUI app) | Railway | Enforce HTTPS redirect, document tenant config | Railway dashboard, middleware.ts, tenant screenshots |
| Database encryption (CUI vault) | GCP | Configure database encryption, document tenant config | GCP disk encryption, database encryption evidence |
| Database hosting (non-CUI) | Railway | Use Railway PostgreSQL, document tenant config | Railway dashboard, tenant-specific screenshots |
| Repository access controls | GitHub | Manage access, document tenant config | GitHub settings, screenshots (`05-evidence/provider/github/`) |
| Branch protection | GitHub | Configure rules, document tenant config | GitHub branch protection settings, screenshots |
| GitHub org MFA | GitHub | Enable org-level MFA, document tenant config | GitHub org settings, MFA configuration screenshots |
| Dependency vulnerability scanning | GitHub | Review and merge PRs, document activity | Dependabot dashboard, .github/, screenshots |
| Application authentication | N/A | Implemented in application | lib/auth.ts, audit log exports |
| Application authorization | N/A | Implemented in application | middleware.ts, lib/authz.ts |
| Security event logging | N/A | Implemented in application | /admin/events, sample exports |
| CUI handling | N/A | Implemented in application | CUI vault (GCP), access controls |

---

## Provider Documentation Availability

**Third-Party Assurance:** Inherited controls are validated via third-party assurance reports maintained by the hosting providers. These artifacts are reviewed annually and available upon request.

**Google Cloud Platform:**
- SOC 2 Type II reports
- ISO/IEC 27001:2022 certification
- FedRAMP authorization (where applicable)
- GCP security documentation

**Railway:**
- Platform security documentation
- Service agreement terms
- Platform security features documentation

**GitHub:**
- SOC 3 Report (publicly available)
- ISO/IEC 27001:2022 Certificate
- GitHub security documentation

Provider security documentation and evidence are available upon request. The organization reviews GCP, Railway, and GitHub platform security documentation annually and monitors platform status and security announcements.

---

## Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2027-01-27

**Change History:**
- Version 2.0 (2026-01-27): Complete rewrite to align with assessor-defensible inheritance matrix. Added GCP section, updated Railway section (removed CUI-related claims), updated GitHub section, added assessor-grade summary statement.
- Version 1.0 (2026-01-21): Initial document creation

---

**Document Status:** This document reflects the system state as of 2026-01-27 and is maintained under configuration control.

---

## Related Documents

- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- Control Inheritance Reassessment Report: `../04-self-assessment/MAC-AUD-417_Control_Inheritance_Reassessment_Report.md`
- Inherited Controls Validation: `MAC-RPT-313_Inherited_Control_Validation.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- Google VM Control Mapping: `../01-system-scope/MAC-IT-307_Google_VM_Control_Mapping.md`

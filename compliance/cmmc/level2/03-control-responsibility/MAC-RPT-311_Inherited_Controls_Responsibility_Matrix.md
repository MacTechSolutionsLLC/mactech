# Inherited Controls Responsibility Matrix - CMMC Level 1

**Document Version:** 1.0  
**Date:** 2026-01-21  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 1 (Foundational)  
**Reference:** FAR 52.204-21

**Applies to:** CMMC 2.0 Level 1 (FCI-only system)

---

## 1. Purpose

This document establishes the responsibility matrix for inherited controls, clearly defining which controls are provided by service providers (Railway, GitHub) and which controls are the organization's responsibility. This matrix supports accurate assessment of control ownership and compliance responsibility.

---

## 2. Responsibility Categories

### 2.1 Provider Responsibility

Controls provided and managed by service providers (Railway, GitHub). The organization relies on these controls operationally but does not independently assess them as part of this CMMC Level 1 self-assessment.

### 2.2 Organization Responsibility

Controls implemented and managed by the organization. The organization is responsible for implementation, operation, and evidence of these controls.

---

## 3. Inherited Controls Responsibility Matrix

| Control | Provider | Organization Responsibility | Evidence Location | Assessment Status |
|---------|----------|----------------------------|-------------------|-------------------|
| **TLS/HTTPS Encryption** | Railway | Reliance only | Railway platform dashboard<br>Browser HTTPS indicator | Relied upon operationally, not independently assessed |
| **Physical Security** | Railway | Reliance only | Railway platform documentation | Relied upon operationally, not independently assessed |
| **Infrastructure Security** | Railway | Reliance only | Railway platform<br>Network security settings | Relied upon operationally, not independently assessed |
| **Database Security** | Railway | Reliance only | Railway PostgreSQL service | Relied upon operationally, not independently assessed |
| **Malware Protection (Infrastructure)** | Railway | Reliance only | Railway platform security features | Relied upon operationally, not independently assessed |
| **Source Code Storage** | GitHub | Reliance only | GitHub repository | Relied upon operationally, not independently assessed |
| **Application Authentication** | N/A | Full responsibility | `lib/auth.ts`<br>`middleware.ts`<br>AppEvent table | Implemented and operating |
| **Role-Based Access Control** | N/A | Full responsibility | `lib/authz.ts`<br>`middleware.ts`<br>User.role field | Implemented and operating |
| **Password Policy** | N/A | Full responsibility | `lib/password-policy.ts`<br>`app/api/auth/change-password/route.ts` | Implemented and operating |
| **Physical Access Logging** | N/A | Full responsibility | `app/admin/physical-access-logs/page.tsx`<br>Database: `PhysicalAccessLog` table | Implemented and operating |
| **Vulnerability Management** | GitHub (Dependabot) | Partial responsibility | `.github/dependabot.yml`<br>`package.json`<br>npm audit | Implemented and operating |
| **Incident Response** | N/A | Full responsibility | `MAC-POL-215_Incident_Response_Policy.md`<br>Security contact | Implemented and operating |
| **FCI Handling** | N/A | Full responsibility | Policies and procedures<br>User acknowledgments | Implemented and operating |
| **Access Control Policies** | N/A | Full responsibility | Policy documents<br>Implementation code | Implemented and operating |

---

## 4. Detailed Responsibility Breakdown

### 4.1 Railway Platform Controls

**Provider Responsibility:**
- TLS/HTTPS encryption configuration and management
- Physical security of data centers
- Infrastructure-level security capabilities
- Database security capabilities
- Platform-level malware protection

**Organization Responsibility:**
- Reliance on Railway platform capabilities
- Operational use of Railway services
- Documentation of reliance (not independent assessment)

**Assessment Approach:**
- Security capabilities are relied upon operationally from Railway but are not independently assessed as part of this CMMC Level 1 self-assessment
- Organization does not claim responsibility for Railway's security implementation
- Organization acknowledges reliance on Railway for inherited controls

### 4.2 GitHub Platform Controls

**Provider Responsibility:**
- Source code repository security
- Repository access controls
- Physical security of GitHub infrastructure

**Organization Responsibility:**
- Repository access management
- Code security practices
- Dependency vulnerability awareness (Dependabot)

**Assessment Approach:**
- Repository security capabilities are relied upon operationally from GitHub but are not independently assessed
- Organization manages repository access and code security
- Dependabot vulnerability scanning is implemented and operating

### 4.3 Organization-Implemented Controls

**Full Organization Responsibility:**
- Application authentication and authorization
- Password policy and management
- Physical access logging
- Incident response procedures
- FCI handling and protection
- Access control policies
- User training and awareness

**Assessment Approach:**
- All organization-implemented controls are assessed as part of this self-assessment
- Evidence is available for all organization-implemented controls
- Controls are implemented and operating

---

## 5. Responsibility Transfer Limitations

### 5.1 No Responsibility Transfer

**Statement:** The organization does not claim that responsibility for inherited controls is transferred to service providers. The organization acknowledges reliance on service providers but maintains responsibility for overall system security and FCI protection.

**Organization Position:**
- Organization is responsible for ensuring that inherited controls are adequate for CMMC Level 1 compliance
- Organization does not claim responsibility for service provider security posture
- Organization relies on service providers operationally but does not independently assess their controls

### 5.2 Reliance Documentation

**Documentation Requirements:**
- Inherited controls are documented in Inherited Control Statement Railway (`MAC-SEC-310_Inherited_Control_Statement_Railway.md`)
- Inherited controls matrix documents control ownership (`MAC-RPT-102_Inherited_Controls_Matrix.md`)
- This responsibility matrix clarifies responsibility boundaries

---

## 6. Compliance Assessment

### 6.1 Inherited Controls Assessment

**Assessment Status:** Relied upon operationally, not independently assessed

**Rationale:**
- CMMC Level 1 self-attestation focuses on organization-implemented controls
- Inherited controls are documented and relied upon operationally
- Organization does not independently verify service provider controls
- Security capabilities are relied upon but not claimed as independently assessed

### 6.2 Organization Controls Assessment

**Assessment Status:** Implemented and operating

**Rationale:**
- All organization-implemented controls are assessed as part of self-assessment
- Evidence is available for all organization controls
- Controls are documented in policies and procedures
- Implementation is verified through code review and testing

---

## 7. Related Documents

- Inherited Control Statement Railway (`MAC-SEC-310_Inherited_Control_Statement_Railway.md`)
- Inherited Controls Matrix (`MAC-RPT-102_Inherited_Controls_Matrix.md`)
- Inherited Controls Appendix (`MAC-RPT-312_Inherited_Controls_Appendix.md`)
- System Description (`../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md`)

---

## 8. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be completed]

**Change History:**
- Version 1.0 (2026-01-21): Initial document creation

---

**Document Status:** This document reflects the system state as of 2026-01-21 and is maintained under configuration control.

---

# Inherited Control Statement - Google Cloud Platform Physical Security

**Document Version:** 1.0  
**Date:** 2026-01-28  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.10 (Physical Protection)

**Applies to:** CMMC 2.0 Level 2 (FCI and CUI system)

---

## 1. Purpose

This document clearly states which physical security controls are inherited from Google Cloud Platform (GCP) and establishes the organization's reliance on GCP for these controls. This statement addresses assessor concerns regarding substantiation of inherited controls and avoids overclaims about GCP's compliance posture.

**Key Principle:** For inherited physical security controls, MacTech Solutions does NOT provide its own physical evidence. Instead, we provide provider attestation/documentation, explicit inheritance statements, boundary clarification, and customer responsibility acknowledgment.

---

## 2. Google Cloud Platform Overview

**Platform:** Google Cloud Platform (GCP) is an Infrastructure-as-a-Service (IaaS) provider that hosts the CUI Vault infrastructure.

**Services Used:**
- Google Compute Engine (GCE) - Virtual machine hosting
- CUI Vault VM: `cui-vault-jamy`
- Data center physical infrastructure
- Physical security controls

**Contractual Relationship:** Organization has a service agreement with Google Cloud Platform for cloud infrastructure services.

**System Boundary:** The CUI Vault system operates on GCP infrastructure. Physical security controls for the data centers hosting this infrastructure are provided by GCP.

---

## 3. Inherited Physical Security Controls

The following physical security controls are **inherited** from Google Cloud Platform. The organization **relies on GCP** for these controls but **does not claim responsibility for GCP's physical security posture**.

### 3.1 Control 3.10.1 - Limit Physical Access

**Control:** Limit physical access to authorized users, processes acting on behalf of authorized users, and devices (including other systems).

**GCP Implementation:**
- GCP data centers implement badge-based access controls
- Physical access is restricted to authorized GCP personnel only
- Least-privilege physical access principles are applied
- Physical access is logged and monitored
- Multi-factor authentication for physical access (badge + biometric or PIN)

**Organization Reliance:**
- Organization relies on GCP for physical access controls to data centers hosting CUI
- Organization does not have physical access to GCP data centers
- Organization does not manage physical access devices or access logs
- Organization does not claim responsibility for GCP's physical access control implementation

**Status:** Inherited control from Google Cloud Platform.

**Evidence:** GCP physical security documentation, GCP Security Whitepaper, GCP SOC 2 Type II reports, GCP ISO 27001 certifications. See individual control evidence files for specific references.

**Third-Party Assurance:** Inherited controls are validated via third-party assurance reports (SOC 2 Type II, ISO 27001) maintained by GCP. These artifacts are reviewed annually and available upon request.

---

### 3.2 Control 3.10.2 - Protect and Monitor Facility

**Control:** Protect and monitor the physical facility and support infrastructure for organizational systems.

**GCP Implementation:**
- GCP data centers are protected by physical security controls
- Continuous monitoring through surveillance systems (CCTV)
- On-site security personnel (24/7)
- Environmental monitoring (temperature, humidity, fire suppression)
- Redundant power and cooling systems
- Intrusion detection systems
- Perimeter security controls

**Organization Reliance:**
- Organization relies on GCP for facility protection and monitoring
- Organization does not have physical access to monitor facilities
- Organization does not manage surveillance systems or security personnel
- Organization does not claim responsibility for GCP's facility protection implementation

**Status:** Inherited control from Google Cloud Platform.

**Evidence:** GCP Infrastructure Security documentation, GCP Security Whitepaper, GCP compliance certifications. See individual control evidence files for specific references.

**Third-Party Assurance:** Inherited controls are validated via third-party assurance reports maintained by GCP. These artifacts are reviewed annually and available upon request.

---

### 3.3 Control 3.10.3 - Escort and Monitor Visitors

**Control:** Escort visitors and monitor visitor activity.

**GCP Implementation:**
- GCP data centers implement visitor registration procedures
- All visitors are escorted by authorized GCP personnel
- Visitor access is logged and monitored
- Visitor badges are issued and collected
- Visitor activity is tracked and recorded
- Visitor access is restricted to designated areas

**Organization Reliance:**
- Organization relies on GCP for visitor escort and monitoring procedures
- Organization does not have physical access to manage visitors
- Organization does not maintain visitor logs or escort records
- Organization does not claim responsibility for GCP's visitor management implementation

**Status:** Inherited control from Google Cloud Platform.

**Evidence:** GCP visitor access policy documentation, GCP physical security procedures, GCP compliance certifications. See individual control evidence files for specific references.

**Third-Party Assurance:** Inherited controls are validated via third-party assurance reports maintained by GCP. These artifacts are reviewed annually and available upon request.

---

## 4. Customer Responsibility Clarification

### 4.1 What MacTech Solutions Does NOT Provide

**Physical Access Controls:**
- MacTech Solutions personnel do NOT have physical access to GCP data centers
- MacTech Solutions does NOT maintain badge logs or access logs
- MacTech Solutions does NOT manage physical access devices

**Facility Protection:**
- MacTech Solutions does NOT monitor GCP data center facilities
- MacTech Solutions does NOT manage surveillance systems
- MacTech Solutions does NOT employ security personnel at data centers

**Visitor Management:**
- MacTech Solutions does NOT escort visitors to GCP data centers
- MacTech Solutions does NOT maintain visitor logs
- MacTech Solutions does NOT manage visitor access procedures

### 4.2 What MacTech Solutions DOES Provide

**Documentation:**
- Explicit inheritance statements (this document and individual control evidence files)
- References to GCP provider documentation
- Boundary clarification between GCP responsibility and customer responsibility

**Policy:**
- Physical Security Policy (MAC-POL-212) that acknowledges inheritance from GCP
- System Security Plan sections that document inherited controls

**Evidence:**
- Provider attestation documentation references
- Third-party assurance report references
- Inheritance validation documentation

---

## 5. Provider Documentation References

The following GCP documentation provides evidence of physical security controls:

### 5.1 Primary Documentation Sources

1. **GCP Security Whitepaper**
   - Location: Google Cloud Security Whitepaper (publicly available)
   - Sections: Physical Security, Data Center Security
   - Provides: Overview of GCP physical security controls

2. **GCP Infrastructure Security Documentation**
   - Location: Google Cloud Infrastructure Security documentation
   - Provides: Detailed information about data center physical security

3. **GCP SOC 2 Type II Reports**
   - Location: GCP Trust Center (available to customers)
   - Provides: Third-party attestation of physical security controls
   - Coverage: Annual reports covering physical security controls

4. **GCP ISO 27001 Certification**
   - Location: GCP Trust Center
   - Provides: International standard certification including physical security
   - Coverage: ISO 27001:2013 certification

5. **GCP Trust Center**
   - Location: https://cloud.google.com/security/trust-center
   - Provides: Compliance certifications and security documentation
   - Includes: Physical security information

### 5.2 Documentation Storage

**Internal Storage:** Copies of GCP documentation (SOC 2 reports, ISO certificates) are maintained internally in secure storage and are available for review during assessment activities.

**Availability:** Documentation availability is subject to:
- GCP terms of service
- Non-disclosure agreements (NDAs) where applicable
- GCP distribution policies

**Review Records:** Review records documented in individual control evidence files constitute the Basis of Evidence (BOE) for inherited control validation.

---

## 6. Inherited Control Matrix

| Control | Inherited From | Organization Responsibility | Evidence Location |
|---------|----------------|----------------------------|-------------------|
| 3.10.1 - Limit physical access | GCP | Reliance only | GCP physical security documentation, MAC-RPT-141 |
| 3.10.2 - Protect and monitor facility | GCP | Reliance only | GCP infrastructure security documentation, MAC-RPT-142 |
| 3.10.3 - Escort and monitor visitors | GCP | Reliance only | GCP visitor access policy documentation, MAC-RPT-143 |

**Note:** "Reliance only" means organization relies on GCP for the control but does not claim responsibility for GCP's implementation.

---

## 7. Limitations and Disclaimers

### 7.1 No Compliance Certification Claims

**Statement:** This document does not claim that GCP holds any specific compliance certifications beyond what is documented in GCP's publicly available documentation. MacTech Solutions relies on GCP for inherited controls but does not claim GCP's compliance certifications as organization certifications.

**Organization Position:** Organization relies on GCP for inherited controls but does not claim GCP's compliance certifications as organization certifications.

### 7.2 Responsibility Transfer

**Statement:** Organization does not claim that responsibility for inherited controls is transferred to GCP. Organization acknowledges reliance on GCP but maintains responsibility for overall system security and CUI protection.

**Organization Position:** Organization is responsible for ensuring that inherited controls are adequate for CMMC Level 2 compliance, but does not claim responsibility for GCP's physical security posture.

### 7.3 Service Agreement

**Statement:** Organization's reliance on GCP is based on service agreement and GCP's platform capabilities. Organization does not have direct control over GCP's physical security implementation.

**Organization Position:** Organization monitors GCP platform status and security but does not manage GCP's physical security controls directly.

---

## 8. Related Documents

- Inherited Controls Appendix: `MAC-RPT-312_Inherited_Controls_Appendix.md`
- Physical Security Policy: `../02-policies-and-procedures/MAC-POL-212_Physical_Security_Policy.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.8)
- Control 3.10.1 Evidence: `../05-evidence/MAC-RPT-141_3_10_1_Inherited_Physical_Access_Evidence.md`
- Control 3.10.2 Evidence: `../05-evidence/MAC-RPT-142_3_10_2_Inherited_Facility_Protection_Evidence.md`
- Control 3.10.3 Evidence: `../05-evidence/MAC-RPT-143_3_10_3_Inherited_Visitor_Controls_Evidence.md`

---

## 9. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-28

**Change History:**
- Version 1.0 (2026-01-28): Initial document creation to address inherited physical security control evidence requirements

---

## Appendix A: GCP Platform Information

**Platform:** Google Cloud Platform (cloud.google.com)  
**Services Used:** Google Compute Engine (GCE) for CUI Vault infrastructure  
**VM Instance:** cui-vault-jamy  
**Service Agreement:** Google Cloud Platform Terms of Service

**Note:** This document describes organization's reliance on Google Cloud Platform for physical security controls. For GCP's specific security capabilities and certifications, refer to GCP's publicly available documentation at https://cloud.google.com/security/trust-center.

# Inherited Physical Access Control Evidence - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-28  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.10.1

**Control ID:** 3.10.1  
**Requirement:** Limit physical access to authorized users, processes acting on behalf of authorized users, and devices (including other systems).

---

## 1. Evidence Summary

This document provides evidence of inheritance for control 3.10.1: Limit physical access. Physical access controls for systems hosting CUI are inherited from Google Cloud Platform.

**Implementation Status:** 🔄 Inherited from Google Cloud Platform

---

## 2. Inheritance Statement

**Explicit Inheritance Statement:**

> Physical access to systems hosting CUI is restricted by Google Cloud Platform to authorized personnel only. GCP implements badge-based access controls, least-privilege physical access, and access logging. MacTech Solutions inherits physical access controls from GCP.

**What GCP Provides:**
- Badge-based physical access controls
- Least-privilege physical access principles
- Physical access logging and monitoring
- Multi-factor authentication for physical access (badge + biometric or PIN)
- Access control to data center facilities
- Physical access device management

**What MacTech Solutions Does NOT Provide:**
- MacTech Solutions personnel do NOT have physical access to GCP data centers
- MacTech Solutions does NOT maintain badge logs or access logs
- MacTech Solutions does NOT manage physical access devices
- MacTech Solutions does NOT control physical access to data centers

---

## 3. Provider Documentation References

### 3.1 GCP Security Whitepaper

**Document:** Google Cloud Security Whitepaper  
**Location:** https://cloud.google.com/security/whitepaper  
**Relevant Sections:**
- Physical Security
- Data Center Security
- Access Controls

**Key Content:**
- GCP data centers implement badge-based access controls
- Physical access is restricted to authorized GCP personnel
- Access is logged and monitored
- Multi-factor authentication for physical access

**Status:** Publicly available documentation

---

### 3.2 GCP Infrastructure Security Documentation

**Document:** Google Cloud Infrastructure Security  
**Location:** GCP Trust Center and GCP documentation  
**Relevant Sections:**
- Data Center Physical Security
- Access Control Procedures
- Physical Security Controls

**Key Content:**
- Detailed information about physical access controls
- Badge management procedures
- Access logging and monitoring

**Status:** Available through GCP Trust Center

---

### 3.3 GCP SOC 2 Type II Reports

**Document:** GCP SOC 2 Type II Attestation Reports  
**Location:** GCP Trust Center (available to customers)  
**Relevant Sections:**
- Physical Security Controls
- Access Control Procedures
- Monitoring and Logging

**Key Content:**
- Third-party attestation of physical access controls
- Annual coverage of physical security controls
- Access control validation

**Status:** Available to GCP customers through Trust Center

**Review:** Reviewed annually as part of inherited control validation

---

### 3.4 GCP ISO 27001 Certification

**Document:** GCP ISO 27001:2013 Certification  
**Location:** GCP Trust Center  
**Relevant Sections:**
- A.11.1.1 - Physical and environmental security
- A.11.2.1 - Equipment siting and protection
- A.11.2.3 - Supporting utilities

**Key Content:**
- International standard certification including physical access controls
- Physical security control validation
- Access control procedures

**Status:** Available through GCP Trust Center

---

### 3.5 GCP Trust Center

**Location:** https://cloud.google.com/security/trust-center  
**Provides:**
- Compliance certifications
- Security documentation
- Physical security information
- Access to SOC 2 and ISO 27001 reports

**Status:** Publicly available

---

## 4. Customer Responsibility Clarification

### 4.1 What MacTech Solutions Is NOT Responsible For

**Physical Access Management:**
- MacTech Solutions does NOT manage physical access to GCP data centers
- MacTech Solutions does NOT maintain physical access logs
- MacTech Solutions does NOT issue or manage access badges
- MacTech Solutions does NOT control who has physical access to data centers

**Access Control Operations:**
- MacTech Solutions does NOT operate physical access control systems
- MacTech Solutions does NOT monitor physical access in real-time
- MacTech Solutions does NOT manage access control devices

### 4.2 What MacTech Solutions IS Responsible For

**Documentation:**
- Documenting inheritance of physical access controls from GCP
- Maintaining references to GCP provider documentation
- Clarifying boundary between GCP responsibility and customer responsibility

**Policy:**
- Physical Security Policy (MAC-POL-212) acknowledges inheritance from GCP
- System Security Plan documents inherited controls

**Validation:**
- Reviewing GCP documentation annually
- Validating that inherited controls meet CMMC Level 2 requirements
- Maintaining evidence of inheritance

---

## 5. Boundary Clarification

**System Boundary:** The CUI Vault system operates on Google Cloud Platform infrastructure. Physical access controls for the data centers hosting this infrastructure are provided by GCP.

**Responsibility Boundary:**
- **GCP Responsibility:** Physical access controls to data center facilities, badge management, access logging, physical security operations
- **MacTech Solutions Responsibility:** Application-level security controls, logical access controls, user authentication and authorization

**No Overlap:** MacTech Solutions does not have physical access to GCP data centers and therefore cannot provide physical access control evidence.

---

## 6. Third-Party Assurance

**Assurance Method:** Inherited controls are validated via third-party assurance reports maintained by GCP:
- SOC 2 Type II reports (annual)
- ISO 27001:2013 certification
- GCP Security Whitepaper
- GCP Infrastructure Security documentation

**Review Process:**
- GCP documentation is reviewed annually
- SOC 2 and ISO 27001 reports are reviewed as part of inherited control validation
- Review records are maintained in this document and related documentation

**Availability:** Assurance reports are available through GCP Trust Center and are maintained internally for assessment purposes.

---

## 7. Related Documents

- GCP Inherited Control Statement: `../03-control-responsibility/MAC-SEC-311_Inherited_Control_Statement_GCP_Physical_Security.md`
- Physical Security Policy: `../02-policies-and-procedures/MAC-POL-212_Physical_Security_Policy.md`
- Inherited Controls Appendix: `../03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.8, 3.10.1)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 8. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-28

**Change History:**
- Version 1.0 (2026-01-28): Initial evidence document creation for inherited physical access control

---

## Appendix A: GCP Documentation Links

- GCP Security Whitepaper: https://cloud.google.com/security/whitepaper
- GCP Trust Center: https://cloud.google.com/security/trust-center
- GCP Infrastructure Security: Available through GCP Trust Center
- GCP SOC 2 Reports: Available to customers through GCP Trust Center
- GCP ISO 27001 Certification: Available through GCP Trust Center

**Note:** GCP documentation is subject to GCP's terms of service and may require customer account access for certain documents (e.g., SOC 2 reports).

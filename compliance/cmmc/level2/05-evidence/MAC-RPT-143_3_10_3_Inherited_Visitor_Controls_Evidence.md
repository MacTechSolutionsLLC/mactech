# Inherited Visitor Escort and Monitoring Evidence - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-28  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.10.3

**Control ID:** 3.10.3  
**Requirement:** Escort visitors and monitor visitor activity.

---

## 1. Evidence Summary

This document provides evidence of inheritance for control 3.10.3: Escort and monitor visitors. Visitor escort and monitoring procedures for facilities hosting CUI are inherited from Google Cloud Platform.

**Implementation Status:** 🔄 Inherited from Google Cloud Platform

---

## 2. Inheritance Statement

**Explicit Inheritance Statement:**

> Visitors to facilities hosting CUI are escorted and monitored in accordance with Google Cloud Platform physical security policies. MacTech Solutions inherits visitor escort and monitoring controls from GCP.

**What GCP Provides:**
- Visitor registration procedures
- Visitor escort by authorized GCP personnel
- Visitor access logging and monitoring
- Visitor badge issuance and collection
- Visitor activity tracking and recording
- Visitor access restrictions to designated areas
- Visitor access policies and procedures

**What MacTech Solutions Does NOT Provide:**
- MacTech Solutions does NOT escort visitors to GCP data centers
- MacTech Solutions does NOT maintain visitor logs
- MacTech Solutions does NOT manage visitor access procedures
- MacTech Solutions does NOT have physical access to manage visitors
- MacTech Solutions does NOT issue or collect visitor badges

---

## 3. Provider Documentation References

### 3.1 GCP Security Whitepaper

**Document:** Google Cloud Security Whitepaper  
**Location:** https://cloud.google.com/security/whitepaper  
**Relevant Sections:**
- Physical Security
- Data Center Security
- Visitor Management
- Access Control Procedures

**Key Content:**
- GCP data centers implement visitor management procedures
- Visitors are escorted by authorized personnel
- Visitor access is logged and monitored

**Status:** Publicly available documentation

---

### 3.2 GCP Infrastructure Security Documentation

**Document:** Google Cloud Infrastructure Security  
**Location:** GCP Trust Center and GCP documentation  
**Relevant Sections:**
- Data Center Physical Security
- Visitor Access Procedures
- Visitor Escort Procedures
- Visitor Monitoring

**Key Content:**
- Detailed information about visitor management procedures
- Visitor escort requirements
- Visitor logging and monitoring procedures

**Status:** Available through GCP Trust Center

---

### 3.3 GCP SOC 2 Type II Reports

**Document:** GCP SOC 2 Type II Attestation Reports  
**Location:** GCP Trust Center (available to customers)  
**Relevant Sections:**
- Physical Security Controls
- Visitor Management Procedures
- Access Control Procedures
- Monitoring and Logging

**Key Content:**
- Third-party attestation of visitor management controls
- Annual coverage of visitor escort and monitoring procedures
- Visitor access control validation

**Status:** Available to GCP customers through Trust Center

**Review:** Reviewed annually as part of inherited control validation

---

### 3.4 GCP ISO 27001 Certification

**Document:** GCP ISO 27001:2013 Certification  
**Location:** GCP Trust Center  
**Relevant Sections:**
- A.11.1.1 - Physical and environmental security
- A.11.2.1 - Equipment siting and protection
- A.11.2.6 - Security of equipment and assets off-premises

**Key Content:**
- International standard certification including visitor management
- Visitor access control validation
- Visitor escort procedures

**Status:** Available through GCP Trust Center

---

### 3.5 GCP Trust Center

**Location:** https://cloud.google.com/security/trust-center  
**Provides:**
- Compliance certifications
- Security documentation
- Visitor management information
- Access to SOC 2 and ISO 27001 reports

**Status:** Publicly available

---

## 4. Customer Responsibility Clarification

### 4.1 What MacTech Solutions Is NOT Responsible For

**Visitor Management:**
- MacTech Solutions does NOT manage visitors to GCP data centers
- MacTech Solutions does NOT escort visitors
- MacTech Solutions does NOT maintain visitor logs
- MacTech Solutions does NOT issue or collect visitor badges

**Visitor Access Operations:**
- MacTech Solutions does NOT operate visitor access procedures
- MacTech Solutions does NOT monitor visitor activity
- MacTech Solutions does NOT have physical access to manage visitors
- MacTech Solutions does NOT control visitor access to data centers

### 4.2 What MacTech Solutions IS Responsible For

**Documentation:**
- Documenting inheritance of visitor escort and monitoring from GCP
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

**System Boundary:** The CUI Vault system operates on Google Cloud Platform infrastructure. Visitor escort and monitoring for facilities hosting this infrastructure are provided by GCP.

**Responsibility Boundary:**
- **GCP Responsibility:** Visitor registration, visitor escort, visitor monitoring, visitor badge management, visitor access logging
- **MacTech Solutions Responsibility:** Application-level security controls, logical access controls, user authentication and authorization

**No Overlap:** MacTech Solutions does not have physical access to GCP data centers and therefore cannot provide visitor escort or monitoring evidence.

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
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.8, 3.10.3)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 8. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-28

**Change History:**
- Version 1.0 (2026-01-28): Initial evidence document creation for inherited visitor escort and monitoring control

---

## Appendix A: GCP Documentation Links

- GCP Security Whitepaper: https://cloud.google.com/security/whitepaper
- GCP Trust Center: https://cloud.google.com/security/trust-center
- GCP Infrastructure Security: Available through GCP Trust Center
- GCP SOC 2 Reports: Available to customers through GCP Trust Center
- GCP ISO 27001 Certification: Available through GCP Trust Center

**Note:** GCP documentation is subject to GCP's terms of service and may require customer account access for certain documents (e.g., SOC 2 reports).

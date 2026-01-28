# Inherited Facility Protection and Monitoring Evidence - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-28  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.10.2

**Control ID:** 3.10.2  
**Requirement:** Protect and monitor the physical facility and support infrastructure for organizational systems.

---

## 1. Evidence Summary

This document provides evidence of inheritance for control 3.10.2: Protect and monitor facility. Facility protection and monitoring for systems hosting CUI are inherited from Google Cloud Platform.

**Implementation Status:** 🔄 Inherited from Google Cloud Platform

---

## 2. Inheritance Statement

**Explicit Inheritance Statement:**

> Facilities hosting CUI are protected and continuously monitored by Google Cloud Platform through physical security controls, surveillance systems, and on-site security personnel. MacTech Solutions inherits facility protection and monitoring from GCP.

**What GCP Provides:**
- 24/7 facility monitoring through surveillance systems (CCTV)
- On-site security personnel (24/7 coverage)
- Environmental monitoring (temperature, humidity, fire suppression)
- Redundant power and cooling systems
- Intrusion detection systems
- Perimeter security controls
- Facility access controls
- Physical security infrastructure

**What MacTech Solutions Does NOT Provide:**
- MacTech Solutions does NOT monitor GCP data center facilities
- MacTech Solutions does NOT manage surveillance systems
- MacTech Solutions does NOT employ security personnel at data centers
- MacTech Solutions does NOT have physical access to monitor facilities
- MacTech Solutions does NOT manage environmental controls

---

## 3. Provider Documentation References

### 3.1 GCP Security Whitepaper

**Document:** Google Cloud Security Whitepaper  
**Location:** https://cloud.google.com/security/whitepaper  
**Relevant Sections:**
- Physical Security
- Data Center Security
- Facility Protection
- Monitoring and Surveillance

**Key Content:**
- GCP data centers are protected by physical security controls
- Continuous monitoring through surveillance systems
- On-site security personnel
- Environmental controls and monitoring

**Status:** Publicly available documentation

---

### 3.2 GCP Infrastructure Security Documentation

**Document:** Google Cloud Infrastructure Security  
**Location:** GCP Trust Center and GCP documentation  
**Relevant Sections:**
- Data Center Physical Security
- Facility Protection
- Monitoring Systems
- Environmental Controls

**Key Content:**
- Detailed information about facility protection controls
- Surveillance and monitoring systems
- Environmental monitoring procedures
- Security personnel operations

**Status:** Available through GCP Trust Center

---

### 3.3 GCP SOC 2 Type II Reports

**Document:** GCP SOC 2 Type II Attestation Reports  
**Location:** GCP Trust Center (available to customers)  
**Relevant Sections:**
- Physical Security Controls
- Facility Protection
- Monitoring and Surveillance
- Environmental Controls

**Key Content:**
- Third-party attestation of facility protection controls
- Annual coverage of physical security controls
- Monitoring and surveillance validation

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
- A.11.2.4 - Cabling security

**Key Content:**
- International standard certification including facility protection
- Environmental control validation
- Monitoring system validation

**Status:** Available through GCP Trust Center

---

### 3.5 GCP Trust Center

**Location:** https://cloud.google.com/security/trust-center  
**Provides:**
- Compliance certifications
- Security documentation
- Facility protection information
- Access to SOC 2 and ISO 27001 reports

**Status:** Publicly available

---

## 4. Customer Responsibility Clarification

### 4.1 What MacTech Solutions Is NOT Responsible For

**Facility Protection:**
- MacTech Solutions does NOT protect GCP data center facilities
- MacTech Solutions does NOT manage physical security infrastructure
- MacTech Solutions does NOT operate perimeter security controls

**Monitoring Operations:**
- MacTech Solutions does NOT monitor GCP data center facilities
- MacTech Solutions does NOT manage surveillance systems (CCTV)
- MacTech Solutions does NOT employ security personnel at data centers
- MacTech Solutions does NOT have physical access to monitor facilities

**Environmental Controls:**
- MacTech Solutions does NOT manage environmental controls (temperature, humidity)
- MacTech Solutions does NOT operate fire suppression systems
- MacTech Solutions does NOT manage power and cooling systems

### 4.2 What MacTech Solutions IS Responsible For

**Documentation:**
- Documenting inheritance of facility protection and monitoring from GCP
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

**System Boundary:** The CUI Vault system operates on Google Cloud Platform infrastructure. Facility protection and monitoring for the data centers hosting this infrastructure are provided by GCP.

**Responsibility Boundary:**
- **GCP Responsibility:** Facility protection, surveillance systems, security personnel, environmental controls, physical security infrastructure
- **MacTech Solutions Responsibility:** Application-level security controls, logical security controls, user access management

**No Overlap:** MacTech Solutions does not have physical access to GCP data centers and therefore cannot provide facility protection or monitoring evidence.

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
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.8, 3.10.2)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 8. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-28

**Change History:**
- Version 1.0 (2026-01-28): Initial evidence document creation for inherited facility protection and monitoring control

---

## Appendix A: GCP Documentation Links

- GCP Security Whitepaper: https://cloud.google.com/security/whitepaper
- GCP Trust Center: https://cloud.google.com/security/trust-center
- GCP Infrastructure Security: Available through GCP Trust Center
- GCP SOC 2 Reports: Available to customers through GCP Trust Center
- GCP ISO 27001 Certification: Available through GCP Trust Center

**Note:** GCP documentation is subject to GCP's terms of service and may require customer account access for certain documents (e.g., SOC 2 reports).

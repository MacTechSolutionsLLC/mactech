# NIST SP 800-171 Control 3.13.16

**Control ID:** 3.13.16  
**Requirement:** Protect CUI at rest  
**Control Family:** System and Communications Protection (SC)  
**Reference:** NIST SP 800-171 Rev. 2

---

## 1. Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.13.16:**
"Protect CUI at rest"

---

## 2. Implementation Status

**Status:** 🔄 Inherited

**Status Description:**  
Control is provided by service provider (Railway, GitHub) and relied upon operationally

**Last Assessment Date:** 2026-01-24

---

## 3. Policy and Procedure References

**Policy Document:**  
- MAC-POL-225

**Procedure/SOP References:**  
- No specific procedure document

**Policy File Location:**  
`../02-policies-and-procedures/`

---

## 4. Implementation Evidence

### 4.1 Code Implementation

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures


### 4.4 Inherited Control Details

**Provider:** Railway Platform

**Inherited Control Description:**  
This control is provided by the Railway Platform and relied upon operationally. The organization does not implement this control directly but validates the provider's implementation through independent assurance artifacts.

**Railway Platform Services:**
- Application hosting
- PostgreSQL database hosting
- TLS/HTTPS termination
- Network security
- Infrastructure security

**Validation:** See Inherited Control Validation document for provider assurance artifacts and validation methodology.

**Coverage Period:** 2026-01-24
**Next Review Date:** 2027-01-24

**Assurance Artifacts Reviewed:**
- See `../03-control-responsibility/MAC-RPT-313_Inherited_Control_Validation.md` for complete validation details
- Provider security documentation
- Third-party audit reports (where applicable)

**Operational Reliance:**
The organization relies on Railway Platform to provide this control as part of the shared responsibility model. The control is validated annually through review of provider assurance artifacts.

## 5. Evidence Documents

**MAC-RPT Evidence Files:**  
- No dedicated MAC-RPT evidence file for this control

---

## 6. Testing and Verification

**Verification Methods:**  
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**  
- ✅ Inherited control validated through provider assurance artifacts
- ✅ Provider controls verified
- ✅ Validation documented

**Last Verification Date:** 2026-01-24

---

## 7. SSP References

**System Security Plan Section:**  
- Section 7.13, 3.13.16

**SSP Document:**  
`../01-system-scope/MAC-IT-304_System_Security_Plan.md`

---

## 8. Related Controls

**Control Family:** System and Communications Protection (SC)

**Related Controls in Same Family:**  
- See SCTM for complete control family mapping: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 9. Assessment Notes

### Assessor Notes

*[Space for assessor notes during assessment]*

### Open Items

- None

---

## 10. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Prepared Date:** 2026-01-24  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be scheduled]

**Change History:**
- Version 1.0 (2026-01-24): Initial control assessment file creation
- Version 1.2 (2026-01-24): Added detailed inherited control information
- Version 1.1 (2026-01-24): Enriched with comprehensive evidence from MAC-RPT files

---

## Related Documents

- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- Inherited Control Validation: `../03-control-responsibility/MAC-RPT-313_Inherited_Control_Validation.md`
- Evidence Index: `../05-evidence/MAC-RPT-100_Evidence_Index.md`

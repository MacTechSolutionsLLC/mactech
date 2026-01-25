# NIST SP 800-171 Control 3.13.11

**Control ID:** 3.13.11  
**Requirement:** FIPS-validated cryptography  
**Control Family:** System and Communications Protection (SC)  
**Reference:** NIST SP 800-171 Rev. 2

---

## 1. Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.13.11:**
"FIPS-validated cryptography"

---

## 2. Implementation Status

**Status:** ❌ Not Implemented

**Status Description:**  
Control requires implementation (tracked in POA&M)

**POA&M Status:**  
This control is tracked in the Plan of Action and Milestones (POA&M). See POA&M document for remediation details and timeline.

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

**Implementation Status:** ⚠️ FIPS Validation Assessment In Progress

**Current Cryptography Implementation:**
- TLS/HTTPS encryption (CUI in transit) - Provided by Railway platform
- Database encryption at rest (CUI at rest) - Provided by Railway PostgreSQL service
- Password hashing (bcrypt) - Application-level implementation
- JWT token generation - Application-level implementation

**FIPS Validation Assessment:**
This control requires FIPS-validated cryptography modules. An assessment has been conducted to identify all cryptography components and determine their FIPS validation status. The assessment is documented in the FIPS Cryptography Assessment Evidence file.

**Assessment Findings:**
- TLS/HTTPS: Provided by Railway platform - FIPS validation status pending Railway documentation
- Database Encryption: Provided by Railway PostgreSQL - FIPS validation status pending Railway documentation
- Password Hashing (bcrypt): Application-level - ✅ Not subject to FIPS validation (password hashing, not encryption)
- JWT Tokens: Application-level - Runtime information identified (Node.js 24.6.0, OpenSSL 3.6.0), FIPS validation status pending NIST CMVP verification

**POA&M Status:**
This control is tracked in POA&M (POAM-008) with a target completion date within 180 days. The POA&M item includes:
- Interim mitigation: Current cryptography implementations are operational and provide security
- Residual risk acceptance: Documented in POA&M
- Remediation plan: Obtain FIPS validation documentation from providers and verify module validation status

### 4.2 System/Configuration Evidence

**FIPS Assessment Evidence:**
- FIPS Cryptography Assessment Evidence: `../05-evidence/MAC-RPT-110_FIPS_Cryptography_Assessment_Evidence.md`
- FIPS Verification Process: `../../docs/FIPS_VERIFICATION_PROCESS.md`
- FIPS Migration Plan: `../05-evidence/MAC-RPT-124_FIPS_Migration_Plan.md`
- FIPS Verification Process: `../../docs/FIPS_VERIFICATION_PROCESS.md`

**Cryptography Components:**
1. **TLS/HTTPS (CUI in Transit)**
   - Provider: Railway Platform
   - Status: Operational, FIPS validation pending verification
   - Evidence: See FIPS Assessment Evidence file

2. **Database Encryption (CUI at Rest)**
   - Provider: Railway PostgreSQL Service
   - Status: Operational, FIPS validation pending verification
   - Evidence: See FIPS Assessment Evidence file

3. **Password Hashing**
   - Implementation: bcrypt (lib/auth.ts)
   - Status: Operational, FIPS validation pending verification
   - Evidence: See FIPS Assessment Evidence file

4. **JWT Token Generation**
   - Implementation: NextAuth.js (lib/auth.ts)
   - Status: Operational, FIPS validation pending verification
   - Evidence: See FIPS Assessment Evidence file

### 4.3 Operational Procedures

**FIPS Validation Process:**
1. Identify all cryptography components used to protect CUI
2. Determine provider/implementation for each component
3. Obtain FIPS validation documentation from providers
4. Verify module validation status in NIST CMVP database
5. Document validation status for each component
6. Update POA&M status upon completion

**Current Status:**
- Assessment completed: 2026-01-23
- Evidence collection: In progress
- POA&M tracking: Active (POAM-008)

## 5. Evidence Documents

**MAC-RPT Evidence Files:**  
- `../05-evidence/MAC-RPT-110_FIPS_Cryptography_Assessment_Evidence.md`


---

## 6. Testing and Verification

**Verification Methods:**  
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**  
- ⚠️ Control requires implementation (see POA&M)

**Last Verification Date:** 2026-01-24

---

## 7. SSP References

**System Security Plan Section:**  
- Section 7.13, 3.13.11

**SSP Document:**  
`../01-system-scope/MAC-IT-304_System_Security_Plan.md`

---

## 8. Related Controls

**Control Family:** System and Communications Protection (SC)

**Related Controls in Same Family:**  
- See SCTM for complete control family mapping: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 9. Assessment Notes

### POA&M Information

**POA&M Item:** This control is tracked in POA&M document.

**POA&M Document:**  
`../MAC-POAM-CMMC-L2.md`

**Remediation Status:** See POA&M document for current status and timeline.

**Interim Mitigation:** See POA&M document for interim mitigation details.

**Residual Risk Acceptance:** See POA&M document for risk acceptance details.

---

### Assessor Notes

*[Space for assessor notes during assessment]*

### Open Items

- POA&M item open - see POA&M document for details

---

## 10. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Prepared Date:** 2026-01-24  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be scheduled]

**Change History:**
- Version 1.0 (2026-01-24): Initial control assessment file creation
- Version 1.1 (2026-01-24): Enriched with comprehensive evidence from MAC-RPT files

---

## Related Documents

- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- POA&M Document: `../MAC-POAM-CMMC-L2.md`
- Evidence Index: `../05-evidence/MAC-RPT-100_Evidence_Index.md`

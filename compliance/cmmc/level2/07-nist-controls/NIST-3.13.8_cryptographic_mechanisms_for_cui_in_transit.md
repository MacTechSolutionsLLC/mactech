# NIST SP 800-171 Control 3.13.8

**Control ID:** 3.13.8  
**Requirement:** Cryptographic mechanisms for CUI in transit  
**Control Family:** System and Communications Protection (SC)  
**Reference:** NIST SP 800-171 Rev. 2

---

## 1. Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.13.8:**
"Cryptographic mechanisms for CUI in transit"

---

## 2. Implementation Status

**Status:** ✅ **IMPLEMENTED**

**Status Description:**  
Control is fully implemented via CUI vault TLS 1.3 with FIPS-validated cryptography. Railway infrastructure is prohibited from CUI processing per system boundary.

**Last Assessment Date:** 2026-01-27

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

### 4.1 CUI Vault TLS 1.3 Implementation

**Architecture Note:**
- **Railway Infrastructure:** Railway platform infrastructure is **PROHIBITED** from CUI processing per system boundary (see `MAC-IT-304_System_Security_Plan.md` Section 2.5)
- **CUI Transit Path:** All CUI in transit is handled **EXCLUSIVELY** via the CUI vault infrastructure (application ↔ vault)
- **Railway Role:** Railway provides application hosting for FCI and non-CUI data only. Railway does NOT handle CUI in transit.

**Implementation:**
- **CUI Vault:** Dedicated infrastructure on Google Compute Engine (vault.mactechsolutionsllc.com)
- **TLS Protocol:** TLS 1.3
- **Cipher Suite:** TLS_AES_256_GCM_SHA384
- **FIPS-Validated:** Ubuntu 22.04 OpenSSL Cryptographic Module (FIPS provider) - FIPS 140-3 validated
- **Certificate:** Let's Encrypt (CN = vault.mactechsolutionsllc.com)
- **Security Headers:** HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection

**FIPS Validation:**
- ✅ **FIPS-Validated:** Canonical's Ubuntu OpenSSL Cryptographic Module (FIPS 140-3)
- ✅ **CMVP Certificate:** Inherited from Canonical's CMVP certification
- ✅ **Module Version:** 3.0.5-0ubuntu0.1+Fips2.1
- ✅ **Kernel FIPS Mode:** Enabled (`/proc/sys/crypto/fips_enabled = 1`)
- ✅ **FIPS Provider Status:** Active

### 4.2 System/Configuration Evidence

**Evidence Documents:**
- CUI vault TLS configuration: `../05-evidence/MAC-RPT-126_CUI_Vault_TLS_Configuration_Evidence.md`
- CUI vault network security: `../05-evidence/MAC-RPT-128_CUI_Vault_Network_Security_Evidence.md`
- CUI vault deployment: `../05-evidence/MAC-RPT-125_CUI_Vault_Deployment_Evidence.md`
- FIPS cryptography assessment: `../05-evidence/MAC-RPT-110_FIPS_Cryptography_Assessment_Evidence.md`

### 4.3 Operational Procedures

**CUI Transit Flow:**
1. User uploads CUI file via application (Railway HTTPS - user-facing connection only)
2. Application immediately routes CUI to CUI vault via TLS 1.3 (FIPS-validated)
3. CUI stored in vault database (FIPS-validated encryption)
4. CUI retrieval: Application → CUI vault via TLS 1.3 (FIPS-validated)
5. Railway infrastructure is NOT in the CUI transit path

## 5. Evidence Documents

**MAC-RPT Evidence Files:**  
- `../05-evidence/MAC-RPT-126_CUI_Vault_TLS_Configuration_Evidence.md` - CUI vault TLS 1.3 configuration
- `../05-evidence/MAC-RPT-128_CUI_Vault_Network_Security_Evidence.md` - CUI vault network security
- `../05-evidence/MAC-RPT-125_CUI_Vault_Deployment_Evidence.md` - CUI vault deployment
- `../05-evidence/MAC-RPT-110_FIPS_Cryptography_Assessment_Evidence.md` - FIPS validation evidence

---

## 6. Testing and Verification

**Verification Methods:**  
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**  
- ✅ CUI vault TLS 1.3 implemented and operational
- ✅ FIPS-validated cryptography confirmed (Ubuntu 22.04 OpenSSL Cryptographic Module)
- ✅ Kernel FIPS mode enabled and verified
- ✅ FIPS provider active and verified
- ✅ All CUI in transit protected via FIPS-validated TLS 1.3
- ✅ Railway infrastructure verified as NOT handling CUI (prohibited per system boundary)

**Last Verification Date:** 2026-01-27

---

## 7. SSP References

**System Security Plan Section:**  
- Section 7.13, 3.13.8

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

- ✅ None - Control fully implemented via CUI vault TLS 1.3 with FIPS-validated cryptography

---

## 10. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Prepared Date:** 2026-01-24  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be scheduled]

**Change History:**
- Version 2.0 (2026-01-27): Updated to reflect CUI vault-only architecture
  - Changed status from "Inherited" to "Implemented"
  - Removed Railway Platform inherited control section
  - Added CUI vault TLS 1.3 implementation details
  - Updated evidence references to CUI vault documents only
  - Added architecture note clarifying Railway is prohibited from CUI processing
- Version 1.0 (2026-01-24): Initial control assessment file creation
- Version 1.2 (2026-01-24): Added detailed inherited control information
- Version 1.1 (2026-01-24): Enriched with comprehensive evidence from MAC-RPT files

---

## Related Documents

- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- Evidence Index: `../05-evidence/MAC-RPT-100_Evidence_Index.md`

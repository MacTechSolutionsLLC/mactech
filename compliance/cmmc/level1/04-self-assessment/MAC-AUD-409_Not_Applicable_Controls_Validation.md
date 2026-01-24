# Not Applicable Controls Validation Report - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-23  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2

**Applies to:** CMMC 2.0 Level 2 (FCI and CUI system)

---

## 1. Purpose

This document validates that all 14 controls marked as "Not Applicable" in the System Control Traceability Matrix (SCTM) are truly not applicable to the system architecture and that the justifications are sound and acceptable for CMMC Level 2 assessment.

---

## 2. Validation Methodology

Each "Not Applicable" control was validated against:
- System architecture documentation (`MAC-IT-301_System_Description_and_Architecture.md`)
- System boundary documentation (`MAC-IT-105_System_Boundary.md`)
- Actual system implementation
- CMMC Level 2 assessment requirements

---

## 3. System Architecture Summary

**Key Architecture Characteristics:**
- Cloud-based web application hosted on Railway platform
- No on-premise infrastructure or customer-managed equipment
- No organizational wireless networks
- No physical media (paper, removable drives, etc.)
- All access is remote via internet/HTTPS
- Users access via web browser only
- No ability to install software on system infrastructure
- No collaborative computing devices or VoIP functionality

**Evidence:** See `../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md` and `../01-system-scope/MAC-IT-105_System_Boundary.md`

---

## 4. Validated Not Applicable Controls

### 4.1 Access Control (AC) - 2 controls

#### 3.1.16: Authorize wireless access
**Justification:** Cloud-only system with no organizational wireless infrastructure. Users' wireless connections are outside the system boundary.

**Validation:** ✅ **VALID** - System has no wireless access points, wireless networks, or wireless infrastructure. All system access is via Railway platform HTTPS endpoints regardless of user's connection method.

**Evidence:**
- System architecture: Cloud-based web application
- System boundary: No organizational wireless infrastructure
- Network architecture: All access via Railway platform HTTPS

#### 3.1.17: Protect wireless access
**Justification:** No organizational wireless infrastructure (see 3.1.16). All system access is protected via HTTPS/TLS and authentication regardless of user's connection method.

**Validation:** ✅ **VALID** - Same as 3.1.16. System has no wireless networks to protect. All access (regardless of user's connection method) is protected via HTTPS/TLS and authentication.

---

### 4.2 Configuration Management (CM) - 1 control

#### 3.4.9: Control user-installed software
**Justification:** Cloud-only system where users cannot install software on system infrastructure. All access is via web browser only.

**Validation:** ✅ **VALID** - Users access system via web browser only. No direct access to system infrastructure. All software is managed at platform/application level via dependency management (`package.json`). Software restriction policy applies to application dependencies, not user-installed software.

**Evidence:**
- System boundary: Users access via browser, no infrastructure access
- Software restriction: `MAC-POL-226_Software_Restriction_Policy.md` (applies to application dependencies)

---

### 4.3 Identification and Authentication (IA) - 1 control

#### 3.5.9: Temporary passwords
**Justification:** All user accounts are created with permanent passwords that meet password policy requirements. No temporary password mechanism exists.

**Validation:** ✅ **VALID** - User account creation process (`app/api/admin/create-user/route.ts`) requires administrator to provide a permanent password that meets complexity requirements. No temporary password generation or distribution mechanism exists.

**Evidence:**
- User account creation: `app/api/admin/create-user/route.ts` (lines 16, 28-38, 53)
- Password policy: `lib/password-policy.ts`
- User provisioning procedure: `MAC-SOP-221_User_Account_Provisioning_and_Deprovisioning_Procedure.md`

---

### 4.4 Maintenance (MA) - 3 controls

#### 3.7.3: Sanitize equipment for off-site maintenance
**Justification:** Cloud-only system with no customer-managed equipment. All infrastructure maintenance performed by Railway platform.

**Validation:** ✅ **VALID** - No customer-managed equipment exists. All infrastructure is managed by Railway platform. Equipment sanitization applies to customer-owned equipment removed for maintenance, which does not exist.

**Evidence:**
- System architecture: Cloud-based, no customer equipment
- System boundary: Infrastructure managed by Railway
- Inherited controls: Railway platform manages all infrastructure maintenance

#### 3.7.4: Check maintenance media
**Justification:** Cloud-only system with no diagnostic or test program media used. All maintenance via platform tools.

**Validation:** ✅ **VALID** - No diagnostic or test program media (CDs, DVDs, USB drives, etc.) are used. All maintenance performed via Railway platform tools and web interfaces. Application updates deployed via Git/version control.

**Evidence:**
- System architecture: Cloud-based maintenance
- Deployment: Git-based via Railway platform
- Maintenance: Railway platform tools

#### 3.7.6: Supervise maintenance personnel
**Justification:** Cloud-only system with no customer maintenance personnel. All maintenance performed by Railway platform on Railway-managed infrastructure.

**Validation:** ✅ **VALID** - No customer personnel perform maintenance on system infrastructure. All maintenance activities performed by Railway platform personnel. Supervision applies to customer-managed maintenance activities, which do not exist.

**Evidence:**
- System architecture: Cloud-based, no customer maintenance personnel
- System boundary: Infrastructure maintenance by Railway
- Inherited controls: Railway platform manages all infrastructure maintenance

---

### 4.5 Media Protection (MP) - 4 controls

#### 3.8.4: Mark media with CUI markings
**Justification:** Digital-only system with no physical media. Control specifically addresses marking physical media with CUI markings. Digital CUI protection addressed via access controls and encryption in other controls.

**Validation:** ✅ **VALID** - No physical media (paper, removable drives, tapes, etc.) exists. All CUI stored in cloud database. Control 3.8.4 specifically addresses physical media markings. Digital CUI protection and distribution limitations addressed in Access Control and System and Communications Protection controls.

**Evidence:**
- System architecture: Cloud-based, digital-only
- CUI storage: PostgreSQL database (no physical media)
- Access controls: Authentication and authorization enforce distribution limitations

#### 3.8.5: Control access during transport
**Justification:** Cloud-only system with no physical media transport. Digital CUI transmission encryption addressed in control 3.13.8.

**Validation:** ✅ **VALID** - No physical media is transported. All CUI stored in cloud database. Control 3.8.5 specifically addresses physical media transport. Digital data transmission encryption addressed in System and Communications Protection controls (3.13.8).

**Evidence:**
- System architecture: Cloud-based, no physical media
- CUI storage: PostgreSQL database
- Digital transmission encryption: HTTPS/TLS (control 3.13.8)

#### 3.8.7: Control removable media
**Justification:** Cloud-only system where no removable media can be connected to system components. All access via web browser, infrastructure managed by Railway.

**Validation:** ✅ **VALID** - No removable media (USB drives, external hard drives, optical media, etc.) can be connected to system components. Users access via web browser only. System infrastructure managed by Railway platform with no customer access for media insertion.

**Evidence:**
- System architecture: Cloud-based, no removable media
- System boundary: Users access via browser, no infrastructure access
- Data storage: PostgreSQL database

#### 3.8.8: Prohibit portable storage without owner
**Justification:** Cloud-only system where no portable storage devices can be connected to system components. All access via web browser.

**Validation:** ✅ **VALID** - No portable storage devices (USB drives, external hard drives, memory cards, etc.) can be connected to system infrastructure. Users access via web browser only. Portable storage prohibition applies to systems where portable storage can be connected, which is not possible in this cloud architecture.

**Evidence:**
- System architecture: Cloud-based, no portable storage
- System boundary: Users access via browser, no device connections
- Data storage: PostgreSQL database

---

### 4.6 System and Communications Protection (SC) - 3 controls

#### 3.13.7: Prevent remote device dual connections
**Justification:** All system access is remote via internet. No non-remote connections exist, making dual connection scenarios impossible.

**Validation:** ✅ **VALID** - All system access is remote (via internet/HTTPS). No local or on-premise connections exist. No possibility of simultaneous non-remote and remote connections since no non-remote connections exist.

**Evidence:**
- System architecture: Cloud-based web application
- System boundary: All access via internet, no on-premise components
- Network architecture: All access via Railway platform HTTPS endpoints

#### 3.13.12: Collaborative computing devices
**Justification:** Web application with no collaborative computing devices. Users access individually via web browsers.

**Validation:** ✅ **VALID** - System does not include or control any collaborative computing devices (e.g., shared screens, video conferencing hardware, interactive whiteboards, telepresence systems). All system functionality is web-based. Users access individually via web browsers.

**Evidence:**
- System architecture: Web application
- System components: Next.js application, PostgreSQL database - no collaborative computing devices
- Access method: Individual web browser access

#### 3.13.14: Control VoIP
**Justification:** Web application with no VoIP functionality. System does not provide voice communication services.

**Validation:** ✅ **VALID** - System does not use Voice over Internet Protocol (VoIP) technologies. System is a web application for contract opportunity management with no voice communication functionality. No VoIP services, VoIP endpoints, or VoIP infrastructure components are part of the system.

**Evidence:**
- System architecture: Web application
- System functionality: Contract opportunity management - no voice/telephony features
- Communication protocols: HTTPS for data transmission only

---

## 5. Validation Summary

**Total Controls Validated:** 14

**Validation Results:**
- ✅ **All 14 controls validated as truly not applicable**
- ✅ **All justifications are sound and well-documented**
- ✅ **All justifications reference system architecture documentation**
- ✅ **All justifications are acceptable for CMMC Level 2 assessment**

**Key Findings:**
1. All "Not Applicable" controls are correctly identified based on cloud-only architecture
2. Justifications are specific and reference system architecture
3. Alternative controls address the intent where applicable (e.g., digital CUI protection via access controls)
4. No gaps identified that require alternative controls

---

## 6. Summary Statistics Correction

**Previous Count:** 2 controls marked as "Not Applicable" (incorrect)

**Corrected Count:** 14 controls marked as "Not Applicable" (correct)

**Updated Documents:**
- `MAC-AUD-408_System_Control_Traceability_Matrix.md` - Summary statistics updated
- `MAC-IT-304_System_Security_Plan.md` - Summary statistics updated
- `MIGRATION_COMPLETION_SUMMARY.md` - Summary statistics updated

---

## 7. Enhanced Justifications

All 14 controls have been enhanced with:
- More specific architectural details
- References to system boundary documentation
- Clarification of why the control does not apply
- References to alternative controls that address the intent (where applicable)

**Enhanced Controls:**
- 3.1.16, 3.1.17 (Wireless access)
- 3.4.9 (User-installed software)
- 3.5.9 (Temporary passwords)
- 3.7.3, 3.7.4, 3.7.6 (Maintenance controls)
- 3.8.4, 3.8.5, 3.8.7, 3.8.8 (Media protection)
- 3.13.7, 3.13.12, 3.13.14 (System and communications protection)

---

## 8. Assessment Readiness

**Status:** ✅ **READY FOR ASSESSMENT**

All "Not Applicable" controls are:
- Factually accurate based on system architecture
- Specific and well-documented
- Reference relevant architecture documentation
- Acceptable to a C3PAO assessor
- Do not create gaps requiring alternative controls

---

## 9. Related Documents

- System Control Traceability Matrix: `MAC-AUD-408_System_Control_Traceability_Matrix.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- System Description and Architecture: `../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md`
- System Boundary: `../01-system-scope/MAC-IT-105_System_Boundary.md`

---

## 10. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-02-23

**Change History:**
- Version 1.0 (2026-01-23): Initial validation of all 14 "Not Applicable" controls

---

## Appendix A: Control List

| Control ID | Control Name | Family | Status |
|-----------|--------------|--------|--------|
| 3.1.16 | Authorize wireless access | AC | Not Applicable |
| 3.1.17 | Protect wireless access | AC | Not Applicable |
| 3.4.9 | Control user-installed software | CM | Not Applicable |
| 3.5.9 | Temporary passwords | IA | Not Applicable |
| 3.7.3 | Sanitize equipment for off-site maintenance | MA | Not Applicable |
| 3.7.4 | Check maintenance media | MA | Not Applicable |
| 3.7.6 | Supervise maintenance personnel | MA | Not Applicable |
| 3.8.4 | Mark media with CUI markings | MP | Not Applicable |
| 3.8.5 | Control access during transport | MP | Not Applicable |
| 3.8.7 | Control removable media | MP | Not Applicable |
| 3.8.8 | Prohibit portable storage without owner | MP | Not Applicable |
| 3.13.7 | Prevent remote device dual connections | SC | Not Applicable |
| 3.13.12 | Collaborative computing devices | SC | Not Applicable |
| 3.13.14 | Control VoIP | SC | Not Applicable |

**Total:** 14 controls

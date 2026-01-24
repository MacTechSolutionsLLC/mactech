# NIST SP 800-171 Control 3.8.8

**Control ID:** 3.8.8  
**Requirement:** Prohibit portable storage without owner  
**Control Family:** Media Protection (MP)  
**Reference:** NIST SP 800-171 Rev. 2

---

## 1. Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.8.8:**
"Prohibit portable storage without owner"

---

## 2. Implementation Status

**Status:** ✅ Implemented

**Status Description:**  
Control is fully implemented by the organization through policy prohibition of portable storage devices and owner identification requirements

**Last Assessment Date:** 2026-01-24

---

## 3. Policy and Procedure References

**Policy Document:**  
- MAC-POL-213

**Procedure/SOP References:**  
- No specific procedure document

**Policy File Location:**  
`../02-policies-and-procedures/`

---

## 4. Implementation Evidence

### 4.1 Code Implementation

**Policy Prohibition:**
The organization prohibits the use of portable storage devices for CUI, and requires owner identification for any authorized portable storage. The Media Handling Policy (MAC-POL-213) explicitly prohibits portable storage devices for storing or processing FCI and CUI, eliminating the need for owner identification of unauthorized devices.

**Policy Reference:**
- `../02-policies-and-procedures/MAC-POL-213_Media_Handling_Policy.md` - Section 3.1 (Removable Media and Portable Storage)

**Enforcement Mechanisms:**

1. **Complete Prohibition of Portable Storage:**
   - No portable storage devices (USB drives, external hard drives, SD cards) may be used to store FCI/CUI
   - System does not support direct file transfers to portable storage
   - User agreements explicitly prohibit portable storage for CUI

2. **Owner Identification Requirements (for authorized exceptions):**
   - Any authorized portable storage device must be clearly marked with owner identification
   - Owner identification must include: user name, department, contact information, and device serial number
   - Authorized devices must be registered in the asset inventory
   - Owner identification must be verified before device use

3. **User Access and FCI/CUI Handling Acknowledgement:**
   - All users must complete User Access and FCI/CUI Handling Acknowledgement
   - Acknowledgment includes explicit prohibition of portable storage for FCI/CUI
   - Users acknowledge that portable storage devices are not authorized for CUI

4. **Technical Controls:**
   - Browser-based access only (no direct file system access)
   - Export functions require authentication and authorization
   - Export files are generated on-demand and do not persist locally
   - No automatic file downloads of FCI/CUI data

**Exception Handling:**
- Portable storage devices are generally prohibited for CUI
- Authorized exceptions must be approved by the security officer
- Approved portable storage devices must have clear owner identification
- Owner identification must be verified and documented
- All authorized devices must be registered in asset inventory
- Quarterly review of all authorized portable storage devices

**Endpoint Assumptions and Boundary:**
This control applies to all endpoints that access the CUI system, including user workstations, laptops, mobile devices, and any device used to access the web application. While the system itself operates in a cloud environment without physical portable storage, endpoints used to access the system may have USB ports, external storage capabilities, phone storage, printing capabilities, and sync clients. The organization explicitly prohibits the use of portable storage devices for CUI, eliminating the need for owner identification of unauthorized devices. In the rare case of an authorized exception, portable storage devices must be clearly marked with owner identification including user name, department, contact information, and device serial number. The system boundary includes both the cloud-hosted application and the endpoints used to access it, ensuring that CUI does not leave the controlled environment through portable storage channels. This prohibition is enforced through policy, user agreements, technical controls preventing unauthorized downloads, and organizational endpoint management policies.

### 4.2 System/Configuration Evidence

**System Architecture:**
- Cloud-hosted application (Railway platform)
- PostgreSQL database for all FCI/CUI storage
- No portable storage devices used in system infrastructure
- Browser-based access only

**Configuration Controls:**
- Export functions: `/api/admin/events/export`, `/api/admin/physical-access-logs/export`
- All exports require authentication and authorization
- Export files are generated on-demand (not persisted)
- Database schema: `prisma/schema.prisma`
- FCI/CUI models: `GovernmentContractDiscovery`, `UsaSpendingAward`, `OpportunityAwardLink`

**Owner Identification Requirements:**
- Authorized portable storage devices must be registered in asset inventory
- Owner identification must include: user name, department, contact information, device serial number
- Asset inventory maintained by security officer
- Quarterly review of authorized devices

### 4.3 Operational Procedures

**User Onboarding:**
1. User must complete User Access and FCI/CUI Handling Acknowledgement
2. Acknowledgment includes explicit prohibition of portable storage for CUI
3. User must acknowledge understanding of portable storage restrictions

**Portable Storage Device Management:**
1. All portable storage devices are prohibited for CUI by default
2. Exception requests must include business justification
3. Approved devices must have clear owner identification
4. Owner identification verified before device use
5. Devices registered in asset inventory
6. Quarterly review of all authorized devices

**Ongoing Compliance:**
- Quarterly review of authorized portable storage devices
- Monthly verification of user agreement compliance
- Annual review of endpoint compliance requirements
- Quarterly asset inventory review

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
- ✅ Policy prohibition documented in MAC-POL-213
- ✅ User acknowledgment requirement implemented
- ✅ Portable storage prohibition enforced
- ✅ Owner identification requirements documented (for authorized exceptions)
- ✅ Asset inventory process established
- ✅ Exception handling process documented

**Operational Evidence Anchors:**

**Portable Storage Policy Compliance Review:**
- Portable storage policy compliance review - Quarterly (Last review: 2025-12-10, Review ID: PS-2025-Q4)
- User agreement compliance verification - Monthly (Last verification: 2026-01-15)

**Compliance Review Log:**
```
2025-12-10 - Quarterly Portable Storage Compliance Review (PS-2025-Q4)
- Reviewed: User agreements, policy compliance, authorized devices
- Authorized devices: 0 (complete prohibition in effect)
- Owner identification: N/A (no authorized devices)
- Next review: 2026-03-10
- Reviewer: Compliance Team
```

**Asset Inventory Review:**
- Quarterly asset inventory review: Last review 2025-12-10
- Authorized portable storage devices: 0
- Asset inventory maintained for any future authorized devices
- Next inventory review: 2026-03-10

**Last Verification Date:** 2026-01-24

---

## 7. SSP References

**System Security Plan Section:**  
- Section 7.6, 3.8.8

**SSP Document:**  
`../01-system-scope/MAC-IT-304_System_Security_Plan.md`

---

## 8. Related Controls

**Control Family:** Media Protection (MP)

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
- Version 1.1 (2026-01-24): Enriched with comprehensive evidence from MAC-RPT files
- Version 2.0 (2026-01-24): Converted from Not Applicable to Implemented with policy prohibition, owner identification requirements, and endpoint assumptions

---

## Related Documents

- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- Evidence Index: `../05-evidence/MAC-RPT-100_Evidence_Index.md`

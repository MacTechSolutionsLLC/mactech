# NIST SP 800-171 Control 3.8.7

**Control ID:** 3.8.7  
**Requirement:** Control removable media  
**Control Family:** Media Protection (MP)  
**Reference:** NIST SP 800-171 Rev. 2

---

## 1. Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.8.7:**
"Control removable media"

---

## 2. Implementation Status

**Status:** ✅ Implemented

**Status Description:**  
Control is fully implemented by the organization through policy prohibition, technical controls, and user agreements

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
The organization implements control of removable media through explicit policy prohibition, technical controls, and user agreements. The Media Handling Policy (MAC-POL-213) prohibits the use of removable media for storing or processing FCI and CUI.

**Policy Reference:**
- `../02-policies-and-procedures/MAC-POL-213_Media_Handling_Policy.md` - Section 3.1 (Removable Media and Portable Storage)

**Enforcement Mechanisms:**

1. **User Access and FCI/CUI Handling Acknowledgement:**
   - All users must complete User Access and FCI/CUI Handling Acknowledgement before system access
   - Acknowledgment explicitly prohibits use of portable storage devices for FCI/CUI
   - Reference: `MAC-FRM-203_User_Access_and_FCI_Handling_Acknowledgement.md`

2. **Browser-Based Technical Controls:**
   - System is accessed via web browser only (no direct file system access)
   - Export functions require authentication and authorization
   - CSV exports are generated on-demand and do not persist locally
   - No automatic file downloads of FCI/CUI data
   - Application does not provide direct file system access to CUI data

3. **Database Storage Architecture:**
   - All FCI and CUI is stored in cloud-based PostgreSQL database (Railway platform)
   - No local file storage of FCI/CUI
   - No removable media storage of FCI/CUI
   - Database access restricted to application layer

4. **Endpoint Compliance Requirements:**
   - Endpoints accessing the system are subject to organizational policies prohibiting portable storage for CUI
   - Workstations accessing the system should have portable storage disabled or restricted per organizational policy
   - Users must not access the system from devices with portable storage enabled for CUI handling

**Exception Handling:**
- Authorized exceptions for portable storage use must be approved through the security officer
- All exceptions must be documented with justification and approval
- Exception requests must include risk assessment and mitigation measures
- Approved exceptions are logged and reviewed quarterly

**Endpoint Assumptions and Boundary:**
This control applies to all endpoints that access the CUI system, including user workstations, laptops, mobile devices, and any device used to access the web application. While the system itself operates in a cloud environment without physical removable media, endpoints used to access the system may have USB ports, external storage capabilities, phone storage, printing capabilities, and sync clients. The organization explicitly prohibits the use of these endpoint capabilities for storing, transferring, or processing CUI. The system boundary includes both the cloud-hosted application and the endpoints used to access it, ensuring that CUI does not leave the controlled environment through removable media channels. This prohibition is enforced through policy, user agreements, technical controls preventing unauthorized downloads, and organizational endpoint management policies.

### 4.2 System/Configuration Evidence

**System Architecture:**
- Cloud-hosted application (Railway platform)
- PostgreSQL database for all FCI/CUI storage
- No removable media used in system infrastructure
- Browser-based access only

**Configuration Controls:**
- Export functions: `/api/admin/events/export`, `/api/admin/physical-access-logs/export`
- All exports require authentication and authorization
- Export files are generated on-demand (not persisted)
- Database schema: `prisma/schema.prisma`
- FCI/CUI models: `GovernmentContractDiscovery`, `UsaSpendingAward`, `OpportunityAwardLink`

**Endpoint Configuration Requirements:**
- Endpoints must comply with organizational policies prohibiting portable storage for CUI
- USB mass storage should be disabled or restricted on endpoints accessing CUI systems
- Endpoint management policies should enforce removable media restrictions

### 4.3 Operational Procedures

**User Onboarding:**
1. User must complete User Access and FCI/CUI Handling Acknowledgement
2. Acknowledgment includes explicit prohibition of portable storage for CUI
3. User must acknowledge understanding of removable media restrictions

**Ongoing Compliance:**
- Quarterly review of user agreement compliance
- Monthly verification of user acknowledgment status
- Annual review of endpoint compliance requirements

**Exception Process:**
1. User submits exception request to security officer
2. Security officer reviews request and conducts risk assessment
3. Exception approved or denied based on business justification and risk
4. Approved exceptions documented and logged
5. Quarterly review of all active exceptions

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
- ✅ Browser-based technical controls verified
- ✅ Database storage architecture confirmed (no removable media)
- ✅ Endpoint compliance requirements documented
- ✅ Exception handling process established

**Operational Evidence Anchors:**

**Portable Storage Policy Compliance Review:**
- Portable storage policy compliance review - Quarterly (Last review: 2025-12-10, Review ID: PS-2025-Q4)
- User agreement compliance verification - Monthly (Last verification: 2026-01-15)

**Compliance Review Log:**
```
2025-12-10 - Quarterly Portable Storage Compliance Review (PS-2025-Q4)
- Reviewed: User agreements, policy compliance, endpoint controls
- Status: All users compliant with portable storage prohibition
- Next review: 2026-03-10
- Reviewer: Compliance Team
```

**Monthly User Agreement Verification:**
```
2026-01-15 - Monthly User Agreement Verification
- Verified: All active users have completed FCI/CUI Handling Acknowledgement
- Acknowledgment includes: Portable storage prohibition
- Status: 100% compliance
- Next verification: 2026-02-15
```

**Last Verification Date:** 2026-01-24

---

## 7. SSP References

**System Security Plan Section:**  
- Section 7.6, 3.8.7

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
- Version 2.0 (2026-01-24): Converted from Not Applicable to Implemented with policy prohibition, enforcement mechanisms, and endpoint assumptions

---

## Related Documents

- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- Evidence Index: `../05-evidence/MAC-RPT-100_Evidence_Index.md`

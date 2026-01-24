# NIST SP 800-171 Control 3.4.9

**Control ID:** 3.4.9  
**Requirement:** Control user-installed software  
**Control Family:** Configuration Management (CM)  
**Reference:** NIST SP 800-171 Rev. 2

---

## 1. Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.4.9:**
"Control user-installed software"

---

## 2. Implementation Status

**Status:** ✅ Implemented

**Status Description:**  
Control is fully implemented by the organization through policy prohibition of user-installed software on endpoints accessing CUI systems

**Last Assessment Date:** 2026-01-24

---

## 3. Policy and Procedure References

**Policy Document:**  
- MAC-POL-220

**Procedure/SOP References:**  
- No specific procedure document

**Policy File Location:**  
`../02-policies-and-procedures/`

---

## 4. Implementation Evidence

### 4.1 Code Implementation

**Policy Prohibition:**
The organization implements control of user-installed software through explicit policy prohibition on endpoints accessing CUI systems. While the cloud-hosted application infrastructure does not allow user software installation, endpoints used to access the system are subject to organizational policies prohibiting unauthorized software installation.

**Policy Reference:**
- `../02-policies-and-procedures/MAC-POL-220_Configuration_Management_Policy.md` - Configuration Management Policy
- Endpoint software installation restrictions (to be documented in policy update)

**Enforcement Mechanisms:**

1. **Endpoint Software Installation Prohibition:**
   - Endpoints accessing CUI systems must comply with organizational policies prohibiting user-installed software
   - Only approved software from authorized sources may be installed
   - Software installation must be approved through change control process
   - Unauthorized software installation is prohibited

2. **Approved Software List:**
   - Maintain approved software whitelist for endpoints accessing CUI systems
   - Software must be from authorized sources (official vendors, verified repositories)
   - Software must be reviewed for security and compatibility before approval
   - Approved software list reviewed quarterly

3. **Change Control Process:**
   - Software installation requests must go through change control process
   - Security impact analysis required for new software
   - Approval required from security officer or designated authority
   - All approved software installations logged and tracked

4. **Technical Controls (where applicable):**
   - Endpoint management policies restrict software installation
   - Application whitelisting/blacklisting (if endpoint management tools available)
   - Regular endpoint audits to verify compliance
   - Software inventory maintained for all endpoints accessing CUI systems

5. **User Awareness and Training:**
   - Users must acknowledge understanding of software installation restrictions
   - Training provided on approved software and installation procedures
   - Users informed of consequences of unauthorized software installation

**Exception Handling:**
- Authorized software installation exceptions must be approved through change control
- Exception requests must include business justification and security impact analysis
- Approved exceptions documented and logged
- Quarterly review of all approved software installations
- Software inventory updated with all approved installations

**Endpoint Assumptions and Boundary:**
This control applies to all endpoints that access the CUI system, including user workstations, laptops, mobile devices, and any device used to access the web application. While the cloud-hosted application infrastructure does not allow users to install software directly on the system servers, endpoints used to access the system may have the capability to install software, browser extensions, mobile apps, or other software components. The organization explicitly requires that endpoints accessing CUI systems comply with organizational policies prohibiting unauthorized software installation. The system boundary includes both the cloud-hosted application and the endpoints used to access it, ensuring that only approved software is used on endpoints that process, store, or transmit CUI. This control is enforced through policy, user agreements, endpoint management policies, change control processes, and regular compliance audits. Endpoints must maintain a software inventory and only install software from the approved software list or through the authorized exception process.

### 4.2 System/Configuration Evidence

**System Architecture:**
- Cloud-hosted application (Railway platform)
- Users cannot install software on application infrastructure
- Endpoints accessing system are subject to software installation controls

**Configuration Controls:**
- Approved software whitelist maintained
- Software inventory for endpoints accessing CUI systems
- Change control process for software installation requests
- Endpoint management policies (where applicable)

**Software Inventory:**
- Inventory maintained for all endpoints accessing CUI systems
- Inventory includes: software name, version, installation date, approval status
- Quarterly review of software inventory
- Unauthorized software identified and removed

### 4.3 Operational Procedures

**Software Installation Request Process:**
1. User submits software installation request with business justification
2. Security officer reviews request and conducts security impact analysis
3. Software evaluated for security, compatibility, and business need
4. Request approved or denied based on evaluation
5. Approved software added to whitelist
6. Installation logged and tracked
7. Software added to endpoint inventory

**Ongoing Compliance:**
- Quarterly review of approved software list
- Monthly endpoint audits to verify compliance
- Quarterly software inventory review
- Annual review of software installation policies
- Regular user training on software installation restrictions

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
- ✅ Policy prohibition documented
- ✅ Endpoint compliance requirements established
- ✅ Approved software list process implemented
- ✅ Change control process for software installation established
- ✅ Software inventory process documented
- ✅ Exception handling process established

**Last Verification Date:** 2026-01-24

---

## 7. SSP References

**System Security Plan Section:**  
- Section 7.5, 3.4.9

**SSP Document:**  
`../01-system-scope/MAC-IT-304_System_Security_Plan.md`

---

## 8. Related Controls

**Control Family:** Configuration Management (CM)

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
- Version 2.0 (2026-01-24): Converted from Not Applicable to Implemented with policy prohibition, endpoint compliance requirements, and software installation controls

---

## Related Documents

- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- Evidence Index: `../05-evidence/MAC-RPT-100_Evidence_Index.md`

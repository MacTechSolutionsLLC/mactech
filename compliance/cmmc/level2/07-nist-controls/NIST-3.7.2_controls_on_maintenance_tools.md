# NIST SP 800-171 Control 3.7.2

**Control ID:** 3.7.2  
**Requirement:** Controls on maintenance tools  
**Control Family:** Maintenance (MA)  
**Reference:** NIST SP 800-171 Rev. 2

---

## 1. Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.7.2:**
"Controls on maintenance tools"

---

## 2. Implementation Status

**Status:** ✅ Implemented

**Status Description:**  
Control is fully implemented. Maintenance tool inventory, access controls, approval process, and monitoring are established.

**Implementation Date:** 2026-01-25

**Last Assessment Date:** 2026-01-25

---

## 3. Policy and Procedure References

**Policy Document:**  
- MAC-POL-221

**Procedure/SOP References:**  
- MAC-SOP-238

**Policy File Location:**  
`../02-policies-and-procedures/`

---

## 4. Implementation Evidence

### 4.1 Code Implementation

**Maintenance Tool Logging:**
- **File:** `lib/maintenance-tool-logging.ts`
- **Functions:** 
  - `logMaintenanceToolAccess()` - Logs tool access events
  - `logMaintenanceToolOperation()` - Logs tool operations and results
- **Integration:** Integrated with audit logging system (`lib/audit.ts`)
- **Event Types:** `maintenance_tool_access`, `maintenance_tool_operation`

### 4.2 System/Configuration Evidence

**Maintenance Tool Inventory:**
- **File:** `compliance/cmmc/level2/05-evidence/MAC-RPT-123_Maintenance_Tool_Inventory_Evidence.md`
- **Contents:** Complete inventory of all maintenance tools with versions, access levels, and authorized personnel
- **Tools Documented:**
  - Database tools (Prisma CLI, Prisma Studio, PostgreSQL)
  - Development tools (Node.js, npm, TypeScript, Next.js)
  - Deployment tools (Railway CLI, Railway platform)
  - Code management tools (Git, GitHub)
  - Monitoring tools (Railway logs, Application audit logs)

**Access Controls:**
- Role-based access control (ADMIN, Developer roles)
- Authentication requirements documented
- Access authorization process established
- Access logging implemented

**Tool Approval Process:**
- Tool request process documented
- Security review process established
- Approval authority defined (System Administrator)
- Approved tool list maintained

### 4.3 Operational Procedures

**Maintenance Tool Control Procedure:**
- **File:** `compliance/cmmc/level2/02-policies-and-procedures/MAC-SOP-238_Maintenance_Tool_Control_Procedure.md`
- **Contents:** Comprehensive procedure covering:
  - Tool approval process
  - Access controls
  - Tool usage monitoring
  - Tool inventory management
  - Tool removal and decommissioning
  - Incident response
  - Compliance verification

## 5. Evidence Documents

**MAC-RPT Evidence Files:**  
- `MAC-RPT-123_Maintenance_Tool_Inventory_Evidence.md` - Comprehensive maintenance tool inventory and controls evidence

---

## 6. Testing and Verification

**Verification Methods:**  
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**  
- ✅ Control 3.7.2 implemented as specified
- ✅ Implementation verified: Maintenance tool inventory, access controls, approval process, monitoring
- ✅ Evidence documented
- ✅ Tool logging operational

**Last Verification Date:** 2026-01-24

---

## 7. SSP References

**System Security Plan Section:**  
- Section 7.10, 3.7.2

**SSP Document:**  
`../01-system-scope/MAC-IT-304_System_Security_Plan.md`

---

## 8. Related Controls

**Control Family:** Maintenance (MA)

**Related Controls in Same Family:**  
- See SCTM for complete control family mapping: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 9. Assessment Notes

### Implementation Details

**Maintenance Tool Inventory:**
- Complete inventory of all maintenance tools documented
- Tools categorized by type (database, development, deployment, code management, monitoring)
- Versions tracked and updated quarterly
- Access levels and authorized personnel documented

**Access Controls:**
- Role-based access control implemented
- ADMIN role: Full access to all maintenance tools
- Developer role: Access to development and build tools
- Authentication requirements enforced
- Access logging operational

**Tool Approval Process:**
- Tool request process established
- Security review process documented
- Approval authority: System Administrator
- Approved tool list maintained in inventory

**Monitoring:**
- Tool usage logged via `lib/maintenance-tool-logging.ts`
- Audit logs track tool access and operations
- Quarterly review process established
- Unauthorized access monitoring implemented

**Tool Management:**
- Tool removal and decommissioning process documented
- Version tracking and update process established
- Quarterly inventory review scheduled

---

### Assessor Notes

*[Space for assessor notes during assessment]*

### Open Items

- None - Control fully implemented

---

## 10. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Prepared Date:** 2026-01-24  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be scheduled]

**Change History:**
- Version 2.0 (2026-01-25): **MAJOR UPDATE - Control Implemented**
  - Created maintenance tool inventory (MAC-RPT-123)
  - Created maintenance tool control procedure (MAC-SOP-238)
  - Implemented maintenance tool logging (`lib/maintenance-tool-logging.ts`)
  - Established access controls and approval process
  - Updated status from "Not Implemented" to "Implemented"
- Version 1.0 (2026-01-24): Initial control assessment file creation
- Version 1.1 (2026-01-24): Enriched with comprehensive evidence from MAC-RPT files

---

## Related Documents

- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- POA&M Document: `../MAC-POAM-CMMC-L2.md`
- Evidence Index: `../05-evidence/MAC-RPT-100_Evidence_Index.md`

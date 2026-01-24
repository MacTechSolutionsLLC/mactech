# Separation of Duties Matrix - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-23  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.1.4

**Applies to:** CMMC 2.0 Level 2 (FCI and CUI system)

---

## 1. Purpose

This document establishes the Separation of Duties (SoD) matrix to reduce the risk of malevolent activity without collusion by separating mission functions and system support functions among different individuals or roles.

---

## 2. Scope

This matrix applies to:
- All system functions and roles
- All administrative functions
- All security functions
- All audit functions

---

## 3. Separation of Duties Requirements

**Requirement:** Separate the duties of individuals to reduce the risk of malevolent activity without collusion.

**Implementation:**
- Administrative functions separated from audit functions
- User account management separated from security assessment
- System administration separated from security monitoring
- Configuration management separated from security assessment

---

## 4. Role Definitions

### 4.1 ADMIN Role

**Functions:**
- System administration
- User account management
- Configuration management
- Evidence export
- Audit log access
- Physical access log management
- Endpoint inventory management

**Restrictions:**
- Cannot perform security assessments on own actions
- Audit functions separated where possible

---

### 4.2 USER Role

**Functions:**
- System use
- Data access (authorized)
- Basic system operations

**Restrictions:**
- No administrative functions
- No audit log access
- No user management
- No configuration changes

---

## 5. Separation of Duties Matrix

| Function | ADMIN Role | USER Role | Separation Requirement |
|---------|------------|-----------|------------------------|
| **System Administration** | ✅ Allowed | ❌ Prohibited | Separated from audit |
| **User Account Management** | ✅ Allowed | ❌ Prohibited | Separated from security assessment |
| **Configuration Management** | ✅ Allowed | ❌ Prohibited | Separated from security assessment |
| **Audit Log Access** | ✅ Allowed | ❌ Prohibited | Separated from system administration where possible |
| **Security Assessment** | ⚠️ Limited | ❌ Prohibited | Separated from system administration |
| **Security Monitoring** | ✅ Allowed | ❌ Prohibited | Separated from system administration |
| **Incident Response** | ✅ Allowed | ⚠️ Reporting only | Separated from system administration |
| **Data Access** | ✅ Allowed | ✅ Allowed (authorized) | No separation needed |
| **System Use** | ✅ Allowed | ✅ Allowed | No separation needed |

---

## 6. Separation Controls

### 6.1 Administrative vs Audit Functions

**Separation:**
- System administrators have access to audit logs for monitoring
- Security assessments conducted separately from system administration
- Audit log review separated from system administration where possible
- Cross-review of administrative actions via audit logs

**Controls:**
- Audit logs capture all administrative actions
- Audit logs reviewed by security contact
- Administrative actions subject to audit review

---

### 6.2 User Account Management vs Security Assessment

**Separation:**
- User account management performed by administrators
- Security assessments review user account management
- Account management actions logged in audit system
- Security assessments independent of account management

**Controls:**
- Account management actions audited
- Security assessments review account management
- Separation maintained through role-based access

---

### 6.3 System Administration vs Security Monitoring

**Separation:**
- System administration functions performed by administrators
- Security monitoring performed via audit logs and system monitoring
- Administrative actions monitored via audit logs
- Monitoring separated from administration

**Controls:**
- Audit logs monitor administrative actions
- Security monitoring independent of administration
- Separation maintained through monitoring tools

---

## 7. Role Conflicts

### 7.1 Identified Conflicts

**Current State:**
- ADMIN role has both system administration and audit log access
- Limited separation due to small organization size

**Mitigation:**
- Audit logs capture all administrative actions
- Security assessments review administrative actions
- Cross-review of functions where possible
- Separation enhanced through procedures and monitoring

---

### 7.2 Conflict Resolution

**Approach:**
- Document role conflicts
- Implement compensating controls
- Enhance separation where possible
- Monitor for separation violations

**Compensating Controls:**
- Comprehensive audit logging
- Security assessment reviews
- Management oversight
- Procedure-based separation

---

## 8. Related Documents

- Access Control Policy: `MAC-POL-210_Access_Control_Policy.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.1, 3.1.4)
- Audit and Accountability Policy: `MAC-POL-218_Audit_and_Accountability_Policy.md`

---

## 9. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be completed]

**Change History:**
- Version 1.0 (2026-01-23): Initial document creation for CMMC Level 2

---

## Appendix A: Regulatory References

- NIST SP 800-171 Rev. 2, Section 3.1.4 (Separation of Duties)
- CMMC 2.0 Level 2 Assessment Guide

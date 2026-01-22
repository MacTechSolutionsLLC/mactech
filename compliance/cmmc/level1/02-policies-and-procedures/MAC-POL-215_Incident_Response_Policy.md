# Incident Response Policy - CMMC Level 1

**Document Version:** 1.0  
**Date:** 2026-01-21  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 1 (Foundational)  
**Reference:** FAR 52.204-21, IR.L1-3.6.2

**Applies to:** CMMC 2.0 Level 1 (FCI-only system)

---

## 1. Policy Statement

MacTech Solutions maintains an incident response capability to identify, report, and respond to security incidents affecting Federal Contract Information (FCI) and system resources. This policy establishes requirements for incident identification, reporting, and response procedures.

This policy aligns with CMMC Level 1 requirements and FAR 52.204-21.

---

## 2. Scope

This policy applies to:
- All security incidents involving FCI
- System security events
- Unauthorized access attempts
- Data breaches or suspected breaches
- Malware infections
- System availability issues affecting FCI

**System Scope:** FCI-only environment. CUI is prohibited and not intentionally processed or stored.

---

## 3. Incident Categories

### 3.1 Security Incidents

**Unauthorized Access:**
- Successful or attempted unauthorized access to system
- Privilege escalation attempts
- Account compromise

**Data Security:**
- Unauthorized disclosure of FCI
- Data loss or corruption
- Suspicious data access patterns

**System Integrity:**
- Malware infections
- Unauthorized system modifications
- Denial of service attacks

**Physical Security:**
- Unauthorized physical access to systems or facilities
- Theft or loss of devices containing system access

---

## 4. Incident Identification

### 4.1 Detection Methods

Incidents may be identified through:
- Application event logs (AppEvent table)
- Authentication failure logs
- System monitoring alerts
- User reports
- Security scanning results
- External notifications

### 4.2 Indicators of Compromise

Common indicators include:
- Multiple failed login attempts
- Unusual access patterns
- Unauthorized administrative actions
- System performance degradation
- Unexpected system changes

---

## 5. Incident Reporting

### 5.1 Reporting Requirements

**Immediate Reporting Required For:**
- Suspected or confirmed data breach
- Unauthorized access to FCI
- System compromise
- Malware infections

**Reporting Timeline:**
- **Critical Incidents**: Immediately (within 1 hour)
- **High Severity**: Within 4 hours
- **Medium Severity**: Within 24 hours
- **Low Severity**: Within 72 hours

### 5.2 Reporting Channels

**Internal Reporting (Required for All Incidents):**

**Primary Contact:**
- Email: security@mactechsolutions.com (or designated security contact)
- Phone: [Designated escalation phone number]

**Alternative Contact:**
- Development team lead
- System administrator

**Decision Authority:**
- The Security Contact (or designated role) determines if external notification is required
- External notification decisions are based on incident severity and contractual obligations
- CMMC Level 1 does not require DoD or customer notification unless contractually required

### 5.3 Report Contents

Incident reports should include:
1. **Incident Description**: What happened
2. **Discovery Time**: When was the incident discovered
3. **Affected Systems**: Which systems or data are affected
4. **Impact Assessment**: Potential or actual impact
5. **Initial Response**: Actions taken so far
6. **Evidence**: Logs, screenshots, or other evidence

---

## 6. Incident Response Procedures

### 6.1 Initial Response

1. **Contain**: Isolate affected systems or accounts
2. **Document**: Record all details and evidence
3. **Report**: Notify security contact immediately
4. **Preserve**: Maintain logs and evidence

### 6.2 Investigation

1. **Gather Evidence**: Collect logs, screenshots, system state
2. **Analyze**: Determine scope and impact
3. **Identify Root Cause**: Determine how incident occurred
4. **Assess Impact**: Evaluate data and system impact

### 6.3 Remediation

1. **Eliminate Threat**: Remove malware, close access vectors
2. **Restore Systems**: Restore from backups if needed
3. **Patch Vulnerabilities**: Address root cause
4. **Verify**: Confirm systems are secure

### 6.4 Recovery

1. **Restore Operations**: Return systems to normal operation
2. **Monitor**: Enhanced monitoring for recurrence
3. **Document**: Complete incident report
4. **Review**: Lessons learned and process improvements

---

## 7. Incident Documentation

### 7.1 Incident Log

All incidents must be documented with:
- Incident ID (unique identifier)
- Discovery date and time
- Incident type and category
- Affected systems or data
- Response actions taken
- Resolution date and time
- Lessons learned

### 7.2 Evidence Preservation

- Preserve logs and evidence for investigation
- Maintain chain of custody for evidence
- Store evidence securely
- Retain evidence per retention policy (minimum 90 days)

---

## 8. Communication

### 8.1 Internal Communication

- Notify security team immediately
- Keep management informed of critical incidents
- Document all communications

### 8.2 External Communication

**Level 1 Scope Clarification:**
- CMMC Level 1 does not require DoD or customer notification unless contractually required
- External notification decisions are made by the Security Contact based on incident severity and contractual obligations
- If external notification is required (per contract), coordinate with affected parties
- Follow legal and contractual obligations
- Maintain confidentiality during investigation

---

## 9. Post-Incident Activities

### 9.1 Lessons Learned

- Review incident response effectiveness
- Identify process improvements
- Update procedures if needed
- Share knowledge with team

### 9.2 Preventive Measures

- Implement additional controls if needed
- Update security configurations
- Enhance monitoring
- Provide additional training if needed

---

## 10. Responsibilities

### 10.1 Security Contact

- Receive and triage incident reports
- Coordinate incident response
- Maintain incident documentation
- Escalate as needed

### 10.2 System Administrators

- Detect and report incidents
- Assist with investigation
- Implement containment measures
- Restore systems

### 10.3 All Personnel

- Report suspicious activity immediately
- Follow incident response procedures
- Preserve evidence
- Cooperate with investigation

---

## 11. Compliance

This policy supports CMMC Level 1 Practice IR.L1-3.6.2: "Report incidents to designated personnel."

**Evidence:**
- Incident response policy (this document)
- Incident response quick card
- Security contact information
- Incident log (if incidents occur)

---

## 12. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be completed]

**Change History:**
- Version 1.0 (2026-01-21): Initial document creation

---

## Appendix A: Related Documents

- Incident Response Quick Card (`../06-supporting-documents/MAC-SEC-107_Incident_Response_Quick_Card.md`)
- Security Policy (`../../SECURITY.md`)
- Event Logging (`../04-self-assessment/MAC-AUD-401_Internal_Cybersecurity_Self-Assessment.md`)

---

## Appendix B: Contact Information

**Security Contact:**
- Email: security@mactechsolutions.com
- Phone: [To be completed]
- Escalation: [To be completed]

**Emergency Contact:**
- [To be completed]

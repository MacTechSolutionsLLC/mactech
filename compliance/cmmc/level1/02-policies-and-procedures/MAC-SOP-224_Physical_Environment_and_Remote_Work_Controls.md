# Physical Environment and Remote Work Controls - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2

**Applies to:** CMMC 2.0 Level 2 (FCI and CUI system)

---

## 1. Purpose

This document describes physical environment and remote work controls for accessing Federal Contract Information (FCI) and Controlled Unclassified Information (CUI) in the MacTech Solutions system. This document addresses assessor concerns regarding physical security evidence and explicitly limits scope to logical access only.

**CMMC Level 2:** This document addresses CUI handling at alternate work sites per NIST SP 800-171 Rev. 2, Section 3.10.6.

---

## 2. System Architecture and FCI Storage

### 2.1 Cloud-Based System

**Architecture:** The MacTech Solutions system is a cloud-based application hosted on Railway platform. All FCI and CUI is stored in a PostgreSQL database hosted on Railway cloud infrastructure.

**FCI/CUI Storage Location:** All FCI and CUI is stored in the cloud database. **No FCI or CUI is stored on local devices.**

**Access Method:** Users access the system via web browser over HTTPS/TLS. Access is logical (network-based) only. No local FCI storage occurs.

---

## 2.2 Logical Access Only

**Scope Limitation:** This system provides logical access to FCI and CUI only. FCI and CUI are not downloaded, cached, or stored on local devices.

**Enforcement:**
- System is accessed via web browser
- FCI and CUI remain in cloud database
- No local file storage of FCI or CUI
- No removable media storage of FCI or CUI

**Evidence:** Database schema and application architecture demonstrate that FCI and CUI are stored only in cloud database. See `prisma/schema.prisma` for FCI and CUI data models.

---

## 3. Controlled Device Requirements

### 3.1 Device Access Control

**Requirement:** FCI may be accessed only from controlled devices that meet security requirements.

**Controlled Device Definition:**
- Devices owned or managed by the organization
- Devices assigned to authorized personnel
- Devices that meet security requirements (see Section 3.2)

**Prohibition:** FCI may not be accessed from:
- Public or shared computers
- Unmanaged personal devices (unless explicitly authorized)
- Devices that do not meet security requirements

---

### 3.2 Device Security Requirements

**Password Protection:**
- Devices must be password-protected
- Strong passwords are required
- Screen lock must be enabled with automatic timeout

**Software Requirements:**
- Operating system must be kept up to date with security patches
- Antivirus/antimalware software must be installed and current (if applicable)
- Browser must support HTTPS/TLS

**Physical Security:**
- Devices must be kept secure when unattended
- Devices must not be left in unsecured locations
- Screen must be positioned to prevent unauthorized viewing

**Evidence:** Device security requirements are procedurally enforced. See Physical Security Policy for additional requirements.

---

## 4. Work-From-Home Physical Security

### 4.1 Physical Environment Controls

**Work Area Security:**
- Work area must be in a private, controlled space
- Work area must be secured when unattended
- Screens must be positioned to prevent unauthorized viewing
- Sensitive information must not be left visible

**Access Control:**
- Work area access must be restricted to authorized personnel only
- Physical access is limited to authorized users and enforced through environmental controls appropriate to the operating environment
- Work area must be secured when not in use

**Environmental Controls:**
- Work area must be protected from environmental hazards
- Devices must be protected from physical damage
- Backup power (if applicable) should be considered

---

### 4.2 Remote Access Security

**Network Security:**
- All remote access must use HTTPS/TLS (inherited from Railway platform)
- Public Wi-Fi should be avoided or used with VPN (if applicable)
- Home network should be secured (WPA2/WPA3 encryption)

**Device Security:**
- Devices used for remote access must meet device security requirements (Section 3.2)
- Devices must be kept secure when unattended
- Screen locks must be enabled

**Access Control:**
- Only authorized personnel may access the system
- Authentication is required for all access
- Session management enforces authentication on each request

**Evidence:** Authentication and access control are enforced via `middleware.ts` and `lib/auth.ts`. Network encryption is provided by Railway platform.

---

## 5. CUI Handling at Alternate Work Sites (3.10.6)

### 5.1 Alternate Work Site Safeguarding

**Requirement:** Enforce safeguarding measures for CUI at alternate work sites.

**Safeguarding Measures:**
- Work area security controls (Section 4.1)
- Device security requirements (Section 3.2)
- Network security controls (Section 4.2)
- Access control enforcement
- CUI handling procedures

**CUI Protection:**
- CUI accessed only from controlled devices
- CUI not stored on local devices
- CUI accessed via secure network connections
- Work area secured when unattended
- Screen positioning prevents unauthorized viewing

**Evidence:**
- Alternate Work Site Safeguarding Evidence: `../05-evidence/MAC-RPT-113_Alternate_Work_Site_Safeguarding_Evidence.md`

---

## 6. FCI Access Limitations

### 5.1 No Local Storage

**Explicit Statement:** FCI is not stored on local devices. All FCI remains in the cloud database.

**Enforcement:**
- System architecture prevents local FCI storage
- Users access FCI via web interface only
- No download functionality for FCI (beyond authorized exports, if any)
- No local caching of FCI beyond standard browser cache (which does not contain FCI)

**Evidence:** Application architecture and database schema demonstrate cloud-only storage. See `prisma/schema.prisma` for FCI data models.

---

### 5.2 Logical Access Scope

**Access Method:** Users access FCI via authenticated web interface over HTTPS/TLS.

**Data Flow:**
1. User authenticates via web browser
2. User requests FCI via web interface
3. System retrieves FCI from cloud database
4. FCI is displayed in web browser
5. FCI is not stored on local device

**Scope:** This system provides logical (network-based) access only. Physical security controls focus on:
- Device security (password protection, screen locks)
- Work area security (private space, visitor control)
- Network security (HTTPS/TLS, secure connections)

---

## 6. Physical Security for Cloud Infrastructure

### 6.1 Inherited Physical Security

**Infrastructure Provider:** Railway cloud platform

**Physical Security:** Railway provides physical security for all cloud infrastructure, including:
- Data center physical access controls
- Environmental controls (temperature, humidity, fire suppression)
- Facility security (guards, surveillance, access logs)
- Redundant power and cooling systems

**Status:** Inherited control from Railway platform. Organization relies on Railway for physical security of cloud infrastructure.

**Evidence:** See `../03-control-responsibility/MAC-SEC-310_Inherited_Control_Statement_Railway.md` for detailed inherited control statement.

---

## 7. Compliance Risks & Open Items

### 7.1 Device Inventory

**Status:** Formal device inventory and tracking may be implemented as a future enhancement. Current focus is on ensuring devices meet security requirements.

---

### 7.2 Remote Access Monitoring

**Status:** Remote access monitoring may be implemented as a future enhancement. Current focus is on authentication and access control enforcement.

---

### 7.3 Non-Required Hardening Items (Future Enhancements)
The following items represent potential future enhancements but are not required for current CMMC Level 2 compliance:
- Device management software (MDM)
- Remote wipe capabilities
- Geolocation tracking
- Formal device security assessments

---

## 8. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be completed]

**Change History:**
- Version 2.0 (2026-01-24): Updated from CMMC Level 1 to Level 2, updated scope to FCI and CUI, updated references to NIST SP 800-171 Rev. 2
- Version 1.0 (2026-01-21): Initial document creation for CMMC Level 1

---

## Appendix A: Related Documents

- Physical Security Policy (`MAC-POL-212_Physical_Security_Policy.md`)
- Access Control Policy (`MAC-POL-210_Access_Control_Policy.md`)
- Inherited Control Statement Railway (`../03-control-responsibility/MAC-SEC-310_Inherited_Control_Statement_Railway.md`)
- System Description (`../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md`)

## Appendix B: Evidence Locations

| Control | Evidence Location |
|---------|------------------|
| FCI/CUI Storage | `prisma/schema.prisma` (FCI and CUI models) |
| Authentication | `lib/auth.ts`, `middleware.ts` |
| Network Encryption | Railway platform (inherited control) |
| Access Control | `middleware.ts` (lines 19-40) |

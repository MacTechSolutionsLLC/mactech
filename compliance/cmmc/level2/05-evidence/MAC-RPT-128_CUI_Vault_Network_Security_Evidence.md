# CUI Vault Network Security Evidence - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-27  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Sections 3.4.2, 3.13.8

**Control IDs:** 3.4.2, 3.13.8  
**Applies to:** CMMC 2.0 Level 2 (CUI system)

---

## 1. Purpose

This document provides evidence of the network security configuration for the CUI vault infrastructure, demonstrating compliance with NIST SP 800-171 Rev. 2 requirements for security configuration settings (3.4.2) and cryptographic mechanisms for CUI in transit (3.13.8).

---

## 2. Network Architecture Overview

**Infrastructure Provider:** Google Cloud Platform (GCP)  
**Service:** Google Compute Engine (GCE)  
**VM Name:** cui-vault-jamy  
**Domain:** vault.mactechsolutionsllc.com  
**Network:** Google Cloud VPC

**Network Components:**
- External network interface (public internet)
- Internal network interface (VPC)
- Database network binding (localhost only)

---

## 3. Network Segmentation

### 3.1 Database Network Isolation

**Database Binding:** localhost only (127.0.0.1:5432)

**Verification:**
```bash
sudo ss -tulpen | grep 5432
```

**Output:**
```
tcp   LISTEN 0      244          127.0.0.1:5432       0.0.0.0:*    users:(("postgres",pid=19735,fd=5)) uid:114 ino:200417 sk:1007 cgroup:/system.slice/system-postgresql.slice/postgresql@14-main.service <->       
```

**Network Binding Details:**
- **Protocol:** TCP
- **Address:** 127.0.0.1 (localhost only)
- **Port:** 5432
- **State:** LISTEN
- **Access:** Local processes only

**Evidence:** Database bound to localhost only, providing network-level isolation from external access.

---

### 3.2 Application Network Access

**Public Access:** HTTPS (port 443)  
**Domain:** vault.mactechsolutionsllc.com  
**Protocol:** HTTPS/TLS 1.3

**Network Access:**
- External access via HTTPS (port 443)
- TLS/HTTPS encryption for all communications
- Security headers configured

**Evidence:** Application accessible via secure HTTPS connection with TLS encryption.

---

## 4. Firewall Configuration

### 4.1 Current Firewall Status

**Firewall System:** UFW (Uncomplicated Firewall)  
**Status:** ⚠️ Inactive

**Verification:**
```bash
sudo ufw status verbose
```

**Output:**
```
Status: inactive
```

**Current State:** Firewall is not active

---

### 4.2 Firewall Remediation Required

**Issue:** UFW firewall is inactive, leaving system without host-based firewall protection

**Remediation Plan:**
1. Configure UFW firewall rules
2. Allow HTTPS (port 443) inbound
3. Allow SSH (port 22) inbound (for management)
4. Deny all other inbound connections
5. Enable UFW firewall
6. Verify firewall rules are active

**Recommended Firewall Rules:**
```bash
# Allow HTTPS
sudo ufw allow 443/tcp

# Allow SSH (for management)
sudo ufw allow 22/tcp

# Deny all other inbound
sudo ufw default deny incoming

# Allow all outbound
sudo ufw default allow outgoing

# Enable firewall
sudo ufw enable
```

**Priority:** High  
**Target Completion:** 2026-02-03

**POAM Reference:** POAM-010 (CUI Vault Firewall Configuration)

**Evidence:** Firewall configuration required and tracked in POAM.

---

## 5. TLS/HTTPS Network Security

### 5.1 TLS Configuration

**Protocol:** TLS 1.3  
**Cipher Suite:** TLS_AES_256_GCM_SHA384  
**Port:** 443 (HTTPS)

**TLS Verification:**
```bash
openssl s_client -connect vault.mactechsolutionsllc.com:443 </dev/null | grep -E "Protocol|Cipher"
```

**Output:**
```
New, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384
```

**Evidence:** Strong TLS encryption configured for all network communications.

---

### 5.2 Security Headers

**Security Headers Configured:**

1. **Strict-Transport-Security (HSTS)**
   - `max-age=63072000; includeSubDomains`
   - Enforces HTTPS connections

2. **X-Content-Type-Options**
   - `nosniff`
   - Prevents MIME type sniffing

3. **X-Frame-Options**
   - `DENY`
   - Prevents clickjacking

4. **X-XSS-Protection**
   - `1; mode=block`
   - Enables XSS filtering

**Evidence:** Comprehensive security headers configured for network security.

---

## 6. Network Access Controls

### 6.1 API Authentication

**Authentication Method:** API key via HTTP header  
**Header Name:** `X-VAULT-KEY`  
**Key Storage:** Systemd environment variables

**Access Control:**
- API key required for all API requests
- Unauthenticated requests return 401 Unauthorized
- API key stored securely in systemd environment

**Evidence:**
```bash
# Unauthenticated request
curl -i https://vault.mactechsolutionsllc.com/health
# Response: HTTP/2 401 {"detail":"Unauthorized"}

# Authenticated request
curl -s https://vault.mactechsolutionsllc.com/cui/store \
  -H "X-VAULT-KEY: [API_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"test":"CUI_SAMPLE"}'
# Response: {"stored":true,"id":"..."}
```

**Evidence:** API authentication implemented via API key header.

---

### 6.2 Database Access Control

**Access Method:** Localhost only  
**Authentication:** PostgreSQL user authentication  
**Network Isolation:** Database not accessible from external network

**Evidence:** Database access restricted to localhost with user authentication.

---

## 7. Google Cloud Platform Network Security

### 7.1 VPC Network

**Network Type:** Google Cloud VPC (Virtual Private Cloud)  
**Network Isolation:** VPC provides logical network isolation

**Network Features:**
- VPC network isolation
- Firewall rules at VPC level
- Network segmentation capabilities

**Evidence:** Google Cloud VPC provides network-level isolation and security.

---

### 7.2 Google Cloud Firewall Rules

**Firewall Management:** Google Cloud Platform firewall rules  
**Configuration:** [To be documented]  
**Status:** Managed by Google Cloud Platform

**Evidence:** Google Cloud Platform provides network-level firewall rules.

---

## 8. Network Monitoring and Logging

### 8.1 Network Access Logging

**Logging System:** [To be documented]  
**Log Retention:** [To be documented]  
**Log Review:** [To be documented]

**Status:** ⚠️ Network access logging to be configured

---

### 8.2 Network Monitoring

**Monitoring System:** [To be documented]  
**Alert Configuration:** [To be documented]  
**Monitoring Frequency:** [To be documented]

**Status:** ⚠️ Network monitoring to be configured

---

## 9. Compliance with Controls

### 9.1 Control 3.4.2 - Security Configuration Settings

**Requirement:** Establish and maintain secure configuration settings for system components.

**Implementation:**
- ✅ TLS/HTTPS configured with strong cipher suite
- ✅ Security headers configured
- ✅ Database bound to localhost only
- ⚠️ Host-based firewall (UFW) inactive (remediation in progress)

**Status:** ⚠️ Partially Satisfied (firewall configuration pending)

**Remediation:** POAM-010 tracks firewall configuration.

---

### 9.2 Control 3.13.8 - Cryptographic Mechanisms for CUI in Transit

**Requirement:** Employ cryptographic mechanisms to protect the confidentiality of CUI in transit.

**Implementation:**
- ✅ TLS 1.3 protocol implemented
- ✅ Strong cipher suite (TLS_AES_256_GCM_SHA384)
- ✅ Valid SSL certificate
- ✅ All CUI transmission encrypted via HTTPS/TLS

**Status:** ✅ Implemented

---

## 10. Network Security Recommendations

### 10.1 Immediate Actions

1. **Enable UFW Firewall** (Priority: High)
   - Configure firewall rules
   - Enable UFW firewall
   - Verify firewall is active

2. **Configure Network Monitoring** (Priority: Medium)
   - Set up network access logging
   - Configure monitoring alerts
   - Establish log review process

3. **Document Google Cloud Firewall Rules** (Priority: Medium)
   - Document VPC firewall rules
   - Verify firewall rule configuration
   - Document network access policies

---

### 10.2 Ongoing Maintenance

1. **Regular Firewall Rule Review**
   - Review firewall rules quarterly
   - Verify only necessary ports are open
   - Document any rule changes

2. **Network Security Monitoring**
   - Monitor network access logs
   - Review security alerts
   - Investigate suspicious activity

3. **Security Configuration Updates**
   - Keep TLS configuration current
   - Update security headers as needed
   - Review and update firewall rules

---

## 11. Related Documents

- CUI Vault Deployment Evidence: `MAC-RPT-125_CUI_Vault_Deployment_Evidence.md`
- CUI Vault TLS Configuration: `MAC-RPT-126_CUI_Vault_TLS_Configuration_Evidence.md`
- CUI Vault Database Encryption: `MAC-RPT-127_CUI_Vault_Database_Encryption_Evidence.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- POAM Tracking Log: `../04-self-assessment/MAC-AUD-405_POA&M_Tracking_Log.md`
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 12. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-27

**Change History:**
- **Version 1.0 (2026-01-27):** Initial network security evidence document

---

**Document Status:** This document provides evidence of the CUI vault network security configuration and is maintained under configuration control as part of the MacTech Solutions compliance documentation package.

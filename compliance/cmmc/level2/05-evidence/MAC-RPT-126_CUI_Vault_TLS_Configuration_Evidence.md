# CUI Vault TLS Configuration Evidence - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-27  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Sections 3.13.8, 3.13.11

**Control IDs:** 3.13.8, 3.13.11  
**Applies to:** CMMC 2.0 Level 2 (CUI system)

---

## 1. Purpose

This document provides evidence of the TLS/HTTPS configuration for the CUI vault infrastructure, demonstrating compliance with NIST SP 800-171 Rev. 2 requirements for cryptographic mechanisms for CUI in transit (3.13.8) and FIPS-validated cryptography (3.13.11).

---

## 2. TLS Configuration Summary

**Protocol:** TLS 1.3  
**Cipher Suite:** TLS_AES_256_GCM_SHA384  
**Certificate Authority:** Let's Encrypt  
**Certificate Subject:** CN = vault.mactechsolutionsllc.com  
**Domain:** vault.mactechsolutionsllc.com  
**Port:** 443 (HTTPS)

**Status:** ✅ Operational and configured

---

## 3. TLS Protocol and Cipher Suite

### 3.1 TLS Protocol Version

**Protocol:** TLS 1.3  
**Status:** ✅ Active

**Verification:**
```bash
openssl s_client -connect vault.mactechsolutionsllc.com:443 </dev/null | grep -E "Protocol|Cipher"
```

**Output:**
```
New, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384
```

**Evidence:** TLS 1.3 protocol is active and operational.

---

### 3.2 Cipher Suite

**Cipher Suite:** TLS_AES_256_GCM_SHA384

**Components:**
- **Key Exchange:** TLS 1.3 key exchange (ECDHE)
- **Encryption Algorithm:** AES-256 (Advanced Encryption Standard, 256-bit key)
- **Mode of Operation:** GCM (Galois/Counter Mode)
- **Hash Algorithm:** SHA-384 (Secure Hash Algorithm, 384-bit)

**FIPS Compliance:**
- AES-256: FIPS-approved encryption algorithm
- GCM: FIPS-approved mode of operation
- SHA-384: FIPS-approved hash algorithm
- **Status:** ✅ FIPS-compliant cipher suite

**Evidence:** Strong, FIPS-compliant cipher suite in use for all CUI in transit.

---

## 4. SSL Certificate Configuration

### 4.1 Certificate Details

**Certificate Subject:** CN = vault.mactechsolutionsllc.com  
**Issuer:** C = US, O = Let's Encrypt, CN = R12  
**Certificate Authority:** Let's Encrypt  
**Root CA:** C = US, O = Internet Security Research Group, CN = ISRG Root X1

**Certificate Validity:**
- **Not Before:** Jan 27 03:18:34 2026 GMT
- **Not After:** Apr 27 03:18:33 2026 GMT
- **Validity Period:** 90 days (Let's Encrypt standard)

**Certificate Chain:**
```
0 s:CN = vault.mactechsolutionsllc.com
   i:C = US, O = Let's Encrypt, CN = R12
   a:PKEY: rsaEncryption, 2048 (bit); sigalg: RSA-SHA256
   v:NotBefore: Jan 27 03:18:34 2026 GMT; NotAfter: Apr 27 03:18:33 2026 GMT
1 s:C = US, O = Let's Encrypt, CN = R12
   i:C = US, O = Internet Security Research Group, CN = ISRG Root X1
   a:PKEY: rsaEncryption, 2048 (bit); sigalg: RSA-SHA256
   v:NotBefore: Mar 13 00:00:00 2024 GMT; NotAfter: Mar 12 23:59:59 2027 GMT
```

**Verification Status:** ✅ Valid certificate chain verified

**Evidence:** Valid SSL certificate with proper certificate chain from trusted CA (Let's Encrypt).

---

### 4.2 Certificate Verification

**OpenSSL Verification:**
```bash
openssl s_client -connect vault.mactechsolutionsllc.com:443 </dev/null
```

**Verification Results:**
- **Certificate Chain:** ✅ Verified (depth 2, return code: 1)
- **Server Certificate:** ✅ Verified (depth 0, return code: 1)
- **Peer Signature:** ✅ RSA-SHA256
- **Server Public Key:** ✅ 2048 bit RSA
- **Verify Return Code:** ✅ 0 (ok)

**Evidence:** SSL certificate properly configured and verified.

---

## 5. Security Headers Configuration

**Security Headers Implemented:**

1. **Strict-Transport-Security (HSTS)**
   - Header: `strict-transport-security: max-age=63072000; includeSubDomains`
   - Max Age: 63,072,000 seconds (2 years)
   - Include SubDomains: ✅ Enabled
   - **Purpose:** Enforce HTTPS connections, prevent downgrade attacks

2. **X-Content-Type-Options**
   - Header: `x-content-type-options: nosniff`
   - **Purpose:** Prevent MIME type sniffing

3. **X-Frame-Options**
   - Header: `x-frame-options: DENY`
   - **Purpose:** Prevent clickjacking attacks

4. **X-XSS-Protection**
   - Header: `x-xss-protection: 1; mode=block`
   - **Purpose:** Enable XSS filtering in browsers

**Evidence:**
```bash
curl -i https://vault.mactechsolutionsllc.com/health
```

**Response Headers:**
```
HTTP/2 401 
server: nginx
date: Tue, 27 Jan 2026 06:11:00 GMT
content-type: application/json
content-length: 25
strict-transport-security: max-age=63072000; includeSubDomains
x-content-type-options: nosniff
x-frame-options: DENY
x-xss-protection: 1; mode=block
```

**Evidence:** Comprehensive security headers configured and operational.

---

## 6. TLS Session Configuration

### 6.1 Session Parameters

**Session ID:** Generated per connection  
**Session Resumption:** ✅ Supported (PSK - Pre-Shared Key)  
**Session Ticket Lifetime:** 600 seconds (10 minutes)  
**Early Data:** Not sent (0 bytes)

**TLS Session Details:**
- **Protocol:** TLSv1.3
- **Cipher:** TLS_AES_256_GCM_SHA384
- **Session-ID:** Unique per connection
- **Resumption PSK:** Supported for session resumption
- **Timeout:** 7200 seconds (2 hours)

**Evidence:** TLS session management properly configured with secure session resumption.

---

### 6.2 Server Configuration

**Server:** nginx  
**HTTP Version:** HTTP/2  
**TLS Termination:** nginx

**Server Configuration Evidence:**
- nginx web server handling TLS termination
- HTTP/2 protocol support
- Proper TLS configuration

---

## 7. FIPS Compliance Assessment

### 7.1 Cipher Suite FIPS Compliance

**Cipher Suite:** TLS_AES_256_GCM_SHA384

**FIPS Compliance Components:**
- ✅ **AES-256:** FIPS-approved encryption algorithm (FIPS 197)
- ✅ **GCM Mode:** FIPS-approved mode of operation (SP 800-38D)
- ✅ **SHA-384:** FIPS-approved hash algorithm (FIPS 180-4)
- ✅ **TLS 1.3:** Industry-standard protocol with strong security

**FIPS Compliance Status:** ✅ FIPS-compliant cipher suite

---

### 7.2 OpenSSL Version

**OpenSSL Version:** 3.0.2 (built Mar 2022)

**Version Details:**
```bash
openssl version -a
```

**Output:**
```
OpenSSL 3.0.2 15 Mar 2022 (Library: OpenSSL 3.0.2 15 Mar 2022)
built on: Tue Oct  7 09:28:46 2025 UTC
platform: debian-amd64
options:  bn(64,64)
compiler: gcc -fPIC -pthread -m64 -Wa,--noexecstack -Wall -Wa,--noexecstack -g -O2 -ffile-prefix-map=/build/openssl-Kjyy61/openssl-3.0.2=. -flto=auto -ffat-lto-objects -flto=auto -ffat-lto-objects -fstack-protector-strong -Wformat -Werror=format-security -DOPENSSL_TLS_SECURITY_LEVEL=2 -DOPENSSL_USE_NODELETE -DL_ENDIAN -DOPENSSL_PIC -DOPENSSL_BUILDING_OPENSSL -DNDEBUG -Wdate-time -D_FORTIFY_SOURCE=2
OPENSSLDIR: "/usr/lib/ssl"
ENGINESDIR: "/usr/lib/x86_64-linux-gnu/engines-3"
MODULESDIR: "/usr/lib/x86_64-linux-gnu/ossl-modules-3"
Seeding source: os-specific
CPUINFO: OPENSSL_ia32cap=0xfefa32035f8bffff:0x1c2ffb
```

**Security Level:** OPENSSL_TLS_SECURITY_LEVEL=2 (configured)

**FIPS Validation Status:** ⚠️ Requires verification against CMVP database

**Action Required:**
- Verify OpenSSL 3.0.2 FIPS validation status
- Check CMVP database for validated OpenSSL modules
- Document FIPS validation evidence if available

**Reference:** See `MAC-RPT-110_FIPS_Cryptography_Assessment_Evidence.md`

---

## 8. TLS Configuration Compliance

### 8.1 Control 3.13.8 - Cryptographic Mechanisms for CUI in Transit

**Requirement:** Employ cryptographic mechanisms to protect the confidentiality of CUI in transit.

**Implementation:**
- ✅ TLS 1.3 protocol implemented
- ✅ Strong cipher suite (TLS_AES_256_GCM_SHA384)
- ✅ Valid SSL certificate with proper chain
- ✅ All CUI transmission encrypted via HTTPS/TLS
- ✅ Security headers configured

**Status:** ✅ Implemented

---

### 8.2 Control 3.13.11 - FIPS-Validated Cryptography

**Requirement:** Employ FIPS-validated cryptography when used to protect the confidentiality of CUI.

**Implementation:**
- ✅ FIPS-compliant cipher suite (AES-256-GCM-SHA384)
- ⚠️ OpenSSL 3.0.2 FIPS validation status requires verification

**Status:** ⚠️ Partially Satisfied (FIPS-compliant cipher suite in use, FIPS validation verification pending)

**Note:** The cipher suite components (AES-256, GCM, SHA-384) are all FIPS-approved algorithms. OpenSSL FIPS module validation status requires verification against CMVP database.

---

## 9. Related Documents

- CUI Vault Deployment Evidence: `MAC-RPT-125_CUI_Vault_Deployment_Evidence.md`
- FIPS Cryptography Assessment: `MAC-RPT-110_FIPS_Cryptography_Assessment_Evidence.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 10. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-27

**Change History:**
- **Version 1.0 (2026-01-27):** Initial TLS configuration evidence document

---

**Document Status:** This document provides evidence of the CUI vault TLS configuration and is maintained under configuration control as part of the MacTech Solutions compliance documentation package.

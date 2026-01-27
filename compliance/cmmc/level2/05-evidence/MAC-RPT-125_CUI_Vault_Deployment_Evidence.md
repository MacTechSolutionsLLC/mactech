# CUI Vault Deployment Evidence - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-27  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Sections 3.1.3, 3.8.2, 3.13.16

**Control IDs:** 3.1.3, 3.8.2, 3.13.16  
**Applies to:** CMMC 2.0 Level 2 (CUI system)

---

## 1. Purpose

This document provides evidence of the deployment of a dedicated CUI vault infrastructure on Google Compute Engine (GCE) to provide secure, isolated storage for Controlled Unclassified Information (CUI). The CUI vault implements dedicated storage with encryption at rest and in transit, access controls, and comprehensive audit logging.

---

## 2. System Identification

**System Name:** CUI Vault  
**System Type:** Dedicated CUI Storage Infrastructure  
**Hosting:** Google Compute Engine (GCE)  
**Operating System:** Ubuntu (Linux)  
**Domain:** vault.mactechsolutionsllc.com  
**VM Name:** cui-vault-jamy  
**Deployment Date:** 2026-01-27

**Infrastructure Details:**
- **Cloud Provider:** Google Cloud Platform (GCP)
- **Compute Engine:** Google Compute Engine VM
- **Region:** [To be documented]
- **Zone:** [To be documented]
- **Instance Type:** [To be documented]
- **Network:** Google Cloud VPC

---

## 3. Deployment Evidence

### 3.1 System Service Configuration

**Service Name:** cui-vault  
**Service Type:** systemd service  
**Status:** Active and running

**Environment Variables:**
```
CUI_VAULT_API_KEY=77564883c27638b3dd8b969b6304ef6106d9dd676cf2b5f4956564bb603559fd
DB_NAME=cuivault
DB_USER=cuivault_user
```

**Service Verification:**
```bash
sudo systemctl show cui-vault -p Environment
```

**Evidence:** Systemd service configured and operational with secure environment variables for API authentication and database access.

---

### 3.2 Database Configuration

**Database System:** PostgreSQL  
**Database Name:** cuivault  
**Database User:** cuivault_user  
**Connection:** Localhost only (127.0.0.1:5432)

**Database Schema:**
```sql
Table: public.cui_records
Columns:
- id (uuid, PRIMARY KEY)
- ciphertext (bytea, NOT NULL)
- nonce (bytea, NOT NULL)
- tag (bytea, NOT NULL)
- created_at (timestamp with time zone, DEFAULT now())
```

**Database Access Verification:**
```bash
sudo -u postgres psql cuivault -c "\d+ public.cui_records"
sudo -u postgres psql cuivault -c "SELECT id, created_at FROM public.cui_records LIMIT 5;"
```

**Network Binding:**
```bash
sudo ss -tulpen | grep 5432
# Result: tcp LISTEN 0 244 127.0.0.1:5432
```

**Evidence:** PostgreSQL database configured with:
- Localhost-only binding (127.0.0.1:5432) - not accessible from external network
- Encrypted CUI records table with ciphertext, nonce, and tag fields
- Timestamp tracking for audit purposes
- Database operational and storing CUI records

---

### 3.3 API Functionality

**API Endpoint:** https://vault.mactechsolutionsllc.com  
**Health Check:** `/health`  
**CUI Storage Endpoint:** `/cui/store`

**API Authentication:**
- Header-based authentication: `X-VAULT-KEY`
- API key stored in systemd environment variables
- Secure key management

**API Test Evidence:**
```bash
# Health check (returns 401 Unauthorized - expected for unauthenticated requests)
curl -i https://vault.mactechsolutionsllc.com/health

# CUI storage test (successful)
curl -s https://vault.mactechsolutionsllc.com/cui/store \
  -H "X-VAULT-KEY: 77564883c27638b3dd8b969b6304ef6106d9dd676cf2b5f4956564bb603559fd" \
  -H "Content-Type: application/json" \
  -d '{"test":"CUI_SAMPLE"}'
# Response: {"stored":true,"id":"696edbf3-9e33-4d9e-a08c-40dc473cf1e5"}
```

**Evidence:** API operational with:
- Authentication via API key header
- Successful CUI storage functionality
- Unique record ID generation
- JSON response format

---

### 3.4 Encryption Library Verification

**Encryption Library:** Python cryptography library  
**Algorithm:** AES-GCM (Advanced Encryption Standard - Galois/Counter Mode)

**Verification:**
```bash
python3 - << 'EOF'
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
print("AESGCM available and loaded")
EOF
# Output: AESGCM available and loaded
```

**Evidence:** AES-GCM encryption library available and operational for CUI encryption operations.

---

## 4. Security Controls Implementation

### 4.1 Access Control

**Database Access:**
- PostgreSQL bound to localhost only (127.0.0.1:5432)
- No external network access to database
- Database user authentication required

**API Access:**
- API key authentication required (`X-VAULT-KEY` header)
- HTTPS/TLS encryption for all API communications
- Security headers implemented (HSTS, X-Frame-Options, etc.)

**Evidence:** Multi-layer access control implemented:
- Network-level: Database localhost-only binding
- Application-level: API key authentication
- Transport-level: TLS/HTTPS encryption

---

### 4.2 Encryption at Rest

**Database Encryption:**
- CUI records stored with encrypted fields (ciphertext, nonce, tag)
- AES-GCM encryption algorithm
- Encryption keys managed securely (not stored in database)

**Storage Encryption:**
- Google Cloud Platform provides disk encryption at rest
- Additional application-level encryption for CUI records

**Evidence:** CUI data encrypted at multiple layers:
- Application-level: AES-GCM encryption of CUI records
- Infrastructure-level: Google Cloud disk encryption

---

### 4.3 Encryption in Transit

**TLS Configuration:**
- TLS 1.3 protocol
- Cipher: TLS_AES_256_GCM_SHA384
- Certificate: Let's Encrypt (CN = vault.mactechsolutionsllc.com)
- Certificate chain: Let's Encrypt R12 → ISRG Root X1

**TLS Verification:**
```bash
openssl s_client -connect vault.mactechsolutionsllc.com:443 </dev/null | grep -E "Protocol|Cipher"
# Result: New, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384
```

**Security Headers:**
- Strict-Transport-Security: max-age=63072000; includeSubDomains
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block

**Evidence:** Strong encryption in transit implemented:
- TLS 1.3 with FIPS-compliant cipher suite
- Valid SSL certificate with proper chain
- Security headers configured

---

## 5. Open Items and Remediation

### 5.1 Firewall Configuration

**Current Status:** UFW (Uncomplicated Firewall) is inactive

**Verification:**
```bash
sudo ufw status verbose
# Result: Status: inactive
```

**Remediation Required:**
- Configure UFW firewall rules
- Allow only necessary ports (HTTPS: 443)
- Deny all other inbound connections
- Enable UFW firewall

**POAM Reference:** POAM-010 (CUI Vault Firewall Configuration)

**Priority:** High  
**Target Completion:** 2026-02-03

---

### 5.2 Ubuntu OpenSSL Cryptographic Module (FIPS Provider)

**Module Name:** Ubuntu 22.04 OpenSSL Cryptographic Module  
**Module Version:** 3.0.5-0ubuntu0.1+Fips2.1  
**Base OpenSSL Library:** 3.0.2 (not the validated component)  
**FIPS Provider Status:** ✅ Active  
**Kernel FIPS Mode:** ✅ Enabled (`/proc/sys/crypto/fips_enabled = 1`)

**FIPS Validation:**
- **Validation Type:** Inherited from Canonical's CMVP FIPS 140-3 certification
- **Module Provider:** Canonical Ltd.
- **Validation Status:** ✅ FIPS-validated

**Implementation:**
Although the base OpenSSL library version is 3.0.2, cryptographic operations protecting CUI are performed by Canonical's Ubuntu 22.04 OpenSSL Cryptographic Module operating in FIPS-approved mode. Validation is inherited from Canonical's CMVP FIPS 140-3 certification for the Ubuntu OpenSSL module.

**Verification Evidence:**
- FIPS kernel enabled: `/proc/sys/crypto/fips_enabled = 1`
- FIPS provider active: `openssl list -providers` shows Ubuntu 22.04 OpenSSL Cryptographic Module (status: active)
- Ubuntu FIPS packages installed: `openssl-fips-module-3:amd64 3.0.5-0ubuntu0.1+Fips2.1`

**Base OpenSSL Library Information:**
```bash
openssl version -a
# OpenSSL 3.0.2 15 Mar 2022 (Library: OpenSSL 3.0.2 15 Mar 2022)
```

**Reference:** See `MAC-RPT-110_FIPS_Cryptography_Assessment_Evidence.md`

---

## 6. Related Documents

- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- System Architecture: `../01-system-scope/MAC-IT-301_System_Description_and_Architecture.md`
- CUI Vault TLS Configuration: `MAC-RPT-126_CUI_Vault_TLS_Configuration_Evidence.md`
- CUI Vault Database Encryption: `MAC-RPT-127_CUI_Vault_Database_Encryption_Evidence.md`
- CUI Vault Network Security: `MAC-RPT-128_CUI_Vault_Network_Security_Evidence.md`
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 7. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-27

**Change History:**
- **Version 1.0 (2026-01-27):** Initial CUI vault deployment evidence document

---

**Document Status:** This document provides evidence of the CUI vault deployment and is maintained under configuration control as part of the MacTech Solutions compliance documentation package.

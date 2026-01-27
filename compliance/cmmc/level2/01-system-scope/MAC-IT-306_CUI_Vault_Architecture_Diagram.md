# CUI Vault Architecture Diagram - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-27  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2

**Applies to:** CMMC 2.0 Level 2 (CUI system)

---

## 1. Purpose

This document provides the architecture diagram and detailed description of the CUI vault infrastructure, showing network architecture, data flow, security controls, and encryption points for the dedicated CUI storage system.

---

## 2. CUI Vault Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CUI VAULT ARCHITECTURE - CMMC LEVEL 2                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL NETWORK (Internet)                              │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    Main Application (Railway)                        │  │
│  │  - Next.js Application                                              │  │
│  │  - CUI file upload/access logic                                      │  │
│  │  - API client for CUI vault                                          │  │
│  └──────────────────────┬──────────────────────────────────────────────┘  │
│                         │ HTTPS/TLS 1.3                                     │
│                         │ (AES-256-GCM-SHA384)                              │
│                         │ API Key Authentication                            │
│                         │ vault.mactechsolutionsllc.com:443                │
│                         ▼                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                         │
                         │ Google Cloud Platform VPC
                         │ Network Boundary
                         │
┌────────────────────────▼─────────────────────────────────────────────────────┐
│              CUI VAULT INFRASTRUCTURE (Google Compute Engine)                │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    PUBLIC NETWORK SEGMENT                           │  │
│  │  ┌───────────────────────────────────────────────────────────────┐ │  │
│  │  │  nginx Web Server                                              │ │  │
│  │  │  - TLS 1.3 termination                                         │ │  │
│  │  │  - Security headers (HSTS, X-Frame-Options, etc.)              │ │  │
│  │  │  - API request routing                                          │ │  │
│  │  └──────────────────────┬──────────────────────────────────────────┘ │  │
│  │                         │ Internal Network (localhost)                │  │
│  │                         ▼                                            │  │
│  │  ┌───────────────────────────────────────────────────────────────┐ │  │
│  │  │  CUI Vault Service (systemd)                                    │ │  │
│  │  │  - REST API endpoints                                           │ │  │
│  │  │  - API key authentication                                        │ │  │
│  │  │  - CUI encryption/decryption (AES-256-GCM)                        │ │  │
│  │  │  - Database operations                                          │ │  │
│  │  └──────────────────────┬──────────────────────────────────────────┘ │  │
│  │                         │ PostgreSQL Connection                      │  │
│  │                         │ (localhost only)                            │  │
│  │                         ▼                                            │  │
│  │  ┌───────────────────────────────────────────────────────────────┐ │  │
│  │  │  INTERNAL NETWORK SEGMENT (localhost)                          │ │  │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │  │
│  │  │  │  PostgreSQL Database                                     │ │ │  │
│  │  │  │  - Database: cuivault                                     │ │ │  │
│  │  │  │  - Binding: 127.0.0.1:5432 (localhost only)              │ │ │  │
│  │  │  │  - Table: cui_records                                     │ │ │  │
│  │  │  │    * id (uuid)                                            │ │ │  │
│  │  │  │    * ciphertext (bytea) - Encrypted CUI data             │ │ │  │
│  │  │  │    * nonce (bytea) - Encryption nonce/IV                  │ │ │  │
│  │  │  │    * tag (bytea) - Authentication tag                    │ │ │  │
│  │  │  │    * created_at (timestamp)                               │ │ │  │
│  │  │  │  - Encryption: AES-256-GCM (application-level)           │ │ │  │
│  │  │  │  - Disk encryption: Google Cloud Platform (infrastructure)│ │ │  │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │  │
│  │  └─────────────────────────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Infrastructure Security:                                                  │
│  - Google Cloud Platform VPC network isolation                             │
│  - Google Cloud Platform firewall rules                                     │
│  - Google Cloud Platform disk encryption at rest                            │
│  - Physical security (inherited from Google Cloud Platform)                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Network Architecture

### 3.1 Network Segments

**Public Network Segment:**
- **Component:** nginx web server
- **Access:** Public internet via HTTPS (port 443)
- **Domain:** vault.mactechsolutionsllc.com
- **Protocol:** TLS 1.3
- **Cipher Suite:** TLS_AES_256_GCM_SHA384
- **Security:** TLS termination, security headers, API routing

**Internal Network Segment:**
- **Component:** CUI vault service and PostgreSQL database
- **Access:** Localhost only (127.0.0.1)
- **Network Binding:** Database bound to 127.0.0.1:5432
- **Security:** No external network access to database

**Infrastructure Network:**
- **Component:** Google Cloud Platform VPC
- **Access:** VPC network isolation
- **Security:** VPC firewall rules, network segmentation

---

## 4. Data Flow

### 4.1 CUI Storage Flow

1. **Ingress:**
   - Main application initiates HTTPS/TLS 1.3 connection to CUI vault
   - API request includes API key in `X-VAULT-KEY` header
   - CUI data sent in request body (JSON format)

2. **TLS Encryption:**
   - Data encrypted in transit via TLS 1.3 (AES-256-GCM-SHA384)
   - Certificate: Let's Encrypt (vault.mactechsolutionsllc.com)
   - Security headers applied (HSTS, X-Frame-Options, etc.)

3. **API Processing:**
   - nginx receives and routes request
   - CUI vault service authenticates API key
   - CUI data encrypted using AES-256-GCM
   - Encrypted components (ciphertext, nonce, tag) generated

4. **Database Storage:**
   - Encrypted CUI record stored in PostgreSQL database
   - Database connection via localhost only (127.0.0.1:5432)
   - Database files encrypted at rest by Google Cloud Platform

5. **Response:**
   - Unique record ID returned to main application
   - Response encrypted via TLS 1.3

---

### 4.2 CUI Retrieval Flow

1. **Request:**
   - Main application requests CUI record by ID
   - API key authentication required
   - HTTPS/TLS 1.3 encryption

2. **Database Retrieval:**
   - CUI vault service queries database (localhost connection)
   - Encrypted record retrieved (ciphertext, nonce, tag)

3. **Decryption:**
   - CUI vault service decrypts record using AES-256-GCM
   - Decryption key retrieved from secure storage

4. **Response:**
   - Decrypted CUI data returned to main application
   - Response encrypted via TLS 1.3

---

## 5. Security Controls

### 5.1 Encryption Points

**Data in Transit:**
- **Point 1:** Main application to CUI vault (TLS 1.3, AES-256-GCM-SHA384)
- **Point 2:** nginx to CUI vault service (internal network, localhost)
- **Encryption:** TLS 1.3 with FIPS-compliant cipher suite

**Data at Rest:**
- **Point 1:** Application-level encryption (AES-256-GCM)
  - CUI data encrypted before database storage
  - Separate fields for ciphertext, nonce, and tag
- **Point 2:** Infrastructure-level encryption (Google Cloud Platform)
  - Disk encryption at rest for all persistent storage
  - Database files automatically encrypted

---

### 5.2 Access Controls

**Network Access:**
- Database bound to localhost only (127.0.0.1:5432)
- No external network access to database
- VPC firewall rules at infrastructure level

**Application Access:**
- API key authentication required (`X-VAULT-KEY` header)
- API key stored in systemd environment variables
- Unauthenticated requests return 401 Unauthorized

**Database Access:**
- PostgreSQL user authentication required
- Database access restricted to localhost processes
- No direct database access from external network

---

### 5.3 Network Security

**Firewall Configuration:**
- Google Cloud Platform VPC firewall rules (infrastructure level)
- UFW firewall (host-based) - ⚠️ Currently inactive (POAM-014 tracks remediation)

**Network Isolation:**
- Database isolated on localhost network segment
- VPC network isolation at infrastructure level
- Logical separation between public and internal network segments

---

## 6. Infrastructure Components

### 6.1 Compute Infrastructure

**Provider:** Google Cloud Platform  
**Service:** Google Compute Engine (GCE)  
**VM Name:** cui-vault-jamy  
**Operating System:** Ubuntu (Linux)  
**Region/Zone:** [To be documented]

---

### 6.2 Service Components

**Web Server:** nginx
- TLS 1.3 termination
- Security headers configuration
- API request routing

**Application Service:** CUI vault service (systemd)
- REST API implementation
- API key authentication
- AES-256-GCM encryption/decryption
- Database operations

**Database:** PostgreSQL
- Version: [To be documented]
- Database name: cuivault
- Database user: cuivault_user
- Network binding: 127.0.0.1:5432

---

### 6.3 Security Components

**TLS/SSL:**
- Protocol: TLS 1.3
- Cipher Suite: TLS_AES_256_GCM_SHA384
- Certificate: Let's Encrypt (vault.mactechsolutionsllc.com)
- Certificate Authority: Let's Encrypt R12 → ISRG Root X1

**Encryption:**
- Application-level: AES-256-GCM (Python cryptography library)
- Infrastructure-level: Google Cloud Platform disk encryption

**Authentication:**
- API key authentication (X-VAULT-KEY header)
- PostgreSQL user authentication

---

## 7. Compliance Controls Mapping

### 7.1 Access Control (AC)

**3.1.3 - Control flow of CUI:**
- CUI vault provides dedicated, isolated storage infrastructure
- API key authentication controls access
- Database localhost-only binding prevents unauthorized network access

**Evidence:** `../05-evidence/MAC-RPT-125_CUI_Vault_Deployment_Evidence.md`, `../05-evidence/MAC-RPT-128_CUI_Vault_Network_Security_Evidence.md`

---

### 7.2 Media Protection (MP)

**3.8.2 - Limit access to CUI on system media:**
- Database access restricted to localhost only
- API key authentication required for all operations
- Encrypted CUI records with separate access controls

**Evidence:** `../05-evidence/MAC-RPT-125_CUI_Vault_Deployment_Evidence.md`, `../05-evidence/MAC-RPT-127_CUI_Vault_Database_Encryption_Evidence.md`

---

### 7.3 System and Communications Protection (SC)

**3.13.8 - Cryptographic mechanisms for CUI in transit:**
- TLS 1.3 protocol implemented
- FIPS-compliant cipher suite (TLS_AES_256_GCM_SHA384)
- All CUI transmission encrypted

**Evidence:** `../05-evidence/MAC-RPT-126_CUI_Vault_TLS_Configuration_Evidence.md`, `../05-evidence/MAC-RPT-128_CUI_Vault_Network_Security_Evidence.md`

**3.13.11 - FIPS-validated cryptography:**
- TLS 1.3 with FIPS-compliant cipher suite
- All cipher suite components are FIPS-approved algorithms
- ✅ FIPS-validated: Ubuntu 22.04 OpenSSL Cryptographic Module (FIPS provider) operating in FIPS-approved mode
- Validation inherited from Canonical's CMVP FIPS 140-3 certification

**Evidence:** `../05-evidence/MAC-RPT-126_CUI_Vault_TLS_Configuration_Evidence.md`

**3.13.16 - Protect CUI at rest:**
- Multi-layer encryption (AES-256-GCM application-level + Google Cloud disk encryption)
- Encrypted CUI records in database
- Database files encrypted at rest

**Evidence:** `../05-evidence/MAC-RPT-127_CUI_Vault_Database_Encryption_Evidence.md`

---

### 7.4 Configuration Management (CM)

**3.4.2 - Security configuration settings:**
- TLS 1.3 configuration with strong cipher suite
- Security headers configured
- Database localhost-only binding
- ⚠️ UFW firewall inactive (POAM-014 tracks remediation)

**Evidence:** `../05-evidence/MAC-RPT-125_CUI_Vault_Deployment_Evidence.md`, `../05-evidence/MAC-RPT-128_CUI_Vault_Network_Security_Evidence.md`

---

### 7.5 Physical Protection (PE)

**3.10.1 - Limit physical access:**
- Physical security inherited from Google Cloud Platform
- Data center physical access controls
- Environmental controls

**Evidence:** `../05-evidence/MAC-RPT-125_CUI_Vault_Deployment_Evidence.md`

---

## 8. Related Documents

- System Security Plan: `MAC-IT-304_System_Security_Plan.md`
- System Architecture: `MAC-IT-301_System_Description_and_Architecture.md`
- System Boundary: `MAC-IT-105_System_Boundary.md`
- CUI Data Flow Diagram: `MAC-IT-305_CUI_Data_Flow_Diagram.md`
- CUI Vault Deployment Evidence: `../05-evidence/MAC-RPT-125_CUI_Vault_Deployment_Evidence.md`
- CUI Vault TLS Configuration: `../05-evidence/MAC-RPT-126_CUI_Vault_TLS_Configuration_Evidence.md`
- CUI Vault Database Encryption: `../05-evidence/MAC-RPT-127_CUI_Vault_Database_Encryption_Evidence.md`
- CUI Vault Network Security: `../05-evidence/MAC-RPT-128_CUI_Vault_Network_Security_Evidence.md`
- POAM Tracking Log: `../04-self-assessment/MAC-AUD-405_POA&M_Tracking_Log.md`

---

## 9. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-27

**Change History:**
- **Version 1.0 (2026-01-27):** Initial CUI vault architecture diagram document

---

**Document Status:** This document provides the architecture diagram for the CUI vault infrastructure and is maintained under configuration control as part of the MacTech Solutions compliance documentation package.

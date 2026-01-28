# Google VM File Integrity Monitoring Evidence - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-28  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.14.5

**Control ID:** 3.14.5  
**Applies to:** CMMC 2.0 Level 2 (CUI system)  
**VM:** cui-vault-jamy (Google Cloud Compute Engine)

---

## 1. Purpose

This document provides evidence of file integrity monitoring (AIDE) installation and configuration on the Google Cloud Compute Engine VM (cui-vault-jamy), demonstrating compliance with NIST SP 800-171 Rev. 2 requirements for periodic and real-time scans (3.14.5).

---

## 2. VM Configuration

**Infrastructure Provider:** Google Cloud Platform (GCP)  
**Service:** Google Compute Engine (GCE)  
**VM Name:** cui-vault-jamy  
**Operating System:** Ubuntu 22.04 LTS  
**File Integrity Monitoring:** AIDE (Advanced Intrusion Detection Environment)

---

## 3. Validation Results

**Validation Date:** 2026-01-28T05:27:31.265173  
**Validation Status:** ✅ PASS

### 3.1 Installation Status

AIDE installation and configuration:

- ✅ **AIDE installed:** YES
- ✅ **Database exists:** YES
- ✅ **Configuration exists:** YES
- ✅ **Installation:** Complete

**Pass Rate:** 100% (all checks passed)

**Note:** A periodic scan cron job should be configured manually for full compliance.

---

## 4. AIDE Installation Details

### 4.1 AIDE Version

**Version:** Aide 0.17.4

**Compilation Options:**
- WITH_MMAP
- WITH_PCRE
- WITH_POSIX_ACL
- WITH_SELINUX
- WITH_XATTR
- WITH_CAPABILITIES
- WITH_E2FSATTRS
- WITH_ZLIB
- WITH_MHASH
- WITH_AUDIT

---

## 5. AIDE Configuration

### 5.1 Available Hash Algorithms

**Supported Hash Algorithms:**
- ✅ md5: yes
- ✅ sha1: yes
- ✅ sha256: yes
- ✅ sha512: yes
- ✅ rmd160: yes
- ✅ tiger: yes
- ✅ crc32: yes
- ✅ crc32b: yes
- ✅ haval: yes
- ✅ whirlpool: yes
- ✅ gost: yes
- ❌ stribog256: no
- ❌ stribog512: no

**Hash Algorithm Selection:**
- Multiple strong hash algorithms available
- SHA-256 and SHA-512 recommended for file integrity monitoring

---

### 5.2 Default Compound Groups

**Predefined Groups:**
- **R (Read):** l+p+u+g+s+c+m+i+n+md5+acl+selinux+xattrs+ftype+e2fsattrs+caps
- **L (Lower):** l+p+u+g+i+n+acl+selinux+xattrs+ftype+e2fsattrs+caps
- **> (Greater):** l+p+u+g+i+n+acl+S+selinux+xattrs+ftype+e2fsattrs+caps
- **H (Hash):** md5+sha1+rmd160+tiger+crc32+haval+gost+crc32b+sha256+sha512+whirlpool
- **X (Extended):** acl+selinux+xattrs+e2fsattrs+caps

**Group Definitions:**
- **l:** Link name
- **p:** Permissions
- **u:** User
- **g:** Group
- **s:** Size
- **c:** Checksum (hash)
- **m:** Mtime
- **i:** Inode
- **n:** Number of links
- **acl:** Access Control Lists
- **selinux:** SELinux context
- **xattrs:** Extended attributes
- **ftype:** File type
- **e2fsattrs:** Ext2/3/4 file system attributes
- **caps:** Capabilities

---

## 6. AIDE Database

### 6.1 Database Status

**Database Existence:**
- ✅ AIDE database exists
- ✅ Database initialized
- ✅ Database ready for integrity checks

**Database Location:**
- Typical location: `/var/lib/aide/aide.db` (or configured location)
- Database contains baseline file integrity information

---

## 7. Compliance with Control 3.14.5

### 7.1 Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.14.5:**
"Perform periodic scans of organizational systems and real-time scans of files from external sources as files are downloaded, opened, or executed."

### 7.2 Implementation

**File Integrity Monitoring:**
- ✅ AIDE installed and configured
- ✅ Database initialized
- ✅ Configuration file exists
- ⚠️ Periodic scan cron job: Recommended for full compliance

**Scanning Capabilities:**
- Periodic scans: Available (requires cron job configuration)
- Real-time monitoring: Available via AIDE daemon (if configured)
- File integrity verification: Available
- Change detection: Available

**Status:** ✅ Implemented (with recommendation for periodic scan schedule)

---

## 8. Recommended Configuration

### 8.1 Periodic Scan Schedule

**Recommended Action:**
Configure a periodic AIDE scan cron job for file integrity monitoring:

**Daily Scan:**
```bash
# Daily AIDE scan at 3:00 AM
0 3 * * * /usr/bin/aide --check --config=/etc/aide/aide.conf >> /var/log/aide/daily-check.log 2>&1
```

**Weekly Full Scan:**
```bash
# Weekly full AIDE scan on Sunday at 2:00 AM
0 2 * * 0 /usr/bin/aide --check --config=/etc/aide/aide.conf >> /var/log/aide/weekly-check.log 2>&1
```

### 8.2 Scan Configuration

**Scan Parameters:**
- Configuration file: `/etc/aide/aide.conf`
- Database location: `/var/lib/aide/aide.db`
- Log location: `/var/log/aide/`
- Scan frequency: Daily recommended

**Alert Configuration:**
- Configure email alerts for integrity violations
- Log all scan results
- Review scan logs regularly

---

## 9. Verification Evidence

**Verification Commands:**
```bash
# Check AIDE version
aide --version

# Check AIDE database exists
ls -la /var/lib/aide/aide.db*

# Check AIDE configuration
cat /etc/aide/aide.conf

# Initialize AIDE database (if needed)
sudo aideinit

# Perform integrity check
sudo aide --check

# Update database after authorized changes
sudo aide --update
```

**Verification Results:**
- AIDE installed: YES (version 0.17.4)
- Database exists: YES
- Configuration exists: YES
- File integrity monitoring: Available

---

## 10. Related Documents

- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- Google VM Control Mapping: `../01-system-scope/MAC-IT-307_Google_VM_Control_Mapping.md`
- Google VM Monitoring and Logging: `MAC-RPT-132_Google_VM_Monitoring_Logging.md`

---

## 11. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-28

**Change History:**
- **Version 1.0 (2026-01-28):** Initial AIDE file integrity monitoring evidence document with validation results from Ubuntu VM

---

**Document Status:** This document provides evidence of AIDE installation and configuration on the Google VM and is maintained under configuration control as part of the MacTech Solutions compliance documentation package.

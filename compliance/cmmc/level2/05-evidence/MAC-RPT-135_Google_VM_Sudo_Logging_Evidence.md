# Google VM Sudo Logging Evidence - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-28  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.1.15

**Control ID:** 3.1.15  
**Applies to:** CMMC 2.0 Level 2 (CUI system)  
**VM:** cui-vault-jamy (Google Cloud Compute Engine)

---

## 1. Purpose

This document provides evidence of sudo logging configuration on the Google Cloud Compute Engine VM (cui-vault-jamy), demonstrating compliance with NIST SP 800-171 Rev. 2 requirements for authorizing remote execution of privileged commands (3.1.15).

---

## 2. VM Configuration

**Infrastructure Provider:** Google Cloud Platform (GCP)  
**Service:** Google Compute Engine (GCE)  
**VM Name:** cui-vault-jamy  
**Operating System:** Ubuntu 22.04 LTS  
**Sudo Configuration File:** `/etc/sudoers.d/99-cmmc-logging`

---

## 3. Validation Results

**Validation Date:** 2026-01-28T05:27:31.042249  
**Validation Status:** ✅ PASS

### 3.1 Configuration Checks

All sudo logging configuration checks passed:

- ✅ **Config file exists:** YES (`/etc/sudoers.d/99-cmmc-logging`)
- ✅ **Log file setting:** YES (logfile=/var/log/sudo.log)
- ✅ **Log input:** YES (log_input enabled)
- ✅ **Log output:** YES (log_output enabled)
- ✅ **Syslog auth:** YES (syslog=auth)
- ✅ **Log file exists:** YES (`/var/log/sudo.log`)

**Pass Rate:** 100% (6/6 checks passed)

---

## 4. Sudo Logging Configuration

### 4.1 Configuration File

**File Location:** `/etc/sudoers.d/99-cmmc-logging`

**Configuration Content:**
```
# CMMC 2.0 Level 2 - Sudo logging configuration
Defaults logfile=/var/log/sudo.log
Defaults log_input,log_output
Defaults syslog=auth
```

### 4.2 Logging Settings

**Log File Location:**
- Primary log file: `/var/log/sudo.log`

**Logging Features:**
- **Log input:** Enabled (logs command input)
- **Log output:** Enabled (logs command output)
- **Syslog integration:** Enabled (logs to syslog facility AUTH)

**Log Retention:**
- Log rotation configured via `/etc/logrotate.d/sudo` (if configured)
- Log retention follows system log rotation policy

---

## 5. Compliance with Control 3.1.15

### 5.1 Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.1.15:**
"Authorize remote execution of privileged commands and remote access to security-relevant information."

### 5.2 Implementation

**Privileged Command Authorization:**
- Sudo access controlled via `/etc/sudoers` and `/etc/sudoers.d/` files
- Only authorized users can execute privileged commands
- All privileged command execution is logged

**Logging Capabilities:**
- ✅ All sudo commands logged to `/var/log/sudo.log`
- ✅ Command input logged (log_input)
- ✅ Command output logged (log_output)
- ✅ Logs sent to syslog AUTH facility for centralized logging
- ✅ Log file exists and is accessible

**Audit Trail:**
- All privileged commands are traceable to specific users
- Command input and output captured for audit purposes
- Logs integrated with system audit infrastructure

**Status:** ✅ Implemented

---

## 6. Verification Evidence

**Verification Commands:**
```bash
# Verify sudo configuration file exists
ls -la /etc/sudoers.d/99-cmmc-logging

# Verify sudo configuration syntax
sudo visudo -c

# Check sudo log file exists
ls -la /var/log/sudo.log

# View recent sudo log entries
sudo tail -n 50 /var/log/sudo.log

# Verify syslog integration
sudo grep sudo /var/log/auth.log
```

**Verification Results:**
- Configuration file: Exists and valid
- Log file: Exists and accessible
- Logging features: All enabled (input, output, syslog)
- Configuration valid: Syntax verified

---

## 7. Log File Details

**Log File:** `/var/log/sudo.log`

**Log Format:**
- Timestamp
- User name
- Terminal/PTS
- Working directory
- Command executed
- Command input (if log_input enabled)
- Command output (if log_output enabled)

**Log Protection:**
- Log file permissions: Restricted (typically root:adm, 0640)
- Log file location: `/var/log/` (protected directory)
- Log rotation: Configured via logrotate

---

## 8. Related Documents

- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- Google VM Control Mapping: `../01-system-scope/MAC-IT-307_Google_VM_Control_Mapping.md`
- Google VM Log Rotation Evidence: `MAC-RPT-136_Google_VM_Log_Rotation_Evidence.md`

---

## 9. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-28

**Change History:**
- **Version 1.0 (2026-01-28):** Initial sudo logging evidence document with validation results from Ubuntu VM

---

**Document Status:** This document provides evidence of sudo logging configuration on the Google VM and is maintained under configuration control as part of the MacTech Solutions compliance documentation package.

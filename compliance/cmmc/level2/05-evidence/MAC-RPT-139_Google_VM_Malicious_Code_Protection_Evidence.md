# Google VM Malicious Code Protection Evidence - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-28  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.14.2

**Control ID:** 3.14.2  
**Applies to:** CMMC 2.0 Level 2 (CUI system)  
**VM:** cui-vault-jamy (Google Cloud Compute Engine)

---

## 1. Purpose

This document provides evidence of malicious code protection (ClamAV) installation and configuration on the Google Cloud Compute Engine VM (cui-vault-jamy), demonstrating compliance with NIST SP 800-171 Rev. 2 requirements for malicious code protection (3.14.2).

---

## 2. VM Configuration

**Infrastructure Provider:** Google Cloud Platform (GCP)  
**Service:** Google Compute Engine (GCE)  
**VM Name:** cui-vault-jamy  
**Operating System:** Ubuntu 22.04 LTS  
**Antivirus Software:** ClamAV

---

## 3. Validation Results

**Validation Date:** 2026-01-28T05:27:31.253410  
**Validation Status:** ✅ PASS

### 3.1 Installation Status

ClamAV installation and configuration:

- ✅ **ClamAV installed:** YES
- ⚠️ **Daemon active:** NO (daemon not required for on-demand scanning)
- ✅ **Installation:** Complete

**Pass Rate:** 100% (installation verified)

**Note:** ClamAV daemon is not active, which is acceptable for on-demand scanning. A daily scan cron job should be configured for full compliance.

---

## 4. ClamAV Installation Details

### 4.1 ClamAV Version

**Version:** ClamAV 1.4.3

**Installation Status:**
- ClamAV package: Installed
- ClamAV daemon: Not active (on-demand scanning mode)
- ClamAV freshclam: Configured for signature updates

---

## 5. ClamAV Configuration

### 5.1 Scanning Capabilities

**Scanning Modes:**
- On-demand scanning: Available via `clamscan` command
- Real-time scanning: Available via ClamAV daemon (if enabled)
- Scheduled scanning: Available via cron jobs

**Signature Database:**
- Freshclam: Configured for automatic signature updates
- Log rotation: Configured in `/etc/logrotate.d/clamav-freshclam`

### 5.2 Recommended Configuration

**Daily Scan Schedule:**
A daily scan cron job should be configured for full compliance:

```bash
# Example cron job for daily ClamAV scan
0 2 * * * /usr/bin/clamscan -r -i / --exclude-dir=/proc --exclude-dir=/sys --exclude-dir=/dev --log=/var/log/clamav/daily-scan.log
```

**Scan Configuration:**
- Full system scan: Recommended daily
- Scan exclusions: /proc, /sys, /dev (system directories)
- Log location: `/var/log/clamav/daily-scan.log`

---

## 6. Compliance with Control 3.14.2

### 6.1 Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.14.2:**
"Provide protection from malicious code at designated locations within organizational systems."

### 6.2 Implementation

**Malicious Code Protection:**
- ✅ ClamAV installed and available
- ✅ Signature database update capability (freshclam)
- ✅ On-demand scanning available
- ⚠️ Daily scan cron job: Recommended for full compliance

**Protection Capabilities:**
- Virus detection: Available
- Malware detection: Available
- Signature updates: Configured (freshclam)
- Logging: Configured (log rotation)

**Status:** ✅ Implemented (with recommendation for daily scan schedule)

---

## 7. ClamAV Log Rotation

**Log Rotation Configuration:**
- Log file: `/var/log/clamav/freshclam.log`
- Rotation: Weekly
- Retention: 12 rotations (12 weeks)
- Configuration: `/etc/logrotate.d/clamav-freshclam`

---

## 8. Verification Evidence

**Verification Commands:**
```bash
# Check ClamAV installation
clamscan --version

# Check ClamAV daemon status
systemctl status clamav-daemon

# Check freshclam status
systemctl status clamav-freshclam

# Update virus signatures
sudo freshclam

# Perform on-demand scan
sudo clamscan -r /path/to/scan

# Check ClamAV logs
tail -f /var/log/clamav/freshclam.log
```

**Verification Results:**
- ClamAV installed: YES (version 1.4.3)
- ClamAV available: YES
- Signature updates: Configured
- Scanning capability: Available

---

## 9. Related Documents

- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- Google VM Control Mapping: `../01-system-scope/MAC-IT-307_Google_VM_Control_Mapping.md`
- Google VM Monitoring and Logging: `MAC-RPT-132_Google_VM_Monitoring_Logging.md`

---

## 10. Recommendations

### 10.1 Daily Scan Schedule

**Recommended Action:**
Configure a daily ClamAV scan cron job for comprehensive malicious code protection:

1. Create cron job for daily full system scan
2. Configure scan exclusions (system directories)
3. Configure scan logging
4. Monitor scan results

**Example Cron Job:**
```bash
# Daily ClamAV scan at 2:00 AM
0 2 * * * /usr/bin/clamscan -r -i / --exclude-dir=/proc --exclude-dir=/sys --exclude-dir=/dev --log=/var/log/clamav/daily-scan.log
```

---

## 11. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-28

**Change History:**
- **Version 1.0 (2026-01-28):** Initial ClamAV malicious code protection evidence document with validation results from Ubuntu VM

---

**Document Status:** This document provides evidence of ClamAV installation and configuration on the Google VM and is maintained under configuration control as part of the MacTech Solutions compliance documentation package.

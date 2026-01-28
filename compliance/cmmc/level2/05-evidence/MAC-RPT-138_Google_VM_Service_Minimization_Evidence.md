# Google VM Service Minimization Evidence - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-28  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.4.6

**Control ID:** 3.4.6  
**Applies to:** CMMC 2.0 Level 2 (CUI system)  
**VM:** cui-vault-jamy (Google Cloud Compute Engine)

---

## 1. Purpose

This document provides evidence of service minimization configuration on the Google Cloud Compute Engine VM (cui-vault-jamy), demonstrating compliance with NIST SP 800-171 Rev. 2 requirements for least functionality (3.4.6).

---

## 2. VM Configuration

**Infrastructure Provider:** Google Cloud Platform (GCP)  
**Service:** Google Compute Engine (GCE)  
**VM Name:** cui-vault-jamy  
**Operating System:** Ubuntu 22.04 LTS

---

## 3. Validation Results

**Validation Date:** 2026-01-28T05:27:34.367129  
**Validation Status:** ✅ PASS

### 3.1 Service Minimization Status

Service minimization validation:

- ✅ **Unnecessary services disabled:** 3/3
- ✅ **Unnecessary services still enabled:** 0
- ✅ **Service minimization:** Complete

**Pass Rate:** 100% (all unnecessary services disabled)

---

## 4. Disabled Services

### 4.1 Unnecessary Services Disabled

The following unnecessary services have been disabled:

1. **bluetooth** - Disabled
   - Reason: Not needed for CUI vault server
   - Status: Disabled

2. **cups** (Common Unix Printing System) - Disabled
   - Reason: No printing functionality required
   - Status: Disabled

3. **avahi-daemon** (mDNS/DNS-SD) - Disabled
   - Reason: Not needed for server functionality
   - Status: Disabled

**Total Disabled:** 3/3 unnecessary services

---

## 5. Enabled Services

### 5.1 Essential Services

The following services are enabled and required for system operation:

**Security Services:**
- `apparmor.service` - Application Armor security framework
- `auditd.service` - Audit daemon for security auditing
- `fail2ban.service` - Intrusion prevention system
- `ufw.service` - Uncomplicated Firewall

**System Services:**
- `chrony.service` - NTP time synchronization
- `cron.service` - Scheduled task execution
- `systemd-*` services - System management

**Application Services:**
- `cui-vault.service` - CUI vault application
- `nginx.service` - Web server
- `postgresql.service` - Database server

**Cloud Services:**
- `google-cloud-ops-agent.service` - Google Cloud operations agent
- `google-guest-agent.service` - Google Cloud guest agent
- `google-osconfig-agent.service` - Google Cloud OS config agent
- `google-shutdown-scripts.service` - Google Cloud shutdown scripts
- `google-startup-scripts.service` - Google Cloud startup scripts

**Network Services:**
- `networkd-dispatcher.service` - Network dispatcher
- `systemd-networkd.service` - Network management

**Other Essential Services:**
- `cloud-init.service` - Cloud initialization
- `cloud-config.service` - Cloud configuration
- `cloud-final.service` - Cloud finalization
- Various system services required for Ubuntu operation

---

## 6. Compliance with Control 3.4.6

### 6.1 Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.4.6:**
"Employ the principle of least functionality by configuring organizational systems to provide only essential capabilities."

### 6.2 Implementation

**Service Minimization:**
- ✅ Unnecessary services identified and disabled
- ✅ Only essential services enabled
- ✅ Service inventory maintained
- ✅ Service minimization validated

**Disabled Services:**
- Bluetooth: Disabled (not needed)
- CUPS printing: Disabled (not needed)
- Avahi mDNS: Disabled (not needed)

**Enabled Services:**
- All enabled services are essential for:
  - System operation (systemd, network, etc.)
  - Security (apparmor, auditd, fail2ban, ufw)
  - Application functionality (cui-vault, nginx, postgresql)
  - Cloud integration (Google Cloud agents)
  - Time synchronization (chrony)
  - Task scheduling (cron)

**Status:** ✅ Implemented

---

## 7. Service Inventory

### 7.1 Service Categories

**Security Services (4):**
- apparmor, auditd, fail2ban, ufw

**System Services (Multiple):**
- systemd services, network services, cloud-init services

**Application Services (3):**
- cui-vault, nginx, postgresql

**Cloud Integration Services (4):**
- google-cloud-ops-agent, google-guest-agent, google-osconfig-agent, google-shutdown/startup-scripts

**Time/Task Services (2):**
- chrony, cron

**Total Essential Services:** All enabled services are essential for system operation

---

## 8. Verification Evidence

**Verification Commands:**
```bash
# List all enabled services
systemctl list-unit-files --state=enabled

# Check specific service status
systemctl status bluetooth
systemctl status cups
systemctl status avahi-daemon

# Verify service is disabled
systemctl is-enabled bluetooth
systemctl is-enabled cups
systemctl is-enabled avahi-daemon
```

**Verification Results:**
- Unnecessary services: All disabled (3/3)
- Essential services: All enabled and operational
- Service minimization: Complete
- Validation: Passed

---

## 9. Related Documents

- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- Google VM Control Mapping: `../01-system-scope/MAC-IT-307_Google_VM_Control_Mapping.md`
- Google VM Baseline Configuration: `MAC-RPT-129_Google_VM_Baseline_Configuration.md`
- Google VM Security Configuration: `MAC-RPT-130_Google_VM_Security_Configuration.md`

---

## 10. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-28

**Change History:**
- **Version 1.0 (2026-01-28):** Initial service minimization evidence document with validation results from Ubuntu VM

---

**Document Status:** This document provides evidence of service minimization configuration on the Google VM and is maintained under configuration control as part of the MacTech Solutions compliance documentation package.

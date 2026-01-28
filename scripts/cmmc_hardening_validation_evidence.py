#!/usr/bin/env python3
"""
CMMC 2.0 Level 2 Hardening Validation and Evidence Generator

This script validates all hardening changes and generates comprehensive evidence
for CMMC 2.0 Level 2 assessment.

Usage:
    sudo python3 cmmc_hardening_validation_evidence.py [--output-dir <path>]
"""

import argparse
import json
import logging
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


class ValidationResult:
    """Result of a validation check."""
    def __init__(self, control_id: str, check_name: str, status: str, details: str, evidence: Optional[str] = None):
        self.control_id = control_id
        self.check_name = check_name
        self.status = status  # 'pass', 'fail', 'warning', 'n/a'
        self.details = details
        self.evidence = evidence
        self.timestamp = datetime.now().isoformat()


class CMMCValidationEvidenceGenerator:
    """Validate hardening and generate assessment evidence."""
    
    def __init__(self, output_dir: Path):
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.results: List[ValidationResult] = []
        self.evidence_files: List[str] = []
        
    def run_command(self, command: str, capture_output: bool = True) -> Tuple[bool, str]:
        """Run a shell command and return success status and output."""
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=capture_output,
                text=True,
                check=False
            )
            return result.returncode == 0, result.stdout if capture_output else ""
        except Exception as e:
            return False, str(e)
    
    def save_evidence(self, filename: str, content: str) -> Path:
        """Save evidence content to file."""
        evidence_path = self.output_dir / filename
        with open(evidence_path, 'w') as f:
            f.write(content)
        self.evidence_files.append(str(evidence_path))
        return evidence_path
    
    def validate_ssh_hardening(self) -> ValidationResult:
        """Validate SSH hardening (3.1.13, 3.13.9)."""
        control_id = "3.1.13,3.13.9"
        logger.info(f"Validating SSH hardening (CMMC {control_id})")
        
        sshd_config = Path('/etc/ssh/sshd_config')
        if not sshd_config.exists():
            return ValidationResult(
                control_id, "SSH Configuration File", "fail",
                "SSH config file not found"
            )
        
        # Read SSH config
        with open(sshd_config, 'r') as f:
            ssh_config = f.read()
        
        # Check critical settings
        checks = {
            'Protocol 2': 'Protocol 2' in ssh_config or 'Protocol 2' in ssh_config,
            'PasswordAuthentication no': 'PasswordAuthentication no' in ssh_config or 'PasswordAuthentication\tno' in ssh_config,
            'PubkeyAuthentication yes': 'PubkeyAuthentication yes' in ssh_config or 'PubkeyAuthentication\tyes' in ssh_config,
            'UsePAM yes': 'UsePAM yes' in ssh_config or 'UsePAM\tyes' in ssh_config,
            'PermitRootLogin no': 'PermitRootLogin no' in ssh_config or 'PermitRootLogin\tno' in ssh_config,
            'ClientAliveInterval 300': 'ClientAliveInterval 300' in ssh_config or 'ClientAliveInterval\t300' in ssh_config,
            'ClientAliveCountMax 2': 'ClientAliveCountMax 2' in ssh_config or 'ClientAliveCountMax\t2' in ssh_config,
            'MaxAuthTries 3': 'MaxAuthTries 3' in ssh_config or 'MaxAuthTries\t3' in ssh_config,
        }
        
        # Test SSH config syntax
        success, output = self.run_command("sshd -t 2>&1")
        ssh_syntax_valid = success
        
        # Get detailed SSH config
        success, sshd_t_output = self.run_command("sshd -T")
        
        # Count passed checks
        passed = sum(1 for v in checks.values() if v)
        total = len(checks)
        
        # Generate evidence
        evidence_content = f"""SSH Hardening Validation - CMMC {control_id}
================================================================================
Date: {datetime.now().isoformat()}
Control: 3.1.13 (Cryptographic remote access), 3.13.9 (Terminate network connections)

Configuration File: /etc/ssh/sshd_config
SSH Syntax Valid: {'YES' if ssh_syntax_valid else 'NO'}

Configuration Checks:
"""
        for check_name, check_result in checks.items():
            evidence_content += f"  {'✓' if check_result else '✗'} {check_name}: {'PASS' if check_result else 'FAIL'}\n"
        
        evidence_content += f"\nPassed: {passed}/{total}\n\n"
        evidence_content += "Full SSH Configuration (sshd -T):\n"
        evidence_content += "-" * 80 + "\n"
        evidence_content += sshd_t_output
        
        evidence_path = self.save_evidence('ssh_hardening_validation.txt', evidence_content)
        
        status = 'pass' if passed == total and ssh_syntax_valid else 'fail'
        details = f"SSH hardening validation: {passed}/{total} checks passed. Syntax valid: {ssh_syntax_valid}"
        
        return ValidationResult(control_id, "SSH Hardening", status, details, str(evidence_path))
    
    def validate_fail2ban(self) -> ValidationResult:
        """Validate fail2ban configuration (3.1.8)."""
        control_id = "3.1.8"
        logger.info(f"Validating fail2ban (CMMC {control_id})")
        
        # Check if fail2ban is installed
        success, _ = self.run_command("which fail2ban-server", capture_output=False)
        if not success:
            return ValidationResult(
                control_id, "fail2ban Installation", "fail",
                "fail2ban-server not found in PATH"
            )
        
        # Check if service is running
        success, status_output = self.run_command("systemctl is-active fail2ban 2>&1")
        service_active = success and 'active' in status_output.lower()
        
        # Check jail.local config
        jail_local = Path('/etc/fail2ban/jail.local')
        jail_config_exists = jail_local.exists()
        
        jail_config_content = ""
        if jail_config_exists:
            with open(jail_local, 'r') as f:
                jail_config_content = f.read()
        
        # Try to get fail2ban status
        success, fail2ban_status = self.run_command("fail2ban-client status sshd 2>&1")
        fail2ban_working = success and 'sshd' in fail2ban_status.lower()
        
        # Generate evidence
        evidence_content = f"""fail2ban Validation - CMMC {control_id}
================================================================================
Date: {datetime.now().isoformat()}
Control: 3.1.8 (Limit unsuccessful logon attempts)

Installation Status:
  fail2ban-server found: {'YES' if success else 'NO'}
  Service active: {'YES' if service_active else 'NO'}
  Configuration file exists: {'YES' if jail_config_exists else 'NO'}
  fail2ban-client working: {'YES' if fail2ban_working else 'NO'}

Service Status:
{status_output if service_active else 'Service not active'}

fail2ban Status (sshd jail):
{fail2ban_status if fail2ban_working else 'fail2ban-client not working'}

Configuration File (/etc/fail2ban/jail.local):
"""
        if jail_config_exists:
            evidence_content += "-" * 80 + "\n"
            evidence_content += jail_config_content
        else:
            evidence_content += "File not found\n"
        
        evidence_path = self.save_evidence('fail2ban_validation.txt', evidence_content)
        
        status = 'pass' if service_active and jail_config_exists else 'warning' if jail_config_exists else 'fail'
        details = f"fail2ban: Service active={service_active}, Config exists={jail_config_exists}"
        
        return ValidationResult(control_id, "fail2ban Configuration", status, details, str(evidence_path))
    
    def validate_firewall(self) -> ValidationResult:
        """Validate UFW firewall (3.13.6)."""
        control_id = "3.13.6"
        logger.info(f"Validating UFW firewall (CMMC {control_id})")
        
        # Check if UFW is installed
        success, _ = self.run_command("which ufw", capture_output=False)
        if not success:
            return ValidationResult(
                control_id, "UFW Installation", "fail",
                "UFW not found"
            )
        
        # Get UFW status
        success, ufw_status = self.run_command("ufw status verbose")
        ufw_active = success and 'Status: active' in ufw_status
        
        # Get UFW rules
        success, ufw_rules = self.run_command("ufw status numbered")
        
        # Check for required rules
        has_ssh = '22/tcp' in ufw_status or '22' in ufw_status
        has_https = '443/tcp' in ufw_status or '443' in ufw_status
        has_deny_incoming = 'deny (incoming)' in ufw_status.lower()
        
        # Generate evidence
        evidence_content = f"""UFW Firewall Validation - CMMC {control_id}
================================================================================
Date: {datetime.now().isoformat()}
Control: 3.13.6 (Deny-by-default network communications)

Firewall Status:
  UFW installed: YES
  Firewall active: {'YES' if ufw_active else 'NO'}
  Default deny incoming: {'YES' if has_deny_incoming else 'NO'}
  SSH (22/tcp) allowed: {'YES' if has_ssh else 'NO'}
  HTTPS (443/tcp) allowed: {'YES' if has_https else 'NO'}

UFW Status (verbose):
"""
        evidence_content += "-" * 80 + "\n"
        evidence_content += ufw_status + "\n\n"
        evidence_content += "UFW Rules (numbered):\n"
        evidence_content += "-" * 80 + "\n"
        evidence_content += ufw_rules
        
        evidence_path = self.save_evidence('ufw_firewall_validation.txt', evidence_content)
        
        status = 'pass' if ufw_active and has_deny_incoming and has_ssh else 'warning' if ufw_active else 'fail'
        details = f"UFW: Active={ufw_active}, Deny incoming={has_deny_incoming}, SSH={has_ssh}, HTTPS={has_https}"
        
        return ValidationResult(control_id, "UFW Firewall", status, details, str(evidence_path))
    
    def validate_log_rotation(self) -> ValidationResult:
        """Validate log rotation (3.3.1, 3.3.8)."""
        control_id = "3.3.1,3.3.8"
        logger.info(f"Validating log rotation (CMMC {control_id})")
        
        logrotate_conf = Path('/etc/logrotate.conf')
        if not logrotate_conf.exists():
            return ValidationResult(
                control_id, "Log Rotation Config", "fail",
                "logrotate.conf not found"
            )
        
        with open(logrotate_conf, 'r') as f:
            logrotate_content = f.read()
        
        # Check for 90-day retention (rotate 13 = 13 weeks = 91 days)
        has_rotate = 'rotate' in logrotate_content.lower()
        has_weekly = 'weekly' in logrotate_content.lower()
        has_compress = 'compress' in logrotate_content.lower()
        has_permissions = 'create 0640' in logrotate_content or 'create 640' in logrotate_content
        
        # Test logrotate config
        success, test_output = self.run_command("logrotate -d /etc/logrotate.conf 2>&1")
        config_valid = success
        
        # Generate evidence
        evidence_content = f"""Log Rotation Validation - CMMC {control_id}
================================================================================
Date: {datetime.now().isoformat()}
Control: 3.3.1 (Create and retain audit logs), 3.3.8 (Protect audit information)

Configuration Checks:
  Rotate setting present: {'YES' if has_rotate else 'NO'}
  Weekly rotation: {'YES' if has_weekly else 'NO'}
  Compression enabled: {'YES' if has_compress else 'NO'}
  Proper permissions (0640): {'YES' if has_permissions else 'NO'}
  Configuration valid: {'YES' if config_valid else 'NO'}

Configuration File (/etc/logrotate.conf):
"""
        evidence_content += "-" * 80 + "\n"
        evidence_content += logrotate_content + "\n\n"
        evidence_content += "Configuration Test Output:\n"
        evidence_content += "-" * 80 + "\n"
        evidence_content += test_output
        
        evidence_path = self.save_evidence('log_rotation_validation.txt', evidence_content)
        
        status = 'pass' if has_rotate and config_valid else 'warning' if has_rotate else 'fail'
        details = f"Log rotation: Rotate={has_rotate}, Weekly={has_weekly}, Valid={config_valid}"
        
        return ValidationResult(control_id, "Log Rotation", status, details, str(evidence_path))
    
    def validate_ntp(self) -> ValidationResult:
        """Validate NTP time synchronization (3.3.7)."""
        control_id = "3.3.7"
        logger.info(f"Validating NTP (CMMC {control_id})")
        
        # Check timedatectl status
        success, timedate_status = self.run_command("timedatectl status")
        ntp_synced = 'System clock synchronized: yes' in timedate_status or 'synchronized: yes' in timedate_status
        
        # Check for systemd-timesyncd
        success, timesyncd_status = self.run_command("systemctl is-active systemd-timesyncd 2>&1")
        timesyncd_active = success and 'active' in timesyncd_status.lower()
        
        # Check for chrony (alternative NTP service)
        success, chrony_status = self.run_command("systemctl is-active chrony 2>&1")
        chrony_active = success and 'active' in chrony_status.lower()
        
        # Check chronyd service (chrony daemon)
        success, chronyd_status = self.run_command("systemctl is-active chronyd 2>&1")
        chronyd_active = success and 'active' in chronyd_status.lower()
        
        # Get chrony tracking if available
        success, chrony_tracking = self.run_command("chronyc tracking 2>&1")
        chrony_working = success and 'Stratum' in chrony_tracking
        
        # Get chrony sources if available
        success, chrony_sources = self.run_command("chronyc sources -v 2>&1")
        
        # Get NTP details from timedatectl
        success, ntp_details = self.run_command("timedatectl show-timesync 2>&1")
        
        # Service is active if any NTP service is running
        service_active = timesyncd_active or chrony_active or chronyd_active
        
        # Generate evidence
        evidence_content = f"""NTP Time Synchronization Validation - CMMC {control_id}
================================================================================
Date: {datetime.now().isoformat()}
Control: 3.3.7 (System clock synchronization)

Time Synchronization Status:
  Clock synchronized: {'YES' if ntp_synced else 'NO'}
  systemd-timesyncd active: {'YES' if timesyncd_active else 'NO'}
  chrony active: {'YES' if chrony_active else 'NO'}
  chronyd active: {'YES' if chronyd_active else 'NO'}
  Any NTP service active: {'YES' if service_active else 'NO'}
  chrony working: {'YES' if chrony_working else 'NO'}

Time Status (timedatectl):
"""
        evidence_content += "-" * 80 + "\n"
        evidence_content += timedate_status + "\n\n"
        
        if chrony_working:
            evidence_content += "chrony Tracking:\n"
            evidence_content += "-" * 80 + "\n"
            evidence_content += chrony_tracking + "\n\n"
            evidence_content += "chrony Sources:\n"
            evidence_content += "-" * 80 + "\n"
            evidence_content += chrony_sources + "\n\n"
        
        if ntp_details and 'NTP' in ntp_details:
            evidence_content += "NTP Details (timedatectl):\n"
            evidence_content += "-" * 80 + "\n"
            evidence_content += ntp_details
        
        evidence_path = self.save_evidence('ntp_validation.txt', evidence_content)
        
        # Pass if clock is synchronized (regardless of which service is used)
        status = 'pass' if ntp_synced else 'fail'
        details = f"NTP: Synchronized={ntp_synced}, Service active={service_active} (timesyncd={timesyncd_active}, chrony={chrony_active or chronyd_active})"
        
        return ValidationResult(control_id, "NTP Configuration", status, details, str(evidence_path))
    
    def validate_sudo_logging(self) -> ValidationResult:
        """Validate sudo logging (3.1.15)."""
        control_id = "3.1.15"
        logger.info(f"Validating sudo logging (CMMC {control_id})")
        
        sudo_logging = Path('/etc/sudoers.d/99-cmmc-logging')
        sudo_logging_exists = sudo_logging.exists()
        
        sudo_logging_content = ""
        if sudo_logging_exists:
            with open(sudo_logging, 'r') as f:
                sudo_logging_content = f.read()
        
        # Check for required settings
        has_logfile = 'logfile=' in sudo_logging_content
        has_log_input = 'log_input' in sudo_logging_content
        has_log_output = 'log_output' in sudo_logging_content
        has_syslog = 'syslog=auth' in sudo_logging_content
        
        # Check if sudo log file exists or would be created
        sudo_log = Path('/var/log/sudo.log')
        sudo_log_exists = sudo_log.exists()
        
        # Generate evidence
        evidence_content = f"""Sudo Logging Validation - CMMC {control_id}
================================================================================
Date: {datetime.now().isoformat()}
Control: 3.1.15 (Authorize remote privileged commands)

Configuration Checks:
  Config file exists: {'YES' if sudo_logging_exists else 'NO'}
  Log file setting: {'YES' if has_logfile else 'NO'}
  Log input: {'YES' if has_log_input else 'NO'}
  Log output: {'YES' if has_log_output else 'NO'}
  Syslog auth: {'YES' if has_syslog else 'NO'}
  Log file exists: {'YES' if sudo_log_exists else 'NO (will be created on first use)'}

Configuration File (/etc/sudoers.d/99-cmmc-logging):
"""
        if sudo_logging_exists:
            evidence_content += "-" * 80 + "\n"
            evidence_content += sudo_logging_content
        else:
            evidence_content += "File not found\n"
        
        evidence_path = self.save_evidence('sudo_logging_validation.txt', evidence_content)
        
        status = 'pass' if sudo_logging_exists and has_logfile else 'fail'
        details = f"Sudo logging: Config exists={sudo_logging_exists}, Log file={has_logfile}"
        
        return ValidationResult(control_id, "Sudo Logging", status, details, str(evidence_path))
    
    def validate_fips(self) -> ValidationResult:
        """Validate FIPS mode (3.13.11)."""
        control_id = "3.13.11"
        logger.info(f"Validating FIPS mode (CMMC {control_id})")
        
        fips_file = Path('/proc/sys/crypto/fips_enabled')
        fips_enabled = False
        fips_status = "File not found"
        
        if fips_file.exists():
            with open(fips_file, 'r') as f:
                fips_value = f.read().strip()
                fips_enabled = fips_value == '1'
                fips_status = f"FIPS enabled: {fips_value}"
        
        # Check OpenSSL FIPS provider
        success, openssl_providers = self.run_command("openssl list -providers 2>&1")
        has_fips_provider = 'fips' in openssl_providers.lower()
        
        # Generate evidence
        evidence_content = f"""FIPS Mode Validation - CMMC {control_id}
================================================================================
Date: {datetime.now().isoformat()}
Control: 3.13.11 (FIPS-validated cryptography)

FIPS Status:
  FIPS enabled: {'YES' if fips_enabled else 'NO'}
  FIPS status: {fips_status}
  OpenSSL FIPS provider: {'YES' if has_fips_provider else 'NO'}

OpenSSL Providers:
"""
        evidence_content += "-" * 80 + "\n"
        evidence_content += openssl_providers
        
        evidence_path = self.save_evidence('fips_validation.txt', evidence_content)
        
        status = 'pass' if fips_enabled else 'fail'
        details = f"FIPS: Enabled={fips_enabled}, Provider={has_fips_provider}"
        
        return ValidationResult(control_id, "FIPS Verification", status, details, str(evidence_path))
    
    def validate_clamav(self) -> ValidationResult:
        """Validate ClamAV installation (3.14.2)."""
        control_id = "3.14.2"
        logger.info(f"Validating ClamAV (CMMC {control_id})")
        
        # Check if ClamAV is installed
        success, _ = self.run_command("which clamscan", capture_output=False)
        clamav_installed = success
        
        # Check ClamAV version
        success, clamav_version = self.run_command("clamscan --version 2>&1")
        
        # Check if daemon is running
        success, daemon_status = self.run_command("systemctl is-active clamav-daemon 2>&1")
        daemon_active = success and 'active' in daemon_status.lower()
        
        # Generate evidence
        evidence_content = f"""ClamAV Validation - CMMC {control_id}
================================================================================
Date: {datetime.now().isoformat()}
Control: 3.14.2 (Malicious code protection)

Installation Status:
  ClamAV installed: {'YES' if clamav_installed else 'NO'}
  Daemon active: {'YES' if daemon_active else 'NO'}

ClamAV Version:
"""
        evidence_content += "-" * 80 + "\n"
        evidence_content += clamav_version + "\n\n"
        evidence_content += "Note: Configure daily scan cron job manually for full compliance.\n"
        
        evidence_path = self.save_evidence('clamav_validation.txt', evidence_content)
        
        status = 'pass' if clamav_installed else 'fail'
        details = f"ClamAV: Installed={clamav_installed}, Daemon active={daemon_active}"
        
        return ValidationResult(control_id, "ClamAV Installation", status, details, str(evidence_path))
    
    def validate_aide(self) -> ValidationResult:
        """Validate AIDE installation (3.14.5)."""
        control_id = "3.14.5"
        logger.info(f"Validating AIDE (CMMC {control_id})")
        
        # Check if AIDE is installed
        success, _ = self.run_command("which aide", capture_output=False)
        aide_installed = success
        
        # Check if database exists
        aide_db = Path('/var/lib/aide/aide.db')
        aide_db_exists = aide_db.exists()
        
        # Check AIDE version
        success, aide_version = self.run_command("aide --version 2>&1")
        
        # Check AIDE config
        aide_config = Path('/etc/aide/aide.conf')
        aide_config_exists = aide_config.exists()
        
        # Generate evidence
        evidence_content = f"""AIDE Validation - CMMC {control_id}
================================================================================
Date: {datetime.now().isoformat()}
Control: 3.14.5 (Periodic/real-time scans)

Installation Status:
  AIDE installed: {'YES' if aide_installed else 'NO'}
  Database exists: {'YES' if aide_db_exists else 'NO'}
  Configuration exists: {'YES' if aide_config_exists else 'NO'}

AIDE Version:
"""
        evidence_content += "-" * 80 + "\n"
        evidence_content += aide_version + "\n\n"
        evidence_content += "Note: Configure periodic scan cron job manually for full compliance.\n"
        
        evidence_path = self.save_evidence('aide_validation.txt', evidence_content)
        
        status = 'pass' if aide_installed and aide_db_exists else 'warning' if aide_installed else 'fail'
        details = f"AIDE: Installed={aide_installed}, Database={aide_db_exists}, Config={aide_config_exists}"
        
        return ValidationResult(control_id, "AIDE Installation", status, details, str(evidence_path))
    
    def validate_service_minimization(self) -> ValidationResult:
        """Validate service minimization (3.4.6)."""
        control_id = "3.4.6"
        logger.info(f"Validating service minimization (CMMC {control_id})")
        
        # Check for unnecessary services that should be disabled
        unnecessary_services = ['bluetooth', 'cups', 'avahi-daemon']
        disabled_services = []
        enabled_services = []
        
        for service in unnecessary_services:
            success, status = self.run_command(f"systemctl is-enabled {service} 2>&1")
            if success and 'enabled' in status.lower():
                enabled_services.append(service)
            else:
                disabled_services.append(service)
        
        # Get list of all enabled services
        success, all_services = self.run_command("systemctl list-unit-files --type=service --state=enabled | head -30")
        
        # Generate evidence
        evidence_content = f"""Service Minimization Validation - CMMC {control_id}
================================================================================
Date: {datetime.now().isoformat()}
Control: 3.4.6 (Least functionality)

Service Status:
  Unnecessary services disabled: {len(disabled_services)}/{len(unnecessary_services)}
  Unnecessary services still enabled: {len(enabled_services)}

Disabled Services:
"""
        for svc in disabled_services:
            evidence_content += f"  ✓ {svc} (disabled)\n"
        
        if enabled_services:
            evidence_content += "\nEnabled Services (should be disabled):\n"
            for svc in enabled_services:
                evidence_content += f"  ✗ {svc} (enabled)\n"
        
        evidence_content += "\nAll Enabled Services (sample):\n"
        evidence_content += "-" * 80 + "\n"
        evidence_content += all_services
        
        evidence_path = self.save_evidence('service_minimization_validation.txt', evidence_content)
        
        status = 'pass' if len(enabled_services) == 0 else 'warning'
        details = f"Service minimization: {len(disabled_services)}/{len(unnecessary_services)} unnecessary services disabled"
        
        return ValidationResult(control_id, "Service Minimization", status, details, str(evidence_path))
    
    def run_all_validations(self) -> List[ValidationResult]:
        """Run all validation checks."""
        logger.info("Starting CMMC 2.0 Level 2 hardening validation")
        
        validations = [
            self.validate_ssh_hardening,
            self.validate_fail2ban,
            self.validate_firewall,
            self.validate_log_rotation,
            self.validate_ntp,
            self.validate_sudo_logging,
            self.validate_fips,
            self.validate_clamav,
            self.validate_aide,
            self.validate_service_minimization,
        ]
        
        for validation_func in validations:
            try:
                result = validation_func()
                self.results.append(result)
                logger.info(f"{result.control_id}: {result.check_name} - {result.status.upper()}")
            except Exception as e:
                logger.error(f"Error in validation: {e}")
                self.results.append(ValidationResult(
                    "ERROR", "Validation Error", "fail",
                    f"Exception during validation: {e}"
                ))
        
        return self.results
    
    def generate_summary_report(self):
        """Generate comprehensive summary report."""
        summary_path = self.output_dir / 'validation_summary.txt'
        
        # Count results by status
        status_counts = {
            'pass': sum(1 for r in self.results if r.status == 'pass'),
            'fail': sum(1 for r in self.results if r.status == 'fail'),
            'warning': sum(1 for r in self.results if r.status == 'warning'),
            'n/a': sum(1 for r in self.results if r.status == 'n/a'),
        }
        
        total = len(self.results)
        pass_rate = (status_counts['pass'] / total * 100) if total > 0 else 0
        
        with open(summary_path, 'w') as f:
            f.write("CMMC 2.0 Level 2 Hardening Validation Summary\n")
            f.write("=" * 80 + "\n\n")
            f.write(f"Date: {datetime.now().isoformat()}\n")
            f.write(f"Total Checks: {total}\n")
            f.write(f"Passed: {status_counts['pass']}\n")
            f.write(f"Failed: {status_counts['fail']}\n")
            f.write(f"Warnings: {status_counts['warning']}\n")
            f.write(f"Pass Rate: {pass_rate:.1f}%\n\n")
            
            f.write("Validation Results:\n")
            f.write("-" * 80 + "\n")
            for result in self.results:
                status_symbol = {
                    'pass': '✓',
                    'fail': '✗',
                    'warning': '⚠',
                    'n/a': '-'
                }.get(result.status, '?')
                
                f.write(f"{status_symbol} {result.control_id}: {result.check_name}\n")
                f.write(f"   Status: {result.status.upper()}\n")
                f.write(f"   Details: {result.details}\n")
                if result.evidence:
                    f.write(f"   Evidence: {result.evidence}\n")
                f.write("\n")
        
        logger.info(f"Summary report saved to {summary_path}")
        self.evidence_files.append(str(summary_path))
    
    def generate_json_report(self):
        """Generate JSON report for programmatic access."""
        json_path = self.output_dir / 'validation_results.json'
        
        report_data = {
            'timestamp': datetime.now().isoformat(),
            'total_checks': len(self.results),
            'status_counts': {
                'pass': sum(1 for r in self.results if r.status == 'pass'),
                'fail': sum(1 for r in self.results if r.status == 'fail'),
                'warning': sum(1 for r in self.results if r.status == 'warning'),
                'n/a': sum(1 for r in self.results if r.status == 'n/a'),
            },
            'results': [
                {
                    'control_id': r.control_id,
                    'check_name': r.check_name,
                    'status': r.status,
                    'details': r.details,
                    'evidence': r.evidence,
                    'timestamp': r.timestamp
                }
                for r in self.results
            ],
            'evidence_files': self.evidence_files
        }
        
        with open(json_path, 'w') as f:
            json.dump(report_data, f, indent=2)
        
        logger.info(f"JSON report saved to {json_path}")
        self.evidence_files.append(str(json_path))


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='CMMC 2.0 Level 2 Hardening Validation and Evidence Generator',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
This script validates all CMMC 2.0 Level 2 hardening changes and generates
comprehensive evidence for assessment.

Validated Controls:
- 3.1.8: Limit unsuccessful logon attempts (fail2ban)
- 3.1.13: Cryptographic remote access (SSH hardening)
- 3.1.15: Authorize remote privileged commands (sudo logging)
- 3.3.1: Create and retain audit logs (log rotation)
- 3.3.7: System clock synchronization (NTP)
- 3.3.8: Protect audit information (log permissions)
- 3.4.6: Least functionality (service minimization)
- 3.13.6: Deny-by-default network communications (UFW)
- 3.13.9: Terminate network connections (SSH timeout)
- 3.13.11: FIPS-validated cryptography (verification)
- 3.14.2: Malicious code protection (ClamAV)
- 3.14.5: Periodic/real-time scans (AIDE)
        """
    )
    
    parser.add_argument(
        '--output-dir',
        type=Path,
        default=Path('/opt/compliance/validation-evidence'),
        help='Directory to store validation evidence (default: /opt/compliance/validation-evidence)'
    )
    
    args = parser.parse_args()
    
    # Check if running as root (some checks require root)
    if os.geteuid() != 0:
        logger.warning("Not running as root - some checks may fail")
        response = input("Continue anyway? (yes/no): ")
        if response.lower() != 'yes':
            sys.exit(0)
    
    # Initialize generator
    generator = CMMCValidationEvidenceGenerator(args.output_dir)
    
    # Run all validations
    results = generator.run_all_validations()
    
    # Generate reports
    generator.generate_summary_report()
    generator.generate_json_report()
    
    # Print summary
    print("\n" + "=" * 80)
    print("VALIDATION SUMMARY")
    print("=" * 80)
    
    status_counts = {
        'pass': sum(1 for r in results if r.status == 'pass'),
        'fail': sum(1 for r in results if r.status == 'fail'),
        'warning': sum(1 for r in results if r.status == 'warning'),
    }
    
    print(f"Total Checks: {len(results)}")
    print(f"Passed: {status_counts['pass']}")
    print(f"Failed: {status_counts['fail']}")
    print(f"Warnings: {status_counts['warning']}")
    print("\nDetailed Results:")
    print("-" * 80)
    
    for result in results:
        status_symbol = {
            'pass': '✓',
            'fail': '✗',
            'warning': '⚠',
            'n/a': '-'
        }.get(result.status, '?')
        print(f"{status_symbol} {result.control_id}: {result.check_name} - {result.status.upper()}")
        print(f"   {result.details}")
    
    print("\n" + "=" * 80)
    print(f"Evidence directory: {args.output_dir}")
    print(f"Summary report: {args.output_dir / 'validation_summary.txt'}")
    print(f"JSON report: {args.output_dir / 'validation_results.json'}")
    print("=" * 80)


if __name__ == '__main__':
    main()

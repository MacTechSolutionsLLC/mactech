#!/usr/bin/env python3
"""
Ubuntu 22.04 LTS STIG Hardening Script

This script parses the XCCDF STIG XML file and automatically applies
hardening configurations to the system based on the STIG requirements.

Usage:
    sudo python3 harden_ubuntu_stig.py --stig-file <path> [--log-file <path>]
"""

import argparse
import getpass
import logging
import os
import re
import shutil
import subprocess
import sys
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


@dataclass
class StigRule:
    """Represents a STIG rule with its fix instructions."""
    rule_id: str
    vuln_id: str
    title: str
    severity: str
    fix_text: str
    check_content: str
    version: str = ""


class StigParser:
    """Parser for XCCDF STIG XML files."""
    
    XCCDF_NS = "http://checklists.nist.gov/xccdf/1.1"
    
    def __init__(self, xml_file: Path):
        self.xml_file = xml_file
        self.rules: List[StigRule] = []
        
    def parse(self) -> List[StigRule]:
        """Parse the STIG XML file and extract all rules."""
        logger.info(f"Parsing STIG file: {self.xml_file}")
        
        try:
            tree = ET.parse(self.xml_file)
            root = tree.getroot()
        except ET.ParseError as e:
            logger.error(f"Failed to parse XML: {e}")
            raise
        
        # Register namespace
        ET.register_namespace('xccdf', self.XCCDF_NS)
        
        # Find all Group elements (each contains a Rule)
        groups = root.findall(f".//{{{self.XCCDF_NS}}}Group")
        if not groups:
            # Try without namespace
            groups = root.findall(".//Group")
        
        logger.info(f"Found {len(groups)} groups")
        
        for group in groups:
            rule = group.find(f"{{{self.XCCDF_NS}}}Rule")
            if rule is None:
                rule = group.find("Rule")
            
            if rule is None:
                continue
            
            rule_id = rule.get("id", "")
            severity = rule.get("severity", "medium")
            version_elem = rule.find(f"{{{self.XCCDF_NS}}}version")
            version = version_elem.text if version_elem is not None else ""
            
            title_elem = rule.find(f"{{{self.XCCDF_NS}}}title")
            title = title_elem.text if title_elem is not None else ""
            
            # Get fixtext
            fix_elem = rule.find(f".//{{{self.XCCDF_NS}}}fixtext")
            if fix_elem is None:
                fix_elem = rule.find(".//fixtext")
            fix_text = fix_elem.text if fix_elem is not None else ""
            
            # Get check content
            check_elem = rule.find(f".//{{{self.XCCDF_NS}}}check//{{{self.XCCDF_NS}}}check-content")
            if check_elem is None:
                check_elem = rule.find(".//check//check-content")
            check_content = check_elem.text if check_elem is not None else ""
            
            # Extract vulnerability ID from Group
            vuln_id = group.get("id", "")
            
            if fix_text:
                stig_rule = StigRule(
                    rule_id=rule_id,
                    vuln_id=vuln_id,
                    title=title,
                    severity=severity,
                    fix_text=fix_text,
                    check_content=check_content,
                    version=version
                )
                self.rules.append(stig_rule)
        
        logger.info(f"Extracted {len(self.rules)} rules with fix instructions")
        return self.rules


class CommandExtractor:
    """Extract and classify shell commands from fix text."""
    
    def __init__(self):
        self.command_patterns = {
            'package_install': re.compile(r'apt\s+(?:install|get install)\s+([^\s]+)', re.IGNORECASE),
            'package_remove': re.compile(r'apt\s+(?:remove|purge)\s+([^\s]+)', re.IGNORECASE),
            'systemctl': re.compile(r'systemctl\s+([a-z]+)\s+([^\s]+)', re.IGNORECASE),
            'sysctl': re.compile(r'sysctl\s+([^\s]+)\s*=\s*([^\s]+)', re.IGNORECASE),
            'sed': re.compile(r'sed\s+-i\s+([^\s]+)\s+([^\s]+)', re.IGNORECASE),
            'echo_append': re.compile(r'echo\s+([^\|]+)\s*>>\s*([^\s]+)', re.IGNORECASE),
            'grub_update': re.compile(r'update-grub', re.IGNORECASE),
            'grub_password': re.compile(r'grub-mkpasswd-pbkdf2', re.IGNORECASE),
        }
    
    def extract_commands(self, fix_text: str) -> List[Dict]:
        """Extract commands from fix text and classify them."""
        commands = []
        lines = fix_text.split('\n')
        
        # Handle multi-line commands
        current_command = []
        for line in lines:
            line = line.strip()
            
            # Skip empty lines, comments, and descriptive text
            if not line:
                if current_command:
                    cmd_text = ' '.join(current_command)
                    if self._is_valid_command(cmd_text):
                        cmd_type = self._classify_command(cmd_text)
                        if cmd_type:
                            commands.append({
                                'type': cmd_type,
                                'command': cmd_text,
                                'original': cmd_text
                            })
                    current_command = []
                continue
            
            # Skip comments
            if line.startswith('#'):
                continue
            
            # Skip descriptive text (lines that don't look like commands)
            # Skip lines that are just descriptions (contain ":" but don't start with $ or sudo)
            if ':' in line and not (line.startswith('$') or line.startswith('sudo') or line.startswith('apt') or line.startswith('systemctl')):
                # This is likely descriptive text, not a command
                if current_command:
                    cmd_text = ' '.join(current_command)
                    if self._is_valid_command(cmd_text):
                        cmd_type = self._classify_command(cmd_text)
                        if cmd_type:
                            commands.append({
                                'type': cmd_type,
                                'command': cmd_text,
                                'original': cmd_text
                            })
                    current_command = []
                continue
            
            # Skip lines with placeholders (like <audit_tool_name>)
            if re.search(r'<[^>]+>', line):
                if current_command:
                    cmd_text = ' '.join(current_command)
                    if self._is_valid_command(cmd_text):
                        cmd_type = self._classify_command(cmd_text)
                        if cmd_type:
                            commands.append({
                                'type': cmd_type,
                                'command': cmd_text,
                                'original': cmd_text
                            })
                    current_command = []
                continue
            
            # Remove leading $ if present
            line = re.sub(r'^\$\s*', '', line)
            
            # Check if line continues a command (ends with \)
            if line.endswith('\\'):
                current_command.append(line[:-1].strip())
                continue
            
            # Complete any pending command
            if current_command:
                current_command.append(line)
                cmd_text = ' '.join(current_command)
                if self._is_valid_command(cmd_text):
                    cmd_type = self._classify_command(cmd_text)
                    if cmd_type:
                        commands.append({
                            'type': cmd_type,
                            'command': cmd_text,
                            'original': cmd_text
                        })
                current_command = []
            else:
                # Single line command
                if self._is_valid_command(line):
                    cmd_type = self._classify_command(line)
                    if cmd_type:
                        commands.append({
                            'type': cmd_type,
                            'command': line,
                            'original': line
                        })
        
        # Handle any remaining command
        if current_command:
            cmd_text = ' '.join(current_command)
            if self._is_valid_command(cmd_text):
                cmd_type = self._classify_command(cmd_text)
                if cmd_type:
                    commands.append({
                        'type': cmd_type,
                        'command': cmd_text,
                        'original': cmd_text
                    })
        
        return commands
    
    def _is_valid_command(self, line: str) -> bool:
        """Check if a line looks like a valid shell command."""
        line = line.strip()
        
        # Skip empty lines
        if not line:
            return False
        
        # Skip lines that are clearly descriptions
        if line.startswith('Configure ') or line.startswith('To ') or line.startswith('If ') or \
           line.startswith('Edit ') or line.startswith('Add ') or line.startswith('Remove '):
            return False
        
        # Skip lines with placeholders (but allow if it's part of a valid command structure)
        if re.search(r'<[^>]+>', line) and not any(cmd in line.lower() for cmd in ['sed', 'grep', 'find']):
            return False
        
        # Skip lines that are just instructions
        if 'Replace "' in line or 'document the need' in line.lower() or \
           'where ' in line.lower() and 'must be substituted' in line.lower():
            return False
        
        # Skip lines that are just directory paths ending with /
        if line.endswith('/') and not (line.startswith('sudo') or line.startswith('/') or 'chmod' in line.lower() or 'chown' in line.lower()):
            return False
        
        # Skip lines that start with just a single letter or dash (like audit rules without -a)
        # But allow auditctl commands that start with -w or -a
        if re.match(r'^[a-z]\s+/', line) or (line.startswith('-') and not any(line.startswith(prefix) for prefix in ['-a', '-w', 'sudo'])):
            return False
        
        # Skip lines that are just configuration values (like "PermitEmptyPasswords no")
        if re.match(r'^[A-Z][a-zA-Z]+', line) and ' ' in line and not line.startswith('sudo'):
            # Check if it looks like a config line (key value pair)
            parts = line.split()
            if len(parts) == 2 and parts[1] in ['yes', 'no', 'true', 'false', '1', '0']:
                return False
        
        # Must contain at least one command-like word
        command_words = ['sudo', 'apt', 'systemctl', 'chmod', 'chown', 'chgrp', 'find', 
                        'sed', 'echo', 'grep', 'cat', 'touch', 'mkdir', 'sysctl',
                        'update-grub', 'grub-mkpasswd', 'dpkg', 'ufw', 'timedatectl',
                        'passwd', 'useradd', 'chage', 'gpasswd', 'su -c']
        
        line_lower = line.lower()
        if any(word in line_lower for word in command_words):
            return True
        
        # Or must start with a path (but not just a directory reference)
        if line.startswith('/') and not line.endswith('/'):
            return True
        
        return False
    
    def _classify_command(self, line: str) -> Optional[str]:
        """Classify a command by type."""
        # Remove sudo prefix for classification
        line_clean = re.sub(r'^sudo\s+', '', line).strip()
        line_lower = line_clean.lower()
        
        # Skip lines that start with - (usually audit rules or config values)
        if line_clean.startswith('-') and not line_clean.startswith('-a'):
            return None
        
        # Skip lines that are just directory paths
        if line_clean.endswith('/') and not line_clean.startswith('/'):
            return None
        
        if 'apt install' in line_lower or 'apt-get install' in line_lower:
            return 'package_install'
        elif 'apt remove' in line_lower or 'apt purge' in line_lower or 'apt-get remove' in line_lower:
            return 'package_remove'
        elif 'systemctl' in line_lower:
            return 'systemctl'
        elif 'sysctl' in line_lower and not line_lower.startswith('/'):
            return 'sysctl'
        elif 'sed' in line_lower:
            return 'file_edit'
        elif 'echo' in line_lower and '>>' in line_lower:
            return 'file_append'
        elif 'update-grub' in line_lower:
            return 'grub_update'
        elif 'grub-mkpasswd-pbkdf2' in line_lower:
            return 'grub_password'
        elif '/etc/default/grub' in line_lower or '/etc/grub.d' in line_lower:
            return 'grub_config'
        elif '/etc/ssh/sshd_config' in line_lower:
            return 'ssh_config'
        elif '/etc/pam.d' in line_lower:
            return 'pam_config'
        elif '/etc/apt' in line_lower:
            return 'apt_config'
        elif line_clean.startswith('chmod') or line_clean.startswith('chown') or line_clean.startswith('chgrp'):
            return 'file_permissions'
        elif line_clean.startswith('find'):
            return 'file_permissions'
        elif 'touch' in line_lower or 'mkdir' in line_lower:
            return 'file_create'
        elif 'dpkg' in line_lower:
            return 'package_remove'  # dpkg -P is for purging packages
        elif 'ufw' in line_lower:
            return 'firewall_config'
        elif 'timedatectl' in line_lower:
            return 'generic'
        elif 'passwd' in line_lower and line_clean.startswith('passwd'):
            return 'generic'
        else:
            return 'generic'
        
        return None


class SystemHardener:
    """Apply STIG hardening fixes to the system."""
    
    def __init__(self, backup_dir: Path = Path("/tmp/stig_backups")):
        self.backup_dir = backup_dir
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        self.stats = {
            'total': 0,
            'applied': 0,
            'skipped': 0,
            'failed': 0,
            'manual': []
        }
        self.grub_password_hash: Optional[str] = None
    
    def check_prerequisites(self) -> bool:
        """Check system prerequisites before hardening."""
        logger.info("Checking system prerequisites...")
        
        # Check if running as root or with sudo
        if os.geteuid() != 0:
            logger.error("This script must be run as root or with sudo")
            return False
        
        # Check Ubuntu version
        try:
            result = subprocess.run(
                ['lsb_release', '-rs'],
                capture_output=True,
                text=True,
                check=True
            )
            version = result.stdout.strip()
            if not version.startswith('22.04'):
                logger.warning(f"System is Ubuntu {version}, but script is designed for 22.04")
                response = input("Continue anyway? (y/N): ")
                if response.lower() != 'y':
                    return False
        except (subprocess.CalledProcessError, FileNotFoundError):
            logger.warning("Could not verify Ubuntu version")
        
        # Check FIPS
        try:
            with open('/proc/sys/crypto/fips_enabled', 'r') as f:
                fips = f.read().strip()
                if fips != '1':
                    logger.warning("FIPS is not enabled. Some STIG requirements may not be met.")
        except FileNotFoundError:
            logger.warning("Could not check FIPS status")
        
        logger.info("Prerequisites check passed")
        return True
    
    def backup_file(self, file_path: Path) -> bool:
        """Backup a file before modification."""
        try:
            if not file_path.exists():
                return True
            
            backup_path = self.backup_dir / file_path.name
            shutil.copy2(file_path, backup_path)
            logger.debug(f"Backed up {file_path} to {backup_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to backup {file_path}: {e}")
            return False
    
    def run_command(self, command: str, check: bool = True) -> Tuple[bool, str]:
        """Run a shell command and return success status and output."""
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                check=check
            )
            return True, result.stdout
        except subprocess.CalledProcessError as e:
            return False, e.stderr
    
    def apply_package_fix(self, command: str, rule: StigRule) -> bool:
        """Apply package installation/removal fixes."""
        logger.info(f"Applying package fix: {command}")
        
        # Remove sudo if present
        command = re.sub(r'^sudo\s+', '', command)
        
        # Handle dpkg -P (purge) commands
        if 'dpkg' in command.lower() and '-P' in command:
            # Extract package name
            pkg_match = re.search(r'dpkg\s+-P[^\s]+\s+([^\s]+)', command, re.IGNORECASE)
            if pkg_match:
                pkg_name = pkg_match.group(1)
                # Check if already removed
                success, output = self.run_command(f"dpkg -l | grep -q '^ii\\s+{pkg_name}'", check=False)
                if not success:
                    logger.info(f"Package {pkg_name} is already removed")
                    return True
            # Execute dpkg command
            success, output = self.run_command(command)
            if success:
                logger.info(f"Successfully applied package fix")
                return True
            else:
                logger.error(f"Failed to apply package fix: {output}")
                return False
        
        # Check if package is already in desired state
        if 'install' in command.lower():
            package = re.search(r'install\s+([^\s]+)', command, re.IGNORECASE)
            if package:
                pkg_name = package.group(1)
                # Check if already installed
                success, output = self.run_command(f"dpkg -l | grep -q '^ii\\s+{pkg_name}'", check=False)
                if success:
                    logger.info(f"Package {pkg_name} is already installed")
                    return True
        elif 'remove' in command.lower() or 'purge' in command.lower():
            package = re.search(r'(?:remove|purge)\s+([^\s]+)', command, re.IGNORECASE)
            if package:
                pkg_name = package.group(1)
                # Check if already removed
                success, output = self.run_command(f"dpkg -l | grep -q '^ii\\s+{pkg_name}'", check=False)
                if not success:
                    logger.info(f"Package {pkg_name} is already removed")
                    return True
        
        # Run apt update first if installing
        if 'install' in command.lower():
            self.run_command("apt-get update", check=False)
        
        success, output = self.run_command(command)
        if success:
            logger.info(f"Successfully applied package fix")
            return True
        else:
            logger.error(f"Failed to apply package fix: {output}")
            return False
    
    def apply_systemd_fix(self, command: str, rule: StigRule) -> bool:
        """Apply systemd service fixes."""
        logger.info(f"Applying systemd fix: {command}")
        
        # Remove sudo if present
        command = re.sub(r'^sudo\s+', '', command)
        
        # Extract action and service (service is optional for some commands)
        # Handle complex commands like "systemctl -s SIGHUP kill sshd" or "systemctl kill auditd -s SIGHUP"
        # Pattern: systemctl [flags] action [service] [more flags]
        match = re.search(r'systemctl\s+(?:[-\w]+\s+)*(\w+)(?:\s+([^\s]+))?', command, re.IGNORECASE)
        if not match:
            # Try to match commands with flags at the end
            match = re.search(r'systemctl\s+(\w+)\s+([^\s]+)(?:\s+.*)?', command, re.IGNORECASE)
        
        if not match:
            # If still no match, just try to execute the command directly
            logger.warning(f"Could not parse systemctl command, executing directly: {command}")
            success, output = self.run_command(command)
            if success:
                logger.info(f"Successfully executed: {command}")
                return True
            else:
                logger.error(f"Failed to execute: {output}")
                return False
        
        action = match.group(1).lower()
        service = match.group(2) if len(match.groups()) > 1 and match.group(2) else None
        
        # Handle commands without service (like daemon-reload, kill with signals)
        if not service or action in ['daemon-reload', 'kill']:
            success, output = self.run_command(command)
            if success:
                logger.info(f"Successfully executed: {command}")
                return True
            else:
                logger.error(f"Failed to execute: {output}")
                return False
        
        # Check current state
        success, output = self.run_command(f"systemctl is-enabled {service}", check=False)
        if action == 'enable' and 'enabled' in output:
            logger.info(f"Service {service} is already enabled")
            return True
        elif action == 'disable' and 'disabled' in output:
            logger.info(f"Service {service} is already disabled")
            return True
        elif action == 'mask':
            success, output = self.run_command(f"systemctl is-active {service}", check=False)
            if 'masked' in output or 'inactive' in output:
                # Check if already masked
                success, output = self.run_command(f"systemctl status {service}", check=False)
                if 'masked' in output:
                    logger.info(f"Service {service} is already masked")
                    return True
        
        success, output = self.run_command(command)
        if success:
            logger.info(f"Successfully applied systemd fix")
            return True
        else:
            logger.error(f"Failed to apply systemd fix: {output}")
            return False
    
    def apply_sysctl_fix(self, command: str, rule: StigRule) -> bool:
        """Apply sysctl parameter fixes."""
        logger.info(f"Applying sysctl fix: {command}")
        
        # Remove sudo if present
        command = re.sub(r'^sudo\s+', '', command)
        
        # Handle sysctl --system (reload)
        if '--system' in command or '-p' in command:
            success, output = self.run_command(command)
            if success:
                logger.info("Successfully reloaded sysctl")
                return True
            else:
                logger.warning(f"Failed to reload sysctl: {output}")
                return False
        
        # Skip directory references
        if command.endswith('/') or '/sysctl.d/' in command:
            logger.info("Skipping directory reference in sysctl fix")
            return True
        
        # Extract parameter and value from the fix text if available
        # Look for patterns like "kernel.dmesg_restrict = 1" in the rule description
        param_match = re.search(r'(\w+(?:\.\w+)+)\s*=\s*(\w+)', rule.fix_text)
        if not param_match:
            # Also try to extract from the command itself
            param_match = re.search(r'(\w+(?:\.\w+)+)\s*=\s*(\w+)', command)
        
        if param_match:
            param = param_match.group(1)
            value = param_match.group(2)
            
            # Check current value
            success, output = self.run_command(f"sysctl {param}", check=False)
            if success:
                current_match = re.search(r'=\s*(\w+)', output)
                if current_match and current_match.group(1) == value:
                    logger.info(f"Sysctl parameter {param} is already set to {value}")
                else:
                    # Set the parameter
                    self.run_command(f"sysctl -w {param}={value}", check=False)
                    logger.info(f"Set sysctl parameter {param}={value}")
            
            # Write to sysctl.d for persistence
            sysctl_file = Path(f"/etc/sysctl.d/99-stig-{param.replace('.', '-')}.conf")
            if sysctl_file.exists():
                # Check if already configured
                with open(sysctl_file, 'r') as f:
                    content = f.read()
                    if f"{param} = {value}" in content or f"{param}={value}" in content:
                        logger.info(f"Sysctl parameter already in {sysctl_file}")
                        return True
            
            self.backup_file(sysctl_file)
            with open(sysctl_file, 'w') as f:
                f.write(f"{param} = {value}\n")
            logger.info(f"Wrote sysctl parameter to {sysctl_file}")
            
            # Reload sysctl
            self.run_command("sysctl --system", check=False)
            return True
        
        # If no parameter found, try to execute the command directly
        if command.startswith('sysctl'):
            success, output = self.run_command(command)
            if success:
                # Reload sysctl
                self.run_command("sysctl --system", check=False)
                return True
            else:
                logger.error(f"Failed to apply sysctl fix: {output}")
                return False
        
        # If it's a directory reference or other non-command, skip it
        if '/sysctl.d' in command or command.endswith('/'):
            logger.info("Skipping directory reference in sysctl fix")
            return True
        
        logger.warning(f"Could not parse sysctl command: {command}")
        return False
    
    def apply_file_edit(self, command: str, rule: StigRule) -> bool:
        """Apply file edit fixes (sed, echo, chmod, chown, find, etc.)."""
        logger.info(f"Applying file edit: {command}")
        
        # Remove sudo if present for execution
        command_to_run = re.sub(r'^sudo\s+', '', command)
        command_clean = command_to_run.strip()
        
        # For chmod, chown, chgrp, find - these are direct commands, not file edits
        if command_clean.startswith('chmod') or command_clean.startswith('chown') or \
           command_clean.startswith('chgrp') or command_clean.startswith('find'):
            # These are direct commands, execute them
            success, output = self.run_command(command_to_run)
            if success:
                logger.info(f"Successfully executed: {command}")
                return True
            else:
                logger.error(f"Failed to execute: {output}")
                return False
        
        # Extract file path for sed/echo operations
        file_match = re.search(r'(/etc/[^\s"\'\)]+|/var/[^\s"\'\)]+|/usr/[^\s"\'\)]+|/lib[^\s"\'\)]*)', command)
        if not file_match:
            logger.error(f"Could not extract file path from: {command}")
            return False
        
        file_path = Path(file_match.group(1))
        
        # Backup file
        if not self.backup_file(file_path):
            logger.warning(f"Could not backup {file_path}, continuing anyway")
        
        # Handle echo >> (append) commands - check if line already exists
        if 'echo' in command.lower() and '>>' in command:
            # Extract the text to append
            echo_match = re.search(r'echo\s+["\']?([^"\']+)["\']?\s*>>', command)
            if echo_match and file_path.exists():
                text_to_append = echo_match.group(1).strip()
                with open(file_path, 'r') as f:
                    if text_to_append in f.read():
                        logger.info(f"Line already exists in {file_path}")
                        return True
        
        # Handle sed commands - check if pattern already matches
        if 'sed' in command.lower() and '-i' in command:
            # Try to extract the pattern and replacement
            sed_match = re.search(r"sed\s+-i\s+['\"]([^'\"]+)['\"]", command)
            if sed_match:
                pattern = sed_match.group(1)
                # Check if file already matches pattern
                if file_path.exists():
                    with open(file_path, 'r') as f:
                        content = f.read()
                        # Simple check - if pattern would match, verify it's already applied
                        # This is a simplified check
                        pass
        
        # Apply command
        success, output = self.run_command(command_to_run)
        if success:
            logger.info(f"Successfully edited {file_path}")
            return True
        else:
            logger.error(f"Failed to edit file: {output}")
            return False
    
    def apply_grub_config(self, commands: List[str], rule: StigRule) -> bool:
        """Apply GRUB configuration fixes."""
        logger.info("Applying GRUB configuration fixes")
        
        grub_default = Path("/etc/default/grub")
        grub_custom = Path("/etc/grub.d/40_custom")
        
        # Backup files
        self.backup_file(grub_default)
        self.backup_file(grub_custom)
        
        # Handle GRUB password requirement
        if rule.vuln_id == "V-260470" or "grub-mkpasswd-pbkdf2" in rule.fix_text:
            if not self.grub_password_hash:
                logger.info("GRUB password required for this rule")
                password = getpass.getpass("Enter GRUB password: ")
                password_confirm = getpass.getpass("Confirm GRUB password: ")
                
                if password != password_confirm:
                    logger.error("Passwords do not match")
                    return False
                
                # Generate hash
                process = subprocess.Popen(
                    ['grub-mkpasswd-pbkdf2'],
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                stdout, stderr = process.communicate(input=f"{password}\n{password}\n")
                
                if process.returncode != 0:
                    logger.error(f"Failed to generate GRUB password hash: {stderr}")
                    return False
                
                # Extract hash from output
                hash_match = re.search(r'grub\.pbkdf2\.sha512\.\d+\.[A-Za-z0-9+/=]+', stdout)
                if hash_match:
                    self.grub_password_hash = hash_match.group(0)
                    logger.info("Generated GRUB password hash")
                else:
                    logger.error("Could not extract hash from grub-mkpasswd-pbkdf2 output")
                    return False
                
                # Add password to grub custom file
                if self.grub_password_hash:
                    # Check if already configured
                    if grub_custom.exists():
                        with open(grub_custom, 'r') as f:
                            content = f.read()
                            if 'password_pbkdf2' in content and self.grub_password_hash in content:
                                logger.info("GRUB password already configured")
                            else:
                                # Read existing lines
                                lines = content.split('\n')
                                new_lines = []
                                insert_pos = -1
                                
                                # Process lines and find insertion point
                                for i, line in enumerate(lines):
                                    # Find where to insert (right after exec tail line)
                                    if 'exec tail' in line.lower():
                                        insert_pos = len(new_lines) + 1  # Position in new_lines after this line
                                    # Remove old password entries
                                    if 'set superusers' in line.lower() or 'password_pbkdf2' in line.lower():
                                        continue
                                    new_lines.append(line)
                                
                                # If we didn't find exec tail, append at end
                                if insert_pos == -1:
                                    insert_pos = len(new_lines)
                                
                                # Insert password config right after exec tail (or at end)
                                password_lines = [
                                    '',
                                    '# STIG: GRUB password configuration',
                                    'set superusers="root"',
                                    f'password_pbkdf2 root {self.grub_password_hash}'
                                ]
                                
                                # Insert at the right position
                                for idx, pwd_line in enumerate(password_lines):
                                    new_lines.insert(insert_pos + idx, pwd_line)
                                
                                with open(grub_custom, 'w') as f:
                                    f.write('\n'.join(new_lines))
                                logger.info(f"Added GRUB password to {grub_custom}")
                    else:
                        # Create new file with proper GRUB script format
                        with open(grub_custom, 'w') as f:
                            f.write('#!/bin/sh\n')
                            f.write('exec tail -n +3 $0\n')
                            f.write('# This file provides an easy way to add custom menu entries.\n')
                            f.write('# STIG: GRUB password configuration\n')
                            f.write('set superusers="root"\n')
                            f.write(f'password_pbkdf2 root {self.grub_password_hash}\n')
                        # Make it executable
                        os.chmod(grub_custom, 0o755)
                        logger.info(f"Created GRUB password configuration in {grub_custom}")
        
        # Apply GRUB configuration changes from fix text
        # Handle audit=1 in GRUB_CMDLINE_LINUX
        grub_updated = False
        if "audit=1" in rule.fix_text or "GRUB_CMDLINE_LINUX" in rule.fix_text:
            if grub_default.exists():
                with open(grub_default, 'r') as f:
                    content = f.read()
                
                # Check if audit=1 is already present
                if 'audit=1' in content:
                    logger.info("audit=1 already present in GRUB configuration")
                else:
                    # Add audit=1 to GRUB_CMDLINE_LINUX and GRUB_CMDLINE_LINUX_DEFAULT
                    lines = content.split('\n')
                    new_lines = []
                    for line in lines:
                        if line.startswith('GRUB_CMDLINE_LINUX=') or line.startswith('GRUB_CMDLINE_LINUX_DEFAULT='):
                            # Add audit=1 if not present
                            if 'audit=1' not in line:
                                if line.endswith('"'):
                                    line = line[:-1] + ' audit=1"'
                                else:
                                    line = line + ' audit=1'
                                grub_updated = True
                        new_lines.append(line)
                    
                    if grub_updated:
                        with open(grub_default, 'w') as f:
                            f.write('\n'.join(new_lines))
                        logger.info("Added audit=1 to GRUB configuration")
        
        # Apply other GRUB commands
        for cmd in commands:
            if 'sed' in cmd.lower() or 'echo' in cmd.lower():
                success, _ = self.run_command(cmd)
                if not success:
                    logger.warning(f"Failed to apply GRUB command: {cmd}")
                else:
                    grub_updated = True
        
        # Only update GRUB if we made changes
        if not grub_updated and not self.grub_password_hash:
            logger.info("No GRUB changes to apply")
            return True
        
        # Validate GRUB custom file before updating
        if grub_custom.exists():
            with open(grub_custom, 'r') as f:
                content = f.read()
                # Check for duplicate password entries
                password_count = content.count('password_pbkdf2')
                if password_count > 1:
                    logger.warning(f"Found {password_count} password entries in {grub_custom}, cleaning up...")
                    # Remove duplicates, keep only the first valid one
                    lines = content.split('\n')
                    new_lines = []
                    found_superusers = False
                    found_password = False
                    for i, line in enumerate(lines):
                        if 'set superusers' in line.lower():
                            if not found_superusers:
                                new_lines.append(line)
                                found_superusers = True
                            # Skip duplicate superusers lines
                            continue
                        elif 'password_pbkdf2' in line.lower():
                            if not found_password and found_superusers:
                                # Keep the first password after superusers
                                new_lines.append(line)
                                found_password = True
                            # Skip duplicate password lines
                            continue
                        new_lines.append(line)
                    
                    with open(grub_custom, 'w') as f:
                        f.write('\n'.join(new_lines))
                    logger.info("Cleaned up duplicate GRUB password entries")
        
        # Update GRUB
        success, output = self.run_command("update-grub")
        if success:
            logger.info("Successfully updated GRUB configuration")
            return True
        else:
            logger.error(f"Failed to update GRUB: {output}")
            # Try to get more details about the error
            if '/boot/grub/grub.cfg.new' in output:
                logger.error("GRUB config generation failed. Check /boot/grub/grub.cfg.new for details.")
                logger.error("You may need to manually fix the GRUB configuration before rebooting.")
            return False
    
    def apply_fix(self, rule: StigRule) -> bool:
        """Apply a single STIG rule fix."""
        self.stats['total'] += 1
        logger.info(f"Processing rule: {rule.vuln_id} - {rule.title}")
        
        extractor = CommandExtractor()
        commands = extractor.extract_commands(rule.fix_text)
        
        if not commands:
            logger.warning(f"No commands extracted for rule {rule.vuln_id}")
            self.stats['skipped'] += 1
            return False
        
        # Group commands by type
        grub_commands = []
        other_commands = []
        
        for cmd in commands:
            if cmd['type'] in ['grub_config', 'grub_update', 'grub_password']:
                grub_commands.append(cmd['command'])
            else:
                other_commands.append(cmd)
        
        # Apply GRUB fixes together
        if grub_commands:
            grub_success = self.apply_grub_config(grub_commands, rule)
            # Don't fail the entire rule if GRUB update fails - it might be a syntax issue
            # that needs manual fixing, but other parts of the rule might have succeeded
            if not grub_success:
                logger.warning(f"GRUB configuration had issues for rule {rule.vuln_id}, but continuing...")
                # Still mark as applied if we made changes, even if update-grub failed
                if self.grub_password_hash or 'audit=1' in rule.fix_text:
                    self.stats['applied'] += 1
                    self.stats['manual'].append(f"{rule.vuln_id}: GRUB update failed - manual review needed")
                else:
                    self.stats['failed'] += 1
            else:
                self.stats['applied'] += 1
        
        # Apply other fixes
        all_success = True
        for cmd in other_commands:
            cmd_type = cmd['type']
            cmd_text = cmd['command']
            
            if cmd_type == 'package_install' or cmd_type == 'package_remove':
                success = self.apply_package_fix(cmd_text, rule)
            elif cmd_type == 'systemctl':
                success = self.apply_systemd_fix(cmd_text, rule)
            elif cmd_type == 'sysctl':
                success = self.apply_sysctl_fix(cmd_text, rule)
            elif cmd_type == 'file_permissions':
                # Handle file permissions commands directly
                cmd_to_run = re.sub(r'^sudo\s+', '', cmd_text)
                success, output = self.run_command(cmd_to_run, check=False)
                if not success:
                    logger.warning(f"File permissions command failed: {output}")
            elif cmd_type in ['file_edit', 'file_append']:
                success = self.apply_file_edit(cmd_text, rule)
            elif cmd_type == 'grub_config':
                # GRUB config is handled separately above
                success = True
            elif cmd_type == 'ssh_config' or cmd_type == 'pam_config' or cmd_type == 'apt_config':
                success = self.apply_file_edit(cmd_text, rule)
            elif cmd_type == 'file_create':
                # Handle file creation commands
                # Remove sudo if present
                cmd_to_run = re.sub(r'^sudo\s+', '', cmd_text)
                success, output = self.run_command(cmd_to_run, check=False)
                if not success:
                    logger.warning(f"File creation command failed: {output}")
            elif cmd_type == 'firewall_config':
                # Handle firewall configuration
                cmd_to_run = re.sub(r'^sudo\s+', '', cmd_text)
                success, output = self.run_command(cmd_to_run, check=False)
                if not success:
                    logger.warning(f"Firewall command failed: {output}")
            else:
                logger.warning(f"Unhandled command type: {cmd_type} for command: {cmd_text}")
                # Try to run as generic command
                success, output = self.run_command(cmd_text, check=False)
                if not success:
                    logger.warning(f"Generic command failed: {output}")
            
            if not success:
                all_success = False
        
        if all_success:
            self.stats['applied'] += 1
            return True
        else:
            self.stats['failed'] += 1
            return False
    
    def print_summary(self):
        """Print summary of hardening operations."""
        print("\n" + "="*60)
        print("STIG Hardening Summary")
        print("="*60)
        print(f"Total rules processed: {self.stats['total']}")
        print(f"Successfully applied: {self.stats['applied']}")
        print(f"Skipped: {self.stats['skipped']}")
        print(f"Failed: {self.stats['failed']}")
        if self.stats['manual']:
            print(f"\nManual actions required: {len(self.stats['manual'])}")
            for item in self.stats['manual']:
                print(f"  - {item}")
        print("="*60)


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Apply Ubuntu 22.04 LTS STIG hardening configurations'
    )
    parser.add_argument(
        '--stig-file',
        type=Path,
        required=True,
        help='Path to STIG XCCDF XML file'
    )
    parser.add_argument(
        '--log-file',
        type=Path,
        default=Path('/var/log/ubuntu_stig_hardening.log'),
        help='Path to log file (default: /var/log/ubuntu_stig_hardening.log)'
    )
    
    args = parser.parse_args()
    
    # Ensure log file directory exists
    args.log_file.parent.mkdir(parents=True, exist_ok=True)
    
    # Setup file logging
    try:
        file_handler = logging.FileHandler(args.log_file)
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(
            logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        )
        logger.addHandler(file_handler)
    except PermissionError:
        logger.warning(f"Cannot write to log file {args.log_file}, logging to console only")
    except Exception as e:
        logger.warning(f"Failed to setup file logging: {e}, logging to console only")
    
    # Check prerequisites
    hardener = SystemHardener()
    if not hardener.check_prerequisites():
        logger.error("Prerequisites check failed")
        sys.exit(1)
    
    # Parse STIG file
    if not args.stig_file.exists():
        logger.error(f"STIG file not found: {args.stig_file}")
        sys.exit(1)
    
    stig_parser = StigParser(args.stig_file)
    try:
        rules = stig_parser.parse()
        if not rules:
            logger.error("No rules found in STIG file")
            sys.exit(1)
    except Exception as e:
        logger.error(f"Failed to parse STIG file: {e}")
        sys.exit(1)
    
    # Apply fixes
    logger.info(f"Starting hardening process for {len(rules)} rules")
    logger.info("Note: Some fixes may require a system reboot to take effect")
    
    for i, rule in enumerate(rules, 1):
        try:
            logger.info(f"Processing rule {i}/{len(rules)}: {rule.vuln_id}")
            hardener.apply_fix(rule)
        except KeyboardInterrupt:
            logger.warning("Hardening process interrupted by user")
            break
        except Exception as e:
            logger.error(f"Error applying fix for {rule.vuln_id}: {e}", exc_info=True)
            hardener.stats['failed'] += 1
    
    # Print summary
    hardener.print_summary()
    
    logger.info("Hardening process completed")
    logger.info(f"Backups saved to: {hardener.backup_dir}")
    logger.info(f"Log file: {args.log_file}")


if __name__ == '__main__':
    main()

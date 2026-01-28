#!/usr/bin/env python3
"""
Recovery script to restore sudo access after STIG hardening.

This script restores the sudoers file from backup to re-enable passwordless sudo
(if that's what was configured before).

Usage:
    sudo python3 restore_sudo_access.py
"""

import argparse
import os
import shutil
import sys
from pathlib import Path

def main():
    """Restore sudoers file from backup."""
    if os.geteuid() != 0:
        print("ERROR: This script must be run as root or with sudo")
        print("If you can't use sudo, you'll need to:")
        print("1. Access the system as root directly (console, recovery mode, etc.)")
        print("2. Or restore the files manually from /tmp/stig_backups/")
        sys.exit(1)
    
    backup_dir = Path("/tmp/stig_backups")
    
    if not backup_dir.exists():
        print(f"ERROR: Backup directory not found: {backup_dir}")
        print("Backups may have been cleaned up or stored elsewhere.")
        sys.exit(1)
    
    # Find sudoers backup
    sudoers_backup = backup_dir / "sudoers"
    sudoers_d_backups = list(backup_dir.glob("sudoers.d*"))
    
    if not sudoers_backup.exists() and not sudoers_d_backups:
        print(f"ERROR: No sudoers backups found in {backup_dir}")
        print(f"Available backups:")
        for f in sorted(backup_dir.iterdir()):
            print(f"  - {f.name}")
        sys.exit(1)
    
    print("Restoring sudoers files from backup...")
    
    # Restore main sudoers file
    if sudoers_backup.exists():
        sudoers_path = Path("/etc/sudoers")
        print(f"Restoring {sudoers_path} from {sudoers_backup}")
        shutil.copy2(sudoers_backup, sudoers_path)
        os.chmod(sudoers_path, 0o440)  # Restore correct permissions
        print(f"✓ Restored {sudoers_path}")
    else:
        print("No main sudoers backup found (this is normal if using sudoers.d)")
    
    # Restore sudoers.d files
    if sudoers_d_backups:
        sudoers_d_dir = Path("/etc/sudoers.d")
        print(f"\nRestoring files to {sudoers_d_dir}:")
        for backup_file in sudoers_d_backups:
            # Extract original filename (backup might be named differently)
            # Try to find the original file or restore with backup name
            target_file = sudoers_d_dir / backup_file.name
            print(f"Restoring {target_file} from {backup_file}")
            shutil.copy2(backup_file, target_file)
            os.chmod(target_file, 0o440)
            print(f"✓ Restored {target_file}")
    
    print("\n✓ Sudoers files restored!")
    print("\nIMPORTANT: Verify sudo access works before closing this session:")
    print("  sudo -v")
    print("\nIf that works, you can now use sudo normally.")
    print("\nNote: The STIG requires password authentication for sudo.")
    print("If you need passwordless sudo, you'll need to manually edit")
    print("/etc/sudoers or /etc/sudoers.d/* files to add NOPASSWD back.")

if __name__ == '__main__':
    main()

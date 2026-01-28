#!/bin/bash
# Quick recovery script for GCE - run this via serial console as root

BACKUP_DIR="/tmp/stig_backups"

echo "=== Sudo Recovery Script for GCE ==="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "ERROR: This script must be run as root"
    echo "You're on GCE - use the Serial Console to get root access"
    exit 1
fi

# Check if backups exist
if [ ! -d "$BACKUP_DIR" ]; then
    echo "ERROR: Backup directory not found: $BACKUP_DIR"
    echo "Available in /tmp:"
    ls -la /tmp/ | head -20
    exit 1
fi

echo "Found backup directory: $BACKUP_DIR"
echo "Available backups:"
ls -lh "$BACKUP_DIR" | head -20
echo ""

# Restore main sudoers file
if [ -f "$BACKUP_DIR/sudoers" ]; then
    echo "Restoring /etc/sudoers..."
    cp "$BACKUP_DIR/sudoers" /etc/sudoers
    chmod 440 /etc/sudoers
    echo "✓ Restored /etc/sudoers"
else
    echo "No sudoers backup found (may be using sudoers.d only)"
fi

# Restore sudoers.d files
echo ""
echo "Restoring /etc/sudoers.d files..."
RESTORED=0
for backup in "$BACKUP_DIR"/sudoers.d*; do
    if [ -f "$backup" ]; then
        filename=$(basename "$backup")
        target="/etc/sudoers.d/$filename"
        echo "Restoring $target..."
        cp "$backup" "$target"
        chmod 440 "$target"
        echo "✓ Restored $target"
        RESTORED=$((RESTORED + 1))
    fi
done

if [ $RESTORED -eq 0 ]; then
    echo "No sudoers.d backups found"
fi

# Verify sudoers syntax
echo ""
echo "Verifying sudoers syntax..."
if visudo -c; then
    echo "✓ Sudoers syntax is valid"
else
    echo "ERROR: Sudoers syntax is invalid!"
    echo "You may need to manually fix the files"
    exit 1
fi

echo ""
echo "=== Recovery Complete ==="
echo ""
echo "To test sudo access:"
echo "  1. Switch to your user: su - YOUR_USERNAME"
echo "  2. Test sudo: sudo -v"
echo ""
echo "If you need passwordless sudo back, you'll need to manually"
echo "edit /etc/sudoers or /etc/sudoers.d/* files to add NOPASSWD"
echo "(Note: This violates STIG compliance)"

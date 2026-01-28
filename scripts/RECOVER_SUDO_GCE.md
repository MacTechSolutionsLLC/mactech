# Recovering Sudo Access on Google Compute Engine

## Quick Recovery Steps

### Option 1: Use GCE Serial Console (Easiest)

1. **Open Google Cloud Console**
   - Go to: https://console.cloud.google.com
   - Navigate to: Compute Engine → VM instances

2. **Access Serial Console**
   - Click on your VM instance name
   - Click "Connect" → "Open in browser window" (or use "Serial port 1 (console)")
   - This gives you root-level access

3. **Once in the serial console, restore sudoers:**
   ```bash
   # Check if backups exist
   ls -la /tmp/stig_backups/
   
   # Restore sudoers file
   if [ -f /tmp/stig_backups/sudoers ]; then
       cp /tmp/stig_backups/sudoers /etc/sudoers
       chmod 440 /etc/sudoers
       echo "✓ Restored /etc/sudoers"
   fi
   
   # Restore sudoers.d files
   for backup in /tmp/stig_backups/sudoers.d*; do
       if [ -f "$backup" ]; then
           filename=$(basename "$backup")
           cp "$backup" /etc/sudoers.d/"$filename"
           chmod 440 /etc/sudoers.d/"$filename"
           echo "✓ Restored /etc/sudoers.d/$filename"
       fi
   done
   
   # Verify restore worked
   visudo -c
   ```

4. **Test sudo access:**
   ```bash
   # Switch to your user
   su - your_username
   
   # Test sudo
   sudo -v
   ```

### Option 2: Use gcloud SSH with Metadata (If Serial Console Doesn't Work)

1. **Set startup script metadata to restore on next boot:**
   ```bash
   gcloud compute instances add-metadata INSTANCE_NAME \
     --metadata startup-script='#!/bin/bash
   if [ -f /tmp/stig_backups/sudoers ]; then
       cp /tmp/stig_backups/sudoers /etc/sudoers
       chmod 440 /etc/sudoers
   fi
   for backup in /tmp/stig_backups/sudoers.d*; do
       if [ -f "$backup" ]; then
           cp "$backup" /etc/sudoers.d/$(basename "$backup")
           chmod 440 /etc/sudoers.d/$(basename "$backup")
       fi
   done'
   ```

2. **Reboot the instance:**
   ```bash
   gcloud compute instances reset INSTANCE_NAME
   ```

### Option 3: Use gcloud with OS Login (If Enabled)

If OS Login is enabled, you might be able to SSH directly:
```bash
gcloud compute ssh INSTANCE_NAME
```

### Option 4: Manual Fix via Serial Console

If backups are missing, you can manually fix sudoers:

1. **Access serial console** (as above)

2. **Edit sudoers to restore NOPASSWD:**
   ```bash
   # Find your user's sudo entry
   grep -r "your_username" /etc/sudoers /etc/sudoers.d/
   
   # Edit the file (use visudo for safety)
   visudo
   
   # Find lines that were commented out like:
   # your_username ALL=(ALL) NOPASSWD: ALL
   
   # Uncomment them (remove the #)
   # Save and exit
   ```

3. **Or add a new sudoers.d file:**
   ```bash
   echo "your_username ALL=(ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/your_username
   chmod 440 /etc/sudoers.d/your_username
   visudo -c  # Verify syntax
   ```

## What Happened

The STIG hardening script applied rules V-260558 and V-274860 which require password authentication for sudo. It commented out all `NOPASSWD` entries in your sudoers files.

The original files should be backed up in `/tmp/stig_backups/`.

## Prevention for Future

If you need passwordless sudo for automation but want STIG compliance, you have a few options:

1. **Skip the sudo password requirement rules** when running the hardening script
2. **Use service accounts** with appropriate IAM roles instead of sudo
3. **Configure sudo to require password** (STIG compliant) and use your user password

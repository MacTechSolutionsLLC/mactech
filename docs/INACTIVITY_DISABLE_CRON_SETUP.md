# Inactivity Disable Cron Job Setup

This document describes how to configure scheduled execution for the inactivity account disablement feature (NIST SP 800-171 Rev. 2, Section 3.5.6).

## Overview

The inactivity disable feature automatically disables user accounts after 180 days of inactivity. This document covers setting up automated scheduled execution using Railway cron jobs.

## Prerequisites

- Railway platform account with deployed application
- `CRON_SECRET` environment variable configured
- Admin access to Railway dashboard

## Setup Instructions

### Step 1: Configure Environment Variable

1. In Railway dashboard, navigate to your service
2. Go to **Variables** tab
3. Add new variable:
   - **Name**: `CRON_SECRET`
   - **Value**: Generate a secure random string (e.g., `openssl rand -base64 32`)
   - **Description**: Secret token for authenticating cron job requests

### Step 2: Configure Railway Cron Job

1. In Railway dashboard, navigate to your service
2. Go to **Settings** tab
3. Scroll to **Cron Schedule** section
4. Enter crontab expression: `0 2 * * *` (runs daily at 2:00 AM UTC)
5. Configure the cron command:

**Option A: Using Railway Cron Service (Recommended)**

Railway's native cron service will call the endpoint automatically. Configure the cron schedule in Railway settings.

**Option B: Using External Cron Service**

If Railway cron is not available, use an external service like:
- cron-job.org
- EasyCron
- GitHub Actions (scheduled workflows)

Configure the external service to make a POST request to:
```
POST https://your-domain.railway.app/api/cron/disable-inactive
Authorization: Bearer YOUR_CRON_SECRET
```

Or use the header:
```
X-Cron-Secret: YOUR_CRON_SECRET
```

### Step 3: Verify Configuration

1. Test the endpoint manually:
   ```bash
   curl -X POST https://your-domain.railway.app/api/cron/disable-inactive \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

2. Check Railway logs after cron execution to verify:
   - Endpoint was called successfully
   - Accounts were checked and disabled as appropriate
   - No errors occurred

## Crontab Expression Examples

- **Daily at 2:00 AM UTC**: `0 2 * * *`
- **Daily at midnight UTC**: `0 0 * * *`
- **Every 12 hours**: `0 */12 * * *`
- **Weekly on Monday at 3:00 AM UTC**: `0 3 * * 1`

**Note**: Railway cron schedules use UTC timezone.

## Security Considerations

1. **CRON_SECRET**: Keep this secret secure and never commit it to version control
2. **Endpoint Access**: The cron endpoint should only be accessible via the secret token
3. **Monitoring**: Monitor cron job execution logs for unauthorized access attempts
4. **Rotation**: Consider rotating the CRON_SECRET periodically

## Monitoring

### Check Cron Job Execution

1. **Railway Logs**: Check service logs after scheduled execution time
2. **Response Format**: Successful execution returns:
   ```json
   {
     "success": true,
     "message": "Inactivity check completed. X account(s) disabled, Y account(s) checked.",
     "timestamp": "2026-01-25T02:00:00.000Z",
     "disabled": 0,
     "checked": 5,
     "errors": []
   }
   ```

### Health Check

The endpoint also supports GET requests for health checks:
```bash
curl https://your-domain.railway.app/api/cron/disable-inactive
```

## Troubleshooting

### Cron Job Not Executing

1. Verify crontab expression is correct
2. Check Railway service is running
3. Verify CRON_SECRET is set correctly
4. Check Railway logs for errors

### Authentication Failures

1. Verify CRON_SECRET matches in both Railway and cron service
2. Check Authorization header format (should be `Bearer TOKEN`)
3. Verify endpoint is accessible (not blocked by firewall)

### No Accounts Disabled

This is normal if:
- No accounts meet the 180-day inactivity threshold
- All inactive accounts are already disabled
- Last active admin protection prevented disablement

## Related Documentation

- **Implementation Code**: `lib/inactivity-disable.ts`
- **Admin Endpoint**: `app/api/admin/users/disable-inactive/route.ts`
- **Evidence Document**: `compliance/cmmc/level2/05-evidence/MAC-RPT-122_3_5_6_disable_identifiers_after_inactivity_Evidence.md`
- **Control Document**: `compliance/cmmc/level2/07-nist-controls/NIST-3.5.6_disable_identifiers_after_inactivity.md`

## Railway Cron Documentation

For more information on Railway cron jobs, see:
- [Railway Cron Jobs Documentation](https://docs.railway.com/reference/cron-jobs)
- [Running Scheduled Jobs on Railway](https://docs.railway.com/guides/cron-jobs)

# Railway Cron Setup — Disable Identifiers After Inactivity (3.5.6)

## Objective

Automatically disable user accounts after **180 days of inactivity** using a scheduled Railway cron job.

---

## Important: How Railway Cron Works

**Railway cron does NOT call a URL.** It simply starts your service on a schedule. Your application must detect the cron run and execute the job on startup.

---

## Step 1 — Configure Environment Variable

In **Railway → Service → Variables**, add:

```
RUN_INACTIVITY_CRON=true
```

**Purpose:** This flag tells the application to run the inactivity disablement job on startup instead of starting the web server.

---

## Step 2 — Configure Railway Cron Schedule

In **Railway Dashboard**:

1. Open your service
2. Navigate to **Settings** tab
3. Scroll to **Cron Schedule** section
4. Enter crontab expression:

   ```
   0 2 * * *
   ```

   (Daily at 02:00 UTC)

5. Save the cron schedule

**What this does:** Railway will start your service daily at 02:00 UTC. When the service starts with `RUN_INACTIVITY_CRON=true`, it will:
- Run database migrations
- Execute the inactivity disablement job
- Exit after completion (Railway cron expects the service to complete)

---

## Step 3 — Verify Execution

After deployment:

1. **Check Railway Logs** after the scheduled time (02:00 UTC)
2. Look for log messages:
   - `🕐 Railway cron detected - running inactivity disable job...`
   - `📅 Schedule: Daily at 02:00 UTC (0 2 * * *)`
   - `📊 Job Results:` with checked/disabled counts
   - `✅ Inactivity cron job completed successfully`

3. **Verify AppEvent records:**
   - Query `AppEvent` table for `actionType = 'user_disable'`
   - Filter by `details->>'reason' = 'inactivity'`
   - Verify timestamps match cron execution times

---

## How It Works

### Architecture

```
Railway Cron Schedule (0 2 * * *)
    ↓
Starts service at 02:00 UTC
    ↓
scripts/start-with-migration.js checks RUN_INACTIVITY_CRON
    ↓
If true: Execute scripts/run-inactivity-cron.ts
    ↓
Calls lib/inactivity-disable.ts → disableInactiveAccounts()
    ↓
Logs results and exits (process.exit)
```

### Code Flow

1. **Startup Script** (`scripts/start-with-migration.js`):
   - Checks `process.env.RUN_INACTIVITY_CRON === 'true'`
   - If true, executes `scripts/run-inactivity-cron.ts`
   - Exits after job completion

2. **Cron Script** (`scripts/run-inactivity-cron.ts`):
   - Imports and calls `disableInactiveAccounts()`
   - Logs results
   - Exits with appropriate exit code

3. **Disablement Function** (`lib/inactivity-disable.ts`):
   - Finds users inactive > 180 days
   - Disables accounts (protects last admin)
   - Logs all actions to `AppEvent` table
   - Returns results

---

## Manual Testing

To test the cron job manually:

1. **Set environment variable** in Railway:
   ```
   RUN_INACTIVITY_CRON=true
   ```

2. **Restart the service** (or wait for next cron run)

3. **Check logs** for execution output

4. **Reset environment variable** after testing:
   ```
   RUN_INACTIVITY_CRON=false
   ```
   (or remove it to allow normal server startup)

---

## Monitoring

### Railway Logs

Check logs after 02:00 UTC for:
- Job start message
- Accounts checked/disabled counts
- Any errors
- Job completion message

### Database Verification

Query `AppEvent` table:
```sql
SELECT * FROM "AppEvent" 
WHERE "actionType" = 'user_disable' 
AND "details"::text LIKE '%inactivity%'
ORDER BY "timestamp" DESC
LIMIT 10;
```

### Expected Log Output

```
🕐 Railway cron detected - running inactivity disable job...
📅 Schedule: Daily at 02:00 UTC (0 2 * * *)

🕐 Railway Cron: Inactivity Account Disablement Job
📅 Schedule: Daily at 02:00 UTC (0 2 * * *)
⏰ Started at: 2026-01-26T02:00:00.000Z

📊 Job Results:
   - Accounts checked: 5
   - Accounts disabled: 2
   - Errors: 0

✅ Inactivity cron job completed successfully
⏰ Completed at: 2026-01-26T02:00:01.234Z
```

---

## Troubleshooting

### Cron Job Not Executing

1. Verify `RUN_INACTIVITY_CRON=true` is set in Railway Variables
2. Verify cron schedule is `0 2 * * *` in Railway Settings
3. Check Railway logs at 02:00 UTC
4. Verify service has permission to access database

### Job Runs But No Accounts Disabled

This is normal if:
- No accounts meet the 180-day inactivity threshold
- All inactive accounts are already disabled
- Last active admin protection prevented disablement

### Service Doesn't Exit

- Verify `process.exit()` is called after job completion
- Check for unhandled promises or hanging connections
- Review logs for errors preventing exit

---

## Security Considerations

1. **Environment Variable:** `RUN_INACTIVITY_CRON` should only be `true` when Railway cron is active
2. **Database Access:** Service must have database credentials configured
3. **Logging:** All disablement actions are logged to `AppEvent` table
4. **Protection:** Last active admin account is protected from disablement

---

## Related Documentation

- **Implementation Code**: `lib/inactivity-disable.ts`
- **Cron Script**: `scripts/run-inactivity-cron.ts`
- **Startup Script**: `scripts/start-with-migration.js`
- **Admin Endpoint** (for manual triggers): `app/api/admin/users/disable-inactive/route.ts`
- **Evidence Document**: `compliance/cmmc/level2/05-evidence/MAC-RPT-122_3_5_6_disable_identifiers_after_inactivity_Evidence.md`
- **Control Document**: `compliance/cmmc/level2/07-nist-controls/NIST-3.5.6_disable_identifiers_after_inactivity.md`

---

## Railway Cron Documentation

For more information on Railway cron jobs:
- [Railway Cron Jobs Documentation](https://docs.railway.com/reference/cron-jobs)
- [Running Scheduled Jobs on Railway](https://docs.railway.com/guides/cron-jobs)

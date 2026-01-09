# Railway Deployment Fix

## Issue
Railway is serving static files via nginx instead of running the Next.js server. API routes return 404.

## Solution

### 1. Verify Railway Service Settings

Go to your Railway dashboard → Service "smoke" → Settings:

**Deploy Tab:**
- **Start Command**: Leave empty (Procfile handles this) OR set to `npm start`
- **Root Directory**: `/` (or leave empty)

**Build Tab:**
- **Build Command**: `npm run build`
- **Builder**: `NIXPACKS` (should auto-detect)

### 2. Trigger Manual Redeploy

1. Go to Railway dashboard
2. Click on your service "smoke"
3. Click "Deploy" → "Redeploy"
4. Wait for deployment to complete (2-5 minutes)

### 3. Verify Deployment

After redeploy, check logs:
```bash
railway logs
```

You should see:
- `npm run build` executing
- `npm start` executing  
- Next.js server starting on port $PORT
- NOT nginx serving static files

### 4. Test API Endpoint

```bash
curl -X POST https://smoke-production-0350.up.railway.app/api/admin/contract-discovery/import \
  -H "Content-Type: application/json" \
  -d '{"url":"test","title":"test"}'
```

Should return JSON (not HTML 404).

## Files Added

- `Procfile` - Tells Railway to run `npm start`
- `railway.json` - Railway-specific configuration

## If Still Not Working

1. Check Railway logs for build errors
2. Verify `package.json` has correct scripts
3. Ensure `next.config.js` doesn't have `output: 'export'` (which would make it static)
4. Check that Railway is using Node.js runtime (not static site)


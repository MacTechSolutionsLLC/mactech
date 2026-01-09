# Railway Database Setup Guide

## Quick Setup Steps

### 1. Add PostgreSQL Database in Railway

1. Go to your Railway project dashboard
2. Click **"+ New"** or **"New Service"**
3. Select **"Database"** → **"Add PostgreSQL"**
4. Railway will automatically provision the database

### 2. Link DATABASE_URL to Your App

Railway should automatically create a `DATABASE_URL` environment variable. To link it to your app:

1. Click on your **Next.js app service** (the one deployed from GitHub)
2. Go to the **"Variables"** tab
3. Railway should automatically show `DATABASE_URL` from the PostgreSQL service
   - If not visible, click **"Reference Variable"** and select `DATABASE_URL` from your PostgreSQL service
4. The `DATABASE_URL` should look like: `postgresql://postgres:password@hostname:port/railway`

### 3. Run Database Migrations

After the database is connected, you need to create the tables. You have two options:

#### Option A: Using Railway CLI (Recommended)

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link to your project:
   ```bash
   railway link
   ```

4. Run migrations:
   ```bash
   railway run npm run db:push
   ```

#### Option B: Add to Build Process

Add this to your `package.json` scripts:

```json
{
  "scripts": {
    "postbuild": "prisma db push"
  }
}
```

This will automatically run migrations after each build.

### 4. Verify Setup

After deployment, check your Railway logs to ensure:
- ✅ Database connection is successful
- ✅ Migrations ran without errors
- ✅ The app starts correctly

## Environment Variables Checklist

Make sure these are set in your Railway app service:

- ✅ `DATABASE_URL` - Automatically set from PostgreSQL service
- ✅ `OPENAI_API_KEY` - Already set (for AI features)
- ✅ Any other environment variables your app needs

## Local Development

For local development, you can still use SQLite:

1. Create a `.env.local` file:
   ```
   DATABASE_URL="file:./prisma/dev.db"
   ```

2. Temporarily change `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

3. Run: `npm run db:push`

Or use PostgreSQL locally by installing it and setting `DATABASE_URL` to your local PostgreSQL connection string.

## Troubleshooting

### "Database connection failed"
- Check that `DATABASE_URL` is properly linked in your app service
- Verify the PostgreSQL service is running in Railway

### "Migration failed"
- Make sure Prisma client is generated: `npx prisma generate`
- Check Railway logs for specific error messages

### "Table already exists"
- This is normal if you've run migrations before
- `prisma db push` will update existing tables

## Notes

- The Prisma schema has been updated to use PostgreSQL
- All AI analysis fields have been added to the schema
- The database will persist data across deployments
- You don't need a separate backend service - just the database service


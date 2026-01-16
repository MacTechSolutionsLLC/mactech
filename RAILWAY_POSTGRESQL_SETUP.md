# Railway PostgreSQL Database Setup & Migration Guide

## Overview

This guide walks you through setting up a PostgreSQL database in Railway and migrating your application from SQLite to PostgreSQL. The migration involves updating your Prisma schema, configuring Railway services, and running initial database setup.

## Prerequisites

- Railway account (sign up at https://railway.app)
- Railway project with your Next.js app already deployed
- Railway CLI installed (optional, but recommended)

## Step 1: Add PostgreSQL Database Service in Railway

1. **Navigate to your Railway project dashboard**
   - Go to https://railway.app
   - Select your project

2. **Add PostgreSQL service**
   - Click **"+ New"** or **"New Service"** button
   - Select **"Database"** from the menu
   - Choose **"Add PostgreSQL"**
   - Railway will automatically provision a PostgreSQL database instance

3. **Wait for provisioning**
   - Railway will create the database service (takes 1-2 minutes)
   - You'll see a new service card in your project dashboard

## Step 2: Link DATABASE_URL to Your App Service

Railway automatically creates a `DATABASE_URL` environment variable for the PostgreSQL service. You need to link it to your Next.js app service:

1. **Open your Next.js app service**
   - Click on your app service (the one deployed from GitHub)

2. **Navigate to Variables tab**
   - Click on the **"Variables"** tab in the service settings

3. **Link DATABASE_URL**
   - Railway should automatically show `DATABASE_URL` from the PostgreSQL service in the "Referenced Variables" section
   - If not visible:
     - Click **"+ New Variable"** or **"Reference Variable"**
     - Select **"Reference Variable"**
     - Choose your PostgreSQL service
     - Select `DATABASE_URL` from the dropdown
   - The `DATABASE_URL` should look like: `postgresql://postgres:password@hostname:port/railway`

4. **Verify the connection string**
   - The format should be: `postgresql://[user]:[password]@[host]:[port]/[database]`
   - Railway handles all authentication automatically

## Step 3: Update Prisma Schema for PostgreSQL

Before deploying, ensure your Prisma schema is configured for PostgreSQL:

1. **Verify schema provider**
   - Check that `prisma/schema.prisma` has `provider = "postgresql"`
   - If not, update it (see migration steps below)

2. **Verify migration lock**
   - Check that `prisma/migrations/migration_lock.toml` has `provider = "postgresql"`

## Step 4: Run Initial Database Migration

You have two options for running the initial migration:

### Option A: Using Railway CLI (Recommended)

This allows you to run migrations manually and see the output:

1. **Install Railway CLI** (if not already installed):
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Link to your project**:
   ```bash
   railway link
   ```
   - Select your project and service when prompted

4. **Run schema push**:
   ```bash
   railway run npx prisma db push
   ```
   
   Or using the npm script:
   ```bash
   railway run npm run db:push
   ```

5. **Verify migration**:
   - Check the output for successful table creation
   - You should see messages like "The database is now in sync with your Prisma schema"

### Option B: Automatic Migration on Deploy

The `postbuild` script in `package.json` will automatically run `prisma db push` after each build:

1. **Trigger a new deployment**:
   - Push a commit to your connected GitHub repository, or
   - Go to Railway dashboard → Your service → Click **"Deploy"** → **"Redeploy"**

2. **Monitor the build logs**:
   - Watch for the `postbuild` script execution
   - Verify `prisma db push` runs successfully
   - Check for any errors in the logs

## Step 5: Verify Database Setup

After migration, verify everything is working:

1. **Check Railway logs**:
   - Go to your app service → **"Deployments"** → Latest deployment → **"View Logs"**
   - Look for:
     - ✅ Database connection successful
     - ✅ Prisma client generated
     - ✅ Schema pushed successfully
     - ✅ App started without database errors

2. **Test database operations**:
   - Use your app's features that interact with the database
   - Check that data is being saved and retrieved correctly

3. **Optional: Use Prisma Studio**:
   ```bash
   railway run npx prisma studio
   ```
   - This will open Prisma Studio in your browser
   - You can browse and verify all tables and data

## Step 6: Environment Variables Checklist

Ensure these environment variables are set in your Railway app service:

- ✅ **`DATABASE_URL`** - Automatically set from PostgreSQL service (linked in Step 2)
- ✅ **`OPENAI_API_KEY`** - For AI features (if applicable)
- ✅ **`NODE_ENV`** - Should be `production` (Railway sets this automatically)
- ✅ Any other environment variables your app requires

## Local Development Setup

For local development, you have two options:

### Option A: Continue Using SQLite (Simpler)

1. **Create `.env.local` file**:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   ```

2. **Temporarily change schema** (if needed):
   - Change `provider = "postgresql"` to `provider = "sqlite"` in `prisma/schema.prisma`
   - Note: You'll need to switch this back before deploying to Railway

3. **Run local migrations**:
   ```bash
   npm run db:push
   ```

### Option B: Use PostgreSQL Locally (Matches Production)

1. **Install PostgreSQL locally**:
   - macOS: `brew install postgresql@14`
   - Linux: `sudo apt-get install postgresql`
   - Windows: Download from https://www.postgresql.org/download/

2. **Create local database**:
   ```bash
   createdb mactech_dev
   ```

3. **Set `.env.local`**:
   ```env
   DATABASE_URL="postgresql://localhost:5432/mactech_dev"
   ```

4. **Run migrations**:
   ```bash
   npm run db:push
   ```

## Migration Strategy Notes

### Initial Setup
- We use `prisma db push` for the initial schema deployment because:
  - It's simpler and faster for Railway deployments
  - It automatically syncs the schema without managing migration files
  - Railway's ephemeral build environment works better with `db push`

### Future Schema Changes
For future schema updates, you have two options:

1. **Continue using `db push`** (simpler):
   - Make changes to `schema.prisma`
   - Deploy to Railway (automatic via `postbuild` script)
   - `prisma db push` will update the schema

2. **Use migrations** (more control):
   - Run `npx prisma migrate dev --name your_migration_name` locally
   - Commit the migration files
   - Deploy to Railway
   - Run `npx prisma migrate deploy` in Railway (add to build script)

## Troubleshooting

### "Database connection failed"
- **Check `DATABASE_URL`**: Verify it's properly linked in your app service Variables tab
- **Verify PostgreSQL service**: Ensure the PostgreSQL service is running (green status)
- **Check connection string format**: Should start with `postgresql://`
- **Test connection**: Use Railway CLI: `railway run npx prisma db pull`

### "Migration failed" or "Schema push failed"
- **Check Prisma client**: Ensure it's generated: `railway run npx prisma generate`
- **Review logs**: Check Railway deployment logs for specific error messages
- **Verify schema**: Ensure `schema.prisma` is valid: `npx prisma validate`
- **Check permissions**: Railway PostgreSQL should have all necessary permissions

### "Table already exists"
- This is normal if you've run migrations before
- `prisma db push` will update existing tables to match your schema
- If you get conflicts, you may need to reset: `railway run npx prisma migrate reset` (⚠️ deletes all data)

### "Provider mismatch" errors
- Ensure `prisma/schema.prisma` has `provider = "postgresql"`
- Ensure `prisma/migrations/migration_lock.toml` has `provider = "postgresql"`
- Regenerate Prisma client: `railway run npx prisma generate`

### Build fails with Prisma errors
- **Check build logs**: Look for Prisma-specific errors
- **Verify DATABASE_URL**: Even during build, Prisma may need a valid connection string
- **Check postbuild script**: Ensure `prisma db push --skip-generate` is in `postbuild` (generate happens in build)

## Important Notes

- ✅ **Data Persistence**: PostgreSQL data persists across deployments (unlike SQLite)
- ✅ **Automatic Backups**: Railway provides automatic backups for PostgreSQL
- ✅ **Connection Pooling**: Railway handles connection pooling automatically
- ✅ **No Manual Configuration**: Railway manages all database configuration
- ⚠️ **Migration Files**: Existing SQLite migrations won't work with PostgreSQL - we use `db push` instead
- ⚠️ **Local Development**: You can continue using SQLite locally via `.env.local` override

## Next Steps

After successful migration:

1. ✅ Verify all database operations work correctly
2. ✅ Test your app's features that use the database
3. ✅ Monitor Railway logs for any database-related errors
4. ✅ Consider setting up database backups (Railway provides automatic backups)
5. ✅ Update your team documentation with the new database setup

## Support

If you encounter issues:
- Check Railway documentation: https://docs.railway.app
- Check Prisma documentation: https://www.prisma.io/docs
- Review Railway service logs for detailed error messages
- Verify all environment variables are correctly set


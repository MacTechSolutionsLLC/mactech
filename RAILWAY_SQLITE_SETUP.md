# Railway SQLite Setup

## Setting DATABASE_URL in Railway

Since you're using SQLite, you need to set the `DATABASE_URL` environment variable in Railway:

### Steps:

1. **Go to your Railway project dashboard**
   - Navigate to: https://railway.app/project/[your-project-id]

2. **Select your app service** (the one deployed from GitHub)

3. **Go to the "Variables" tab**

4. **Add a new variable:**
   - **Variable Name:** `DATABASE_URL`
   - **Value:** `file:/tmp/dev.db`
   
   Or use a path relative to your app:
   - **Value:** `file:./prisma/dev.db`

5. **Save the variable**

6. **Redeploy your app** (Railway will automatically redeploy when you add variables)

### Important Notes:

⚠️ **Railway's filesystem is ephemeral** - SQLite data will be lost on redeploy or if the container restarts.

For production use, consider:
- Using Railway's PostgreSQL database (recommended)
- Or using a persistent volume (if Railway supports it for your plan)

### For Now (Quick Fix):

Set `DATABASE_URL` to: `file:/tmp/dev.db`

This will allow the app to work, but data won't persist across deployments.

### To Migrate to PostgreSQL Later:

1. Add a PostgreSQL database service in Railway
2. Railway will automatically create `DATABASE_URL`
3. Update `prisma/schema.prisma` to use `provider = "postgresql"`
4. Run migrations: `railway run npm run db:push`


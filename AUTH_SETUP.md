# Authentication Setup Guide

This guide explains how to set up authentication for the MacTech admin panel.

## Overview

The admin panel uses NextAuth.js with credentials (email/password) authentication. Passwords are encrypted using bcrypt before being stored in the database.

## Initial Setup

### 1. Environment Variables

**IMPORTANT: This is required for authentication to work!**

Add the following environment variables:

**For local development** (`.env.local` file):
```env
AUTH_SECRET=your-secret-key-here
# Generate with: openssl rand -base64 32
```

**For production (Railway)**:
1. Go to your Railway project dashboard
2. Click on your service (mactech)
3. Go to the **Variables** tab
4. Click **+ New Variable**
5. Add:
   - **Name**: `AUTH_SECRET`
   - **Value**: Generate a secret with `openssl rand -base64 32` or use any random string (at least 32 characters)
6. Click **Add**
7. Redeploy your service

**Note**: Without `AUTH_SECRET` set, you'll see `[auth][error] MissingSecret` errors in your logs and authentication will not work.

### 2. Database Migration

Run the database migration to create the User table:

```bash
npm run db:push
# or
npm run db:migrate
```

### 3. Create Initial Admin Users

The project includes a script to create the initial 4 admin users (patrick, jonny, jimbo, bryan) with the default password "changeme". These users will be forced to change their password on first login.

Run the script:
```bash
tsx scripts/create-initial-users.ts
```

This will create:
- patrick@mactech.com (password: changeme)
- jonny@mactech.com (password: changeme)
- jimbo@mactech.com (password: changeme)
- bryan@mactech.com (password: changeme)

All users will have the `mustChangePassword` flag set to `true`, requiring them to change their password on first login.

#### Alternative: Create Individual Admin User

You can also create individual admin users using one of these methods:

#### Option A: Using the API Route (Recommended)

Make a POST request to `/api/admin/create-initial-admin`:

```bash
curl -X POST http://localhost:3000/api/admin/create-initial-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mactech.com",
    "password": "your-secure-password",
    "name": "Admin User"
  }'
```

**Note:** This route only works if no admin users exist. After creating the first admin, use `/api/admin/create-user` (which requires admin authentication) to create additional users.

#### Option B: Using a Script

Create a script file `scripts/create-admin.ts`:

```typescript
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function createAdmin() {
  const email = process.argv[2]
  const password = process.argv[3]
  const name = process.argv[4] || 'Admin User'

  if (!email || !password) {
    console.error('Usage: tsx scripts/create-admin.ts <email> <password> [name]')
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: 'ADMIN',
    },
  })

  console.log('Admin user created:', user.email)
}

createAdmin()
```

Then run:
```bash
tsx scripts/create-admin.ts admin@mactech.com your-password "Admin Name"
```

## Usage

### Signing In

1. Click the "Admin Login" button in the footer of any page
2. Enter your email and password
3. If this is your first login with the default password, you'll be redirected to change your password
4. After changing your password (or if already changed), you'll be redirected to the admin panel

### Changing Password

If you're required to change your password:
1. You'll be automatically redirected to the password change page after login
2. Enter your current password (default: "changeme" for initial users)
3. Enter a new password (minimum 8 characters)
4. Confirm the new password
5. Click "Change Password"
6. You'll be redirected to the admin panel

You can also manually change your password by navigating to `/auth/change-password` while logged in.

### Creating Additional Users

Once you have an admin account, you can create additional users through the API:

```bash
curl -X POST http://localhost:3000/api/admin/create-user \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{
    "email": "user@mactech.com",
    "password": "password",
    "name": "User Name",
    "role": "ADMIN"
  }'
```

Or create a UI component in the admin panel to manage users.

### Logging Out

Click the "Logout" button in the admin navigation bar.

## Security Notes

- Passwords are hashed using bcrypt with 10 rounds
- Admin routes are protected by middleware
- Only users with role "ADMIN" can access admin pages
- Session tokens are stored as HTTP-only cookies
- Make sure to set a strong `AUTH_SECRET` in production

## Troubleshooting

### "Unauthorized" errors

- Make sure you're logged in
- Check that your user has role "ADMIN" in the database
- Verify `AUTH_SECRET` is set correctly

### Can't create first admin

- Ensure the database migration has been run
- Check that no admin users exist (the initial admin route only works if no admins exist)
- Verify database connection

### Session not persisting

- Check that cookies are enabled in your browser
- Verify `AUTH_SECRET` is set
- In production, ensure `trustHost: true` is set in auth config (already included)

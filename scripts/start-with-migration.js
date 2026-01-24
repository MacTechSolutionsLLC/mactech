#!/usr/bin/env node
/**
 * Startup script that runs database migrations before starting the Next.js server
 * This ensures migrations run at runtime when the database is accessible,
 * rather than during build time when services might not be connected.
 */

const { execSync } = require('child_process');
const { spawn } = require('child_process');

console.log('🚀 Starting application...');

// Run database migrations
try {
  console.log('🗄️  Running database migrations...');
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env }
  });
  console.log('✅ Database migrations completed successfully');
} catch (error) {
  console.error('⚠️  Migration error:', error.message);
  
  // If the error is about non-empty database (baseline needed), try to resolve it
  if (error.message.includes('not empty') || error.message.includes('P3005')) {
    console.log('📋 Database is not empty - attempting to baseline existing migrations...');
    try {
      // Mark existing migrations as applied (baseline)
      const existingMigrations = [
        '20260114040029_add_sam_ingestion_fields',
        '20260115044544_add_sam_ingestion_fields'
      ];
      
      for (const migration of existingMigrations) {
        try {
          execSync(`npx prisma migrate resolve --applied ${migration}`, {
            stdio: 'pipe',
            env: { ...process.env }
          });
          console.log(`✅ Marked ${migration} as applied`);
        } catch (resolveError) {
          // Migration might already be marked, continue
          console.log(`ℹ️  ${migration} - ${resolveError.message.includes('already') ? 'already applied' : 'skipped'}`);
        }
      }
      
      // Try migrate deploy again after baselining
      console.log('🔄 Retrying migration deploy...');
      execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        env: { ...process.env }
      });
      console.log('✅ Database migrations completed successfully after baseline');
    } catch (baselineError) {
      console.error('⚠️  Baseline error:', baselineError.message);
      console.log('⚠️  Continuing with server start...');
    }
  } else {
    // Continue anyway - tables might already exist or migration might not be critical
    console.log('⚠️  Continuing with server start...');
  }
}

// Run POA&M status migration (simplify statuses to open/closed)
try {
  console.log('📋 Running POA&M status migration...');
  execSync('npx tsx scripts/migrate-poam-statuses.ts', {
    stdio: 'inherit',
    env: { ...process.env }
  });
  console.log('✅ POA&M status migration completed successfully');
} catch (error) {
  // Migration is idempotent, so errors are non-fatal
  console.log('ℹ️  POA&M status migration:', error.message.includes('Error') ? error.message : 'completed or skipped');
}

// Start the Next.js server
console.log('🌐 Starting Next.js server...');
const port = process.env.PORT || 3000;
const nextPath = require.resolve('next/dist/bin/next');
const server = spawn('node', [nextPath, 'start', '-p', port.toString()], {
  stdio: 'inherit',
  env: { ...process.env }
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  process.exit(code || 0);
});

// Handle termination signals
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down gracefully...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('📴 Received SIGINT, shutting down gracefully...');
  server.kill('SIGINT');
});


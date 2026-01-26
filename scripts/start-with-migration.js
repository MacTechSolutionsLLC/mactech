#!/usr/bin/env node
/**
 * Startup script that runs database migrations before starting the Next.js server
 * This ensures migrations run at runtime when the database is accessible,
 * rather than during build time when services might not be connected.
 */

// Immediate logging to ensure we can see the script started
// Use both console.log and process.stdout.write for maximum compatibility
try {
  console.error('STDERR: Startup script beginning execution');
  console.log('='.repeat(60));
  console.log('🚀 STARTUP SCRIPT STARTED');
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  console.log(`📦 Node version: ${process.version}`);
  console.log(`📁 Working directory: ${process.cwd()}`);
  console.log(`🔧 Process ID: ${process.pid}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`🔑 PORT: ${process.env.PORT || 'not set'}`);
  console.log(`🔄 RUN_INACTIVITY_CRON: ${process.env.RUN_INACTIVITY_CRON || '(not set)'}`);
  console.log('='.repeat(60));
  console.log('');
  
  // Force flush
  if (process.stdout.write) {
    process.stdout.write('');
  }
  if (process.stderr.write) {
    process.stderr.write('');
  }
} catch (e) {
  // If even logging fails, write to stderr directly
  process.stderr.write(`CRITICAL: Failed to log startup: ${e.message}\n`);
}

const { execSync } = require('child_process');
const { spawn } = require('child_process');

// Import maintenance tool logging (Node.js compatible)
// Note: Using dynamic import to handle TypeScript compilation
let logMaintenanceToolOperationNode;
try {
  // Try to use the compiled version
  const loggingModule = require('../lib/maintenance-tool-logging-node.js');
  logMaintenanceToolOperationNode = loggingModule.logMaintenanceToolOperationNode;
} catch (error) {
  // If not available, create a no-op function
  logMaintenanceToolOperationNode = () => Promise.resolve();
  console.log('Note: Maintenance tool logging not available in this context');
}

// Helper to log maintenance tool operations (non-blocking)
function logToolOperation(toolName, version, operation, result, success, details) {
  logMaintenanceToolOperationNode(toolName, version, operation, result, success, details)
    .catch(err => console.error('Failed to log maintenance tool operation:', err));
}

console.log('🚀 Starting application...');
console.log('📝 This message confirms the script is executing');

// Run database migrations
try {
  console.log('🗄️  Running database migrations...');
  
  // Log Prisma CLI access
  const prismaVersion = '5.22.0';
  logToolOperation(
    'Prisma CLI',
    prismaVersion,
    'prisma migrate deploy',
    'Migration initiated',
    true,
    { context: 'startup_script' }
  );
  
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env }
  });
  console.log('✅ Database migrations completed successfully');
  
  // Log successful migration
  logToolOperation(
    'Prisma CLI',
    prismaVersion,
    'prisma migrate deploy',
    'Migrations deployed successfully',
    true,
    { context: 'startup_script', completed: true }
  );
} catch (error) {
  console.error('⚠️  Migration error:', error.message);
  
  // Log failed migration attempt
  const prismaVersion = '5.22.0';
  logToolOperation(
    'Prisma CLI',
    prismaVersion,
    'prisma migrate deploy',
    `Error: ${error.message}`,
    false,
    { context: 'startup_script', error: error.message }
  );
  
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
      
      // Log successful migration after baseline
      logToolOperation(
        'Prisma CLI',
        prismaVersion,
        'prisma migrate deploy (after baseline)',
        'Migrations deployed successfully after baseline',
        true,
        { context: 'startup_script', baselinedMigrations: existingMigrations }
      );
    } catch (baselineError) {
      console.error('⚠️  Baseline error:', baselineError.message);
      console.log('⚠️  Continuing with server start...');
      
      // Log baseline error
      logToolOperation(
        'Prisma CLI',
        prismaVersion,
        'prisma migrate resolve (baseline)',
        `Baseline error: ${baselineError.message}`,
        false,
        { context: 'startup_script', error: baselineError.message }
      );
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
    env: { ...process.env },
    timeout: 60000 // 60 second timeout
  });
  console.log('✅ POA&M status migration completed successfully');
} catch (error) {
  // Migration is idempotent, so errors are non-fatal
  console.log('ℹ️  POA&M status migration:', error.message.includes('Error') ? error.message : 'completed or skipped');
  console.log('⚠️  Continuing with server start despite migration warning...');
}

// Check if this is a Railway cron run for inactivity disablement
// IMPORTANT: Only run cron job if explicitly set to 'true'
// For normal web server operation, this variable should NOT be set or should be 'false'
const isCronRun = process.env.RUN_INACTIVITY_CRON === 'true';

if (isCronRun) {
  console.log('🕐 Railway cron detected - running inactivity disable job...');
  console.log('📅 Schedule: Daily at 02:00 UTC (0 2 * * *)');
  console.log('⚠️  NOTE: Service will exit after job completion (this is expected for Railway cron)');
  console.log('');
  
  try {
    // Execute inactivity disablement job via dedicated script
    execSync('npx tsx scripts/run-inactivity-cron.ts', {
      stdio: 'inherit',
      env: { ...process.env },
      timeout: 30000 // 30 second timeout
    });
    
    // Script should exit on its own, but ensure we exit too
    console.log('✅ Cron job completed, exiting...');
    // Force immediate exit - Railway cron expects service to complete
    setTimeout(() => {
      process.exit(0);
    }, 500);
    return; // Prevent server from starting
  } catch (error) {
    console.error('❌ Inactivity cron job failed:', error.message);
    // Force immediate exit with error code
    setTimeout(() => {
      process.exit(1);
    }, 500);
    return; // Prevent server from starting
  }
} else {
  // Normal startup - continue to start Next.js server
  console.log('ℹ️  Normal startup mode (RUN_INACTIVITY_CRON not set or not "true")');
  console.log(`   RUN_INACTIVITY_CRON value: ${process.env.RUN_INACTIVITY_CRON || '(not set)'}`);
}

// Start the Next.js server
console.log('🌐 Starting Next.js server...');
console.log(`📡 Port: ${process.env.PORT || 3000}`);
console.log(`🔧 Node version: ${process.version}`);
console.log(`📁 Working directory: ${process.cwd()}`);

const port = process.env.PORT || 3000;
const nextPath = require.resolve('next/dist/bin/next');
console.log(`📦 Next.js path: ${nextPath}`);

// Ensure HOSTNAME is set to 0.0.0.0 for Railway (required for external access)
const serverEnv = {
  ...process.env,
  HOSTNAME: process.env.HOSTNAME || '0.0.0.0',
  PORT: port.toString(),
  NODE_ENV: process.env.NODE_ENV || 'production'
};

console.log(`🌐 Server will bind to: ${serverEnv.HOSTNAME}:${port}`);
console.log('🚀 Spawning Next.js server process...');

const server = spawn('node', [nextPath, 'start', '-p', port.toString(), '-H', serverEnv.HOSTNAME], {
  stdio: 'inherit',
  env: serverEnv,
  cwd: process.cwd(),
  detached: false
});

// Log when server starts
server.on('spawn', () => {
  console.log('✅ Next.js server process spawned successfully');
  console.log(`🌐 Server should be available on port ${port}`);
  console.log(`📝 Server PID: ${server.pid}`);
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  console.error('Error details:', error.message);
  if (error.stack) {
    console.error('Stack trace:', error.stack);
  }
  console.error('⚠️  This is a fatal error - service cannot start');
  process.exit(1);
});

server.on('exit', (code, signal) => {
  if (code !== null && code !== 0) {
    console.error(`❌ Server exited unexpectedly with code ${code}${signal ? ` and signal ${signal}` : ''}`);
    console.error('⚠️  This will cause 502 errors - server is not running');
    process.exit(code);
  } else if (signal) {
    console.log(`📴 Server terminated by signal: ${signal}`);
    // Don't exit on SIGTERM/SIGINT - let Railway handle it
    if (signal === 'SIGTERM' || signal === 'SIGINT') {
      console.log('ℹ️  Graceful shutdown requested - exiting');
      process.exit(0);
    }
  } else {
    console.log(`✅ Server exited normally with code ${code || 0}`);
    process.exit(code || 0);
  }
});

// Keep process alive - don't exit when server exits unless it's an error
process.on('beforeExit', (code) => {
  console.log(`⚠️  Process about to exit with code ${code}`);
  if (code !== 0) {
    console.error('❌ Non-zero exit code indicates an error occurred');
  }
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


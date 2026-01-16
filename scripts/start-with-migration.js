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
  execSync('npx prisma db push --skip-generate', {
    stdio: 'inherit',
    env: { ...process.env }
  });
  console.log('✅ Database migrations completed successfully');
} catch (error) {
  console.error('⚠️  Migration error:', error.message);
  // Continue anyway - tables might already exist or migration might not be critical
  // In production, you might want to exit here depending on your requirements
  console.log('⚠️  Continuing with server start...');
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


#!/usr/bin/env node
/**
 * Database verification script
 * Checks database connection and verifies tables were created
 */

const { PrismaClient } = require('@prisma/client');

async function verifyDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    console.log('\n🔍 Verifying tables exist...');
    
    // Check a few key tables
    const tables = [
      'ReadinessAssessment',
      'ContactSubmission',
      'GovernmentContractDiscovery',
      'IgnoredOpportunity',
      'Deployment',
      'SystemHealth',
      'Contract',
      'LegalDocument',
      'RMFRequirement',
      'Ticket'
    ];
    
    const results = {};
    
    for (const table of tables) {
      try {
        const count = await prisma[table].count();
        results[table] = { exists: true, count };
        console.log(`  ✅ ${table}: ${count} records`);
      } catch (error) {
        if (error.message.includes('does not exist') || error.message.includes('relation')) {
          results[table] = { exists: false, error: 'Table does not exist' };
          console.log(`  ❌ ${table}: Table does not exist`);
        } else {
          results[table] = { exists: false, error: error.message };
          console.log(`  ⚠️  ${table}: ${error.message}`);
        }
      }
    }
    
    const existingTables = Object.values(results).filter(r => r.exists).length;
    const totalTables = tables.length;
    
    console.log(`\n📊 Summary: ${existingTables}/${totalTables} tables verified`);
    
    if (existingTables === totalTables) {
      console.log('✅ All tables exist! Database is ready.');
      process.exit(0);
    } else {
      console.log('⚠️  Some tables are missing. Run migrations:');
      console.log('   railway run npm run db:push');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    
    if (error.message.includes('does not exist') || error.message.includes('relation')) {
      console.log('\n💡 Database tables do not exist. Run migrations:');
      console.log('   railway run npm run db:push');
    } else if (error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Cannot connect to database. Check:');
      console.log('   - Verify DATABASE_URL is set correctly in Railway');
      console.log('   - Ensure PostgreSQL service is running');
      console.log('   - Check that DATABASE_URL is linked to your app service');
    } else {
      console.log('\n💡 Unexpected error. Check Railway logs for details.');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();


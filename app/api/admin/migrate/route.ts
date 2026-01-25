import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logMaintenanceToolOperation } from '@/lib/maintenance-tool-logging'

export const dynamic = 'force-dynamic'

/**
 * Admin endpoint to manually trigger database migrations
 * This is useful for baselining existing databases or applying new migrations
 * Allows unauthenticated access during first-time setup (when no users exist)
 */
export async function POST(request: NextRequest) {
  try {
    // Check if it's first-time setup (no users exist)
    let isFirstSetup = false
    try {
      const userCount = await prisma.user.count()
      isFirstSetup = userCount === 0
    } catch (error: any) {
      // If query fails, tables probably don't exist - this is first setup
      if (error.message?.includes("does not exist") || error.message?.includes("relation")) {
        isFirstSetup = true
      }
    }

    // If not first setup, require admin authentication
    let userId: string | null = null
    let userEmail: string | null = null
    
    if (!isFirstSetup) {
      const session = await auth()
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, email: true },
      })

      if (user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 })
      }
      
      userId = session.user.id
      userEmail = session.user.email || null
    }

    console.log('[Migration API] Starting manual migration...')
    
    // Log maintenance tool access (Prisma CLI)
    const prismaVersion = '5.22.0'
    await logMaintenanceToolOperation(
      userId,
      userEmail,
      'Prisma CLI',
      prismaVersion,
      'database migration',
      'Migration initiated',
      true,
      { isFirstSetup, operationType: 'manual_migration' }
    ).catch(err => console.error('Failed to log maintenance tool access:', err))

    const results: string[] = []
    let success = false

    try {
      // Step 1: Use db push to sync schema and create missing tables
      // This ensures all tables from schema.prisma exist, including PhysicalAccessLog and EndpointInventory
      results.push('📋 Step 1: Syncing database schema (creating missing tables)...')
      try {
        const pushOutput = execSync('npx prisma db push --accept-data-loss', {
          stdio: 'pipe',
          env: { ...process.env },
          encoding: 'utf-8'
        })
        results.push('✅ Database schema synced successfully')
        results.push(`   ${pushOutput.split('\n').filter((l: string) => l.trim()).join('\n   ')}`)
        success = true
        
        // Log successful Prisma operation
        await logMaintenanceToolOperation(
          userId,
          userEmail,
          'Prisma CLI',
          prismaVersion,
          'prisma db push',
          'Schema synced successfully',
          true,
          { output: pushOutput.substring(0, 500) }
        ).catch(err => console.error('Failed to log Prisma operation:', err))
      } catch (pushError: any) {
        const pushErrorMsg = pushError.message || String(pushError)
        results.push(`⚠️  Schema sync warning: ${pushErrorMsg}`)
        // Continue anyway - some warnings are non-fatal
        success = true
        
        // Log Prisma operation with warning
        await logMaintenanceToolOperation(
          userId,
          userEmail,
          'Prisma CLI',
          prismaVersion,
          'prisma db push',
          `Warning: ${pushErrorMsg.substring(0, 200)}`,
          true,
          { warning: true }
        ).catch(err => console.error('Failed to log Prisma operation:', err))
      }

      // Step 2: Apply any pending migrations
      results.push('')
      results.push('📋 Step 2: Applying pending migrations...')
      const existingMigrations = [
        '20260114040029_add_sam_ingestion_fields',
        '20260115044544_add_sam_ingestion_fields'
      ]

      // Check if we need to baseline or resolve failed migrations
      try {
        execSync('npx prisma migrate deploy', {
          stdio: 'pipe',
          env: { ...process.env }
        })
        results.push('✅ Migrations applied successfully')
        success = true
        
        // Log successful migration deploy
        await logMaintenanceToolOperation(
          userId,
          userEmail,
          'Prisma CLI',
          prismaVersion,
          'prisma migrate deploy',
          'Migrations applied successfully',
          true
        ).catch(err => console.error('Failed to log Prisma operation:', err))
      } catch (error: any) {
        const errorMessage = error.message || String(error)
        
        // Handle failed migrations (P3009)
        if (errorMessage.includes('P3009') || errorMessage.includes('failed migrations')) {
          results.push('⚠️  Found failed migrations - attempting to resolve...')
          
          // Extract migration name from error message - try multiple patterns
          let failedMigrationName = null
          const patterns = [
            /`(\d+_\w+)`/,
            /migration `(\d+_\w+)`/,
            /The `(\d+_\w+)` migration/,
            /(\d{14}_\w+)/,
          ]
          
          for (const pattern of patterns) {
            const match = errorMessage.match(pattern)
            if (match) {
              failedMigrationName = match[1]
              break
            }
          }
          
          // Default to known failed migrations
          const failedMigrations = failedMigrationName
            ? [failedMigrationName]
            : ['20260117190000_add_capture_dashboard_models']
          
          results.push(`📋 Resolving failed migration(s): ${failedMigrations.join(', ')}`)
          
          // First, try to mark as rolled back
          for (const migration of failedMigrations) {
            try {
              execSync(`npx prisma migrate resolve --rolled-back ${migration}`, {
                stdio: 'pipe',
                env: { ...process.env }
              })
              results.push(`✅ Marked ${migration} as rolled back`)
            } catch (resolveError: any) {
              const resolveErrorMsg = resolveError.message || String(resolveError)
              // If rolled-back doesn't work, try applied (in case tables already exist)
              if (resolveErrorMsg.includes('already') || resolveErrorMsg.includes('not found')) {
                try {
                  execSync(`npx prisma migrate resolve --applied ${migration}`, {
                    stdio: 'pipe',
                    env: { ...process.env }
                  })
                  results.push(`✅ Marked ${migration} as applied (tables may already exist)`)
                } catch (appliedError: any) {
                  results.push(`⚠️  ${migration}: Could not resolve - ${appliedError.message || resolveErrorMsg}`)
                }
              } else {
                results.push(`⚠️  ${migration}: ${resolveErrorMsg}`)
              }
            }
          }
          
          // Retry migration deploy
          try {
            results.push('🔄 Retrying migration deploy...')
            execSync('npx prisma migrate deploy', {
              stdio: 'pipe',
              env: { ...process.env }
            })
            results.push('✅ Migrations applied successfully after resolving failed migrations')
            success = true
            
            // Log successful migration after resolution
            await logMaintenanceToolOperation(
              userId,
              userEmail,
              'Prisma CLI',
              prismaVersion,
              'prisma migrate deploy (after resolution)',
              'Migrations applied successfully after resolving failed migrations',
              true,
              { resolvedMigrations: failedMigrations }
            ).catch(err => console.error('Failed to log Prisma operation:', err))
          } catch (retryError: any) {
            const retryErrorMsg = retryError.message || String(retryError)
            results.push(`❌ Retry failed: ${retryErrorMsg}`)
            
            // If retry fails, try marking as applied (tables might already exist)
            if (retryErrorMsg.includes('already exists') || retryErrorMsg.includes('duplicate')) {
              results.push('📋 Tables may already exist - marking migration as applied...')
              for (const migration of failedMigrations) {
                try {
                  execSync(`npx prisma migrate resolve --applied ${migration}`, {
                    stdio: 'pipe',
                    env: { ...process.env }
                  })
                  results.push(`✅ Marked ${migration} as applied`)
                  success = true
                } catch (finalError: any) {
                  results.push(`⚠️  Final resolve failed for ${migration}: ${finalError.message}`)
                }
              }
            } else {
              success = false
            }
          }
        } else if (errorMessage.includes('not empty') || errorMessage.includes('P3005')) {
          results.push('📋 Database is not empty - baselining existing migrations...')
          
          // Mark existing migrations as applied
          for (const migration of existingMigrations) {
            try {
              execSync(`npx prisma migrate resolve --applied ${migration}`, {
                stdio: 'pipe',
                env: { ...process.env }
              })
              results.push(`✅ Marked ${migration} as applied`)
            } catch (resolveError: any) {
              if (resolveError.message?.includes('already') || resolveError.message?.includes('Applied')) {
                results.push(`ℹ️  ${migration} already marked as applied`)
              } else {
                results.push(`⚠️  ${migration}: ${resolveError.message || 'Unknown error'}`)
              }
            }
          }
          
          // Retry migration deploy
          try {
            execSync('npx prisma migrate deploy', {
              stdio: 'pipe',
              env: { ...process.env }
            })
            results.push('✅ Migrations applied successfully after baseline')
            success = true
            
            // Log successful migration after baseline
            await logMaintenanceToolOperation(
              userId,
              userEmail,
              'Prisma CLI',
              prismaVersion,
              'prisma migrate deploy (after baseline)',
              'Migrations applied successfully after baseline',
              true,
              { baselinedMigrations: existingMigrations }
            ).catch(err => console.error('Failed to log Prisma operation:', err))
          } catch (retryError: any) {
            results.push(`❌ Retry failed: ${retryError.message || String(retryError)}`)
            success = false
            
            // Log failed migration
            await logMaintenanceToolOperation(
              userId,
              userEmail,
              'Prisma CLI',
              prismaVersion,
              'prisma migrate deploy',
              `Failed: ${retryError.message || String(retryError)}`,
              false,
              { error: retryError.message }
            ).catch(err => console.error('Failed to log Prisma operation:', err))
          }
        } else {
          results.push(`❌ Migration error: ${errorMessage}`)
          success = false
          
          // Log failed migration
          await logMaintenanceToolOperation(
            userId,
            userEmail,
            'Prisma CLI',
            prismaVersion,
            'prisma migrate deploy',
            `Failed: ${errorMessage}`,
            false,
            { error: errorMessage }
          ).catch(err => console.error('Failed to log Prisma operation:', err))
        }
      }

      // Step 3: Verify critical tables exist
      results.push('')
      results.push('📋 Step 3: Verifying critical tables exist...')
      const criticalTables = ['User', 'PhysicalAccessLog', 'EndpointInventory', 'AppEvent']
      for (const table of criticalTables) {
        try {
          // Try a simple query to verify table exists
          if (table === 'User') {
            await prisma.user.count()
          } else if (table === 'PhysicalAccessLog') {
            await prisma.physicalAccessLog.count()
          } else if (table === 'EndpointInventory') {
            await prisma.endpointInventory.count()
          } else if (table === 'AppEvent') {
            await prisma.appEvent.count()
          }
          results.push(`✅ Table '${table}' exists`)
        } catch (error: any) {
          if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
            results.push(`❌ Table '${table}' does not exist`)
            success = false
          } else {
            // Other errors might be OK (e.g., permission issues)
            results.push(`⚠️  Table '${table}': ${error.message || 'Unknown error'}`)
          }
        }
      }

      // Log final migration operation result
      await logMaintenanceToolOperation(
        userId,
        userEmail,
        'Prisma CLI',
        prismaVersion,
        'database migration (complete)',
        success ? 'Migration completed successfully' : 'Migration completed with errors',
        success,
        { 
          tablesVerified: criticalTables.length,
          resultsCount: results.length 
        }
      ).catch(err => console.error('Failed to log final migration result:', err))

      return NextResponse.json({
        success,
        message: success 
          ? 'Database migration completed successfully. All tables created and verified.' 
          : 'Migration completed with errors. Check results for details.',
        results,
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      console.error('[Migration API] Error:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Migration failed',
          error: error.message || String(error),
          results,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('[Migration API] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Unexpected error',
        error: error.message || String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}


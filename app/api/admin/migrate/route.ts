import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    if (!isFirstSetup) {
      const session = await auth()
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      })

      if (user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 })
      }
    }

    console.log('[Migration API] Starting manual migration...')

    const results: string[] = []
    let success = false

    try {
      // First, try to baseline existing migrations if needed
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
          } catch (retryError: any) {
            results.push(`❌ Retry failed: ${retryError.message || String(retryError)}`)
            success = false
          }
        } else {
          results.push(`❌ Migration error: ${errorMessage}`)
          success = false
        }
      }

      return NextResponse.json({
        success,
        message: success ? 'Migrations completed successfully' : 'Migration failed',
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


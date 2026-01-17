import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'

export const dynamic = 'force-dynamic'

/**
 * Admin endpoint to manually trigger database migrations
 * This is useful for baselining existing databases or applying new migrations
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication check here
    // const authHeader = request.headers.get('authorization')
    // if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    console.log('[Migration API] Starting manual migration...')

    const results: string[] = []
    let success = false

    try {
      // First, try to baseline existing migrations if needed
      const existingMigrations = [
        '20260114040029_add_sam_ingestion_fields',
        '20260115044544_add_sam_ingestion_fields'
      ]

      // Check if we need to baseline
      try {
        execSync('npx prisma migrate deploy', {
          stdio: 'pipe',
          env: { ...process.env }
        })
        results.push('✅ Migrations applied successfully')
        success = true
      } catch (error: any) {
        const errorMessage = error.message || String(error)
        
        if (errorMessage.includes('not empty') || errorMessage.includes('P3005')) {
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


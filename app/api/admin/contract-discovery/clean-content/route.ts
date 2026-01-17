/**
 * POST /api/admin/contract-discovery/clean-content
 * Re-processes already-scraped contracts with AI content cleaning
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cleanContractContent } from '@/lib/ai/contract-content-cleaner'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Starting AI content cleaning for scraped contracts')
    
    const searchParams = request.nextUrl.searchParams
    const minScore = parseInt(searchParams.get('minScore') || '50', 10)
    
    // Find all contracts with relevance_score >= minScore that have been scraped
    const contracts = await prisma.governmentContractDiscovery.findMany({
      where: {
        relevance_score: {
          gte: minScore,
        },
        scraped: true,
        scraped_text_content: {
          not: null,
        },
      },
      select: {
        id: true,
        title: true,
        scraped_text_content: true,
        scraped_html_content: true,
        description: true,
        requirements: true,
      },
      orderBy: {
        relevance_score: 'desc',
      },
    })

    console.log(`[API] Found ${contracts.length} scraped contracts to clean with AI`)

    if (contracts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No scraped contracts found to clean',
        cleaned: 0,
        total: 0,
      })
    }

    // Run cleaning in background
    const cleaningPromise = (async () => {
      let successCount = 0
      let errorCount = 0

      // Process contracts in batches
      const batchSize = 5
      for (let i = 0; i < contracts.length; i += batchSize) {
        const batch = contracts.slice(i, i + batchSize)
        console.log(`[API] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(contracts.length / batchSize)} (${batch.length} contracts)`)

        const batchPromises = batch.map(async (contract) => {
          try {
            if (!contract.scraped_text_content) {
              console.log(`[API] Skipping ${contract.id} - no scraped text content`)
              return
            }

            console.log(`[API] Cleaning: ${contract.title.substring(0, 60)}...`)
            
            // Clean content with AI
            const cleaned = await cleanContractContent(
              contract.scraped_text_content,
              contract.scraped_html_content || undefined
            )

            if (!cleaned) {
              throw new Error('AI cleaning returned no result')
            }

            // Merge extracted requirements with existing
            let existingRequirements: string[] = []
            if (contract.requirements) {
              try {
                const parsed = JSON.parse(contract.requirements)
                existingRequirements = Array.isArray(parsed) ? parsed : []
              } catch {
                // Ignore parse errors
              }
            }
            
            const allRequirements = [
              ...(cleaned.extractedFields.requirements || []),
              ...existingRequirements,
            ]
            const uniqueRequirements = [...new Set(allRequirements)]

            // Update points of contact if extracted by AI
            let pointsOfContact = undefined
            if (cleaned.extractedFields.contactInfo) {
              const contact = cleaned.extractedFields.contactInfo
              if (contact.name || contact.email || contact.phone) {
                pointsOfContact = JSON.stringify([{
                  name: contact.name || '',
                  email: contact.email || '',
                  phone: contact.phone || '',
                  role: 'Primary Point of Contact',
                }])
              }
            }

            // Update database with cleaned content
            await prisma.governmentContractDiscovery.update({
              where: { id: contract.id },
              data: {
                description: cleaned.cleanedDescription || undefined,
                scraped_text_content: cleaned.cleanedTextContent || contract.scraped_text_content || undefined,
                analysis_summary: cleaned.extractedFields.summary || undefined,
                analysis_keywords: JSON.stringify(cleaned.extractedFields.keyPoints || []),
                requirements: uniqueRequirements.length > 0
                  ? JSON.stringify(uniqueRequirements)
                  : undefined,
                points_of_contact: pointsOfContact || undefined,
                deadline: cleaned.extractedFields.timeline || undefined,
                estimated_value: cleaned.extractedFields.budget || undefined,
                place_of_performance: cleaned.extractedFields.location || undefined,
                updated_at: new Date(),
              },
            })

            console.log(`[API] ✓ Successfully cleaned: ${contract.title.substring(0, 60)}...`)
            successCount++
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            console.error(`[API] ✗ Error cleaning ${contract.id} (${contract.title.substring(0, 60)}...):`, errorMessage)
            errorCount++
          }
        })

        await Promise.all(batchPromises)

        // Add delay between batches
        if (i + batchSize < contracts.length) {
          console.log('[API] Waiting 2 seconds before next batch...')
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }

      console.log(`[API] AI cleaning complete! Successfully cleaned: ${successCount}, Errors: ${errorCount}`)
    })()

    cleaningPromise.catch((error) => {
      console.error('[API] AI content cleaning failed:', error)
    })
    
    return NextResponse.json({
      success: true,
      message: `AI content cleaning started in background. Processing ${contracts.length} contracts. Check logs for progress.`,
      total: contracts.length,
      started: true,
    })
  } catch (error) {
    console.error('[API] Error starting AI cleaning:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}


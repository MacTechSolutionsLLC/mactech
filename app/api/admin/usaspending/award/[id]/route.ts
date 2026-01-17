import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAward, searchTransactions, searchSubawards } from '@/lib/usaspending-api'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const awardId = params.id
    const useDatabase = request.nextUrl.searchParams.get('use_database') === 'true'
    const includeTransactions = request.nextUrl.searchParams.get('include_transactions') === 'true'
    const includeSubawards = request.nextUrl.searchParams.get('include_subawards') === 'true'

    if (useDatabase) {
      // Get from database
      const award = await prisma.usaSpendingAward.findFirst({
        where: {
          OR: [
            { award_id: awardId },
            { generated_unique_award_id: awardId },
            { id: awardId },
          ],
        },
        include: {
          transactions: includeTransactions,
        },
      })

      if (!award) {
        return NextResponse.json(
          { success: false, error: 'Award not found' },
          { status: 404 }
        )
      }

      const result: any = {
        ...award,
        awarding_agency: award.awarding_agency ? JSON.parse(award.awarding_agency) : null,
        funding_agency: award.funding_agency ? JSON.parse(award.funding_agency) : null,
        recipient_location: award.recipient_location ? JSON.parse(award.recipient_location) : null,
        place_of_performance: award.place_of_performance ? JSON.parse(award.place_of_performance) : null,
        period_of_performance: award.period_of_performance ? JSON.parse(award.period_of_performance) : null,
        raw_data: award.raw_data ? JSON.parse(award.raw_data) : null,
      }

      if (includeSubawards) {
        // Fetch subawards from API
        try {
          const subawardsResponse = await searchSubawards({ award_id: awardId })
          result.subawards = subawardsResponse.results || []
        } catch (error) {
          console.error('[USAspending Award] Error fetching subawards:', error)
          result.subawards = []
        }
      }

      return NextResponse.json({
        success: true,
        award: result,
      })
    } else {
      // Get from API
      const award = await getAward(awardId)

      const result: any = { ...award }

      if (includeTransactions) {
        try {
          const transactionsResponse = await searchTransactions({ award_id: awardId })
          result.transactions = transactionsResponse.results || []
        } catch (error) {
          console.error('[USAspending Award] Error fetching transactions:', error)
          result.transactions = []
        }
      }

      if (includeSubawards) {
        try {
          const subawardsResponse = await searchSubawards({ award_id: awardId })
          result.subawards = subawardsResponse.results || []
        } catch (error) {
          console.error('[USAspending Award] Error fetching subawards:', error)
          result.subawards = []
        }
      }

      return NextResponse.json({
        success: true,
        award: result,
      })
    }
  } catch (error) {
    console.error('[USAspending Award] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}


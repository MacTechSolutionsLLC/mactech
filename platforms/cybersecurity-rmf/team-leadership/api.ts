/**
 * Next.js API route for Team Leadership
 */

import { NextRequest, NextResponse } from 'next/server'
import { teamMemberSchema } from './types'
import { teamLeadershipService } from './service'
import { handleError } from '../../shared/errors'
import { validateInput } from '../../shared/validation'
import { createLogger } from '../../shared/logger'

const logger = createLogger('team-leadership-api')

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/reviews')) {
      const { teamMemberId, reviewer, ...reviewData } = body
      const review = await teamLeadershipService.createPerformanceReview(teamMemberId, reviewer, reviewData)
      return NextResponse.json({ success: true, data: review }, { status: 201 })
    }

    if (pathname.includes('/development')) {
      const { teamMemberId, goals } = body
      const member = await teamLeadershipService.createDevelopmentPlan(teamMemberId, goals)
      return NextResponse.json({ success: true, data: member })
    }

    // Add team member
    const data = validateInput(teamMemberSchema, body)
    const member = await teamLeadershipService.addMember(data)
    return NextResponse.json({ success: true, data: member }, { status: 201 })
  } catch (error) {
    logger.error('Error in team leadership API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { pathname, searchParams } = new URL(request.url)

    if (pathname.includes('/metrics')) {
      const metrics = await teamLeadershipService.getMetrics()
      return NextResponse.json({ success: true, data: metrics })
    }

    if (pathname.includes('/workload')) {
      const workload = await teamLeadershipService.analyzeWorkload()
      return NextResponse.json({ success: true, data: workload })
    }

    const id = searchParams.get('id')
    if (id) {
      const member = await teamLeadershipService.getMember(id)
      return NextResponse.json({ success: true, data: member })
    }

    const members = await teamLeadershipService.listMembers()
    return NextResponse.json({ success: true, data: members })
  } catch (error) {
    logger.error('Error in team leadership API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}



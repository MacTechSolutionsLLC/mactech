import { NextRequest, NextResponse } from 'next/server'
import { teamLeadershipService } from '@/platforms/cybersecurity-rmf/team-leadership/service'
import { teamMemberSchema } from '@/platforms/cybersecurity-rmf/team-leadership/types'
import { handleError } from '@/platforms/shared/errors'
import { validateInput } from '@/platforms/shared/validation'

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/review')) {
      const { teamMemberId } = body
      const review = await teamLeadershipService.createPerformanceReview(teamMemberId)
      return NextResponse.json({ success: true, data: review })
    }

    const data = validateInput(teamMemberSchema, body)
    const member = await teamLeadershipService.addTeamMember(data)
    return NextResponse.json({ success: true, data: member }, { status: 201 })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const member = await teamLeadershipService.getTeamMember(id)
      return NextResponse.json({ success: true, data: member })
    }

    const members = await teamLeadershipService.listTeamMembers()
    return NextResponse.json({ success: true, data: members })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}


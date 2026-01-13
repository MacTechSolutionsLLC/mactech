import { NextRequest, NextResponse } from 'next/server'
import { metrologyService } from '@/platforms/quality-assurance/metrology-management/service'
import { metrologyProjectSchema } from '@/platforms/quality-assurance/metrology-management/types'
import { handleError } from '@/platforms/shared/errors'
import { validateInput } from '@/platforms/shared/validation'

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/uncertainty')) {
      const { measurements } = body
      const uncertainty = await metrologyService.calculateUncertainty(measurements)
      return NextResponse.json({ success: true, data: uncertainty })
    }

    const data = validateInput(metrologyProjectSchema, body)
    const project = await metrologyService.createProject(data)
    return NextResponse.json({ success: true, data: project }, { status: 201 })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { pathname, searchParams } = new URL(request.url)

    if (pathname.includes('/projects')) {
      const projects = await metrologyService.listProjects()
      return NextResponse.json({ success: true, data: projects })
    }

    if (pathname.includes('/calibrations')) {
      const schedule = await metrologyService.getCalibrationSchedule()
      return NextResponse.json({ success: true, data: schedule })
    }

    const projects = await metrologyService.listProjects()
    return NextResponse.json({ success: true, data: projects })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}


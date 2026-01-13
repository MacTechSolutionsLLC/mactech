import { NextRequest, NextResponse } from 'next/server'
import { metrologyManagementService } from '@/platforms/quality-assurance/metrology-management/service'
import { metrologyProjectSchema } from '@/platforms/quality-assurance/metrology-management/types'
import { handleError } from '@/platforms/shared/errors'
import { validateInput } from '@/platforms/shared/validation'

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/uncertainty')) {
      const { measurementId, value } = body
      if (!measurementId || value === undefined) {
        return NextResponse.json({ success: false, error: 'measurementId and value required' }, { status: 400 })
      }
      const uncertainty = await metrologyManagementService.calculateUncertainty(measurementId, value)
      return NextResponse.json({ success: true, data: uncertainty })
    }

    const data = validateInput(metrologyProjectSchema, body)
    const project = await metrologyManagementService.createProject(data)
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
      const projects = await metrologyManagementService.listProjects()
      return NextResponse.json({ success: true, data: projects })
    }

    if (pathname.includes('/calibrations')) {
      const schedule = await metrologyManagementService.getCalibrationSchedule()
      return NextResponse.json({ success: true, data: schedule })
    }

    const projects = await metrologyManagementService.listProjects()
    return NextResponse.json({ success: true, data: projects })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}


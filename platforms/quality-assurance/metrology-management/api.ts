/**
 * Next.js API route for Metrology Management
 */

import { NextRequest, NextResponse } from 'next/server'
import { metrologyProjectSchema } from './types'
import { metrologyManagementService } from './service'
import { handleError } from '../../shared/errors'
import { validateInput } from '../../shared/validation'
import { createLogger } from '../../shared/logger'

const logger = createLogger('metrology-management-api')

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/uncertainty')) {
      const { measurementId, value } = body
      const uncertainty = await metrologyManagementService.calculateUncertainty(measurementId, value)
      return NextResponse.json({ success: true, data: uncertainty })
    }

    // Create project
    const data = validateInput(metrologyProjectSchema, body)
    const project = await metrologyManagementService.createProject(data)
    return NextResponse.json({ success: true, data: project }, { status: 201 })
  } catch (error) {
    logger.error('Error in metrology management API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { pathname, searchParams } = new URL(request.url)

    if (pathname.includes('/schedule')) {
      const equipmentId = searchParams.get('equipmentId')
      const schedule = await metrologyManagementService.getCalibrationSchedule(equipmentId || undefined)
      return NextResponse.json({ success: true, data: schedule })
    }

    if (pathname.includes('/traceability')) {
      const equipmentId = searchParams.get('equipmentId')
      if (!equipmentId) {
        return NextResponse.json({ success: false, error: 'equipmentId required' }, { status: 400 })
      }
      const traceability = await metrologyManagementService.getTraceability(equipmentId)
      return NextResponse.json({ success: true, data: traceability })
    }

    if (pathname.includes('/metrics')) {
      const metrics = await metrologyManagementService.getMetrics()
      return NextResponse.json({ success: true, data: metrics })
    }

    const id = searchParams.get('id')
    if (id) {
      const project = await metrologyManagementService.getProject(id)
      return NextResponse.json({ success: true, data: project })
    }

    const projects = await metrologyManagementService.listProjects()
    return NextResponse.json({ success: true, data: projects })
  } catch (error) {
    logger.error('Error in metrology management API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}


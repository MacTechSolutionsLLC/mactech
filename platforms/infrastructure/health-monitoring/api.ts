/**
 * Next.js API route for Infrastructure Health Monitoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { healthMonitoringService } from './service'
import { handleError } from '../../shared/errors'
import { createLogger } from '../../shared/logger'

const logger = createLogger('health-monitoring-api')

export async function GET(request: NextRequest) {
  try {
    const { pathname, searchParams } = new URL(request.url)
    
    // Route to different endpoints based on path
    if (pathname.includes('/health')) {
      const metrics = await healthMonitoringService.getHealthMetrics()
      return NextResponse.json({ success: true, data: metrics })
    }
    
    if (pathname.includes('/systems')) {
      const systemId = searchParams.get('id')
      if (systemId) {
        const system = await healthMonitoringService.getSystemHealth(systemId)
        return NextResponse.json({ success: true, data: system })
      }
      const systems = await healthMonitoringService.getAllSystems()
      return NextResponse.json({ success: true, data: systems })
    }
    
    if (pathname.includes('/alerts')) {
      const alerts = await healthMonitoringService.getActiveAlerts()
      return NextResponse.json({ success: true, data: alerts })
    }
    
    if (pathname.includes('/predictions')) {
      const systemId = searchParams.get('systemId')
      const predictions = await healthMonitoringService.getPredictions(systemId || undefined)
      return NextResponse.json({ success: true, data: predictions })
    }
    
    // Default: return health metrics
    const metrics = await healthMonitoringService.getHealthMetrics()
    return NextResponse.json({ success: true, data: metrics })
  } catch (error) {
    logger.error('Error in health monitoring API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}


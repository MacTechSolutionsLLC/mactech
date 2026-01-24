import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { logEvent, ActionType, TargetType } from '@/lib/audit'

/**
 * API route for client components to log audit events
 * This allows client components to log events without directly importing server-only code
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    // Parse request body
    const body = await request.json()
    const {
      actionType,
      actorUserId,
      actorEmail,
      success = true,
      targetType,
      targetId,
      details,
    } = body

    // Validate actionType
    if (!actionType || typeof actionType !== 'string') {
      return NextResponse.json(
        { error: 'actionType is required' },
        { status: 400 }
      )
    }

    // Use session user if actorUserId/actorEmail not provided
    const finalActorUserId = actorUserId || session?.user?.id || null
    const finalActorEmail = actorEmail || session?.user?.email || null

    // Log the event
    await logEvent(
      actionType as ActionType,
      finalActorUserId,
      finalActorEmail,
      success,
      targetType as TargetType | undefined,
      targetId,
      details
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to log audit event:', error)
    return NextResponse.json(
      { error: 'Failed to log audit event' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/authz'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for feedback status update
const updateFeedbackSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'implemented', 'closed']),
})

/**
 * PATCH /api/feedback/[id]
 * Update feedback status
 * Requires authentication (USER or ADMIN)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params
    const body = await request.json()

    // Validate input
    const validationResult = updateFeedbackSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid feedback update data',
          details: validationResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        },
        { status: 400 }
      )
    }

    const { status } = validationResult.data

    // Check if feedback exists
    const existingFeedback = await prisma.feedback.findUnique({
      where: { id },
    })

    if (!existingFeedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      )
    }

    // Update feedback status
    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: {
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      feedback: {
        id: updatedFeedback.id,
        content: updatedFeedback.content,
        status: updatedFeedback.status,
        pageUrl: updatedFeedback.pageUrl,
        elementSelector: updatedFeedback.elementSelector,
        elementId: updatedFeedback.elementId,
        elementClass: updatedFeedback.elementClass,
        elementText: updatedFeedback.elementText,
        elementType: updatedFeedback.elementType,
        createdAt: updatedFeedback.createdAt.toISOString(),
        updatedAt: updatedFeedback.updatedAt.toISOString(),
        user: {
          id: updatedFeedback.user.id,
          name: updatedFeedback.user.name,
          email: updatedFeedback.user.email,
        },
      },
    })
  } catch (error: any) {
    console.error('Error updating feedback:', error)
    
    // Handle authentication errors
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update feedback' },
      { status: 500 }
    )
  }
}

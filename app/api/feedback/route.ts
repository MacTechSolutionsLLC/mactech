import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for feedback submission
const feedbackSchema = z.object({
  content: z.string().min(1, "Feedback content is required").max(5000, "Feedback must be less than 5000 characters"),
  pageUrl: z.string().url().optional().or(z.literal("")),
  elementSelector: z.string().optional(),
  elementId: z.string().optional(),
  elementClass: z.string().optional(),
  elementText: z.string().optional(),
  elementType: z.string().optional(),
})

/**
 * POST /api/feedback
 * Create new feedback entry
 * Requires authentication (USER or ADMIN)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()

    const body = await req.json()

    // Validate input
    const validationResult = feedbackSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid feedback data",
          details: validationResult.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
        },
        { status: 400 }
      )
    }

    const {
      content,
      pageUrl,
      elementSelector,
      elementId,
      elementClass,
      elementText,
      elementType,
    } = validationResult.data

    // Create feedback entry
    const feedback = await prisma.feedback.create({
      data: {
        userId: session.user.id,
        content: content.trim(),
        pageUrl: pageUrl && pageUrl.trim() !== "" ? pageUrl.trim() : null,
        elementSelector: elementSelector && elementSelector.trim() !== "" ? elementSelector.trim() : null,
        elementId: elementId && elementId.trim() !== "" ? elementId.trim() : null,
        elementClass: elementClass && elementClass.trim() !== "" ? elementClass.trim() : null,
        elementText: elementText && elementText.trim() !== "" ? elementText.trim() : null,
        elementType: elementType && elementType.trim() !== "" ? elementType.trim() : null,
        status: "pending",
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
        id: feedback.id,
        content: feedback.content,
        status: feedback.status,
        pageUrl: feedback.pageUrl,
        elementSelector: feedback.elementSelector,
        elementId: feedback.elementId,
        elementClass: feedback.elementClass,
        elementText: feedback.elementText,
        elementType: feedback.elementType,
        createdAt: feedback.createdAt,
        user: {
          id: feedback.user.id,
          name: feedback.user.name,
          email: feedback.user.email,
        },
      },
    })
  } catch (error: any) {
    console.error("Error creating feedback:", error)
    
    // Handle authentication errors
    if (error.status === 401) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to create feedback" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/feedback
 * List feedback entries
 * Requires authentication (USER or ADMIN)
 * All authenticated users can see all feedback
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()

    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const where: any = {}

    // Filter by status if provided
    if (status && status !== "all") {
      where.status = status
    }

    // Get total count for pagination
    const total = await prisma.feedback.count({ where })

    // Calculate pagination
    const skip = (page - 1) * limit
    const totalPages = Math.ceil(total / limit)

    // Fetch feedback with user information
    const feedback = await prisma.feedback.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: sortOrder === "asc" ? "asc" : "desc",
      },
      skip,
      take: limit,
    })

    return NextResponse.json({
      feedback: feedback.map((f) => ({
        id: f.id,
        content: f.content,
        status: f.status,
        pageUrl: f.pageUrl,
        elementSelector: f.elementSelector,
        elementId: f.elementId,
        elementClass: f.elementClass,
        elementText: f.elementText,
        elementType: f.elementType,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
        user: {
          id: f.user.id,
          name: f.user.name,
          email: f.user.email,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error: any) {
    console.error("Error listing feedback:", error)
    
    // Handle authentication errors
    if (error.status === 401) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to list feedback" },
      { status: 500 }
    )
  }
}

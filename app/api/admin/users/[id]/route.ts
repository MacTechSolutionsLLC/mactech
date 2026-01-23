import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/authz"
import { requireAdminReauth } from "@/lib/admin-reauth"
import { prisma } from "@/lib/prisma"
import { logAdminAction, logEvent } from "@/lib/audit"
import { monitorCUIKeywords } from "@/lib/cui-blocker"

/**
 * PATCH /api/admin/users/[id]
 * Update user (role, disable/enable)
 * Requires admin re-authentication
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check if re-auth is required (before attempting)
    let session
    try {
      session = await requireAdminReauth()
    } catch (error: any) {
      // Log that re-auth was required but not provided
      if (error.requiresReauth) {
        const authSession = await requireAdmin()
        const { id } = await context.params
        const body = await req.json()
        
        await logEvent(
          "admin_action",
          authSession.user.id,
          authSession.user.email || "unknown",
          false,
          "user",
          id,
          {
            action: "admin_reauth_required",
            attemptedAction: body.role !== undefined ? "role_change" : body.disabled !== undefined ? "user_disable" : "user_update",
            reason: "Re-authentication required but not verified"
          }
        )
      }
      
      throw error
    }

    const { id } = await context.params
    const body = await req.json()

    // Monitor input for CUI keywords (monitoring-only, does not block)
    await monitorCUIKeywords(body, "user_update", session.user.id, session.user.email || null)

    // Get current user state
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { email: true, role: true, disabled: true },
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}

    if (body.role !== undefined) {
      if (!["USER", "ADMIN"].includes(body.role)) {
        return NextResponse.json(
          { error: "Invalid role" },
          { status: 400 }
        )
      }
      updateData.role = body.role
    }

    if (body.disabled !== undefined) {
      updateData.disabled = body.disabled === true
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        disabled: true,
        lastLoginAt: true,
      },
    })

    // Log admin action
    const action = body.disabled !== undefined
      ? body.disabled
        ? "user_disable"
        : "user_enable"
      : "user_update"

    await logAdminAction(
      session.user.id,
      session.user.email || "unknown",
      action,
      { type: "user", id },
      {
        targetEmail: currentUser.email,
        changes: updateData,
        previousState: {
          role: currentUser.role,
          disabled: currentUser.disabled,
        },
        reauthVerified: true, // Indicate that re-auth was verified for this action
      }
    )

    // Log role change event if role changed
    if (body.role !== undefined && body.role !== currentUser.role) {
      await logEvent(
        "role_change",
        session.user.id,
        session.user.email || null,
        true,
        "user",
        id,
        {
          previousRole: currentUser.role,
          newRole: body.role,
        }
      )
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error: any) {
    console.error("User update error:", error)

    if (error.requiresReauth) {
      return NextResponse.json(
        { error: "Admin re-authentication required", requiresReauth: true },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: error.message?.includes("Admin") ? 403 : 500 }
    )
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Disable user (logical deletion)
 * Requires admin re-authentication
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin re-auth for sensitive actions
    const session = await requireAdminReauth()

    const { id } = await context.params

    // Get user to disable
    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true, role: true, disabled: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (user.disabled) {
      return NextResponse.json(
        { error: "User is already disabled" },
        { status: 400 }
      )
    }

    // Disable user (logical deletion)
    await prisma.user.update({
      where: { id },
      data: { disabled: true },
    })

    // Log admin action
    await logAdminAction(
      session.user.id,
      session.user.email || "unknown",
      "user_disable",
      { type: "user", id },
      {
        targetEmail: user.email,
        reason: "Admin action",
      }
    )

    // Log user disable event
    await logEvent(
      "user_disable",
      session.user.id,
      session.user.email || null,
      true,
      "user",
      id,
      {
        targetEmail: user.email,
      }
    )

    return NextResponse.json({
      success: true,
      message: "User disabled successfully",
    })
  } catch (error: any) {
    console.error("User disable error:", error)

    if (error.requiresReauth) {
      return NextResponse.json(
        { error: "Admin re-authentication required", requiresReauth: true },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to disable user" },
      { status: error.message?.includes("Admin") ? 403 : 500 }
    )
  }
}

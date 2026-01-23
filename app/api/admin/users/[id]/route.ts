import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { logAdminAction, logEvent } from "@/lib/audit"
import { monitorCUIKeywords } from "@/lib/cui-blocker"

/**
 * PATCH /api/admin/users/[id]
 * Update user (role, disable/enable)
 * Requires admin authentication
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    const session = await requireAdmin()

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

    // Security: Prevent self-disable
    if (body.disabled === true && id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot disable your own account" },
        { status: 400 }
      )
    }

    // Security: Prevent removing last admin
    if (body.role === "USER" && currentUser.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: {
          role: "ADMIN",
          disabled: false,
        },
      })

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last active admin. At least one admin must remain active." },
          { status: 400 }
        )
      }
    }

    // Security: Prevent disabling last admin
    if (body.disabled === true && currentUser.role === "ADMIN") {
      const activeAdminCount = await prisma.user.count({
        where: {
          role: "ADMIN",
          disabled: false,
        },
      })

      if (activeAdminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot disable the last active admin. At least one admin must remain active." },
          { status: 400 }
        )
      }
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

    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: error.message?.includes("Admin") ? 403 : 500 }
    )
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Disable user (logical deletion)
 * Requires admin authentication
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    const session = await requireAdmin()

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

    // Security: Prevent self-disable
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot disable your own account" },
        { status: 400 }
      )
    }

    // Security: Prevent disabling last admin
    if (user.role === "ADMIN") {
      const activeAdminCount = await prisma.user.count({
        where: {
          role: "ADMIN",
          disabled: false,
        },
      })

      if (activeAdminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot disable the last active admin. At least one admin must remain active." },
          { status: 400 }
        )
      }
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

    return NextResponse.json(
      { error: error.message || "Failed to disable user" },
      { status: error.message?.includes("Admin") ? 403 : 500 }
    )
  }
}

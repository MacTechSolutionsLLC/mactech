/**
 * User Management Service Layer
 * Centralized business logic for user operations
 */

import { prisma } from "@/lib/prisma"
import { logAdminAction, logEvent } from "@/lib/audit"

export interface UserUpdateData {
  role?: "USER" | "ADMIN"
  disabled?: boolean
}

export interface UserCreateData {
  email: string
  password: string
  name?: string
  role?: "USER" | "ADMIN"
}

export interface UserManagementResult {
  success: boolean
  user?: any
  error?: string
}

/**
 * Check if user can be disabled (not self, not last admin)
 */
export async function canDisableUser(
  userId: string,
  currentAdminId: string
): Promise<{ canDisable: boolean; reason?: string }> {
  // Get user to check
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, disabled: true },
  })

  if (!user) {
    return { canDisable: false, reason: "User not found" }
  }

  // Prevent self-disable
  if (userId === currentAdminId) {
    return { canDisable: false, reason: "You cannot disable your own account" }
  }

  // Prevent disabling last admin
  if (user.role === "ADMIN" && !user.disabled) {
    const activeAdminCount = await prisma.user.count({
      where: {
        role: "ADMIN",
        disabled: false,
      },
    })

    if (activeAdminCount <= 1) {
      return {
        canDisable: false,
        reason: "Cannot disable the last active admin. At least one admin must remain active.",
      }
    }
  }

  return { canDisable: true }
}

/**
 * Check if role can be changed (not removing last admin)
 */
export async function canChangeRole(
  userId: string,
  newRole: "USER" | "ADMIN"
): Promise<{ canChange: boolean; reason?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, disabled: true },
  })

  if (!user) {
    return { canChange: false, reason: "User not found" }
  }

  // Check if downgrading from ADMIN to USER
  if (user.role === "ADMIN" && newRole === "USER" && !user.disabled) {
    const adminCount = await prisma.user.count({
      where: {
        role: "ADMIN",
        disabled: false,
      },
    })

    if (adminCount <= 1) {
      return {
        canChange: false,
        reason: "Cannot remove the last active admin. At least one admin must remain active.",
      }
    }
  }

  return { canChange: true }
}

/**
 * Update user with validation and logging
 */
export async function updateUser(
  userId: string,
  updateData: UserUpdateData,
  adminId: string,
  adminEmail: string
): Promise<UserManagementResult> {
  try {
    // Get current user state
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true, disabled: true },
    })

    if (!currentUser) {
      return { success: false, error: "User not found" }
    }

    // Validate role change
    if (updateData.role !== undefined) {
      const roleCheck = await canChangeRole(userId, updateData.role)
      if (!roleCheck.canChange) {
        return { success: false, error: roleCheck.reason }
      }
    }

    // Validate disable
    if (updateData.disabled === true) {
      const disableCheck = await canDisableUser(userId, adminId)
      if (!disableCheck.canDisable) {
        return { success: false, error: disableCheck.reason }
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
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
    const action = updateData.disabled !== undefined
      ? updateData.disabled
        ? "user_disable"
        : "user_enable"
      : "user_update"

    await logAdminAction(
      adminId,
      adminEmail,
      action,
      { type: "user", id: userId },
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
    if (updateData.role !== undefined && updateData.role !== currentUser.role) {
      await logEvent(
        "role_change",
        adminId,
        adminEmail,
        true,
        "user",
        userId,
        {
          previousRole: currentUser.role,
          newRole: updateData.role,
        }
      )
    }

    return { success: true, user: updatedUser }
  } catch (error: any) {
    console.error("Error updating user:", error)
    return { success: false, error: error.message || "Failed to update user" }
  }
}

/**
 * Create user with validation and logging
 */
export async function createUser(
  userData: UserCreateData,
  adminId: string,
  adminEmail: string
): Promise<UserManagementResult> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    })

    if (existingUser) {
      return { success: false, error: "User with this email already exists" }
    }

    // Create user (password hashing should be done in API route)
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: userData.password, // Should be hashed before calling this
        name: userData.name || null,
        role: userData.role || "USER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    // Log admin action
    await logAdminAction(
      adminId,
      adminEmail,
      "user_create",
      { type: "user", id: user.id },
      {
        createdEmail: userData.email,
        createdRole: userData.role || "USER",
      }
    )

    // Log user creation event
    await logEvent(
      "user_create",
      adminId,
      adminEmail,
      true,
      "user",
      user.id,
      {
        createdEmail: userData.email,
        createdRole: userData.role || "USER",
      }
    )

    return { success: true, user }
  } catch (error: any) {
    console.error("Error creating user:", error)
    return { success: false, error: error.message || "Failed to create user" }
  }
}

/**
 * Get user statistics
 */
export async function getUserStatistics() {
  const [total, active, disabled, admins, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { disabled: false } }),
    prisma.user.count({ where: { disabled: true } }),
    prisma.user.count({ where: { role: "ADMIN", disabled: false } }),
    prisma.user.count({ where: { role: "USER", disabled: false } }),
  ])

  return {
    total,
    active,
    disabled,
    admins,
    users,
  }
}

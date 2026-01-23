/**
 * Application event logging for CMMC Level 1 compliance
 * Provides append-only event logging for audit trail
 * Note: This is application event logging, not SIEM or immutable audit trail
 */

import { prisma } from "./prisma"
import { headers } from "next/headers"

/**
 * Normalize username - extract first name if that's the username format
 * If name is "John Doe", returns "John"
 * If name is just "John", returns "John"
 * If name is null/undefined, returns null
 */
function normalizeUsername(name: string | null | undefined): string | null {
  if (!name) return null
  // If name contains a space, extract first name
  const parts = name.trim().split(/\s+/)
  return parts[0] || null
}

export type ActionType =
  | "login"
  | "login_failed"
  | "logout"
  | "user_create"
  | "user_update"
  | "user_disable"
  | "user_enable"
  | "role_change"
  | "password_change"
  | "file_upload"
  | "file_download"
  | "file_delete"
  | "admin_action"
  | "permission_denied"
  | "security_acknowledgment"
  | "public_content_approve"
  | "public_content_reject"
  | "physical_access_log_created"
  | "export_physical_access_logs"
  | "endpoint_inventory_created"
  | "endpoint_inventory_updated"
  | "export_endpoint_inventory"
  | "config_changed"
  | "cui_spill_detected"

export type TargetType =
  | "user"
  | "file"
  | "contract"
  | "system"
  | "content"
  | "endpoint_inventory"
  | "physical_access_log"

export interface EventFilters {
  startDate?: Date
  endDate?: Date
  actionType?: ActionType
  actorUserId?: string
  targetType?: TargetType
  targetId?: string
  success?: boolean
  limit?: number
  offset?: number
}

/**
 * Get client IP and user agent from request headers
 */
async function getRequestMetadata() {
  try {
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] || 
               headersList.get("x-real-ip") || 
               "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"
    return { ip, userAgent }
  } catch {
    return { ip: "unknown", userAgent: "unknown" }
  }
}

/**
 * Log a generic application event with detailed "who did what to whom" information
 */
export async function logEvent(
  actionType: ActionType,
  actorUserId: string | null,
  actorEmail: string | null,
  success: boolean = true,
  targetType?: TargetType,
  targetId?: string,
  details?: Record<string, any>
) {
  try {
    const { ip, userAgent } = await getRequestMetadata()
    
    // Fetch actor information if userId is provided
    let actorName: string | null = null
    let actorNormalizedName: string | null = null
    if (actorUserId) {
      try {
        const actor = await prisma.user.findUnique({
          where: { id: actorUserId },
          select: { name: true, email: true, role: true },
        })
        if (actor) {
          actorName = actor.name || null
          actorNormalizedName = normalizeUsername(actor.name)
        }
      } catch (error) {
        // If user lookup fails, continue without name
        console.error("Failed to fetch actor name for logging:", error)
      }
    }
    
    // Fetch target information if targetId and targetType are provided
    let targetName: string | null = null
    let targetNormalizedName: string | null = null
    if (targetId && targetType === "user") {
      try {
        const target = await prisma.user.findUnique({
          where: { id: targetId },
          select: { name: true, email: true, role: true },
        })
        if (target) {
          targetName = target.name || null
          targetNormalizedName = normalizeUsername(target.name)
        }
      } catch (error) {
        // If target lookup fails, continue without name
        console.error("Failed to fetch target name for logging:", error)
      }
    }
    
    // Build comprehensive details object with "who did what to whom"
    const enhancedDetails: Record<string, any> = {
      ...(details || {}),
      who: {
        userId: actorUserId,
        userEmail: actorEmail,
        userName: actorName,
        normalizedUserName: actorNormalizedName, // First name if that's the username
        ...(details?.who || {}),
      },
      what: actionType.replace(/_/g, " "),
      ...(targetId && targetType ? {
        toWhom: {
          targetType,
          targetId,
          targetName,
          normalizedTargetName: targetNormalizedName,
          ...(details?.toWhom || {}),
        },
      } : {}),
      timestamp: new Date().toISOString(),
      ipAddress: ip,
      userAgent,
      success,
    }
    
    await prisma.appEvent.create({
      data: {
        actionType,
        actorUserId: actorUserId || null,
        actorEmail: actorEmail || null,
        targetType: targetType || null,
        targetId: targetId || null,
        ip,
        userAgent,
        success,
        details: JSON.stringify(enhancedDetails),
      },
    })
  } catch (error) {
    // Log to console if database write fails (don't break application)
    console.error("Failed to log event:", error)
  }
}

/**
 * Log login attempt (success or failure) with detailed user information
 */
export async function logLogin(
  userId: string | null,
  email: string,
  success: boolean,
  ip?: string,
  userAgent?: string
) {
  try {
    const metadata = ip && userAgent 
      ? { ip, userAgent }
      : await getRequestMetadata()
    
    // Fetch user information if userId is provided
    let userName: string | null = null
    let normalizedUserName: string | null = null
    let userRole: string | null = null
    if (userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, role: true },
        })
        if (user) {
          userName = user.name || null
          normalizedUserName = normalizeUsername(user.name)
          userRole = user.role || null
        }
      } catch (error) {
        console.error("Failed to fetch user name for login log:", error)
      }
    }
    
    const details: Record<string, any> = {
      who: {
        userId: userId,
        userEmail: email,
        userName: userName,
        normalizedUserName: normalizedUserName, // First name if that's the username
        userRole: userRole,
      },
      what: success ? "login" : "login_failed",
      timestamp: new Date().toISOString(),
      ipAddress: metadata.ip,
      userAgent: metadata.userAgent,
      success,
      ...(success ? {} : { reason: "Invalid credentials" }),
    }
    
    await prisma.appEvent.create({
      data: {
        actionType: success ? "login" : "login_failed",
        actorUserId: userId,
        actorEmail: email,
        ip: metadata.ip,
        userAgent: metadata.userAgent,
        success,
        details: JSON.stringify(details),
      },
    })
  } catch (error) {
    console.error("Failed to log login event:", error)
  }
}

/**
 * Log logout event with comprehensive details and normalized username
 */
export async function logLogout(
  userId: string,
  email: string,
  name: string | null,
  role: string,
  ip?: string,
  userAgent?: string
) {
  try {
    const metadata = ip && userAgent 
      ? { ip, userAgent }
      : await getRequestMetadata()
    
    const normalizedUserName = normalizeUsername(name)
    
    await prisma.appEvent.create({
      data: {
        actionType: "logout",
        actorUserId: userId,
        actorEmail: email,
        targetType: "user",
        targetId: userId,
        ip: metadata.ip,
        userAgent: metadata.userAgent,
        success: true,
        details: JSON.stringify({
          who: {
            userId,
            userEmail: email,
            userName: name,
            normalizedUserName: normalizedUserName, // First name if that's the username
            userRole: role,
          },
          what: "User logout",
          timestamp: new Date().toISOString(),
          ipAddress: metadata.ip,
          userAgent: metadata.userAgent,
          impact: {
            type: "session_termination",
            affectedUser: userId,
            affectedUserEmail: email,
          },
        }),
      },
    })
  } catch (error) {
    console.error("Failed to log logout event:", error)
  }
}

/**
 * Log admin action with detailed "who did what to whom" information
 */
export async function logAdminAction(
  userId: string,
  email: string,
  action: string,
  target?: { type: TargetType; id: string },
  details?: Record<string, any>
) {
  // Fetch admin information for detailed logging
  let adminName: string | null = null
  let adminNormalizedName: string | null = null
  let adminRole: string | null = null
  try {
    const admin = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, role: true },
    })
    if (admin) {
      adminName = admin.name || null
      adminNormalizedName = normalizeUsername(admin.name)
      adminRole = admin.role || null
    }
  } catch (error) {
    console.error("Failed to fetch admin name for logging:", error)
  }
  
  // Fetch target information if provided
  let targetName: string | null = null
  let targetNormalizedName: string | null = null
  if (target?.id && target?.type === "user") {
    try {
      const targetUser = await prisma.user.findUnique({
        where: { id: target.id },
        select: { name: true, email: true, role: true },
      })
      if (targetUser) {
        targetName = targetUser.name || null
        targetNormalizedName = normalizeUsername(targetUser.name)
      }
    } catch (error) {
      console.error("Failed to fetch target name for logging:", error)
    }
  }
  
  const enhancedDetails: Record<string, any> = {
    action,
    who: {
      adminId: userId,
      adminEmail: email,
      adminName: adminName,
      normalizedAdminName: adminNormalizedName, // First name if that's the username
      adminRole: adminRole || "ADMIN",
      ...(details?.who || {}),
    },
    what: `Admin ${action.replace(/_/g, " ")}`,
    ...(target ? {
      toWhom: {
        targetType: target.type,
        targetId: target.id,
        targetName: targetName,
        normalizedTargetName: targetNormalizedName,
        ...(details?.toWhom || details?.targetUser || {}),
      },
    } : {}),
    ...(details || {}),
  }
  
  await logEvent(
    "admin_action",
    userId,
    email,
    true,
    target?.type,
    target?.id,
    enhancedDetails
  )
}

/**
 * Log file upload with detailed file information
 */
export async function logFileUpload(
  userId: string,
  email: string,
  fileId: string,
  filename: string,
  size: number,
  success: boolean,
  error?: string,
  mimeType?: string
) {
  // Fetch file information from database if available
  let fileInfo: any = {}
  try {
    const file = await prisma.storedFile.findUnique({
      where: { id: fileId },
      include: {
        uploader: {
          select: { name: true, email: true },
        },
      },
    })
    if (file) {
      fileInfo = {
        fileId: file.id,
        filename: file.filename,
        mimeType: file.mimeType,
        size: file.size,
        uploadedAt: file.uploadedAt.toISOString(),
        uploadedBy: {
          userId: file.userId,
          userEmail: file.uploader.email,
          userName: file.uploader.name,
          normalizedUserName: normalizeUsername(file.uploader.name),
        },
      }
    }
  } catch (error) {
    // If file lookup fails, use provided information
    console.error("Failed to fetch file info for upload log:", error)
    fileInfo = {
      fileId,
      filename,
      size,
      mimeType: mimeType || "unknown",
    }
  }
  
  await logEvent(
    "file_upload",
    userId,
    email,
    success,
    "file",
    fileId,
    {
      what: "File upload",
      file: fileInfo,
      error: error || undefined,
    }
  )
}

/**
 * Log file download with detailed file information
 * This ensures the specific file downloaded is clearly mentioned in the audit log
 */
export async function logFileDownload(
  userId: string,
  email: string,
  fileId: string,
  filename: string
) {
  // Fetch detailed file information from database
  let fileInfo: any = {
    fileId,
    filename,
  }
  
  try {
    const file = await prisma.storedFile.findUnique({
      where: { id: fileId },
      include: {
        uploader: {
          select: { name: true, email: true },
        },
      },
    })
    
    if (file) {
      fileInfo = {
        fileId: file.id,
        filename: file.filename,
        mimeType: file.mimeType,
        size: file.size,
        uploadedAt: file.uploadedAt.toISOString(),
        uploadedBy: {
          userId: file.userId,
          userEmail: file.uploader.email,
          userName: file.uploader.name,
          normalizedUserName: normalizeUsername(file.uploader.name),
        },
      }
    }
  } catch (error) {
    // If file lookup fails, use provided information
    console.error("Failed to fetch file info for download log:", error)
  }
  
  await logEvent(
    "file_download",
    userId,
    email,
    true,
    "file",
    fileId,
    {
      what: "File download",
      file: fileInfo,
      // Clear message: "User [name] downloaded file [filename]"
      message: `Downloaded file: ${fileInfo.filename} (ID: ${fileInfo.fileId}, Size: ${fileInfo.size || 'unknown'} bytes, Type: ${fileInfo.mimeType || 'unknown'})`,
    }
  )
}

/**
 * Query events with filters
 */
export async function getEvents(filters: EventFilters = {}) {
  const {
    startDate,
    endDate,
    actionType,
    actorUserId,
    targetType,
    targetId,
    success,
    limit = 100,
    offset = 0,
  } = filters

  const where: any = {}

  if (startDate || endDate) {
    where.timestamp = {}
    if (startDate) where.timestamp.gte = startDate
    if (endDate) where.timestamp.lte = endDate
  }

  if (actionType) where.actionType = actionType
  if (actorUserId) where.actorUserId = actorUserId
  if (targetType) where.targetType = targetType
  if (targetId) where.targetId = targetId
  if (success !== undefined) where.success = success

  const [events, total] = await Promise.all([
    prisma.appEvent.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: limit,
      skip: offset,
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    }),
    prisma.appEvent.count({ where }),
  ])

  return {
    events,
    total,
    limit,
    offset,
  }
}

/**
 * Export events to CSV format with metadata headers
 */
export async function exportEventsCSV(
  filters: EventFilters = {},
  metadata?: { exportedBy?: string; exportedByEmail?: string }
): Promise<string> {
  const { events } = await getEvents({ ...filters, limit: 10000 })

  // Metadata headers
  const metadataLines = [
    "# Evidence Export",
    `# Generated: ${new Date().toISOString()}`,
    "# System: MacTech Solutions Application",
    metadata?.exportedByEmail ? `# Exported By: ${metadata.exportedByEmail}` : "# Exported By: [System]",
    "# Export Type: Audit Log",
    "",
  ]

  // CSV header
  const headers = [
    "Timestamp",
    "Action Type",
    "Actor Email",
    "Target Type",
    "Target ID",
    "IP Address",
    "Success",
    "Details",
  ]

  // CSV rows
  const rows = events.map((event) => [
    event.timestamp.toISOString(),
    event.actionType,
    event.actorEmail || "",
    event.targetType || "",
    event.targetId || "",
    event.ip || "",
    event.success ? "true" : "false",
    event.details || "",
  ])

  // Combine metadata, header and rows
  const csv = [
    ...metadataLines,
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n")

  return csv
}

/**
 * Clean up old events (retention: 90 days minimum)
 * This should be run periodically (e.g., via cron job)
 */
export async function cleanupOldEvents(retentionDays: number = 90) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  const result = await prisma.appEvent.deleteMany({
    where: {
      timestamp: {
        lt: cutoffDate,
      },
    },
  })

  return result.count
}

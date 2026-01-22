/**
 * Application event logging for CMMC Level 1 compliance
 * Provides append-only event logging for audit trail
 * Note: This is application event logging, not SIEM or immutable audit trail
 */

import { prisma } from "./prisma"
import { headers } from "next/headers"

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
 * Log a generic application event
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
        details: details ? JSON.stringify(details) : null,
      },
    })
  } catch (error) {
    // Log to console if database write fails (don't break application)
    console.error("Failed to log event:", error)
  }
}

/**
 * Log login attempt (success or failure)
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
    
    await prisma.appEvent.create({
      data: {
        actionType: success ? "login" : "login_failed",
        actorUserId: userId,
        actorEmail: email,
        ip: metadata.ip,
        userAgent: metadata.userAgent,
        success,
        details: success ? null : JSON.stringify({ reason: "Invalid credentials" }),
      },
    })
  } catch (error) {
    console.error("Failed to log login event:", error)
  }
}

/**
 * Log admin action
 */
export async function logAdminAction(
  userId: string,
  email: string,
  action: string,
  target?: { type: TargetType; id: string },
  details?: Record<string, any>
) {
  await logEvent(
    "admin_action",
    userId,
    email,
    true,
    target?.type,
    target?.id,
    { action, ...details }
  )
}

/**
 * Log file upload
 */
export async function logFileUpload(
  userId: string,
  email: string,
  fileId: string,
  filename: string,
  size: number,
  success: boolean,
  error?: string
) {
  await logEvent(
    "file_upload",
    userId,
    email,
    success,
    "file",
    fileId,
    {
      filename,
      size,
      error: error || undefined,
    }
  )
}

/**
 * Log file download
 */
export async function logFileDownload(
  userId: string,
  email: string,
  fileId: string,
  filename: string
) {
  await logEvent(
    "file_download",
    userId,
    email,
    true,
    "file",
    fileId,
    { filename }
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

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
  | "mfa_enrollment_initiated"
  | "mfa_enrollment_completed"
  | "mfa_enrollment_failed"
  | "session_locked"
  | "mfa_verification_success"
  | "mfa_verification_failed"
  | "mfa_backup_code_used"
  | "account_locked"
  | "account_unlocked"
  | "cui_file_access"
  | "cui_file_access_denied"
  | "cui_file_delete"

export type TargetType =
  | "user"
  | "file"
  | "contract"
  | "system"
  | "content"
  | "endpoint_inventory"
  | "physical_access_log"
  | "poam"
  | "cui_file"
  | "sctm_control"

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

  // Enrich events with POAM IDs when targetType is "poam"
  const enrichedEvents = await Promise.all(
    events.map(async (event) => {
      if (event.targetType === "poam" && event.targetId) {
        try {
          const poam = await prisma.pOAMItem.findUnique({
            where: { id: event.targetId },
            select: { poamId: true },
          })
          return {
            ...event,
            poamId: poam?.poamId || null,
          }
        } catch (error) {
          // If POAM lookup fails, continue without poamId
          return event
        }
      }
      return event
    })
  )

  return {
    events: enrichedEvents,
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

/**
 * Correlate events by user, IP address, or action pattern
 * Per NIST SP 800-171 Rev. 2, Section 3.3.7
 */
export interface CorrelationOptions {
  userId?: string
  ipAddress?: string
  actionType?: ActionType
  timeWindow?: number // minutes
  pattern?: string // Pattern to match in details
}

export async function correlateEvents(options: CorrelationOptions) {
  const {
    userId,
    ipAddress,
    actionType,
    timeWindow = 60, // Default 60 minutes
    pattern,
  } = options

  const cutoffTime = new Date()
  cutoffTime.setMinutes(cutoffTime.getMinutes() - timeWindow)

  const where: any = {
    timestamp: {
      gte: cutoffTime,
    },
  }

  if (userId) where.actorUserId = userId
  if (ipAddress) where.ip = ipAddress
  if (actionType) where.actionType = actionType

  const events = await prisma.appEvent.findMany({
    where,
    orderBy: { timestamp: "desc" },
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
  })

  // Filter by pattern if provided
  let filteredEvents = events
  if (pattern) {
    filteredEvents = events.filter((event) => {
      if (!event.details) return false
      try {
        const details = JSON.parse(event.details)
        const detailsStr = JSON.stringify(details).toLowerCase()
        return detailsStr.includes(pattern.toLowerCase())
      } catch {
        return false
      }
    })
  }

  return {
    events: filteredEvents,
    count: filteredEvents.length,
    timeWindow,
    correlationCriteria: options,
  }
}

/**
 * Detect suspicious patterns in audit logs
 * Per NIST SP 800-171 Rev. 2, Section 3.3.7
 */
export interface SuspiciousPattern {
  type: "multiple_failed_logins" | "rapid_actions" | "unusual_ip" | "privilege_escalation"
  description: string
  events: any[]
  severity: "low" | "medium" | "high"
}

export async function detectSuspiciousPatterns(
  timeWindow: number = 60
): Promise<SuspiciousPattern[]> {
  const cutoffTime = new Date()
  cutoffTime.setMinutes(cutoffTime.getMinutes() - timeWindow)

  const patterns: SuspiciousPattern[] = []

  // Pattern 1: Multiple failed logins from same IP
  const failedLogins = await prisma.appEvent.groupBy({
    by: ["ip", "actorEmail"],
    where: {
      actionType: "login_failed",
      timestamp: { gte: cutoffTime },
    },
    _count: {
      id: true,
    },
    having: {
      id: {
        _count: {
          gt: 5, // More than 5 failed logins
        },
      },
    },
  })

  for (const group of failedLogins) {
    const events = await prisma.appEvent.findMany({
      where: {
        actionType: "login_failed",
        ip: group.ip,
        actorEmail: group.actorEmail,
        timestamp: { gte: cutoffTime },
      },
      orderBy: { timestamp: "desc" },
      take: 10,
    })

    patterns.push({
      type: "multiple_failed_logins",
      description: `Multiple failed login attempts (${group._count.id}) from IP ${group.ip}`,
      events,
      severity: "high",
    })
  }

  // Pattern 2: Rapid actions from same user
  const rapidActions = await prisma.appEvent.groupBy({
    by: ["actorUserId"],
    where: {
      timestamp: { gte: cutoffTime },
      success: true,
    },
    _count: {
      id: true,
    },
    having: {
      id: {
        _count: {
          gt: 50, // More than 50 actions in time window
        },
      },
    },
  })

  for (const group of rapidActions) {
    if (!group.actorUserId) continue

    const events = await prisma.appEvent.findMany({
      where: {
        actorUserId: group.actorUserId,
        timestamp: { gte: cutoffTime },
      },
      orderBy: { timestamp: "desc" },
      take: 20,
    })

    patterns.push({
      type: "rapid_actions",
      description: `Rapid actions (${group._count.id}) by user in ${timeWindow} minutes`,
      events,
      severity: "medium",
    })
  }

  // Pattern 3: Account lockout events
  const lockoutEvents = await prisma.appEvent.findMany({
    where: {
      actionType: "account_locked",
      timestamp: { gte: cutoffTime },
    },
    orderBy: { timestamp: "desc" },
  })

  if (lockoutEvents.length > 0) {
    patterns.push({
      type: "multiple_failed_logins",
      description: `${lockoutEvents.length} account lockout(s) detected`,
      events: lockoutEvents,
      severity: "high",
    })
  }

  return patterns
}

/**
 * Generate failure alerts for critical events
 * Per NIST SP 800-171 Rev. 2, Section 3.3.4
 */
export interface FailureAlert {
  id: string
  type: "critical" | "warning" | "info"
  message: string
  eventId: string
  timestamp: Date
  actionRequired: boolean
}

export async function generateFailureAlerts(
  timeWindow: number = 15 // minutes
): Promise<FailureAlert[]> {
  const cutoffTime = new Date()
  cutoffTime.setMinutes(cutoffTime.getMinutes() - timeWindow)

  const alerts: FailureAlert[] = []

  // Critical: Multiple account lockouts
  const lockouts = await prisma.appEvent.findMany({
    where: {
      actionType: "account_locked",
      timestamp: { gte: cutoffTime },
    },
  })

  for (const event of lockouts) {
    alerts.push({
      id: `alert-${event.id}`,
      type: "critical",
      message: `Account locked: ${event.actorEmail || "Unknown user"}`,
      eventId: event.id,
      timestamp: event.timestamp,
      actionRequired: true,
    })
  }

  // Warning: Multiple failed MFA verifications
  const failedMFA = await prisma.appEvent.findMany({
    where: {
      actionType: "mfa_verification_failed",
      timestamp: { gte: cutoffTime },
    },
  })

  if (failedMFA.length >= 3) {
    alerts.push({
      id: `alert-mfa-${Date.now()}`,
      type: "warning",
      message: `${failedMFA.length} failed MFA verification attempts detected`,
      eventId: failedMFA[0].id,
      timestamp: new Date(),
      actionRequired: true,
    })
  }

  // Warning: Audit log failures (if we had them)
  const auditFailures = await prisma.appEvent.findMany({
    where: {
      actionType: "config_changed", // Placeholder - would be audit_failure if we track it
      success: false,
      timestamp: { gte: cutoffTime },
    },
    take: 1,
  })

  // Info: High volume of events
  const eventCount = await prisma.appEvent.count({
    where: {
      timestamp: { gte: cutoffTime },
    },
  })

  if (eventCount > 1000) {
    alerts.push({
      id: `alert-volume-${Date.now()}`,
      type: "info",
      message: `High volume of events: ${eventCount} in ${timeWindow} minutes`,
      eventId: "",
      timestamp: new Date(),
      actionRequired: false,
    })
  }

  return alerts
}

/**
 * Get audit log statistics for review
 * Per NIST SP 800-171 Rev. 2, Section 3.3.2
 */
export async function getAuditLogStatistics(timeWindow: number = 24) {
  const cutoffTime = new Date()
  cutoffTime.setHours(cutoffTime.getHours() - timeWindow)

  const [
    totalEvents,
    failedLogins,
    successfulLogins,
    adminActions,
    mfaEvents,
    lockoutEvents,
  ] = await Promise.all([
    prisma.appEvent.count({
      where: { timestamp: { gte: cutoffTime } },
    }),
    prisma.appEvent.count({
      where: {
        actionType: "login_failed",
        timestamp: { gte: cutoffTime },
      },
    }),
    prisma.appEvent.count({
      where: {
        actionType: "login",
        success: true,
        timestamp: { gte: cutoffTime },
      },
    }),
    prisma.appEvent.count({
      where: {
        actionType: "admin_action",
        timestamp: { gte: cutoffTime },
      },
    }),
    prisma.appEvent.count({
      where: {
        actionType: { in: ["mfa_verification_success", "mfa_verification_failed", "mfa_enrollment_completed"] },
        timestamp: { gte: cutoffTime },
      },
    }),
    prisma.appEvent.count({
      where: {
        actionType: "account_locked",
        timestamp: { gte: cutoffTime },
      },
    }),
  ])

  return {
    timeWindow,
    totalEvents,
    failedLogins,
    successfulLogins,
    adminActions,
    mfaEvents,
    lockoutEvents,
    successRate: totalEvents > 0 ? (successfulLogins / totalEvents) * 100 : 0,
  }
}

/**
 * Verify audit log retention compliance
 * Per NIST SP 800-171 Rev. 2, Section 3.3.1
 * Verifies that audit logs are retained for minimum 90 days
 */
export async function verifyAuditLogRetention(minimumRetentionDays: number = 90) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - minimumRetentionDays)

  // Count events older than retention period
  const eventsInRetentionPeriod = await prisma.appEvent.count({
    where: {
      timestamp: { gte: cutoffDate },
    },
  })

  // Get oldest event to verify retention
  const oldestEvent = await prisma.appEvent.findFirst({
    orderBy: {
      timestamp: 'asc',
    },
  })

  // Get newest event
  const newestEvent = await prisma.appEvent.findFirst({
    orderBy: {
      timestamp: 'desc',
    },
  })

  // Calculate actual retention period
  const actualRetentionDays = oldestEvent
    ? Math.floor((new Date().getTime() - oldestEvent.timestamp.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Verify compliance
  const isCompliant = actualRetentionDays >= minimumRetentionDays || !oldestEvent

  return {
    minimumRetentionDays,
    actualRetentionDays,
    isCompliant,
    oldestEventDate: oldestEvent?.timestamp || null,
    newestEventDate: newestEvent?.timestamp || null,
    eventsInRetentionPeriod,
    totalEvents: await prisma.appEvent.count(),
    verificationDate: new Date(),
  }
}

/**
 * Detect unauthorized use of organizational systems
 * Per NIST SP 800-171 Rev. 2, Section 3.14.7
 * Identifies patterns indicating unauthorized access attempts
 */
export async function detectUnauthorizedUse(
  timeWindow: number = 60 // minutes
): Promise<FailureAlert[]> {
  const cutoffTime = new Date()
  cutoffTime.setMinutes(cutoffTime.getMinutes() - timeWindow)

  const alerts: FailureAlert[] = []

  // Detect multiple failed login attempts from same IP/user
  const failedLogins = await prisma.appEvent.findMany({
    where: {
      actionType: "login_failed",
      timestamp: { gte: cutoffTime },
    },
    orderBy: {
      timestamp: 'desc',
    },
  })

  // Group by actor email to detect brute force attempts
  const loginAttemptsByUser = new Map<string, number>()
  for (const event of failedLogins) {
    const email = event.actorEmail || 'unknown'
    loginAttemptsByUser.set(email, (loginAttemptsByUser.get(email) || 0) + 1)
  }

  // Alert on excessive failed attempts
  for (const [email, count] of loginAttemptsByUser.entries()) {
    if (count >= 5) {
      alerts.push({
        id: `unauthorized-${email}-${Date.now()}`,
        type: "critical",
        message: `Unauthorized use detected: ${count} failed login attempts for ${email}`,
        eventId: failedLogins.find(e => e.actorEmail === email)?.id || '',
        timestamp: new Date(),
        actionRequired: true,
      })
    }
  }

  // Detect permission denied events (unauthorized access attempts)
  const permissionDenied = await prisma.appEvent.findMany({
    where: {
      actionType: "permission_denied",
      timestamp: { gte: cutoffTime },
    },
  })

  if (permissionDenied.length >= 3) {
    alerts.push({
      id: `unauthorized-access-${Date.now()}`,
      type: "warning",
      message: `Unauthorized access attempts detected: ${permissionDenied.length} permission denied events`,
      eventId: permissionDenied[0].id,
      timestamp: new Date(),
      actionRequired: true,
    })
  }

  // Detect unusual access patterns (admin actions from non-admin users)
  const suspiciousAdminActions = await prisma.appEvent.findMany({
    where: {
      actionType: "admin_action",
      success: false,
      timestamp: { gte: cutoffTime },
    },
  })

  if (suspiciousAdminActions.length > 0) {
    alerts.push({
      id: `suspicious-admin-${Date.now()}`,
      type: "critical",
      message: `Suspicious admin action attempts detected: ${suspiciousAdminActions.length} failed admin actions`,
      eventId: suspiciousAdminActions[0].id,
      timestamp: new Date(),
      actionRequired: true,
    })
  }

  // Detect CUI spillage (unauthorized CUI handling)
  const cuiSpills = await prisma.appEvent.findMany({
    where: {
      actionType: "cui_spill_detected",
      timestamp: { gte: cutoffTime },
    },
  })

  if (cuiSpills.length > 0) {
    alerts.push({
      id: `cui-spill-${Date.now()}`,
      type: "critical",
      message: `CUI spillage detected: ${cuiSpills.length} CUI spill events`,
      eventId: cuiSpills[0].id,
      timestamp: new Date(),
      actionRequired: true,
    })
  }

  return alerts
}

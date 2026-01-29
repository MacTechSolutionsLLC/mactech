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
  | "cui_file_delete_failed"
  | "user_attestation"
  | "maintenance_tool_access"
  | "maintenance_tool_operation"
  | "system_cron_job"

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
    const requestId = headersList.get("x-request-id") || 
                     headersList.get("x-correlation-id") ||
                     `req-${Date.now()}-${Math.random().toString(36).substring(7)}`
    return { ip, userAgent, requestId }
  } catch {
    return { ip: "unknown", userAgent: "unknown", requestId: `req-${Date.now()}-${Math.random().toString(36).substring(7)}` }
  }
}

/**
 * Generate a request correlation ID
 */
function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substring(7)}`
}

/**
 * Extract device/browser information from user agent
 */
function parseUserAgent(userAgent: string): { device?: string; browser?: string; os?: string } {
  if (!userAgent || userAgent === "unknown") return {}
  
  const info: { device?: string; browser?: string; os?: string } = {}
  
  // Extract OS
  if (userAgent.includes("Windows")) info.os = "Windows"
  else if (userAgent.includes("Mac OS")) info.os = "macOS"
  else if (userAgent.includes("Linux")) info.os = "Linux"
  else if (userAgent.includes("Android")) info.os = "Android"
  else if (userAgent.includes("iOS")) info.os = "iOS"
  
  // Extract Browser
  if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) info.browser = "Chrome"
  else if (userAgent.includes("Firefox")) info.browser = "Firefox"
  else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) info.browser = "Safari"
  else if (userAgent.includes("Edg")) info.browser = "Edge"
  
  // Extract Device type
  if (userAgent.includes("Mobile")) info.device = "Mobile"
  else if (userAgent.includes("Tablet")) info.device = "Tablet"
  else info.device = "Desktop"
  
  return info
}

/**
 * Enrich target information based on target type
 */
async function enrichTarget(targetType: TargetType | undefined, targetId: string | undefined): Promise<Record<string, any> | null> {
  if (!targetType || !targetId) return null
  
  try {
    switch (targetType) {
      case "user": {
        const user = await prisma.user.findUnique({
          where: { id: targetId },
          select: { name: true, email: true, role: true },
        })
        if (user) {
          return {
            targetType,
            targetId,
            targetName: user.name,
            targetEmail: user.email,
            targetRole: user.role,
            normalizedTargetName: normalizeUsername(user.name),
          }
        }
        break
      }
      case "file": {
        const file = await prisma.storedFile.findUnique({
          where: { id: targetId },
          include: {
            uploader: {
              select: { name: true, email: true },
            },
          },
        })
        if (file) {
          return {
            targetType,
            targetId,
            filename: file.filename,
            fileSize: file.size,
            mimeType: file.mimeType,
            isFCI: file.isFCI,
            uploadedAt: file.uploadedAt.toISOString(),
            uploadedBy: {
              userId: file.userId,
              userEmail: file.uploader.email,
              userName: file.uploader.name,
            },
          }
        }
        break
      }
      case "cui_file": {
        const cuiFile = await prisma.storedCUIFile.findUnique({
          where: { id: targetId },
          include: {
            uploader: {
              select: { name: true, email: true },
            },
          },
        })
        if (cuiFile) {
          return {
            targetType,
            targetId,
            vaultId: cuiFile.vaultId ?? null,
            fileSize: cuiFile.size,
            mimeType: cuiFile.mimeType,
            isCUI: true,
            filenameRedacted: cuiFile.vaultId ? `CUI-${cuiFile.vaultId}` : `CUI-${targetId}`,
            uploadedAt: cuiFile.uploadedAt.toISOString(),
            uploadedBy: {
              userId: cuiFile.userId,
              userEmail: cuiFile.uploader.email,
              userName: cuiFile.uploader.name,
            },
          }
        }
        break
      }
      case "contract": {
        const contract = await prisma.contract.findUnique({
          where: { id: targetId },
          select: { title: true, type: true, status: true },
        })
        if (contract) {
          return {
            targetType,
            targetId,
            contractTitle: contract.title,
            contractType: contract.type,
            contractStatus: contract.status,
          }
        }
        break
      }
      case "poam": {
        const poam = await prisma.pOAMItem.findUnique({
          where: { id: targetId },
          select: { poamId: true, title: true, status: true, controlId: true },
        })
        if (poam) {
          return {
            targetType,
            targetId,
            poamId: poam.poamId,
            poamTitle: poam.title,
            poamStatus: poam.status,
            controlId: poam.controlId,
          }
        }
        break
      }
      default:
        return {
          targetType,
          targetId,
        }
    }
  } catch (error) {
    console.error(`Failed to enrich target ${targetType}:${targetId}:`, error)
    return {
      targetType,
      targetId,
      enrichmentError: "Failed to fetch target details",
    }
  }
  
  return null
}

/**
 * Determine if an action requires privileged access
 */
function isPrivilegedAction(actionType: ActionType): boolean {
  const privilegedActions: ActionType[] = [
    "admin_action",
    "user_create",
    "user_update",
    "user_disable",
    "user_enable",
    "role_change",
    "export_physical_access_logs",
    "export_endpoint_inventory",
    "config_changed",
    "maintenance_tool_access",
    "maintenance_tool_operation",
  ]
  return privilegedActions.includes(actionType)
}

/**
 * Determine if an action requires MFA
 */
function requiresMFA(actionType: ActionType): boolean {
  const mfaRequiredActions: ActionType[] = [
    "admin_action",
    "user_create",
    "user_update",
    "user_disable",
    "user_enable",
    "role_change",
    "password_change",
    "export_physical_access_logs",
    "export_endpoint_inventory",
    "config_changed",
  ]
  return mfaRequiredActions.includes(actionType)
}

/**
 * Log a generic application event with detailed "who did what to whom" information
 * Enhanced with security context, target enrichment, and standardized structure
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
    const { ip, userAgent, requestId } = await getRequestMetadata()
    const deviceInfo = parseUserAgent(userAgent)
    const privilegedAction = isPrivilegedAction(actionType)
    const mfaRequired = requiresMFA(actionType)
    
    // Fetch actor information if userId is provided
    let actorName: string | null = null
    let actorNormalizedName: string | null = null
    let actorRole: string | null = null
    if (actorUserId) {
      try {
        const actor = await prisma.user.findUnique({
          where: { id: actorUserId },
          select: { name: true, email: true, role: true },
        })
        if (actor) {
          actorName = actor.name || null
          actorNormalizedName = normalizeUsername(actor.name)
          actorRole = actor.role || null
        }
      } catch (error) {
        // If user lookup fails, continue without name
        console.error("Failed to fetch actor name for logging:", error)
      }
    }
    
    // Enrich target information for all target types
    const enrichedTarget = await enrichTarget(targetType, targetId)
    
    // Extract session ID and MFA status from provided details if available
    const sessionId = details?.sessionId || details?.who?.sessionId || null
    const mfaVerified = details?.mfaVerified !== undefined ? details.mfaVerified : 
                       (details?.security?.mfaVerified !== undefined ? details.security.mfaVerified : null)
    
    // Build standardized details object with "who did what to whom"
    const enhancedDetails: Record<string, any> = {
      // Preserve any existing context from details parameter
      ...(details?.context || {}),
      // Who: Actor information
      who: {
        userId: actorUserId,
        userEmail: actorEmail,
        userName: actorName,
        normalizedUserName: actorNormalizedName,
        userRole: actorRole || details?.who?.userRole || details?.who?.adminRole || null, // Always include role
        sessionId: sessionId,
        mfaVerified: mfaVerified,
        ...(details?.who || {}),
      },
      // What: Explicit action description
      what: details?.what || actionType.replace(/_/g, " "),
      // ToWhom: Target information (enriched)
      ...(enrichedTarget ? {
        toWhom: {
          ...enrichedTarget,
          ...(details?.toWhom || {}),
        },
      } : targetId && targetType ? {
        toWhom: {
          targetType,
          targetId,
          ...(details?.toWhom || {}),
        },
      } : {}),
      // Security: Security-relevant metadata
      security: {
        ipAddress: ip,
        userAgent: userAgent,
        requestId: details?.requestId || requestId,
        privilegedAction: privilegedAction,
        mfaRequired: mfaRequired,
        mfaVerified: mfaVerified,
        deviceInfo: deviceInfo,
        ...(details?.security || {}),
      },
      // Context: Additional context (changes, impact, etc.)
      context: {
        ...(details?.context || {}),
        ...(details?.previousState ? { previousState: details.previousState } : {}),
        ...(details?.changes ? { changes: details.changes } : {}),
        ...(details?.impact ? { impact: details.impact } : {}),
      },
      timestamp: new Date().toISOString(),
      success: success,
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
 * Enhanced with session ID tracking and device fingerprinting
 */
export async function logLogin(
  userId: string | null,
  email: string,
  success: boolean,
  ip?: string,
  userAgent?: string,
  sessionId?: string,
  mfaVerified?: boolean
) {
  try {
    const metadata = ip && userAgent 
      ? { ip, userAgent, requestId: generateRequestId() }
      : await getRequestMetadata()
    
    const deviceInfo = parseUserAgent(metadata.userAgent)
    
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
        normalizedUserName: normalizedUserName,
        userRole: userRole,
        sessionId: sessionId || null,
        mfaVerified: mfaVerified !== undefined ? mfaVerified : null,
      },
      what: success ? "login" : "login_failed",
      security: {
        ipAddress: metadata.ip,
        userAgent: metadata.userAgent,
        requestId: metadata.requestId,
        privilegedAction: false,
        mfaRequired: false,
        mfaVerified: mfaVerified !== undefined ? mfaVerified : null,
        deviceInfo: deviceInfo,
      },
      context: {
        ...(success ? {} : { reason: "Invalid credentials" }),
      },
      timestamp: new Date().toISOString(),
      success,
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
 * Enhanced with session ID tracking and device fingerprinting
 */
export async function logLogout(
  userId: string,
  email: string,
  name: string | null,
  role: string,
  ip?: string,
  userAgent?: string,
  sessionId?: string
) {
  try {
    const metadata = ip && userAgent 
      ? { ip, userAgent, requestId: generateRequestId() }
      : await getRequestMetadata()
    
    const normalizedUserName = normalizeUsername(name)
    const deviceInfo = parseUserAgent(metadata.userAgent)
    
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
            normalizedUserName: normalizedUserName,
            userRole: role,
            sessionId: sessionId || null,
          },
          what: "User logout",
          toWhom: {
            targetType: "user",
            targetId: userId,
            targetName: name,
            targetEmail: email,
            targetRole: role,
            normalizedTargetName: normalizedUserName,
          },
          security: {
            ipAddress: metadata.ip,
            userAgent: metadata.userAgent,
            requestId: metadata.requestId,
            privilegedAction: false,
            mfaRequired: false,
            deviceInfo: deviceInfo,
          },
          context: {
            impact: {
              type: "session_termination",
              affectedUser: userId,
              affectedUserEmail: email,
            },
          },
          timestamp: new Date().toISOString(),
          success: true,
        }),
      },
    })
  } catch (error) {
    console.error("Failed to log logout event:", error)
  }
}

/**
 * Log admin action with detailed "who did what to whom" information
 * Enhanced with privilege level and MFA verification status
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
  
  // Extract MFA and session info from details if provided
  const sessionId = details?.sessionId || details?.who?.sessionId || null
  const mfaVerified = details?.mfaVerified !== undefined ? details.mfaVerified :
                     (details?.security?.mfaVerified !== undefined ? details.security.mfaVerified : null)
  
  const enhancedDetails: Record<string, any> = {
    action,
    who: {
      userId: userId,
      adminId: userId, // Keep for backward compatibility
      userEmail: email,
      adminEmail: email, // Keep for backward compatibility
      userName: adminName,
      adminName: adminName, // Keep for backward compatibility
      normalizedUserName: adminNormalizedName,
      normalizedAdminName: adminNormalizedName, // Keep for backward compatibility
      userRole: adminRole || "ADMIN",
      adminRole: adminRole || "ADMIN", // Keep for backward compatibility
      sessionId: sessionId,
      mfaVerified: mfaVerified,
      ...(details?.who || {}),
    },
    what: details?.what || `Admin ${action.replace(/_/g, " ")}`,
    ...(target ? {
      toWhom: {
        ...(details?.toWhom || details?.targetUser || {}),
      },
    } : {}),
    security: {
      privilegedAction: true, // Admin actions are always privileged
      mfaRequired: requiresMFA("admin_action"),
      mfaVerified: mfaVerified,
      ...(details?.security || {}),
    },
    context: {
      ...(details?.context || {}),
      ...(details?.previousState ? { previousState: details.previousState } : {}),
      ...(details?.changes ? { changes: details.changes } : {}),
      ...(details?.impact ? { impact: details.impact } : {}),
    },
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
 * Enhanced with CUI/FCI status and security context
 */
export async function logFileUpload(
  userId: string,
  email: string,
  fileId: string,
  filename: string,
  size: number,
  success: boolean,
  error?: string,
  mimeType?: string,
  isCUI?: boolean,
  isFCI?: boolean,
  sessionId?: string
) {
  // Check both StoredFile and StoredCUIFile tables
  let fileInfo: any = {}
  let cuiFileInfo: any = null
  
  try {
    // First check regular files
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
        isFCI: file.isFCI,
        uploadedAt: file.uploadedAt.toISOString(),
        uploadedBy: {
          userId: file.userId,
          userEmail: file.uploader.email,
          userName: file.uploader.name,
          normalizedUserName: normalizeUsername(file.uploader.name),
        },
      }
    } else {
      // Check CUI files
      const cuiFile = await prisma.storedCUIFile.findUnique({
        where: { id: fileId },
        include: {
          uploader: {
            select: { name: true, email: true },
          },
        },
      })
      
      if (cuiFile) {
        cuiFileInfo = {
          fileId: cuiFile.id,
          vaultId: cuiFile.vaultId ?? null,
          filenameRedacted: cuiFile.vaultId ? `CUI-${cuiFile.vaultId}` : `CUI-${cuiFile.id}`,
          mimeType: cuiFile.mimeType,
          size: cuiFile.size,
          isCUI: true,
          uploadedAt: cuiFile.uploadedAt.toISOString(),
          uploadedBy: {
            userId: cuiFile.userId,
            userEmail: cuiFile.uploader.email,
            userName: cuiFile.uploader.name,
            normalizedUserName: normalizeUsername(cuiFile.uploader.name),
          },
        }
      }
    }
  } catch (error) {
    // If file lookup fails, use provided information
    console.error("Failed to fetch file info for upload log:", error)
  }

  const finalFileInfo = cuiFileInfo || fileInfo || {
    fileId,
    filename,
    size,
    mimeType: mimeType || "unknown",
    isCUI: isCUI !== undefined ? isCUI : null,
    isFCI: isFCI !== undefined ? isFCI : null,
  }

  const toWhomCUI = cuiFileInfo
    ? {
        targetType: "cui_file" as const,
        targetId: fileId,
        fileId: cuiFileInfo.fileId,
        vaultId: cuiFileInfo.vaultId,
        filenameRedacted: cuiFileInfo.filenameRedacted,
        fileSize: finalFileInfo.size,
        mimeType: finalFileInfo.mimeType,
        isCUI: true,
        isFCI: false,
        ...(finalFileInfo.uploadedBy ? { uploadedBy: (finalFileInfo as { uploadedBy?: unknown }).uploadedBy } : {}),
      }
    : {
        targetType: "file" as const,
        targetId: fileId,
        filename: finalFileInfo.filename,
        fileSize: finalFileInfo.size,
        mimeType: finalFileInfo.mimeType,
        isCUI: false,
        isFCI: finalFileInfo.isFCI !== undefined ? finalFileInfo.isFCI : (isFCI || false),
        ...(finalFileInfo.uploadedBy ? { uploadedBy: (finalFileInfo as { uploadedBy?: unknown }).uploadedBy } : {}),
      }

  await logEvent(
    "file_upload",
    userId,
    email,
    success,
    cuiFileInfo ? "cui_file" : "file",
    fileId,
    {
      what: "File upload",
      toWhom: toWhomCUI,
      security: {
        sessionId: sessionId,
      },
      context: {
        ...(error ? { error: error } : {}),
      },
    }
  )
}

/**
 * Log file download with detailed file information
 * Enhanced with CUI/FCI status and security context
 * This ensures the specific file downloaded is clearly mentioned in the audit log
 */
export async function logFileDownload(
  userId: string,
  email: string,
  fileId: string,
  filename: string,
  sessionId?: string
) {
  // Check both StoredFile and StoredCUIFile tables
  let fileInfo: any = {
    fileId,
    filename,
  }
  let isCUI = false
  
  try {
    // First check regular files
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
        isFCI: file.isFCI,
        uploadedAt: file.uploadedAt.toISOString(),
        uploadedBy: {
          userId: file.userId,
          userEmail: file.uploader.email,
          userName: file.uploader.name,
          normalizedUserName: normalizeUsername(file.uploader.name),
        },
      }
    } else {
      // Check CUI files
      const cuiFile = await prisma.storedCUIFile.findUnique({
        where: { id: fileId },
        include: {
          uploader: {
            select: { name: true, email: true },
          },
        },
      })
      
      if (cuiFile) {
        isCUI = true
        fileInfo = {
          fileId: cuiFile.id,
          vaultId: cuiFile.vaultId ?? null,
          filenameRedacted: cuiFile.vaultId ? `CUI-${cuiFile.vaultId}` : `CUI-${cuiFile.id}`,
          mimeType: cuiFile.mimeType,
          size: cuiFile.size,
          isCUI: true,
          uploadedAt: cuiFile.uploadedAt.toISOString(),
          uploadedBy: {
            userId: cuiFile.userId,
            userEmail: cuiFile.uploader.email,
            userName: cuiFile.uploader.name,
            normalizedUserName: normalizeUsername(cuiFile.uploader.name),
          },
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch file info for download log:", error)
  }

  const toWhomDownload = isCUI
    ? {
        targetType: "cui_file" as const,
        targetId: fileId,
        fileId: fileInfo.fileId,
        vaultId: fileInfo.vaultId,
        filenameRedacted: fileInfo.filenameRedacted,
        fileSize: fileInfo.size,
        mimeType: fileInfo.mimeType,
        isCUI: true,
        isFCI: false,
        ...(fileInfo.uploadedBy ? { uploadedBy: fileInfo.uploadedBy } : {}),
      }
    : {
        targetType: "file" as const,
        targetId: fileId,
        filename: fileInfo.filename,
        fileSize: fileInfo.size,
        mimeType: fileInfo.mimeType,
        isCUI: false,
        isFCI: fileInfo.isFCI || false,
        ...(fileInfo.uploadedBy ? { uploadedBy: fileInfo.uploadedBy } : {}),
      }

  await logEvent(
    isCUI ? "cui_file_access" : "file_download",
    userId,
    email,
    true,
    isCUI ? "cui_file" : "file",
    fileId,
    {
      what: isCUI ? "CUI file access" : "File download",
      toWhom: toWhomDownload,
      security: {
        sessionId: sessionId,
      },
      context: isCUI
        ? { message: `CUI file access (ID: ${fileId}, vaultId: ${fileInfo.vaultId ?? 'n/a'})` }
        : { message: `Downloaded file: ${fileInfo.filename} (ID: ${fileInfo.fileId}, Size: ${fileInfo.size || 'unknown'} bytes, Type: ${fileInfo.mimeType || 'unknown'})` },
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

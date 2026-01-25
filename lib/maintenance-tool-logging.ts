/**
 * Maintenance Tool Logging
 * Logs maintenance tool access and operations for compliance with NIST SP 800-171 Rev. 2, Section 3.7.2
 */

import { logEvent } from './audit'

/**
 * Log maintenance tool access
 * @param userId - User ID accessing the tool
 * @param userEmail - User email
 * @param toolName - Name of the maintenance tool
 * @param toolVersion - Version of the tool
 * @param operation - Operation being performed (e.g., "prisma migrate", "railway deploy")
 * @param success - Whether the operation was successful
 * @param details - Additional details about the operation
 */
export async function logMaintenanceToolAccess(
  userId: string | null,
  userEmail: string | null,
  toolName: string,
  toolVersion: string | null,
  operation: string,
  success: boolean = true,
  details?: Record<string, any>
): Promise<void> {
  await logEvent(
    'maintenance_tool_access',
    userId,
    userEmail,
    success,
    'system',
    null,
    {
      toolName,
      toolVersion,
      operation,
      ...details,
    }
  )
}

/**
 * Log maintenance tool operation
 * @param userId - User ID performing the operation
 * @param userEmail - User email
 * @param toolName - Name of the maintenance tool
 * @param toolVersion - Version of the tool
 * @param operation - Operation being performed
 * @param result - Operation result or outcome
 * @param success - Whether the operation was successful
 * @param details - Additional details about the operation
 */
export async function logMaintenanceToolOperation(
  userId: string | null,
  userEmail: string | null,
  toolName: string,
  toolVersion: string | null,
  operation: string,
  result: string,
  success: boolean = true,
  details?: Record<string, any>
): Promise<void> {
  await logEvent(
    'maintenance_tool_operation',
    userId,
    userEmail,
    success,
    'system',
    null,
    {
      toolName,
      toolVersion,
      operation,
      result,
      ...details,
    }
  )
}

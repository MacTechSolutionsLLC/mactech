/**
 * Maintenance Tool Logging for Node.js Scripts
 * Provides maintenance tool logging for Node.js scripts (non-API context)
 * Direct database logging without Next.js API context
 * For use in startup scripts and standalone scripts
 */

import { prisma } from './prisma'

/**
 * Log maintenance tool access (Node.js script compatible)
 * @param toolName - Name of the maintenance tool
 * @param toolVersion - Version of the tool
 * @param operation - Operation being performed
 * @param success - Whether the operation was successful
 * @param details - Additional details about the operation
 */
export async function logMaintenanceToolAccessNode(
  toolName: string,
  toolVersion: string | null,
  operation: string,
  success: boolean = true,
  details?: Record<string, any>
): Promise<void> {
  try {
    await prisma.appEvent.create({
      data: {
        actionType: 'maintenance_tool_access',
        actorUserId: null, // System action
        actorEmail: null,
        targetType: 'system',
        targetId: null,
        ip: 'system',
        userAgent: 'node-script',
        success,
        details: JSON.stringify({
          toolName,
          toolVersion,
          operation,
          who: {
            systemAction: true,
            actionType: 'maintenance_tool_access',
          },
          what: `Maintenance tool access: ${toolName} - ${operation}`,
          timestamp: new Date().toISOString(),
          ...details,
        }),
      },
    })
  } catch (error) {
    // Don't fail script if logging fails
    console.error('Failed to log maintenance tool access:', error)
  }
}

/**
 * Log maintenance tool operation (Node.js script compatible)
 * @param toolName - Name of the maintenance tool
 * @param toolVersion - Version of the tool
 * @param operation - Operation being performed
 * @param result - Operation result or outcome
 * @param success - Whether the operation was successful
 * @param details - Additional details about the operation
 */
export async function logMaintenanceToolOperationNode(
  toolName: string,
  toolVersion: string | null,
  operation: string,
  result: string,
  success: boolean = true,
  details?: Record<string, any>
): Promise<void> {
  try {
    await prisma.appEvent.create({
      data: {
        actionType: 'maintenance_tool_operation',
        actorUserId: null, // System action
        actorEmail: null,
        targetType: 'system',
        targetId: null,
        ip: 'system',
        userAgent: 'node-script',
        success,
        details: JSON.stringify({
          toolName,
          toolVersion,
          operation,
          result,
          who: {
            systemAction: true,
            actionType: 'maintenance_tool_operation',
          },
          what: `Maintenance tool operation: ${toolName} - ${operation}`,
          timestamp: new Date().toISOString(),
          ...details,
        }),
      },
    })
  } catch (error) {
    // Don't fail script if logging fails
    console.error('Failed to log maintenance tool operation:', error)
  }
}

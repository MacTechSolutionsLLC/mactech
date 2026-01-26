/**
 * Inactivity Account Disablement (NIST SP 800-171 Rev. 2, Section 3.5.6)
 * 
 * Disables user identifiers after a defined period of inactivity.
 * Inactivity period: 180 days (6 months)
 */

import { prisma } from './prisma'
import { logEvent } from './audit'

export const INACTIVITY_PERIOD_DAYS = 180

/**
 * Check and disable inactive user accounts
 * Accounts are considered inactive if lastLoginAt is older than INACTIVITY_PERIOD_DAYS
 */
export async function disableInactiveAccounts(): Promise<{
  disabled: number
  checked: number
  errors: string[]
}> {
  const errors: string[] = []
  let disabled = 0
  let checked = 0
  let neverLoggedInCount = 0

  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - INACTIVITY_PERIOD_DAYS)

    // Find all active users who haven't logged in within the inactivity period
    const inactiveUsers = await prisma.user.findMany({
      where: {
        disabled: false,
        lastLoginAt: {
          lt: cutoffDate,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        lastLoginAt: true,
        role: true,
      },
    })

    checked = inactiveUsers.length

    // Disable each inactive account
    for (const user of inactiveUsers) {
      try {
        // Security: Don't disable the last active admin
        if (user.role === 'ADMIN') {
          const activeAdminCount = await prisma.user.count({
            where: {
              role: 'ADMIN',
              disabled: false,
            },
          })

          if (activeAdminCount <= 1) {
            errors.push(`Skipped disabling admin ${user.email}: Last active admin`)
            continue
          }
        }

        // Disable the account
        await prisma.user.update({
          where: { id: user.id },
          data: { disabled: true },
        })

        // Log the disablement action
        await logEvent(
          'user_disable',
          null, // System action
          null,
          true,
          'user',
          user.id,
          {
            reason: 'inactivity',
            inactivityPeriodDays: INACTIVITY_PERIOD_DAYS,
            lastLoginAt: user.lastLoginAt?.toISOString() || null,
            who: {
              systemAction: true,
              actionType: 'automatic_inactivity_disable',
            },
            what: `Account disabled due to inactivity (${INACTIVITY_PERIOD_DAYS} days)`,
            targetUser: {
              userId: user.id,
              userEmail: user.email,
              userName: user.name,
            },
            impact: {
              type: 'account_disablement',
              affectedUserEmail: user.email,
              reason: 'inactivity',
            },
          }
        )

        disabled++
      } catch (error: any) {
        errors.push(`Failed to disable ${user.email}: ${error.message}`)
      }
    }

    // Also handle users who have never logged in (created more than inactivity period ago)
    const neverLoggedInCutoff = new Date()
    neverLoggedInCutoff.setDate(neverLoggedInCutoff.getDate() - INACTIVITY_PERIOD_DAYS)

    const neverLoggedInUsers = await prisma.user.findMany({
      where: {
        disabled: false,
        lastLoginAt: null,
        createdAt: {
          lt: neverLoggedInCutoff,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        role: true,
      },
    })

    neverLoggedInCount = neverLoggedInUsers.length

    for (const user of neverLoggedInUsers) {
      try {
        // Security: Don't disable the last active admin
        if (user.role === 'ADMIN') {
          const activeAdminCount = await prisma.user.count({
            where: {
              role: 'ADMIN',
              disabled: false,
            },
          })

          if (activeAdminCount <= 1) {
            errors.push(`Skipped disabling admin ${user.email}: Last active admin`)
            continue
          }
        }

        // Disable the account
        await prisma.user.update({
          where: { id: user.id },
          data: { disabled: true },
        })

        // Log the disablement action
        await logEvent(
          'user_disable',
          null, // System action
          null,
          true,
          'user',
          user.id,
          {
            reason: 'inactivity_never_logged_in',
            inactivityPeriodDays: INACTIVITY_PERIOD_DAYS,
            accountCreatedAt: user.createdAt.toISOString(),
            who: {
              systemAction: true,
              actionType: 'automatic_inactivity_disable',
            },
            what: `Account disabled due to inactivity (never logged in, created ${INACTIVITY_PERIOD_DAYS}+ days ago)`,
            targetUser: {
              userId: user.id,
              userEmail: user.email,
              userName: user.name,
            },
            impact: {
              type: 'account_disablement',
              affectedUserEmail: user.email,
              reason: 'inactivity_never_logged_in',
            },
          }
        )

        disabled++
      } catch (error: any) {
        errors.push(`Failed to disable ${user.email}: ${error.message}`)
      }
    }
  } catch (error: any) {
    errors.push(`Error checking inactive accounts: ${error.message}`)
  }

  // Log the overall cron job execution summary
  const totalChecked = checked + neverLoggedInCount
  try {
    await logEvent(
      'system_cron_job',
      null, // System action
      null,
      errors.length === 0, // Success if no errors
      'system',
      undefined, // No specific target
      {
        cronJobType: 'inactivity_disablement',
        schedule: '0 2 * * *', // Daily at 02:00 UTC
        executionTime: new Date().toISOString(),
        accountsChecked: totalChecked,
        accountsDisabled: disabled,
        errors: errors.length,
        errorDetails: errors.length > 0 ? errors : undefined,
        who: {
          systemAction: true,
          actionType: 'inactivity_cron_job_execution',
        },
        what: `Inactivity disablement cron job executed: ${totalChecked} accounts checked, ${disabled} accounts disabled, ${errors.length} errors`,
        impact: {
          type: 'cron_job_execution',
          accountsChecked: totalChecked,
          accountsDisabled: disabled,
          errors: errors.length,
        },
      }
    )
  } catch (logError: any) {
    // Don't fail the job if logging fails, but add to errors
    errors.push(`Failed to log cron job execution: ${logError.message}`)
  }

  return { disabled, checked: totalChecked, errors }
}

/**
 * Check if a user account should be disabled due to inactivity
 */
export function shouldDisableForInactivity(
  lastLoginAt: Date | null,
  accountCreatedAt: Date
): boolean {
  if (!lastLoginAt) {
    // Never logged in - check if account is older than inactivity period
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - INACTIVITY_PERIOD_DAYS)
    return accountCreatedAt < cutoffDate
  }

  // Check if last login is older than inactivity period
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - INACTIVITY_PERIOD_DAYS)
  return lastLoginAt < cutoffDate
}

/**
 * Ignored Opportunities Store
 * Tracks noticeIds that have been ignored and should never reappear
 */

import { prisma } from '../prisma'

/**
 * Check if a noticeId is in the ignored list
 */
export async function isIgnored(noticeId: string): Promise<boolean> {
  try {
    const ignored = await prisma.ignoredOpportunity.findUnique({
      where: { notice_id: noticeId },
    })
    return !!ignored
  } catch (error) {
    console.error(`[IgnoredOpportunities] Error checking if ignored:`, error)
    return false
  }
}

/**
 * Get all ignored noticeIds
 */
export async function getAllIgnored(): Promise<Set<string>> {
  try {
    const ignored = await prisma.ignoredOpportunity.findMany({
      select: { notice_id: true },
    })
    return new Set(ignored.map(i => i.notice_id))
  } catch (error) {
    console.error(`[IgnoredOpportunities] Error getting all ignored:`, error)
    return new Set()
  }
}

/**
 * Add a noticeId to the ignored list
 */
export async function ignoreOpportunity(
  noticeId: string,
  reason?: string,
  ignoredBy?: string
): Promise<void> {
  try {
    await prisma.ignoredOpportunity.upsert({
      where: { notice_id: noticeId },
      create: {
        notice_id: noticeId,
        reason: reason || null,
        ignored_by: ignoredBy || null,
      },
      update: {
        reason: reason || undefined,
        ignored_by: ignoredBy || undefined,
        ignored_at: new Date(),
      },
    })
  } catch (error) {
    console.error(`[IgnoredOpportunities] Error ignoring opportunity:`, error)
    throw error
  }
}

/**
 * Remove a noticeId from the ignored list (unignore)
 */
export async function unignoreOpportunity(noticeId: string): Promise<void> {
  try {
    await prisma.ignoredOpportunity.delete({
      where: { notice_id: noticeId },
    })
  } catch (error) {
    console.error(`[IgnoredOpportunities] Error unignoring opportunity:`, error)
    throw error
  }
}


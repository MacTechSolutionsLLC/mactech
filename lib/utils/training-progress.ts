/**
 * Training Progress Tracking Utilities
 * Tracks user progress through security awareness training
 */

const STORAGE_KEY_PREFIX = 'security_training_progress_'
const MINIMUM_TIME_MINUTES = 2 // Minimum time required to complete training

export interface TrainingProgress {
  startTime: Date
  viewedSections: Set<string>
  completed: boolean
}

/**
 * Get storage key for current user
 */
function getStorageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`
}

/**
 * Initialize training progress for a user
 */
export function initializeTrainingProgress(userId: string): TrainingProgress {
  const progress: TrainingProgress = {
    startTime: new Date(),
    viewedSections: new Set(),
    completed: false,
  }
  saveTrainingProgress(userId, progress)
  return progress
}

/**
 * Get training progress for a user
 */
export function getTrainingProgress(userId: string): TrainingProgress | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(getStorageKey(userId))
    if (!stored) return null

    const data = JSON.parse(stored)
    return {
      startTime: new Date(data.startTime),
      viewedSections: new Set(data.viewedSections || []),
      completed: data.completed || false,
    }
  } catch {
    return null
  }
}

/**
 * Save training progress for a user
 */
export function saveTrainingProgress(userId: string, progress: TrainingProgress): void {
  if (typeof window === 'undefined') return

  try {
    const data = {
      startTime: progress.startTime.toISOString(),
      viewedSections: Array.from(progress.viewedSections),
      completed: progress.completed,
    }
    localStorage.setItem(getStorageKey(userId), JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save training progress:', error)
  }
}

/**
 * Track that a section has been viewed
 */
export function trackSectionView(userId: string, sectionId: string): void {
  const progress = getTrainingProgress(userId) || initializeTrainingProgress(userId)
  progress.viewedSections.add(sectionId)
  saveTrainingProgress(userId, progress)
}

/**
 * Calculate training completion percentage
 */
export function calculateProgress(
  viewedSections: Set<string>,
  totalSections: number
): number {
  if (totalSections === 0) return 0
  return Math.round((viewedSections.size / totalSections) * 100)
}

/**
 * Check if minimum time requirement has been met
 */
export function hasMinimumTimeElapsed(startTime: Date, minMinutes: number = MINIMUM_TIME_MINUTES): boolean {
  const elapsedMs = new Date().getTime() - startTime.getTime()
  const elapsedMinutes = elapsedMs / (1000 * 60)
  return elapsedMinutes >= minMinutes
}

/**
 * Count total sections (including subsections) in training content
 */
export function countTotalSections(sections: Array<{ subsections?: Array<{ id: string }> }>): number {
  let count = 0
  for (const section of sections) {
    count += 1 // Count main section
    if (section.subsections) {
      count += section.subsections.length // Count subsections
    }
  }
  return count
}

/**
 * Check if training can be completed (all sections viewed and minimum time elapsed)
 */
export function canCompleteTraining(
  progress: TrainingProgress | null,
  totalSections: number
): boolean {
  if (!progress) return false
  if (progress.completed) return true

  const allSectionsViewed = progress.viewedSections.size >= totalSections
  const minTimeElapsed = hasMinimumTimeElapsed(progress.startTime)

  return allSectionsViewed && minTimeElapsed
}

/**
 * Mark training as completed
 */
export function markTrainingCompleted(userId: string): void {
  const progress = getTrainingProgress(userId)
  if (progress) {
    progress.completed = true
    saveTrainingProgress(userId, progress)
  }
}

/**
 * Clear training progress (e.g., after completion or on logout)
 */
export function clearTrainingProgress(userId: string): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(getStorageKey(userId))
  } catch (error) {
    console.error('Failed to clear training progress:', error)
  }
}

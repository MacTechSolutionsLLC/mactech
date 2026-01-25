'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { SECURITY_TRAINING_CONTENT, TRAINING_ACKNOWLEDGMENT_TEXT } from '@/lib/data/security-training-content'
import {
  initializeTrainingProgress,
  getTrainingProgress,
  saveTrainingProgress,
  trackSectionView,
  countTotalSections,
  canCompleteTraining,
  markTrainingCompleted,
  clearTrainingProgress,
  type TrainingProgress,
} from '@/lib/utils/training-progress'

interface SecurityTrainingModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export default function SecurityTrainingModal({ isOpen, onClose, onComplete }: SecurityTrainingModalProps) {
  const { data: session } = useSession()
  const userId = session?.user?.id || 'anonymous'
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const [progress, setProgress] = useState<TrainingProgress | null>(null)
  const [acknowledged, setAcknowledged] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalSections = countTotalSections(SECURITY_TRAINING_CONTENT)

  // Initialize progress when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      const existingProgress = getTrainingProgress(userId)
      if (existingProgress) {
        setProgress(existingProgress)
      } else {
        const newProgress = initializeTrainingProgress(userId)
        setProgress(newProgress)
      }
      setAcknowledged(false)
      setError(null)
    }
  }, [isOpen, userId])

  // Track scroll position to detect section views
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || !progress) return

    const container = scrollContainerRef.current
    const containerTop = container.scrollTop
    const containerHeight = container.clientHeight
    const viewportBottom = containerTop + containerHeight

    // Check each section to see if it's in view
    sectionRefs.current.forEach((element, sectionId) => {
      if (progress.viewedSections.has(sectionId)) return

      const elementTop = element.offsetTop - container.offsetTop
      const elementBottom = elementTop + element.offsetHeight

      // Section is considered viewed if at least 50% is visible
      const isVisible = elementTop < viewportBottom && elementBottom > containerTop
      const visibleHeight = Math.min(elementBottom, viewportBottom) - Math.max(elementTop, containerTop)
      const visibilityPercent = visibleHeight / element.offsetHeight

      if (isVisible && visibilityPercent > 0.5) {
        trackSectionView(userId, sectionId)
        const updatedProgress = getTrainingProgress(userId)
        if (updatedProgress) {
          setProgress(updatedProgress)
        }
      }
    })
  }, [progress, userId])

  // Set up scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current
    if (container && isOpen) {
      container.addEventListener('scroll', handleScroll)
      // Initial check
      handleScroll()
      return () => {
        container.removeEventListener('scroll', handleScroll)
      }
    }
  }, [isOpen, handleScroll])

  // Register section refs
  const registerSectionRef = useCallback((sectionId: string, element: HTMLDivElement | null) => {
    if (element) {
      sectionRefs.current.set(sectionId, element)
    } else {
      sectionRefs.current.delete(sectionId)
    }
  }, [])

  const handleComplete = async () => {
    if (!acknowledged || !progress) return

    if (!canCompleteTraining(progress, totalSections)) {
      setError('Please review all sections of the training before completing.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/user/security-obligations/attest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attestationType: 'security_training' }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to complete training')
      }

      // Mark training as completed and clear progress
      markTrainingCompleted(userId)
      clearTrainingProgress(userId)

      onComplete()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete training')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (progress && !progress.completed) {
      const confirmed = window.confirm(
        'You have not completed the training. Your progress will be saved. Do you want to close?'
      )
      if (!confirmed) return
    }
    onClose()
  }

  if (!isOpen) return null

  const progressPercent = progress
    ? Math.round((progress.viewedSections.size / totalSections) * 100)
    : 0
  const canComplete = progress ? canCompleteTraining(progress, totalSections) : false

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Security Awareness Training</h2>
            <p className="text-sm text-neutral-600 mt-1">
              Progress: {progressPercent}% ({progress?.viewedSections.size || 0} of {totalSections} sections)
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-neutral-400 hover:text-neutral-600 text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-8"
          style={{ maxHeight: 'calc(90vh - 200px)' }}
        >
          {SECURITY_TRAINING_CONTENT.map((section) => (
            <div
              key={section.id}
              ref={(el) => registerSectionRef(section.id, el)}
              className="training-section"
            >
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">{section.title}</h3>
              {section.content.map((paragraph, idx) => (
                <p key={idx} className="text-body text-neutral-700 mb-3">
                  {paragraph}
                </p>
              ))}

              {section.subsections?.map((subsection) => (
                <div
                  key={subsection.id}
                  ref={(el) => registerSectionRef(subsection.id, el)}
                  className="ml-4 mt-4 training-section"
                >
                  <h4 className="text-lg font-semibold text-neutral-900 mb-2">{subsection.title}</h4>
                  {subsection.content.map((paragraph, idx) => (
                    <p key={idx} className="text-body text-neutral-700 mb-2">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ))}

          {/* Acknowledgment Section */}
          <div className="border-t border-neutral-200 pt-6 mt-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Training Acknowledgment</h3>
            <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="training-acknowledgment"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-1 w-4 h-4 text-accent-600 border-neutral-300 rounded focus:ring-accent-500"
                />
                <label htmlFor="training-acknowledgment" className="text-body text-neutral-700 flex-1">
                  {TRAINING_ACKNOWLEDGMENT_TEXT}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200 bg-neutral-50">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded-sm">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              {canComplete
                ? 'You can complete the training'
                : 'Please review all sections before completing'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-100 text-sm font-medium"
              >
                Close
              </button>
              <button
                onClick={handleComplete}
                disabled={!acknowledged || !canComplete || submitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm px-6 py-2"
              >
                {submitting ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Completing...
                  </>
                ) : (
                  'Complete Training'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

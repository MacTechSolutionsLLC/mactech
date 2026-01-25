'use client'

import { useState } from 'react'

interface TrainingEnforcementBannerProps {
  trainingStatus: 'completed' | 'pending' | 'expiring' | 'expired'
  lastAttestedAt: string | null
  currentYear: string
  onStartTraining: () => void
}

export default function TrainingEnforcementBanner({
  trainingStatus,
  lastAttestedAt,
  currentYear,
  onStartTraining,
}: TrainingEnforcementBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  // Don't show banner if training is completed and current
  if (trainingStatus === 'completed') {
    return null
  }

  // Don't show if dismissed (but will reappear on page refresh)
  if (dismissed) {
    return null
  }

  const getBannerColor = () => {
    if (trainingStatus === 'expired') {
      return 'bg-red-50 border-red-300 text-red-800'
    }
    if (trainingStatus === 'expiring') {
      return 'bg-yellow-50 border-yellow-300 text-yellow-800'
    }
    return 'bg-orange-50 border-orange-300 text-orange-800'
  }

  const getStatusMessage = () => {
    if (trainingStatus === 'expired') {
      return 'Your security awareness training has expired. You must complete the training to maintain compliance.'
    }
    if (trainingStatus === 'expiring') {
      return 'Your security awareness training is expiring soon. Please complete the training to maintain compliance.'
    }
    return 'You must complete security awareness training before accessing other features.'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return 'Invalid date'
    }
  }

  return (
    <div className={`border-l-4 ${getBannerColor()} p-4 mb-6 rounded-sm`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold">⚠️</span>
            <h3 className="text-lg font-semibold">Security Training Required</h3>
          </div>
          <p className="text-sm mb-2">{getStatusMessage()}</p>
          {lastAttestedAt && (
            <p className="text-xs opacity-80">
              Last completed: {formatDate(lastAttestedAt)} • Current year: {currentYear}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onStartTraining}
            className="px-4 py-2 bg-accent-700 text-white rounded-lg text-sm font-medium hover:bg-accent-800 transition-colors whitespace-nowrap"
          >
            Start Training
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-800"
            title="Dismiss (will reappear on page refresh)"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

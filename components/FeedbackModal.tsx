'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'

interface ElementData {
  selector: string
  elementId: string | null
  elementClass: string | null
  elementText: string | null
  elementType: string | null
}

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  selectedElement?: ElementData | null
}

export default function FeedbackModal({
  isOpen,
  onClose,
  selectedElement = null,
}: FeedbackModalProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [elementData, setElementData] = useState<ElementData | null>(selectedElement)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Get current page URL
  const pageUrl = typeof window !== 'undefined' ? window.location.href : null

  // Update element data when selectedElement prop changes
  useEffect(() => {
    if (selectedElement) {
      setElementData(selectedElement)
    }
  }, [selectedElement])

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setContent('')
      setError(null)
      setSuccess(false)
      setElementData(null)
    }
  }, [isOpen])

  // Handle Enter key (Ctrl+Enter or Cmd+Enter to submit)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('Please enter your feedback')
      return
    }

    if (content.trim().length > 5000) {
      setError('Feedback must be less than 5000 characters')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          pageUrl: pageUrl || undefined,
          elementSelector: elementData?.selector || undefined,
          elementId: elementData?.elementId || undefined,
          elementClass: elementData?.elementClass || undefined,
          elementText: elementData?.elementText || undefined,
          elementType: elementData?.elementType || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback')
      }

      setSuccess(true)
      setContent('')
      setElementData(null)

      // Close modal after 1.5 seconds
      setTimeout(() => {
        onClose()
        // Optionally navigate to feedback forum
        // router.push('/feedback')
      }, 1500)
    } catch (err: any) {
      console.error('Error submitting feedback:', err)
      setError(err.message || 'Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        data-feedback-modal
        className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-neutral-900">Submit Feedback</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 text-2xl leading-none focus:outline-none"
            aria-label="Close"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Feedback Submitted!</h3>
            <p className="text-sm text-neutral-600">
              Thank you for your feedback. It has been submitted successfully.
            </p>
          </div>
        ) : (
          <>
            {/* Selected Element Info */}
            {elementData && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Selected Element
                    </p>
                    <div className="text-xs text-blue-700 space-y-1">
                      {elementData.elementType && (
                        <p>
                          <span className="font-medium">Type:</span> {elementData.elementType}
                        </p>
                      )}
                      {elementData.elementText && (
                        <p>
                          <span className="font-medium">Text:</span>{' '}
                          {elementData.elementText.length > 50
                            ? `${elementData.elementText.substring(0, 50)}...`
                            : elementData.elementText}
                        </p>
                      )}
                      {elementData.elementId && (
                        <p>
                          <span className="font-medium">ID:</span> {elementData.elementId}
                        </p>
                      )}
                      {elementData.elementClass && (
                        <p>
                          <span className="font-medium">Class:</span> {elementData.elementClass}
                        </p>
                      )}
                      <p className="text-blue-600 font-mono text-xs break-all">
                        <span className="font-medium">Selector:</span> {elementData.selector}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setElementData(null)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    type="button"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="feedback-content"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Your Feedback
              </label>
              <textarea
                id="feedback-content"
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your feedback here... (Press Ctrl+Enter or Cmd+Enter to submit)"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 resize-none"
                rows={6}
                disabled={isSubmitting}
                maxLength={5000}
              />
              <div className="mt-1 flex justify-between text-xs text-neutral-500">
                <span>{content.length} / 5000 characters</span>
                <span className="text-neutral-400">Ctrl+Enter to submit</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !content.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-accent-700 rounded-md hover:bg-accent-800 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

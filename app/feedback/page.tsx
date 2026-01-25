'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FeedbackItem {
  id: string
  content: string
  status: string
  pageUrl: string | null
  elementSelector: string | null
  elementId: string | null
  elementClass: string | null
  elementText: string | null
  elementType: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

interface FeedbackResponse {
  feedback?: FeedbackItem[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  error?: string
}

export default function FeedbackForumPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<FeedbackResponse['pagination'] | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/feedback')
    }
  }, [status, router])

  // Fetch feedback
  useEffect(() => {
    if (status !== 'authenticated') return

    const fetchFeedback = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '50',
          sortOrder: 'desc',
        })

        if (filterStatus !== 'all') {
          params.append('status', filterStatus)
        }

        const response = await fetch(`/api/feedback?${params.toString()}`)
        const data: FeedbackResponse = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch feedback')
        }

        if (data.feedback && data.pagination) {
          setFeedback(data.feedback)
          setPagination(data.pagination)
        } else {
          throw new Error('Invalid response format')
        }
      } catch (err: any) {
        console.error('Error fetching feedback:', err)
        setError(err.message || 'Failed to load feedback')
      } finally {
        setLoading(false)
      }
    }

    fetchFeedback()
  }, [status, filterStatus, currentPage])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'reviewed':
        return 'bg-blue-100 text-blue-800'
      case 'implemented':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-neutral-100 text-neutral-800'
      default:
        return 'bg-neutral-100 text-neutral-800'
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-700 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Header */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">Feedback Forum</h1>
            <p className="text-lg text-neutral-700 leading-relaxed">
              View and manage feedback submitted by users. All authenticated users can view all feedback entries.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="text-sm font-medium text-neutral-700">
              Filter by status:
            </label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-sm"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="implemented">Implemented</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {pagination && (
            <div className="text-sm text-neutral-600">
              Showing {feedback.length} of {pagination.total} feedback entries
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-700 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading feedback...</p>
          </div>
        )}

        {/* Feedback List */}
        {!loading && !error && (
          <>
            {feedback.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-neutral-200">
                <p className="text-neutral-600 mb-4">No feedback found.</p>
                <p className="text-sm text-neutral-500">
                  Use the feedback button on any page to submit feedback.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedback.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg border border-neutral-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div>
                            <p className="font-medium text-neutral-900">
                              {item.user.name || item.user.email}
                            </p>
                            <p className="text-sm text-neutral-500">{item.user.email}</p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-500">{formatDate(item.createdAt)}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-neutral-700 whitespace-pre-wrap">{item.content}</p>
                    </div>

                    {/* Element Information */}
                    {(item.elementSelector || item.elementId || item.elementClass || item.elementType) && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-xs font-medium text-blue-900 mb-2">Target Element:</p>
                        <div className="space-y-1 text-xs text-blue-700">
                          {item.elementType && (
                            <p>
                              <span className="font-medium">Type:</span> {item.elementType}
                            </p>
                          )}
                          {item.elementText && (
                            <p>
                              <span className="font-medium">Text:</span>{' '}
                              {item.elementText.length > 100
                                ? `${item.elementText.substring(0, 100)}...`
                                : item.elementText}
                            </p>
                          )}
                          {item.elementId && (
                            <p>
                              <span className="font-medium">ID:</span>{' '}
                              <code className="bg-blue-100 px-1 py-0.5 rounded">{item.elementId}</code>
                            </p>
                          )}
                          {item.elementClass && (
                            <p>
                              <span className="font-medium">Class:</span>{' '}
                              <code className="bg-blue-100 px-1 py-0.5 rounded">{item.elementClass}</code>
                            </p>
                          )}
                          {item.elementSelector && (
                            <p className="mt-2">
                              <span className="font-medium">Selector:</span>
                              <code className="block mt-1 bg-blue-100 px-2 py-1 rounded font-mono text-xs break-all">
                                {item.elementSelector}
                              </code>
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {item.pageUrl && (
                      <div className="mt-4 pt-4 border-t border-neutral-200">
                        <p className="text-xs text-neutral-500 mb-1">Submitted from:</p>
                        <a
                          href={item.pageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-accent-700 hover:text-accent-800 break-all"
                        >
                          {item.pageUrl}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-neutral-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={currentPage === pagination.totalPages}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

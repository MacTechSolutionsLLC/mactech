'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'

/**
 * Session Lock Component
 * Implements NIST SP 800-171 Rev. 2, Section 3.1.10
 * Locks browser session after period of inactivity to prevent unauthorized access
 */

const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutes in milliseconds
const WARNING_TIME = 2 * 60 * 1000 // Show warning 2 minutes before lock

interface SessionLockProps {
  children: React.ReactNode
}

export default function SessionLock({ children }: SessionLockProps) {
  const { data: session } = useSession()
  const [isLocked, setIsLocked] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [lastActivity, setLastActivity] = useState<number>(Date.now())
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lockTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isLockedRef = useRef(false)
  
  // Keep ref in sync with state
  useEffect(() => {
    isLockedRef.current = isLocked
  }, [isLocked])

  // Handle session lock
  const handleLock = useCallback(async () => {
    if (!session || isLocked) return

    setIsLocked(true)
    setShowWarning(false)

    // Log session lock event via API route
    try {
      await fetch('/api/audit/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionType: 'session_locked',
          actorUserId: session.user?.id || null,
          actorEmail: session.user?.email || null,
          success: true,
          details: {
            reason: 'inactivity',
            timestamp: new Date().toISOString(),
          },
        }),
      })
    } catch (error) {
      console.error('Failed to log session lock event:', error)
    }
  }, [session, isLocked])

  // Reset activity timers
  const resetTimers = useCallback(() => {
    const now = Date.now()
    setLastActivity(now)
    setShowWarning(false)

    // Clear existing timeouts
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
      warningTimeoutRef.current = null
    }
    if (lockTimeoutRef.current) {
      clearTimeout(lockTimeoutRef.current)
      lockTimeoutRef.current = null
    }

    // Only set timers if user is authenticated
    if (session) {
      // Set warning timeout
      warningTimeoutRef.current = setTimeout(() => {
        setShowWarning(true)
      }, INACTIVITY_TIMEOUT - WARNING_TIME)

      // Set lock timeout
      lockTimeoutRef.current = setTimeout(() => {
        handleLock()
      }, INACTIVITY_TIMEOUT)
    }
  }, [session, handleLock])

  // Handle unlock (user re-authenticates)
  const handleUnlock = useCallback(() => {
    setIsLocked(false)
    setShowWarning(false)
    resetTimers()
  }, [resetTimers])

  // Monitor user activity
  useEffect(() => {
    if (!session) {
      // Clear timers if not authenticated
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current)
        warningTimeoutRef.current = null
      }
      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current)
        lockTimeoutRef.current = null
      }
      return
    }

    // Reset timers on user activity
    const activityEvents = [
      'mousedown',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ]

    // Use a stable handler that checks isLocked via ref
    const handleActivity = () => {
      if (!isLockedRef.current) {
        resetTimers()
      }
    }

    // Add event listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Initialize timers
    resetTimers()

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current)
        warningTimeoutRef.current = null
      }
      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current)
        lockTimeoutRef.current = null
      }
    }
  }, [session, resetTimers])

  // Handle visibility change (tab switching)
  useEffect(() => {
    if (!session) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden - don't reset timers
        return
      } else {
        // Tab is visible again - check if we should lock
        const timeSinceActivity = Date.now() - lastActivity
        if (timeSinceActivity >= INACTIVITY_TIMEOUT && !isLocked) {
          handleLock()
        } else {
          resetTimers()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [session, lastActivity, isLocked, handleLock, resetTimers])

  // Render lock screen
  if (isLocked && session) {
    return (
      <div className="fixed inset-0 bg-neutral-900 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-neutral-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
                Session Locked
              </h2>
              <p className="text-neutral-600 mb-6">
                Your session has been locked due to inactivity. Please sign in again to continue.
              </p>
            </div>
            <button
              onClick={() => {
                handleUnlock()
                // Redirect to sign in page
                window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`
              }}
              className="btn-primary w-full"
            >
              Sign In to Unlock
            </button>
            <p className="text-sm text-neutral-500 mt-4">
              For security, your session was automatically locked after 15 minutes of inactivity.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Render warning banner
  if (showWarning && session && !isLocked) {
    return (
      <>
        {children}
        <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4 max-w-sm z-40">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Session will lock soon
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Your session will be locked in 2 minutes due to inactivity. Move your mouse or press a key to continue.
              </p>
            </div>
            <button
              onClick={() => setShowWarning(false)}
              className="ml-4 flex-shrink-0 text-yellow-600 hover:text-yellow-800"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </>
    )
  }

  return <>{children}</>
}

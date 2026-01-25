/**
 * Read feedback via API endpoint
 * This script reads feedback from the API, which works regardless of database connection
 * 
 * Usage:
 *   tsx scripts/read-feedback-api.ts [status]
 * 
 * Examples:
 *   tsx scripts/read-feedback-api.ts                    # Read all pending and reviewed feedback
 *   tsx scripts/read-feedback-api.ts pending           # Read only pending feedback
 *   tsx scripts/read-feedback-api.ts all               # Read all feedback
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

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

async function readFeedback() {
  const statusFilter = process.argv[2] || 'pending,reviewed'

  try {
    // Note: This requires authentication
    // For local use, you'll need to provide a session token
    // For production, this would need to be run from an authenticated context
    
    const params = new URLSearchParams({
      page: '1',
      limit: '100',
      sortOrder: 'desc',
    })

    if (statusFilter !== 'all') {
      const statuses = statusFilter.split(',').map(s => s.trim())
      statuses.forEach(status => {
        params.append('status', status)
      })
    }

    console.log(`Fetching feedback from ${API_BASE_URL}/api/feedback...`)
    console.log(`Status filter: ${statusFilter}`)
    console.log('Note: This requires authentication. If running locally, ensure you have a valid session.')
    console.log()

    const response = await fetch(`${API_BASE_URL}/api/feedback?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const feedback: FeedbackItem[] = data.feedback || []

    if (feedback.length === 0) {
      console.log('No feedback found matching the criteria.')
      return
    }

    // Output structured data
    console.log('='.repeat(80))
    console.log(`Feedback Report`)
    console.log(`Generated: ${new Date().toISOString()}`)
    console.log(`Total feedback entries: ${feedback.length}`)
    console.log(`Status filter: ${statusFilter}`)
    console.log('='.repeat(80))
    console.log()

    // Group by status
    const byStatus = feedback.reduce((acc, item) => {
      if (!acc[item.status]) {
        acc[item.status] = []
      }
      acc[item.status].push(item)
      return acc
    }, {} as Record<string, FeedbackItem[]>)

    // Output by status
    for (const [status, items] of Object.entries(byStatus)) {
      console.log(`\n## Status: ${status.toUpperCase()} (${items.length} entries)`)
      console.log('-'.repeat(80))

      items.forEach((item, index) => {
        console.log(`\n### Entry ${index + 1} (ID: ${item.id})`)
        console.log(`User: ${item.user.name || item.user.email} (${item.user.email})`)
        console.log(`Submitted: ${new Date(item.createdAt).toLocaleString()}`)
        if (item.pageUrl) {
          console.log(`Page URL: ${item.pageUrl}`)
        }
        if (item.elementSelector || item.elementId || item.elementType) {
          console.log(`Element: ${item.elementType || 'unknown'}${item.elementId ? ` (#${item.elementId})` : ''}${item.elementClass ? ` (.${item.elementClass})` : ''}`)
          if (item.elementSelector) {
            console.log(`Selector: ${item.elementSelector}`)
          }
        }
        console.log(`Content:`)
        console.log(item.content)
        console.log()
      })
    }

    // Summary statistics
    console.log('\n' + '='.repeat(80))
    console.log('Summary Statistics:')
    console.log('='.repeat(80))
    console.log(`Total entries: ${feedback.length}`)
    Object.entries(byStatus).forEach(([status, items]) => {
      console.log(`  ${status}: ${items.length}`)
    })
    console.log()

  } catch (error: any) {
    console.error('Error reading feedback:', error.message)
    console.error('\nNote: This script requires authentication.')
    console.error('For local development, you may need to:')
    console.error('1. Set NEXT_PUBLIC_APP_URL to your app URL')
    console.error('2. Provide authentication (session cookie or token)')
    console.error('3. Or use the database script with DATABASE_URL set')
    process.exit(1)
  }
}

readFeedback()

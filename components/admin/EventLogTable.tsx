'use client'

interface AppEvent {
  id: string
  timestamp: Date
  actorEmail: string | null
  actionType: string
  targetType: string | null
  targetId: string | null
  ip: string | null
  success: boolean
  details: string | null
  actor?: {
    id: string
    email: string
    name: string | null
    role: string
  } | null
}

interface EventLogTableProps {
  events: AppEvent[]
  total: number
}

export default function EventLogTable({ events, total }: EventLogTableProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString()
  }

  const getSuccessBadge = (success: boolean) => {
    return success ? (
      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
        Success
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
        Failed
      </span>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="p-4 border-b border-neutral-200">
        <p className="text-sm text-neutral-600">
          Showing {events.length} of {total} events
        </p>
      </div>
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Timestamp
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Action
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Actor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Target
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              IP Address
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {events.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-neutral-500">
                No events found
              </td>
            </tr>
          ) : (
            events.map((event) => (
              <tr key={event.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                  {formatDate(event.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                  <code className="bg-neutral-100 px-2 py-1 rounded text-xs">
                    {event.actionType}
                  </code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                  {event.actorEmail || event.actor?.email || "System"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {event.targetType && event.targetId ? (
                    <span>
                      {event.targetType}: <code className="text-xs">{event.targetId.substring(0, 8)}...</code>
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {event.ip || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getSuccessBadge(event.success)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

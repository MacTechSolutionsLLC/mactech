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
                <td className="px-6 py-4 text-sm text-neutral-900">
                  <div className="flex flex-col gap-1">
                    <code className="bg-neutral-100 px-2 py-1 rounded text-xs font-medium">
                      {event.actionType}
                    </code>
                    {event.details && (
                      <div className="text-xs text-neutral-600 mt-1 space-y-1">
                        {(() => {
                          try {
                            const details = JSON.parse(event.details)
                            
                            // Logout event details
                            if (event.actionType === "logout") {
                              return (
                                <div className="space-y-1 bg-blue-50 p-2 rounded border border-blue-200">
                                  <div><strong>Who:</strong> {details.userName || details.userEmail || "Unknown"} ({details.userRole})</div>
                                  <div><strong>What:</strong> User logout - Session terminated</div>
                                  <div><strong>Impact:</strong> {details.impact?.type || "session_termination"} - User {details.impact?.affectedUserEmail || details.userEmail} logged out</div>
                                  <div><strong>Time:</strong> {details.timestamp ? new Date(details.timestamp).toLocaleString() : formatDate(event.timestamp)}</div>
                                  {details.ipAddress && <div><strong>IP:</strong> {details.ipAddress}</div>}
                                </div>
                              )
                            }
                            
                            // Admin action details
                            if (event.actionType === "admin_action" && details.action) {
                              return (
                                <div className="space-y-1">
                                  <span>
                                    Action: <code className="text-xs bg-neutral-50 px-1 rounded">{details.action}</code>
                                  </span>
                                  {details.attemptedAction && (
                                    <span className="ml-2">
                                      Attempted: <code className="text-xs bg-neutral-50 px-1 rounded">{details.attemptedAction}</code>
                                    </span>
                                  )}
                                  {details.reason && (
                                    <span className="ml-2 text-red-600">
                                      Reason: {details.reason}
                                    </span>
                                  )}
                                </div>
                              )
                            }
                            
                            return null
                          } catch {
                            return null
                          }
                        })()}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium text-neutral-900">
                      {event.actor?.name || event.actorEmail || event.actor?.email || "System"}
                    </span>
                    {event.actor?.role && (
                      <span className="text-xs text-neutral-500">{event.actor.role}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {event.targetType && event.targetId ? (
                    <div className="flex flex-col">
                      <span className="font-medium text-neutral-700">{event.targetType}</span>
                      <code className="text-xs text-neutral-500">{event.targetId.substring(0, 12)}...</code>
                    </div>
                  ) : event.actionType === "logout" ? (
                    <span className="text-neutral-400 italic">Session termination</span>
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

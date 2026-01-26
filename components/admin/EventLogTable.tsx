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
  poamId?: string | null
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
                      <div className="text-xs text-neutral-600 mt-1">
                        {(() => {
                          try {
                            const details = JSON.parse(event.details)
                            
                            // Render standardized details structure
                            return (
                              <details className="group">
                                <summary className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium">
                                  View Details
                                </summary>
                                <div className="mt-2 space-y-2 bg-neutral-50 p-3 rounded border border-neutral-200">
                                  {/* Who Section */}
                                  {details.who && (
                                    <div className="border-b border-neutral-200 pb-2">
                                      <div className="font-semibold text-neutral-700 mb-1">Who:</div>
                                      <div className="space-y-1 pl-2">
                                        <div><strong>Name:</strong> {details.who.userName || details.who.adminName || event.actor?.name || "Unknown"}</div>
                                        <div><strong>Email:</strong> {details.who.userEmail || details.who.adminEmail || event.actor?.email || event.actorEmail || "Unknown"}</div>
                                        <div><strong>Role:</strong> {details.who.userRole || details.who.adminRole || event.actor?.role || "Unknown"}</div>
                                        {details.who.sessionId && <div><strong>Session ID:</strong> <code className="text-xs">{details.who.sessionId}</code></div>}
                                        {details.who.mfaVerified !== null && details.who.mfaVerified !== undefined && (
                                          <div><strong>MFA Verified:</strong> {details.who.mfaVerified ? "Yes" : "No"}</div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* What Section */}
                                  {details.what && (
                                    <div className="border-b border-neutral-200 pb-2">
                                      <div className="font-semibold text-neutral-700 mb-1">What:</div>
                                      <div className="pl-2">{details.what}</div>
                                    </div>
                                  )}
                                  
                                  {/* ToWhom Section */}
                                  {details.toWhom && (
                                    <div className="border-b border-neutral-200 pb-2">
                                      <div className="font-semibold text-neutral-700 mb-1">Target:</div>
                                      <div className="space-y-1 pl-2">
                                        <div><strong>Type:</strong> {details.toWhom.targetType}</div>
                                        {details.toWhom.targetName && <div><strong>Name:</strong> {details.toWhom.targetName}</div>}
                                        {details.toWhom.targetEmail && <div><strong>Email:</strong> {details.toWhom.targetEmail}</div>}
                                        {details.toWhom.filename && <div><strong>Filename:</strong> {details.toWhom.filename}</div>}
                                        {details.toWhom.fileSize && <div><strong>File Size:</strong> {details.toWhom.fileSize} bytes</div>}
                                        {details.toWhom.mimeType && <div><strong>MIME Type:</strong> {details.toWhom.mimeType}</div>}
                                        {details.toWhom.isCUI !== undefined && <div><strong>CUI File:</strong> {details.toWhom.isCUI ? "Yes" : "No"}</div>}
                                        {details.toWhom.isFCI !== undefined && <div><strong>FCI File:</strong> {details.toWhom.isFCI ? "Yes" : "No"}</div>}
                                        {details.toWhom.contractTitle && <div><strong>Contract:</strong> {details.toWhom.contractTitle}</div>}
                                        {details.toWhom.poamId && <div><strong>POAM ID:</strong> <code className="text-xs">{details.toWhom.poamId}</code></div>}
                                        {details.toWhom.poamTitle && <div><strong>POAM Title:</strong> {details.toWhom.poamTitle}</div>}
                                        <div><strong>ID:</strong> <code className="text-xs">{details.toWhom.targetId}</code></div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Security Section */}
                                  {details.security && (
                                    <div className="border-b border-neutral-200 pb-2">
                                      <div className="font-semibold text-neutral-700 mb-1">Security Context:</div>
                                      <div className="space-y-1 pl-2">
                                        {details.security.ipAddress && <div><strong>IP Address:</strong> {details.security.ipAddress}</div>}
                                        {details.security.requestId && <div><strong>Request ID:</strong> <code className="text-xs">{details.security.requestId}</code></div>}
                                        {details.security.privilegedAction !== undefined && (
                                          <div><strong>Privileged Action:</strong> {details.security.privilegedAction ? "Yes" : "No"}</div>
                                        )}
                                        {details.security.mfaRequired !== undefined && (
                                          <div><strong>MFA Required:</strong> {details.security.mfaRequired ? "Yes" : "No"}</div>
                                        )}
                                        {details.security.mfaVerified !== null && details.security.mfaVerified !== undefined && (
                                          <div><strong>MFA Verified:</strong> {details.security.mfaVerified ? "Yes" : "No"}</div>
                                        )}
                                        {details.security.deviceInfo && Object.keys(details.security.deviceInfo).length > 0 && (
                                          <div>
                                            <strong>Device:</strong> {[
                                              details.security.deviceInfo.device,
                                              details.security.deviceInfo.os,
                                              details.security.deviceInfo.browser
                                            ].filter(Boolean).join(" / ") || "Unknown"}
                                          </div>
                                        )}
                                        {details.security.userAgent && (
                                          <div className="text-xs text-neutral-500"><strong>User Agent:</strong> {details.security.userAgent}</div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Context Section */}
                                  {details.context && Object.keys(details.context).length > 0 && (
                                    <div>
                                      <div className="font-semibold text-neutral-700 mb-1">Context:</div>
                                      <div className="space-y-1 pl-2">
                                        {details.context.previousState && (
                                          <div>
                                            <strong>Previous State:</strong>
                                            <pre className="text-xs bg-neutral-100 p-1 rounded mt-1 overflow-auto">
                                              {JSON.stringify(details.context.previousState, null, 2)}
                                            </pre>
                                          </div>
                                        )}
                                        {details.context.changes && (
                                          <div>
                                            <strong>Changes:</strong>
                                            <pre className="text-xs bg-neutral-100 p-1 rounded mt-1 overflow-auto">
                                              {JSON.stringify(details.context.changes, null, 2)}
                                            </pre>
                                          </div>
                                        )}
                                        {details.context.impact && (
                                          <div>
                                            <strong>Impact:</strong>
                                            <pre className="text-xs bg-neutral-100 p-1 rounded mt-1 overflow-auto">
                                              {JSON.stringify(details.context.impact, null, 2)}
                                            </pre>
                                          </div>
                                        )}
                                        {details.context.message && <div>{details.context.message}</div>}
                                        {details.context.error && <div className="text-red-600"><strong>Error:</strong> {details.context.error}</div>}
                                        {details.context.reason && <div className="text-orange-600"><strong>Reason:</strong> {details.context.reason}</div>}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Legacy support for system_cron_job */}
                                  {event.actionType === "system_cron_job" && details.cronJobType && (
                                    <div className="border-t border-neutral-200 pt-2">
                                      <div className="font-semibold text-neutral-700 mb-1">Cron Job Details:</div>
                                      <div className="space-y-1 pl-2">
                                        <div><strong>Job Type:</strong> {details.cronJobType.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</div>
                                        {details.schedule && <div><strong>Schedule:</strong> {details.schedule}</div>}
                                        {details.executionTime && <div><strong>Execution Time:</strong> {new Date(details.executionTime).toLocaleString()}</div>}
                                        {details.accountsChecked !== undefined && <div><strong>Accounts Checked:</strong> {details.accountsChecked}</div>}
                                        {details.accountsDisabled !== undefined && <div><strong>Accounts Disabled:</strong> {details.accountsDisabled}</div>}
                                        {details.errors !== undefined && <div><strong>Errors:</strong> {details.errors}</div>}
                                        {details.errorDetails && Array.isArray(details.errorDetails) && details.errorDetails.length > 0 && (
                                          <div>
                                            <strong className="text-red-600">Error Details:</strong>
                                            <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                                              {details.errorDetails.map((error: string, idx: number) => (
                                                <li key={idx}>{error}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Timestamp */}
                                  {details.timestamp && (
                                    <div className="text-xs text-neutral-500 pt-2 border-t border-neutral-200">
                                      <strong>Event Time:</strong> {new Date(details.timestamp).toLocaleString()}
                                    </div>
                                  )}
                                </div>
                              </details>
                            )
                          } catch {
                            return (
                              <div className="text-xs text-red-600">
                                Failed to parse event details
                              </div>
                            )
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
                  {(() => {
                    if (!event.targetType || !event.targetId) {
                      return event.actionType === "logout" ? (
                        <span className="text-neutral-400 italic">Session termination</span>
                      ) : (
                        "-"
                      )
                    }
                    
                    // Try to extract target name from details
                    let targetName: string | null = null
                    try {
                      if (event.details) {
                        const details = JSON.parse(event.details)
                        targetName = details.toWhom?.targetName || 
                                    details.toWhom?.filename || 
                                    details.toWhom?.contractTitle ||
                                    details.toWhom?.poamId ||
                                    details.toWhom?.targetEmail ||
                                    null
                      }
                    } catch {}
                    
                    return (
                      <div className="flex flex-col">
                        <span className="font-medium text-neutral-700">{event.targetType}</span>
                        {targetName ? (
                          <span className="text-xs text-neutral-600">{targetName}</span>
                        ) : event.targetType === "poam" && event.poamId ? (
                          <code className="text-xs font-semibold text-accent-700">{event.poamId}</code>
                        ) : (
                          <code className="text-xs text-neutral-500">{event.targetId.substring(0, 12)}...</code>
                        )}
                      </div>
                    )
                  })()}
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

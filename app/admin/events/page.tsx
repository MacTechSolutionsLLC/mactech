import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getEvents, exportEventsCSV } from "@/lib/audit"
import EventLogTable from "@/components/admin/EventLogTable"
import EventFilters from "@/components/admin/EventFilters"

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  // Parse filters from search params
  const startDate = searchParams.startDate
    ? new Date(searchParams.startDate as string)
    : undefined
  const endDate = searchParams.endDate
    ? new Date(searchParams.endDate as string)
    : undefined
  const actionType = searchParams.actionType as string | undefined
  const actorUserId = searchParams.actorUserId as string | undefined
  const success = searchParams.success
    ? searchParams.success === "true"
    : undefined

  const filters = {
    startDate,
    endDate,
    actionType: actionType as any,
    actorUserId,
    success,
    limit: 100,
    offset: 0,
  }

  const { events, total } = await getEvents(filters)

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Event Log</h1>
            <p className="mt-2 text-neutral-600">
              Application event logging for audit trail (90-day retention)
            </p>
          </div>
          <form action="/api/admin/events/export" method="GET">
            <input type="hidden" name="startDate" value={startDate?.toISOString()} />
            <input type="hidden" name="endDate" value={endDate?.toISOString()} />
            <input type="hidden" name="actionType" value={actionType || ""} />
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              Export CSV
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <EventFilters
            initialFilters={{
              startDate: startDate?.toISOString().split("T")[0],
              endDate: endDate?.toISOString().split("T")[0],
              actionType,
              actorUserId,
              success: success?.toString(),
            }}
          />
        </div>

        <div className="bg-white rounded-lg shadow">
          <EventLogTable events={events} total={total} />
        </div>
      </div>
    </div>
  )
}

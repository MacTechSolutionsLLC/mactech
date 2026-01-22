"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import CUIWarningBanner from "@/components/CUIWarningBanner"

interface PhysicalAccessLog {
  id: string
  date: string
  timeIn: string
  timeOut: string | null
  personName: string
  purpose: string
  hostEscort: string | null
  location: string
  notes: string | null
  createdAt: string
  createdBy: {
    email: string | null
    name: string | null
  }
}

export default function PhysicalAccessLogsPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<PhysicalAccessLog[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    location: "",
  })

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    timeIn: "",
    timeOut: "",
    personName: "",
    purpose: "",
    hostEscort: "",
    location: "",
    notes: "",
  })

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)
      if (filters.location) params.append("location", filters.location)

      const response = await fetch(`/api/admin/physical-access-logs?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to load logs")

      const data = await response.json()
      setLogs(data.logs)
    } catch (error) {
      console.error("Error loading logs:", error)
      alert("Failed to load physical access logs")
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/admin/physical-access-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          timeOut: formData.timeOut || null,
          hostEscort: formData.hostEscort || null,
          notes: formData.notes || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create log entry")
      }

      // Reset form and reload
      setFormData({
        date: new Date().toISOString().split("T")[0],
        timeIn: "",
        timeOut: "",
        personName: "",
        purpose: "",
        hostEscort: "",
        location: "",
        notes: "",
      })
      setShowForm(false)
      loadLogs()
      alert("Physical access log entry created successfully")
    } catch (error: any) {
      console.error("Error creating log:", error)
      alert(error.message || "Failed to create log entry")
    } finally {
      setSubmitting(false)
    }
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)
      if (filters.location) params.append("location", filters.location)

      const response = await fetch(`/api/admin/physical-access-logs/export?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to export")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `physical-access-logs-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error exporting logs:", error)
      alert("Failed to export logs")
    }
  }

  // Get unique locations for filter dropdown
  const locations = Array.from(new Set(logs.map((log) => log.location))).sort()

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Physical Access Logs</h1>
            <p className="mt-2 text-neutral-600">
              PE.L1-3.10.4 Compliance - Physical access logging for locations where systems used to process/store/access FCI exist
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              Export CSV
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              {showForm ? "Cancel" : "New Entry"}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Location
              </label>
              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Create Physical Access Log Entry</h2>
            <CUIWarningBanner />
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Home Office, Workstation Area"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Person Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.personName}
                    onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Purpose <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="e.g., System administration, Development work"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Time In <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.timeIn}
                    onChange={(e) => setFormData({ ...formData, timeIn: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Time Out
                  </label>
                  <input
                    type="time"
                    value={formData.timeOut}
                    onChange={(e) => setFormData({ ...formData, timeOut: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Host/Escort
                  </label>
                  <input
                    type="text"
                    value={formData.hostEscort}
                    onChange={(e) => setFormData({ ...formData, hostEscort: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Entry"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Person
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Host/Escort
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Created By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-neutral-500">
                      Loading...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-neutral-500">
                      No physical access logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {new Date(log.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {log.timeIn}
                        {log.timeOut ? ` - ${log.timeOut}` : ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {log.personName}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-900">{log.purpose}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {log.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {log.hostEscort || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {log.createdBy.email || log.createdBy.name || "unknown"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import AdminNavigation from "@/components/admin/AdminNavigation"

interface EndpointInventory {
  id: string
  deviceIdentifier: string
  owner: string
  os: string
  avEnabled: boolean
  lastVerifiedDate: string | null
  verificationMethod: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export default function EndpointInventoryPage() {
  const [endpoints, setEndpoints] = useState<EndpointInventory[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [filters, setFilters] = useState({
    owner: "",
    avEnabled: "",
  })

  // Form state
  const [formData, setFormData] = useState({
    deviceIdentifier: "",
    owner: "",
    os: "",
    avEnabled: false,
    lastVerifiedDate: "",
    verificationMethod: "",
    notes: "",
  })

  const loadEndpoints = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.owner) params.append("owner", filters.owner)
      if (filters.avEnabled) params.append("avEnabled", filters.avEnabled)

      const response = await fetch(`/api/admin/endpoint-inventory?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to load endpoints")

      const data = await response.json()
      setEndpoints(data.endpoints)
    } catch (error) {
      console.error("Error loading endpoints:", error)
      alert("Failed to load endpoint inventory")
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadEndpoints()
  }, [loadEndpoints])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/admin/endpoint-inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          lastVerifiedDate: formData.lastVerifiedDate || null,
          verificationMethod: formData.verificationMethod || null,
          notes: formData.notes || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create/update endpoint")
      }

      // Reset form and reload
      setFormData({
        deviceIdentifier: "",
        owner: "",
        os: "",
        avEnabled: false,
        lastVerifiedDate: "",
        verificationMethod: "",
        notes: "",
      })
      setShowForm(false)
      loadEndpoints()
      alert("Endpoint inventory entry saved successfully")
    } catch (error: any) {
      console.error("Error saving endpoint:", error)
      alert(error.message || "Failed to save endpoint")
    } finally {
      setSubmitting(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/endpoint-inventory/export")
      if (!response.ok) throw new Error("Failed to export")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `endpoint-inventory-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error exporting endpoints:", error)
      alert("Failed to export endpoint inventory")
    }
  }

  // Get unique owners for filter
  const owners = Array.from(new Set(endpoints.map((ep) => ep.owner))).sort()

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Endpoint Inventory</h1>
            <p className="mt-2 text-neutral-600">
              SI.L1-3.14.2 Compliance - Authorized endpoints used to administer/access the system
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Owner
              </label>
              <select
                value={filters.owner}
                onChange={(e) => setFilters({ ...filters, owner: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
              >
                <option value="">All Owners</option>
                {owners.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                AV Enabled
              </label>
              <select
                value={filters.avEnabled}
                onChange={(e) => setFilters({ ...filters, avEnabled: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
              >
                <option value="">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Create/Update Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Add/Update Endpoint</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Device Identifier <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.deviceIdentifier}
                    onChange={(e) => setFormData({ ...formData, deviceIdentifier: e.target.value })}
                    placeholder="e.g., hostname, serial number"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Owner <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Operating System <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.os}
                    onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                    placeholder="e.g., Windows 11, macOS 14, Ubuntu 22.04"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Last Verified Date
                  </label>
                  <input
                    type="date"
                    value={formData.lastVerifiedDate}
                    onChange={(e) => setFormData({ ...formData, lastVerifiedDate: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Verification Method
                  </label>
                  <select
                    value={formData.verificationMethod}
                    onChange={(e) => setFormData({ ...formData, verificationMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  >
                    <option value="">Select method</option>
                    <option value="Screenshot">Screenshot</option>
                    <option value="EDR Dashboard">EDR Dashboard</option>
                    <option value="Defender UI">Defender UI</option>
                    <option value="Manual Verification">Manual Verification</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="avEnabled"
                    checked={formData.avEnabled}
                    onChange={(e) => setFormData({ ...formData, avEnabled: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded"
                  />
                  <label htmlFor="avEnabled" className="ml-2 text-sm font-medium text-neutral-700">
                    Antivirus Enabled
                  </label>
                </div>
                <div className="md:col-span-2">
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
                  {submitting ? "Saving..." : "Save Entry"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Endpoints Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Device ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    OS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    AV Enabled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Last Verified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Verification Method
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-neutral-500">
                      Loading...
                    </td>
                  </tr>
                ) : endpoints.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-neutral-500">
                      No endpoint inventory entries found
                    </td>
                  </tr>
                ) : (
                  endpoints.map((endpoint) => (
                    <tr key={endpoint.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {endpoint.deviceIdentifier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {endpoint.owner}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {endpoint.os}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {endpoint.avEnabled ? (
                          <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-red-600 font-medium">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {endpoint.lastVerifiedDate
                          ? new Date(endpoint.lastVerifiedDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {endpoint.verificationMethod || "-"}
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

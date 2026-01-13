'use client'

import { useState, useEffect } from 'react'
import StatusBadge from '@/components/tools/StatusBadge'
import DataTable from '@/components/tools/DataTable'

export default function HealthMonitoring() {
  const [metrics, setMetrics] = useState<any>(null)
  const [systems, setSystems] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [metricsRes, systemsRes, alertsRes] = await Promise.all([
        fetch('/api/tools/infrastructure-health-monitoring?pathname=/health'),
        fetch('/api/tools/infrastructure-health-monitoring?pathname=/systems'),
        fetch('/api/tools/infrastructure-health-monitoring?pathname=/alerts'),
      ])

      const metricsData = await metricsRes.json()
      const systemsData = await systemsRes.json()
      const alertsData = await alertsRes.json()

      if (metricsData.success) setMetrics(metricsData.data)
      if (systemsData.success) setSystems(systemsData.data || [])
      if (alertsData.success) setAlerts(alertsData.data || [])
    } catch (err) {
      console.error('Failed to load health monitoring data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-neutral-500">Loading health metrics...</div>
  }

  return (
    <div className="space-y-8">
      {/* Health Metrics Overview */}
      {metrics && (
        <div>
          <h2 className="heading-3 mb-4">Health Metrics Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="text-body-sm text-neutral-600 mb-1">Overall Health</div>
              <div className="text-3xl font-bold text-green-600">{metrics.overallHealth || 'N/A'}%</div>
            </div>
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="text-body-sm text-neutral-600 mb-1">Systems Monitored</div>
              <div className="text-3xl font-bold text-blue-600">{metrics.systemsMonitored || 0}</div>
            </div>
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="text-body-sm text-neutral-600 mb-1">Active Alerts</div>
              <div className="text-3xl font-bold text-red-600">{metrics.activeAlerts || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Active Alerts */}
      <div>
        <h2 className="heading-3 mb-4">Active Alerts</h2>
        <DataTable
          data={alerts}
          columns={[
            { key: 'systemId', header: 'System' },
            { key: 'severity', header: 'Severity' },
            { key: 'message', header: 'Message' },
            {
              key: 'timestamp',
              header: 'Time',
              render: (item) => new Date(item.timestamp).toLocaleString(),
            },
          ]}
          emptyMessage="No active alerts"
        />
      </div>

      {/* Systems */}
      <div>
        <h2 className="heading-3 mb-4">Monitored Systems</h2>
        <DataTable
          data={systems}
          columns={[
            { key: 'id', header: 'System ID' },
            {
              key: 'health',
              header: 'Health',
              render: (item) => (
                <StatusBadge
                  status={
                    item.health > 80 ? 'success' :
                    item.health > 50 ? 'warning' : 'error'
                  }
                >
                  {item.health}%
                </StatusBadge>
              ),
            },
            { key: 'status', header: 'Status' },
          ]}
          emptyMessage="No systems being monitored"
        />
      </div>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { FormBuilder, FormField } from '@/components/tools/FormBuilder'
import DataTable from '@/components/tools/DataTable'
import StatusBadge from '@/components/tools/StatusBadge'

export default function MetrologyManagement() {
  const [projects, setProjects] = useState<any[]>([])
  const [schedule, setSchedule] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProjects()
    loadSchedule()
  }, [])

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/tools/metrology-management?pathname=/projects')
      const data = await response.json()
      if (data.success) {
        setProjects(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load projects:', err)
    }
  }

  const loadSchedule = async () => {
    try {
      const response = await fetch('/api/tools/metrology-management?pathname=/calibrations')
      const data = await response.json()
      if (data.success) {
        setSchedule(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load schedule:', err)
    }
  }

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const projectData = {
      projectName: formData.get('projectName'),
      equipmentName: formData.get('equipmentName'),
      calibrationType: formData.get('calibrationType'),
      dueDate: formData.get('dueDate'),
      priority: formData.get('priority') || 'medium',
    }
    try {
      const response = await fetch('/api/tools/metrology-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      })
      const data = await response.json()
      if (data.success) {
        await loadProjects()
        await loadSchedule()
        e.currentTarget.reset()
      }
    } catch (err) {
      console.error('Failed to create project:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-3 mb-4">Create Metrology Project</h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <FormBuilder onSubmit={handleCreateProject} submitLabel="Create Project" isLoading={loading}>
            <FormField
              label="Project Name"
              name="projectName"
              type="text"
              placeholder="Equipment Calibration Project"
              required
            />
            <FormField
              label="Equipment Name"
              name="equipmentName"
              type="text"
              placeholder="Digital Multimeter Model XYZ"
            />
            <FormField
              label="Calibration Type"
              name="calibrationType"
              type="text"
              placeholder="Electrical"
              required
            />
            <FormField
              label="Due Date"
              name="dueDate"
              type="date"
            />
            <FormField
              label="Priority"
              name="priority"
              type="select"
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
              ]}
            />
          </FormBuilder>
        </div>
      </div>

      <div>
        <h2 className="heading-3 mb-4">Metrology Projects</h2>
        <DataTable
          data={projects}
          columns={[
            { key: 'projectName', header: 'Project Name' },
            { key: 'equipmentName', header: 'Equipment' },
            {
              key: 'status',
              header: 'Status',
              render: (item) => (
                <StatusBadge
                  status={
                    item.status === 'completed' ? 'success' :
                    item.status === 'overdue' ? 'error' :
                    item.status === 'in-progress' ? 'warning' : 'pending'
                  }
                >
                  {item.status}
                </StatusBadge>
              ),
            },
            { key: 'priority', header: 'Priority' },
          ]}
          emptyMessage="No projects found. Create your first project above."
        />
      </div>

      <div>
        <h2 className="heading-3 mb-4">Calibration Schedule</h2>
        <DataTable
          data={schedule}
          columns={[
            { key: 'equipmentName', header: 'Equipment' },
            {
              key: 'nextCalibration',
              header: 'Next Calibration',
              render: (item) => new Date(item.nextCalibration).toLocaleDateString(),
            },
            {
              key: 'status',
              header: 'Status',
              render: (item) => (
                <StatusBadge
                  status={
                    item.status === 'current' ? 'success' :
                    item.status === 'overdue' ? 'error' : 'warning'
                  }
                >
                  {item.status}
                </StatusBadge>
              ),
            },
          ]}
          emptyMessage="No calibration schedule available"
        />
      </div>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { FormBuilder, FormField } from '@/components/tools/FormBuilder'
import DataTable from '@/components/tools/DataTable'
import StatusBadge from '@/components/tools/StatusBadge'

export default function TeamLeadership() {
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTeamMembers()
  }, [])

  const loadTeamMembers = async () => {
    try {
      const response = await fetch('/api/tools/cybersecurity-team-leadership')
      const data = await response.json()
      if (data.success) {
        setTeamMembers(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load team members:', err)
    }
  }

  const handleAddTeamMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const memberData = {
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      skills: (formData.get('skills') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
    }
    try {
      const response = await fetch('/api/tools/cybersecurity-team-leadership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      })
      const data = await response.json()
      if (data.success) {
        await loadTeamMembers()
        e.currentTarget.reset()
      }
    } catch (err) {
      console.error('Failed to add team member:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-3 mb-4">Add Team Member</h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <FormBuilder onSubmit={handleAddTeamMember} submitLabel="Add Member" isLoading={loading}>
            <FormField
              label="Name"
              name="name"
              type="text"
              placeholder="John Doe"
              required
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              placeholder="john.doe@example.com"
              required
            />
            <FormField
              label="Role"
              name="role"
              type="text"
              placeholder="ISSO"
              required
            />
            <FormField
              label="Skills (comma-separated)"
              name="skills"
              type="text"
              placeholder="RMF, STIG, NIST 800-53"
            />
          </FormBuilder>
        </div>
      </div>

      <div>
        <h2 className="heading-3 mb-4">Team Members</h2>
        <DataTable
          data={teamMembers}
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'role', header: 'Role' },
            {
              key: 'performanceScore',
              header: 'Performance Score',
              render: (item) => item.performanceScore ? `${item.performanceScore}%` : 'N/A',
            },
            {
              key: 'currentProjects',
              header: 'Projects',
              render: (item) => item.currentProjects?.length || 0,
            },
          ]}
          emptyMessage="No team members found. Add your first team member above."
        />
      </div>
    </div>
  )
}


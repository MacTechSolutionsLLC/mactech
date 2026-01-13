'use client'

import { useState, useEffect } from 'react'
import { FormBuilder, FormField } from '@/components/tools/FormBuilder'
import DataTable from '@/components/tools/DataTable'
import StatusBadge from '@/components/tools/StatusBadge'

export default function TicketRouting() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    try {
      const response = await fetch('/api/tools/ticket-routing-platform')
      const data = await response.json()
      if (data.success) {
        setTickets(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load tickets:', err)
    }
  }

  const handleCreateTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const ticketData = {
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      priority: formData.get('priority') || 'medium',
      requester: formData.get('requester'),
    }
    try {
      const response = await fetch('/api/tools/ticket-routing-platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      })
      const data = await response.json()
      if (data.success) {
        // Auto-route the ticket
        const routeResponse = await fetch('/api/tools/ticket-routing-platform', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticketId: data.data.id, pathname: '/route' }),
        })
        const routeData = await routeResponse.json()
        if (routeData.success) {
          await loadTickets()
          e.currentTarget.reset()
        }
      }
    } catch (err) {
      console.error('Failed to create ticket:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-3 mb-4">Create Ticket</h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <FormBuilder onSubmit={handleCreateTicket} submitLabel="Create & Route Ticket" isLoading={loading}>
            <FormField
              label="Title"
              name="title"
              type="text"
              placeholder="Server connectivity issue"
              required
            />
            <FormField
              label="Description"
              name="description"
              type="textarea"
              placeholder="Describe the issue..."
              required
            />
            <FormField
              label="Category"
              name="category"
              type="text"
              placeholder="Infrastructure"
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
            <FormField
              label="Requester Email"
              name="requester"
              type="email"
              placeholder="user@example.com"
              required
            />
          </FormBuilder>
        </div>
      </div>

      <div>
        <h2 className="heading-3 mb-4">Tickets</h2>
        <DataTable
          data={tickets}
          columns={[
            { key: 'title', header: 'Title' },
            {
              key: 'status',
              header: 'Status',
              render: (item) => (
                <StatusBadge
                  status={
                    item.status === 'resolved' || item.status === 'closed' ? 'success' :
                    item.status === 'in-progress' ? 'warning' :
                    item.status === 'assigned' ? 'info' : 'pending'
                  }
                >
                  {item.status}
                </StatusBadge>
              ),
            },
            {
              key: 'priority',
              header: 'Priority',
              render: (item) => (
                <StatusBadge
                  status={
                    item.priority === 'critical' ? 'error' :
                    item.priority === 'high' ? 'error' :
                    item.priority === 'medium' ? 'warning' : 'info'
                  }
                >
                  {item.priority}
                </StatusBadge>
              ),
            },
            { key: 'assignedTo', header: 'Assigned To' },
            {
              key: 'createdAt',
              header: 'Created',
              render: (item) => new Date(item.createdAt).toLocaleDateString(),
            },
          ]}
          emptyMessage="No tickets found. Create your first ticket above."
        />
      </div>
    </div>
  )
}


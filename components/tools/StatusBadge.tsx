'use client'

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'pending'
  children: React.ReactNode
}

export default function StatusBadge({ status, children }: StatusBadgeProps) {
  const statusStyles = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    pending: 'bg-neutral-100 text-neutral-800 border-neutral-200',
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-body-sm font-medium border ${statusStyles[status]}`}>
      {children}
    </span>
  )
}


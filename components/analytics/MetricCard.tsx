'use client'

import { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  icon?: ReactNode
  className?: string
}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  className = '',
}: MetricCardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `$${(val / 1000000).toFixed(2)}M`
      }
      if (val >= 1000) {
        return `$${(val / 1000).toFixed(1)}K`
      }
      return val.toLocaleString()
    }
    return val
  }

  return (
    <div
      className={`bg-white rounded-lg border border-neutral-200 p-6 hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="text-sm font-medium text-neutral-600 mb-1">{title}</div>
          <div className="text-3xl font-bold text-neutral-900">{formatValue(value)}</div>
          {subtitle && <div className="text-xs text-neutral-500 mt-1">{subtitle}</div>}
        </div>
        {icon && <div className="ml-4 text-neutral-400">{icon}</div>}
      </div>
      {trend && (
        <div
          className={`text-sm mt-3 flex items-center ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}
        >
          <span className="font-medium">
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="ml-2 text-neutral-600">{trend.label}</span>
        </div>
      )}
    </div>
  )
}

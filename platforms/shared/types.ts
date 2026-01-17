/**
 * Shared TypeScript types and interfaces for all MacTech platforms
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ModuleMetadata {
  id: string
  name: string
  domain: 'infrastructure' | 'quality-assurance' | 'legal-contracts' | 'compliance-security' | 'support-automation' | 'integration'
  teamMember: 'james-adams' | 'brian-macdonald' | 'john-milso' | 'shared'
  description: string
  quote: {
    author: string
    text: string
    role: string
  }
  version: string
  status: 'active' | 'development' | 'planned'
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  checks: {
    database?: boolean
    externalServices?: Record<string, boolean>
  }
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  timestamp: string
  metadata?: Record<string, any>
}




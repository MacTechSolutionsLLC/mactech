'use client'

import Link from 'next/link'

// Import tools to get tool names
const toolNames: Record<string, string> = {
  'data-center-deployment': 'Data Center Deployment Automation',
  'infrastructure-health-monitoring': 'Infrastructure Health Monitoring & Predictive Analytics',
  'network-config-automation': 'Network Configuration Automation',
  'iso-compliance-platform': 'ISO 17025/9001 Compliance Automation',
  'sop-automation-module': 'SOP Development & Technical Writing Automation',
  'metrology-management': 'Laboratory & Metrology Management',
  'audit-readiness-platform': 'Regulatory Audit Readiness & Documentation',
  'contract-management-platform': 'Contract Management & Analysis',
  'legal-document-generation': 'Legal Document Generation & Review',
  'contract-risk-analysis': 'Contract Risk Analysis & Mitigation',
  'rmf-requirements-management': 'RMF Requirements Management & Traceability',
  'security-architecture': 'Security Architecture & Baseline Controls',
  'vulnerability-compliance': 'Vulnerability Management & Compliance Scanning',
  'security-documentation': 'Security Documentation & CDRL Automation',
  'cybersecurity-team-leadership': 'Cybersecurity Team Leadership & Performance',
  'stig-compliance-validation': 'STIG Compliance Validation',
  'evidence-collection': 'Security Control Evidence Collection & Validation',
  'rmf-artifacts': 'RMF Artifact Generation & Quality Assurance',
  'ticket-routing-platform': 'Intelligent Ticket Routing & Resolution',
  'knowledge-base-automation': 'Knowledge Base & Documentation Automation',
}

interface ToolLayoutProps {
  toolId: string
  toolName?: string
  children: React.ReactNode
}

export default function ToolLayout({ toolId, toolName, children }: ToolLayoutProps) {
  const displayName = toolName || toolNames[toolId] || 'Tool'

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-2 text-neutral-900">
                {displayName}
              </h1>
              <p className="text-body-sm text-neutral-600 mt-1">
                Interactive tool interface
              </p>
            </div>
            <Link
              href="/showcase"
              className="btn-secondary inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Showcase
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  )
}


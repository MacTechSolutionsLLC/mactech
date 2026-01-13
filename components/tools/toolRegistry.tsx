'use client'

import { ComponentType } from 'react'
import DataCenterDeployment from './data-center-deployment/DataCenterDeployment'
import HealthMonitoring from './infrastructure-health-monitoring/HealthMonitoring'
import NetworkConfig from './network-config-automation/NetworkConfig'
import ISOCompliance from './iso-compliance-platform/ISOCompliance'
import SOPAutomation from './sop-automation-module/SOPAutomation'
import MetrologyManagement from './metrology-management/MetrologyManagement'
import AuditReadiness from './audit-readiness-platform/AuditReadiness'
import ContractManagement from './contract-management-platform/ContractManagement'
import LegalDocumentGeneration from './legal-document-generation/LegalDocumentGeneration'
import ContractRiskAnalysis from './contract-risk-analysis/ContractRiskAnalysis'
import RMFRequirements from './rmf-requirements-management/RMFRequirements'
import SecurityArchitecture from './security-architecture/SecurityArchitecture'
import VulnerabilityCompliance from './vulnerability-compliance/VulnerabilityCompliance'
import SecurityDocumentation from './security-documentation/SecurityDocumentation'
import TeamLeadership from './cybersecurity-team-leadership/TeamLeadership'
import STIGCompliance from './stig-compliance-validation/STIGCompliance'
import EvidenceCollection from './evidence-collection/EvidenceCollection'
import RMFArtifacts from './rmf-artifacts/RMFArtifacts'
import TicketRouting from './ticket-routing-platform/TicketRouting'
import KnowledgeBase from './knowledge-base-automation/KnowledgeBase'

// Tool components will be imported here as they're created
const toolComponents: Record<string, ComponentType> = {
  // Infrastructure tools
  'data-center-deployment': DataCenterDeployment,
  'infrastructure-health-monitoring': HealthMonitoring,
  'network-config-automation': NetworkConfig,
  
  // Quality Assurance tools
  'iso-compliance-platform': ISOCompliance,
  'sop-automation-module': SOPAutomation,
  'metrology-management': MetrologyManagement,
  'audit-readiness-platform': AuditReadiness,
  
  // Legal & Contracts tools
  'contract-management-platform': ContractManagement,
  'legal-document-generation': LegalDocumentGeneration,
  'contract-risk-analysis': ContractRiskAnalysis,
  
  // Cybersecurity & RMF tools
  'rmf-requirements-management': RMFRequirements,
  'security-architecture': SecurityArchitecture,
  'vulnerability-compliance': VulnerabilityCompliance,
  'security-documentation': SecurityDocumentation,
  'cybersecurity-team-leadership': TeamLeadership,
  
  // Compliance & Security tools
  'stig-compliance-validation': STIGCompliance,
  'evidence-collection': EvidenceCollection,
  'rmf-artifacts': RMFArtifacts,
  
  // Support Automation tools
  'ticket-routing-platform': TicketRouting,
  'knowledge-base-automation': KnowledgeBase,
}

export function getToolComponent(toolId: string): ComponentType | null {
  return toolComponents[toolId] || null
}


/**
 * Extract Service & Showcase Capabilities
 * Extracts structured capability data from services and showcases
 */

import { ServiceCapabilities, ShowcaseCapabilities, Pillar } from './capabilityData'

/**
 * Extract keywords from text content
 */
function extractKeywords(text: string): string[] {
  const keywords: string[] = []
  const upperText = text.toUpperCase()
  
  // Common technical keywords
  const keywordPatterns = [
    'RMF', 'Risk Management Framework', 'ATO', 'Authorization to Operate',
    'STIG', 'Security Technical Implementation Guide', 'ConMon', 'Continuous Monitoring',
    'SCA', 'Security Control Assessment', 'POA&M', 'Plan of Action',
    'SSP', 'System Security Plan', 'NIST 800-53', 'CMMC', 'cybersecurity',
    'ISO 9001', 'ISO 17025', 'ISO 27001', 'audit readiness',
    'data center', 'cloud migration', 'infrastructure as code', 'IaC',
    'Terraform', 'Ansible', 'AWS', 'Azure', 'GCP',
    'network architecture', 'systems engineering', 'platform engineering',
    'virtualization', 'VMware', 'storage', 'backup', 'networking',
    'DevOps', 'CI/CD', 'containerization', 'Kubernetes', 'Docker',
    'quality management system', 'QMS', 'laboratory accreditation',
    'metrology', 'calibration', 'compliance', 'contract management',
    'risk analysis', 'governance', 'legal', 'contracts'
  ]
  
  for (const keyword of keywordPatterns) {
    if (upperText.includes(keyword.toUpperCase())) {
      keywords.push(keyword)
    }
  }
  
  return [...new Set(keywords)] // Remove duplicates
}

/**
 * Security pillar services
 */
const SECURITY_SERVICES: Omit<ServiceCapabilities, 'keywords'>[] = [
  {
    id: 'rmf-implementation',
    name: 'RMF Step 1-6 Implementation',
    pillar: 'Security',
    description: 'Comprehensive Risk Management Framework implementation and authorization support',
    capabilities: [
      'RMF Step 1-6 implementation and documentation',
      'Authorization to Operate (ATO) package development',
      'Continuous Monitoring (ConMon) program design',
      'STIG compliance assessment and remediation',
      'Security Control Assessment (SCA) support',
      'Plan of Action & Milestones (POA&M) development',
      'System Security Plan (SSP) authoring',
      'Risk Assessment Report (RAR) development'
    ],
    deliverables: [
      'Complete System Security Plan (SSP)',
      'Risk Assessment Report (RAR)',
      'Security Control Assessment (SCA) documentation',
      'POA&M with remediation plans',
      'Continuous Monitoring Strategy',
      'STIG compliance reports',
      'Automated Ansible hardening and checker playbooks',
      'Certification Test Procedure (CTP) documents'
    ],
    useCases: [
      'New system requiring initial authorization',
      'ATO renewal approaching',
      'Failed security assessment or audit',
      'Major system changes requiring re-authorization',
      'Cloud migration or infrastructure modernization',
      'Compliance gaps identified',
      'Need for continuous monitoring program'
    ]
  }
]

/**
 * Infrastructure pillar services
 */
const INFRASTRUCTURE_SERVICES: Omit<ServiceCapabilities, 'keywords'>[] = [
  {
    id: 'infrastructure-engineering',
    name: 'Infrastructure & Platform Engineering',
    pillar: 'Infrastructure',
    description: 'Infrastructure design and implementation with authorization requirements built in',
    capabilities: [
      'Data center architecture and design',
      'Virtualization platform implementation',
      'Storage and backup solutions',
      'Network architecture and security',
      'Cloud migration planning and execution',
      'Infrastructure as Code (IaC) development',
      'Performance optimization and capacity planning',
      'Disaster recovery and business continuity'
    ],
    deliverables: [
      'Architecture diagrams and documentation',
      'Infrastructure design documents',
      'Configuration management documentation',
      'Network diagrams and security zones',
      'Disaster recovery plans',
      'Implementation guides and runbooks'
    ],
    useCases: [
      'New system deployment',
      'Infrastructure modernization',
      'Cloud migration initiative',
      'Performance or capacity issues',
      'Need for better documentation',
      'Infrastructure not aligned with security requirements',
      'Preparing for authorization'
    ]
  }
]

/**
 * Quality pillar services
 */
const QUALITY_SERVICES: Omit<ServiceCapabilities, 'keywords'>[] = [
  {
    id: 'quality-compliance',
    name: 'Quality & Compliance Consulting',
    pillar: 'Quality',
    description: 'Proactive audit readiness and compliance programs for regulated environments',
    capabilities: [
      'ISO 9001, 27001, and other standard implementation',
      'Laboratory accreditation support (ISO 17025)',
      'Audit readiness assessments',
      'Quality management system development',
      'Process documentation and standardization',
      'Internal audit programs',
      'Corrective action management',
      'Compliance gap analysis'
    ],
    deliverables: [
      'ISO-compliant documentation',
      'Quality management system documentation',
      'Process procedures and work instructions',
      'Audit readiness reports',
      'Gap analysis and remediation plans',
      'Internal audit reports'
    ],
    useCases: [
      'Upcoming external audit or assessment',
      'Seeking ISO or other certifications',
      'Laboratory accreditation required',
      'Previous audit findings to address',
      'Need for standardized processes',
      'Compliance gaps identified'
    ]
  }
]

/**
 * Governance pillar services
 */
const GOVERNANCE_SERVICES: Omit<ServiceCapabilities, 'keywords'>[] = [
  {
    id: 'governance-contracts',
    name: 'Contracts & Risk Alignment',
    pillar: 'Governance',
    description: 'Legal, contracts, risk analysis, and corporate governance support',
    capabilities: [
      'Contract alignment and management',
      'Risk advisory and analysis',
      'Corporate governance support',
      'Contractual readiness assessment',
      'Vendor management',
      'Subcontractor agreement support',
      'Legal compliance review',
      'Policy and procedure development'
    ],
    deliverables: [
      'Contract analysis reports',
      'Risk assessment documents',
      'Governance documentation',
      'Policy and procedure documents',
      'Vendor management frameworks'
    ],
    useCases: [
      'Contract review and negotiation',
      'Risk assessment needed',
      'Governance framework development',
      'Vendor management support',
      'Compliance review required'
    ]
  }
]

/**
 * Extract all service capabilities
 */
export function extractServiceCapabilities(): ServiceCapabilities[] {
  const allServices = [
    ...SECURITY_SERVICES,
    ...INFRASTRUCTURE_SERVICES,
    ...QUALITY_SERVICES,
    ...GOVERNANCE_SERVICES
  ]

  return allServices.map(service => ({
    ...service,
    keywords: extractKeywords(
      `${service.description} ${service.capabilities.join(' ')} ${service.deliverables?.join(' ') || ''}`
    )
  }))
}

/**
 * Showcase tools/platforms - extracted from showcase page structure
 * This should match the tools array in app/showcase/page.tsx
 */
const SHOWCASE_TOOLS: Omit<ShowcaseCapabilities, 'keywords'>[] = [
  {
    id: 'stig-generator',
    name: 'STIG Generator',
    pillar: 'Security',
    category: 'Automation & Compliance',
    status: 'available',
    description: 'Automated generation of Ansible hardening playbooks, checker playbooks, and CTP documents from DISA STIG XCCDF XML files',
    features: [
      'Parses XCCDF XML STIG files',
      'Generates production-ready Ansible playbooks',
      'Creates standardized CTP documents',
      'Supports RHEL 8/9, Windows 11/2022, and Cisco IOS STIGs',
      'Classifies controls as automatable vs manual',
      'Extracts NIST 800-53 control mappings'
    ],
    useCases: [
      'Accelerate STIG compliance implementation',
      'Generate consistent automation artifacts',
      'Reduce manual documentation effort',
      'Standardize STIG remediation processes'
    ],
    technicalDetails: 'Python CLI application with extensible architecture'
  },
  {
    id: 'rmf-artifact-generator',
    name: 'RMF Artifact Generator',
    pillar: 'Security',
    category: 'Automation & Compliance',
    status: 'in-development',
    description: 'Automated generation of RMF Step 1-6 documentation including SSPs, RARs, POA&Ms, and ConMon strategies',
    features: [
      'Generates complete SSPs from system architecture inputs',
      'Automates RAR development with risk scoring',
      'Creates POA&Ms with remediation timelines',
      'Produces ConMon strategies aligned with NIST 800-53',
      'Validates control implementations against evidence',
      'Exports to standard DoD formats'
    ],
    useCases: [
      'Reduce ATO package development time',
      'Ensure consistency across multiple system authorizations',
      'Automate updates for system changes',
      'Standardize documentation across portfolios'
    ]
  },
  {
    id: 'control-validator',
    name: 'Control Implementation Validator',
    pillar: 'Security',
    category: 'Automation & Compliance',
    status: 'in-development',
    description: 'Automated validation tool that assesses NIST 800-53 control implementations against evidence artifacts',
    features: [
      'Validates control implementations against NIST 800-53',
      'Identifies missing or insufficient evidence',
      'Scores control implementation maturity',
      'Generates gap analysis reports',
      'Tracks evidence collection progress',
      'Pre-validates controls before SCA events'
    ]
  },
  {
    id: 'infrastructure-scanner',
    name: 'Infrastructure Compliance Scanner',
    pillar: 'Security',
    category: 'Automation & Compliance',
    status: 'in-development',
    description: 'Pre-deployment compliance scanning for Infrastructure-as-Code that identifies STIG, NIST, and DoD policy violations',
    features: [
      'Scans Terraform, Ansible, and CloudFormation configurations',
      'Validates against STIG, NIST 800-53, and DoD Cloud SRG',
      'Identifies security misconfigurations pre-deployment',
      'Provides remediation guidance with code fixes',
      'Integrates with CI/CD pipelines',
      'Generates compliance reports'
    ]
  },
  {
    id: 'ato-dashboard',
    name: 'ATO Readiness Dashboard',
    pillar: 'Security',
    category: 'Assessment & Readiness',
    status: 'in-development',
    description: 'Web-based dashboard providing real-time visibility into RMF step completion and authorization readiness',
    features: [
      'Real-time RMF step completion tracking',
      'Artifact status monitoring and alerts',
      'Readiness scoring and gap identification',
      'Timeline visualization for authorization milestones',
      'Collaborative workspace for authorization teams',
      'Exportable readiness reports'
    ]
  },
  {
    id: 'conmon-platform',
    name: 'Continuous Monitoring Automation Platform',
    pillar: 'Security',
    category: 'Assessment & Readiness',
    status: 'in-development',
    description: 'Automated collection, analysis, and reporting of security control evidence for Continuous Monitoring programs',
    features: [
      'Automated evidence collection from multiple sources',
      'Real-time compliance status monitoring',
      'Automated evidence quality validation',
      'Scheduled compliance reporting',
      'Alert generation for control failures',
      'Integration with vulnerability scanners and SIEMs'
    ]
  },
  {
    id: 'data-center-deployment',
    name: 'Data Center Deployment Automation',
    pillar: 'Infrastructure',
    category: 'Infrastructure & Engineering',
    status: 'available',
    description: 'Automated infrastructure provisioning templates for common DoD architectures with storage array configuration',
    features: [
      'Storage array configuration (Dell/EMC, VxRail, Unity, XtremIO)',
      'VMWare host attachment and configuration',
      'Network configuration validation',
      'Pre-deployment STIG compliance checking',
      'ML-based capacity planning',
      'Deployment template library'
    ]
  },
  {
    id: 'infrastructure-health-monitoring',
    name: 'Infrastructure Health Monitoring & Predictive Analytics',
    pillar: 'Infrastructure',
    category: 'Infrastructure & Engineering',
    status: 'available',
    description: 'Real-time infrastructure health dashboards with predictive failure analysis and ML-based anomaly detection',
    features: [
      'Predictive failure analysis using ML',
      'Real-time health dashboards',
      'Automated ticket generation',
      'Anomaly detection and alerting',
      'Automated root cause analysis',
      'Integration with NinjaOne, EPS, ITGlue, WFM'
    ]
  },
  {
    id: 'iso-compliance-platform',
    name: 'ISO 17025/9001 Compliance Automation',
    pillar: 'Quality',
    category: 'Quality Assurance',
    status: 'available',
    description: 'Automated ISO compliance program management with gap analysis and audit readiness scoring',
    features: [
      'ISO 17025 and ISO 9001 compliance tracking',
      'Automated gap identification and analysis',
      'Audit readiness scoring and recommendations',
      'SOP generation from requirements',
      'Management review automation',
      'Corrective action tracking'
    ]
  },
  {
    id: 'sop-automation-module',
    name: 'SOP Development & Technical Writing Automation',
    pillar: 'Quality',
    category: 'Quality Assurance',
    status: 'available',
    description: 'Automated SOP generation from templates with consistency checking and version control',
    features: [
      'Automated SOP generation from requirements',
      'SOP consistency checking and validation',
      'Version control and change management',
      'Review and approval workflows',
      'Multi-format export',
      'ISO requirement mapping'
    ]
  }
]

/**
 * Extract all showcase capabilities
 */
export function extractShowcaseCapabilities(): ShowcaseCapabilities[] {
  return SHOWCASE_TOOLS.map(tool => ({
    ...tool,
    keywords: extractKeywords(
      `${tool.description} ${tool.features.join(' ')} ${tool.useCases?.join(' ') || ''} ${tool.technicalDetails || ''}`
    )
  }))
}

/**
 * Get cached service and showcase capabilities
 */
let cachedServiceCapabilities: ServiceCapabilities[] | null = null
let cachedShowcaseCapabilities: ShowcaseCapabilities[] | null = null

export function getServiceCapabilities(forceRefresh: boolean = false): ServiceCapabilities[] {
  if (!forceRefresh && cachedServiceCapabilities) {
    return cachedServiceCapabilities
  }
  cachedServiceCapabilities = extractServiceCapabilities()
  return cachedServiceCapabilities
}

export function getShowcaseCapabilities(forceRefresh: boolean = false): ShowcaseCapabilities[] {
  if (!forceRefresh && cachedShowcaseCapabilities) {
    return cachedShowcaseCapabilities
  }
  cachedShowcaseCapabilities = extractShowcaseCapabilities()
  return cachedShowcaseCapabilities
}

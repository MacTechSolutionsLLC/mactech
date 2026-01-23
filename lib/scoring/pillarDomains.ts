/**
 * Pillar Domain Mappings
 * Maps contract keywords and requirements to pillar expertise
 */

import { Pillar } from './capabilityData'

export const PILLAR_DOMAINS: Record<Pillar, {
  keywords: string[]
  expertiseAreas: string[]
  description: string
}> = {
  Security: {
    keywords: [
      'RMF', 'Risk Management Framework', 'ATO', 'Authorization to Operate',
      'STIG', 'Security Technical Implementation Guide', 'ConMon', 'Continuous Monitoring',
      'SCA', 'Security Control Assessment', 'POA&M', 'Plan of Action',
      'SSP', 'System Security Plan', 'NIST 800-53', 'CMMC', 'cybersecurity',
      'ISSO', 'ISSM', 'Information System Security', 'Zero Trust',
      'eMASS', 'Xacta', 'Security Control', 'Vulnerability Assessment',
      'Security Assessment', 'Compliance', 'Security Documentation'
    ],
    expertiseAreas: [
      'RMF Implementation', 'ATO Package Development', 'STIG Compliance',
      'Security Control Assessment', 'Continuous Monitoring', 'Risk Assessment',
      'Security Documentation', 'Compliance Auditing'
    ],
    description: 'Cybersecurity & RMF expertise'
  },
  Infrastructure: {
    keywords: [
      'data center', 'cloud migration', 'infrastructure as code', 'IaC',
      'network architecture', 'systems engineering', 'platform engineering',
      'Terraform', 'Ansible', 'AWS', 'Azure', 'GCP', 'infrastructure',
      'virtualization', 'VMware', 'storage', 'backup', 'networking',
      'deployment', 'DevOps', 'CI/CD', 'containerization', 'Kubernetes',
      'Docker', 'server administration', 'system administration'
    ],
    expertiseAreas: [
      'Data Center Architecture', 'Cloud Migration', 'Infrastructure as Code',
      'Network Design', 'Virtualization', 'Storage Solutions', 'DevOps'
    ],
    description: 'Data center, storage, networking, deployment'
  },
  Quality: {
    keywords: [
      'ISO 9001', 'ISO 17025', 'ISO 27001', 'audit readiness',
      'quality management system', 'QMS', 'laboratory accreditation',
      'compliance consulting', 'process documentation', 'metrology',
      'calibration', 'quality assurance', 'quality control', 'audit',
      'certification', 'accreditation', 'standards compliance'
    ],
    expertiseAreas: [
      'ISO Compliance', 'Quality Management Systems', 'Audit Readiness',
      'Metrology', 'Laboratory Accreditation', 'Process Documentation'
    ],
    description: 'ISO compliance, metrology, audit readiness'
  },
  Governance: {
    keywords: [
      'contract alignment', 'risk advisory', 'governance', 'contractual readiness',
      'vendor management', 'subcontractor agreement', 'legal', 'contracts',
      'risk analysis', 'corporate governance', 'compliance', 'regulatory',
      'policy', 'procedure', 'contract management', 'procurement'
    ],
    expertiseAreas: [
      'Contract Management', 'Risk Analysis', 'Legal Compliance',
      'Corporate Governance', 'Vendor Management', 'Policy Development'
    ],
    description: 'Legal, contracts, risk analysis, corporate governance'
  }
}

/**
 * Determine primary pillar for a contract based on keywords
 */
export function determinePrimaryPillar(keywords: string[]): Pillar | null {
  const pillarScores: Record<Pillar, number> = {
    Security: 0,
    Infrastructure: 0,
    Quality: 0,
    Governance: 0
  }

  const upperKeywords = keywords.map(k => k.toUpperCase())

  for (const [pillar, domain] of Object.entries(PILLAR_DOMAINS)) {
    for (const keyword of domain.keywords) {
      if (upperKeywords.some(k => k.includes(keyword.toUpperCase()))) {
        pillarScores[pillar as Pillar]++
      }
    }
  }

  const maxScore = Math.max(...Object.values(pillarScores))
  if (maxScore === 0) return null

  const primaryPillar = Object.entries(pillarScores).find(
    ([, score]) => score === maxScore
  )?.[0] as Pillar

  return primaryPillar || null
}

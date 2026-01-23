/**
 * Capability Data Structures
 * Defines interfaces for company capabilities extracted from resumes, services, showcases, and pillars
 */

export type Pillar = 'Security' | 'Infrastructure' | 'Quality' | 'Governance'

/**
 * Resume capabilities extracted from leadership team resumes
 */
export interface ResumeCapabilities {
  pillar: Pillar
  leaderName: string
  skills: string[]
  certifications: string[]
  yearsOfExperience?: number
  education: {
    degree?: string
    fieldOfStudy?: string
    school?: string
  }[]
  keyProjects?: string[]
  expertiseAreas: string[]
}

/**
 * Service offering capabilities
 */
export interface ServiceCapabilities {
  id: string
  name: string
  pillar: Pillar
  description: string
  keywords: string[]
  capabilities: string[]
  deliverables?: string[]
  useCases?: string[]
}

/**
 * Showcase tool/platform capabilities
 */
export interface ShowcaseCapabilities {
  id: string
  name: string
  pillar: Pillar
  category: string
  status: 'available' | 'in-development' | 'coming-soon'
  description: string
  keywords: string[]
  features: string[]
  useCases?: string[]
  technicalDetails?: string
}

/**
 * Pillar domain expertise
 */
export interface PillarCapabilities {
  pillar: Pillar
  leaderName: string
  description: string
  keywords: string[]
  expertiseAreas: string[]
}

/**
 * Complete company capabilities collection
 */
export interface CompanyCapabilities {
  resumes: ResumeCapabilities[]
  services: ServiceCapabilities[]
  showcases: ShowcaseCapabilities[]
  pillars: PillarCapabilities[]
}

/**
 * Capability match result for a contract
 */
export interface CapabilityMatchResult {
  resumeMatch: {
    score: number // 0-100
    matchedSkills: string[]
    matchedCertifications: string[]
    matchedPillars: Pillar[]
    reasoning: string
  }
  serviceMatch: {
    score: number // 0-100
    matchedServices: string[]
    matchedKeywords: string[]
    reasoning: string
  }
  showcaseMatch: {
    score: number // 0-100
    matchedShowcases: string[]
    matchedFeatures: string[]
    reasoning: string
  }
  pillarMatch: {
    score: number // 0-100
    primaryPillar?: Pillar
    matchedPillars: Pillar[]
    reasoning: string
  }
  overallScore: number // 0-100 weighted average
  breakdown: {
    resumeWeight: number
    serviceWeight: number
    showcaseWeight: number
    pillarWeight: number
  }
}

/**
 * Capability Matcher
 * Keyword-based matching engine for contract capabilities
 */

import { CompanyCapabilities, CapabilityMatchResult, Pillar } from './capabilityData'
import { determinePrimaryPillar } from './pillarDomains'

/**
 * Extract keywords from contract text
 */
function extractContractKeywords(
  title: string,
  description: string,
  requirements: string[] = []
): string[] {
  const combinedText = `${title} ${description} ${requirements.join(' ')}`.toUpperCase()
  const keywords: string[] = []
  
  // Common contract keywords
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
    'risk analysis', 'governance', 'legal', 'contracts',
    'ISSO', 'ISSM', 'Information System Security', 'Zero Trust',
    'eMASS', 'Xacta', 'Security Control', 'Vulnerability Assessment'
  ]
  
  for (const keyword of keywordPatterns) {
    if (combinedText.includes(keyword.toUpperCase())) {
      keywords.push(keyword)
    }
  }
  
  return [...new Set(keywords)] // Remove duplicates
}

/**
 * Calculate resume match score
 */
function calculateResumeMatch(
  contractKeywords: string[],
  capabilities: CompanyCapabilities
): CapabilityMatchResult['resumeMatch'] {
  const matchedSkills: string[] = []
  const matchedCertifications: string[] = []
  const matchedPillars: Pillar[] = []
  const upperKeywords = contractKeywords.map(k => k.toUpperCase())
  
  for (const resume of capabilities.resumes) {
    let pillarMatched = false
    
    // Match skills
    for (const skill of resume.skills) {
      if (upperKeywords.some(k => k.includes(skill.toUpperCase()) || skill.toUpperCase().includes(k))) {
        matchedSkills.push(skill)
        if (!matchedPillars.includes(resume.pillar)) {
          matchedPillars.push(resume.pillar)
        }
        pillarMatched = true
      }
    }
    
    // Match certifications
    for (const cert of resume.certifications) {
      if (upperKeywords.some(k => k.includes(cert.toUpperCase()) || cert.toUpperCase().includes(k))) {
        matchedCertifications.push(cert)
        if (!matchedPillars.includes(resume.pillar)) {
          matchedPillars.push(resume.pillar)
        }
        pillarMatched = true
      }
    }
    
    // Match expertise areas
    for (const area of resume.expertiseAreas) {
      if (upperKeywords.some(k => k.includes(area.toUpperCase()) || area.toUpperCase().includes(k))) {
        if (!matchedPillars.includes(resume.pillar)) {
          matchedPillars.push(resume.pillar)
        }
        pillarMatched = true
      }
    }
  }
  
  // Calculate score based on matches (0-100)
  const skillScore = Math.min(matchedSkills.length * 10, 50) // Max 50 points for skills
  const certScore = Math.min(matchedCertifications.length * 15, 30) // Max 30 points for certs
  const pillarScore = matchedPillars.length * 5 // 5 points per matched pillar
  const totalScore = Math.min(skillScore + certScore + pillarScore, 100)
  
  const reasoning = matchedSkills.length > 0 || matchedCertifications.length > 0
    ? `Matched ${matchedSkills.length} skills and ${matchedCertifications.length} certifications from leadership team resumes`
    : 'No resume skill or certification matches found'
  
  return {
    score: totalScore,
    matchedSkills: [...new Set(matchedSkills)],
    matchedCertifications: [...new Set(matchedCertifications)],
    matchedPillars,
    reasoning
  }
}

/**
 * Calculate service match score
 */
function calculateServiceMatch(
  contractKeywords: string[],
  capabilities: CompanyCapabilities
): CapabilityMatchResult['serviceMatch'] {
  const matchedServices: string[] = []
  const matchedKeywords: string[] = []
  const upperKeywords = contractKeywords.map(k => k.toUpperCase())
  
  for (const service of capabilities.services) {
    let serviceMatched = false
    
    // Check if any service keywords match contract keywords
    for (const serviceKeyword of service.keywords) {
      if (upperKeywords.some(k => k.includes(serviceKeyword.toUpperCase()) || serviceKeyword.toUpperCase().includes(k))) {
        if (!matchedServices.includes(service.name)) {
          matchedServices.push(service.name)
        }
        if (!matchedKeywords.includes(serviceKeyword)) {
          matchedKeywords.push(serviceKeyword)
        }
        serviceMatched = true
      }
    }
    
    // Also check capabilities and description
    const serviceText = `${service.description} ${service.capabilities.join(' ')}`.toUpperCase()
    for (const keyword of contractKeywords) {
      if (serviceText.includes(keyword.toUpperCase())) {
        if (!matchedServices.includes(service.name)) {
          matchedServices.push(service.name)
        }
        serviceMatched = true
      }
    }
  }
  
  // Calculate score (0-100)
  const serviceScore = Math.min(matchedServices.length * 20, 60) // Max 60 points for services
  const keywordScore = Math.min(matchedKeywords.length * 5, 40) // Max 40 points for keywords
  const totalScore = Math.min(serviceScore + keywordScore, 100)
  
  const reasoning = matchedServices.length > 0
    ? `Matched ${matchedServices.length} service offerings: ${matchedServices.join(', ')}`
    : 'No matching service offerings found'
  
  return {
    score: totalScore,
    matchedServices,
    matchedKeywords: [...new Set(matchedKeywords)],
    reasoning
  }
}

/**
 * Calculate showcase match score
 */
function calculateShowcaseMatch(
  contractKeywords: string[],
  capabilities: CompanyCapabilities
): CapabilityMatchResult['showcaseMatch'] {
  const matchedShowcases: string[] = []
  const matchedFeatures: string[] = []
  const upperKeywords = contractKeywords.map(k => k.toUpperCase())
  
  for (const showcase of capabilities.showcases) {
    // Only consider available or in-development tools
    if (showcase.status === 'coming-soon') continue
    
    let showcaseMatched = false
    
    // Check keywords
    for (const showcaseKeyword of showcase.keywords) {
      if (upperKeywords.some(k => k.includes(showcaseKeyword.toUpperCase()) || showcaseKeyword.toUpperCase().includes(k))) {
        if (!matchedShowcases.includes(showcase.name)) {
          matchedShowcases.push(showcase.name)
        }
        showcaseMatched = true
      }
    }
    
    // Check features
    for (const feature of showcase.features) {
      const featureUpper = feature.toUpperCase()
      if (upperKeywords.some(k => featureUpper.includes(k) || k.includes(featureUpper))) {
        if (!matchedFeatures.includes(feature)) {
          matchedFeatures.push(feature)
        }
        if (!matchedShowcases.includes(showcase.name)) {
          matchedShowcases.push(showcase.name)
        }
        showcaseMatched = true
      }
    }
  }
  
  // Calculate score (0-100)
  const showcaseScore = Math.min(matchedShowcases.length * 15, 50) // Max 50 points
  const featureScore = Math.min(matchedFeatures.length * 3, 50) // Max 50 points
  const totalScore = Math.min(showcaseScore + featureScore, 100)
  
  const reasoning = matchedShowcases.length > 0
    ? `Matched ${matchedShowcases.length} tools/platforms: ${matchedShowcases.join(', ')}`
    : 'No matching tools or platforms found'
  
  return {
    score: totalScore,
    matchedShowcases,
    matchedFeatures,
    reasoning
  }
}

/**
 * Calculate pillar match score
 */
function calculatePillarMatch(
  contractKeywords: string[],
  capabilities: CompanyCapabilities
): CapabilityMatchResult['pillarMatch'] {
  const primaryPillar = determinePrimaryPillar(contractKeywords)
  const matchedPillars: Pillar[] = []
  
  if (primaryPillar) {
    matchedPillars.push(primaryPillar)
  }
  
  // Also check for other pillar matches
  for (const pillar of capabilities.pillars) {
    for (const keyword of contractKeywords) {
      if (pillar.keywords.some(pk => 
        keyword.toUpperCase().includes(pk.toUpperCase()) || 
        pk.toUpperCase().includes(keyword.toUpperCase())
      )) {
        if (!matchedPillars.includes(pillar.pillar)) {
          matchedPillars.push(pillar.pillar)
        }
      }
    }
  }
  
  // Calculate score (0-100)
  let score = 0
  if (primaryPillar) {
    score += 50 // Primary pillar match
  }
  score += matchedPillars.length * 15 // Additional pillar matches
  score = Math.min(score, 100)
  
  const reasoning = primaryPillar
    ? `Primary pillar alignment: ${primaryPillar}. Also matches: ${matchedPillars.filter(p => p !== primaryPillar).join(', ') || 'none'}`
    : `No clear primary pillar match. Partial matches: ${matchedPillars.join(', ') || 'none'}`
  
  return {
    score,
    primaryPillar: primaryPillar || undefined,
    matchedPillars,
    reasoning
  }
}

/**
 * Match contract against company capabilities using keyword matching
 */
export function matchCapabilities(
  title: string,
  description: string,
  requirements: string[],
  capabilities: CompanyCapabilities
): CapabilityMatchResult {
  const contractKeywords = extractContractKeywords(title, description, requirements)
  
  const resumeMatch = calculateResumeMatch(contractKeywords, capabilities)
  const serviceMatch = calculateServiceMatch(contractKeywords, capabilities)
  const showcaseMatch = calculateShowcaseMatch(contractKeywords, capabilities)
  const pillarMatch = calculatePillarMatch(contractKeywords, capabilities)
  
  // Calculate weighted overall score
  const weights = {
    resumeWeight: 0.30,   // 30% weight for resume matches
    serviceWeight: 0.30,  // 30% weight for service matches
    showcaseWeight: 0.20, // 20% weight for showcase matches
    pillarWeight: 0.20    // 20% weight for pillar matches
  }
  
  const overallScore = Math.round(
    resumeMatch.score * weights.resumeWeight +
    serviceMatch.score * weights.serviceWeight +
    showcaseMatch.score * weights.showcaseWeight +
    pillarMatch.score * weights.pillarWeight
  )
  
  return {
    resumeMatch,
    serviceMatch,
    showcaseMatch,
    pillarMatch,
    overallScore,
    breakdown: weights
  }
}

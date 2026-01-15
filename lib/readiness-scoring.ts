import { ReadinessAssessmentData } from './validation'

export type ReadinessScore = 'low' | 'medium' | 'high'

export interface ReadinessResult {
  score: ReadinessScore
  scoreValue: number
  gapsSummary: string[]
}

export function calculateReadinessScore(
  data: ReadinessAssessmentData
): ReadinessResult {
  let score = 0
  const gaps: string[] = []

  // System Type (0-25 points)
  switch (data.systemType) {
    case 'new-system':
      score += 20
      gaps.push('New systems require comprehensive RMF planning')
      break
    case 'existing-system':
      score += 15
      gaps.push('Existing systems may have undocumented technical debt')
      break
    case 'legacy-system':
      score += 5
      gaps.push('Legacy systems often lack modern security controls')
      break
    case 'cloud-migration':
      score += 10
      gaps.push('Cloud migrations require new authorization boundaries')
      break
  }

  // Authorization Status (0-25 points)
  switch (data.authStatus) {
    case 'not-started':
      score += 0
      gaps.push('No authorization process initiated')
      break
    case 'in-progress':
      score += 15
      gaps.push('Authorization in progress - may need gap analysis')
      break
    case 'renewal':
      score += 20
      gaps.push('Renewal requires updated documentation and evidence')
      break
    case 'troubled':
      score += 5
      gaps.push('Troubled authorization needs remediation support')
      break
  }

  // Audit History (0-25 points)
  switch (data.auditHistory) {
    case 'no-audits':
      score += 5
      gaps.push('No audit history - baseline assessment needed')
      break
    case 'passed-recently':
      score += 25
      break
    case 'failed-recently':
      score += 5
      gaps.push('Recent audit failures require remediation')
      break
    case 'mixed':
      score += 15
      gaps.push('Mixed audit results indicate inconsistent processes')
      break
  }

  // Infrastructure Maturity (0-25 points)
  switch (data.infraMaturity) {
    case 'ad-hoc':
      score += 5
      gaps.push('Ad-hoc infrastructure lacks documentation and controls')
      break
    case 'documented':
      score += 15
      gaps.push('Documentation exists but may need RMF alignment')
      break
    case 'standardized':
      score += 20
      break
    case 'optimized':
      score += 25
      break
  }

  // Timeline Pressure (affects score interpretation)
  if (data.timelinePressure === 'urgent' && score < 50) {
    gaps.push('Urgent timeline with low readiness requires immediate support')
  }

  // Determine score category
  let scoreCategory: ReadinessScore
  if (score >= 70) {
    scoreCategory = 'high'
  } else if (score >= 40) {
    scoreCategory = 'medium'
  } else {
    scoreCategory = 'low'
  }

  return {
    score: scoreCategory,
    scoreValue: score,
    gapsSummary: gaps,
  }
}



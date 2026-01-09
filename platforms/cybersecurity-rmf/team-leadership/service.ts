import { TeamMember, PerformanceReview, TeamMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'

const logger = createLogger('team-leadership')

export class TeamLeadershipService {
  private members: Map<string, TeamMember> = new Map()
  private reviews: Map<string, PerformanceReview[]> = new Map()

  async addMember(data: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt' | 'careerGoals' | 'currentProjects'>): Promise<TeamMember> {
    logger.info('Adding team member', { name: data.name, email: data.email })

    const member: TeamMember = {
      ...data,
      id: crypto.randomUUID(),
      careerGoals: [],
      currentProjects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.members.set(member.id, member)
    return member
  }

  async getMember(id: string): Promise<TeamMember> {
    const member = this.members.get(id)
    if (!member) {
      throw new NotFoundError('Team Member', id)
    }
    return member
  }

  async listMembers(): Promise<TeamMember[]> {
    return Array.from(this.members.values())
  }

  async createPerformanceReview(teamMemberId: string, reviewer: string, data: Omit<PerformanceReview, 'id' | 'teamMemberId' | 'reviewDate' | 'reviewer'>): Promise<PerformanceReview> {
    await this.getMember(teamMemberId) // Verify member exists
    
    logger.info('Creating performance review', { teamMemberId, reviewer })

    const review: PerformanceReview = {
      ...data,
      id: crypto.randomUUID(),
      teamMemberId,
      reviewDate: new Date().toISOString(),
      reviewer,
    }

    const reviews = this.reviews.get(teamMemberId) || []
    reviews.push(review)
    this.reviews.set(teamMemberId, reviews)

    return review
  }

  async createDevelopmentPlan(teamMemberId: string, goals: string[]): Promise<TeamMember> {
    const member = await this.getMember(teamMemberId)
    
    member.careerGoals = goals
    member.updatedAt = new Date().toISOString()
    this.members.set(teamMemberId, member)

    logger.info('Development plan created', { teamMemberId })
    return member
  }

  async analyzeWorkload(): Promise<Array<{ memberId: string; name: string; workload: number; projects: number }>> {
    const allMembers = Array.from(this.members.values())
    
    return allMembers.map(member => ({
      memberId: member.id,
      name: member.name,
      workload: member.currentProjects.length * 25, // 25% per project
      projects: member.currentProjects.length,
    }))
  }

  async getMetrics(): Promise<TeamMetrics> {
    const allMembers = Array.from(this.members.values())
    const allReviews = Array.from(this.reviews.values()).flat()
    
    const performanceScores = allMembers.filter(m => m.performanceScore).map(m => m.performanceScore!)
    const averageScore = performanceScores.length > 0
      ? performanceScores.reduce((sum, s) => sum + s, 0) / performanceScores.length
      : 0

    return {
      totalMembers: allMembers.length,
      averagePerformanceScore: averageScore,
      highPerformers: allMembers.filter(m => (m.performanceScore || 0) >= 85).length,
      needsDevelopment: allMembers.filter(m => (m.performanceScore || 0) < 70).length,
      activeProjects: new Set(allMembers.flatMap(m => m.currentProjects)).size,
      skillGaps: this.identifySkillGaps(allMembers),
    }
  }

  private identifySkillGaps(members: TeamMember[]): Array<{ skill: string; membersNeeding: number }> {
    const requiredSkills = ['RMF', 'STIG', 'Security Architecture', 'Vulnerability Management']
    const memberSkills = new Set(members.flatMap(m => m.skills || []))
    
    return requiredSkills
      .filter(skill => !memberSkills.has(skill))
      .map(skill => ({
        skill,
        membersNeeding: members.filter(m => !m.skills?.includes(skill)).length,
      }))
  }
}

export const teamLeadershipService = new TeamLeadershipService()


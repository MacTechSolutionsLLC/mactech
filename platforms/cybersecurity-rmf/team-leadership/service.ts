import { TeamMember, PerformanceReview, TeamMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'
import { prisma } from '../../shared/db'

const logger = createLogger('team-leadership')

export class TeamLeadershipService {
  async addMember(data: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt' | 'careerGoals' | 'currentProjects'>): Promise<TeamMember> {
    logger.info('Adding team member', { name: data.name, email: data.email })

    const member = await prisma.teamMember.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        performanceScore: data.performanceScore || null,
      },
    })

    return {
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      performanceScore: member.performanceScore || undefined,
      careerGoals: [],
      currentProjects: [],
      createdAt: member.createdAt.toISOString(),
      updatedAt: member.updatedAt.toISOString(),
    }
  }

  async getMember(id: string): Promise<TeamMember> {
    const member = await prisma.teamMember.findUnique({
      where: { id },
    })

    if (!member) {
      throw new NotFoundError('Team Member', id)
    }

    return {
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      performanceScore: member.performanceScore || undefined,
      careerGoals: [],
      currentProjects: [],
      createdAt: member.createdAt.toISOString(),
      updatedAt: member.updatedAt.toISOString(),
    }
  }

  async listMembers(): Promise<TeamMember[]> {
    const members = await prisma.teamMember.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return members.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      role: m.role,
      performanceScore: m.performanceScore || undefined,
      careerGoals: [],
      currentProjects: [],
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    }))
  }

  async createPerformanceReview(teamMemberId: string, reviewer: string, data: Omit<PerformanceReview, 'id' | 'teamMemberId' | 'reviewDate' | 'reviewer'>): Promise<PerformanceReview> {
    await this.getMember(teamMemberId) // Verify member exists
    
    logger.info('Creating performance review', { teamMemberId, reviewer })

    const reviewDataToStore = {
      strengths: data.strengths || [],
      areasForImprovement: data.areasForImprovement || [],
      goals: data.goals || [],
      ...data.reviewData,
    }

    const review = await prisma.performanceReview.create({
      data: {
        teamMemberId,
        reviewer,
        overallRating: data.overallRating,
        reviewData: JSON.stringify(reviewDataToStore),
      },
    })

    const parsedReviewData = JSON.parse(review.reviewData || '{}')

    return {
      id: review.id,
      teamMemberId: review.teamMemberId,
      reviewDate: review.reviewDate.toISOString(),
      reviewer: review.reviewer,
      overallRating: review.overallRating as any,
      strengths: parsedReviewData.strengths || [],
      areasForImprovement: parsedReviewData.areasForImprovement || [],
      goals: parsedReviewData.goals || [],
      reviewData: parsedReviewData,
    }
  }

  async createDevelopmentPlan(teamMemberId: string, goals: string[]): Promise<TeamMember> {
    const member = await this.getMember(teamMemberId)
    
    // Store goals in member metadata (would need to add metadata field to TeamMember model)
    // For now, just return member with goals
    return {
      ...member,
      careerGoals: goals,
    }
  }

  async analyzeWorkload(): Promise<Array<{ memberId: string; name: string; workload: number; projects: number }>> {
    const allMembers = await prisma.teamMember.findMany()
    
    return allMembers.map(member => ({
      memberId: member.id,
      name: member.name,
      workload: 0, // Would calculate from projects
      projects: 0,
    }))
  }

  async getMetrics(): Promise<TeamMetrics> {
    const allMembers = await prisma.teamMember.findMany()
    const allReviews = await prisma.performanceReview.findMany()
    
    const performanceScores = allMembers.filter(m => m.performanceScore).map(m => m.performanceScore!)
    const averageScore = performanceScores.length > 0
      ? performanceScores.reduce((sum, s) => sum + s, 0) / performanceScores.length
      : 0

    return {
      totalMembers: allMembers.length,
      averagePerformanceScore: averageScore,
      highPerformers: allMembers.filter(m => (m.performanceScore || 0) >= 85).length,
      needsDevelopment: allMembers.filter(m => (m.performanceScore || 0) < 70).length,
      activeProjects: 0, // Would calculate from projects
      skillGaps: this.identifySkillGaps(allMembers.map(m => ({
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role,
        performanceScore: m.performanceScore || undefined,
        skills: [],
        careerGoals: [],
        currentProjects: [],
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      }))),
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


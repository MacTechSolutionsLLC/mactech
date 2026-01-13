import { z } from 'zod'

export const teamMemberSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string(),
  skills: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
})

export type TeamMember = z.infer<typeof teamMemberSchema> & {
  id: string
  performanceScore?: number
  careerGoals: string[]
  currentProjects: string[]
  createdAt: string
  updatedAt: string
}

export interface PerformanceReview {
  id: string
  teamMemberId: string
  reviewDate: string
  reviewer: string
  strengths: string[]
  areasForImprovement: string[]
  goals: Array<{ goal: string; targetDate: string }>
  overallRating: 'exceeds' | 'meets' | 'below' | 'needs-improvement'
  reviewData?: Record<string, any>
}

export interface TeamMetrics {
  totalMembers: number
  averagePerformanceScore: number
  highPerformers: number
  needsDevelopment: number
  activeProjects: number
  skillGaps: Array<{ skill: string; membersNeeding: number }>
}


import { z } from 'zod'

export const knowledgeArticleSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
})

export type KnowledgeArticle = z.infer<typeof knowledgeArticleSchema> & {
  id: string
  views: number
  helpful: number
  notHelpful: number
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
  lastViewedAt?: string
}

export interface KnowledgeSearchResult {
  article: KnowledgeArticle
  relevanceScore: number
  matchedTerms: string[]
}

export interface KnowledgeMetrics {
  totalArticles: number
  published: number
  totalViews: number
  averageHelpfulness: number
  byCategory: Record<string, number>
  topArticles: Array<{ id: string; title: string; views: number }>
}



import { KnowledgeArticle, KnowledgeSearchResult, KnowledgeMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'
import { prisma } from '../../shared/db'

const logger = createLogger('knowledge-base')

export class KnowledgeBaseService {
  async createArticle(data: Omit<KnowledgeArticle, 'id' | 'views' | 'helpful' | 'notHelpful' | 'status' | 'createdAt' | 'updatedAt'>): Promise<KnowledgeArticle> {
    logger.info('Creating knowledge article', { title: data.title })

    const article = await prisma.knowledgeArticle.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category || null,
        status: 'draft',
      },
    })

    return {
      id: article.id,
      title: article.title,
      content: article.content,
      category: article.category || undefined,
      views: article.views,
      helpful: article.helpful,
      notHelpful: article.notHelpful,
      status: article.status as any,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
      lastViewedAt: article.lastViewedAt?.toISOString(),
    }
  }

  async getArticle(id: string): Promise<KnowledgeArticle> {
    const article = await prisma.knowledgeArticle.findUnique({
      where: { id },
    })

    if (!article) {
      throw new NotFoundError('Knowledge Article', id)
    }
    
    // Track view
    const updated = await prisma.knowledgeArticle.update({
      where: { id },
      data: {
        views: { increment: 1 },
        lastViewedAt: new Date(),
      },
    })
    
    return {
      id: updated.id,
      title: updated.title,
      content: updated.content,
      category: updated.category || undefined,
      views: updated.views,
      helpful: updated.helpful,
      notHelpful: updated.notHelpful,
      status: updated.status as any,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      lastViewedAt: updated.lastViewedAt?.toISOString(),
    }
  }

  async listArticles(): Promise<KnowledgeArticle[]> {
    const articles = await prisma.knowledgeArticle.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return articles.map(a => this.mapToKnowledgeArticle(a))
  }

  private mapToKnowledgeArticle(dbArticle: any): KnowledgeArticle {
    return {
      id: dbArticle.id,
      title: dbArticle.title,
      content: dbArticle.content,
      category: dbArticle.category || undefined,
      views: dbArticle.views,
      helpful: dbArticle.helpful,
      notHelpful: dbArticle.notHelpful,
      status: dbArticle.status as any,
      createdAt: dbArticle.createdAt.toISOString(),
      updatedAt: dbArticle.updatedAt.toISOString(),
      lastViewedAt: dbArticle.lastViewedAt?.toISOString(),
    }
  }

  async search(query: string): Promise<KnowledgeSearchResult[]> {
    logger.info('Searching knowledge base', { query })

    const allArticles = await prisma.knowledgeArticle.findMany({
      where: { status: 'published' },
    })
    const queryLower = query.toLowerCase()
    const queryTerms = queryLower.split(/\s+/)

    const mappedArticles = allArticles.map(a => ({
      id: a.id,
      title: a.title,
      content: a.content,
      category: a.category || undefined,
      views: a.views,
      helpful: a.helpful,
      notHelpful: a.notHelpful,
      status: a.status as any,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      lastViewedAt: a.lastViewedAt?.toISOString(),
    }))

    const results: KnowledgeSearchResult[] = mappedArticles
      .map(article => {
        const contentLower = (article.title + ' ' + article.content).toLowerCase()
        const matchedTerms = queryTerms.filter(term => contentLower.includes(term))
        const relevanceScore = (matchedTerms.length / queryTerms.length) * 100

        return {
          article,
          relevanceScore,
          matchedTerms,
        }
      })
      .filter(result => result.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)

    return results
  }

  async askQuestion(question: string): Promise<{ answer: string; sources: KnowledgeArticle[] }> {
    logger.info('Answering question', { question })

    // In production, use NLP/AI to answer questions
    const searchResults = await this.search(question)
    const topResult = searchResults[0]

    if (topResult && topResult.relevanceScore > 50) {
      return {
        answer: topResult.article.content.substring(0, 500) + '...',
        sources: [topResult.article],
      }
    }

    return {
      answer: 'I found some related articles, but no direct answer. Please review the search results.',
      sources: searchResults.slice(0, 3).map(r => r.article),
    }
  }

  async generateFromTicket(ticketId: string, ticketTitle: string, resolution: string): Promise<KnowledgeArticle> {
    logger.info('Generating article from ticket', { ticketId, ticketTitle })

    const article = await this.createArticle({
      title: `How to resolve: ${ticketTitle}`,
      content: `## Problem\n\n${ticketTitle}\n\n## Solution\n\n${resolution}\n\n## Related Information\n\nThis article was generated from ticket ${ticketId}.`,
      category: 'troubleshooting',
      tags: ['auto-generated', 'ticket'],
    })

    return article
  }

  async getMetrics(): Promise<KnowledgeMetrics> {
    const allArticles = await prisma.knowledgeArticle.findMany({
      where: { status: 'published' },
    })
    const published = allArticles.filter(a => a.status === 'published')
    
    const totalViews = allArticles.reduce((sum, a) => sum + a.views, 0)
    const totalHelpful = allArticles.reduce((sum, a) => sum + a.helpful, 0)
    const totalNotHelpful = allArticles.reduce((sum, a) => sum + a.notHelpful, 0)
    const totalFeedback = totalHelpful + totalNotHelpful
    const averageHelpfulness = totalFeedback > 0 ? (totalHelpful / totalFeedback) * 100 : 0

    const topArticles = published
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map(a => ({ id: a.id, title: a.title, views: a.views }))

    return {
      totalArticles: allArticles.length,
      published: published.length,
      totalViews,
      averageHelpfulness,
      byCategory: this.groupByCategory(allArticles.map(a => this.mapToKnowledgeArticle(a))),
      topArticles,
    }
  }

  private groupByCategory(articles: KnowledgeArticle[]): Record<string, number> {
    return articles.reduce((acc, a) => {
      const category = a.category || 'uncategorized'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

export const knowledgeBaseService = new KnowledgeBaseService()


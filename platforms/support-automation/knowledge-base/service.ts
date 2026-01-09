import { KnowledgeArticle, KnowledgeSearchResult, KnowledgeMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'

const logger = createLogger('knowledge-base')

export class KnowledgeBaseService {
  private articles: Map<string, KnowledgeArticle> = new Map()

  async createArticle(data: Omit<KnowledgeArticle, 'id' | 'views' | 'helpful' | 'notHelpful' | 'status' | 'createdAt' | 'updatedAt'>): Promise<KnowledgeArticle> {
    logger.info('Creating knowledge article', { title: data.title })

    const article: KnowledgeArticle = {
      ...data,
      id: crypto.randomUUID(),
      views: 0,
      helpful: 0,
      notHelpful: 0,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.articles.set(article.id, article)
    return article
  }

  async getArticle(id: string): Promise<KnowledgeArticle> {
    const article = this.articles.get(id)
    if (!article) {
      throw new NotFoundError('Knowledge Article', id)
    }
    
    // Track view
    article.views += 1
    article.lastViewedAt = new Date().toISOString()
    article.updatedAt = new Date().toISOString()
    this.articles.set(id, article)
    
    return article
  }

  async listArticles(): Promise<KnowledgeArticle[]> {
    return Array.from(this.articles.values())
  }

  async search(query: string): Promise<KnowledgeSearchResult[]> {
    logger.info('Searching knowledge base', { query })

    const allArticles = Array.from(this.articles.values())
    const queryLower = query.toLowerCase()
    const queryTerms = queryLower.split(/\s+/)

    const results: KnowledgeSearchResult[] = allArticles
      .filter(article => article.status === 'published')
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
    const allArticles = Array.from(this.articles.values())
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
      byCategory: this.groupByCategory(allArticles),
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


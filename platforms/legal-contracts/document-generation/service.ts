import { LegalDocument, DocumentReview, DocumentComparison, LegalDocumentMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'

const logger = createLogger('document-generation')

export class LegalDocumentGenerationService {
  private documents: Map<string, LegalDocument> = new Map()
  private reviews: Map<string, DocumentReview> = new Map()

  async generateDocument(data: Omit<LegalDocument, 'id' | 'version' | 'status' | 'content' | 'format' | 'createdAt' | 'updatedAt'>): Promise<LegalDocument> {
    logger.info('Generating legal document', { documentType: data.documentType, title: data.title })

    const content = this.generateContent(data)

    const document: LegalDocument = {
      ...data,
      id: crypto.randomUUID(),
      version: '1.0',
      status: 'draft',
      content,
      format: 'html',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.documents.set(document.id, document)
    return document
  }

  async getDocument(id: string): Promise<LegalDocument> {
    const document = this.documents.get(id)
    if (!document) {
      throw new NotFoundError('Legal Document', id)
    }
    return document
  }

  async listDocuments(): Promise<LegalDocument[]> {
    return Array.from(this.documents.values())
  }

  async reviewDocument(documentId: string, reviewer: string): Promise<DocumentReview> {
    const document = await this.getDocument(documentId)
    
    logger.info('Reviewing document', { documentId, reviewer })

    // In production, use AI/NLP to identify risks
    const risks = [
      {
        risk: 'Unlimited liability clause',
        severity: 'high' as const,
        recommendation: 'Add liability cap',
      },
      {
        risk: 'Vague termination terms',
        severity: 'medium' as const,
        recommendation: 'Clarify termination conditions',
      },
    ]

    const review: DocumentReview = {
      id: crypto.randomUUID(),
      documentId,
      reviewer,
      reviewDate: new Date().toISOString(),
      risks,
      status: 'completed',
    }

    this.reviews.set(review.id, review)
    return review
  }

  async compareDocuments(document1Id: string, document2Id: string): Promise<DocumentComparison> {
    const doc1 = await this.getDocument(document1Id)
    const doc2 = await this.getDocument(document2Id)
    
    logger.info('Comparing documents', { document1Id, document2Id })

    // In production, use document comparison algorithms
    const differences = [
      {
        section: 'Payment Terms',
        change: 'modified' as const,
        description: 'Payment terms changed from Net 30 to Net 60',
      },
      {
        section: 'Termination Clause',
        change: 'added' as const,
        description: 'New termination for convenience clause added',
      },
    ]

    const similarity = 85 // Would calculate actual similarity

    return {
      document1Id,
      document2Id,
      differences,
      similarity,
    }
  }

  async getMetrics(): Promise<LegalDocumentMetrics> {
    const allDocuments = Array.from(this.documents.values())
    
    return {
      total: allDocuments.length,
      draft: allDocuments.filter(d => d.status === 'draft').length,
      approved: allDocuments.filter(d => d.status === 'approved').length,
      signed: allDocuments.filter(d => d.status === 'signed').length,
      byType: this.groupByType(allDocuments),
      averageReviewTime: 4.2, // days
    }
  }

  private generateContent(data: Omit<LegalDocument, 'id' | 'version' | 'status' | 'content' | 'format' | 'createdAt' | 'updatedAt'>): string {
    const templates = {
      nda: `# Non-Disclosure Agreement\n\nBetween ${data.parties[0]?.name} and ${data.parties[1]?.name}\n\n## Confidentiality Obligations\n\n[Terms here]`,
      msa: `# Master Services Agreement\n\nBetween ${data.parties[0]?.name} and ${data.parties[1]?.name}\n\n## Services\n\n[Service terms]`,
      sow: `# Statement of Work\n\n${data.title}\n\n## Scope of Work\n\n[Work description]`,
      license: `# Software License Agreement\n\n${data.title}\n\n## License Terms\n\n[License terms]`,
      'vendor-agreement': `# Vendor Agreement\n\n${data.title}\n\n## Vendor Terms\n\n[Vendor terms]`,
      'corporate-governance': `# Corporate Governance Document\n\n${data.title}\n\n## Governance Structure\n\n[Governance details]`,
    }

    return templates[data.documentType] || `# ${data.title}\n\n[Document content]`
  }

  private groupByType(documents: LegalDocument[]): Record<string, number> {
    return documents.reduce((acc, d) => {
      acc[d.documentType] = (acc[d.documentType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

export const legalDocumentGenerationService = new LegalDocumentGenerationService()


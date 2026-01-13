import { LegalDocument, DocumentReview, DocumentComparison, LegalDocumentMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'
import { prisma } from '../../shared/db'

const logger = createLogger('document-generation')

export class LegalDocumentGenerationService {
  async generateDocument(data: Omit<LegalDocument, 'id' | 'version' | 'status' | 'content' | 'format' | 'createdAt' | 'updatedAt'>): Promise<LegalDocument> {
    logger.info('Generating legal document', { documentType: data.documentType, title: data.title })

    const content = this.generateContent(data)

    const document = await prisma.legalDocument.create({
      data: {
        documentType: data.documentType,
        title: data.title,
        parties: JSON.stringify(data.parties),
        terms: data.terms ? JSON.stringify(data.terms) : null,
        version: '1.0',
        status: 'draft',
        content,
        format: 'html',
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    })

    return this.mapToDocument(document)
  }

  async getDocument(id: string): Promise<LegalDocument> {
    const document = await prisma.legalDocument.findUnique({
      where: { id },
    })

    if (!document) {
      throw new NotFoundError('Legal Document', id)
    }

    return this.mapToDocument(document)
  }

  async listDocuments(): Promise<LegalDocument[]> {
    const documents = await prisma.legalDocument.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return documents.map(d => this.mapToDocument(d))
  }

  private mapToDocument(dbDoc: any): LegalDocument {
    return {
      id: dbDoc.id,
      documentType: dbDoc.documentType as any,
      title: dbDoc.title,
      parties: JSON.parse(dbDoc.parties),
      terms: dbDoc.terms ? JSON.parse(dbDoc.terms) : undefined,
      version: dbDoc.version,
      status: dbDoc.status as any,
      content: dbDoc.content,
      format: dbDoc.format as any,
      metadata: dbDoc.metadata ? JSON.parse(dbDoc.metadata) : undefined,
      createdAt: dbDoc.createdAt.toISOString(),
      updatedAt: dbDoc.updatedAt.toISOString(),
      approvedAt: dbDoc.approvedAt?.toISOString(),
      signedAt: dbDoc.signedAt?.toISOString(),
    }
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

    const dbReview = await prisma.documentReview.create({
      data: {
        documentId,
        reviewer,
        risks: JSON.stringify(risks),
        status: 'completed',
      },
    })

    return {
      id: dbReview.id,
      documentId: dbReview.documentId,
      reviewer: dbReview.reviewer,
      reviewDate: dbReview.reviewDate.toISOString(),
      risks: JSON.parse(dbReview.risks),
      status: dbReview.status as any,
    }
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
    const allDocuments = await prisma.legalDocument.findMany()
    const mappedDocuments = allDocuments.map(d => this.mapToDocument(d))
    
    return {
      total: mappedDocuments.length,
      draft: mappedDocuments.filter(d => d.status === 'draft').length,
      approved: mappedDocuments.filter(d => d.status === 'approved').length,
      signed: mappedDocuments.filter(d => d.status === 'signed').length,
      byType: this.groupByType(mappedDocuments),
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


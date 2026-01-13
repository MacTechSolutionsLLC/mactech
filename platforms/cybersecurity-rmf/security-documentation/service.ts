import { SecurityDocument, WorkInstruction, DocumentMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'
import { prisma } from '../../shared/db'

const logger = createLogger('security-documentation')

export class SecurityDocumentationService {
  async generateDocument(data: Omit<SecurityDocument, 'id' | 'version' | 'status' | 'format' | 'content' | 'createdAt' | 'updatedAt'>): Promise<SecurityDocument> {
    logger.info('Generating security document', { documentType: data.documentType, title: data.title })

    const content = this.generateContent(data)

    const document = await prisma.securityDocument.create({
      data: {
        documentType: data.documentType,
        systemId: data.systemId || '',
        systemName: data.systemId || 'Unknown System', // Use systemId as fallback
        title: data.title,
        content,
        format: 'html',
        version: '1.0',
        status: 'draft',
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    })

    return {
      id: document.id,
      documentType: document.documentType as any,
      systemId: document.systemId,
      systemName: document.systemName,
      title: document.title,
      content: document.content,
      format: document.format as any,
      version: document.version,
      status: document.status as any,
      metadata: document.metadata ? JSON.parse(document.metadata) : undefined,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
      approvedAt: document.approvedAt?.toISOString(),
    }
  }

  async getDocument(id: string): Promise<SecurityDocument> {
    const document = await prisma.securityDocument.findUnique({
      where: { id },
    })

    if (!document) {
      throw new NotFoundError('Security Document', id)
    }

    return {
      id: document.id,
      documentType: document.documentType as any,
      systemId: document.systemId,
      systemName: document.systemName || undefined,
      title: document.title,
      content: document.content,
      format: document.format as any,
      version: document.version,
      status: document.status as any,
      metadata: document.metadata ? JSON.parse(document.metadata) : undefined,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
      approvedAt: document.approvedAt?.toISOString(),
    }
  }

  async listDocuments(): Promise<SecurityDocument[]> {
    const documents = await prisma.securityDocument.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return documents.map(d => ({
      id: d.id,
      documentType: d.documentType as any,
      systemId: d.systemId,
      systemName: d.systemName || undefined,
      title: d.title,
      content: d.content,
      format: d.format as any,
      version: d.version,
      status: d.status as any,
      metadata: d.metadata ? JSON.parse(d.metadata) : undefined,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
      approvedAt: d.approvedAt?.toISOString(),
    }))
  }

  async generateWorkInstruction(process: string, title: string): Promise<WorkInstruction> {
    logger.info('Generating work instruction', { process, title })

    const instruction: WorkInstruction = {
      id: crypto.randomUUID(),
      process,
      title,
      steps: [
        { step: 1, description: 'Identify requirement', responsible: 'System Engineer' },
        { step: 2, description: 'Review security controls', responsible: 'Security Engineer' },
        { step: 3, description: 'Implement solution', responsible: 'System Administrator' },
        { step: 4, description: 'Validate implementation', responsible: 'Security Engineer' },
      ],
      version: '1.0',
      status: 'draft',
    }

    // Store work instruction (would need WorkInstruction model in Prisma)
    return instruction
  }

  async approveDocument(id: string, approvedBy: string): Promise<SecurityDocument> {
    const updated = await prisma.securityDocument.update({
      where: { id },
      data: {
        status: 'approved',
        approvedAt: new Date(),
      },
    })

    logger.info('Document approved', { id, approvedBy })
    return {
      id: updated.id,
      documentType: updated.documentType as any,
      systemId: updated.systemId,
      systemName: updated.systemName,
      title: updated.title,
      content: updated.content,
      format: updated.format as any,
      version: updated.version,
      status: updated.status as any,
      metadata: updated.metadata ? JSON.parse(updated.metadata) : undefined,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      approvedAt: updated.approvedAt?.toISOString(),
    }
  }

  async getMetrics(): Promise<DocumentMetrics> {
    const allDocuments = await prisma.securityDocument.findMany()
    const mappedDocuments = allDocuments.map(d => ({
      id: d.id,
      documentType: d.documentType as any,
      systemId: d.systemId,
      systemName: d.systemName || undefined,
      title: d.title,
      content: d.content,
      format: d.format as any,
      version: d.version,
      status: d.status as any,
      metadata: d.metadata ? JSON.parse(d.metadata) : undefined,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
      approvedAt: d.approvedAt?.toISOString(),
    }))
    
    return {
      total: mappedDocuments.length,
      draft: mappedDocuments.filter(d => d.status === 'draft').length,
      approved: mappedDocuments.filter(d => d.status === 'approved').length,
      delivered: mappedDocuments.filter(d => d.status === 'delivered').length,
      byType: this.groupByType(mappedDocuments),
      averageReviewTime: 3.5, // days
    }
  }

  private generateContent(data: Omit<SecurityDocument, 'id' | 'version' | 'status' | 'format' | 'content' | 'createdAt' | 'updatedAt'>): string {
    const templates = {
      cdrl: `# ${data.title}\n\n## CDRL Document\n\nSystem: ${data.systemId || 'N/A'}\n\n## Content\n\n[Document content here]`,
      'non-cdrl': `# ${data.title}\n\n## Non-CDRL Document\n\n[Document content here]`,
      'work-instruction': `# ${data.title}\n\n## Work Instruction\n\n[Procedure steps here]`,
      'integration-plan': `# ${data.title}\n\n## Security Integration Plan\n\n[Integration details here]`,
      boe: `# ${data.title}\n\n## Body of Evidence\n\n[Evidence documentation here]`,
    }

    return templates[data.documentType] || `# ${data.title}\n\n[Document content]`
  }

  private groupByType(documents: SecurityDocument[]): Record<string, number> {
    return documents.reduce((acc, d) => {
      acc[d.documentType] = (acc[d.documentType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

export const securityDocumentationService = new SecurityDocumentationService()


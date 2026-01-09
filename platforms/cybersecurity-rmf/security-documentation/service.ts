import { SecurityDocument, WorkInstruction, DocumentMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'

const logger = createLogger('security-documentation')

export class SecurityDocumentationService {
  private documents: Map<string, SecurityDocument> = new Map()
  private workInstructions: Map<string, WorkInstruction> = new Map()

  async generateDocument(data: Omit<SecurityDocument, 'id' | 'version' | 'status' | 'format' | 'content' | 'createdAt' | 'updatedAt'>): Promise<SecurityDocument> {
    logger.info('Generating security document', { documentType: data.documentType, title: data.title })

    const content = this.generateContent(data)

    const document: SecurityDocument = {
      ...data,
      id: crypto.randomUUID(),
      version: '1.0',
      status: 'draft',
      format: 'html',
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.documents.set(document.id, document)
    return document
  }

  async getDocument(id: string): Promise<SecurityDocument> {
    const document = this.documents.get(id)
    if (!document) {
      throw new NotFoundError('Security Document', id)
    }
    return document
  }

  async listDocuments(): Promise<SecurityDocument[]> {
    return Array.from(this.documents.values())
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

    this.workInstructions.set(instruction.id, instruction)
    return instruction
  }

  async approveDocument(id: string, approvedBy: string): Promise<SecurityDocument> {
    const document = await this.getDocument(id)
    
    document.status = 'approved'
    document.approvedBy = approvedBy
    document.approvedAt = new Date().toISOString()
    document.updatedAt = new Date().toISOString()
    this.documents.set(id, document)

    logger.info('Document approved', { id, approvedBy })
    return document
  }

  async getMetrics(): Promise<DocumentMetrics> {
    const allDocuments = Array.from(this.documents.values())
    
    return {
      total: allDocuments.length,
      draft: allDocuments.filter(d => d.status === 'draft').length,
      approved: allDocuments.filter(d => d.status === 'approved').length,
      delivered: allDocuments.filter(d => d.status === 'delivered').length,
      byType: this.groupByType(allDocuments),
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


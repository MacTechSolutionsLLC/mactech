/**
 * Curated documents for the guest portal (trust/credibility resources).
 * Maps slugs to metadata; content is loaded from content/portal/ or returned as markdown.
 */

export interface PortalDocumentMeta {
  slug: string
  title: string
  description?: string
}

const DOCUMENTS: PortalDocumentMeta[] = [
  { slug: 'trust-and-security', title: 'Trust & Security', description: 'How we protect your data' },
  { slug: 'cui-handling', title: 'CUI Handling', description: 'Controlled Unclassified Information practices' },
  { slug: 'compliance-overview', title: 'Compliance Overview', description: 'CMMC and compliance posture' },
]

export function getPortalDocumentsList(): PortalDocumentMeta[] {
  return [...DOCUMENTS]
}

export function getPortalDocumentBySlug(slug: string): PortalDocumentMeta | undefined {
  return DOCUMENTS.find((d) => d.slug === slug)
}

/** Static markdown content for each slug. Replace with file reads if you add content/portal/*.md */
const CONTENT: Record<string, string> = {
  'trust-and-security': `# Trust & Security

We protect your data with industry-standard security controls and compliance practices.

- **Encryption**: Data in transit (TLS) and at rest where applicable
- **Access control**: Role-based access; guests can only access the customer portal and their own uploads
- **Audit**: Security-relevant events are logged
`,
  'cui-handling': `# CUI Handling

Controlled Unclassified Information (CUI) is handled according to our CUI policy and CMMC-aligned practices.

- CUI uploads go directly to the CUI vault; the main application never receives CUI file bytes
- Only authorized users can upload and view CUI
- Metadata (e.g., file size, type) is stored separately from content
`,
  'compliance-overview': `# Compliance Overview

Our compliance posture supports customer requirements and assessments.

- **CMMC**: We maintain CMMC-aligned documentation and controls
- **FCI/CUI**: Clear separation of FCI and CUI storage and access
- **Policies**: Security and privacy policies are available to authorized users
`,
}

export function getPortalDocumentContent(slug: string): string | null {
  return CONTENT[slug] ?? null
}

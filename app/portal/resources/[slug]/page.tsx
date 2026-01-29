import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPortalDocumentBySlug, getPortalDocumentContent } from '@/lib/portal-documents'
import MarkdownRenderer from '@/components/compliance/MarkdownRenderer'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PortalDocumentPage({ params }: PageProps) {
  const { slug } = await params
  const meta = getPortalDocumentBySlug(slug)
  if (!meta) notFound()
  const content = getPortalDocumentContent(slug) ?? ''
  return (
    <div className="space-y-6">
      <div>
        <Link href="/portal/resources" className="text-sm text-neutral-600 hover:text-neutral-900">
          ← Resources
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">{meta.title}</h1>
        {meta.description && (
          <p className="mt-1 text-neutral-600">{meta.description}</p>
        )}
      </div>
      <div className="bg-white rounded-lg border border-neutral-200 p-6 prose prose-neutral max-w-none">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  )
}

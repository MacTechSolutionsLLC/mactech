import Link from 'next/link'
import { getPortalDocumentsList } from '@/lib/portal-documents'

export default function PortalResourcesPage() {
  const documents = getPortalDocumentsList()
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Resources</h1>
        <p className="mt-1 text-neutral-600">
          Trust, credibility, and compliance documents.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {documents.map((doc) => (
          <Link
            key={doc.slug}
            href={`/portal/resources/${doc.slug}`}
            className="block p-6 bg-white rounded-lg border border-neutral-200 shadow-sm hover:border-neutral-300 hover:shadow transition"
          >
            <h2 className="text-lg font-semibold text-neutral-900">{doc.title}</h2>
            {doc.description && (
              <p className="mt-1 text-sm text-neutral-600">{doc.description}</p>
            )}
            <span className="mt-2 inline-block text-sm font-medium text-accent-700">Read →</span>
          </Link>
        ))}
      </div>

      <div className="p-6 bg-white rounded-lg border border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900">CUI Vault</h2>
        <p className="mt-1 text-sm text-neutral-600">
          CUI files are stored in a dedicated vault; the application never receives CUI file bytes.
        </p>
        <Link href="/vault" className="mt-2 inline-block text-sm font-medium text-accent-700">
          Learn more about the CUI Vault →
        </Link>
      </div>
    </div>
  )
}

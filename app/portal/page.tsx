import Link from 'next/link'

export default function PortalHomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Customer Portal</h1>
        <p className="mt-1 text-neutral-600">
          Upload FCI/CUI and access curated resources.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/portal/upload"
          className="block p-6 bg-white rounded-lg border border-neutral-200 shadow-sm hover:border-neutral-300 hover:shadow transition"
        >
          <h2 className="text-lg font-semibold text-neutral-900">Upload</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Upload FCI or CUI files. Your uploads are stored securely.
          </p>
          <span className="mt-2 inline-block text-sm font-medium text-accent-700">Go to Upload →</span>
        </Link>
        <Link
          href="/portal/resources"
          className="block p-6 bg-white rounded-lg border border-neutral-200 shadow-sm hover:border-neutral-300 hover:shadow transition"
        >
          <h2 className="text-lg font-semibold text-neutral-900">Resources</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Trust, credibility, and compliance documents.
          </p>
          <span className="mt-2 inline-block text-sm font-medium text-accent-700">View Resources →</span>
        </Link>
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

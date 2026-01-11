import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="mb-8">
          <h1 className="heading-hero mb-4 text-neutral-900">404</h1>
          <h2 className="heading-2 mb-6 text-neutral-700">Page Not Found</h2>
          <p className="text-body-lg text-neutral-600 mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary">
            Return Home
          </Link>
          <Link href="/contact" className="btn-secondary">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}


'use client'

import Link from 'next/link'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolComponent } from '@/components/tools/toolRegistry'

interface ToolPageProps {
  params: { id: string }
}

export default function ToolPage({ params }: ToolPageProps) {
  const { id } = params
  const ToolComponent = getToolComponent(id)

  if (!ToolComponent) {
    return (
      <ToolLayout toolId={id} toolName="Tool Not Found">
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center">
            <h1 className="heading-hero mb-4">Tool Not Found</h1>
            <p className="text-body-lg text-neutral-700 mb-8">
              The tool you&apos;re looking for doesn&apos;t exist or isn&apos;t available yet.
            </p>
            <Link href="/showcase" className="btn-primary">
              Back to Showcase
            </Link>
          </div>
        </div>
      </ToolLayout>
    )
  }

  return (
    <ToolLayout toolId={id}>
      <ToolComponent />
    </ToolLayout>
  )
}


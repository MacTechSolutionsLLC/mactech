'use client'

import { use } from 'react'
import Link from 'next/link'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolComponent } from '@/components/tools/toolRegistry'

interface ToolPageProps {
  params: Promise<{ id: string }>
}

export default function ToolPage({ params }: ToolPageProps) {
  const { id } = use(params)
  const ToolComponent = getToolComponent(id)

  if (!ToolComponent) {
    return (
      <ToolLayout toolId={id} toolName="Tool Not Found">
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center">
            <h1 className="heading-hero mb-4">Tool Not Found</h1>
            <p className="text-body-lg text-neutral-700 mb-8">
              The tool you're looking for doesn't exist or isn't available yet.
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


import ToolLayout from '@/components/tools/ToolLayout'

export default function Loading() {
  return (
    <ToolLayout toolId="loading" toolName="Loading...">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-3/4"></div>
          <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
          <div className="h-64 bg-neutral-200 rounded"></div>
        </div>
      </div>
    </ToolLayout>
  )
}


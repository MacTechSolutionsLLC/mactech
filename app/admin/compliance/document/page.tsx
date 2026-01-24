import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { readFile } from "fs/promises"
import { join, normalize, resolve, relative } from "path"
import AdminNavigation from "@/components/admin/AdminNavigation"
import Link from "next/link"
import MarkdownRenderer from "@/components/compliance/MarkdownRenderer"

export const dynamic = 'force-dynamic'

/**
 * Validates that the requested path is within the allowed directory
 * Prevents directory traversal attacks
 */
function validatePath(requestedPath: string): { valid: boolean; fullPath: string | null; error?: string } {
  // Base directory for compliance files
  const baseDir = resolve(process.cwd(), "compliance", "cmmc", "level1")
  
  // Normalize the requested path (remove .., ., etc.)
  const normalizedRequested = normalize(requestedPath)
  
  // Resolve the full path
  const fullPath = resolve(baseDir, normalizedRequested)
  
  // Ensure the resolved path is within the base directory
  const relativePath = relative(baseDir, fullPath)
  
  // Check for directory traversal attempts
  if (relativePath.startsWith('..') || relativePath.includes('..')) {
    return {
      valid: false,
      fullPath: null,
      error: 'Invalid path: directory traversal detected'
    }
  }
  
  // Ensure it's a markdown file
  if (!fullPath.endsWith('.md')) {
    return {
      valid: false,
      fullPath: null,
      error: 'Only markdown files are allowed'
    }
  }
  
  return {
    valid: true,
    fullPath
  }
}

export default async function ComplianceDocumentPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const requestedPath = searchParams.path as string | undefined

  if (!requestedPath) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <AdminNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-xl font-semibold text-red-900 mb-2">Error</h1>
            <p className="text-red-700 mb-4">
              No file path provided. Please select a document from the file browser.
            </p>
            <Link
              href="/admin/files"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to File Management
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Validate and resolve the path
  const validation = validatePath(requestedPath)
  if (!validation.valid) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <AdminNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-xl font-semibold text-red-900 mb-2">Error</h1>
            <p className="text-red-700 mb-4">
              {validation.error || 'Invalid file path'}
            </p>
            <Link
              href="/admin/files"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to File Management
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const fullPath = validation.fullPath!

  // Read the file
  let content: string
  try {
    content = await readFile(fullPath, 'utf-8')
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return (
        <div className="min-h-screen bg-neutral-50">
          <AdminNavigation />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h1 className="text-xl font-semibold text-red-900 mb-2">File Not Found</h1>
              <p className="text-red-700 mb-4">
                The requested document could not be found.
              </p>
              <Link
                href="/admin/files"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                ← Back to File Management
              </Link>
            </div>
          </div>
        </div>
      )
    }
    throw error
  }

  const filename = requestedPath.split('/').pop() || requestedPath

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/admin/files"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to File Management
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
            <h1 className="text-2xl font-semibold text-neutral-900 mb-1">{filename}</h1>
            <p className="text-xs text-neutral-500 font-mono">{requestedPath}</p>
          </div>
          
          {/* Content */}
          <div className="p-8">
            <MarkdownRenderer content={content} />
          </div>
        </div>
      </div>
    </div>
  )
}

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
  // Base directories for compliance files (support both level1 and level2)
  const baseDirs = [
    resolve(process.cwd(), "compliance", "cmmc", "level1"),
    resolve(process.cwd(), "compliance", "cmmc", "level2"),
    resolve(process.cwd(), "compliance", "cmmc", "system"),
    resolve(process.cwd(), "compliance", "cmmc", "fci"),
  ]
  
  // Normalize the requested path (remove .., ., etc.)
  const normalizedRequested = normalize(requestedPath)
  
  // Try each base directory
  for (const baseDir of baseDirs) {
    // Resolve the full path
    const fullPath = resolve(baseDir, normalizedRequested)
    
    // Ensure the resolved path is within the base directory
    const relativePath = relative(baseDir, fullPath)
    
    // Check for directory traversal attempts
    if (relativePath.startsWith('..') || relativePath.includes('..')) {
      continue
    }
    
    // Ensure it's a markdown file
    if (!fullPath.endsWith('.md')) {
      continue
    }
    
    // Check if file exists (we'll verify this later, but check structure now)
    return {
      valid: true,
      fullPath
    }
  }
  
  // If path starts with compliance/cmmc, try resolving from project root
  if (normalizedRequested.startsWith('compliance/cmmc/')) {
    const fullPath = resolve(process.cwd(), normalizedRequested)
    const relativePath = relative(resolve(process.cwd(), 'compliance', 'cmmc'), fullPath)
    
    if (!relativePath.startsWith('..') && !relativePath.includes('..') && fullPath.endsWith('.md')) {
      return {
        valid: true,
        fullPath
      }
    }
  }
  
  return {
    valid: false,
    fullPath: null,
    error: 'Invalid path: file must be within compliance/cmmc directory structure'
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
            <MarkdownRenderer content={content} currentDocumentPath={requestedPath} />
          </div>
        </div>
      </div>
    </div>
  )
}

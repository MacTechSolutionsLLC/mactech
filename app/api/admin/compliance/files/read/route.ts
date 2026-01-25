import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/authz"
import { readFile } from "fs/promises"
import { join, normalize, resolve, relative } from "path"

export const dynamic = 'force-dynamic'

/**
 * Framework path mapping configuration
 */
interface FrameworkPathMapping {
  virtualPath: string // Virtual path prefix from API
  baseDir: string // Actual file system base directory
}

const FRAMEWORK_MAPPINGS: FrameworkPathMapping[] = [
  {
    virtualPath: 'cmmc-level2',
    baseDir: resolve(process.cwd(), 'compliance', 'cmmc', 'level2')
  },
  {
    virtualPath: 'nist-800-171',
    baseDir: resolve(process.cwd(), 'compliance', 'cmmc', 'level2')
  },
  {
    virtualPath: 'nist-csf-2.0',
    baseDir: resolve(process.cwd(), 'compliance', 'nist-csf-2.0')
  },
  {
    virtualPath: 'fedramp-moderate-alignment',
    baseDir: resolve(process.cwd(), 'compliance', 'fedramp-moderate-alignment')
  },
  {
    virtualPath: 'soc2-type1-readiness',
    baseDir: resolve(process.cwd(), 'compliance', 'soc2-type1-readiness')
  },
  {
    virtualPath: 'nist-rmf-alignment',
    baseDir: resolve(process.cwd(), 'compliance', 'nist-rmf-alignment')
  }
]

/**
 * Validates that the requested path is within the allowed directory
 * Maps virtual framework paths to actual file system paths
 * Prevents directory traversal attacks
 */
function validatePath(requestedPath: string): { valid: boolean; fullPath: string | null; error?: string } {
  // Normalize the requested path (remove .., ., etc.)
  const normalizedRequested = normalize(requestedPath)
  
  // Find matching framework mapping
  let baseDir: string | null = null
  let relativePath: string = normalizedRequested
  
  for (const mapping of FRAMEWORK_MAPPINGS) {
    if (normalizedRequested.startsWith(mapping.virtualPath + '/') || normalizedRequested === mapping.virtualPath) {
      baseDir = mapping.baseDir
      // Remove framework prefix to get relative path within framework directory
      relativePath = normalizedRequested.substring(mapping.virtualPath.length + 1) || ''
      break
    }
  }
  
  // If no framework mapping found, try legacy CMMC path
  if (!baseDir) {
    baseDir = resolve(process.cwd(), 'compliance', 'cmmc', 'level2')
    relativePath = normalizedRequested
  }
  
  // Resolve the full path
  const fullPath = relativePath ? resolve(baseDir, relativePath) : baseDir
  
  // Ensure the resolved path is within the base directory
  const pathRelative = relative(baseDir, fullPath)
  
  // Check for directory traversal attempts
  if (pathRelative.startsWith('..') || pathRelative.includes('..')) {
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

export async function GET(req: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin()
    
    // Get path from query parameters
    const { searchParams } = new URL(req.url)
    const requestedPath = searchParams.get('path')
    
    if (!requestedPath) {
      return NextResponse.json(
        { error: 'Path parameter is required' },
        { status: 400 }
      )
    }
    
    // Validate and resolve the path
    const validation = validatePath(requestedPath)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid path' },
        { status: 400 }
      )
    }
    
    const fullPath = validation.fullPath!
    
    // Read the file
    try {
      const content = await readFile(fullPath, 'utf-8')
      
      return NextResponse.json({
        content,
        path: requestedPath,
        filename: requestedPath.split('/').pop() || requestedPath
      })
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        )
      }
      
      if (error.code === 'EACCES') {
        return NextResponse.json(
          { error: 'Permission denied' },
          { status: 403 }
        )
      }
      
      throw error
    }
  } catch (error: any) {
    console.error('File read error:', error)
    
    // Handle authentication errors
    if (error.message?.includes('Admin') || error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to read file' },
      { status: 500 }
    )
  }
}

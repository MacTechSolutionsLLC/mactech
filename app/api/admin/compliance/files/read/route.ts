import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/authz"
import { readFile } from "fs/promises"
import { join, normalize, resolve, relative } from "path"

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

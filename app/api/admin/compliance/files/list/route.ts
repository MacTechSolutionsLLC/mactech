import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/authz"
import { readdir } from "fs/promises"
import { join } from "path"
import { stat } from "fs/promises"

export const dynamic = 'force-dynamic'

interface FileTreeItem {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: FileTreeItem[]
}

/**
 * Recursively build file tree structure
 */
async function buildFileTree(dirPath: string, relativePath: string = ''): Promise<FileTreeItem[]> {
  const items: FileTreeItem[] = []
  
  try {
    const entries = await readdir(dirPath, { withFileTypes: true })
    
    // Sort: folders first, then files, both alphabetically
    const sortedEntries = entries.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1
      if (!a.isDirectory() && b.isDirectory()) return 1
      return a.name.localeCompare(b.name)
    })
    
    for (const entry of sortedEntries) {
      const fullPath = join(dirPath, entry.name)
      const itemPath = relativePath ? `${relativePath}/${entry.name}` : entry.name
      
      if (entry.isDirectory()) {
        // Recursively get children
        const children = await buildFileTree(fullPath, itemPath)
        items.push({
          name: entry.name,
          path: itemPath,
          type: 'folder',
          children
        })
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Only include markdown files
        items.push({
          name: entry.name,
          path: itemPath,
          type: 'file'
        })
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error)
  }
  
  return items
}

export async function GET(req: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin()
    
    // Base directory for compliance files
    const baseDir = join(process.cwd(), "compliance", "cmmc", "level2")
    
    // Verify the directory exists
    try {
      const stats = await stat(baseDir)
      if (!stats.isDirectory()) {
        return NextResponse.json(
          { error: 'Compliance directory not found' },
          { status: 404 }
        )
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return NextResponse.json(
          { error: 'Compliance directory not found' },
          { status: 404 }
        )
      }
      throw error
    }
    
    // Build the file tree
    const tree = await buildFileTree(baseDir, '')
    
    return NextResponse.json({
      name: 'level2',
      path: '',
      type: 'folder' as const,
      children: tree
    })
  } catch (error: any) {
    console.error('File list error:', error)
    
    // Handle authentication errors
    if (error.message?.includes('Admin') || error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to list files' },
      { status: 500 }
    )
  }
}

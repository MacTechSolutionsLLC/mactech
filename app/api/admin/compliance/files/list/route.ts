import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/authz"
import { readdir } from "fs/promises"
import { join, resolve } from "path"
import { stat } from "fs/promises"

export const dynamic = 'force-dynamic'

interface FileTreeItem {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: FileTreeItem[]
}

/**
 * Framework directory configuration
 */
interface FrameworkConfig {
  name: string
  path: string // Virtual path for the framework folder
  baseDir: string // Actual file system path
}

const FRAMEWORKS: FrameworkConfig[] = [
  {
    name: 'CMMC 2.0 Level 2 compliance',
    path: 'cmmc-level2',
    baseDir: resolve(process.cwd(), 'compliance', 'cmmc', 'level2')
  },
  {
    name: 'NIST SP 800-171 Rev. 2 alignment',
    path: 'nist-800-171',
    baseDir: resolve(process.cwd(), 'compliance', 'cmmc', 'level2') // Same as CMMC
  },
  {
    name: 'NIST Cybersecurity Framework (CSF) 2.0 Profile',
    path: 'nist-csf-2.0',
    baseDir: resolve(process.cwd(), 'compliance', 'nist-csf-2.0')
  },
  {
    name: 'FedRAMP Moderate Design Alignment',
    path: 'fedramp-moderate-alignment',
    baseDir: resolve(process.cwd(), 'compliance', 'fedramp-moderate-alignment')
  },
  {
    name: 'SOC 2 Type I Readiness',
    path: 'soc2-type1-readiness',
    baseDir: resolve(process.cwd(), 'compliance', 'soc2-type1-readiness')
  },
  {
    name: 'NIST RMF Alignment',
    path: 'nist-rmf-alignment',
    baseDir: resolve(process.cwd(), 'compliance', 'nist-rmf-alignment')
  }
]

/**
 * Recursively build file tree structure
 */
async function buildFileTree(dirPath: string, relativePath: string = '', frameworkPath: string = ''): Promise<FileTreeItem[]> {
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
      // Prepend framework path for virtual path
      const virtualPath = frameworkPath ? `${frameworkPath}/${itemPath}` : itemPath
      
      if (entry.isDirectory()) {
        // Recursively get children
        const children = await buildFileTree(fullPath, itemPath, frameworkPath)
        items.push({
          name: entry.name,
          path: virtualPath,
          type: 'folder',
          children
        })
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Only include markdown files
        items.push({
          name: entry.name,
          path: virtualPath,
          type: 'file'
        })
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error)
  }
  
  return items
}

/**
 * Build framework folder tree
 */
async function buildFrameworkTree(): Promise<FileTreeItem[]> {
  const frameworkFolders: FileTreeItem[] = []
  
  for (const framework of FRAMEWORKS) {
    try {
      // Check if directory exists
      const stats = await stat(framework.baseDir)
      if (!stats.isDirectory()) {
        continue
      }
      
      // Build file tree for this framework
      const children = await buildFileTree(framework.baseDir, '', framework.path)
      
      frameworkFolders.push({
        name: framework.name,
        path: framework.path,
        type: 'folder',
        children
      })
    } catch (error: any) {
      // Skip frameworks whose directories don't exist
      if (error.code !== 'ENOENT') {
        console.error(`Error reading framework directory ${framework.baseDir}:`, error)
      }
    }
  }
  
  return frameworkFolders
}

export async function GET(req: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin()
    
    // Build framework-organized tree structure
    const frameworkFolders = await buildFrameworkTree()
    
    return NextResponse.json({
      name: 'Compliance Documents',
      path: '',
      type: 'folder' as const,
      children: frameworkFolders
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

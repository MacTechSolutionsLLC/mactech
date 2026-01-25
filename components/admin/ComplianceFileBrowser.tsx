'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ComplianceFileTree from './ComplianceFileTree'
import ComplianceDocumentViewer from './ComplianceDocumentViewer'

interface FileTreeItem {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: FileTreeItem[]
}

/**
 * Recursively find a path in the tree and collect all parent paths
 */
function findPathInTree(tree: FileTreeItem, targetPath: string): string[] {
  const paths: string[] = []
  
  function search(node: FileTreeItem, currentPath: string[]): boolean {
    // Add current node to path if it's not the root
    const newPath = node.path ? [...currentPath, node.path] : currentPath
    
    if (node.path === targetPath) {
      // Found the target - return all parent paths (excluding the target itself for expansion)
      paths.push(...currentPath)
      return true
    }
    
    if (node.children) {
      for (const child of node.children) {
        if (search(child, newPath)) {
          return true
        }
      }
    }
    
    return false
  }
  
  search(tree, [])
  return paths
}

export default function ComplianceFileBrowser() {
  const searchParams = useSearchParams()
  const [tree, setTree] = useState<FileTreeItem | null>(null)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load file tree on mount
  useEffect(() => {
    setLoading(true)
    setError(null)

    fetch('/api/admin/compliance/files/list')
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to load file tree')
        }
        return res.json()
      })
      .then((data) => {
        setTree(data)
        
        // Check for folder query parameter
        const folderParam = searchParams?.get('folder')
        if (folderParam && data) {
          // Find the folder path in the tree and expand all parents
          const pathsToExpand = findPathInTree(data, folderParam)
          if (pathsToExpand.length > 0) {
            // Expand all parent paths
            setExpandedPaths(new Set(pathsToExpand))
            // Select the target folder
            setSelectedPath(folderParam)
          } else {
            // If folder not found, just expand root
            setExpandedPaths(new Set(['']))
          }
        } else {
          // Expand root by default
          setExpandedPaths(new Set(['']))
        }
        
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error loading file tree:', err)
        setError(err.message || 'Failed to load file tree')
        setLoading(false)
      })
  }, [searchParams])

  const handleFileSelect = (path: string) => {
    setSelectedPath(path)
  }

  const handleToggleExpand = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const handleOpenInNewTab = (path: string) => {
    const documentUrl = `/admin/compliance/document?path=${encodeURIComponent(path)}`
    window.open(documentUrl, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-neutral-50 rounded-lg border border-neutral-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-sm text-neutral-600">Loading file tree...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-neutral-50 rounded-lg border border-neutral-200">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Error Loading File Tree
          </h3>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!tree) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-neutral-50 rounded-lg border border-neutral-200">
        <div className="text-center">
          <p className="text-sm text-neutral-500">No files found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[300px_1fr] h-[600px] bg-white rounded-lg border border-neutral-200 overflow-hidden min-h-0">
      {/* File Tree Panel */}
      <div className="min-h-0 overflow-hidden">
        <ComplianceFileTree
          tree={tree}
          selectedPath={selectedPath}
          onFileSelect={handleFileSelect}
          expandedPaths={expandedPaths}
          onToggleExpand={handleToggleExpand}
          onOpenInNewTab={handleOpenInNewTab}
        />
      </div>
      
      {/* Document Viewer Panel */}
      <div className="min-h-0 overflow-hidden">
        <ComplianceDocumentViewer filePath={selectedPath} />
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

interface FileTreeItem {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: FileTreeItem[]
}

interface ComplianceFileTreeProps {
  tree: FileTreeItem
  selectedPath: string | null
  onFileSelect: (path: string) => void
  expandedPaths: Set<string>
  onToggleExpand: (path: string) => void
  onOpenInNewTab?: (path: string) => void
}

interface TreeNodeProps {
  item: FileTreeItem
  level: number
  selectedPath: string | null
  onFileSelect: (path: string) => void
  expandedPaths: Set<string>
  onToggleExpand: (path: string) => void
  onOpenInNewTab?: (path: string) => void
}

function TreeNode({ item, level, selectedPath, onFileSelect, expandedPaths, onToggleExpand, onOpenInNewTab }: TreeNodeProps) {
  const isExpanded = expandedPaths.has(item.path)
  const isSelected = selectedPath === item.path
  const indent = level * 16

  if (item.type === 'folder') {
    const hasChildren = item.children && item.children.length > 0
    
    return (
      <div>
        <div
          className={`flex items-center py-1.5 px-2 hover:bg-neutral-100 cursor-pointer rounded transition-colors ${
            isSelected ? 'bg-primary-50 text-primary-700' : 'text-neutral-700'
          }`}
          style={{ paddingLeft: `${8 + indent}px` }}
          onClick={() => onToggleExpand(item.path)}
        >
          <span className="mr-2 text-sm">
            {isExpanded ? '📂' : '📁'}
          </span>
          <span className="text-sm font-medium flex-1">{item.name}</span>
          {hasChildren && (
            <span className="text-xs text-neutral-500 ml-2">
              ({item.children!.length})
            </span>
          )}
        </div>
        {isExpanded && hasChildren && (
          <div>
            {item.children!.map((child) => (
              <TreeNode
                key={child.path}
                item={child}
                level={level + 1}
                selectedPath={selectedPath}
                onFileSelect={onFileSelect}
                expandedPaths={expandedPaths}
                onToggleExpand={onToggleExpand}
                onOpenInNewTab={onOpenInNewTab}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // File node
  const documentUrl = `/admin/compliance/document?path=${encodeURIComponent(item.path)}`
  
  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Ctrl/Cmd + Click opens in new tab
      e.preventDefault()
      if (onOpenInNewTab) {
        onOpenInNewTab(item.path)
      } else {
        window.open(documentUrl, '_blank', 'noopener,noreferrer')
      }
    } else {
      onFileSelect(item.path)
    }
  }

  const handleOpenInNewTab = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onOpenInNewTab) {
      onOpenInNewTab(item.path)
    } else {
      window.open(documentUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      className={`group flex items-center py-1.5 px-2 hover:bg-neutral-100 cursor-pointer rounded transition-colors ${
        isSelected ? 'bg-primary-50 text-primary-700 font-medium' : 'text-neutral-600'
      }`}
      style={{ paddingLeft: `${8 + indent}px` }}
      onClick={handleClick}
    >
      <span className="mr-2 text-sm">📄</span>
      <span className="text-sm flex-1 truncate">{item.name}</span>
      <button
        onClick={handleOpenInNewTab}
        className="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-neutral-200 rounded transition-opacity"
        title="Open in new tab (Ctrl/Cmd+Click also works)"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <span className="text-xs">🔗</span>
      </button>
    </div>
  )
}

export default function ComplianceFileTree({
  tree,
  selectedPath,
  onFileSelect,
  expandedPaths,
  onToggleExpand,
  onOpenInNewTab
}: ComplianceFileTreeProps) {
  return (
    <div className="h-full overflow-y-auto border-r border-neutral-200 bg-neutral-50">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wide">
          Compliance Documents
        </h3>
        <div className="space-y-0.5">
          {tree.children && tree.children.length > 0 ? (
            tree.children.map((child) => (
              <TreeNode
                key={child.path}
                item={child}
                level={0}
                selectedPath={selectedPath}
                onFileSelect={onFileSelect}
                expandedPaths={expandedPaths}
                onToggleExpand={onToggleExpand}
                onOpenInNewTab={onOpenInNewTab}
              />
            ))
          ) : (
            <div className="text-sm text-neutral-500 py-4 text-center">
              No documents found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

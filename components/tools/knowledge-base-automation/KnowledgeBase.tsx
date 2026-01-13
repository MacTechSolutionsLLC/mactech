'use client'

import { useState, useEffect } from 'react'
import { FormBuilder, FormField } from '@/components/tools/FormBuilder'
import DataTable from '@/components/tools/DataTable'
import StatusBadge from '@/components/tools/StatusBadge'

export default function KnowledgeBase() {
  const [articles, setArticles] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadArticles()
  }, [])

  const loadArticles = async () => {
    try {
      const response = await fetch('/api/tools/knowledge-base-automation')
      const data = await response.json()
      if (data.success) {
        setArticles(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load articles:', err)
    }
  }

  const handleCreateArticle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const articleData = {
      title: formData.get('title'),
      content: formData.get('content'),
      category: formData.get('category'),
      tags: (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean) || [],
    }
    try {
      const response = await fetch('/api/tools/knowledge-base-automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData),
      })
      const data = await response.json()
      if (data.success) {
        await loadArticles()
        e.currentTarget.reset()
      }
    } catch (err) {
      console.error('Failed to create article:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`/api/tools/knowledge-base-automation?pathname=/search&query=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      if (data.success) {
        setSearchResults(data.data || [])
      }
    } catch (err) {
      console.error('Failed to search:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-3 mb-4">Search Knowledge Base</h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              Search
            </button>
          </form>
        </div>
        {searchResults.length > 0 && (
          <div className="mt-4 bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="heading-4 mb-4">Search Results</h3>
            <DataTable
              data={searchResults.map((result: any) => result.article)}
              columns={[
                { key: 'title', header: 'Title' },
                {
                  key: 'relevanceScore',
                  header: 'Relevance',
                  render: (item: any) => {
                    const result = searchResults.find((r: any) => r.article.id === item.id)
                    return result ? `${Math.round(result.relevanceScore * 100)}%` : 'N/A'
                  },
                },
                { key: 'views', header: 'Views' },
              ]}
            />
          </div>
        )}
      </div>

      <div>
        <h2 className="heading-3 mb-4">Create Knowledge Article</h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <FormBuilder onSubmit={handleCreateArticle} submitLabel="Create Article" isLoading={loading}>
            <FormField
              label="Title"
              name="title"
              type="text"
              placeholder="How to configure firewall rules"
              required
            />
            <FormField
              label="Content"
              name="content"
              type="textarea"
              placeholder="Article content..."
              required
            />
            <FormField
              label="Category"
              name="category"
              type="text"
              placeholder="Infrastructure"
            />
            <FormField
              label="Tags (comma-separated)"
              name="tags"
              type="text"
              placeholder="firewall, networking, security"
            />
          </FormBuilder>
        </div>
      </div>

      <div>
        <h2 className="heading-3 mb-4">Knowledge Articles</h2>
        <DataTable
          data={articles}
          columns={[
            { key: 'title', header: 'Title' },
            { key: 'category', header: 'Category' },
            {
              key: 'status',
              header: 'Status',
              render: (item) => (
                <StatusBadge
                  status={
                    item.status === 'published' ? 'success' :
                    item.status === 'archived' ? 'info' : 'pending'
                  }
                >
                  {item.status}
                </StatusBadge>
              ),
            },
            { key: 'views', header: 'Views' },
            {
              key: 'createdAt',
              header: 'Created',
              render: (item) => new Date(item.createdAt).toLocaleDateString(),
            },
          ]}
          emptyMessage="No articles found. Create your first article above."
        />
      </div>
    </div>
  )
}


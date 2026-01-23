'use client'

import React, { useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface SSPMarkdownRendererProps {
  content: string
  className?: string
}

interface CodeBlockProps {
  language: string
  code: string
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  
  // Detect ASCII diagrams (contain box drawing characters or multiple lines of monospace text)
  const isAsciiDiagram = code.includes('┌') || code.includes('│') || code.includes('└') || 
                         code.includes('─') || code.includes('├') || code.includes('┤') ||
                         (code.split('\n').length > 5 && code.length > 100)
  
  if (isAsciiDiagram) {
    return (
      <div className="my-6 rounded-lg border-2 border-blue-200 bg-blue-50/30 overflow-x-auto">
        <div className="bg-blue-100 px-4 py-2 border-b border-blue-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
            System Diagram
          </span>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-700 hover:text-blue-900 font-medium transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="p-6 text-sm font-mono text-gray-800 leading-relaxed whitespace-pre overflow-x-auto">
          {code}
        </pre>
      </div>
    )
  }
  
  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-300 shadow-sm">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs text-blue-700 hover:text-blue-900 font-medium transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        className="!m-0 !rounded-none"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          padding: '1rem',
          fontSize: '0.875rem',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

// Parse document metadata from markdown content
function parseDocumentMetadata(content: string) {
  const lines = content.split('\n').slice(0, 15)
  const metadata: Record<string, string> = {}
  
  for (const line of lines) {
    const match = line.match(/\*\*([^*]+):\*\*\s*(.+)/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim()
      metadata[key] = value
    }
  }
  
  return metadata
}

export default function SSPMarkdownRenderer({ content, className = '' }: SSPMarkdownRendererProps) {
  const documentMetadata = useMemo(() => parseDocumentMetadata(content), [content])
  
  // Extract title (first h1)
  const titleMatch = content.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1] : 'System Security Plan'
  
  // Remove metadata section from content for rendering (we'll render it separately)
  // Keep everything after the first horizontal rule (---)
  const parts = content.split('---')
  const contentWithoutMetadata = parts.length > 1 ? parts.slice(1).join('---') : content
  
  return (
    <div className={`ssp-document max-w-5xl mx-auto ${className}`}>
      {/* Professional Document Header */}
      <div className="mb-12 border-b-4 border-blue-800 pb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center tracking-tight">
          {title}
        </h1>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 border border-gray-300 rounded-lg p-6 shadow-sm">
          {documentMetadata['Document Version'] && (
            <div className="flex">
              <span className="font-semibold text-gray-700 min-w-[140px]">Document Version:</span>
              <span className="text-gray-900">{documentMetadata['Document Version']}</span>
            </div>
          )}
          {documentMetadata['Date'] && (
            <div className="flex">
              <span className="font-semibold text-gray-700 min-w-[140px]">Date:</span>
              <span className="text-gray-900">{documentMetadata['Date']}</span>
            </div>
          )}
          {documentMetadata['Classification'] && (
            <div className="flex">
              <span className="font-semibold text-gray-700 min-w-[140px]">Classification:</span>
              <span className="text-gray-900">{documentMetadata['Classification']}</span>
            </div>
          )}
          {documentMetadata['Compliance Framework'] && (
            <div className="flex">
              <span className="font-semibold text-gray-700 min-w-[140px]">Framework:</span>
              <span className="text-gray-900">{documentMetadata['Compliance Framework']}</span>
            </div>
          )}
          {documentMetadata['Reference'] && (
            <div className="flex">
              <span className="font-semibold text-gray-700 min-w-[140px]">Reference:</span>
              <span className="text-gray-900">{documentMetadata['Reference']}</span>
            </div>
          )}
          {documentMetadata['Applies to'] && (
            <div className="md:col-span-2 flex">
              <span className="font-semibold text-gray-700 min-w-[140px]">Applies to:</span>
              <span className="text-gray-900">{documentMetadata['Applies to']}</span>
            </div>
          )}
        </div>
      </div>

      {/* Document Content */}
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Headings with professional styling
            h1: ({ node, ...props }) => (
              <h1
                className="text-3xl font-bold text-gray-900 mt-12 mb-6 pb-3 border-b-2 border-blue-600 first:mt-0"
                {...props}
              />
            ),
            h2: ({ node, ...props }) => (
              <h2
                className="text-2xl font-bold text-gray-800 mt-10 mb-4 pt-2 text-blue-900"
                {...props}
              />
            ),
            h3: ({ node, ...props }) => (
              <h3
                className="text-xl font-semibold text-gray-800 mt-8 mb-3 text-gray-900"
                {...props}
              />
            ),
            h4: ({ node, ...props }) => (
              <h4
                className="text-lg font-semibold text-gray-800 mt-6 mb-2 text-gray-900"
                {...props}
              />
            ),
            
            // Paragraphs with professional spacing
            p: ({ node, ...props }) => (
              <p className="text-gray-800 leading-relaxed mb-5 text-base" {...props} />
            ),
            
            // Lists with professional styling
            ul: ({ node, ...props }) => (
              <ul className="list-disc list-outside mb-5 space-y-2 text-gray-800 ml-6" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal list-outside mb-5 space-y-2 text-gray-800 ml-6" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="ml-2 leading-relaxed" {...props} />
            ),
            
            // Task lists (checkboxes)
            input: ({ node, ...props }) => {
              if (props.type === 'checkbox') {
                return (
                  <input
                    type="checkbox"
                    className="mr-2 accent-blue-600"
                    disabled
                    checked={props.checked || false}
                    {...props}
                  />
                )
              }
              return <input {...props} />
            },
            
            // Links with professional styling
            a: ({ node, ...props }) => (
              <a
                className="text-blue-700 hover:text-blue-900 underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              />
            ),
            
            // Code blocks with syntax highlighting
            code: ({ node, inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '')
              const language = match ? match[1] : ''
              
              if (!inline && language) {
                const codeContent = String(children).replace(/\n$/, '')
                return <CodeBlock key={`code-${codeContent.substring(0, 20)}`} language={language} code={codeContent} />
              }
              
              // Inline code
              return (
                <code
                  className="bg-gray-100 text-blue-900 px-2 py-1 rounded text-sm font-mono border border-gray-300"
                  {...props}
                >
                  {children}
                </code>
              )
            },
            
            // Professional tables
            table: ({ node, ...props }) => (
              <div className="my-8 overflow-x-auto -mx-4 sm:mx-0 print:overflow-visible">
                <div className="inline-block min-w-full align-middle">
                  <table
                    className="min-w-full divide-y divide-gray-300 border-2 border-gray-400 rounded-lg shadow-md bg-white"
                    {...props}
                  />
                </div>
              </div>
            ),
            thead: ({ node, ...props }) => (
              <thead className="bg-blue-900 text-white" {...props} />
            ),
            tbody: ({ node, ...props }) => (
              <tbody className="bg-white divide-y divide-gray-200 [&>tr:nth-child(even)]:bg-gray-50 [&>tr:hover]:bg-blue-50" {...props} />
            ),
            tr: ({ node, ...props }) => (
              <tr className="transition-colors" {...props} />
            ),
            th: ({ node, ...props }) => (
              <th
                className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider border-b-2 border-gray-400 whitespace-nowrap text-white"
                {...props}
              />
            ),
            td: ({ node, ...props }) => (
              <td
                className="px-6 py-4 text-sm text-gray-800 border-b border-gray-200 align-top leading-relaxed"
                {...props}
              />
            ),
            
            // Blockquotes with professional styling
            blockquote: ({ node, ...props }) => (
              <blockquote
                className="border-l-4 border-blue-600 pl-6 italic text-gray-700 my-6 bg-blue-50 py-4 rounded-r-lg"
                {...props}
              />
            ),
            
            // Horizontal rules as section separators
            hr: ({ node, ...props }) => (
              <hr className="my-12 border-t-2 border-gray-400 print:page-break-before-auto" {...props} />
            ),
            
            // Strong/Bold
            strong: ({ node, ...props }) => (
              <strong className="font-bold text-gray-900" {...props} />
            ),
            
            // Emphasis/Italic
            em: ({ node, ...props }) => (
              <em className="italic text-gray-700" {...props} />
            ),
          }}
        >
          {contentWithoutMetadata}
        </ReactMarkdown>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .ssp-document {
            max-width: 100%;
            padding: 0;
          }
          .ssp-document h1 {
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          .ssp-document h2 {
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          .ssp-document h3 {
            page-break-after: avoid;
          }
          .ssp-document table {
            page-break-inside: avoid;
          }
          .ssp-document pre {
            page-break-inside: avoid;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .ssp-document blockquote {
            page-break-inside: avoid;
          }
        }
      `}} />
    </div>
  )
}

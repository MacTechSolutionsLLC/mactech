'use client'

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MarkdownRendererProps {
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
  
  return (
    <div className="my-4 rounded-lg overflow-hidden border border-neutral-200">
      <div className="bg-neutral-100 px-4 py-2 border-b border-neutral-200 flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-600 uppercase">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
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

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-neutral max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings with anchor links
          h1: ({ node, ...props }) => (
            <h1
              className="text-3xl font-bold text-neutral-900 mt-8 mb-4 pb-2 border-b border-neutral-200"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-2xl font-semibold text-neutral-800 mt-6 mb-3 pt-2"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-xl font-semibold text-neutral-700 mt-4 mb-2"
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              className="text-lg font-semibold text-neutral-700 mt-3 mb-2"
              {...props}
            />
          ),
          
          // Paragraphs
          p: ({ node, ...props }) => (
            <p className="text-neutral-700 leading-relaxed mb-4" {...props} />
          ),
          
          // Lists
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-4 space-y-2 text-neutral-700" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2 text-neutral-700" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="ml-4" {...props} />
          ),
          
          // Task lists (checkboxes)
          input: ({ node, ...props }) => {
            if (props.type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  className="mr-2 accent-primary-600"
                  disabled
                  checked={props.checked || false}
                  {...props}
                />
              )
            }
            return <input {...props} />
          },
          
          // Links
          a: ({ node, ...props }) => (
            <a
              className="text-primary-600 hover:text-primary-700 underline font-medium"
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
                className="bg-neutral-100 text-primary-700 px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            )
          },
          
          // Tables
          table: ({ node, ...props }) => (
            <div className="my-6 overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table
                  className="min-w-full divide-y divide-neutral-200 border border-neutral-200 rounded-lg shadow-sm"
                  {...props}
                />
              </div>
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-neutral-50" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="bg-white divide-y divide-neutral-200" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-neutral-50 transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200 whitespace-nowrap"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="px-4 py-3 text-sm text-neutral-700 border-b border-neutral-100 align-top"
              {...props}
            />
          ),
          
          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-primary-500 pl-4 italic text-neutral-600 my-4"
              {...props}
            />
          ),
          
          // Horizontal rules
          hr: ({ node, ...props }) => (
            <hr className="my-8 border-neutral-200" {...props} />
          ),
          
          // Strong/Bold
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-neutral-900" {...props} />
          ),
          
          // Emphasis/Italic
          em: ({ node, ...props }) => (
            <em className="italic text-neutral-700" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

'use client'

import { useState } from 'react'

interface Deliverables {
  executive_summary?: string
  competitive_brief?: string
  pricing_strategy?: string
  proposal_guidance?: string
  risk_assessment?: string
}

interface DeliverablesExportProps {
  contractTitle: string
  deliverables: Deliverables
  strategicInsights?: {
    win_probability?: number
    pricing_recommendation?: string
  }
}

export default function DeliverablesExport({ contractTitle, deliverables, strategicInsights }: DeliverablesExportProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | 'txt'>('txt')

  const exportAsText = () => {
    const content = buildExportContent()
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${contractTitle.replace(/[^a-z0-9]/gi, '_')}_enrichment_analysis.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportAsMarkdown = () => {
    const content = buildMarkdownContent()
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${contractTitle.replace(/[^a-z0-9]/gi, '_')}_enrichment_analysis.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const buildExportContent = (): string => {
    let content = `CONTRACT ENRICHMENT ANALYSIS REPORT\n`
    content += `=====================================\n\n`
    content += `Contract: ${contractTitle}\n`
    content += `Generated: ${new Date().toLocaleString()}\n\n`

    if (strategicInsights) {
      content += `STRATEGIC INSIGHTS\n`
      content += `------------------\n`
      if (strategicInsights.win_probability !== undefined) {
        content += `Win Probability: ${strategicInsights.win_probability}%\n\n`
      }
      if (strategicInsights.pricing_recommendation) {
        content += `Pricing Recommendation: ${strategicInsights.pricing_recommendation}\n\n`
      }
    }

    if (deliverables.executive_summary) {
      content += `EXECUTIVE SUMMARY\n`
      content += `------------------\n`
      content += `${deliverables.executive_summary}\n\n`
    }

    if (deliverables.competitive_brief) {
      content += `COMPETITIVE INTELLIGENCE BRIEF\n`
      content += `------------------------------\n`
      content += `${deliverables.competitive_brief}\n\n`
    }

    if (deliverables.pricing_strategy) {
      content += `PRICING STRATEGY\n`
      content += `----------------\n`
      content += `${deliverables.pricing_strategy}\n\n`
    }

    if (deliverables.proposal_guidance) {
      content += `PROPOSAL GUIDANCE\n`
      content += `-----------------\n`
      content += `${deliverables.proposal_guidance}\n\n`
    }

    if (deliverables.risk_assessment) {
      content += `RISK ASSESSMENT\n`
      content += `----------------\n`
      content += `${deliverables.risk_assessment}\n\n`
    }

    return content
  }

  const buildMarkdownContent = (): string => {
    let content = `# Contract Enrichment Analysis Report\n\n`
    content += `**Contract:** ${contractTitle}\n\n`
    content += `**Generated:** ${new Date().toLocaleString()}\n\n`

    if (strategicInsights) {
      content += `## Strategic Insights\n\n`
      if (strategicInsights.win_probability !== undefined) {
        content += `### Win Probability: ${strategicInsights.win_probability}%\n\n`
      }
      if (strategicInsights.pricing_recommendation) {
        content += `### Pricing Recommendation\n\n${strategicInsights.pricing_recommendation}\n\n`
      }
    }

    if (deliverables.executive_summary) {
      content += `## Executive Summary\n\n${deliverables.executive_summary}\n\n`
    }

    if (deliverables.competitive_brief) {
      content += `## Competitive Intelligence Brief\n\n${deliverables.competitive_brief}\n\n`
    }

    if (deliverables.pricing_strategy) {
      content += `## Pricing Strategy\n\n${deliverables.pricing_strategy}\n\n`
    }

    if (deliverables.proposal_guidance) {
      content += `## Proposal Guidance\n\n${deliverables.proposal_guidance}\n\n`
    }

    if (deliverables.risk_assessment) {
      content += `## Risk Assessment\n\n${deliverables.risk_assessment}\n\n`
    }

    return content
  }

  const handleExport = async (format: 'txt' | 'md') => {
    setIsExporting(true)
    try {
      if (format === 'txt') {
        exportAsText()
      } else {
        exportAsMarkdown()
      }
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handlePrint = () => {
    const content = buildMarkdownContent()
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${contractTitle} - Enrichment Analysis</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
              h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
              h2 { border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 30px; }
              h3 { color: #555; margin-top: 20px; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <pre>${content.replace(/#/g, '').replace(/\*\*/g, '')}</pre>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Export Deliverables</h3>
      <p className="text-sm text-gray-600 mb-4">
        Export AI-generated analysis and deliverables for use in proposals and decision-making.
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleExport('txt')}
          disabled={isExporting}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? 'Exporting...' : '📄 Export as TXT'}
        </button>

        <button
          onClick={() => handleExport('md')}
          disabled={isExporting}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? 'Exporting...' : '📝 Export as Markdown'}
        </button>

        <button
          onClick={handlePrint}
          disabled={isExporting}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🖨️ Print
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Note: PDF and DOCX export coming soon. For now, use TXT or Markdown export, or print to PDF from your browser.
      </p>
    </div>
  )
}


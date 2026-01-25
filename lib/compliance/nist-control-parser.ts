/**
 * NIST Control Parser Utility
 * Parses NIST SP 800-171 control assessment markdown files and extracts structured data
 */

import { readFile } from 'fs/promises'
import { join } from 'path'

export interface CodeSnippet {
  language: string
  code: string
  file: string
  lines?: string
}

export interface CodeFile {
  file: string
  lines?: string
  description?: string
}

export interface TestingInfo {
  methods: string[]
  results: string[]
  lastVerificationDate?: string
}

export interface AssessmentNotes {
  openItems: string[]
  assessorNotes: string
}

export interface NISTControlData {
  controlId: string
  requirement: string
  family: string
  status: string
  implementation: {
    codeFiles: CodeFile[]
    codeSnippets: CodeSnippet[]
    implementationSummary: string
  }
  evidence: {
    files: string[]
    descriptions: string[]
  }
  testing: TestingInfo
  assessment: AssessmentNotes
  documentControl: {
    preparedDate: string
    lastReviewDate?: string
    version: string
  }
}

/**
 * Extract control metadata from the header
 */
function extractMetadata(content: string): { controlId: string; requirement: string; family: string; status: string } {
  const controlIdMatch = content.match(/\*\*Control ID:\*\*\s+([\d.]+)/)
  const requirementMatch = content.match(/\*\*Requirement:\*\*\s+(.+?)(?:\n|\*\*)/)
  const familyMatch = content.match(/\*\*Control Family:\*\*\s+([^(]+)\(([A-Z]+)\)/)
  const statusMatch = content.match(/## 2\. Implementation Status[\s\S]*?\*\*Status:\*\*\s*([✅🔄⚠️❌🚫]+)\s*([^\n]+)/)

  return {
    controlId: controlIdMatch?.[1] || '',
    requirement: requirementMatch?.[1]?.trim() || '',
    family: familyMatch?.[2] || '',
    status: statusMatch?.[1] || statusMatch?.[2]?.trim() || '',
  }
}

/**
 * Extract code files and snippets from Section 4.1
 */
function extractCodeImplementation(content: string): { codeFiles: CodeFile[]; codeSnippets: CodeSnippet[]; implementationSummary: string } {
  const codeFiles: CodeFile[] = []
  const codeSnippets: CodeSnippet[] = []
  let implementationSummary = ''

  // Extract "Implementation Location" section
  const implementationLocationMatch = content.match(/### 4\.1 Code Implementation[\s\S]*?\*\*Implementation Location:\*\*\s*\n((?:- `[^`]+`[^\n]*\n?)+)/)
  if (implementationLocationMatch) {
    const locations = implementationLocationMatch[1].match(/- `([^`]+)`[^\n]*(?:- ([^\n]+))?/g)
    if (locations) {
      locations.forEach(loc => {
        const fileMatch = loc.match(/`([^`]+)`/)
        const descMatch = loc.match(/- `[^`]+`\s*-\s*(.+)/)
        if (fileMatch) {
          codeFiles.push({
            file: fileMatch[1],
            description: descMatch?.[1]?.trim(),
          })
        }
      })
    }
  }

  // Extract code snippets (code blocks with file references)
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  let match
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const language = match[1] || 'text'
    const code = match[2]
    
    // Look for file reference before the code block
    const beforeBlock = content.substring(0, match.index)
    const fileMatch = beforeBlock.match(/\*\*File:\*\*\s*`([^`]+)`/i) || 
                     beforeBlock.match(/`([^`]+)`[^\n]*\n\s*```/i)
    
    if (fileMatch) {
      codeSnippets.push({
        language,
        code: code.trim(),
        file: fileMatch[1],
      })
    }
  }

  // Extract implementation summary from Section 4
  const summaryMatch = content.match(/## 4\. Implementation Evidence[\s\S]*?(?=## 5\.|$)/)
  if (summaryMatch) {
    // Extract text before code blocks as summary
    const summaryText = summaryMatch[0]
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\*\*[^*]+\*\*/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .trim()
      .substring(0, 500)
    implementationSummary = summaryText
  }

  return { codeFiles, codeSnippets, implementationSummary }
}

/**
 * Extract evidence file references from Section 5
 */
function extractEvidenceReferences(content: string): { files: string[]; descriptions: string[] } {
  const files: string[] = []
  const descriptions: string[] = []

  // Extract from Section 5
  const evidenceSectionMatch = content.match(/## 5\. Evidence Documents[\s\S]*?(?=## 6\.|$)/)
  if (evidenceSectionMatch) {
    // Look for MAC-RPT file references in code blocks
    const fileMatches = evidenceSectionMatch[0].matchAll(/`([^`]+MAC-RPT[^`]+)`/g)
    for (const match of fileMatches) {
      let file = match[1].replace(/^\.\.\//, '').replace(/\.md$/, '')
      // Clean up any extra text
      file = file.split('`')[0].trim()
      if (file && file.includes('MAC-RPT') && !files.includes(file)) {
        files.push(file)
      }
    }

    // Also look for bullet lists (more flexible pattern)
    const bulletMatches = evidenceSectionMatch[0].matchAll(/[-*]\s*`([^`]+)`/g)
    for (const match of bulletMatches) {
      let file = match[1].trim().replace(/^\.\.\//, '').replace(/\.md$/, '')
      if (file && (file.includes('MAC-RPT') || file.includes('MAC-')) && !files.includes(file)) {
        files.push(file)
      }
    }
    
    // Remove any invalid entries (filter in place)
    const validFiles = files.filter(f => !f.includes('**') && !f.includes('Evidence Files') && f.length > 5)
    files.length = 0
    files.push(...validFiles)
  }

  return { files, descriptions }
}

/**
 * Extract testing and verification information from Section 6
 */
function extractTestingInfo(content: string): TestingInfo {
  const methods: string[] = []
  const results: string[] = []
  let lastVerificationDate: string | undefined

  const testingSectionMatch = content.match(/## 6\. Testing and Verification[\s\S]*?(?=## 7\.|$)/)
  if (testingSectionMatch) {
    // Extract verification methods
    const methodsMatch = testingSectionMatch[0].match(/\*\*Verification Methods:\*\*\s*\n((?:- [^\n]+\n?)+)/)
    if (methodsMatch) {
      const methodList = methodsMatch[1].matchAll(/- ([^\n]+)/g)
      for (const match of methodList) {
        methods.push(match[1].trim())
      }
    }

    // Extract test results
    const resultsMatch = testingSectionMatch[0].match(/\*\*Test Results:\*\*\s*\n((?:- [^\n]+\n?)+)/)
    if (resultsMatch) {
      const resultList = resultsMatch[1].matchAll(/- ([^\n]+)/g)
      for (const match of resultList) {
        results.push(match[1].trim())
      }
    }

    // Extract last verification date
    const dateMatch = testingSectionMatch[0].match(/\*\*Last Verification Date:\*\*\s*([^\n]+)/)
    if (dateMatch) {
      lastVerificationDate = dateMatch[1].trim()
    }
  }

  return { methods, results, lastVerificationDate }
}

/**
 * Extract assessment notes from Section 9
 */
function extractAssessmentNotes(content: string): AssessmentNotes {
  const openItems: string[] = []
  let assessorNotes = ''

  const assessmentSectionMatch = content.match(/## 9\. Assessment Notes[\s\S]*?(?=## 10\.|$)/)
  if (assessmentSectionMatch) {
    // Extract open items
    const openItemsMatch = assessmentSectionMatch[0].match(/### Open Items\s*\n((?:- [^\n]+\n?)+)/)
    if (openItemsMatch) {
      const itemsList = openItemsMatch[1].matchAll(/- ([^\n]+)/g)
      for (const match of itemsList) {
        const item = match[1].trim()
        if (item.toLowerCase() !== 'none' && item !== '-') {
          openItems.push(item)
        }
      }
    }

    // Extract assessor notes
    const notesMatch = assessmentSectionMatch[0].match(/### Assessor Notes\s*\n([\s\S]*?)(?=###|$)/)
    if (notesMatch) {
      assessorNotes = notesMatch[1].trim()
      // Clean up placeholder text
      if (assessorNotes.includes('[Space for assessor notes') || assessorNotes.includes('*[Space')) {
        assessorNotes = ''
      }
    }
  }

  return { openItems, assessorNotes }
}

/**
 * Extract document control information from Section 10
 */
function extractDocumentControl(content: string): { preparedDate: string; lastReviewDate?: string; version: string } {
  let preparedDate = ''
  let lastReviewDate: string | undefined
  let version = ''

  const docControlSectionMatch = content.match(/## 10\. Document Control[\s\S]*?(?=## Related|$)/)
  if (docControlSectionMatch) {
    const preparedMatch = docControlSectionMatch[0].match(/\*\*Prepared Date:\*\*\s*([^\n]+)/)
    if (preparedMatch) {
      preparedDate = preparedMatch[1].trim()
    }

    const reviewMatch = docControlSectionMatch[0].match(/\*\*Next Review Date:\*\*\s*([^\n]+)/)
    if (reviewMatch) {
      lastReviewDate = reviewMatch[1].trim()
    }

    // Extract version from change history
    const versionMatch = docControlSectionMatch[0].match(/Version\s+([\d.]+)/i)
    if (versionMatch) {
      version = versionMatch[1]
    }
  }

  return { preparedDate, lastReviewDate, version }
}

/**
 * Parse a NIST control markdown file and extract structured data
 */
export async function parseNISTControlFile(filePath: string): Promise<NISTControlData> {
  const content = await readFile(filePath, 'utf-8')
  
  const metadata = extractMetadata(content)
  const codeImplementation = extractCodeImplementation(content)
  const evidence = extractEvidenceReferences(content)
  const testing = extractTestingInfo(content)
  const assessment = extractAssessmentNotes(content)
  const documentControl = extractDocumentControl(content)

  return {
    controlId: metadata.controlId,
    requirement: metadata.requirement,
    family: metadata.family,
    status: metadata.status,
    implementation: {
      codeFiles: codeImplementation.codeFiles,
      codeSnippets: codeImplementation.codeSnippets,
      implementationSummary: codeImplementation.implementationSummary,
    },
    evidence,
    testing,
    assessment,
    documentControl: {
      preparedDate: documentControl.preparedDate,
      lastReviewDate: documentControl.lastReviewDate,
      version: documentControl.version,
    },
  }
}

/**
 * Parse all NIST control files in a directory
 */
export async function parseAllNISTControls(directory: string): Promise<Map<string, NISTControlData>> {
  const { readdir } = await import('fs/promises')
  const files = await readdir(directory)
  const nistFiles = files.filter(f => f.startsWith('NIST-') && f.endsWith('.md'))
  
  const controls = new Map<string, NISTControlData>()
  
  for (const file of nistFiles) {
    try {
      const filePath = join(directory, file)
      const data = await parseNISTControlFile(filePath)
      if (data.controlId) {
        controls.set(data.controlId, data)
      }
    } catch (error) {
      console.error(`Error parsing ${file}:`, error)
    }
  }
  
  return controls
}

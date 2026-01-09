import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
// @ts-ignore - mammoth doesn't have TypeScript types
import mammoth from 'mammoth'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } from 'docx'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Ensure uploads directory exists
const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads')
const OUTPUT_DIR = join(process.cwd(), 'public', 'output')

async function ensureDirectories() {
  if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true })
  }
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
  }
}

async function extractTextFromFile(file: { arrayBuffer: () => Promise<ArrayBuffer>; name: string }): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const extension = file.name.split('.').pop()?.toLowerCase()

  switch (extension) {
    case 'pdf':
      // Use dynamic import for pdf-parse to avoid ES module issues in production
      // pdf-parse can export differently in different environments (function vs class)
      try {
        const pdfParseModule: any = await import('pdf-parse')
        
        // pdf-parse typically exports a function, but in production builds it might be a class
        // Try multiple approaches to handle both cases
        let pdfData: any
        
        // Strategy 1: Try default export as function
        if (pdfParseModule.default) {
          try {
            pdfData = await pdfParseModule.default(buffer)
          } catch (funcError: any) {
            // If function call fails with "cannot be invoked without 'new'", try as class
            if (funcError?.message?.includes('cannot be invoked without') || 
                funcError?.message?.includes('Class constructor')) {
              pdfData = await new pdfParseModule.default(buffer)
            } else {
              throw funcError
            }
          }
        }
        // Strategy 2: Try PDFParse named export
        else if (pdfParseModule.PDFParse) {
          try {
            pdfData = await pdfParseModule.PDFParse(buffer)
          } catch (funcError: any) {
            if (funcError?.message?.includes('cannot be invoked without') || 
                funcError?.message?.includes('Class constructor')) {
              pdfData = await new pdfParseModule.PDFParse(buffer)
            } else {
              throw funcError
            }
          }
        }
        // Strategy 3: Try module itself (for CommonJS compatibility)
        else {
          // Find the actual parse function/class
          const possibleExports = [
            pdfParseModule.default,
            pdfParseModule.PDFParse,
            ...Object.values(pdfParseModule).filter((v: any) => typeof v === 'function')
          ]
          
          for (const pdfExport of possibleExports) {
            if (!pdfExport) continue
            
            try {
              pdfData = await pdfExport(buffer)
              break
            } catch (tryError: any) {
              if (tryError?.message?.includes('cannot be invoked without') || 
                  tryError?.message?.includes('Class constructor')) {
                try {
                  pdfData = await new pdfExport(buffer)
                  break
                } catch {
                  continue
                }
              }
            }
          }
          
          if (!pdfData) {
            throw new Error('Could not find or execute pdf-parse function')
          }
        }
        
        // Ensure we return a string
        const extractedText = pdfData?.text || (typeof pdfData === 'string' ? pdfData : '')
        return extractedText || ''
      } catch (error) {
        console.error('Error parsing PDF:', error)
        throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    case 'docx':
    case 'doc':
      const docxResult = await mammoth.extractRawText({ buffer })
      return docxResult.value
    case 'txt':
      return buffer.toString('utf-8')
    default:
      throw new Error(`Unsupported file type: ${extension}`)
  }
}

function extractSOWInfo(text: string) {
  // Extract key information from SOW text using advanced pattern matching
  const info: Record<string, string> = {
    title: '',
    description: '',
    requirements: '',
    deliverables: '',
    timeline: '',
    budget: '',
    objectives: '',
    background: '',
    technicalApproach: '',
    performanceRequirements: '',
  }

  // Ensure text is a string
  if (typeof text !== 'string') {
    console.warn('extractSOWInfo received non-string value:', typeof text)
    return info
  }

  if (!text || text.trim().length === 0) {
    return info
  }

  // Normalize text - replace multiple spaces/newlines with single space for better matching
  const normalizedText = text.replace(/\s+/g, ' ').trim()
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  // Extract title - look for various patterns
  const titlePatterns = [
    /(?:Statement of Work|SOW|Performance Work Statement|PWS)[\s:]+([^\n]{10,150})/i,
    /^([A-Z][^\n]{10,150}?)(?:\n|$)/m,
    /(?:Title|Subject)[\s:]+([^\n]{10,150})/i,
  ]
  
  for (const pattern of titlePatterns) {
    const match = text.match(pattern)
    if (match && match[1] && match[1].trim().length > 10) {
      info.title = match[1].trim()
      break
    }
  }

  // Extract background/description - look for multiple section headers
  const backgroundPatterns = [
    /(?:Background|Introduction|Overview|Purpose)[\s:]+([^\n]{50,2000})/is,
    /(?:1\.|Section 1|1\s+Background)[\s:]+([^\n]{50,2000})/is,
  ]
  
  for (const pattern of backgroundPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      info.background = match[1].trim().substring(0, 2000)
      break
    }
  }

  // Extract description/scope - comprehensive extraction
  const scopePatterns = [
    /(?:Scope of Work|Scope|Work Scope|Statement of Objectives)[\s:]+([^\n]{50,3000})/is,
    /(?:2\.|Section 2|2\s+Scope)[\s:]+([^\n]{50,3000})/is,
    /(?:Description|Work Description)[\s:]+([^\n]{50,2000})/is,
  ]
  
  for (const pattern of scopePatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      info.description = match[1].trim().substring(0, 3000)
      break
    }
  }

  // Extract objectives
  const objectivesPatterns = [
    /(?:Objectives|Goals|Purpose|Aim)[\s:]+([^\n]{50,2000})/is,
    /(?:3\.|Section 3)[\s:]+(?:Objectives|Goals)[\s:]+([^\n]{50,2000})/is,
  ]
  
  for (const pattern of objectivesPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      info.objectives = match[1].trim().substring(0, 2000)
      break
    }
  }

  // Extract requirements - comprehensive extraction with multiple patterns
  const reqPatterns = [
    /(?:Requirements|Technical Requirements|Functional Requirements|Performance Requirements)[\s:]+([^\n]{100,5000})/is,
    /(?:4\.|Section 4)[\s:]+(?:Requirements)[\s:]+([^\n]{100,5000})/is,
    /(?:The contractor shall|Contractor shall|Shall)[\s:]+([^\n]{50,3000})/is,
  ]
  
  let requirementsText = ''
  for (const pattern of reqPatterns) {
    const matches = text.matchAll(new RegExp(pattern.source, 'gi'))
    for (const match of matches) {
      if (match[1]) {
        requirementsText += match[1].trim() + '\n\n'
      }
    }
  }
  if (requirementsText) {
    info.requirements = requirementsText.trim().substring(0, 5000)
  }

  // Extract deliverables - look for lists and sections
  const delivPatterns = [
    /(?:Deliverables|Deliverable Items|Contract Deliverables)[\s:]+([^\n]{50,3000})/is,
    /(?:5\.|Section 5)[\s:]+(?:Deliverables)[\s:]+([^\n]{50,3000})/is,
    /(?:The following deliverables|Deliverables include|Deliverables are)[\s:]+([^\n]{50,3000})/is,
  ]
  
  for (const pattern of delivPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      info.deliverables = match[1].trim().substring(0, 3000)
      break
    }
  }

  // Extract timeline/schedule - look for dates, durations, periods
  const timelinePatterns = [
    /(?:Period of Performance|POP|Timeline|Schedule|Duration)[\s:]+([^\n]{20,500})/i,
    /(?:Start Date|End Date|Completion Date)[\s:]+([^\n]{20,300})/i,
    /(?:The period of performance|Performance period)[\s:]+([^\n]{20,500})/i,
    /(?:months|years|weeks|days)[\s:]+([^\n]{10,200})/i,
  ]
  
  for (const pattern of timelinePatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      info.timeline = match[1].trim().substring(0, 500)
      break
    }
  }

  // Extract budget/cost - comprehensive pattern matching
  const budgetPatterns = [
    /(?:Budget|Total Cost|Estimated Cost|Contract Value|Not to Exceed|NTE)[\s:]+[\$]?([0-9,]+(?:\.[0-9]{2})?)/i,
    /[\$]([0-9,]+(?:\.[0-9]{2})?)[\s:]+(?:million|thousand|M|K)/i,
    /(?:Cost|Price|Amount)[\s:]+[\$]?([0-9,]+(?:\.[0-9]{2})?)/i,
  ]
  
  for (const pattern of budgetPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      info.budget = match[1]
      break
    }
  }

  // Extract technical approach if mentioned
  const techApproachPatterns = [
    /(?:Technical Approach|Approach|Methodology)[\s:]+([^\n]{50,2000})/is,
    /(?:6\.|Section 6)[\s:]+(?:Approach|Methodology)[\s:]+([^\n]{50,2000})/is,
  ]
  
  for (const pattern of techApproachPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      info.technicalApproach = match[1].trim().substring(0, 2000)
      break
    }
  }

  // If description is still empty, use first substantial paragraph
  if (!info.description && lines.length > 0) {
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      if (lines[i].length > 100) {
        info.description = lines[i].substring(0, 1000)
        break
      }
    }
  }

  // If title is still empty, use first line
  if (!info.title && lines.length > 0) {
    info.title = lines[0].substring(0, 150)
  }

  return info
}

async function generateProposal(sowInfo: Record<string, string>): Promise<Buffer> {
  const children: any[] = [
    new Paragraph({
      text: 'TECHNICAL PROPOSAL',
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({
      text: sowInfo.title || 'Proposal for Statement of Work',
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      text: 'MacTech Solutions LLC',
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({
      text: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    }),
    new Paragraph({ text: '' }),
  ]

  // 1. Executive Summary
  children.push(
    new Paragraph({
      text: '1. Executive Summary',
      heading: HeadingLevel.HEADING_2,
    })
  )
  
  if (sowInfo.background) {
    children.push(new Paragraph({ text: sowInfo.background }))
  }
  
  if (sowInfo.description) {
    if (!sowInfo.background) {
      children.push(new Paragraph({ text: sowInfo.description }))
    } else {
      children.push(new Paragraph({ text: sowInfo.description }))
    }
  }
  
  if (!sowInfo.background && !sowInfo.description) {
    children.push(new Paragraph({
      text: 'MacTech Solutions LLC is pleased to submit this proposal in response to the Statement of Work. Our team brings extensive experience in DoD cybersecurity, infrastructure engineering, and compliance management, positioning us to successfully execute the requirements outlined in this SOW.',
    }))
  }

  children.push(new Paragraph({ text: '' }))

  // 2. Understanding of Requirements
  children.push(
    new Paragraph({
      text: '2. Understanding of Requirements',
      heading: HeadingLevel.HEADING_2,
    })
  )

  if (sowInfo.objectives) {
    children.push(
      new Paragraph({
        text: '2.1 Objectives',
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({ text: sowInfo.objectives })
    )
  }

  if (sowInfo.requirements) {
    children.push(
      new Paragraph({
        text: sowInfo.objectives ? '2.2 Requirements' : '2.1 Requirements',
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({ text: sowInfo.requirements })
    )
  } else {
    children.push(new Paragraph({
      text: 'MacTech Solutions has thoroughly reviewed the Statement of Work and understands the requirements as specified. We recognize the critical nature of this effort and are committed to delivering solutions that meet or exceed all specified requirements.',
    }))
  }

  children.push(new Paragraph({ text: '' }))

  // 3. Technical Approach
  children.push(
    new Paragraph({
      text: '3. Technical Approach',
      heading: HeadingLevel.HEADING_2,
    })
  )

  if (sowInfo.technicalApproach) {
    children.push(new Paragraph({ text: sowInfo.technicalApproach }))
  }

  children.push(
    new Paragraph({
      text: 'MacTech Solutions will employ a structured, risk-aware approach to execute this effort:',
    }),
    new Paragraph({ text: '• Phase 1: Requirements Analysis and Planning' }),
    new Paragraph({ text: '  - Conduct detailed requirements analysis and gap assessment' }),
    new Paragraph({ text: '  - Develop comprehensive project plan and risk mitigation strategy' }),
    new Paragraph({ text: '  - Establish communication protocols and reporting structures' }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '• Phase 2: Execution and Implementation' }),
    new Paragraph({ text: '  - Execute deliverables according to approved plan' }),
    new Paragraph({ text: '  - Implement quality assurance and compliance validation processes' }),
    new Paragraph({ text: '  - Conduct regular progress reviews and status reporting' }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '• Phase 3: Delivery and Transition' }),
    new Paragraph({ text: '  - Complete all deliverables and documentation' }),
    new Paragraph({ text: '  - Conduct knowledge transfer and training as required' }),
    new Paragraph({ text: '  - Provide transition support and closeout activities' })
  )

  children.push(new Paragraph({ text: '' }))

  // 4. Deliverables
  children.push(
    new Paragraph({
      text: '4. Deliverables',
      heading: HeadingLevel.HEADING_2,
    })
  )

  if (sowInfo.deliverables) {
    children.push(new Paragraph({ text: sowInfo.deliverables }))
  } else {
    children.push(
      new Paragraph({
        text: 'MacTech Solutions will deliver all items specified in the Statement of Work, including:',
      }),
      new Paragraph({ text: '• Technical documentation and reports' }),
      new Paragraph({ text: '• Implementation artifacts and configurations' }),
      new Paragraph({ text: '• Status reports and progress updates' }),
      new Paragraph({ text: '• Training materials and knowledge transfer documentation' })
    )
  }

  children.push(new Paragraph({ text: '' }))

  // 5. Project Timeline
  children.push(
    new Paragraph({
      text: '5. Project Timeline',
      heading: HeadingLevel.HEADING_2,
    })
  )

  if (sowInfo.timeline) {
    children.push(new Paragraph({ text: sowInfo.timeline }))
  } else {
    children.push(
      new Paragraph({
        text: 'MacTech Solutions will work with the client to establish a detailed project schedule based on the Statement of Work requirements. We will provide a comprehensive timeline upon contract award, including milestones, deliverables, and dependencies.',
      })
    )
  }

  children.push(new Paragraph({ text: '' }))

  // 6. Key Personnel
  children.push(
    new Paragraph({
      text: '6. Key Personnel',
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({
      text: 'MacTech Solutions will assign qualified key personnel with relevant experience and security clearances as required. Our team includes:',
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      text: '• Director of Cyber Assurance: Expert in RMF, ATO, STIG compliance, and DoD cybersecurity policy',
    }),
    new Paragraph({
      text: '• Director of Infrastructure & Systems Engineering: Specialized in data center architecture, cloud platforms, and infrastructure as code',
    }),
    new Paragraph({
      text: '• Managing Member, Compliance & Operations: Experienced in ISO implementation, audit readiness, and quality management systems',
    }),
    new Paragraph({
      text: '• Director of Legal, Contracts & Risk Advisory: Provides risk-aware contract alignment and governance support',
    })
  )

  children.push(new Paragraph({ text: '' }))

  // 7. Company Qualifications
  children.push(
    new Paragraph({
      text: '7. Company Qualifications',
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({
      text: 'MacTech Solutions LLC is a veteran-owned small business (SDVOSB) with proven expertise in:',
    }),
    new Paragraph({ text: '• DoD Cybersecurity and Risk Management Framework (RMF) implementation' }),
    new Paragraph({ text: '• Authorization to Operate (ATO) package development and continuous monitoring' }),
    new Paragraph({ text: '• STIG compliance assessment and automated remediation' }),
    new Paragraph({ text: '• Infrastructure engineering and systems design for federal programs' }),
    new Paragraph({ text: '• Quality management systems and audit readiness' }),
    new Paragraph({ text: '• Risk-aware contract and delivery management' }),
    new Paragraph({ text: '' }),
    new Paragraph({
      text: 'Our team brings decades of combined experience in federal programs and defense contracting, with a track record of successful project delivery and client satisfaction.',
    })
  )

  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  })

  return await Packer.toBuffer(doc)
}

async function generateBOE(sowInfo: Record<string, string>): Promise<Buffer> {
  // Estimate labor hours based on SOW complexity
  const textLength = (sowInfo.description || '').length + (sowInfo.requirements || '').length
  const complexity = textLength > 5000 ? 'high' : textLength > 2000 ? 'medium' : 'low'
  
  // Calculate estimated hours based on complexity
  let seniorHours = 0
  let technicalHours = 0
  let supportHours = 0
  
  if (complexity === 'high') {
    seniorHours = 320
    technicalHours = 480
    supportHours = 200
  } else if (complexity === 'medium') {
    seniorHours = 200
    technicalHours = 300
    supportHours = 120
  } else {
    seniorHours = 120
    technicalHours = 180
    supportHours = 80
  }

  const children: any[] = [
    new Paragraph({
      text: 'BASIS OF ESTIMATE (BOE)',
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({
      text: sowInfo.title || 'Basis of Estimate for Statement of Work',
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      text: 'MacTech Solutions LLC',
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({
      text: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    }),
    new Paragraph({ text: '' }),
  ]

  // 1. Scope Summary
  children.push(
    new Paragraph({
      text: '1. Scope Summary',
      heading: HeadingLevel.HEADING_2,
    })
  )

  if (sowInfo.description) {
    children.push(new Paragraph({ text: sowInfo.description.substring(0, 1500) }))
  } else {
    children.push(new Paragraph({
      text: 'This Basis of Estimate is based on the requirements outlined in the Statement of Work. The estimate reflects the effort required to successfully execute all specified deliverables and meet performance requirements.',
    }))
  }

  children.push(new Paragraph({ text: '' }))

  // 2. Assumptions
  children.push(
    new Paragraph({
      text: '2. Assumptions',
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({
      text: 'The following assumptions were made in developing this estimate:',
    }),
    new Paragraph({ text: '• All requirements are as specified in the Statement of Work' }),
    new Paragraph({ text: '• Access to necessary systems, documentation, and facilities will be provided in a timely manner' }),
    new Paragraph({ text: '• Client will provide timely feedback, approvals, and responses to inquiries' }),
    new Paragraph({ text: '• No significant scope changes or requirement modifications during execution' }),
    new Paragraph({ text: '• Security clearances and access credentials will be processed expeditiously' }),
    new Paragraph({ text: '• Required tools, software licenses, and infrastructure will be available' }),
    new Paragraph({ text: '• Travel requirements, if any, are minimal or as specified in the SOW' })
  )

  children.push(new Paragraph({ text: '' }))

  // 3. Labor Categories and Hours
  children.push(
    new Paragraph({
      text: '3. Labor Categories and Hours',
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({
      text: 'The following labor categories and estimated hours are based on the scope and complexity of work:',
    })
  )

  // Use fixed widths in twips (1/20th of a point) for better control
  // Standard page width is ~12240 twips (8.5 inches), so we'll use:
  // Labor Category: 4000 twips (~3.3 inches)
  // Estimated Hours: 2000 twips (~1.7 inches)  
  // Description: 6240 twips (~5.2 inches)
  const laborTable = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Labor Category' })],
            width: { size: 4000, type: WidthType.DXA },
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Estimated Hours' })],
            width: { size: 2000, type: WidthType.DXA },
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Description' })],
            width: { size: 6240, type: WidthType.DXA },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Senior Consultant / Program Manager' })],
            width: { size: 4000, type: WidthType.DXA },
          }),
          new TableCell({
            children: [new Paragraph({ text: seniorHours.toString() })],
            width: { size: 2000, type: WidthType.DXA },
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Project management, requirements analysis, client coordination, quality assurance' })],
            width: { size: 6240, type: WidthType.DXA },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Technical Lead / Subject Matter Expert' })],
            width: { size: 4000, type: WidthType.DXA },
          }),
          new TableCell({
            children: [new Paragraph({ text: technicalHours.toString() })],
            width: { size: 2000, type: WidthType.DXA },
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Technical execution, design, implementation, documentation, testing' })],
            width: { size: 6240, type: WidthType.DXA },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Support Staff / Junior Analyst' })],
            width: { size: 4000, type: WidthType.DXA },
          }),
          new TableCell({
            children: [new Paragraph({ text: supportHours.toString() })],
            width: { size: 2000, type: WidthType.DXA },
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Data collection, documentation support, administrative tasks, research' })],
            width: { size: 6240, type: WidthType.DXA },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'TOTAL HOURS', bold: true })] })],
            width: { size: 4000, type: WidthType.DXA },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: (seniorHours + technicalHours + supportHours).toString(), bold: true })] })],
            width: { size: 2000, type: WidthType.DXA },
          }),
          new TableCell({
            children: [new Paragraph({ text: '' })],
            width: { size: 6240, type: WidthType.DXA },
          }),
        ],
      }),
    ],
  })

  children.push(laborTable)
  children.push(new Paragraph({ text: '' }))

  // 4. Cost Breakdown
  children.push(
    new Paragraph({
      text: '4. Cost Breakdown',
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({
      text: 'Cost estimates are structured as follows:',
    }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '4.1 Direct Labor' }),
    new Paragraph({ text: `Estimated total direct labor hours: ${seniorHours + technicalHours + supportHours} hours` }),
    new Paragraph({ text: 'Labor rates to be provided per company pricing structure' }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '4.2 Indirect Costs' }),
    new Paragraph({ text: '• Overhead: Applied per company standard rates' }),
    new Paragraph({ text: '• General & Administrative (G&A): Applied per company standard rates' }),
    new Paragraph({ text: '• Fee/Profit: Applied per company standard rates' }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '4.3 Other Direct Costs (ODC)' }),
    new Paragraph({ text: '• Travel (if required): Per actual expenses' }),
    new Paragraph({ text: '• Materials and supplies: As needed per SOW requirements' }),
    new Paragraph({ text: '• Software licenses and tools: As specified in SOW' })
  )

  if (sowInfo.budget) {
    children.push(
      new Paragraph({ text: '' }),
      new Paragraph({
        text: `Note: SOW indicates budget of $${sowInfo.budget}. Final pricing will be provided upon detailed analysis.`,
      })
    )
  }

  children.push(new Paragraph({ text: '' }))

  // 5. Risk Factors
  children.push(
    new Paragraph({
      text: '5. Risk Factors',
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({
      text: 'The following risk factors may impact the estimate and should be considered:',
    }),
    new Paragraph({ text: '• Scope changes or requirement clarifications after contract award' }),
    new Paragraph({ text: '• Delays in access to systems, documentation, or facilities' }),
    new Paragraph({ text: '• Extended client review and approval cycles' }),
    new Paragraph({ text: '• Changes in regulatory or compliance requirements' }),
    new Paragraph({ text: '• Unforeseen technical complexities or dependencies' }),
    new Paragraph({ text: '• Resource availability and scheduling conflicts' }),
    new Paragraph({ text: '• Changes in security or access requirements' })
  )

  children.push(new Paragraph({ text: '' }))

  // 6. Methodology
  children.push(
    new Paragraph({
      text: '6. Estimating Methodology',
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({
      text: 'This estimate was developed using the following methodology:',
    }),
    new Paragraph({ text: '• Detailed analysis of the Statement of Work requirements and deliverables' }),
    new Paragraph({ text: '• Assessment of work complexity and technical scope' }),
    new Paragraph({ text: '• Historical data from similar projects and engagements' }),
    new Paragraph({ text: '• Industry standard estimating practices and benchmarks' }),
    new Paragraph({ text: '• MacTech Solutions experience with similar DoD and federal programs' }),
    new Paragraph({ text: '• Consideration of risk factors and potential contingencies' }),
    new Paragraph({ text: '' }),
    new Paragraph({
      text: 'The estimate reflects a reasonable assessment of effort required based on available information. Final pricing will be provided upon detailed requirements analysis and contract negotiations.',
    })
  )

  if (sowInfo.timeline) {
    children.push(
      new Paragraph({ text: '' }),
      new Paragraph({
        text: '7. Schedule Considerations',
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: `Period of Performance: ${sowInfo.timeline}`,
      }),
      new Paragraph({
        text: 'The labor estimate assumes work will be performed within the specified timeline. Accelerated schedules or compressed timelines may require additional resources and cost adjustments.',
      })
    )
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  })

  return await Packer.toBuffer(doc)
}

export async function POST(request: NextRequest) {
  try {
    await ensureDirectories()

    const formData = await request.formData()
    const fileInput = formData.get('sow')
    
    if (!fileInput || typeof fileInput !== 'object' || !('arrayBuffer' in fileInput)) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Type-safe file object
    const file = {
      arrayBuffer: () => (fileInput as any).arrayBuffer(),
      name: (fileInput as any).name || 'unknown',
    }

    // Extract text from uploaded file
    const text = await extractTextFromFile(file)
    
    // Ensure text is a string before processing
    const textString = typeof text === 'string' ? text : String(text || '')
    
    // Extract SOW information
    const sowInfo = extractSOWInfo(textString)

    // Generate documents
    const proposalBuffer = await generateProposal(sowInfo)
    const boeBuffer = await generateBOE(sowInfo)

    // Save files
    const timestamp = Date.now()
    const proposalFilename = `proposal_${timestamp}.docx`
    const boeFilename = `boe_${timestamp}.docx`

    const proposalPath = join(OUTPUT_DIR, proposalFilename)
    const boePath = join(OUTPUT_DIR, boeFilename)

    await writeFile(proposalPath, proposalBuffer)
    await writeFile(boePath, boeBuffer)

    // Return download URLs via API route
    return NextResponse.json({
      proposalUrl: `/api/admin/download?file=${proposalFilename}`,
      boeUrl: `/api/admin/download?file=${boeFilename}`,
      sowInfo, // Return extracted info for debugging/review
    })
  } catch (error) {
    console.error('Error generating documents:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate documents' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
// @ts-ignore - mammoth doesn't have TypeScript types
import mammoth from 'mammoth'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } from 'docx'

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

async function extractTextFromFile(file: File): Promise<string> {
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
  // Extract key information from SOW text using pattern matching
  const info: Record<string, string> = {
    title: '',
    description: '',
    requirements: '',
    deliverables: '',
    timeline: '',
    budget: '',
  }

  // Ensure text is a string
  if (typeof text !== 'string') {
    console.warn('extractSOWInfo received non-string value:', typeof text, text)
    return info
  }

  if (!text || text.trim().length === 0) {
    return info
  }

  // Extract title (often in first few lines or after "Statement of Work" or "SOW")
  const titleMatch = text.match(/(?:Statement of Work|SOW)[\s:]*([^\n]{5,100})/i) ||
                    text.match(/^(.{10,100})/m)
  if (titleMatch) {
    info.title = titleMatch[1].trim()
  }

  // Extract description/scope
  const scopeMatch = text.match(/(?:Scope|Description|Background)[\s:]*([^\n]{20,500})/is)
  if (scopeMatch) {
    info.description = scopeMatch[1].trim()
  }

  // Extract requirements
  const reqMatch = text.match(/(?:Requirements|Technical Requirements|Functional Requirements)[\s:]*([^\n]{20,1000})/is)
  if (reqMatch) {
    info.requirements = reqMatch[1].trim()
  }

  // Extract deliverables
  const delivMatch = text.match(/(?:Deliverables|Deliverable)[\s:]*([^\n]{20,1000})/is)
  if (delivMatch) {
    info.deliverables = delivMatch[1].trim()
  }

  // Extract timeline
  const timelineMatch = text.match(/(?:Timeline|Schedule|Duration|Period of Performance)[\s:]*([^\n]{10,200})/i)
  if (timelineMatch) {
    info.timeline = timelineMatch[1].trim()
  }

  // Extract budget (if mentioned)
  const budgetMatch = text.match(/(?:Budget|Cost|Price|Amount)[\s:]*\$?([0-9,]+(?:\.[0-9]{2})?)/i)
  if (budgetMatch) {
    info.budget = budgetMatch[1]
  }

  return info
}

async function generateProposal(sowInfo: Record<string, string>): Promise<Buffer> {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: 'PROPOSAL',
          heading: HeadingLevel.TITLE,
        }),
        new Paragraph({
          text: sowInfo.title || 'Proposal for Statement of Work',
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: 'MacTech Solutions LLC',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: '1. Executive Summary',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: sowInfo.description || 'This proposal addresses the requirements outlined in the Statement of Work.',
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: '2. Understanding of Requirements',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: sowInfo.requirements || 'MacTech Solutions understands the requirements as specified in the SOW.',
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: '3. Proposed Approach',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: 'MacTech Solutions will provide comprehensive services aligned with the Statement of Work requirements. Our approach includes:',
        }),
        new Paragraph({
          text: '• Detailed planning and requirements analysis',
        }),
        new Paragraph({
          text: '• Execution of deliverables as specified',
        }),
        new Paragraph({
          text: '• Quality assurance and compliance validation',
        }),
        new Paragraph({
          text: '• Risk-aware delivery planning',
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: '4. Deliverables',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: sowInfo.deliverables || 'All deliverables as specified in the Statement of Work.',
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: '5. Timeline',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: sowInfo.timeline || 'Timeline to be determined based on SOW requirements.',
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: '6. Key Personnel',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: 'MacTech Solutions will assign qualified key personnel with relevant experience in:',
        }),
        new Paragraph({
          text: '• Cybersecurity and RMF implementation',
        }),
        new Paragraph({
          text: '• Infrastructure and systems engineering',
        }),
        new Paragraph({
          text: '• Quality and compliance management',
        }),
        new Paragraph({
          text: '• Legal, contracts, and risk advisory',
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: '7. Company Qualifications',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: 'MacTech Solutions is a veteran-owned consulting firm with proven expertise in DoD cybersecurity, infrastructure engineering, and compliance. Our team brings decades of combined experience in federal programs and defense contracting.',
        }),
      ],
    }],
  })

  return await Packer.toBuffer(doc)
}

async function generateBOE(sowInfo: Record<string, string>): Promise<Buffer> {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: 'BASIS OF ESTIMATE (BOE)',
          heading: HeadingLevel.TITLE,
        }),
        new Paragraph({
          text: sowInfo.title || 'Basis of Estimate for Statement of Work',
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: 'MacTech Solutions LLC',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: '1. Scope Summary',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: sowInfo.description || 'This Basis of Estimate is based on the requirements outlined in the Statement of Work.',
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: '2. Assumptions',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: 'The following assumptions were made in developing this estimate:',
        }),
        new Paragraph({
          text: '• Requirements are as specified in the Statement of Work',
        }),
        new Paragraph({
          text: '• Access to necessary systems and documentation will be provided',
        }),
        new Paragraph({
          text: '• Client will provide timely feedback and approvals',
        }),
        new Paragraph({
          text: '• No significant scope changes during execution',
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: '3. Labor Categories and Hours',
          heading: HeadingLevel.HEADING_2,
        }),
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph('Labor Category')],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph('Hours')],
                  width: { size: 25, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph('Rate')],
                  width: { size: 25, type: WidthType.PERCENTAGE },
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph('Senior Consultant')],
                }),
                new TableCell({
                  children: [new Paragraph('TBD')],
                }),
                new TableCell({
                  children: [new Paragraph('TBD')],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph('Technical Lead')],
                }),
                new TableCell({
                  children: [new Paragraph('TBD')],
                }),
                new TableCell({
                  children: [new Paragraph('TBD')],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph('Support Staff')],
                }),
                new TableCell({
                  children: [new Paragraph('TBD')],
                }),
                new TableCell({
                  children: [new Paragraph('TBD')],
                }),
              ],
            }),
          ],
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: '4. Cost Breakdown',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: '• Direct Labor: To be determined based on SOW requirements',
        }),
        new Paragraph({
          text: '• Overhead: Applied per company rates',
        }),
        new Paragraph({
          text: '• G&A: Applied per company rates',
        }),
        new Paragraph({
          text: '• Fee: Applied per company rates',
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: '5. Risk Factors',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: 'The following risk factors may impact the estimate:',
        }),
        new Paragraph({
          text: '• Scope changes or clarifications',
        }),
        new Paragraph({
          text: '• Access to systems and documentation delays',
        }),
        new Paragraph({
          text: '• Client review and approval timelines',
        }),
        new Paragraph({
          text: '• Regulatory or compliance requirement changes',
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: '6. Methodology',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: 'This estimate is based on:',
        }),
        new Paragraph({
          text: '• Analysis of the Statement of Work requirements',
        }),
        new Paragraph({
          text: '• Historical data from similar projects',
        }),
        new Paragraph({
          text: '• Industry standard estimating practices',
        }),
        new Paragraph({
          text: '• MacTech Solutions experience with similar engagements',
        }),
      ],
    }],
  })

  return await Packer.toBuffer(doc)
}

export async function POST(request: NextRequest) {
  try {
    await ensureDirectories()

    const formData = await request.formData()
    const file = formData.get('sow') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
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


/**
 * Extract Resume Capabilities
 * Parses leadership team resumes and extracts capabilities
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { ResumeCapabilities, Pillar } from './capabilityData'
import { getOpenAIClient, isOpenAIConfigured } from '../openai'

const RESUME_MAPPINGS: Array<{
  filename: string
  pillar: Pillar
  leaderName: string
}> = [
  { filename: 'Caruso_Patrick_Resume_2025-0721.pdf', pillar: 'Security', leaderName: 'Patrick Caruso' },
  { filename: 'James.R.Adams.Resume.doc', pillar: 'Infrastructure', leaderName: 'James Adams' },
  { filename: 'MacDonald, Brian_Resume DoD.pdf', pillar: 'Quality', leaderName: 'Brian MacDonald' },
  { filename: 'Milso, John - Resume.doc', pillar: 'Governance', leaderName: 'John Milso' }
]

/**
 * Extract text from PDF file
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = require('pdf-parse')
    const data = await pdfParse(buffer)
    return data.text || ''
  } catch (error: any) {
    console.error('Error parsing PDF:', error)
    throw new Error(`Failed to parse PDF: ${error.message}`)
  }
}

/**
 * Extract text from DOC/DOCX file
 */
async function extractTextFromDOC(buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.toLowerCase().split('.').pop()
  
  if (ext === 'docx') {
    try {
      const mammoth = require('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      return result.value || ''
    } catch (error: any) {
      console.error('Error parsing DOCX:', error)
      throw new Error(`Failed to parse DOCX: ${error.message}`)
    }
  } else if (ext === 'doc') {
    try {
      const mammoth = require('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      return result.value || ''
    } catch (error: any) {
      throw new Error(`Failed to parse DOC file: ${error.message}`)
    }
  }
  
  throw new Error(`Unsupported file type: ${ext}`)
}

/**
 * Parse resume text using OpenAI to extract structured capabilities
 */
async function parseResumeCapabilities(resumeText: string): Promise<Partial<ResumeCapabilities> | null> {
  if (!isOpenAIConfigured()) {
    console.warn('OpenAI not configured, using fallback extraction')
    return null
  }

  try {
    const openai = getOpenAIClient()

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert at extracting capabilities from resumes. Extract skills, certifications, education, and expertise areas relevant to government contracting and federal work.

Return JSON with this exact structure:
{
  "skills": ["skill1", "skill2", ...],
  "certifications": ["cert1", "cert2", ...],
  "yearsOfExperience": number or null,
  "education": [
    {
      "degree": "BS, MS, PhD, etc. or null",
      "fieldOfStudy": "Major/Field or null",
      "school": "School name or null"
    }
  ],
  "keyProjects": ["project1", "project2", ...],
  "expertiseAreas": ["area1", "area2", ...]
}

Focus on:
- Technical skills (RMF, STIG, ATO, infrastructure, compliance, etc.)
- Certifications (CISSP, PMP, ISO, etc.)
- Federal/government contracting experience
- Domain expertise areas
- Years of relevant experience

Be comprehensive and extract all relevant capabilities.`
        },
        {
          role: 'user',
          content: `Extract capabilities from this resume:\n\n${resumeText.substring(0, 8000)}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content in OpenAI response')
    }

    return JSON.parse(content) as Partial<ResumeCapabilities>
  } catch (error: any) {
    console.error('Error parsing resume capabilities:', error)
    return null
  }
}

/**
 * Extract capabilities from a single resume file
 */
async function extractResumeCapabilities(
  filename: string,
  pillar: Pillar,
  leaderName: string
): Promise<ResumeCapabilities | null> {
  const sourcesPath = join(process.cwd(), 'sources', filename)
  
  try {
    const buffer = readFileSync(sourcesPath)
    const ext = filename.toLowerCase().split('.').pop()
    
    let resumeText: string
    if (ext === 'pdf') {
      resumeText = await extractTextFromPDF(buffer)
    } else if (ext === 'doc' || ext === 'docx') {
      resumeText = await extractTextFromDOC(buffer, filename)
    } else {
      console.warn(`Unsupported file type for ${filename}: ${ext}`)
      return null
    }

    if (!resumeText || resumeText.trim().length === 0) {
      console.warn(`No text extracted from ${filename}`)
      return null
    }

    const parsed = await parseResumeCapabilities(resumeText)
    
    return {
      pillar,
      leaderName,
      skills: parsed?.skills || [],
      certifications: parsed?.certifications || [],
      yearsOfExperience: parsed?.yearsOfExperience,
      education: parsed?.education || [],
      keyProjects: parsed?.keyProjects || [],
      expertiseAreas: parsed?.expertiseAreas || []
    }
  } catch (error: any) {
    console.error(`Error extracting capabilities from ${filename}:`, error)
    return null
  }
}

/**
 * Extract capabilities from all leadership resumes
 */
export async function extractAllResumeCapabilities(): Promise<ResumeCapabilities[]> {
  const results: ResumeCapabilities[] = []

  for (const mapping of RESUME_MAPPINGS) {
    const capabilities = await extractResumeCapabilities(
      mapping.filename,
      mapping.pillar,
      mapping.leaderName
    )
    
    if (capabilities) {
      results.push(capabilities)
    }
  }

  return results
}

/**
 * Get cached resume capabilities (loads from file or extracts fresh)
 * For production, this should cache results to avoid re-parsing
 */
let cachedResumeCapabilities: ResumeCapabilities[] | null = null

export async function getResumeCapabilities(forceRefresh: boolean = false): Promise<ResumeCapabilities[]> {
  if (!forceRefresh && cachedResumeCapabilities) {
    return cachedResumeCapabilities
  }

  cachedResumeCapabilities = await extractAllResumeCapabilities()
  return cachedResumeCapabilities
}

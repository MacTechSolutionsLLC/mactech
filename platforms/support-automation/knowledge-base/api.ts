/**
 * Next.js API route for Knowledge Base
 */

import { NextRequest, NextResponse } from 'next/server'
import { knowledgeArticleSchema } from './types'
import { knowledgeBaseService } from './service'
import { handleError } from '../../shared/errors'
import { validateInput } from '../../shared/validation'
import { createLogger } from '../../shared/logger'

const logger = createLogger('knowledge-base-api')

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/ask')) {
      const { question } = body
      const answer = await knowledgeBaseService.askQuestion(question)
      return NextResponse.json({ success: true, data: answer })
    }

    if (pathname.includes('/from-ticket')) {
      const { ticketId, ticketTitle, resolution } = body
      const article = await knowledgeBaseService.generateFromTicket(ticketId, ticketTitle, resolution)
      return NextResponse.json({ success: true, data: article }, { status: 201 })
    }

    // Create article
    const data = validateInput(knowledgeArticleSchema, body)
    const article = await knowledgeBaseService.createArticle(data)
    return NextResponse.json({ success: true, data: article }, { status: 201 })
  } catch (error) {
    logger.error('Error in knowledge base API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { pathname, searchParams } = new URL(request.url)

    if (pathname.includes('/search')) {
      const query = searchParams.get('q')
      if (!query) {
        return NextResponse.json({ success: false, error: 'query required' }, { status: 400 })
      }
      const results = await knowledgeBaseService.search(query)
      return NextResponse.json({ success: true, data: results })
    }

    if (pathname.includes('/metrics')) {
      const metrics = await knowledgeBaseService.getMetrics()
      return NextResponse.json({ success: true, data: metrics })
    }

    const id = searchParams.get('id')
    if (id) {
      const article = await knowledgeBaseService.getArticle(id)
      return NextResponse.json({ success: true, data: article })
    }

    const articles = await knowledgeBaseService.listArticles()
    return NextResponse.json({ success: true, data: articles })
  } catch (error) {
    logger.error('Error in knowledge base API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}



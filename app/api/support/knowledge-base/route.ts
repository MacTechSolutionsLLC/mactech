import { NextRequest, NextResponse } from 'next/server'
import { knowledgeBaseService } from '@/platforms/support-automation/knowledge-base/service'
import { knowledgeArticleSchema } from '@/platforms/support-automation/knowledge-base/types'
import { handleError } from '@/platforms/shared/errors'
import { validateInput } from '@/platforms/shared/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = validateInput(knowledgeArticleSchema, body)
    const article = await knowledgeBaseService.createArticle(data)
    return NextResponse.json({ success: true, data: article }, { status: 201 })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { pathname, searchParams } = new URL(request.url)

    if (pathname.includes('/search')) {
      const query = searchParams.get('query')
      if (!query) {
        return NextResponse.json({ success: false, error: 'query required' }, { status: 400 })
      }
      const results = await knowledgeBaseService.searchArticles(query)
      return NextResponse.json({ success: true, data: results })
    }

    const id = searchParams.get('id')
    if (id) {
      const article = await knowledgeBaseService.getArticle(id)
      return NextResponse.json({ success: true, data: article })
    }

    const articles = await knowledgeBaseService.listArticles()
    return NextResponse.json({ success: true, data: articles })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}


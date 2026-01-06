import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('OPENAI_API_KEY is not set in environment variables')
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Log that API key is present (but not the key itself)
    console.log('OpenAI API key is configured, length:', apiKey.length)

    // System prompt for MacTech Solutions
    const systemMessage = {
      role: 'system',
      content: `You are a helpful assistant for MacTech Solutions, a Veteran-Owned / SDVOSB (pending) consulting firm specializing in:
- DoD Cybersecurity (RMF, ATO, ConMon, STIGs)
- Infrastructure & Systems Engineering (data centers, virtualization, storage)
- Quality, Compliance, and Audit Readiness (ISO, labs, regulated environments)

Your role is to:
1. Answer questions about MacTech's services professionally and accurately
2. Help visitors understand their readiness and compliance needs
3. Guide them toward scheduling a consultation with a real representative when appropriate
4. Maintain a professional, government-appropriate tone
5. Be concise and helpful

If someone asks about scheduling or wants to speak with a representative, encourage them to use the scheduling feature or contact form.`
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText }
      }
      console.error('OpenAI API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      })
      return NextResponse.json(
        { 
          error: 'Failed to get response from AI',
          details: errorData.error || errorData.message || 'Unknown error'
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    const aiMessage = data.choices[0]?.message?.content

    if (!aiMessage) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: aiMessage })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


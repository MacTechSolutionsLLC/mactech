import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { messages, threadId } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ASSISTANT_API_KEY || process.env.OPENAI_API_KEY
    
    // Check if ASSISTANT_API_KEY contains the assistant ID (some setups put it there)
    // Otherwise, look for ASSISTANT_ID separately
    let assistantId = process.env.ASSISTANT_ID
    
    // If ASSISTANT_ID is not set, check if ASSISTANT_API_KEY might be the ID
    // This handles cases where the variable name is misleading
    if (!assistantId && process.env.ASSISTANT_API_KEY) {
      // If ASSISTANT_API_KEY doesn't look like an API key (starts with 'asst_'), it might be the ID
      if (process.env.ASSISTANT_API_KEY.startsWith('asst_')) {
        assistantId = process.env.ASSISTANT_API_KEY
        // Use OPENAI_API_KEY for auth if available, otherwise we'll need both
        if (!process.env.OPENAI_API_KEY) {
          return NextResponse.json(
            { error: 'Please set OPENAI_API_KEY for authentication and ASSISTANT_ID (or put Assistant ID in ASSISTANT_API_KEY)' },
            { status: 500 }
          )
        }
      }
    }

    if (!apiKey) {
      console.error('ASSISTANT_API_KEY or OPENAI_API_KEY is not set in environment variables')
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set ASSISTANT_API_KEY (for API key) or OPENAI_API_KEY.' },
        { status: 500 }
      )
    }

    if (!assistantId) {
      console.error('ASSISTANT_ID is not set. Available env vars:', Object.keys(process.env).filter(k => k.includes('ASSISTANT')))
      return NextResponse.json(
        { 
          error: 'Assistant ID not configured',
          details: 'Please set ASSISTANT_ID environment variable with your OpenAI Assistant ID (starts with "asst_"). You can find it in the OpenAI platform under your assistant settings.'
        },
        { status: 500 }
      )
    }

    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()
    if (!lastUserMessage) {
      return NextResponse.json(
        { error: 'No user message found' },
        { status: 400 }
      )
    }

    let currentThreadId = threadId

    // Create a new thread if we don't have one
    if (!currentThreadId) {
      const threadResponse = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v2',
        },
      })

      if (!threadResponse.ok) {
        const errorText = await threadResponse.text()
        console.error('Failed to create thread:', errorText)
        return NextResponse.json(
          { error: 'Failed to create conversation thread' },
          { status: threadResponse.status }
        )
      }

      const threadData = await threadResponse.json()
      currentThreadId = threadData.id
    }

    // Add the user message to the thread
    await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v2',
      },
      body: JSON.stringify({
        role: 'user',
        content: lastUserMessage.content,
      }),
    })

    // Create a run with the assistant
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v2',
      },
      body: JSON.stringify({
        assistant_id: assistantId,
      }),
    })

    if (!runResponse.ok) {
      const errorText = await runResponse.text()
      console.error('Failed to create run:', errorText)
      return NextResponse.json(
        { error: 'Failed to get AI response' },
        { status: runResponse.status }
      )
    }

    const runData = await runResponse.json()
    let runId = runData.id
    let runStatus = runData.status

    // Poll for completion (with timeout)
    const maxAttempts = 30
    let attempts = 0

    while (runStatus === 'queued' || runStatus === 'in_progress') {
      if (attempts >= maxAttempts) {
        return NextResponse.json(
          { error: 'Response timeout - assistant is taking too long to respond' },
          { status: 504 }
        )
      }

      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second

      const statusResponse = await fetch(
        `https://api.openai.com/v1/threads/${currentThreadId}/runs/${runId}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v2',
          },
        }
      )

      const statusData = await statusResponse.json()
      runStatus = statusData.status
      attempts++
    }

    if (runStatus !== 'completed') {
      console.error('Run failed with status:', runStatus)
      return NextResponse.json(
        { error: `Assistant run failed with status: ${runStatus}` },
        { status: 500 }
      )
    }

    // Retrieve the messages from the thread
    const messagesResponse = await fetch(
      `https://api.openai.com/v1/threads/${currentThreadId}/messages`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v2',
        },
      }
    )

    const messagesData = await messagesResponse.json()
    const assistantMessage = messagesData.data
      .filter((msg: any) => msg.role === 'assistant')
      .pop()

    if (!assistantMessage || !assistantMessage.content[0]?.text?.value) {
      return NextResponse.json(
        { error: 'No response from assistant' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: assistantMessage.content[0].text.value,
      threadId: currentThreadId,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


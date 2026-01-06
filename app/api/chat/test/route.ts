import { NextResponse } from 'next/server'

// Test endpoint to verify Assistant API configuration
export async function GET() {
  const apiKey = process.env.ASSISTANT_API_KEY || process.env.OPENAI_API_KEY
  const assistantId = process.env.ASSISTANT_ID
  
  // Check if ASSISTANT_API_KEY might actually be the assistant ID
  const assistantApiKey = process.env.ASSISTANT_API_KEY
  const mightBeAssistantId = assistantApiKey?.startsWith('asst_')
  
  return NextResponse.json({
    apiKeyConfigured: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 7) + '...' : 'not set',
    assistantIdConfigured: !!assistantId,
    assistantIdValue: assistantId ? assistantId.substring(0, 10) + '...' : 'not set',
    assistantApiKeyValue: assistantApiKey ? assistantApiKey.substring(0, 10) + '...' : 'not set',
    mightBeAssistantId: mightBeAssistantId,
    environment: process.env.NODE_ENV,
    message: assistantId 
      ? 'Configuration looks good!'
      : mightBeAssistantId
        ? 'ASSISTANT_API_KEY appears to be an Assistant ID. You may need to set OPENAI_API_KEY for authentication.'
        : 'Please set ASSISTANT_ID with your OpenAI Assistant ID (starts with "asst_")',
  })
}


import { NextResponse } from 'next/server'

// Simple test endpoint to verify API key is configured
// Remove this in production or protect it
export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY
  
  return NextResponse.json({
    apiKeyConfigured: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 7) + '...' : 'not set',
    environment: process.env.NODE_ENV,
  })
}


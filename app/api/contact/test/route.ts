import { NextResponse } from 'next/server'

// Test endpoint to verify Zapier webhook integration
export async function GET() {
  const zapierWebhookUrl = process.env.ZAPIER_WEBHOOK_URL || 'https://hooks.zapier.com/hooks/catch/17370933/uwfrwd6/'
  
  const testPayload = {
    type: 'Test',
    name: 'Test User',
    email: 'test@example.com',
    organization: 'Test Organization',
    phone: '555-1234',
    message: 'This is a test submission from the MacTech Solutions website.',
    submittedAt: new Date().toISOString(),
    submittedAtFormatted: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
    source: 'MacTech Solutions Contact Form - Test',
  }

  try {
    const response = await fetch(zapierWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    })

    const result = await response.json()

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      webhookUrl: zapierWebhookUrl,
      response: result,
      message: response.ok 
        ? 'Test webhook sent successfully! Check your Zapier and Google Sheets.'
        : 'Webhook test failed. Check the response for details.',
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      webhookUrl: zapierWebhookUrl,
    }, { status: 500 })
  }
}



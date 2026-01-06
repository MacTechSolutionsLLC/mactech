import { NextRequest, NextResponse } from 'next/server'
import { contactFormSchema } from '@/lib/validation'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input (schema will transform empty strings to undefined)
    const validationResult = contactFormSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('Validation errors:', validationResult.error.errors)
      return NextResponse.json(
        { 
          error: 'Invalid form data', 
          details: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Honeypot check
    if (data.honeypot && data.honeypot.length > 0) {
      // Silent fail for bots
      return NextResponse.json({ success: true })
    }

    // Save to database (optional - only if DATABASE_URL is configured)
    let submissionId = null
    if (process.env.DATABASE_URL) {
      try {
        const submission = await prisma.contactSubmission.create({
          data: {
            name: data.name,
            email: data.email,
            organization: data.organization || null,
            phone: data.phone || null,
            message: data.message,
          },
        })
        submissionId = submission.id
      } catch (dbError) {
        console.error('Database save failed (non-critical):', dbError)
        // Continue even if database save fails - Zapier is the primary storage
      }
    }

    // Send to Zapier webhook (async, don't wait)
    const zapierWebhookUrl = process.env.ZAPIER_WEBHOOK_URL || 'https://hooks.zapier.com/hooks/catch/17370933/uwfrwd6/'
    
    const webhookPayload = {
      name: data.name,
      email: data.email,
      organization: data.organization?.trim() || '',
      phone: data.phone?.trim() || '',
      message: data.message,
      submittedAt: new Date().toISOString(),
      submittedAtFormatted: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
      source: 'MacTech Solutions Contact Form',
    }

    // Send to Zapier webhook
    fetch(zapierWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Zapier webhook error:', response.status, errorText)
        } else {
          const result = await response.json()
          console.log('Zapier webhook success:', result)
        }
      })
      .catch((error) => {
        console.error('Failed to send to Zapier webhook:', error)
      })

    return NextResponse.json({ 
      success: true, 
      id: submissionId,
      message: 'Form submitted successfully. Data sent to Zapier webhook.'
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    )
  }
}


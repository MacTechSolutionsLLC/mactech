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

    // Save to database
    const submission = await prisma.contactSubmission.create({
      data: {
        name: data.name,
        email: data.email,
        organization: data.organization || null,
        phone: data.phone || null,
        message: data.message,
      },
    })

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

    fetch(zapierWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    }).catch((error) => {
      console.error('Failed to send to Zapier webhook:', error)
    })

    // Send confirmation email to user
    sendEmail({
      to: data.email,
      subject: 'Thank you for contacting MacTech Solutions',
      html: `
        <h2>Thank you for contacting MacTech Solutions</h2>
        <p>We've received your message and will get back to you as soon as possible.</p>
        <p>If you have urgent questions, please don't hesitate to reach out directly.</p>
        <p>Best regards,<br>MacTech Solutions Team</p>
      `,
      text: `
Thank you for contacting MacTech Solutions

We've received your message and will get back to you as soon as possible.

If you have urgent questions, please don't hesitate to reach out directly.

Best regards,
MacTech Solutions Team
      `,
    }).catch((error) => {
      console.error('Failed to send confirmation email:', error)
    })

    return NextResponse.json({ success: true, id: submission.id })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    )
  }
}


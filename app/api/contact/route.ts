import { NextRequest, NextResponse } from 'next/server'
import { contactFormSchema } from '@/lib/validation'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

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

    // Send email notification (async, don't wait)
    const emailTo = process.env.SMTP_TO || 'bmacdonald417@gmail.com'
    const organization = data.organization?.trim() || 'Not provided'
    const phone = data.phone?.trim() || 'Not provided'
    
    sendEmail({
      to: emailTo,
      subject: `New Contact Form Submission - MacTech Solutions Website`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1e3a8a; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #1e3a8a; }
            .value { margin-top: 5px; padding: 10px; background-color: white; border-left: 3px solid #1e3a8a; }
            .message-box { margin-top: 20px; padding: 15px; background-color: white; border: 1px solid #d1d5db; }
            .footer { margin-top: 20px; padding: 15px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">New Contact Form Submission</h2>
              <p style="margin: 10px 0 0 0; font-size: 14px;">MacTech Solutions Website</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${data.name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
              </div>
              <div class="field">
                <div class="label">Organization:</div>
                <div class="value">${organization}</div>
              </div>
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value">${phone}</div>
              </div>
              <div class="message-box">
                <div class="label">Message:</div>
                <div style="margin-top: 10px; white-space: pre-wrap;">${data.message.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
            <div class="footer">
              <p>This email was automatically generated from the MacTech Solutions contact form.</p>
              <p>Submitted on ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
NEW CONTACT FORM SUBMISSION
MacTech Solutions Website

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NAME:
${data.name}

EMAIL:
${data.email}

ORGANIZATION:
${organization}

PHONE:
${phone}

MESSAGE:
${data.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Submitted on: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}

This email was automatically generated from the MacTech Solutions contact form.
      `,
    }).catch((error) => {
      console.error('Failed to send email:', error)
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


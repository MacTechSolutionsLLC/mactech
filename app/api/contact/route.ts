import { NextRequest, NextResponse } from 'next/server'
import { contactFormSchema } from '@/lib/validation'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = contactFormSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid form data', details: validationResult.error.errors },
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
    const emailTo = process.env.SMTP_TO || 'contact@mactechsolutions.com'
    sendEmail({
      to: emailTo,
      subject: `New Contact Form Submission from ${data.name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        ${data.organization ? `<p><strong>Organization:</strong> ${data.organization}</p>` : ''}
        ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${data.message.replace(/\n/g, '<br>')}</p>
      `,
      text: `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}
${data.organization ? `Organization: ${data.organization}\n` : ''}
${data.phone ? `Phone: ${data.phone}\n` : ''}
Message:
${data.message}
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


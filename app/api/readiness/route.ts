import { NextRequest, NextResponse } from 'next/server'
import { readinessAssessmentSchema } from '@/lib/validation'
import { calculateReadinessScore } from '@/lib/readiness-scoring'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = readinessAssessmentSchema.safeParse(body)
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

    // Calculate readiness score
    const result = calculateReadinessScore(data)

    // Save to database
    const assessment = await prisma.readinessAssessment.create({
      data: {
        email: data.email,
        name: data.name || null,
        organization: data.organization || null,
        systemType: data.systemType,
        authStatus: data.authStatus,
        auditHistory: data.auditHistory,
        infraMaturity: data.infraMaturity,
        timelinePressure: data.timelinePressure,
        readinessScore: result.score,
        gapsSummary: result.gapsSummary.join('; '),
      },
    })

    // Send to Zapier webhook (async, don't wait)
    const zapierWebhookUrl = process.env.ZAPIER_WEBHOOK_URL || 'https://hooks.zapier.com/hooks/catch/17370933/uwfrwd6/'
    
    const webhookPayload = {
      type: 'Readiness Assessment',
      email: data.email,
      name: data.name || '',
      organization: data.organization?.trim() || '',
      readinessScore: result.scoreValue,
      readinessLevel: result.score.toUpperCase(),
      systemType: data.systemType,
      authStatus: data.authStatus,
      auditHistory: data.auditHistory,
      infraMaturity: data.infraMaturity,
      timelinePressure: data.timelinePressure,
      gapsSummary: result.gapsSummary.join('; '),
      submittedAt: new Date().toISOString(),
      submittedAtFormatted: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
      source: 'MacTech Solutions Readiness Assessment',
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

    // Send results email to user
    sendEmail({
      to: data.email,
      subject: 'Your MacTech Solutions Readiness Assessment Results',
      html: `
        <h2>Your Readiness Assessment Results</h2>
        <p>Thank you for completing the MacTech Solutions Readiness Assessment.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Readiness Score: ${result.scoreValue}/100</h3>
          <p style="font-size: 18px; font-weight: bold; color: ${
            result.score === 'high' ? '#059669' :
            result.score === 'medium' ? '#d97706' :
            '#dc2626'
          };">
            ${result.score.toUpperCase()} READINESS
          </p>
        </div>
        <h3>Identified Gaps & Recommendations</h3>
        <ul>
          ${result.gapsSummary.map(gap => `<li>${gap}</li>`).join('')}
        </ul>
        <p>A MacTech Solutions team member will reach out to discuss how we can help address these gaps and improve your readiness.</p>
        <p>Best regards,<br>MacTech Solutions Team</p>
      `,
      text: `
Your Readiness Assessment Results

Thank you for completing the MacTech Solutions Readiness Assessment.

Readiness Score: ${result.scoreValue}/100
${result.score.toUpperCase()} READINESS

Identified Gaps & Recommendations:
${result.gapsSummary.map(gap => `- ${gap}`).join('\n')}

A MacTech Solutions team member will reach out to discuss how we can help address these gaps and improve your readiness.

Best regards,
MacTech Solutions Team
      `,
    }).catch((error) => {
      console.error('Failed to send confirmation email:', error)
    })

    return NextResponse.json({
      success: true,
      id: assessment.id,
      result: {
        score: result.score,
        scoreValue: result.scoreValue,
        gapsSummary: result.gapsSummary,
      },
    })
  } catch (error) {
    console.error('Readiness assessment error:', error)
    return NextResponse.json(
      { error: 'Failed to process assessment' },
      { status: 500 }
    )
  }
}


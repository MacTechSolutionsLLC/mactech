'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    phone: '',
    message: '',
    honeypot: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.honeypot) return

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        organization: '',
        phone: '',
        message: '',
        honeypot: '',
      })
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="bg-white">
      {/* Header - Editorial */}
      <section className="section-narrow bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-hero mb-6">Contact Us</h1>
          <p className="text-body-lg text-neutral-700 max-w-2xl leading-relaxed">
            Ready to discuss your cybersecurity, infrastructure, or compliance needs? 
            We work with federal programs and defense contractors.
          </p>
        </div>
      </section>

      {/* Contact Form - Premium */}
      <section className="section-narrow bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="card p-8 lg:p-12">
            {submitStatus === 'success' && (
              <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-sm fade-in">
                <p className="text-body font-semibold text-green-800 mb-1">Thank you for your message</p>
                <p className="text-body-sm text-green-700">
                  We&apos;ll get back to you as soon as possible.
                </p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-sm fade-in">
                <p className="text-body font-semibold text-red-800 mb-1">Error sending message</p>
                <p className="text-body-sm text-red-700">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={handleChange}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div>
                <label htmlFor="name" className="block text-body-sm font-medium text-neutral-900 mb-2">
                  Name <span className="text-neutral-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-sm text-body focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent transition-all duration-gentle"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-body-sm font-medium text-neutral-900 mb-2">
                  Email <span className="text-neutral-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-sm text-body focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent transition-all duration-gentle"
                />
              </div>

              <div>
                <label htmlFor="organization" className="block text-body-sm font-medium text-neutral-900 mb-2">
                  Organization
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-sm text-body focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent transition-all duration-gentle"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-body-sm font-medium text-neutral-900 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-sm text-body focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent transition-all duration-gentle"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-body-sm font-medium text-neutral-900 mb-2">
                  Message <span className="text-neutral-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-sm text-body focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent resize-vertical transition-all duration-gentle"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-12 text-center">
            <p className="text-body-sm text-neutral-600 mb-2">
              <strong className="text-neutral-900">Government & Prime Contractor Engagement</strong>
            </p>
            <p className="text-body-sm text-neutral-600 max-w-xl mx-auto">
              We specialize in supporting federal programs and defense contractors. 
              Our team is available for proposals and can be named as key personnel.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatbotProps {
  isOpen: boolean
  onClose: () => void
}

export default function Chatbot({ isOpen, onClose }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello, I'm here to help you learn about MacTech Solutions. How can I assist you today?",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }].map(
            (m) => ({ role: m.role, content: m.content })
          ),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message },
      ])

      // Check if response mentions scheduling
      if (
        data.message.toLowerCase().includes('schedule') ||
        data.message.toLowerCase().includes('representative') ||
        data.message.toLowerCase().includes('consultation')
      ) {
        setShowSchedule(true)
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I apologize, but I'm having trouble connecting right now. Would you like to schedule a call with one of our representatives instead?",
        },
      ])
      setShowSchedule(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Chat Window */}
      <div className="relative w-full max-w-2xl h-[600px] sm:h-[700px] bg-white rounded-t-lg sm:rounded-lg shadow-2xl flex flex-col border border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-neutral-50">
          <div>
            <h3 className="heading-3">Talk to MacTech</h3>
            <p className="text-body-sm text-neutral-600 mt-1">
              AI Assistant • Available 24/7
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-900 transition-colors p-2"
            aria-label="Close chat"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-sm p-4 ${
                  message.role === 'user'
                    ? 'bg-accent-700 text-white'
                    : 'bg-neutral-100 text-neutral-900'
                }`}
              >
                <p className="text-body leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-neutral-100 rounded-sm p-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {showSchedule && (
            <div className="mt-6 p-6 bg-accent-50 border border-accent-200 rounded-sm">
              <h4 className="text-body-sm font-semibold text-neutral-900 mb-3">
                Ready to speak with a representative?
              </h4>
              <p className="text-body-sm text-neutral-700 mb-4">
                Schedule a consultation with one of our senior practitioners to discuss your specific needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/contact"
                  className="btn-primary text-center text-body-sm py-2.5"
                  onClick={onClose}
                >
                  Schedule a Call
                </Link>
                <button
                  onClick={() => setShowSchedule(false)}
                  className="btn-secondary text-center text-body-sm py-2.5"
                >
                  Continue Chat
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-6 border-t border-neutral-200 bg-white">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-neutral-300 rounded-sm text-body focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed px-6"
            >
              Send
            </button>
          </div>
          <p className="text-body-sm text-neutral-500 mt-3 text-center">
            Or{' '}
            <Link
              href="/contact"
              className="text-accent-700 hover:text-accent-800 font-medium"
              onClick={onClose}
            >
              schedule a call with a representative
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}


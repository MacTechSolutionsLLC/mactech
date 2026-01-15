'use client'

import { useState } from 'react'
import Chatbot from './Chatbot'

export default function FloatingChatButton() {
  const [chatbotOpen, setChatbotOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setChatbotOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-accent-700 text-white p-4 rounded-full shadow-lg hover:bg-accent-800 transition-all duration-gentle hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent-600 focus:ring-offset-2"
        aria-label="Open chat"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>
      <Chatbot isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </>
  )
}



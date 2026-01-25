'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import FeedbackModal from './FeedbackModal'
import ElementSelector from './ElementSelector'

interface ElementData {
  selector: string
  elementId: string | null
  elementClass: string | null
  elementText: string | null
  elementType: string | null
}

export default function FeedbackButton() {
  const { data: session, status } = useSession()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null)

  // Only show button if user is authenticated
  if (status !== 'authenticated' || !session) {
    return null
  }

  const handleButtonClick = () => {
    setIsSelectionMode(true)
    setSelectedElement(null)
  }

  const handleElementSelected = (elementData: ElementData) => {
    setSelectedElement(elementData)
    setIsSelectionMode(false)
    setIsModalOpen(true)
  }

  const handleCancelSelection = () => {
    setIsSelectionMode(false)
    setSelectedElement(null)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedElement(null)
  }

  return (
    <>
      <button
        data-feedback-button
        onClick={handleButtonClick}
        className={`fixed bottom-6 right-6 ${
          isSelectionMode ? 'z-[10000]' : 'z-50'
        } ${
          isSelectionMode
            ? 'bg-green-600 hover:bg-green-700 animate-pulse'
            : 'bg-accent-700 hover:bg-accent-800'
        } text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center w-14 h-14 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2`}
        aria-label={isSelectionMode ? 'Selecting element...' : 'Submit feedback'}
        title={isSelectionMode ? 'Click an element on the page' : 'Submit feedback'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>

      <ElementSelector
        isActive={isSelectionMode}
        onElementSelected={handleElementSelected}
        onCancel={handleCancelSelection}
      />

      {isModalOpen && (
        <FeedbackModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          selectedElement={selectedElement}
        />
      )}
    </>
  )
}

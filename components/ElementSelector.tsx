'use client'

import { useEffect, useRef, useState } from 'react'

interface ElementData {
  selector: string
  elementId: string | null
  elementClass: string | null
  elementText: string | null
  elementType: string | null
}

interface ElementSelectorProps {
  isActive: boolean
  onElementSelected: (elementData: ElementData) => void
  onCancel: () => void
}

// Generate full CSS path selector (moved outside component to avoid dependency issues)
function generatePathSelector(element: HTMLElement): string {
  const path: string[] = []

  while (element && element.nodeType === Node.ELEMENT_NODE) {
    let selector = element.nodeName.toLowerCase()

    if (element.id) {
      selector += `#${element.id}`
      path.unshift(selector)
      break
    } else {
      if (element.className && typeof element.className === 'string') {
        const classes = element.className.trim().split(/\s+/).filter(Boolean)
        if (classes.length > 0) {
          selector += `.${classes[0].replace(/[.#:\[\]]/g, '\\$&')}`
        }
      }

      // Add nth-child if needed for uniqueness
      const parent = element.parentElement
      if (parent) {
        const siblings = Array.from(parent.children)
        const index = siblings.indexOf(element) + 1
        if (siblings.length > 1) {
          selector += `:nth-child(${index})`
        }
      }

      path.unshift(selector)
      element = element.parentElement as HTMLElement
    }
  }

  return path.join(' > ')
}

// Generate CSS selector for an element (moved outside component)
function generateSelector(element: HTMLElement): string {
  // Prefer ID
  if (element.id) {
    return `#${element.id}`
  }

  // Prefer class (first class)
  if (element.className && typeof element.className === 'string') {
    const classes = element.className.trim().split(/\s+/).filter(Boolean)
    if (classes.length > 0) {
      // Escape special characters in class name
      const firstClass = classes[0].replace(/[.#:\[\]]/g, '\\$&')
      return `.${firstClass}`
    }
  }

  // Generate path as fallback
  return generatePathSelector(element)
}

// Extract element data (moved outside component)
function extractElementData(element: HTMLElement): ElementData {
  const selector = generateSelector(element)
  const elementId = element.id || null
  const elementClass =
    element.className && typeof element.className === 'string'
      ? element.className.trim().split(/\s+/)[0] || null
      : null
  const elementText = element.textContent?.trim().substring(0, 100) || null
  const elementType = element.tagName.toLowerCase()

  return {
    selector,
    elementId,
    elementClass,
    elementText,
    elementType,
  }
}

export default function ElementSelector({
  isActive,
  onElementSelected,
  onCancel,
}: ElementSelectorProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const highlightedElementRef = useRef<HTMLElement | null>(null)
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null)

  // Remove highlight from element
  const removeHighlight = (element: HTMLElement | null) => {
    if (element) {
      element.style.outline = ''
      element.style.outlineOffset = ''
      element.style.backgroundColor = ''
    }
  }

  // Add highlight to element
  const addHighlight = (element: HTMLElement, isSelected: boolean = false) => {
    if (element) {
      element.style.outline = isSelected ? '3px solid rgb(34, 197, 94)' : '2px solid rgb(59, 130, 246)'
      element.style.outlineOffset = '2px'
      element.style.backgroundColor = isSelected
        ? 'rgba(34, 197, 94, 0.1)'
        : 'rgba(59, 130, 246, 0.1)'
      element.style.cursor = 'pointer'
    }
  }

  // Handle mouse move to highlight elements
  useEffect(() => {
    if (!isActive) {
      // Clean up any remaining highlights
      if (highlightedElementRef.current) {
        removeHighlight(highlightedElementRef.current)
        highlightedElementRef.current = null
      }
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // Don't highlight the overlay itself or the feedback button
      if (
        !target ||
        target === overlayRef.current ||
        target.closest('[data-feedback-button]') ||
        target.closest('[data-feedback-modal]')
      ) {
        if (highlightedElementRef.current) {
          removeHighlight(highlightedElementRef.current)
          highlightedElementRef.current = null
          setHoveredElement(null)
        }
        return
      }

      // Remove highlight from previous element
      if (highlightedElementRef.current && highlightedElementRef.current !== target) {
        removeHighlight(highlightedElementRef.current)
      }

      // Add highlight to current element
      if (target !== highlightedElementRef.current) {
        addHighlight(target)
        highlightedElementRef.current = target
        setHoveredElement(target)
      }
    }

    const handleClick = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const target = e.target as HTMLElement

      // Don't capture clicks on overlay or feedback button
      if (
        !target ||
        target === overlayRef.current ||
        target.closest('[data-feedback-button]') ||
        target.closest('[data-feedback-modal]')
      ) {
        return
      }

      // Add selected highlight
      if (highlightedElementRef.current) {
        addHighlight(highlightedElementRef.current, true)
      }

      // Extract element data and call callback
      const elementData = extractElementData(target)
      onElementSelected(elementData)

      // Clean up after a short delay to show selection
      setTimeout(() => {
        if (highlightedElementRef.current) {
          removeHighlight(highlightedElementRef.current)
          highlightedElementRef.current = null
        }
      }, 300)
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        // Clean up highlights
        if (highlightedElementRef.current) {
          removeHighlight(highlightedElementRef.current)
          highlightedElementRef.current = null
        }
        onCancel()
      }
    }

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('click', handleClick, true)
    document.addEventListener('keydown', handleEscape)

    // Set cursor style
    document.body.style.cursor = 'crosshair'

    return () => {
      // Clean up
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('keydown', handleEscape)
      document.body.style.cursor = ''

      // Remove any remaining highlights
      if (highlightedElementRef.current) {
        removeHighlight(highlightedElementRef.current)
        highlightedElementRef.current = null
      }
    }
  }, [isActive, onElementSelected, onCancel])

  if (!isActive) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9998] bg-black bg-opacity-20 pointer-events-auto"
      style={{ cursor: 'crosshair' }}
    >
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] bg-white rounded-lg shadow-lg px-4 py-2 border-2 border-blue-500">
        <p className="text-sm font-medium text-neutral-900">
          Click on an element to select it • Press ESC to cancel
        </p>
      </div>
    </div>
  )
}

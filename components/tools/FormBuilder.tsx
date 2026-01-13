'use client'

import { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  value?: string | number | boolean
  onChange?: (value: any) => void
  error?: string
  helpText?: string
  children?: ReactNode
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  required,
  options,
  value,
  onChange,
  error,
  helpText,
  children,
}: FormFieldProps) {
  const inputId = `field-${name}`

  return (
    <div className="mb-6">
      <label htmlFor={inputId} className="block text-body-sm font-semibold text-neutral-900 mb-2">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={inputId}
          name={name}
          placeholder={placeholder}
          required={required}
          value={value as string}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 ${
            error ? 'border-red-300' : 'border-neutral-300'
          }`}
          rows={4}
        />
      ) : type === 'select' ? (
        <select
          id={inputId}
          name={name}
          required={required}
          value={value as string}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 ${
            error ? 'border-red-300' : 'border-neutral-300'
          }`}
        >
          <option value="">Select an option...</option>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'checkbox' ? (
        <div className="flex items-center">
          <input
            id={inputId}
            name={name}
            type="checkbox"
            checked={value as boolean}
            onChange={(e) => onChange?.(e.target.checked)}
            className="w-4 h-4 text-accent-600 border-neutral-300 rounded focus:ring-accent-500"
          />
          <label htmlFor={inputId} className="ml-2 text-body-sm text-neutral-700">
            {helpText || label}
          </label>
        </div>
      ) : (
        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          value={value as string | number}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 ${
            error ? 'border-red-300' : 'border-neutral-300'
          }`}
        />
      )}

      {error && (
        <p className="mt-1 text-body-sm text-red-600">{error}</p>
      )}
      
      {helpText && !error && type !== 'checkbox' && (
        <p className="mt-1 text-body-sm text-neutral-500">{helpText}</p>
      )}

      {children}
    </div>
  )
}

interface FormBuilderProps {
  children: ReactNode
  onSubmit?: (e: React.FormEvent) => void
  submitLabel?: string
  isLoading?: boolean
}

export function FormBuilder({ children, onSubmit, submitLabel = 'Submit', isLoading }: FormBuilderProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {children}
      {onSubmit && (
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : submitLabel}
          </button>
        </div>
      )}
    </form>
  )
}


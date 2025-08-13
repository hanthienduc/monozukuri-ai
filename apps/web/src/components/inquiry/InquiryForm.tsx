import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import DOMPurify from 'dompurify'
import toast from 'react-hot-toast'
import type { InquiryFormData, Language, InquiryUrgency } from '@/types/inquiry'

interface InquiryFormProps {
  onSubmit: (data: InquiryFormData) => Promise<void>
  initialData?: Partial<InquiryFormData>
  language: Language
}

interface FormData {
  title: string
  description: string
  category?: string
  urgency: InquiryUrgency
  contactEmail: string
  companyName: string
  attachments: File[]
}

const LABELS = {
  en: {
    title: 'Title',
    description: 'Description',
    category: 'Category',
    urgency: 'Urgency',
    email: 'Email',
    companyName: 'Company Name',
    attachment: 'Attachment',
    submit: 'Submit',
    submitting: 'Submitting...',
    categories: {
      quote_request: 'Quote Request',
      technical_spec: 'Technical Specification',
      capability: 'Capability Inquiry',
      partnership: 'Partnership',
    },
    urgencies: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
    },
    errors: {
      titleRequired: 'Title is required',
      descriptionRequired: 'Description is required',
      emailRequired: 'Email is required',
      companyRequired: 'Company name is required',
      invalidEmail: 'Invalid email format',
      descriptionTooShort: 'Description must be at least 20 characters',
      titleTooLong: 'Title must be less than 200 characters',
      fileTooLarge: 'File size exceeds 10MB limit',
      invalidFileType: 'Invalid file type',
    },
  },
  jp: {
    title: 'タイトル',
    description: '説明',
    category: 'カテゴリ',
    urgency: '緊急度',
    email: 'メール',
    companyName: '会社名',
    attachment: '添付ファイル',
    submit: '送信',
    submitting: '送信中...',
    categories: {
      quote_request: '見積依頼',
      technical_spec: '技術仕様',
      capability: '能力照会',
      partnership: 'パートナーシップ',
    },
    urgencies: {
      low: '低',
      medium: '中',
      high: '高',
    },
    errors: {
      titleRequired: 'タイトルは必須です',
      descriptionRequired: '説明は必須です',
      emailRequired: 'メールは必須です',
      companyRequired: '会社名は必須です',
      invalidEmail: '無効なメール形式です',
      descriptionTooShort: '説明は20文字以上である必要があります',
      titleTooLong: 'タイトルは200文字未満である必要があります',
      fileTooLarge: 'ファイルサイズが10MBの制限を超えています',
      invalidFileType: '無効なファイル形式です',
    },
  },
}

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim()
}

export const InquiryForm: React.FC<InquiryFormProps> = ({
  onSubmit,
  initialData,
  language,
}) => {
  const labels = LABELS[language]
  const [attachments, setAttachments] = useState<File[]>([])
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const {
    register,
    handleSubmit,
    // watch,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      urgency: initialData?.urgency || 'medium',
      contactEmail: initialData?.contactEmail || '',
      companyName: initialData?.companyName || '',
      attachments: [],
    },
  })

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        if (value !== undefined) {
          setValue(key as any, value)
        }
      })
    }
  }, [initialData, setValue])

  const validateForm = (data: FormData): Record<string, string> => {
    const newErrors: Record<string, string> = {}

    if (!data.title?.trim()) {
      newErrors.title = labels.errors.titleRequired
    } else if (data.title.length > 200) {
      newErrors.title = labels.errors.titleTooLong
    }

    if (!data.description?.trim()) {
      newErrors.description = labels.errors.descriptionRequired
    } else if (data.description.length < 20) {
      newErrors.description = labels.errors.descriptionTooShort
    }

    if (!data.contactEmail?.trim()) {
      newErrors.contactEmail = labels.errors.emailRequired
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.contactEmail)) {
        newErrors.contactEmail = labels.errors.invalidEmail
      }
    }

    if (!data.companyName?.trim()) {
      newErrors.companyName = labels.errors.companyRequired
    }

    return newErrors
  }

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return labels.errors.fileTooLarge
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return labels.errors.invalidFileType
    }

    return null
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles: File[] = []
    const newErrors: string[] = []

    files.forEach((file) => {
      const error = validateFile(file)
      if (error) {
        newErrors.push(error)
      } else {
        validFiles.push(file)
      }
    })

    if (newErrors.length > 0) {
      newErrors.forEach((error) => toast.error(error))
    }

    setAttachments((prev) => [...prev, ...validFiles])
    event.target.value = '' // Reset input
  }

  const removeFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const onFormSubmit = async (data: FormData) => {
    const validationErrors = validateForm(data)
    setFormErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }
    try {
      // Sanitize input
      const sanitizedData: InquiryFormData = {
        title: sanitizeInput(data.title),
        description: sanitizeInput(data.description),
        category: data.category,
        urgency: data.urgency,
        contactEmail: data.contactEmail.trim(),
        companyName: sanitizeInput(data.companyName),
        language,
        attachments,
      }

      await onSubmit(sanitizedData)
      
      // Reset form on successful submission
      reset()
      setAttachments([])
      setFormErrors({})
      toast.success('Inquiry submitted successfully!')
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('Failed to submit inquiry. Please try again.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-6 bg-white p-6 rounded-lg shadow-sm"
      role="form"
      aria-label="Inquiry submission form"
    >
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {labels.title} *
        </label>
        <input
          {...register('title', { required: true })}
          type="text"
          id="title"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-required="true"
          maxLength={200}
        />
        {formErrors.title && (
          <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">
            {formErrors.title}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {labels.description} *
        </label>
        <textarea
          {...register('description', { required: true })}
          id="description"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-required="true"
          minLength={20}
        />
        {formErrors.description && (
          <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">
            {formErrors.description}
          </p>
        )}
      </div>

      {/* Category and Urgency Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {labels.category}
          </label>
          <select
            {...register('category')}
            id="category"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select category</option>
            {Object.entries(labels.categories).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="urgency"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {labels.urgency} *
          </label>
          <select
            {...register('urgency', { required: true })}
            id="urgency"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-required="true"
          >
            {Object.entries(labels.urgencies).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Email and Company Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="contactEmail"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {labels.email} *
          </label>
          <input
            {...register('contactEmail', { required: true })}
            type="email"
            id="contactEmail"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-required="true"
          />
          {formErrors.contactEmail && (
            <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">
              {formErrors.contactEmail}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="companyName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {labels.companyName} *
          </label>
          <input
            {...register('companyName', { required: true })}
            type="text"
            id="companyName"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-required="true"
          />
          {formErrors.companyName && (
            <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">
              {formErrors.companyName}
            </p>
          )}
        </div>
      </div>

      {/* File Upload */}
      <div>
        <label
          htmlFor="attachments"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {labels.attachment}
        </label>
        <input
          type="file"
          id="attachments"
          onChange={handleFileChange}
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {/* File List */}
        {attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md"
              >
                <span className="text-sm text-gray-700">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-sm text-red-600 hover:text-red-800"
                  aria-label="Remove"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? labels.submitting : labels.submit}
      </button>
    </form>
  )
}
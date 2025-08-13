import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import DOMPurify from 'dompurify'
import { apiService } from '@/services/api'
import type { InquiryFormData, Inquiry, Pagination } from '@/types/inquiry'

interface UseInquiryReturn {
  // Submission state
  submitInquiry: (data: InquiryFormData) => Promise<string>
  isSubmitting: boolean
  submissionStatus: 'idle' | 'loading' | 'success' | 'error'
  lastSubmittedId: string | null
  error: Error | null

  // Inquiries data
  inquiries: Inquiry[]
  pagination: Pagination | null
  fetchInquiries: (filters?: any) => Promise<void>
  updateInquiry: (id: string, updates: Partial<Inquiry>) => Promise<void>
  deleteInquiry: (id: string) => Promise<boolean>

  // Real-time features
  isConnected: boolean
  connectWebSocket: () => void
  handleWebSocketMessage: (message: any) => void
}

// Input sanitization helper
const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [] 
  }).trim()
}

// Validation helper
const validateInquiryData = (data: InquiryFormData): void => {
  if (!data.title?.trim()) {
    throw new Error('Title is required')
  }
  if (!data.description?.trim()) {
    throw new Error('Description is required')
  }
  if (data.description.length < 20) {
    throw new Error('Description must be at least 20 characters')
  }
  if (data.title.length > 200) {
    throw new Error('Title must be less than 200 characters')
  }
  if (!data.contactEmail?.trim()) {
    throw new Error('Email is required')
  }
  if (!data.companyName?.trim()) {
    throw new Error('Company name is required')
  }
  
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.contactEmail)) {
    throw new Error('Invalid email format')
  }
}

export const useInquiry = (): UseInquiryReturn => {
  const queryClient = useQueryClient()
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null)
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Submit inquiry mutation
  const submitMutation = useMutation({
    mutationFn: async (data: InquiryFormData) => {
      // Validate input
      validateInquiryData(data)

      // Sanitize input
      const sanitizedData: InquiryFormData = {
        ...data,
        title: sanitizeInput(data.title),
        description: sanitizeInput(data.description),
        companyName: sanitizeInput(data.companyName),
        attachments: data.attachments || [],
      }

      const result = await apiService.classifyInquiry(sanitizedData)
      return result.inquiry_id
    },
    onMutate: () => {
      setSubmissionStatus('loading')
    },
    onSuccess: (inquiryId) => {
      setSubmissionStatus('success')
      setLastSubmittedId(inquiryId)
    },
    onError: (error) => {
      setSubmissionStatus('error')
      console.error('Inquiry submission error:', error)
    },
  })

  // Fetch inquiries
  const fetchInquiries = useCallback(async (filters?: any) => {
    try {
      const result = await apiService.fetchInquiries(filters)
      setInquiries(result.inquiries.map(inquiry => ({
        ...inquiry,
        createdAt: new Date(inquiry.createdAt),
        updatedAt: new Date(inquiry.updatedAt),
      })))
      setPagination(result.pagination)
    } catch (error) {
      console.error('Failed to fetch inquiries:', error)
      throw error
    }
  }, [])

  // Update inquiry mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Inquiry> }) => {
      await apiService.updateInquiry(id, updates)
    },
    onMutate: async ({ id, updates }) => {
      // Optimistic update
      setInquiries(prev => prev.map(inquiry =>
        inquiry.id === id ? { ...inquiry, ...updates } : inquiry
      ))
    },
    onError: (error) => {
      // Rollback on error
      queryClient.invalidateQueries({ queryKey: ['inquiries'] })
      console.error('Failed to update inquiry:', error)
    },
  })

  // Delete inquiry mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Confirmation dialog
      const confirmed = window.confirm('Are you sure you want to delete this inquiry?')
      if (!confirmed) return false

      await apiService.deleteInquiry(id)
      return true
    },
    onSuccess: (deleted, id) => {
      if (deleted) {
        setInquiries(prev => prev.filter(inquiry => inquiry.id !== id))
      }
    },
    onError: (error) => {
      console.error('Failed to delete inquiry:', error)
    },
  })

  // WebSocket connection (placeholder implementation)
  const connectWebSocket = useCallback(() => {
    // In a real implementation, this would establish a WebSocket connection
    setIsConnected(true)
  }, [])

  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.event === 'inquiry_updated') {
      const { inquiryId, updates } = message.data
      setInquiries(prev => prev.map(inquiry =>
        inquiry.id === inquiryId ? { ...inquiry, ...updates } : inquiry
      ))
    }
  }, [])

  return {
    // Submission
    submitInquiry: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    submissionStatus,
    lastSubmittedId,
    error: submitMutation.error,

    // Inquiries
    inquiries,
    pagination,
    fetchInquiries,
    updateInquiry: async (id: string, updates: Partial<Inquiry>) => {
      await updateMutation.mutateAsync({ id, updates })
    },
    deleteInquiry: deleteMutation.mutateAsync,

    // Real-time
    isConnected,
    connectWebSocket,
    handleWebSocketMessage,
  }
}
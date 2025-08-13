import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { apiService } from '@/services/api'
import type { Inquiry, InquiryFormData } from '@/types/inquiry'

interface InquiryState {
  // State
  inquiries: Inquiry[]
  currentInquiry: Inquiry | null
  isLoading: boolean
  error: Error | null

  // Actions
  submitInquiry: (data: InquiryFormData) => Promise<string>
  fetchInquiries: (filters?: {
    category?: string
    status?: string
    search?: string
    page?: number
    limit?: number
  }) => Promise<void>
  updateInquiry: (id: string, updates: Partial<Inquiry>) => void
  deleteInquiry: (id: string) => Promise<void>
  setCurrentInquiry: (inquiry: Inquiry | null) => void
  clearError: () => void
}

export const useInquiryStore = create<InquiryState>()(
  devtools(
    (set, get) => ({
      // Initial state
      inquiries: [],
      currentInquiry: null,
      isLoading: false,
      error: null,

      // Submit inquiry action
      submitInquiry: async (data: InquiryFormData) => {
        set({ isLoading: true, error: null })
        
        try {
          const result = await apiService.classifyInquiry(data)
          set({ isLoading: false })
          return result.inquiry_id
        } catch (error) {
          const errorObj = error instanceof Error ? error : new Error('Unknown error occurred')
          set({ 
            isLoading: false, 
            error: errorObj
          })
          throw errorObj
        }
      },

      // Fetch inquiries action
      fetchInquiries: async (filters?) => {
        set({ isLoading: true, error: null })
        
        try {
          const result = await apiService.fetchInquiries(filters)
          set({ 
            inquiries: result.inquiries.map((inquiry: any) => ({
              ...inquiry,
              createdAt: new Date(inquiry.created_at || inquiry.createdAt),
              updatedAt: new Date(inquiry.updated_at || inquiry.updatedAt),
            })),
            isLoading: false
          })
        } catch (error) {
          const errorObj = error instanceof Error ? error : new Error('Failed to fetch inquiries')
          set({ 
            isLoading: false, 
            error: errorObj
          })
          throw errorObj
        }
      },

      // Update inquiry action (optimistic update)
      updateInquiry: (id: string, updates: Partial<Inquiry>) => {
        const { inquiries, currentInquiry } = get()
        
        const updatedInquiries = inquiries.map(inquiry =>
          inquiry.id === id 
            ? { ...inquiry, ...updates, updatedAt: new Date() }
            : inquiry
        )
        
        const updatedCurrentInquiry = currentInquiry?.id === id
          ? { ...currentInquiry, ...updates, updatedAt: new Date() }
          : currentInquiry

        set({
          inquiries: updatedInquiries,
          currentInquiry: updatedCurrentInquiry,
        })
      },

      // Delete inquiry action
      deleteInquiry: async (id: string) => {
        set({ isLoading: true, error: null })
        
        try {
          await apiService.deleteInquiry(id)
          
          const { inquiries, currentInquiry } = get()
          
          set({
            inquiries: inquiries.filter(inquiry => inquiry.id !== id),
            currentInquiry: currentInquiry?.id === id ? null : currentInquiry,
            isLoading: false
          })
        } catch (error) {
          const errorObj = error instanceof Error ? error : new Error('Failed to delete inquiry')
          set({ 
            isLoading: false, 
            error: errorObj
          })
          throw errorObj
        }
      },

      // Set current inquiry action
      setCurrentInquiry: (inquiry: Inquiry | null) => {
        set({ currentInquiry: inquiry })
      },

      // Clear error action
      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'inquiry-store',
      // Only include in devtools during development
      enabled: import.meta.env?.DEV || false,
    }
  )
)
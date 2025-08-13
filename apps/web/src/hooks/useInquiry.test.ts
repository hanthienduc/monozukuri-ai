import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useInquiry } from './useInquiry'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useInquiry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('submitInquiry', () => {
    it('should submit inquiry successfully', async () => {
      const { result } = renderHook(() => useInquiry(), {
        wrapper: createWrapper(),
      })

      const inquiryData = {
        title: 'Test Inquiry',
        description: 'Test description that is long enough',
        category: 'quote_request',
        urgency: 'medium' as const,
        contactEmail: 'test@example.com',
        companyName: 'Test Company',
        language: 'en' as const,
      }

      await waitFor(async () => {
        await result.current.submitInquiry(inquiryData)
      })

      expect(result.current.submissionStatus).toBe('success')
      expect(result.current.lastSubmittedId).toBeTruthy()
    })

    it('should handle submission error', async () => {
      const { result } = renderHook(() => useInquiry(), {
        wrapper: createWrapper(),
      })

      // Mock API to return error
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'))

      const inquiryData = {
        title: 'Test Inquiry',
        description: 'Test description',
        category: 'quote_request',
        urgency: 'medium' as const,
        contactEmail: 'test@example.com',
        companyName: 'Test Company',
        language: 'en' as const,
      }

      await waitFor(async () => {
        try {
          await result.current.submitInquiry(inquiryData)
        } catch (error) {
          // Expected error
        }
      })

      expect(result.current.submissionStatus).toBe('error')
      expect(result.current.error).toBeTruthy()
    })

    it('should set loading state during submission', async () => {
      const { result } = renderHook(() => useInquiry(), {
        wrapper: createWrapper(),
      })

      const inquiryData = {
        title: 'Test Inquiry',
        description: 'Test description that is long enough',
        category: 'quote_request',
        urgency: 'medium' as const,
        contactEmail: 'test@example.com',
        companyName: 'Test Company',
        language: 'en' as const,
      }

      const submissionPromise = result.current.submitInquiry(inquiryData)
      
      expect(result.current.isSubmitting).toBe(true)

      await waitFor(async () => {
        await submissionPromise
      })

      expect(result.current.isSubmitting).toBe(false)
    })

    it('should validate required fields before submission', async () => {
      const { result } = renderHook(() => useInquiry(), {
        wrapper: createWrapper(),
      })

      const invalidData = {
        title: '', // Empty title
        description: 'Test',
        urgency: 'medium' as const,
        contactEmail: 'test@example.com',
        companyName: 'Test Company',
        language: 'en' as const,
      }

      await expect(result.current.submitInquiry(invalidData)).rejects.toThrow(/title is required/i)
    })

    it('should sanitize input before submission', async () => {
      const { result } = renderHook(() => useInquiry(), {
        wrapper: createWrapper(),
      })

      const mockFetch = vi.spyOn(global, 'fetch')

      const inquiryData = {
        title: '<script>alert("XSS")</script>Safe Title',
        description: 'Test description with <script>malicious</script> content',
        category: 'quote_request',
        urgency: 'medium' as const,
        contactEmail: 'test@example.com',
        companyName: 'Test Company',
        language: 'en' as const,
      }

      await waitFor(async () => {
        await result.current.submitInquiry(inquiryData)
      })

      // Check that fetch was called with sanitized data
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('Safe Title'),
        })
      )

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body as string)
      expect(callBody.title).not.toContain('<script>')
      expect(callBody.description).not.toContain('<script>')
    })
  })

  describe('fetchInquiries', () => {
    it('should fetch inquiries list', async () => {
      const { result } = renderHook(() => useInquiry(), {
        wrapper: createWrapper(),
      })

      await waitFor(async () => {
        await result.current.fetchInquiries()
      })

      expect(result.current.inquiries).toHaveLength(2)
      expect(result.current.inquiries[0].title).toBe('Bulk Order for Precision Bearings')
    })

    it('should apply filters when fetching', async () => {
      const { result } = renderHook(() => useInquiry(), {
        wrapper: createWrapper(),
      })

      await waitFor(async () => {
        await result.current.fetchInquiries({
          category: 'quote_request',
          status: 'pending',
        })
      })

      expect(result.current.inquiries).toBeTruthy()
      // All returned inquiries should match filters
      result.current.inquiries.forEach(inquiry => {
        expect(inquiry.category).toBe('quote_request')
        expect(inquiry.status).toBe('pending')
      })
    })

    it('should handle pagination', async () => {
      const { result } = renderHook(() => useInquiry(), {
        wrapper: createWrapper(),
      })

      await waitFor(async () => {
        await result.current.fetchInquiries({ page: 2, limit: 10 })
      })

      expect(result.current.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 50,
        total_pages: 5,
      })
    })

    it('should cache results', async () => {
      const mockFetch = vi.spyOn(global, 'fetch')
      const { result } = renderHook(() => useInquiry(), {
        wrapper: createWrapper(),
      })

      // First fetch
      await waitFor(async () => {
        await result.current.fetchInquiries()
      })

      const firstCallCount = mockFetch.mock.calls.length

      // Second fetch with same parameters should use cache
      await waitFor(async () => {
        await result.current.fetchInquiries()
      })

      expect(mockFetch.mock.calls.length).toBe(firstCallCount)
    })
  })

  describe('updateInquiry', () => {
    it('should update inquiry optimistically', async () => {
      const { result } = renderHook(() => useInquiry(), {
        wrapper: createWrapper(),
      })

      // First fetch inquiries
      await waitFor(async () => {
        await result.current.fetchInquiries()
      })

      const originalInquiry = result.current.inquiries[0]

      // Update inquiry
      await waitFor(async () => {
        await result.current.updateInquiry('INQ-2025-001', {
          status: 'processed',
        })
      })

      // Check optimistic update
      const updatedInquiry = result.current.inquiries.find(
        i => i.id === 'INQ-2025-001'
      )
      expect(updatedInquiry?.status).toBe('processed')
    })

    it('should rollback on update failure', async () => {
      const { result } = renderHook(() => useInquiry(), {
        wrapper: createWrapper(),
      })

      // Mock API to fail
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Update failed'))

      await waitFor(async () => {
        await result.current.fetchInquiries()
      })

      const originalStatus = result.current.inquiries[0].status

      try {
        await result.current.updateInquiry('INQ-2025-001', {
          status: 'processed',
        })
      } catch (error) {
        // Expected error
      }

      // Check that status was rolled back
      await waitFor(() => {
        const inquiry = result.current.inquiries.find(i => i.id === 'INQ-2025-001')
        expect(inquiry?.status).toBe(originalStatus)
      })
    })
  })

  describe('deleteInquiry', () => {
    it('should delete inquiry', async () => {
      const { result } = renderHook(() => useInquiry(), {
        wrapper: createWrapper(),
      })

      await waitFor(async () => {
        await result.current.fetchInquiries()
      })

      const initialCount = result.current.inquiries.length

      await waitFor(async () => {
        await result.current.deleteInquiry('INQ-2025-001')
      })

      expect(result.current.inquiries.length).toBe(initialCount - 1)
      expect(result.current.inquiries.find(i => i.id === 'INQ-2025-001')).toBeUndefined()
    })

    it('should confirm before deletion', async () => {
      const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
      
      const { result } = renderHook(() => useInquiry(), {
        wrapper: createWrapper(),
      })

      await waitFor(async () => {
        await result.current.fetchInquiries()
      })

      const initialCount = result.current.inquiries.length

      await waitFor(async () => {
        await result.current.deleteInquiry('INQ-2025-001')
      })

      // Should not delete if not confirmed
      expect(result.current.inquiries.length).toBe(initialCount)
      expect(mockConfirm).toHaveBeenCalled()
    })
  })

  describe('Real-time Updates', () => {
    it('should subscribe to WebSocket updates', () => {
      const { result } = renderHook(() => useInquiry(), {
        wrapper: createWrapper(),
      })

      expect(result.current.isConnected).toBe(false)

      // Simulate WebSocket connection
      result.current.connectWebSocket()

      // Would need WebSocket mock to fully test
      // This is a placeholder for WebSocket testing
    })

    it('should update inquiry on WebSocket message', async () => {
      const { result } = renderHook(() => useInquiry(), {
        wrapper: createWrapper(),
      })

      await waitFor(async () => {
        await result.current.fetchInquiries()
      })

      // Simulate WebSocket message
      result.current.handleWebSocketMessage({
        event: 'inquiry_updated',
        data: {
          inquiryId: 'INQ-2025-001',
          updates: { status: 'processed' },
        },
      })

      const updatedInquiry = result.current.inquiries.find(
        i => i.id === 'INQ-2025-001'
      )
      expect(updatedInquiry?.status).toBe('processed')
    })
  })
})
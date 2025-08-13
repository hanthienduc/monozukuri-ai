import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useInquiryStore } from './inquiryStore'

// Mock fetch globally
global.fetch = vi.fn()

describe('inquiryStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useInquiryStore.setState({
      inquiries: [],
      currentInquiry: null,
      isLoading: false,
      error: null,
    })
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useInquiryStore())
      
      expect(result.current.inquiries).toEqual([])
      expect(result.current.currentInquiry).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('submitInquiry', () => {
    it('should submit inquiry and update state', async () => {
      const mockResponse = {
        inquiry_id: 'INQ-2025-003',
        status: 'success',
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const { result } = renderHook(() => useInquiryStore())

      const inquiryData = {
        title: 'Test Inquiry',
        description: 'Test description',
        category: 'quote_request',
        urgency: 'medium' as const,
        contactEmail: 'test@example.com',
        companyName: 'Test Company',
        language: 'en' as const,
      }

      await act(async () => {
        await result.current.submitInquiry(inquiryData)
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/inquiries/classify'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(inquiryData),
        })
      )
    })

    it('should handle submission error', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useInquiryStore())

      const inquiryData = {
        title: 'Test Inquiry',
        description: 'Test description',
        category: 'quote_request',
        urgency: 'medium' as const,
        contactEmail: 'test@example.com',
        companyName: 'Test Company',
        language: 'en' as const,
      }

      await act(async () => {
        try {
          await result.current.submitInquiry(inquiryData)
        } catch (error) {
          // Expected error
        }
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeTruthy()
      expect(result.current.error?.message).toContain('Network error')
    })

    it('should set loading state during submission', async () => {
      let resolvePromise: (value: any) => void
      const promise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      ;(global.fetch as any).mockReturnValueOnce(promise)

      const { result } = renderHook(() => useInquiryStore())

      const inquiryData = {
        title: 'Test Inquiry',
        description: 'Test description',
        category: 'quote_request',
        urgency: 'medium' as const,
        contactEmail: 'test@example.com',
        companyName: 'Test Company',
        language: 'en' as const,
      }

      act(() => {
        result.current.submitInquiry(inquiryData)
      })

      expect(result.current.isLoading).toBe(true)

      await act(async () => {
        resolvePromise!({
          ok: true,
          json: async () => ({ inquiry_id: 'INQ-2025-003', status: 'success' }),
        })
        await promise
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('fetchInquiries', () => {
    it('should fetch and store inquiries', async () => {
      const mockInquiries = [
        {
          id: 'INQ-2025-001',
          title: 'Test Inquiry 1',
          category: 'quote_request',
          status: 'pending',
        },
        {
          id: 'INQ-2025-002',
          title: 'Test Inquiry 2',
          category: 'technical_spec',
          status: 'reviewed',
        },
      ]

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          inquiries: mockInquiries,
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            total_pages: 1,
          },
        }),
      })

      const { result } = renderHook(() => useInquiryStore())

      await act(async () => {
        await result.current.fetchInquiries()
      })

      expect(result.current.inquiries).toEqual(mockInquiries)
      expect(result.current.isLoading).toBe(false)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/inquiries'),
        expect.any(Object)
      )
    })

    it('should apply filters when fetching', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          inquiries: [],
          pagination: { page: 1, limit: 10, total: 0, total_pages: 0 },
        }),
      })

      const { result } = renderHook(() => useInquiryStore())

      const filters = {
        category: 'quote_request',
        status: 'pending',
        search: 'test',
      }

      await act(async () => {
        await result.current.fetchInquiries(filters)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('category=quote_request'),
        expect.any(Object)
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=pending'),
        expect.any(Object)
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=test'),
        expect.any(Object)
      )
    })

    it('should handle fetch error', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Fetch failed'))

      const { result } = renderHook(() => useInquiryStore())

      await act(async () => {
        try {
          await result.current.fetchInquiries()
        } catch (error) {
          // Expected error
        }
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.error?.message).toContain('Fetch failed')
      expect(result.current.inquiries).toEqual([])
    })
  })

  describe('updateInquiry', () => {
    it('should update existing inquiry', () => {
      const { result } = renderHook(() => useInquiryStore())

      // Set initial inquiries
      act(() => {
        useInquiryStore.setState({
          inquiries: [
            {
              id: 'INQ-2025-001',
              title: 'Original Title',
              status: 'pending',
            } as any,
          ],
        })
      })

      act(() => {
        result.current.updateInquiry('INQ-2025-001', {
          title: 'Updated Title',
          status: 'reviewed',
        })
      })

      expect(result.current.inquiries[0].title).toBe('Updated Title')
      expect(result.current.inquiries[0].status).toBe('reviewed')
    })

    it('should not update non-existent inquiry', () => {
      const { result } = renderHook(() => useInquiryStore())

      act(() => {
        useInquiryStore.setState({
          inquiries: [
            {
              id: 'INQ-2025-001',
              title: 'Original Title',
            } as any,
          ],
        })
      })

      act(() => {
        result.current.updateInquiry('INQ-2025-999', {
          title: 'Should Not Update',
        })
      })

      expect(result.current.inquiries[0].title).toBe('Original Title')
    })

    it('should update currentInquiry if it matches', () => {
      const { result } = renderHook(() => useInquiryStore())

      const inquiry = {
        id: 'INQ-2025-001',
        title: 'Original Title',
        status: 'pending',
      } as any

      act(() => {
        useInquiryStore.setState({
          inquiries: [inquiry],
          currentInquiry: inquiry,
        })
      })

      act(() => {
        result.current.updateInquiry('INQ-2025-001', {
          status: 'reviewed',
        })
      })

      expect(result.current.currentInquiry?.status).toBe('reviewed')
    })
  })

  describe('deleteInquiry', () => {
    it('should delete inquiry from state', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const { result } = renderHook(() => useInquiryStore())

      act(() => {
        useInquiryStore.setState({
          inquiries: [
            { id: 'INQ-2025-001', title: 'Inquiry 1' } as any,
            { id: 'INQ-2025-002', title: 'Inquiry 2' } as any,
          ],
        })
      })

      await act(async () => {
        await result.current.deleteInquiry('INQ-2025-001')
      })

      expect(result.current.inquiries).toHaveLength(1)
      expect(result.current.inquiries[0].id).toBe('INQ-2025-002')
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/inquiries/INQ-2025-001'),
        expect.objectContaining({ method: 'DELETE' })
      )
    })

    it('should clear currentInquiry if deleted', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const { result } = renderHook(() => useInquiryStore())

      const inquiry = { id: 'INQ-2025-001', title: 'Inquiry 1' } as any

      act(() => {
        useInquiryStore.setState({
          inquiries: [inquiry],
          currentInquiry: inquiry,
        })
      })

      await act(async () => {
        await result.current.deleteInquiry('INQ-2025-001')
      })

      expect(result.current.currentInquiry).toBeNull()
    })

    it('should handle delete error', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Delete failed'))

      const { result } = renderHook(() => useInquiryStore())

      act(() => {
        useInquiryStore.setState({
          inquiries: [{ id: 'INQ-2025-001', title: 'Inquiry 1' } as any],
        })
      })

      await act(async () => {
        try {
          await result.current.deleteInquiry('INQ-2025-001')
        } catch (error) {
          // Expected error
        }
      })

      // Inquiry should not be deleted on error
      expect(result.current.inquiries).toHaveLength(1)
      expect(result.current.error).toBeTruthy()
    })
  })

  describe('setCurrentInquiry', () => {
    it('should set current inquiry', () => {
      const { result } = renderHook(() => useInquiryStore())

      const inquiry = {
        id: 'INQ-2025-001',
        title: 'Test Inquiry',
      } as any

      act(() => {
        result.current.setCurrentInquiry(inquiry)
      })

      expect(result.current.currentInquiry).toEqual(inquiry)
    })

    it('should clear current inquiry when null', () => {
      const { result } = renderHook(() => useInquiryStore())

      act(() => {
        useInquiryStore.setState({
          currentInquiry: { id: 'INQ-2025-001' } as any,
        })
      })

      act(() => {
        result.current.setCurrentInquiry(null)
      })

      expect(result.current.currentInquiry).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('should clear error on successful operation', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          inquiries: [],
          pagination: { page: 1, limit: 10, total: 0, total_pages: 0 },
        }),
      })

      const { result } = renderHook(() => useInquiryStore())

      // Set initial error
      act(() => {
        useInquiryStore.setState({
          error: new Error('Previous error'),
        })
      })

      await act(async () => {
        await result.current.fetchInquiries()
      })

      expect(result.current.error).toBeNull()
    })

    it('should preserve error message details', async () => {
      const errorMessage = 'Detailed error: Invalid authentication token'
      ;(global.fetch as any).mockRejectedValueOnce(new Error(errorMessage))

      const { result } = renderHook(() => useInquiryStore())

      await act(async () => {
        try {
          await result.current.fetchInquiries()
        } catch (error) {
          // Expected error
        }
      })

      expect(result.current.error?.message).toBe(errorMessage)
    })
  })
})
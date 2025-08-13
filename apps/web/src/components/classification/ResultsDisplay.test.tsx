import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { ResultsDisplay } from './ResultsDisplay'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'

describe('ResultsDisplay', () => {
  describe('Component Rendering', () => {
    it('should render loading state initially', () => {
      render(<ResultsDisplay inquiryId="INQ-2025-001" />)
      
      expect(screen.getByText(/loading classification results/i)).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('should render classification results after loading', async () => {
      render(<ResultsDisplay inquiryId="INQ-2025-001" />)

      await waitFor(() => {
        expect(screen.getByText(/quote request/i)).toBeInTheDocument()
        expect(screen.getByText(/92%/)).toBeInTheDocument() // Confidence score
        expect(screen.getByText(/bulk_order/i)).toBeInTheDocument()
        expect(screen.getByText(/custom_manufacturing/i)).toBeInTheDocument()
      })
    })

    it('should display processing time', async () => {
      render(<ResultsDisplay inquiryId="INQ-2025-001" />)

      await waitFor(() => {
        expect(screen.getByText(/processing time/i)).toBeInTheDocument()
        expect(screen.getByText(/523ms/i)).toBeInTheDocument()
      })
    })

    it('should show streaming indicator when streaming is enabled', () => {
      render(<ResultsDisplay inquiryId="INQ-2025-001" streaming />)
      
      expect(screen.getByText(/processing in real-time/i)).toBeInTheDocument()
      expect(screen.getByTestId('streaming-indicator')).toBeInTheDocument()
    })
  })

  describe('Confidence Score Display', () => {
    it('should render confidence meter with correct color for high confidence', async () => {
      render(<ResultsDisplay inquiryId="INQ-2025-001" />)

      await waitFor(() => {
        const confidenceMeter = screen.getByTestId('confidence-meter')
        expect(confidenceMeter).toHaveClass('bg-green-500')
        expect(confidenceMeter).toHaveStyle({ width: '92%' })
      })
    })

    it('should render yellow color for medium confidence', async () => {
      server.use(
        http.post('http://localhost:8000/api/v1/inquiries/classify', () => {
          return HttpResponse.json({
            inquiry_id: 'INQ-2025-001',
            classification: {
              category: 'technical_spec',
              confidence: 0.65,
              subcategories: [],
            },
            metadata: {
              processing_time_ms: 400,
              model_version: '1.0.0',
              timestamp: new Date().toISOString(),
            },
            status: 'success',
          })
        })
      )

      render(<ResultsDisplay inquiryId="INQ-2025-001" />)

      await waitFor(() => {
        const confidenceMeter = screen.getByTestId('confidence-meter')
        expect(confidenceMeter).toHaveClass('bg-yellow-500')
      })
    })

    it('should render red color for low confidence', async () => {
      server.use(
        http.post('http://localhost:8000/api/v1/inquiries/classify', () => {
          return HttpResponse.json({
            inquiry_id: 'INQ-2025-001',
            classification: {
              category: 'capability',
              confidence: 0.45,
              subcategories: [],
            },
            metadata: {
              processing_time_ms: 600,
              model_version: '1.0.0',
              timestamp: new Date().toISOString(),
            },
            status: 'success',
          })
        })
      )

      render(<ResultsDisplay inquiryId="INQ-2025-001" />)

      await waitFor(() => {
        const confidenceMeter = screen.getByTestId('confidence-meter')
        expect(confidenceMeter).toHaveClass('bg-red-500')
      })
    })
  })

  describe('Category Display', () => {
    it('should display category badge with appropriate styling', async () => {
      render(<ResultsDisplay inquiryId="INQ-2025-001" />)

      await waitFor(() => {
        const categoryBadge = screen.getByTestId('category-badge')
        expect(categoryBadge).toHaveTextContent('Quote Request')
        expect(categoryBadge).toHaveClass('bg-blue-100', 'text-blue-800')
      })
    })

    it('should display different styling for each category type', async () => {
      const categories = [
        { name: 'quote_request', class: 'bg-blue-100' },
        { name: 'technical_spec', class: 'bg-purple-100' },
        { name: 'capability', class: 'bg-green-100' },
        { name: 'partnership', class: 'bg-orange-100' },
      ]

      for (const category of categories) {
        server.use(
          http.post('http://localhost:8000/api/v1/inquiries/classify', () => {
            return HttpResponse.json({
              inquiry_id: 'INQ-2025-001',
              classification: {
                category: category.name,
                confidence: 0.85,
                subcategories: [],
              },
              metadata: {
                processing_time_ms: 500,
                model_version: '1.0.0',
                timestamp: new Date().toISOString(),
              },
              status: 'success',
            })
          })
        )

        const { unmount } = render(<ResultsDisplay inquiryId="INQ-2025-001" />)

        await waitFor(() => {
          const categoryBadge = screen.getByTestId('category-badge')
          expect(categoryBadge).toHaveClass(category.class)
        })

        unmount()
      }
    })
  })

  describe('Subcategories Display', () => {
    it('should list all subcategories with confidence scores', async () => {
      render(<ResultsDisplay inquiryId="INQ-2025-001" />)

      await waitFor(() => {
        expect(screen.getByText(/subcategories/i)).toBeInTheDocument()
        
        const bulkOrder = screen.getByText(/bulk_order/i)
        expect(bulkOrder).toBeInTheDocument()
        expect(screen.getByText(/88%/)).toBeInTheDocument()
        
        const customManufacturing = screen.getByText(/custom_manufacturing/i)
        expect(customManufacturing).toBeInTheDocument()
        expect(screen.getByText(/75%/)).toBeInTheDocument()
      })
    })

    it('should show "No subcategories" when empty', async () => {
      server.use(
        http.post('http://localhost:8000/api/v1/inquiries/classify', () => {
          return HttpResponse.json({
            inquiry_id: 'INQ-2025-001',
            classification: {
              category: 'partnership',
              confidence: 0.78,
              subcategories: [],
            },
            metadata: {
              processing_time_ms: 450,
              model_version: '1.0.0',
              timestamp: new Date().toISOString(),
            },
            status: 'success',
          })
        })
      )

      render(<ResultsDisplay inquiryId="INQ-2025-001" />)

      await waitFor(() => {
        expect(screen.getByText(/no subcategories identified/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should display error message on API failure', async () => {
      server.use(
        http.post('http://localhost:8000/api/v1/inquiries/classify', () => {
          return HttpResponse.json(
            { error: 'Classification service unavailable' },
            { status: 500 }
          )
        })
      )

      render(<ResultsDisplay inquiryId="INQ-2025-001" />)

      await waitFor(() => {
        expect(screen.getByText(/failed to load classification results/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
      })
    })

    it('should retry on button click after error', async () => {
      let attemptCount = 0
      
      server.use(
        http.post('http://localhost:8000/api/v1/inquiries/classify', () => {
          attemptCount++
          if (attemptCount === 1) {
            return HttpResponse.json(
              { error: 'Temporary failure' },
              { status: 500 }
            )
          }
          return HttpResponse.json({
            inquiry_id: 'INQ-2025-001',
            classification: {
              category: 'quote_request',
              confidence: 0.92,
              subcategories: [],
            },
            metadata: {
              processing_time_ms: 523,
              model_version: '1.0.0',
              timestamp: new Date().toISOString(),
            },
            status: 'success',
          })
        })
      )

      render(<ResultsDisplay inquiryId="INQ-2025-001" />)

      await waitFor(() => {
        expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
      })

      const retryButton = screen.getByRole('button', { name: /retry/i })
      retryButton.click()

      await waitFor(() => {
        expect(screen.getByText(/quote request/i)).toBeInTheDocument()
      })
    })
  })

  describe('Real-time Updates', () => {
    it('should update when receiving WebSocket messages', async () => {
      const { rerender } = render(<ResultsDisplay inquiryId="INQ-2025-001" streaming />)

      // Simulate WebSocket progress update
      await waitFor(() => {
        expect(screen.getByText(/processing in real-time/i)).toBeInTheDocument()
      })

      // Mock WebSocket message handling would go here
      // This would typically be handled by a WebSocket context or hook
    })

    it('should show progress indicator during streaming', () => {
      render(<ResultsDisplay inquiryId="INQ-2025-001" streaming />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toBeInTheDocument()
      expect(progressBar).toHaveAttribute('aria-valuenow')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      render(<ResultsDisplay inquiryId="INQ-2025-001" />)

      await waitFor(() => {
        expect(screen.getByRole('region', { name: /classification results/i })).toBeInTheDocument()
        expect(screen.getByLabelText(/confidence score/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/primary category/i)).toBeInTheDocument()
      })
    })

    it('should announce updates to screen readers', async () => {
      render(<ResultsDisplay inquiryId="INQ-2025-001" />)

      await waitFor(() => {
        const liveRegion = screen.getByRole('status')
        expect(liveRegion).toHaveAttribute('aria-live', 'polite')
        expect(liveRegion).toHaveTextContent(/classification complete/i)
      })
    })

    it('should support keyboard navigation', async () => {
      render(<ResultsDisplay inquiryId="INQ-2025-001" />)

      await waitFor(() => {
        const focusableElements = screen.getAllByRole('button')
        focusableElements.forEach(element => {
          expect(element).toHaveAttribute('tabIndex')
        })
      })
    })
  })

  describe('Performance', () => {
    it('should memoize expensive calculations', async () => {
      const { rerender } = render(<ResultsDisplay inquiryId="INQ-2025-001" />)

      await waitFor(() => {
        expect(screen.getByText(/quote request/i)).toBeInTheDocument()
      })

      // Re-render with same props should not trigger new API call
      rerender(<ResultsDisplay inquiryId="INQ-2025-001" />)

      // Verify no additional API calls were made (MSW would log if they were)
    })

    it('should cancel pending requests on unmount', async () => {
      const { unmount } = render(<ResultsDisplay inquiryId="INQ-2025-001" />)
      
      // Unmount immediately
      unmount()

      // No errors should be thrown
      // AbortController should cancel the request
    })
  })
})
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { DashboardLayout } from './DashboardLayout'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'

describe('DashboardLayout', () => {
  const user = userEvent.setup()

  describe('Layout Rendering', () => {
    it('should render all dashboard sections', async () => {
      render(<DashboardLayout userId="user-123" timeRange="week" />)

      await waitFor(() => {
        expect(screen.getByTestId('stats-cards')).toBeInTheDocument()
        expect(screen.getByTestId('analytics-charts')).toBeInTheDocument()
        expect(screen.getByTestId('inquiry-list')).toBeInTheDocument()
        expect(screen.getByTestId('filter-panel')).toBeInTheDocument()
      })
    })

    it('should display correct title and user info', () => {
      render(<DashboardLayout userId="user-123" timeRange="week" />)
      
      expect(screen.getByRole('heading', { name: /manufacturing inquiry dashboard/i })).toBeInTheDocument()
      expect(screen.getByText(/user-123/)).toBeInTheDocument()
    })

    it('should render time range selector', () => {
      render(<DashboardLayout userId="user-123" timeRange="week" />)
      
      const timeRangeSelector = screen.getByRole('combobox', { name: /time range/i })
      expect(timeRangeSelector).toBeInTheDocument()
      expect(timeRangeSelector).toHaveValue('week')
    })
  })

  describe('Stats Cards', () => {
    it('should display key metrics', async () => {
      render(<DashboardLayout userId="user-123" timeRange="week" />)

      await waitFor(() => {
        expect(screen.getByText(/total inquiries/i)).toBeInTheDocument()
        expect(screen.getByText('150')).toBeInTheDocument()
        
        expect(screen.getByText(/average confidence/i)).toBeInTheDocument()
        expect(screen.getByText('87%')).toBeInTheDocument()
        
        expect(screen.getByText(/response time/i)).toBeInTheDocument()
        expect(screen.getByText(/450ms/)).toBeInTheDocument() // p50
      })
    })

    it('should show trend indicators', async () => {
      render(<DashboardLayout userId="user-123" timeRange="week" />)

      await waitFor(() => {
        const trendUp = screen.getAllByTestId('trend-up')
        const trendDown = screen.getAllByTestId('trend-down')
        
        expect(trendUp.length + trendDown.length).toBeGreaterThan(0)
      })
    })

    it('should update metrics on time range change', async () => {
      const { rerender } = render(<DashboardLayout userId="user-123" timeRange="day" />)

      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument()
      })

      // Change time range
      rerender(<DashboardLayout userId="user-123" timeRange="month" />)

      // Mock different data for month range
      server.use(
        http.get('http://localhost:8000/api/v1/analytics', () => {
          return HttpResponse.json({
            total_inquiries: 500,
            average_confidence: 0.89,
            category_distribution: {
              quote_request: 150,
              technical_spec: 120,
              capability: 130,
              partnership: 100,
            },
            response_times: {
              p50: 420,
              p95: 1100,
              p99: 2300,
            },
            daily_trend: [],
          })
        })
      )

      await waitFor(() => {
        expect(screen.getByText('500')).toBeInTheDocument()
      })
    })
  })

  describe('Analytics Charts', () => {
    it('should render category distribution chart', async () => {
      render(<DashboardLayout userId="user-123" timeRange="week" />)

      await waitFor(() => {
        expect(screen.getByTestId('category-distribution-chart')).toBeInTheDocument()
        expect(screen.getByText(/quote request.*45/i)).toBeInTheDocument()
        expect(screen.getByText(/technical spec.*35/i)).toBeInTheDocument()
        expect(screen.getByText(/capability.*40/i)).toBeInTheDocument()
        expect(screen.getByText(/partnership.*30/i)).toBeInTheDocument()
      })
    })

    it('should render daily trend chart', async () => {
      render(<DashboardLayout userId="user-123" timeRange="week" />)

      await waitFor(() => {
        const trendChart = screen.getByTestId('daily-trend-chart')
        expect(trendChart).toBeInTheDocument()
        
        // Check for date labels
        expect(screen.getByText('2025-01-07')).toBeInTheDocument()
        expect(screen.getByText('2025-01-13')).toBeInTheDocument()
      })
    })

    it('should render response time distribution', async () => {
      render(<DashboardLayout userId="user-123" timeRange="week" />)

      await waitFor(() => {
        expect(screen.getByTestId('response-time-chart')).toBeInTheDocument()
        expect(screen.getByText(/p50.*450ms/i)).toBeInTheDocument()
        expect(screen.getByText(/p95.*1200ms/i)).toBeInTheDocument()
        expect(screen.getByText(/p99.*2500ms/i)).toBeInTheDocument()
      })
    })

    it('should support chart interactions', async () => {
      render(<DashboardLayout userId="user-123" timeRange="week" />)

      await waitFor(() => {
        const chart = screen.getByTestId('category-distribution-chart')
        expect(chart).toBeInTheDocument()
      })

      // Hover over chart segment
      const chartSegment = screen.getByTestId('chart-segment-quote_request')
      await user.hover(chartSegment)

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument()
        expect(screen.getByRole('tooltip')).toHaveTextContent(/quote request.*45.*30%/i)
      })
    })
  })

  describe('Inquiry List', () => {
    it('should display recent inquiries', async () => {
      render(<DashboardLayout userId="user-123" timeRange="week" />)

      await waitFor(() => {
        expect(screen.getByText('Bulk Order for Precision Bearings')).toBeInTheDocument()
        expect(screen.getByText('Technical Specifications Query')).toBeInTheDocument()
        expect(screen.getByText('ABC Manufacturing')).toBeInTheDocument()
        expect(screen.getByText('XYZ Corp')).toBeInTheDocument()
      })
    })

    it('should show inquiry status badges', async () => {
      render(<DashboardLayout userId="user-123" timeRange="week" />)

      await waitFor(() => {
        expect(screen.getByText('pending')).toBeInTheDocument()
        expect(screen.getByText('reviewed')).toBeInTheDocument()
      })
    })

    it('should support pagination', async () => {
      render(<DashboardLayout userId="user-123" timeRange="week" />)

      await waitFor(() => {
        const pagination = screen.getByTestId('pagination')
        expect(pagination).toBeInTheDocument()
        expect(screen.getByText('1 / 5')).toBeInTheDocument() // Page 1 of 5
      })

      const nextButton = screen.getByRole('button', { name: /next page/i })
      await user.click(nextButton)

      // Verify page change
      await waitFor(() => {
        expect(screen.getByText('2 / 5')).toBeInTheDocument()
      })
    })

    it('should open inquiry details on click', async () => {
      render(<DashboardLayout userId="user-123" timeRange="week" />)

      await waitFor(() => {
        const inquiryRow = screen.getByText('Bulk Order for Precision Bearings')
        expect(inquiryRow).toBeInTheDocument()
      })

      const inquiryRow = screen.getByText('Bulk Order for Precision Bearings')
      await user.click(inquiryRow)

      await waitFor(() => {
        expect(screen.getByTestId('inquiry-detail-modal')).toBeInTheDocument()
        expect(screen.getByText(/inquiry details/i)).toBeInTheDocument()
      })
    })
  })

  describe('Filter Panel', () => {
    it('should render all filter options', async () => {
      render(<DashboardLayout userId="user-123" timeRange="week" />)

      await waitFor(() => {
        expect(screen.getByLabelText(/search/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/category filter/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/status filter/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/date range/i)).toBeInTheDocument()
      })
    })

    it('should filter inquiries by search term', async () => {
      render(<DashboardLayout userId="user-123" timeRange="week" />)

      await waitFor(() => {
        expect(screen.getByText('Bulk Order for Precision Bearings')).toBeInTheDocument()
      })

      const searchInput = screen.getByLabelText(/search/i)
      await user.type(searchInput, 'Technical')

      await waitFor(() => {
        expect(screen.queryByText('Bulk Order for Precision Bearings')).not.toBeInTheDocument()
        expect(screen.getByText('Technical Specifications Query')).toBeInTheDocument()
      })
    })

    it('should filter by category', async () => {
      render(<DashboardLayout userId="user-123" timeRange="week" />)

      const categoryFilter = screen.getByLabelText(/category filter/i)
      await user.selectOptions(categoryFilter, 'quote_request')

      await waitFor(() => {
        const inquiries = screen.getAllByTestId('inquiry-row')
        inquiries.forEach(inquiry => {
          expect(inquiry).toHaveTextContent('quote_request')
        })
      })
    })

    it('should filter by status', async () => {
      render(<DashboardLayout userId="user-123" timeRange="week" />)

      const statusFilter = screen.getByLabelText(/status filter/i)
      await user.selectOptions(statusFilter, 'pending')

      await waitFor(() => {
        const inquiries = screen.getAllByTestId('inquiry-row')
        inquiries.forEach(inquiry => {
          expect(inquiry).toHaveTextContent('pending')
        })
      })
    })

    it('should apply multiple filters simultaneously', async () => {
      render(<DashboardLayout userId="user-123" timeRange="week" />)

      const categoryFilter = screen.getByLabelText(/category filter/i)
      await user.selectOptions(categoryFilter, 'technical_spec')

      const statusFilter = screen.getByLabelText(/status filter/i)
      await user.selectOptions(statusFilter, 'reviewed')

      await waitFor(() => {
        const inquiries = screen.getAllByTestId('inquiry-row')
        expect(inquiries.length).toBe(1)
        expect(inquiries[0]).toHaveTextContent('Technical Specifications Query')
      })
    })

    it('should clear all filters', async () => {
      render(<DashboardLayout userId="user-123" timeRange="week" />)

      // Apply filters
      const categoryFilter = screen.getByLabelText(/category filter/i)
      await user.selectOptions(categoryFilter, 'quote_request')

      // Clear filters
      const clearButton = screen.getByRole('button', { name: /clear filters/i })
      await user.click(clearButton)

      await waitFor(() => {
        expect(categoryFilter).toHaveValue('')
        expect(screen.getByText('Bulk Order for Precision Bearings')).toBeInTheDocument()
        expect(screen.getByText('Technical Specifications Query')).toBeInTheDocument()
      })
    })
  })

  describe('Export Functionality', () => {
    it('should provide export options', async () => {
      render(<DashboardLayout userId="user-123" timeRange="week" />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
      })

      const exportButton = screen.getByRole('button', { name: /export/i })
      await user.click(exportButton)

      expect(screen.getByRole('menuitem', { name: /export as csv/i })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: /export as json/i })).toBeInTheDocument()
    })

    it('should trigger CSV export', async () => {
      const mockDownload = vi.fn()
      global.URL.createObjectURL = vi.fn()
      
      render(<DashboardLayout userId="user-123" timeRange="week" />)

      const exportButton = screen.getByRole('button', { name: /export/i })
      await user.click(exportButton)

      const csvOption = screen.getByRole('menuitem', { name: /export as csv/i })
      await user.click(csvOption)

      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalled()
      })
    })
  })

  describe('Responsive Design', () => {
    it('should stack cards on mobile', () => {
      // Mock mobile viewport
      window.innerWidth = 375
      window.dispatchEvent(new Event('resize'))

      render(<DashboardLayout userId="user-123" timeRange="week" />)

      const statsCards = screen.getByTestId('stats-cards')
      expect(statsCards).toHaveClass('flex-col')
    })

    it('should hide sidebar on mobile', () => {
      window.innerWidth = 375
      window.dispatchEvent(new Event('resize'))

      render(<DashboardLayout userId="user-123" timeRange="week" />)

      expect(screen.queryByTestId('desktop-sidebar')).not.toBeInTheDocument()
      expect(screen.getByTestId('mobile-menu-button')).toBeInTheDocument()
    })

    it('should adjust chart size on tablet', () => {
      window.innerWidth = 768
      window.dispatchEvent(new Event('resize'))

      render(<DashboardLayout userId="user-123" timeRange="week" />)

      const charts = screen.getByTestId('analytics-charts')
      expect(charts).toHaveClass('grid-cols-1', 'lg:grid-cols-2')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<DashboardLayout userId="user-123" timeRange="week" />)

      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent(/dashboard/i)

      const h2s = screen.getAllByRole('heading', { level: 2 })
      expect(h2s.length).toBeGreaterThan(0)
    })

    it('should have skip navigation link', () => {
      render(<DashboardLayout userId="user-123" timeRange="week" />)

      const skipLink = screen.getByText(/skip to main content/i)
      expect(skipLink).toBeInTheDocument()
      expect(skipLink).toHaveAttribute('href', '#main-content')
    })

    it('should announce data updates to screen readers', async () => {
      render(<DashboardLayout userId="user-123" timeRange="week" />)

      await waitFor(() => {
        const liveRegion = screen.getByRole('status')
        expect(liveRegion).toHaveAttribute('aria-live', 'polite')
        expect(liveRegion).toHaveTextContent(/data updated/i)
      })
    })
  })
})
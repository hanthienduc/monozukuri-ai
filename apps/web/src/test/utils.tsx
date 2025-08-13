import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

// Create a custom render function that includes providers
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

interface AllTheProvidersProps {
  children: React.ReactNode
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </HelmetProvider>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Test data factories
export const createMockInquiry = (overrides = {}) => ({
  id: 'INQ-2025-001',
  title: 'Test Inquiry',
  description: 'This is a test inquiry description',
  category: 'quote_request',
  urgency: 'medium',
  attachments: [],
  contactEmail: 'test@example.com',
  companyName: 'Test Company',
  language: 'en',
  ...overrides,
})

export const createMockClassification = (overrides = {}) => ({
  inquiry_id: 'INQ-2025-001',
  classification: {
    category: 'quote_request',
    confidence: 0.92,
    subcategories: [
      { name: 'bulk_order', confidence: 0.88 },
      { name: 'custom_manufacturing', confidence: 0.75 },
    ],
  },
  metadata: {
    processing_time_ms: 523,
    model_version: '1.0.0',
    timestamp: new Date().toISOString(),
  },
  status: 'success',
  ...overrides,
})
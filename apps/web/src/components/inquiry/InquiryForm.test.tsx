import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { InquiryForm } from './InquiryForm'
import { InquiryFormData } from '@/types/inquiry'

describe('InquiryForm', () => {
  const mockOnSubmit = vi.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      render(<InquiryForm onSubmit={mockOnSubmit} language="en" />)
      
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/urgency/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
    })

    it('should render Japanese labels when language is jp', () => {
      render(<InquiryForm onSubmit={mockOnSubmit} language="jp" />)
      
      expect(screen.getByLabelText(/タイトル/)).toBeInTheDocument()
      expect(screen.getByLabelText(/説明/)).toBeInTheDocument()
      expect(screen.getByLabelText(/カテゴリ/)).toBeInTheDocument()
      expect(screen.getByLabelText(/緊急度/)).toBeInTheDocument()
      expect(screen.getByLabelText(/メール/)).toBeInTheDocument()
      expect(screen.getByLabelText(/会社名/)).toBeInTheDocument()
    })

    it('should populate form with initial data', () => {
      const initialData: Partial<InquiryFormData> = {
        title: 'Test Title',
        description: 'Test Description',
        category: 'quote_request',
        urgency: 'high',
        contactEmail: 'test@example.com',
        companyName: 'Test Company',
      }

      render(
        <InquiryForm 
          onSubmit={mockOnSubmit} 
          initialData={initialData} 
          language="en" 
        />
      )

      expect(screen.getByDisplayValue('Test Title')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show validation errors for required fields', async () => {
      render(<InquiryForm onSubmit={mockOnSubmit} language="en" />)
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument()
        expect(screen.getByText(/description is required/i)).toBeInTheDocument()
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/company name is required/i)).toBeInTheDocument()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should validate email format', async () => {
      render(<InquiryForm onSubmit={mockOnSubmit} language="en" />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
      })
    })

    it('should validate minimum description length', async () => {
      render(<InquiryForm onSubmit={mockOnSubmit} language="en" />)
      
      const descriptionInput = screen.getByLabelText(/description/i)
      await user.type(descriptionInput, 'Short')
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/description must be at least 20 characters/i)).toBeInTheDocument()
      })
    })

    it('should validate maximum title length', async () => {
      render(<InquiryForm onSubmit={mockOnSubmit} language="en" />)
      
      const titleInput = screen.getByLabelText(/title/i)
      const longTitle = 'a'.repeat(201)
      await user.type(titleInput, longTitle)
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/title must be less than 200 characters/i)).toBeInTheDocument()
      })
    })
  })

  describe('File Upload', () => {
    it('should handle file selection', async () => {
      render(<InquiryForm onSubmit={mockOnSubmit} language="en" />)
      
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      const fileInput = screen.getByLabelText(/attachment/i)
      
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument()
      })
    })

    it('should validate file size', async () => {
      render(<InquiryForm onSubmit={mockOnSubmit} language="en" />)
      
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { 
        type: 'application/pdf' 
      })
      const fileInput = screen.getByLabelText(/attachment/i)
      
      await user.upload(fileInput, largeFile)

      await waitFor(() => {
        expect(screen.getByText(/file size exceeds 10MB limit/i)).toBeInTheDocument()
      })
    })

    it('should validate file type', async () => {
      render(<InquiryForm onSubmit={mockOnSubmit} language="en" />)
      
      const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-msdownload' })
      const fileInput = screen.getByLabelText(/attachment/i)
      
      await user.upload(fileInput, invalidFile)

      await waitFor(() => {
        expect(screen.getByText(/invalid file type/i)).toBeInTheDocument()
      })
    })

    it('should handle multiple file uploads', async () => {
      render(<InquiryForm onSubmit={mockOnSubmit} language="en" />)
      
      const file1 = new File(['content1'], 'file1.pdf', { type: 'application/pdf' })
      const file2 = new File(['content2'], 'file2.jpg', { type: 'image/jpeg' })
      const fileInput = screen.getByLabelText(/attachment/i)
      
      await user.upload(fileInput, [file1, file2])

      await waitFor(() => {
        expect(screen.getByText('file1.pdf')).toBeInTheDocument()
        expect(screen.getByText('file2.jpg')).toBeInTheDocument()
      })
    })

    it('should allow file removal', async () => {
      render(<InquiryForm onSubmit={mockOnSubmit} language="en" />)
      
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const fileInput = screen.getByLabelText(/attachment/i)
      
      await user.upload(fileInput, file)
      
      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument()
      })

      const removeButton = screen.getByRole('button', { name: /remove/i })
      await user.click(removeButton)

      await waitFor(() => {
        expect(screen.queryByText('test.pdf')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should submit valid form data', async () => {
      render(<InquiryForm onSubmit={mockOnSubmit} language="en" />)
      
      await user.type(screen.getByLabelText(/title/i), 'Test Inquiry Title')
      await user.type(screen.getByLabelText(/description/i), 'This is a detailed description of the inquiry')
      await user.selectOptions(screen.getByLabelText(/category/i), 'quote_request')
      await user.selectOptions(screen.getByLabelText(/urgency/i), 'high')
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/company name/i), 'Test Company')

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'Test Inquiry Title',
          description: 'This is a detailed description of the inquiry',
          category: 'quote_request',
          urgency: 'high',
          contactEmail: 'test@example.com',
          companyName: 'Test Company',
          language: 'en',
          attachments: [],
        })
      })
    })

    it('should disable submit button while submitting', async () => {
      const slowSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)))
      render(<InquiryForm onSubmit={slowSubmit} language="en" />)
      
      // Fill required fields
      await user.type(screen.getByLabelText(/title/i), 'Test Title')
      await user.type(screen.getByLabelText(/description/i), 'This is a detailed description')
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/company name/i), 'Test Company')

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      expect(submitButton).toBeDisabled()
      expect(screen.getByText(/submitting/i)).toBeInTheDocument()
    })

    it('should reset form after successful submission', async () => {
      render(<InquiryForm onSubmit={mockOnSubmit} language="en" />)
      
      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Test Title')
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      
      // Fill all required fields
      await user.type(screen.getByLabelText(/description/i), 'This is a detailed description')
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/company name/i), 'Test Company')
      
      await user.click(submitButton)

      await waitFor(() => {
        expect(titleInput).toHaveValue('')
      })
    })
  })

  describe('Input Sanitization', () => {
    it('should sanitize XSS attempts in text inputs', async () => {
      render(<InquiryForm onSubmit={mockOnSubmit} language="en" />)
      
      const titleInput = screen.getByLabelText(/title/i)
      const xssAttempt = '<script>alert("XSS")</script>Legitimate Title'
      
      await user.type(titleInput, xssAttempt)
      await user.type(screen.getByLabelText(/description/i), 'Valid description that is long enough')
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/company name/i), 'Test Company')
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Legitimate Title', // Script tags removed
          })
        )
      })
    })

    it('should sanitize SQL injection attempts', async () => {
      render(<InquiryForm onSubmit={mockOnSubmit} language="en" />)
      
      const descriptionInput = screen.getByLabelText(/description/i)
      const sqlInjection = "'; DROP TABLE inquiries; --"
      
      await user.type(screen.getByLabelText(/title/i), 'Test Title')
      await user.type(descriptionInput, sqlInjection)
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/company name/i), 'Test Company')
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            description: expect.not.stringContaining('DROP TABLE'),
          })
        )
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<InquiryForm onSubmit={mockOnSubmit} language="en" />)
      
      expect(screen.getByRole('form')).toHaveAttribute('aria-label', 'Inquiry submission form')
      expect(screen.getByLabelText(/title/i)).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText(/description/i)).toHaveAttribute('aria-required', 'true')
    })

    it('should support keyboard navigation', async () => {
      render(<InquiryForm onSubmit={mockOnSubmit} language="en" />)
      
      const titleInput = screen.getByLabelText(/title/i)
      titleInput.focus()
      
      expect(document.activeElement).toBe(titleInput)
      
      // Tab to next field
      await user.tab()
      expect(document.activeElement).toBe(screen.getByLabelText(/description/i))
    })

    it('should announce validation errors to screen readers', async () => {
      render(<InquiryForm onSubmit={mockOnSubmit} language="en" />)
      
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert')
        expect(errorMessages.length).toBeGreaterThan(0)
        errorMessages.forEach(error => {
          expect(error).toHaveAttribute('aria-live', 'polite')
        })
      })
    })
  })
})
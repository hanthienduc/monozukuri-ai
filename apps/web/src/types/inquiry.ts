export type InquiryCategory = 'quote_request' | 'technical_spec' | 'capability' | 'partnership'
export type InquiryUrgency = 'low' | 'medium' | 'high'
export type InquiryStatus = 'pending' | 'reviewed' | 'processed' | 'archived'
export type Language = 'en' | 'jp'

export interface InquiryFormData {
  title: string
  description: string
  category?: string
  urgency: InquiryUrgency
  attachments?: File[]
  contactEmail: string
  companyName: string
  language: Language
}

export interface Inquiry extends InquiryFormData {
  id: string
  status: InquiryStatus
  createdAt: Date
  updatedAt: Date
  classification?: Classification
}

export interface Classification {
  category: InquiryCategory
  confidence: number
  subcategories: Subcategory[]
}

export interface Subcategory {
  name: string
  confidence: number
}

export interface ClassificationResult {
  inquiry_id: string
  classification: Classification
  metadata: ClassificationMetadata
  status: 'success' | 'error'
}

export interface ClassificationMetadata {
  processing_time_ms: number
  model_version: string
  timestamp: string
}

export interface InquiryListResponse {
  inquiries: Inquiry[]
  pagination: Pagination
}

export interface Pagination {
  page: number
  limit: number
  total: number
  total_pages: number
}
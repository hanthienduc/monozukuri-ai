import axios from 'axios'
import type { 
  InquiryFormData, 
  ClassificationResult, 
  InquiryListResponse,
  CSRFTokenResponse,
  AuthTokenResponse
} from '@/types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor for CSRF token and auth
apiClient.interceptors.request.use(async (config) => {
  // Get CSRF token if needed
  const csrfToken = localStorage.getItem('csrfToken')
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken
  }

  // Get auth token
  const authToken = localStorage.getItem('authToken')
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }

  return config
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh auth token
      try {
        const refreshResponse = await axios.post(`${API_BASE}/api/v1/auth/refresh`)
        const { authToken } = refreshResponse.data as AuthTokenResponse
        localStorage.setItem('authToken', authToken)
        
        // Retry original request
        error.config.headers.Authorization = `Bearer ${authToken}`
        return axios.request(error.config)
      } catch (refreshError) {
        // Clear auth and redirect to login
        localStorage.removeItem('authToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const apiService = {
  // Get CSRF token
  async getCSRFToken(): Promise<string> {
    const response = await apiClient.get<CSRFTokenResponse>('/csrf-token')
    const token = response.data.csrfToken
    localStorage.setItem('csrfToken', token)
    return token
  },

  // Submit inquiry for classification
  async classifyInquiry(data: InquiryFormData): Promise<ClassificationResult> {
    const response = await apiClient.post<ClassificationResult>('/inquiries/classify', data)
    return response.data
  },

  // Fetch inquiries list with optional filters
  async fetchInquiries(filters?: {
    category?: string
    status?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<InquiryListResponse> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    const response = await apiClient.get<InquiryListResponse>(
      `/inquiries?${params.toString()}`
    )
    return response.data
  },

  // Update inquiry
  async updateInquiry(id: string, updates: Partial<InquiryFormData>): Promise<void> {
    await apiClient.patch(`/inquiries/${id}`, updates)
  },

  // Delete inquiry
  async deleteInquiry(id: string): Promise<void> {
    await apiClient.delete(`/inquiries/${id}`)
  },

  // Get analytics data
  async getAnalytics(timeRange: string = 'week'): Promise<any> {
    const response = await apiClient.get(`/analytics?range=${timeRange}`)
    return response.data
  },

  // Export data
  async exportData(format: 'csv' | 'json', filters?: any): Promise<Blob> {
    const params = new URLSearchParams()
    params.append('format', format)
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    const response = await apiClient.get(`/export?${params.toString()}`, {
      responseType: 'blob',
    })
    return response.data
  }
}
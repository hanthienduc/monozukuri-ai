export interface ApiResponse<T> {
  data?: T
  error?: ApiError
  status: 'success' | 'error'
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface CSRFTokenResponse {
  csrfToken: string
}

export interface AuthTokenResponse {
  authToken: string
  expiresIn: number
}

export interface WebSocketMessage {
  event: WebSocketEvent
  data: {
    inquiryId?: string
    progress?: number
    result?: unknown
    error?: string
  }
  timestamp: Date
}

export enum WebSocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  CLASSIFICATION_START = 'classification_start',
  CLASSIFICATION_PROGRESS = 'classification_progress',
  CLASSIFICATION_COMPLETE = 'classification_complete',
  ERROR = 'error',
}
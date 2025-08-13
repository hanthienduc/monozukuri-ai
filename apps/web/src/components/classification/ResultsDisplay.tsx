import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
// import { apiService } from '@/services/api'
import type { ClassificationResult } from '@/types/inquiry'

interface ResultsDisplayProps {
  inquiryId: string
  streaming?: boolean
}

const CATEGORY_STYLES = {
  quote_request: 'bg-blue-100 text-blue-800',
  technical_spec: 'bg-purple-100 text-purple-800', 
  capability: 'bg-green-100 text-green-800',
  partnership: 'bg-orange-100 text-orange-800',
}

const CATEGORY_LABELS = {
  quote_request: 'Quote Request',
  technical_spec: 'Technical Specification',
  capability: 'Capability Inquiry',
  partnership: 'Partnership',
}

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return 'bg-green-500'
  if (confidence >= 0.6) return 'bg-yellow-500'
  return 'bg-red-500'
}

const formatConfidence = (confidence: number): string => {
  return `${Math.round(confidence * 100)}%`
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  inquiryId,
  streaming = false,
}) => {
  const [progress, setProgress] = useState(0)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['classification', inquiryId],
    queryFn: async (): Promise<ClassificationResult> => {
      // Mock the classification API call since we're using MSW
      const response = await fetch('http://localhost:8000/api/v1/inquiries/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inquiry_id: inquiryId }),
      })

      if (!response.ok) {
        throw new Error('Failed to load classification results')
      }

      return response.json()
    },
    retry: 1,
  })

  // Simulate streaming progress
  useEffect(() => {
    if (streaming && isLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      return () => clearInterval(interval)
    } else if (!isLoading) {
      setProgress(100)
    }
  }, [streaming, isLoading])

  if (isLoading) {
    return (
      <div
        className="bg-white p-6 rounded-lg shadow-sm"
        role="region"
        aria-label="Classification results"
      >
        <div className="animate-pulse">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Loading classification results...
          </h2>
          
          {streaming && (
            <div className="mb-4">
              <p className="text-sm text-blue-600 mb-2" data-testid="streaming-indicator">
                Processing in real-time...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </div>

        {!streaming && (
          <div
            className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"
            role="progressbar"
            aria-label="Loading"
          />
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="bg-white p-6 rounded-lg shadow-sm"
        role="region"
        aria-label="Classification results"
      >
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load classification results
          </h3>
          <p className="text-gray-600 mb-4">
            {error.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const { classification, metadata } = data
  const confidenceColor = getConfidenceColor(classification.confidence)

  return (
    <div
      className="bg-white p-6 rounded-lg shadow-sm space-y-6"
      role="region"
      aria-label="Classification results"
    >
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Classification Results
        </h2>
        {streaming && (
          <p className="text-sm text-green-600">Processing in real-time...</p>
        )}
      </div>

      {/* Primary Category */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2" aria-label="Primary category">
          Primary Category
        </h3>
        <div className="flex items-center space-x-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              CATEGORY_STYLES[classification.category as keyof typeof CATEGORY_STYLES]
            }`}
            data-testid="category-badge"
          >
            {CATEGORY_LABELS[classification.category as keyof typeof CATEGORY_LABELS]}
          </span>
        </div>
      </div>

      {/* Confidence Score */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700" aria-label="Confidence score">
            Confidence Score
          </h3>
          <span className="text-sm font-semibold text-gray-900">
            {formatConfidence(classification.confidence)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${confidenceColor}`}
            style={{ width: `${classification.confidence * 100}%` }}
            data-testid="confidence-meter"
            role="progressbar"
            aria-valuenow={classification.confidence * 100}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Subcategories */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Subcategories
        </h3>
        {classification.subcategories.length > 0 ? (
          <div className="space-y-3">
            {classification.subcategories.map((subcategory, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {subcategory.name.replace('_', ' ')}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {formatConfidence(subcategory.confidence)}
                  </span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getConfidenceColor(subcategory.confidence)}`}
                      style={{ width: `${subcategory.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600 italic">
            No subcategories identified
          </p>
        )}
      </div>

      {/* Metadata */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Processing Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Processing Time:</span>{' '}
            <span>{metadata.processing_time_ms}ms</span>
          </div>
          <div>
            <span className="font-medium">Model Version:</span>{' '}
            <span>{metadata.model_version}</span>
          </div>
          <div className="md:col-span-2">
            <span className="font-medium">Timestamp:</span>{' '}
            <span>{new Date(metadata.timestamp).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Status Announcement for Screen Readers */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        Classification complete. Primary category: {CATEGORY_LABELS[classification.category as keyof typeof CATEGORY_LABELS]}. 
        Confidence: {formatConfidence(classification.confidence)}.
      </div>
    </div>
  )
}
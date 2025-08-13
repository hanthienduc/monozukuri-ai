import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { apiService } from '@/services/api'
import type { Inquiry } from '@/types/inquiry'

interface DashboardLayoutProps {
  userId: string
  timeRange: string
}

interface AnalyticsData {
  total_inquiries: number
  average_confidence: number
  category_distribution: Record<string, number>
  response_times: {
    p50: number
    p95: number
    p99: number
  }
  daily_trend: Array<{ date: string; count: number }>
}

interface InquiryListData {
  inquiries: Inquiry[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

const CATEGORY_COLORS = {
  quote_request: '#3B82F6',
  technical_spec: '#8B5CF6',
  capability: '#10B981',
  partnership: '#F59E0B',
}

const formatTrend = (current: number, previous: number): { value: number; isUp: boolean } => {
  const diff = ((current - previous) / previous) * 100
  return {
    value: Math.abs(diff),
    isUp: diff > 0,
  }
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  userId,
  timeRange,
}) => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    dateRange: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Analytics data query
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: (): Promise<AnalyticsData> => apiService.getAnalytics(timeRange),
  })

  // Inquiries list query
  const { data: inquiriesData, isLoading: inquiriesLoading } = useQuery({
    queryKey: ['inquiries', filters, currentPage],
    queryFn: (): Promise<InquiryListData> =>
      apiService.fetchInquiries({
        ...filters,
        page: currentPage,
        limit: 10,
      }),
  })

  // Mock previous period data for trends
  const previousAnalytics = {
    total_inquiries: 120,
    average_confidence: 0.84,
    response_times: { p50: 480 },
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: '',
      dateRange: '',
    })
    setCurrentPage(1)
  }

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const blob = await apiService.exportData(format, filters)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inquiries.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  if (analyticsLoading || inquiriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const categoryData = analytics ? Object.entries(analytics.category_distribution).map(([name, value]) => ({
    name: name.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    value,
    color: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] || '#6B7280',
  })) : []

  const trends = analytics ? {
    inquiries: formatTrend(analytics.total_inquiries, previousAnalytics.total_inquiries),
    confidence: formatTrend(analytics.average_confidence * 100, previousAnalytics.average_confidence * 100),
    responseTime: formatTrend(previousAnalytics.response_times.p50, analytics.response_times.p50), // Inverted for better is lower
  } : { inquiries: { value: 0, isUp: true }, confidence: { value: 0, isUp: true }, responseTime: { value: 0, isUp: false } }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                data-testid="mobile-menu-button"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Manufacturing Inquiry Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">User: {userId}</span>
              <select
                value={timeRange}
                onChange={(e) => {
                  // In a real app, this would be handled by parent component
                  console.log('Time range changed:', e.target.value)
                }}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Time range"
              >
                <option value="day">Last 24 Hours</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-16 w-64 h-full bg-white border-r" data-testid="desktop-sidebar">
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Dashboard
              </a>
            </li>
            <li>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Inquiries
              </a>
            </li>
            <li>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Analytics
              </a>
            </li>
            <li>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Settings
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main id="main-content" className="md:ml-64 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-col lg:flex-row" data-testid="stats-cards">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Inquiries</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics?.total_inquiries}</p>
                </div>
                <div className={`flex items-center text-sm ${trends.inquiries.isUp ? 'text-green-600' : 'text-red-600'}`}>
                  <span data-testid={trends.inquiries.isUp ? 'trend-up' : 'trend-down'}>
                    {trends.inquiries.isUp ? '↗' : '↘'} {trends.inquiries.value.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Confidence</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analytics ? `${Math.round(analytics.average_confidence * 100)}%` : '-'}
                  </p>
                </div>
                <div className={`flex items-center text-sm ${trends.confidence.isUp ? 'text-green-600' : 'text-red-600'}`}>
                  <span data-testid={trends.confidence.isUp ? 'trend-up' : 'trend-down'}>
                    {trends.confidence.isUp ? '↗' : '↘'} {trends.confidence.value.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Time</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analytics ? `${analytics.response_times.p50}ms` : '-'}
                  </p>
                </div>
                <div className={`flex items-center text-sm ${!trends.responseTime.isUp ? 'text-green-600' : 'text-red-600'}`}>
                  <span data-testid={!trends.responseTime.isUp ? 'trend-up' : 'trend-down'}>
                    {!trends.responseTime.isUp ? '↗' : '↘'} {trends.responseTime.value.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="analytics-charts">
            {/* Category Distribution Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Category Distribution</h3>
              <div data-testid="category-distribution-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          data-testid={`chart-segment-${Object.keys(analytics?.category_distribution || {})[index]}`}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `${value} (${Math.round((value / (analytics?.total_inquiries || 1)) * 100)}%)`,
                        name
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {categoryData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span>{entry.name}</span>
                      </div>
                      <span className="font-medium">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Daily Trend Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Trend</h3>
              <div data-testid="daily-trend-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics?.daily_trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Response Time Distribution */}
            <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Response Time Distribution</h3>
              <div data-testid="response-time-chart" className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-900">
                    {analytics ? `${analytics.response_times.p50}ms` : '-'}
                  </p>
                  <p className="text-sm text-gray-600">P50 (Median)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-900">
                    {analytics ? `${analytics.response_times.p95}ms` : '-'}
                  </p>
                  <p className="text-sm text-gray-600">P95</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-900">
                    {analytics ? `${analytics.response_times.p99}ms` : '-'}
                  </p>
                  <p className="text-sm text-gray-600">P99</p>
                </div>
              </div>
            </div>
          </div>

          {/* Inquiry List Section */}
          <div className="bg-white rounded-lg shadow-sm">
            {/* Filter Panel */}
            <div className="p-6 border-b" data-testid="filter-panel">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Recent Inquiries</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Clear Filters
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => {
                        const menu = document.getElementById('export-menu')
                        menu?.classList.toggle('hidden')
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                      Export
                    </button>
                    <div id="export-menu" className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                      <div className="py-1">
                        <button
                          onClick={() => handleExport('csv')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          Export as CSV
                        </button>
                        <button
                          onClick={() => handleExport('json')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          Export as JSON
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      id="search"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Search inquiries..."
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    Category Filter
                  </label>
                  <select
                    id="category-filter"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    <option value="quote_request">Quote Request</option>
                    <option value="technical_spec">Technical Spec</option>
                    <option value="capability">Capability</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    Status Filter
                  </label>
                  <select
                    id="status-filter"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="processed">Processed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="date-range" className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <select
                    id="date-range"
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Inquiry List */}
            <div data-testid="inquiry-list">
              <div className="divide-y divide-gray-200">
                {inquiriesData?.inquiries?.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="p-6 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedInquiry(inquiry)}
                    data-testid="inquiry-row"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {inquiry.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {inquiry.companyName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(inquiry.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          inquiry.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                          inquiry.status === 'processed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {inquiry.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {inquiry.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {inquiriesData?.pagination && (
                <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between" data-testid="pagination">
                  <div className="text-sm text-gray-700">
                    Page {inquiriesData.pagination.page} of {inquiriesData.pagination.total_pages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">
                      {inquiriesData.pagination.page} / {inquiriesData.pagination.total_pages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(inquiriesData.pagination.total_pages, currentPage + 1))}
                      disabled={currentPage === inquiriesData.pagination.total_pages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                      aria-label="Next page"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4" data-testid="inquiry-detail-modal">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Inquiry Details</h3>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{selectedInquiry.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{selectedInquiry.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Company:</span> {selectedInquiry.companyName}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span> {selectedInquiry.status}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Category:</span> {selectedInquiry.category}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created:</span> {new Date(selectedInquiry.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Announcement for Screen Readers */}
      <div role="status" aria-live="polite" className="sr-only">
        Data updated. Total inquiries: {analytics?.total_inquiries}. 
        Average confidence: {analytics ? Math.round(analytics.average_confidence * 100) : 0}%.
      </div>
    </div>
  )
}
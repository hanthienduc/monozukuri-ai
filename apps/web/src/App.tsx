import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

// Components
import { DashboardLayout } from './components/dashboard';
import { InquiryForm } from './components/inquiry';
import { ResultsDisplay } from './components/classification';

// Types
import type { InquiryFormData } from './types';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Helper components for routes
const DashboardPage: React.FC = () => (
  <DashboardLayout 
    userId="demo-user" 
    timeRange="7d" 
  />
);

const InquirySubmissionPage: React.FC = () => {
  const handleSubmit = async (data: InquiryFormData) => {
    try {
      // In a real app, this would call the API
      console.log('Submitting inquiry:', data);
      toast.success('Inquiry submitted successfully!');
      // Redirect to results page
      window.location.href = '/results/demo-id';
    } catch (error) {
      toast.error('Failed to submit inquiry. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Submit Manufacturing Inquiry
        </h1>
        <InquiryForm 
          onSubmit={handleSubmit}
          language="en"
        />
      </div>
    </div>
  );
};

const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Classification Results
        </h1>
        <ResultsDisplay 
          inquiryId={id || 'demo-id'}
          streaming={false}
        />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />
            <Routes>
              {/* Main Dashboard */}
              <Route path="/" element={<DashboardPage />} />
              
              {/* Inquiry Submission */}
              <Route path="/submit" element={<InquirySubmissionPage />} />
              
              {/* Results View */}
              <Route path="/results/:id" element={<ResultsPage />} />
              
              {/* 404 Page */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-lg text-gray-600 mb-8">Page not found</p>
                    <a 
                      href="/" 
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Back to Dashboard
                    </a>
                  </div>
                </div>
              } />
            </Routes>
          </div>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
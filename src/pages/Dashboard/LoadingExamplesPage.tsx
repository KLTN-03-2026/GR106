import React, { useState, useEffect } from 'react';
import { LoadingSpinner, InlineLoadingSpinner } from '../components/ui/LoadingSpinner';
import { LoadingSkeleton, LoadingCard } from '../components/ui/LoadingSkeleton';

/**
 * Component ví dụ sử dụng các loading states
 */
export const LoadingExamplesPage: React.FC = () => {
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setIsLoadingData(false), 3000);
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Loading Components Examples
        </h1>

        {/* Example 1: LoadingSpinner */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">1. LoadingSpinner</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="border rounded p-4">
              <p className="text-sm text-gray-600 mb-2">Small</p>
              <LoadingSpinner size="sm" text="Loading..." />
            </div>
            <div className="border rounded p-4">
              <p className="text-sm text-gray-600 mb-2">Medium (default)</p>
              <LoadingSpinner size="md" text="Đang tải..." />
            </div>
            <div className="border rounded p-4">
              <p className="text-sm text-gray-600 mb-2">Large</p>
              <LoadingSpinner size="lg" text="Please wait..." />
            </div>
          </div>
        </section>

        {/* Example 2: LoadingSkeleton */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">2. LoadingSkeleton</h2>
          <div className="space-y-4">
            <div>
              <button
                onClick={() => setIsLoadingData(!isLoadingData)}
                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Toggle Loading State
              </button>
            </div>
            {isLoadingData ? (
              <LoadingSkeleton rows={3} />
            ) : (
              <div className="space-y-4 p-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold">Data Item 1</h3>
                  <p className="text-gray-600">This is sample data content</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold">Data Item 2</h3>
                  <p className="text-gray-600">This is sample data content</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold">Data Item 3</h3>
                  <p className="text-gray-600">This is sample data content</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Example 3: LoadingCard */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">3. LoadingCard</h2>
          <div className="grid grid-cols-3 gap-4">
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>
        </section>

        {/* Example 4: InlineLoadingSpinner in Button */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">4. Button Loading State</h2>
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <InlineLoadingSpinner />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                'Submit Form'
              )}
            </button>

            <button
              disabled
              className="px-6 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 flex items-center gap-2"
            >
              <InlineLoadingSpinner />
              <span>Loading...</span>
            </button>
          </div>
        </section>

        {/* Example 5: Custom usage */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">5. Custom Integration</h2>
          <div className="border rounded p-8">
            <div className="max-w-md mx-auto">
              <LoadingSpinner size="lg" text="Đang tải dữ liệu trang trại..." />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

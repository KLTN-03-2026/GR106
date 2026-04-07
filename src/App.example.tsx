import React, { Suspense, lazy } from 'react';
import { Toaster } from 'sonner';
import { LoadingPage } from './components/ui/LoadingPage';

// Lazy load routes để giảm bundle size
const AppRoutes = lazy(() => import('./routes/AppRoutes'));

export function App() {
  return (
    <>
      {/* Hiển thị LoadingPage khi đang tải routes */}
      <Suspense fallback={<LoadingPage />}>
        <AppRoutes />
      </Suspense>
      
      <Toaster position="top-right" richColors />
    </>
  );
}

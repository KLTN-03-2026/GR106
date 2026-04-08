import { Suspense } from 'react';

import { Toaster } from 'sonner';
import { AppRoutes } from './routes/AppRoutes';
import { LoadingPage } from './components/ui/LoadingPage';

export function App() {
  return (
    <>
      <Suspense fallback={<LoadingPage />}>
        <AppRoutes />
      </Suspense>
      <Toaster position="top-right" richColors />
    </>
  );
}
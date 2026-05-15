import { Suspense } from 'react';

import { Toaster } from 'sonner';
import { AppRoutes } from './routes/AppRoutes';
import { LoadingPage } from '@/components/ui/LoadingPage';
import { GoogleMapsProvider } from './providers/GoogleMapsProvider';

export function App() {
  return (
    <GoogleMapsProvider>
      <Suspense fallback={<LoadingPage />}>
        <AppRoutes />
      </Suspense>
      <Toaster position="top-right" richColors />
    </GoogleMapsProvider>
  );
}
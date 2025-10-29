import './react-polyfill'
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { queryClient } from '@/lib/query-client'
import { router } from '@/lib/router'
import { registerPWA } from '@/utils/pwa'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuthStore } from '@/stores/auth-store'


console.log('[App] Initializing auth store...')
useAuthStore.getState().initialize()


if (import.meta.env.DEV) {
  import('@/utils/api-test').then(({ testApiConnection }) => {
    testApiConnection().then(result => {
      console.log(`🌐 API Status: ${result.message}`);
    });
  });
}


registerPWA()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)

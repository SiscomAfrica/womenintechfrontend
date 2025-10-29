import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { MobileBottomNav } from './MobileBottomNav'
import { SystemNotificationBanner } from '@/components/SystemNotificationBanner'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { PWAUpdateNotification } from '@/components/PWAUpdateNotification'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import { AuthListener } from '@/components/AuthListener'
import { useTokenRefresh } from '@/hooks/useTokenRefresh'
import { Toaster } from 'sonner'
import { RealtimeProvider } from '@/providers/RealtimeProvider'
import { NotificationProvider } from '@/providers/NotificationProvider'
import { OfflineProvider } from '@/providers/OfflineProvider'

export function AppLayout() {
  // Token refresh
  useTokenRefresh()

  return (
    <OfflineProvider>
      <NotificationProvider>
        <RealtimeProvider>
          {/* Global Auth Listener for session expiry */}
          <AuthListener />
          
          <div className="min-h-screen w-full overflow-x-hidden bg-[#F8F9FA]">
          {/* Header */}
          <Header />
          
          {/* Main Content */}
          <main className="w-full overflow-x-hidden px-4 md:px-6 pb-20 md:pb-6 pt-4 md:pt-6">
            <div className="w-full max-w-7xl mx-auto">
              {/* System Notifications */}
              <div className="mb-4 w-full">
                <SystemNotificationBanner />
              </div>
              
              <Outlet />
            </div>
          </main>
          
          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
          
          {/* Toast Notifications */}
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                background: 'white',
                border: '1px solid #E0E0E0',
                color: '#1A1A1A',
                maxWidth: '90vw',
              },
            }}
          />
          
          {/* PWA & Offline Components */}
          <PWAInstallPrompt />
          <PWAUpdateNotification />
          <OfflineIndicator />
          </div>
        </RealtimeProvider>
      </NotificationProvider>
    </OfflineProvider>
  )
}
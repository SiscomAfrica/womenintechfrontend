import { useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export const PWAInstallPrompt = () => {
  const { canInstall, installPWA } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  
  const dismissedTime = localStorage.getItem('pwa-install-dismissed');
  if (dismissedTime) {
    const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
    if (daysSinceDismissed < 7) return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <Smartphone className="w-5 h-5 text-orange-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Install Event App
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            Get the full app experience with offline access and push notifications.
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white text-xs font-medium rounded-md hover:bg-orange-700 transition-colors"
            >
              <Download className="w-3 h-3" />
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
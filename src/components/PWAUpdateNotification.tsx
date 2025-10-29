import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';

export const PWAUpdateNotification = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateSW, setUpdateSW] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const handleUpdateAvailable = (event: CustomEvent) => {
      setShowUpdate(true);
      
      if (event.detail?.updateSW) {
        setUpdateSW(() => event.detail.updateSW);
      }
    };

    const handleOfflineReady = () => {
      
      console.log('App is ready for offline use');
    };

    window.addEventListener('pwa-update-available', handleUpdateAvailable as EventListener);
    window.addEventListener('pwa-offline-ready', handleOfflineReady);

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable as EventListener);
      window.removeEventListener('pwa-offline-ready', handleOfflineReady);
    };
  }, []);

  const handleUpdate = async () => {
    if (updateSW) {
      await updateSW();
      setShowUpdate(false);
      
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-blue-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Update Available
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            A new version of the app is available with improvements and bug fixes.
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Update Now
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Later
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
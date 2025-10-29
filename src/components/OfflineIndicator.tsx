import { WifiOff, Wifi, Loader2, AlertCircle } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';

export const OfflineIndicator = () => {
  const isOnline = useNetworkStatus();
  const { queueLength, isProcessing } = useOfflineQueue();

  if (isOnline && queueLength === 0) {
    return null; 
  }

  return (
    <div className="fixed top-16 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40">
      {!isOnline && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2 shadow-sm">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-red-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-800">
                You're offline
              </p>
              <p className="text-xs text-red-600">
                Your actions will be saved and synced when you reconnect.
              </p>
            </div>
          </div>
        </div>
      )}

      {queueLength > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-2">
            {isProcessing ? (
              <Loader2 className="w-4 h-4 text-amber-600 animate-spin flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800">
                {isProcessing ? 'Syncing...' : `${queueLength} action${queueLength > 1 ? 's' : ''} pending`}
              </p>
              <p className="text-xs text-amber-600">
                {isProcessing 
                  ? 'Uploading your offline actions'
                  : isOnline 
                    ? 'Will sync automatically'
                    : 'Will sync when you reconnect'
                }
              </p>
            </div>
            {isOnline && !isProcessing && (
              <Wifi className="w-4 h-4 text-green-600 flex-shrink-0" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
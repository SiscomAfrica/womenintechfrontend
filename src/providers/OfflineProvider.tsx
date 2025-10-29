import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { useBackgroundSync } from '@/hooks/useBackgroundSync';
import { toast } from 'sonner';

interface OfflineContextType {
  isOnline: boolean;
  queueLength: number;
  isProcessing: boolean;
  addToQueue: (action: any) => string;
  clearQueue: () => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider = ({ children }: OfflineProviderProps) => {
  const { isOnline } = useNetworkStatus();
  const { queueLength, isProcessing, addToQueue, clearQueue, processQueue } = useOfflineQueue();
  
  
  useBackgroundSync({
    enabled: true,
    interval: 30000, 
    onFocus: true,
    onOnline: true,
  });

  
  useEffect(() => {
    if (isOnline && queueLength > 0) {
      toast.success('Back online! Syncing your actions...', {
        duration: 3000,
      });
      processQueue();
    } else if (!isOnline) {
      toast.warning('You\'re offline. Actions will be saved and synced later.', {
        duration: 5000,
      });
    }
  }, [isOnline, queueLength, processQueue]);

  
  useEffect(() => {
    if (isOnline && !isProcessing && queueLength === 0) {
      const wasProcessing = localStorage.getItem('was-processing-queue');
      if (wasProcessing === 'true') {
        toast.success('All actions synced successfully!', {
          duration: 3000,
        });
        localStorage.removeItem('was-processing-queue');
      }
    } else if (isProcessing) {
      localStorage.setItem('was-processing-queue', 'true');
    }
  }, [isOnline, isProcessing, queueLength]);

  const value: OfflineContextType = {
    isOnline,
    queueLength,
    isProcessing,
    addToQueue,
    clearQueue,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};
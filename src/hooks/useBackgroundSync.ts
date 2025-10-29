import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { networkingKeys } from './useNetworking';

interface BackgroundSyncOptions {
  enabled?: boolean;
  interval?: number; 
  onFocus?: boolean;
  onOnline?: boolean;
}

export function useBackgroundSync(options: BackgroundSyncOptions = {}) {
  const {
    enabled = true,
    interval = 30000, 
    onFocus = true,
    onOnline = true,
  } = options;

  const queryClient = useQueryClient();
  const intervalRef = useRef<number | null>(null);
  const isActiveRef = useRef(true);

  const syncData = () => {
    if (!enabled || !isActiveRef.current) return;

    
    queryClient.invalidateQueries({ queryKey: networkingKeys.connections() });
    queryClient.invalidateQueries({ queryKey: networkingKeys.attendees() });
  };

  useEffect(() => {
    if (!enabled) return;

    
    intervalRef.current = setInterval(syncData, interval);

    
    const handleVisibilityChange = () => {
      isActiveRef.current = !document.hidden;
      
      if (onFocus && !document.hidden) {
        
        syncData();
      }
    };

    
    const handleOnline = () => {
      if (onOnline) {
        syncData();
      }
    };

    
    const handleFocus = () => {
      if (onFocus) {
        syncData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('focus', handleFocus);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('focus', handleFocus);
    };
  }, [enabled, interval, onFocus, onOnline, queryClient]);

  return {
    syncNow: syncData,
    isActive: isActiveRef.current,
  };
}


export function useNetworkingSync() {
  return useBackgroundSync({
    enabled: true,
    interval: 30000, 
    onFocus: true,
    onOnline: true,
  });
}
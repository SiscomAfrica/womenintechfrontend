import { useState, useEffect } from 'react';
import { useNetworkStatus } from './useNetworkStatus';

interface CachedContent {
  data: any;
  timestamp: number;
  expiresAt: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; 
const CACHE_PREFIX = 'offline-content-';

export const useOfflineContent = <T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: {
    enabled?: boolean;
    staleTime?: number;
  } = {}
) => {
  const { enabled = true, staleTime = CACHE_DURATION } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const isOnline = useNetworkStatus();

  const cacheKey = `${CACHE_PREFIX}${key}`;

  
  const loadFromCache = (): T | null => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsedCache: CachedContent = JSON.parse(cached);
        
        
        if (Date.now() < parsedCache.expiresAt) {
          setIsFromCache(true);
          return parsedCache.data;
        } else {
          
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.error('Failed to load from cache:', error);
    }
    return null;
  };

  
  const saveToCache = (data: T) => {
    try {
      const cacheData: CachedContent = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + staleTime,
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save to cache:', error);
    }
  };

  
  const fetchData = async (useCache = true) => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    
    if (useCache && (!isOnline || !data)) {
      const cachedData = loadFromCache();
      if (cachedData) {
        setData(cachedData);
        setIsLoading(false);
        
        
        if (isOnline) {
          try {
            const freshData = await fetchFn();
            setData(freshData);
            saveToCache(freshData);
            setIsFromCache(false);
          } catch (error) {
            
            console.warn('Background fetch failed, keeping cached data:', error);
          }
        }
        return;
      }
    }

    
    if (isOnline) {
      try {
        const freshData = await fetchFn();
        setData(freshData);
        saveToCache(freshData);
        setIsFromCache(false);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Fetch failed');
        setError(error);
        
        
        const cachedData = loadFromCache();
        if (cachedData) {
          setData(cachedData);
          setIsFromCache(true);
        }
      }
    } else {
      
      const cachedData = loadFromCache();
      if (cachedData) {
        setData(cachedData);
        setIsFromCache(true);
      } else {
        setError(new Error('No cached data available offline'));
      }
    }

    setIsLoading(false);
  };

  
  useEffect(() => {
    fetchData();
  }, [key, enabled]);

  
  useEffect(() => {
    if (isOnline && data && isFromCache) {
      fetchData(false); 
    }
  }, [isOnline]);

  const refetch = () => fetchData(false);
  const clearCache = () => {
    localStorage.removeItem(cacheKey);
  };

  return {
    data,
    isLoading,
    error,
    isFromCache,
    refetch,
    clearCache,
  };
};
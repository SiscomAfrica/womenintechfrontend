

export interface StoredData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: string;
}

export class OfflineStorage {
  private static instance: OfflineStorage;
  private readonly prefix = 'event-app-offline-';
  private readonly version = '1.0.0';

  static getInstance(): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage();
    }
    return OfflineStorage.instance;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  
  set<T>(key: string, data: T, ttl: number = 24 * 60 * 60 * 1000): boolean {
    try {
      const storedData: StoredData<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
        version: this.version,
      };
      
      localStorage.setItem(this.getKey(key), JSON.stringify(storedData));
      return true;
    } catch (error) {
      console.error('Failed to store offline data:', error);
      return false;
    }
  }

  
  get<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(this.getKey(key));
      if (!stored) return null;

      const parsedData: StoredData<T> = JSON.parse(stored);
      
      
      if (parsedData.version !== this.version) {
        this.remove(key);
        return null;
      }

      
      if (Date.now() > parsedData.expiresAt) {
        this.remove(key);
        return null;
      }

      return parsedData.data;
    } catch (error) {
      console.error('Failed to retrieve offline data:', error);
      return null;
    }
  }

  
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  
  remove(key: string): boolean {
    try {
      localStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error('Failed to remove offline data:', error);
      return false;
    }
  }

  
  clear(): boolean {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      return false;
    }
  }

  
  getStorageInfo(): { used: number; available: number; keys: string[] } {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(this.prefix)
    );
    
    let used = 0;
    keys.forEach(key => {
      used += localStorage.getItem(key)?.length || 0;
    });

    
    const available = Math.max(0, 5 * 1024 * 1024 - used);

    return {
      used,
      available,
      keys: keys.map(key => key.replace(this.prefix, '')),
    };
  }

  
  cleanup(): number {
    let cleaned = 0;
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsedData: StoredData<any> = JSON.parse(stored);
            if (Date.now() > parsedData.expiresAt || parsedData.version !== this.version) {
              localStorage.removeItem(key);
              cleaned++;
            }
          }
        } catch (error) {
          
          localStorage.removeItem(key);
          cleaned++;
        }
      }
    });

    return cleaned;
  }
}


export const offlineStorage = OfflineStorage.getInstance();

export const storeOfflineData = <T>(key: string, data: T, ttl?: number): boolean => {
  return offlineStorage.set(key, data, ttl);
};

export const getOfflineData = <T>(key: string): T | null => {
  return offlineStorage.get<T>(key);
};

export const hasOfflineData = (key: string): boolean => {
  return offlineStorage.has(key);
};

export const removeOfflineData = (key: string): boolean => {
  return offlineStorage.remove(key);
};

export const clearOfflineData = (): boolean => {
  return offlineStorage.clear();
};
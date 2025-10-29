import { QueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'


const calculateRetryDelay = (failureCount: number): number => {
  const baseDelay = 1000 
  const maxDelay = 30000 
  const delay = Math.min(baseDelay * Math.pow(2, failureCount), maxDelay)
  
  return delay + Math.random() * 1000
}


const MAX_CACHE_SIZE = 50 * 1024 * 1024 
const CACHE_CHECK_INTERVAL = 5 * 60 * 1000 


const estimateQuerySize = (data: any): number => {
  if (!data) return 0
  try {
    return new Blob([JSON.stringify(data)]).size
  } catch {
    return 1024 
  }
}


const createGarbageCollector = (queryClient: QueryClient) => {
  let totalCacheSize = 0
  const querySizes = new Map<string, number>()

  const updateCacheSize = (queryKey: string, data: any) => {
    const oldSize = querySizes.get(queryKey) || 0
    const newSize = estimateQuerySize(data)
    totalCacheSize = totalCacheSize - oldSize + newSize
    querySizes.set(queryKey, newSize)
  }

  const cleanupOldQueries = () => {
    if (totalCacheSize > MAX_CACHE_SIZE) {
      const queries = queryClient.getQueryCache().getAll()
      
      
      const sortedQueries = queries
        .filter(query => query.state.dataUpdatedAt > 0)
        .sort((a, b) => {
          const aScore = a.state.dataUpdatedAt + (querySizes.get(a.queryHash) || 0) * 0.1
          const bScore = b.state.dataUpdatedAt + (querySizes.get(b.queryHash) || 0) * 0.1
          return aScore - bScore
        })

      
      const toRemove = Math.ceil(sortedQueries.length * 0.25)
      for (let i = 0; i < toRemove; i++) {
        const query = sortedQueries[i]
        queryClient.removeQueries({ queryKey: query.queryKey })
        const size = querySizes.get(query.queryHash) || 0
        totalCacheSize -= size
        querySizes.delete(query.queryHash)
      }
    }
  }

  
  setInterval(cleanupOldQueries, CACHE_CHECK_INTERVAL)

  return { updateCacheSize, cleanupOldQueries }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, 
      gcTime: 1000 * 60 * 10, 
      retry: (failureCount, error: any) => {
        
        if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
          
          useAuthStore.getState().handleAuthError()
          return false
        }
        
        if (error instanceof Error && 'status' in error) {
          const status = (error as { status: number }).status
          if (status >= 400 && status < 500) {
            return false
          }
        }
        return failureCount < 3
      },
      retryDelay: calculateRetryDelay,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      
      structuralSharing: true,
      
      networkMode: 'online',
      
      refetchInterval: (query) => {
        
        if (document.hidden || !navigator.onLine) {
          return false
        }
        
        
        const queryKey = query?.queryKey?.[0] as string
        switch (queryKey) {
          case 'polls':
            return 30000 
          case 'notifications':
            return 60000 
          case 'sessions':
            return 300000 
          default:
            return false 
        }
      },
    },
    mutations: {
      retry: (failureCount, error: any) => {
        
        if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
          useAuthStore.getState().handleAuthError()
          return false
        }
        
        if (error instanceof Error && 'status' in error) {
          const status = (error as { status: number }).status
          if (status >= 400 && status < 500) {
            return false
          }
        }
        return failureCount < 2
      },
      retryDelay: calculateRetryDelay,
      
      networkMode: 'online',
    },
  },
})


const garbageCollector = createGarbageCollector(queryClient)


queryClient.getQueryCache().subscribe((event) => {
  if (event.type === 'added' || event.type === 'updated') {
    garbageCollector.updateCacheSize(event.query.queryHash, event.query.state.data)
  }
})


queryClient.setMutationDefaults(['auth'], {
  onError: (error: any) => {
    console.error('Auth mutation error:', error)
    if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
      useAuthStore.getState().handleAuthError()
    }
  },
})


queryClient.setQueryDefaults(['auth'], {
  staleTime: 1000 * 60 * 10, 
  gcTime: 1000 * 60 * 15, 
})


queryClient.setQueryDefaults(['polls'], {
  staleTime: 1000 * 30, 
  gcTime: 1000 * 60 * 5, 
  refetchInterval: () => {
    
    if (document.hidden || !navigator.onLine) {
      return false
    }
    return 30000 
  },
})

queryClient.setQueryDefaults(['notifications'], {
  staleTime: 1000 * 60, 
  gcTime: 1000 * 60 * 10, 
  refetchInterval: () => {
    if (document.hidden || !navigator.onLine) {
      return false
    }
    return 60000 
  },
})


queryClient.setDefaultOptions({
  queries: {
    ...queryClient.getDefaultOptions().queries,
  },
  mutations: {
    ...queryClient.getDefaultOptions().mutations,
    onError: (error: any) => {
      console.error('Mutation error:', error)
      
      if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
        useAuthStore.getState().handleAuthError()
      }
    },
  },
})
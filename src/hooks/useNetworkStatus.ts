import { useState, useEffect } from 'react'

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => {
      console.log('Network: Online')
      setIsOnline(true)
    }

    const handleOffline = () => {
      console.log('Network: Offline')
      setIsOnline(false)
    }

    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    
    const checkConnectivity = async () => {
      try {
        const response = await fetch('/api/health', {
          method: 'HEAD',
          cache: 'no-cache',
        })
        setIsOnline(response.ok)
      } catch {
        setIsOnline(false)
      }
    }

    
    let connectivityInterval: number | null = null
    
    if (!isOnline) {
      connectivityInterval = setInterval(checkConnectivity, 30000)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (connectivityInterval) {
        clearInterval(connectivityInterval)
      }
    }
  }, [isOnline])

  return { isOnline }
}
import { useState, useEffect } from 'react'

export const useTabVisibility = () => {
  const [isVisible, setIsVisible] = useState(!document.hidden)

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden
      console.log(`Tab visibility changed: ${visible ? 'visible' : 'hidden'}`)
      setIsVisible(visible)
    }

    
    document.addEventListener('visibilitychange', handleVisibilityChange)

    
    const handleFocus = () => setIsVisible(true)
    const handleBlur = () => setIsVisible(false)

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  return { isTabVisible: isVisible }
}
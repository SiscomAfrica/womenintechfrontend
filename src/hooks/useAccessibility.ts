import React, { useEffect, useRef, useState } from 'react'

interface AccessibilityConfig {
  enableFocusManagement?: boolean
  enableKeyboardNavigation?: boolean
  enableScreenReaderSupport?: boolean
  announceRouteChanges?: boolean
}

export function useAccessibility(config: AccessibilityConfig = {}) {
  const {
    enableFocusManagement = true,
    enableKeyboardNavigation = true,
    enableScreenReaderSupport = true,
  } = config

  const [isUsingKeyboard, setIsUsingKeyboard] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const announcementRef = useRef<HTMLDivElement>(null)

  
  useEffect(() => {
    if (!enableKeyboardNavigation) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsUsingKeyboard(true)
        document.body.classList.add('using-keyboard')
      }
    }

    const handleMouseDown = () => {
      setIsUsingKeyboard(false)
      document.body.classList.remove('using-keyboard')
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [enableKeyboardNavigation])

  
  useEffect(() => {
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
    setHighContrast(highContrastQuery.matches)

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches)
    }

    highContrastQuery.addEventListener('change', handleContrastChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
      highContrastQuery.removeEventListener('change', handleContrastChange)
    }
  }, [])

  
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!enableScreenReaderSupport || !announcementRef.current) return

    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    announcementRef.current.appendChild(announcement)

    
    setTimeout(() => {
      if (announcementRef.current?.contains(announcement)) {
        announcementRef.current.removeChild(announcement)
      }
    }, 1000)
  }

  
  const focusElement = (selector: string | HTMLElement) => {
    if (!enableFocusManagement) return

    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector

    if (element) {
      element.focus()
      
      element.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' })
    }
  }

  
  const createSkipLink = (targetId: string, label: string = 'Skip to main content') => {
    const skipLink = document.createElement('a')
    skipLink.href = `#${targetId}`
    skipLink.textContent = label
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded'
    
    skipLink.addEventListener('click', (e) => {
      e.preventDefault()
      const target = document.getElementById(targetId)
      if (target) {
        target.focus()
        target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
      }
    })

    return skipLink
  }

  
  const handleArrowNavigation = (
    e: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    options: {
      horizontal?: boolean
      vertical?: boolean
      wrap?: boolean
    } = {}
  ) => {
    const { horizontal = true, vertical = true, wrap = true } = options
    let newIndex = currentIndex

    switch (e.key) {
      case 'ArrowUp':
        if (vertical) {
          e.preventDefault()
          newIndex = currentIndex > 0 ? currentIndex - 1 : (wrap ? items.length - 1 : 0)
        }
        break
      case 'ArrowDown':
        if (vertical) {
          e.preventDefault()
          newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : (wrap ? 0 : items.length - 1)
        }
        break
      case 'ArrowLeft':
        if (horizontal) {
          e.preventDefault()
          newIndex = currentIndex > 0 ? currentIndex - 1 : (wrap ? items.length - 1 : 0)
        }
        break
      case 'ArrowRight':
        if (horizontal) {
          e.preventDefault()
          newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : (wrap ? 0 : items.length - 1)
        }
        break
      case 'Home':
        e.preventDefault()
        newIndex = 0
        break
      case 'End':
        e.preventDefault()
        newIndex = items.length - 1
        break
    }

    if (newIndex !== currentIndex && items[newIndex]) {
      items[newIndex].focus()
      return newIndex
    }

    return currentIndex
  }

  return {
    isUsingKeyboard,
    reducedMotion,
    highContrast,
    announce,
    focusElement,
    createSkipLink,
    handleArrowNavigation,
    announcementRef,
  }
}


export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    
    previousFocusRef.current = document.activeElement as HTMLElement

    
    if (firstElement) {
      firstElement.focus()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else {
          
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }

      if (e.key === 'Escape') {
        
        if (previousFocusRef.current) {
          previousFocusRef.current.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [isActive])

  return containerRef
}


export function useLiveRegion() {
  const liveRegionRef = useRef<HTMLDivElement>(null)

  const announce = (message: string, priority: 'off' | 'polite' | 'assertive' = 'polite') => {
    if (!liveRegionRef.current) return

    
    liveRegionRef.current.textContent = ''
    
    
    setTimeout(() => {
      if (liveRegionRef.current) {
        liveRegionRef.current.setAttribute('aria-live', priority)
        liveRegionRef.current.textContent = message
      }
    }, 100)
  }

  const LiveRegion = () => {
    const element = document.createElement('div')
    element.setAttribute('aria-live', 'polite')
    element.setAttribute('aria-atomic', 'true')
    element.className = 'sr-only'
    
    React.useEffect(() => {
      if (liveRegionRef.current) {
        liveRegionRef.current.appendChild(element)
        return () => {
          if (liveRegionRef.current?.contains(element)) {
            liveRegionRef.current.removeChild(element)
          }
        }
      }
    }, [element])
    
    return null
  }

  return { announce, LiveRegion }
}


export function useColorContrast() {
  const validateContrast = (foreground: string, background: string): {
    ratio: number
    wcagAA: boolean
    wcagAAA: boolean
  } => {
    
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    }

    
    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }

    const fg = hexToRgb(foreground)
    const bg = hexToRgb(background)

    if (!fg || !bg) {
      return { ratio: 0, wcagAA: false, wcagAAA: false }
    }

    const fgLuminance = getLuminance(fg.r, fg.g, fg.b)
    const bgLuminance = getLuminance(bg.r, bg.g, bg.b)

    const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                  (Math.min(fgLuminance, bgLuminance) + 0.05)

    return {
      ratio: Math.round(ratio * 100) / 100,
      wcagAA: ratio >= 4.5,
      wcagAAA: ratio >= 7,
    }
  }

  return { validateContrast }
}
import { useEffect, useRef, useState, useCallback } from 'react'
import { performanceTester, type LoadTestResult } from '@/utils/performance-testing'

interface PerformanceMetrics {
  fcp: number | null 
  lcp: number | null 
  fid: number | null 
  cls: number | null 
  ttfb: number | null 
  domContentLoaded: number | null
  loadComplete: number | null
  memoryUsage: number | null
  frameRate: number | null
  renderTime: number | null
  bundleSize: number | null
}

interface PerformanceTestResults {
  loadTest: LoadTestResult | null
  virtualScrollTest: any | null
  queryCacheTest: any | null
  isRunning: boolean
}

interface PerformanceConfig {
  enableLogging?: boolean
  enableReporting?: boolean
  reportingEndpoint?: string
  sampleRate?: number
}

export function usePerformanceMonitor(config: PerformanceConfig = {}) {
  const {
    enableLogging = process.env.NODE_ENV === 'development',
    enableReporting = false,
    reportingEndpoint,
    sampleRate = 1.0,
  } = config

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    domContentLoaded: null,
    loadComplete: null,
    memoryUsage: null,
    frameRate: null,
    renderTime: null,
    bundleSize: null,
  })

  const [testResults, setTestResults] = useState<PerformanceTestResults>({
    loadTest: null,
    virtualScrollTest: null,
    queryCacheTest: null,
    isRunning: false,
  })


  const clsRef = useRef(0)
  const sessionIdRef = useRef(Math.random().toString(36).substring(7))
  const frameCount = useRef(0)
  const lastFrameTime = useRef(performance.now())
  const renderTimes = useRef<number[]>([])
  const pendingUpdatesRef = useRef<Partial<PerformanceMetrics>>({})

  
  useEffect(() => {
    if (!('PerformanceObserver' in window)) return

    
    if (Math.random() > sampleRate) return

    
    let updateTimeout: number | null = null

    const updateMetrics = (newMetrics: Partial<PerformanceMetrics>) => {
      
      Object.assign(pendingUpdatesRef.current, newMetrics)
      
      
      if (updateTimeout) {
        window.clearTimeout(updateTimeout)
      }
      
      
      updateTimeout = window.setTimeout(() => {
        setMetrics(prev => ({ ...prev, ...pendingUpdatesRef.current }))
        
        if (enableLogging) {
          console.log('Performance Metrics Updated:', pendingUpdatesRef.current)
        }
        
        
        pendingUpdatesRef.current = {}
        updateTimeout = null
      }, 100) 
    }

    
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          updateMetrics({ fcp: entry.startTime })
        }
      }
    })

    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as any
      updateMetrics({ lcp: lastEntry.startTime })
    })

    
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as any
        updateMetrics({ fid: fidEntry.processingStart - fidEntry.startTime })
      }
    })

    
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const clsEntry = entry as any
        if (!clsEntry.hadRecentInput) {
          clsRef.current += clsEntry.value
          updateMetrics({ cls: clsRef.current })
        }
      }
    })

    try {
      paintObserver.observe({ entryTypes: ['paint'] })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      fidObserver.observe({ entryTypes: ['first-input'] })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.warn('Performance Observer not supported:', error)
    }

    
    const measureNavigationTiming = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        updateMetrics({
          ttfb: navigation.responseStart - navigation.requestStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          loadComplete: navigation.loadEventEnd - navigation.fetchStart,
        })
      }
    }

    
    const measureMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        updateMetrics({
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024, 
        })
      }
    }

    
    if (document.readyState === 'complete') {
      measureNavigationTiming()
      measureMemoryUsage()
    } else {
      window.addEventListener('load', () => {
        measureNavigationTiming()
        measureMemoryUsage()
      })
    }

    
    let animationId: number
    let frameRateUpdateCount = 0
    const measureFrameRate = () => {
      frameCount.current++
      const currentTime = performance.now()
      
      if (currentTime - lastFrameTime.current >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / (currentTime - lastFrameTime.current))
        
        
        frameRateUpdateCount++
        if (frameRateUpdateCount >= 5) {
          updateMetrics({ frameRate: fps })
          frameRateUpdateCount = 0
        }
        
        frameCount.current = 0
        lastFrameTime.current = currentTime
      }
      
      animationId = requestAnimationFrame(measureFrameRate)
    }
    
    
    if (enableLogging) {
      measureFrameRate()
    }

    
    const calculateBundleSize = () => {
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      const bundleSize = resourceEntries
        .filter(entry => entry.name.includes('.js') || entry.name.includes('.css'))
        .reduce((total, entry) => total + (entry.transferSize || 0), 0)
      
      updateMetrics({ bundleSize: bundleSize / 1024 }) 
    }
    
    
    setTimeout(calculateBundleSize, 2000)

    
    const memoryInterval = setInterval(measureMemoryUsage, 30000) 

    return () => {
      paintObserver.disconnect()
      lcpObserver.disconnect()
      fidObserver.disconnect()
      clsObserver.disconnect()
      clearInterval(memoryInterval)
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      if (updateTimeout) {
        window.clearTimeout(updateTimeout)
      }
    }
  }, [enableLogging, sampleRate])

  
  useEffect(() => {
    if (!enableReporting || !reportingEndpoint) return

    const reportMetrics = async () => {
      
      const hasData = metrics.fcp !== null || metrics.lcp !== null || metrics.fid !== null

      if (!hasData) return

      try {
        await fetch(reportingEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            metrics,
          }),
        })
      } catch (error) {
        console.warn('Failed to report performance metrics:', error)
      }
    }

    
    const handleUnload = () => {
      if (navigator.sendBeacon && reportingEndpoint) {
        navigator.sendBeacon(
          reportingEndpoint,
          JSON.stringify({
            sessionId: sessionIdRef.current,
            url: window.location.href,
            timestamp: Date.now(),
            metrics,
            type: 'unload',
          })
        )
      }
    }

    window.addEventListener('beforeunload', handleUnload)

    
    const reportInterval = setInterval(reportMetrics, 60000) 

    return () => {
      window.removeEventListener('beforeunload', handleUnload)
      clearInterval(reportInterval)
    }
  }, [enableReporting, reportingEndpoint, metrics])

  
  const getPerformanceScore = (): number => {
    let score = 100
    
    
    if (metrics.fcp !== null) {
      if (metrics.fcp > 3000) score -= 20
      else if (metrics.fcp > 1800) score -= 10
    }

    
    if (metrics.lcp !== null) {
      if (metrics.lcp > 4000) score -= 25
      else if (metrics.lcp > 2500) score -= 15
    }

    
    if (metrics.fid !== null) {
      if (metrics.fid > 300) score -= 20
      else if (metrics.fid > 100) score -= 10
    }

    
    if (metrics.cls !== null) {
      if (metrics.cls > 0.25) score -= 25
      else if (metrics.cls > 0.1) score -= 15
    }

    return Math.max(0, score)
  }

  
  const runComprehensiveTest = useCallback(async () => {
    setTestResults(prev => ({ ...prev, isRunning: true }))
    
    try {
      
      const loadTest = await performanceTester.runPerformanceTest()
      
      
      const virtualScrollTest = await performanceTester.testVirtualScrolling(1000)
      
      
      const queryCacheTest = await performanceTester.testQueryCaching(100)
      
      setTestResults({
        loadTest,
        virtualScrollTest,
        queryCacheTest,
        isRunning: false,
      })
      
      return {
        loadTest,
        virtualScrollTest,
        queryCacheTest,
      }
    } catch (error) {
      console.error('Performance test failed:', error)
      setTestResults(prev => ({ ...prev, isRunning: false }))
      throw error
    }
  }, [])

  const testVirtualScrollingPerformance = useCallback(async (itemCount: number = 1000) => {
    return await performanceTester.testVirtualScrolling(itemCount)
  }, [])

  const testQueryCachingEfficiency = useCallback(async (queryCount: number = 100) => {
    return await performanceTester.testQueryCaching(queryCount)
  }, [])

  const measureLargeDatasetPerformance = useCallback(async (dataSize: number) => {
    const startTime = performance.now()
    
    
    const data = Array.from({ length: dataSize }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: `Description for item ${i}`,
      timestamp: Date.now() + i,
      metadata: {
        category: `Category ${i % 10}`,
        tags: [`tag${i % 5}`, `tag${(i + 1) % 5}`],
        score: Math.random() * 100,
      },
    }))
    
    const generationTime = performance.now() - startTime
    
    
    const filterStart = performance.now()
    const filtered = data.filter(item => item.metadata.score > 50)
    const filterTime = performance.now() - filterStart
    
    
    const sortStart = performance.now()
    const sorted = [...data].sort((a, b) => b.metadata.score - a.metadata.score)
    const sortTime = performance.now() - sortStart
    
    
    const searchStart = performance.now()
    const searchResults = data.filter(item => 
      item.name.toLowerCase().includes('item 1') ||
      item.description.toLowerCase().includes('description')
    )
    const searchTime = performance.now() - searchStart
    
    return {
      dataSize,
      generationTime,
      filterTime,
      sortTime,
      searchTime,
      filteredCount: filtered.length,
      searchResultsCount: searchResults.length,
      memoryUsage: 'memory' in performance ? (performance as any).memory.usedJSHeapSize : 0,
    }
  }, [])

  const measureRenderTime = useCallback((componentName: string) => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      
      renderTimes.current.push(renderTime)
      if (renderTimes.current.length > 100) {
        renderTimes.current = renderTimes.current.slice(-50) 
      }
      
      
      const avgRenderTime = renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length
      
      setMetrics(prev => ({
        ...prev,
        renderTime: avgRenderTime,
      }))
      
      if (enableLogging) {
        console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms (avg: ${avgRenderTime.toFixed(2)}ms)`)
      }
    }
  }, [enableLogging])

  return {
    metrics,
    testResults,
    performanceScore: getPerformanceScore(),
    isLoading: metrics.fcp === null && metrics.lcp === null,
    runComprehensiveTest,
    testVirtualScrollingPerformance,
    testQueryCachingEfficiency,
    measureLargeDatasetPerformance,
    measureRenderTime,
  }
}


export function useRenderPerformance(componentName: string) {
  const renderCountRef = useRef(0)
  const lastRenderTimeRef = useRef(0)
  const [renderStats, setRenderStats] = useState({
    renderCount: 0,
    averageRenderTime: 0,
    lastRenderTime: 0,
  })

  useEffect(() => {
    const startTime = performance.now()
    renderCountRef.current += 1

    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      lastRenderTimeRef.current = renderTime

      setRenderStats(prev => ({
        renderCount: renderCountRef.current,
        averageRenderTime: (prev.averageRenderTime * (renderCountRef.current - 1) + renderTime) / renderCountRef.current,
        lastRenderTime: renderTime,
      }))

      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`)
      }
    }
  })

  return renderStats
}


export function useQueryPerformance() {
  const [queryStats, setQueryStats] = useState({
    totalQueries: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageQueryTime: 0,
    slowQueries: 0,
  })

  const trackQuery = (queryKey: string, duration: number, fromCache: boolean) => {
    setQueryStats(prev => {
      const newTotal = prev.totalQueries + 1
      const newAverage = (prev.averageQueryTime * prev.totalQueries + duration) / newTotal
      
      return {
        totalQueries: newTotal,
        cacheHits: prev.cacheHits + (fromCache ? 1 : 0),
        cacheMisses: prev.cacheMisses + (fromCache ? 0 : 1),
        averageQueryTime: newAverage,
        slowQueries: prev.slowQueries + (duration > 1000 ? 1 : 0),
      }
    })

    if (process.env.NODE_ENV === 'development') {
      console.log(`Query ${queryKey}: ${duration}ms ${fromCache ? '(cached)' : '(network)'}`)
    }
  }

  return { queryStats, trackQuery }
}
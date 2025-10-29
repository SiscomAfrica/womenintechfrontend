



import { PerformanceTester, calculatePerformanceScore } from '../performance-testing';


const mockPerformance = {
  now: jest.fn(() => Date.now()),
  getEntriesByType: jest.fn(() => []),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, 
  },
};


class MockPerformanceObserver {
  constructor(private callback: (entries: any) => void) {}
  
  observe() {}
  disconnect() {}
}


beforeAll(() => {
  global.performance = mockPerformance as any;
  global.PerformanceObserver = MockPerformanceObserver as any;
  global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
  global.cancelAnimationFrame = jest.fn();
});

describe('PerformanceTester', () => {
  let tester: PerformanceTester;

  beforeEach(() => {
    tester = new PerformanceTester();
    jest.clearAllMocks();
  });

  afterEach(() => {
    tester.cleanup();
  });

  describe('Core Web Vitals measurement', () => {
    it('should initialize with empty metrics', () => {
      const metrics = tester.getMetrics();
      expect(metrics).toEqual({});
    });

    it('should measure TTI', async () => {
      const ttiPromise = tester.measureTTI();
      
      
      setTimeout(() => {
        
      }, 100);

      const tti = await ttiPromise;
      expect(typeof tti).toBe('number');
      expect(tti).toBeGreaterThan(0);
    });

    it('should measure TBT', async () => {
      const tbtPromise = tester.measureTBT();
      
      
      setTimeout(() => {
        
      }, 100);

      const tbt = await tbtPromise;
      expect(typeof tbt).toBe('number');
      expect(tbt).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Virtual scrolling performance', () => {
    beforeEach(() => {
      
      document.createElement = jest.fn(() => ({
        style: {},
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        scrollTop: 0,
        textContent: '',
      })) as any;

      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();
    });

    it('should test virtual scrolling performance', async () => {
      const result = await tester.testVirtualScrolling(100);
      
      expect(result).toHaveProperty('renderTime');
      expect(result).toHaveProperty('scrollPerformance');
      expect(result).toHaveProperty('memoryUsage');
      
      expect(typeof result.renderTime).toBe('number');
      expect(typeof result.scrollPerformance).toBe('number');
      expect(typeof result.memoryUsage).toBe('number');
    });

    it('should handle different item counts', async () => {
      const results = await Promise.all([
        tester.testVirtualScrolling(10),
        tester.testVirtualScrolling(100),
        tester.testVirtualScrolling(1000),
      ]);

      results.forEach(result => {
        expect(result.renderTime).toBeGreaterThan(0);
        expect(result.scrollPerformance).toBeGreaterThan(0);
      });
    });
  });

  describe('Query caching performance', () => {
    it('should test query caching efficiency', async () => {
      const result = await tester.testQueryCaching(50);
      
      expect(result).toHaveProperty('cacheHitRate');
      expect(result).toHaveProperty('averageQueryTime');
      expect(result).toHaveProperty('memoryUsage');
      
      expect(result.cacheHitRate).toBeGreaterThanOrEqual(0);
      expect(result.cacheHitRate).toBeLessThanOrEqual(1);
      expect(result.averageQueryTime).toBeGreaterThan(0);
    });

    it('should show improved performance with caching', async () => {
      const result = await tester.testQueryCaching(100);
      
      
      expect(result.cacheHitRate).toBeGreaterThan(0.5);
    });
  });

  describe('Comprehensive performance test', () => {
    it('should run full performance test suite', async () => {
      
      mockPerformance.getEntriesByType.mockReturnValue([
        {
          navigationStart: 0,
          responseStart: 100,
          requestStart: 50,
          domContentLoadedEventEnd: 500,
          loadEventEnd: 800,
        },
      ]);

      const result = await tester.runPerformanceTest();
      
      expect(result).toHaveProperty('loadTime');
      expect(result).toHaveProperty('domContentLoaded');
      expect(result).toHaveProperty('firstPaint');
      expect(result).toHaveProperty('firstContentfulPaint');
      expect(result).toHaveProperty('largestContentfulPaint');
      expect(result).toHaveProperty('timeToInteractive');
      expect(result).toHaveProperty('totalBlockingTime');
      expect(result).toHaveProperty('cumulativeLayoutShift');
      expect(result).toHaveProperty('bundleSize');
      expect(result).toHaveProperty('resourceCount');
      expect(result).toHaveProperty('cacheHitRate');
    });
  });
});

describe('calculatePerformanceScore', () => {
  it('should calculate performance scores correctly', () => {
    const mockResults = {
      loadTime: 1000,
      domContentLoaded: 800,
      firstPaint: 500,
      firstContentfulPaint: 1200, 
      largestContentfulPaint: 2000, 
      timeToInteractive: 3000, 
      totalBlockingTime: 150, 
      cumulativeLayoutShift: 0.05, 
      bundleSize: 400000, 
      resourceCount: 20,
      cacheHitRate: 0.85, 
    };

    const scores = calculatePerformanceScore(mockResults);
    
    expect(scores).toHaveProperty('performance');
    expect(scores).toHaveProperty('accessibility');
    expect(scores).toHaveProperty('bestPractices');
    expect(scores).toHaveProperty('seo');
    expect(scores).toHaveProperty('overall');
    
    
    expect(scores.performance).toBeGreaterThan(90);
    expect(scores.overall).toBeGreaterThan(85);
  });

  it('should penalize poor performance metrics', () => {
    const mockResults = {
      loadTime: 5000,
      domContentLoaded: 4000,
      firstPaint: 2000,
      firstContentfulPaint: 4500, 
      largestContentfulPaint: 6000, 
      timeToInteractive: 8000, 
      totalBlockingTime: 800, 
      cumulativeLayoutShift: 0.3, 
      bundleSize: 2000000, 
      resourceCount: 100,
      cacheHitRate: 0.3, 
    };

    const scores = calculatePerformanceScore(mockResults);
    
    
    expect(scores.performance).toBeLessThan(50);
    expect(scores.overall).toBeLessThan(70);
  });

  it('should handle edge cases', () => {
    const mockResults = {
      loadTime: 0,
      domContentLoaded: 0,
      firstPaint: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      timeToInteractive: 0,
      totalBlockingTime: 0,
      cumulativeLayoutShift: 0,
      bundleSize: 0,
      resourceCount: 0,
      cacheHitRate: 1,
    };

    const scores = calculatePerformanceScore(mockResults);
    
    
    expect(scores.performance).toBe(100);
    expect(scores.accessibility).toBeGreaterThan(90);
  });
});

describe('Performance report generation', () => {
  it('should generate a comprehensive report', async () => {
    const tester = new PerformanceTester();
    
    
    const mockLoadTest = {
      loadTime: 1000,
      domContentLoaded: 800,
      firstPaint: 500,
      firstContentfulPaint: 1200,
      largestContentfulPaint: 2000,
      timeToInteractive: 3000,
      totalBlockingTime: 150,
      cumulativeLayoutShift: 0.05,
      bundleSize: 400000,
      resourceCount: 20,
      cacheHitRate: 0.85,
    };

    const mockVirtualScrollTest = {
      renderTime: 50,
      scrollPerformance: 100,
      memoryUsage: 50 * 1024 * 1024,
    };

    const mockQueryCacheTest = {
      cacheHitRate: 0.8,
      averageQueryTime: 25,
      memoryUsage: 30 * 1024 * 1024,
    };

    const { generatePerformanceReport } = await import('../performance-testing');
    const report = generatePerformanceReport(
      mockLoadTest,
      mockVirtualScrollTest,
      mockQueryCacheTest
    );

    expect(typeof report).toBe('string');
    expect(report).toContain('Performance Test Report');
    expect(report).toContain('Core Web Vitals');
    expect(report).toContain('Performance Scores');
    expect(report).toContain('Bundle Analysis');
    expect(report).toContain('Virtual Scrolling Performance');
    expect(report).toContain('Query Caching Efficiency');
  });
});
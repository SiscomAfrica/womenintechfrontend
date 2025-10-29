module.exports = {
  ci: {
    collect: {
      // Number of runs to average results
      numberOfRuns: 3,
      // URLs to test
      url: [
        'http://localhost:3000',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/schedule',
        'http://localhost:3000/networking',
        'http://localhost:3000/polls',
      ],
      // Lighthouse settings
      settings: {
        // Chrome flags for consistent testing
        chromeFlags: [
          '--no-sandbox',
          '--headless',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-extensions',
          '--no-first-run',
          '--disable-default-apps',
        ],
        // Throttling settings for consistent results
        throttlingMethod: 'simulate',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        // Screen emulation
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
        // Form factor
        formFactor: 'desktop',
        // Skip certain audits that aren't relevant
        skipAudits: [
          'canonical',
          'robots-txt',
          'tap-targets',
          'content-width',
        ],
      },
    },
    assert: {
      assertions: {
        // Performance thresholds
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.8 }],
        'categories:seo': ['error', { minScore: 0.8 }],
        
        // Core Web Vitals thresholds
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'interactive': ['error', { maxNumericValue: 3800 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        
        // Resource optimization
        'unused-javascript': ['warn', { maxNumericValue: 100000 }],
        'unused-css-rules': ['warn', { maxNumericValue: 50000 }],
        'render-blocking-resources': ['warn', { maxNumericValue: 500 }],
        'unminified-css': ['error', { maxNumericValue: 0 }],
        'unminified-javascript': ['error', { maxNumericValue: 0 }],
        
        // Image optimization
        'modern-image-formats': ['warn', { maxNumericValue: 50000 }],
        'uses-optimized-images': ['warn', { maxNumericValue: 50000 }],
        'uses-responsive-images': ['warn', { maxNumericValue: 50000 }],
        
        // Caching
        'uses-long-cache-ttl': ['warn', { maxNumericValue: 100000 }],
        
        // Bundle size
        'total-byte-weight': ['warn', { maxNumericValue: 1600000 }], // 1.6MB
        
        // Accessibility
        'color-contrast': ['error', { minScore: 1 }],
        'heading-order': ['error', { minScore: 1 }],
        'label': ['error', { minScore: 1 }],
        'link-name': ['error', { minScore: 1 }],
        
        // Best practices
        'uses-https': ['error', { minScore: 1 }],
        'no-vulnerable-libraries': ['error', { minScore: 1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
    server: {
      port: 9001,
      storage: './lighthouse-results',
    },
  },
};
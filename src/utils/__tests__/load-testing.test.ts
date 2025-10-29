



import { LoadTester, ConcurrentInteractionTester, PollingEfficiencyTester } from '../load-testing';


global.fetch = jest.fn();


const mockPerformance = {
  now: jest.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, 
  },
};

global.performance = mockPerformance as any;

describe('LoadTester', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('test response'),
      headers: new Map(),
    });
  });

  it('should create load tester with configuration', () => {
    const config = {
      concurrentUsers: 10,
      requestsPerUser: 5,
      duration: 5000,
      rampUpTime: 1000,
      endpoints: ['/test'],
    };

    const tester = new LoadTester(config);
    expect(tester).toBeDefined();
  });

  it('should run load test and return results', async () => {
    const config = {
      concurrentUsers: 2,
      requestsPerUser: 2,
      duration: 1000,
      rampUpTime: 100,
      endpoints: ['/test'],
    };

    const tester = new LoadTester(config);
    const results = await tester.runLoadTest();

    expect(results).toHaveProperty('totalRequests');
    expect(results).toHaveProperty('successfulRequests');
    expect(results).toHaveProperty('failedRequests');
    expect(results).toHaveProperty('averageResponseTime');
    expect(results).toHaveProperty('requestsPerSecond');
    expect(results).toHaveProperty('errorRate');
    expect(results).toHaveProperty('concurrentUsers');
    expect(results.concurrentUsers).toBe(2);
  });

  it('should handle request failures', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const config = {
      concurrentUsers: 1,
      requestsPerUser: 1,
      duration: 500,
      rampUpTime: 100,
      endpoints: ['/test'],
    };

    const tester = new LoadTester(config);
    const results = await tester.runLoadTest();

    expect(results.failedRequests).toBeGreaterThan(0);
    expect(results.errorRate).toBeGreaterThan(0);
  });
});

describe('ConcurrentInteractionTester', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should test concurrent poll voting', async () => {
    const tester = new ConcurrentInteractionTester();
    const results = await tester.testConcurrentPollVoting(5);

    expect(Array.isArray(results)).toBe(true);
    expect(results).toHaveLength(5);
    
    results.forEach(result => {
      expect(result).toHaveProperty('testName', 'poll-voting');
      expect(result).toHaveProperty('startTime');
      expect(result).toHaveProperty('endTime');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('success');
    });
  });

  it('should test concurrent session joining', async () => {
    const tester = new ConcurrentInteractionTester();
    const results = await tester.testConcurrentSessionJoining(3);

    expect(Array.isArray(results)).toBe(true);
    expect(results).toHaveLength(3);
    
    results.forEach(result => {
      expect(result).toHaveProperty('testName', 'session-joining');
      expect(result).toHaveProperty('success');
    });
  });

  it('should test concurrent networking interactions', async () => {
    const tester = new ConcurrentInteractionTester();
    const results = await tester.testConcurrentNetworking(4);

    expect(Array.isArray(results)).toBe(true);
    expect(results).toHaveLength(4);
    
    results.forEach(result => {
      expect(result).toHaveProperty('testName', 'networking-interactions');
      expect(result).toHaveProperty('success');
    });
  });

  it('should generate summary report', async () => {
    const tester = new ConcurrentInteractionTester();
    
    
    await tester.testConcurrentPollVoting(2);
    await tester.testConcurrentSessionJoining(2);
    
    const summary = tester.generateSummary();
    
    expect(Array.isArray(summary)).toBe(true);
    expect(summary.length).toBeGreaterThan(0);
    
    summary.forEach(test => {
      expect(test).toHaveProperty('testName');
      expect(test).toHaveProperty('totalTests');
      expect(test).toHaveProperty('successful');
      expect(test).toHaveProperty('failed');
      expect(test).toHaveProperty('successRate');
      expect(test).toHaveProperty('averageDuration');
    });
  });
});

describe('PollingEfficiencyTester', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    
    jest.clearAllTimers();
  });

  it('should create polling efficiency tester', () => {
    const tester = new PollingEfficiencyTester();
    expect(tester).toBeDefined();
  });

  it('should test multi-tab polling', async () => {
    jest.useFakeTimers();
    
    const tester = new PollingEfficiencyTester();
    
    
    const testPromise = tester.testMultiTabPolling(2, 1000);
    
    
    jest.advanceTimersByTime(1000);
    
    const results = await testPromise;
    
    expect(results).toHaveProperty('tabs');
    expect(results).toHaveProperty('summary');
    expect(results.summary).toHaveProperty('totalTabs');
    expect(results.summary).toHaveProperty('totalRequests');
    expect(results.summary).toHaveProperty('averageRequestsPerTab');
    expect(results.summary).toHaveProperty('overallAverageResponseTime');
    expect(results.summary).toHaveProperty('efficiency');
    
    tester.cleanup();
    
    jest.useRealTimers();
  });

  it('should cleanup properly', () => {
    const tester = new PollingEfficiencyTester();
    
    
    expect(() => tester.cleanup()).not.toThrow();
  });
});

describe('Load testing integration', () => {
  it('should handle realistic load test scenario', async () => {
    
    (fetch as jest.Mock).mockImplementation(() => {
      const responseTime = Math.random() * 200 + 50; 
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: Math.random() > 0.05, 
            status: Math.random() > 0.05 ? 200 : 500,
            text: () => Promise.resolve('response data'),
            headers: new Map([['cache-control', 'max-age=300']]),
          });
        }, responseTime);
      });
    });

    const config = {
      concurrentUsers: 5,
      requestsPerUser: 3,
      duration: 2000,
      rampUpTime: 500,
      endpoints: ['/api/test1', '/api/test2'],
    };

    const tester = new LoadTester(config);
    const results = await tester.runLoadTest();

    
    expect(results.totalRequests).toBeGreaterThan(0);
    expect(results.averageResponseTime).toBeGreaterThan(0);
    expect(results.requestsPerSecond).toBeGreaterThan(0);
    expect(results.errorRate).toBeLessThan(100); 
    expect(results.memoryUsage.initial).toBeGreaterThanOrEqual(0);
  });

  it('should handle high error rate scenarios', async () => {
    
    (fetch as jest.Mock).mockImplementation(() => {
      return Promise.resolve({
        ok: Math.random() > 0.8, 
        status: Math.random() > 0.8 ? 200 : 500,
        text: () => Promise.resolve('error response'),
        headers: new Map(),
      });
    });

    const config = {
      concurrentUsers: 3,
      requestsPerUser: 2,
      duration: 1000,
      rampUpTime: 200,
      endpoints: ['/api/failing'],
    };

    const tester = new LoadTester(config);
    const results = await tester.runLoadTest();

    expect(results.errorRate).toBeGreaterThan(50); 
    expect(results.failedRequests).toBeGreaterThan(0);
  });
});
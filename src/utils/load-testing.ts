



export interface LoadTestConfig {
  concurrentUsers: number;
  requestsPerUser: number;
  duration: number; 
  rampUpTime: number; 
  endpoints: string[];
  payloadSize?: number;
}

export interface LoadTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  throughput: number; 
  concurrentUsers: number;
  testDuration: number;
  memoryUsage: {
    initial: number;
    peak: number;
    final: number;
  };
  networkStats: {
    totalBytes: number;
    cacheHits: number;
    cacheMisses: number;
  };
}

export interface ConcurrentTestResult {
  testName: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: string;
  metrics?: any;
}




export class LoadTester {
  private activeRequests = new Set<Promise<any>>();
  private results: any[] = [];
  private startTime = 0;
  private memoryStats = { initial: 0, peak: 0, final: 0 };

  constructor(private config: LoadTestConfig) {}

  


  async runLoadTest(): Promise<LoadTestResult> {
    console.log(`Starting load test with ${this.config.concurrentUsers} concurrent users`);
    
    this.startTime = performance.now();
    this.memoryStats.initial = this.getMemoryUsage();
    
    const userPromises: Promise<any>[] = [];
    
    
    for (let i = 0; i < this.config.concurrentUsers; i++) {
      const delay = (this.config.rampUpTime / this.config.concurrentUsers) * i;
      
      const userPromise = new Promise(resolve => {
        setTimeout(async () => {
          const userResults = await this.simulateUser(i);
          resolve(userResults);
        }, delay);
      });
      
      userPromises.push(userPromise);
    }
    
    
    const allResults = await Promise.all(userPromises);
    
    
    this.results = allResults.flat();
    this.memoryStats.final = this.getMemoryUsage();
    
    return this.calculateResults();
  }

  


  private async simulateUser(userId: number): Promise<any[]> {
    const userResults: any[] = [];
    const endTime = this.startTime + this.config.duration;
    
    let requestCount = 0;
    
    while (performance.now() < endTime && requestCount < this.config.requestsPerUser) {
      const endpoint = this.config.endpoints[requestCount % this.config.endpoints.length];
      
      try {
        const result = await this.makeRequest(endpoint, userId, requestCount);
        userResults.push(result);
        
        
        const currentMemory = this.getMemoryUsage();
        if (currentMemory > this.memoryStats.peak) {
          this.memoryStats.peak = currentMemory;
        }
        
      } catch (error) {
        userResults.push({
          userId,
          requestId: requestCount,
          endpoint,
          success: false,
          error: error.message,
          responseTime: 0,
          timestamp: performance.now(),
        });
      }
      
      requestCount++;
      
      
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    }
    
    return userResults;
  }

  


  private async makeRequest(endpoint: string, userId: number, requestId: number): Promise<any> {
    const startTime = performance.now();
    
    try {
      
      const requestOptions: RequestInit = {
        method: Math.random() > 0.8 ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `LoadTester-User-${userId}`,
        },
      };
      
      
      if (requestOptions.method === 'POST' && this.config.payloadSize) {
        requestOptions.body = JSON.stringify({
          userId,
          requestId,
          timestamp: Date.now(),
          data: 'x'.repeat(this.config.payloadSize),
        });
      }
      
      const response = await fetch(endpoint, requestOptions);
      const endTime = performance.now();
      
      const responseTime = endTime - startTime;
      const success = response.ok;
      
      
      let responseSize = 0;
      try {
        const text = await response.text();
        responseSize = new Blob([text]).size;
      } catch {
        
      }
      
      return {
        userId,
        requestId,
        endpoint,
        method: requestOptions.method,
        success,
        statusCode: response.status,
        responseTime,
        responseSize,
        timestamp: startTime,
        fromCache: response.headers.get('cache-control') !== null,
      };
      
    } catch (error) {
      const endTime = performance.now();
      
      return {
        userId,
        requestId,
        endpoint,
        success: false,
        error: error.message,
        responseTime: endTime - startTime,
        timestamp: startTime,
      };
    }
  }

  


  private calculateResults(): LoadTestResult {
    const successfulResults = this.results.filter(r => r.success);
    const failedResults = this.results.filter(r => !r.success);
    
    const responseTimes = successfulResults.map(r => r.responseTime);
    responseTimes.sort((a, b) => a - b);
    
    const totalBytes = successfulResults.reduce((sum, r) => sum + (r.responseSize || 0), 0);
    const cacheHits = this.results.filter(r => r.fromCache).length;
    const testDuration = performance.now() - this.startTime;
    
    return {
      totalRequests: this.results.length,
      successfulRequests: successfulResults.length,
      failedRequests: failedResults.length,
      averageResponseTime: responseTimes.length > 0 ? 
        responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 0,
      minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
      maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      p95ResponseTime: responseTimes.length > 0 ? 
        responseTimes[Math.floor(responseTimes.length * 0.95)] : 0,
      p99ResponseTime: responseTimes.length > 0 ? 
        responseTimes[Math.floor(responseTimes.length * 0.99)] : 0,
      requestsPerSecond: (this.results.length / testDuration) * 1000,
      errorRate: (failedResults.length / this.results.length) * 100,
      throughput: (totalBytes / testDuration) * 1000, 
      concurrentUsers: this.config.concurrentUsers,
      testDuration,
      memoryUsage: this.memoryStats,
      networkStats: {
        totalBytes,
        cacheHits,
        cacheMisses: this.results.length - cacheHits,
      },
    };
  }

  


  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }
}




export class ConcurrentInteractionTester {
  private results: ConcurrentTestResult[] = [];

  


  async testConcurrentPollVoting(userCount: number = 50): Promise<ConcurrentTestResult[]> {
    console.log(`Testing concurrent poll voting with ${userCount} users`);
    
    const pollId = 'test-poll-' + Date.now();
    const options = ['option1', 'option2', 'option3', 'option4'];
    
    const userPromises = Array.from({ length: userCount }, async (_, userId) => {
      const startTime = performance.now();
      
      try {
        
        const selectedOption = options[Math.floor(Math.random() * options.length)];
        
        
        await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50));
        
        
        const voteResult = await this.simulateVoteSubmission(pollId, selectedOption, userId);
        
        const endTime = performance.now();
        
        return {
          testName: 'poll-voting',
          startTime,
          endTime,
          duration: endTime - startTime,
          success: voteResult.success,
          error: voteResult.error,
          metrics: {
            userId,
            pollId,
            selectedOption,
            optimisticUpdate: true,
          },
        };
      } catch (error) {
        const endTime = performance.now();
        
        return {
          testName: 'poll-voting',
          startTime,
          endTime,
          duration: endTime - startTime,
          success: false,
          error: error.message,
        };
      }
    });
    
    const results = await Promise.all(userPromises);
    this.results.push(...results);
    
    return results;
  }

  


  async testConcurrentSessionJoining(userCount: number = 100): Promise<ConcurrentTestResult[]> {
    console.log(`Testing concurrent session joining with ${userCount} users`);
    
    const sessionId = 'test-session-' + Date.now();
    
    const userPromises = Array.from({ length: userCount }, async (_, userId) => {
      const startTime = performance.now();
      
      try {
        
        const joinResult = await this.simulateSessionJoin(sessionId, userId);
        
        const endTime = performance.now();
        
        return {
          testName: 'session-joining',
          startTime,
          endTime,
          duration: endTime - startTime,
          success: joinResult.success,
          error: joinResult.error,
          metrics: {
            userId,
            sessionId,
            optimisticUpdate: true,
          },
        };
      } catch (error) {
        const endTime = performance.now();
        
        return {
          testName: 'session-joining',
          startTime,
          endTime,
          duration: endTime - startTime,
          success: false,
          error: error.message,
        };
      }
    });
    
    const results = await Promise.all(userPromises);
    this.results.push(...results);
    
    return results;
  }

  


  async testConcurrentNetworking(userCount: number = 75): Promise<ConcurrentTestResult[]> {
    console.log(`Testing concurrent networking interactions with ${userCount} users`);
    
    const userPromises = Array.from({ length: userCount }, async (_, userId) => {
      const startTime = performance.now();
      
      try {
        
        const actions = [
          () => this.simulateConnectionRequest(userId, Math.floor(Math.random() * 1000)),
          () => this.simulateProfileView(userId, Math.floor(Math.random() * 1000)),
          () => this.simulateSearch(userId, `query-${Math.random().toString(36).substring(7)}`),
        ];
        
        const actionResults = await Promise.all(
          actions.map(action => action())
        );
        
        const endTime = performance.now();
        
        return {
          testName: 'networking-interactions',
          startTime,
          endTime,
          duration: endTime - startTime,
          success: actionResults.every(r => r.success),
          metrics: {
            userId,
            actions: actionResults.length,
            optimisticUpdates: actionResults.filter(r => r.optimistic).length,
          },
        };
      } catch (error) {
        const endTime = performance.now();
        
        return {
          testName: 'networking-interactions',
          startTime,
          endTime,
          duration: endTime - startTime,
          success: false,
          error: error.message,
        };
      }
    });
    
    const results = await Promise.all(userPromises);
    this.results.push(...results);
    
    return results;
  }

  


  private async simulateVoteSubmission(pollId: string, option: string, userId: number): Promise<any> {
    
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));
    
    
    if (Math.random() < 0.05) {
      throw new Error('Vote conflict - poll already closed');
    }
    
    
    if (Math.random() < 0.02) {
      throw new Error('Network error');
    }
    
    return {
      success: true,
      pollId,
      option,
      userId,
      timestamp: Date.now(),
    };
  }

  


  private async simulateSessionJoin(sessionId: string, userId: number): Promise<any> {
    
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50));
    
    
    if (Math.random() < 0.1) {
      throw new Error('Session is full');
    }
    
    
    if (Math.random() < 0.03) {
      throw new Error('Network timeout');
    }
    
    return {
      success: true,
      sessionId,
      userId,
      timestamp: Date.now(),
    };
  }

  


  private async simulateConnectionRequest(fromUserId: number, toUserId: number): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 150 + 25));
    
    return {
      success: Math.random() > 0.05, 
      fromUserId,
      toUserId,
      optimistic: true,
    };
  }

  


  private async simulateProfileView(viewerId: number, profileId: number): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 10));
    
    return {
      success: Math.random() > 0.02, 
      viewerId,
      profileId,
      optimistic: false,
    };
  }

  


  private async simulateSearch(userId: number, query: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 250 + 50));
    
    return {
      success: Math.random() > 0.01, 
      userId,
      query,
      optimistic: false,
    };
  }

  


  getResults(): ConcurrentTestResult[] {
    return this.results;
  }

  


  generateSummary(): any {
    const byTestName = this.results.reduce((acc, result) => {
      if (!acc[result.testName]) {
        acc[result.testName] = [];
      }
      acc[result.testName].push(result);
      return acc;
    }, {} as Record<string, ConcurrentTestResult[]>);
    
    const summary = Object.entries(byTestName).map(([testName, results]) => {
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      const durations = results.map(r => r.duration);
      
      return {
        testName,
        totalTests: results.length,
        successful: successful.length,
        failed: failed.length,
        successRate: (successful.length / results.length) * 100,
        averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations),
      };
    });
    
    return summary;
  }
}




export class PollingEfficiencyTester {
  private pollingIntervals: number[] = [];
  private requestCounts: Record<string, number> = {};
  private responseTimes: Record<string, number[]> = {};

  


  async testMultiTabPolling(tabCount: number = 5, duration: number = 30000): Promise<any> {
    console.log(`Testing multi-tab polling with ${tabCount} tabs for ${duration}ms`);
    
    const tabPromises = Array.from({ length: tabCount }, (_, tabId) => {
      return this.simulateTabPolling(tabId, duration);
    });
    
    await Promise.all(tabPromises);
    
    return this.calculatePollingResults();
  }

  


  private async simulateTabPolling(tabId: number, duration: number): Promise<void> {
    const tabKey = `tab-${tabId}`;
    this.requestCounts[tabKey] = 0;
    this.responseTimes[tabKey] = [];
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const poll = async () => {
        if (Date.now() - startTime >= duration) {
          resolve();
          return;
        }
        
        const requestStart = performance.now();
        
        try {
          
          await this.simulatePollingRequest(tabId);
          
          const requestEnd = performance.now();
          const responseTime = requestEnd - requestStart;
          
          this.requestCounts[tabKey]++;
          this.responseTimes[tabKey].push(responseTime);
          
        } catch (error) {
          console.warn(`Polling error for tab ${tabId}:`, error.message);
        }
        
        
        const isActive = Math.random() > 0.3; 
        const interval = isActive ? 30000 : 120000;
        
        setTimeout(poll, interval + Math.random() * 5000); 
      };
      
      
      poll();
    });
  }

  


  private async simulatePollingRequest(tabId: number): Promise<any> {
    
    const delay = Math.random() * 500 + 100;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    
    if (Math.random() < 0.01) {
      throw new Error('Network error');
    }
    
    return {
      tabId,
      timestamp: Date.now(),
      updates: Math.random() > 0.8 ? ['new-poll', 'schedule-change'] : [],
    };
  }

  


  private calculatePollingResults(): any {
    const results = Object.entries(this.requestCounts).map(([tabKey, count]) => {
      const responseTimes = this.responseTimes[tabKey] || [];
      const avgResponseTime = responseTimes.length > 0 ? 
        responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 0;
      
      return {
        tab: tabKey,
        totalRequests: count,
        averageResponseTime: avgResponseTime,
        minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
        maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      };
    });
    
    const totalRequests = results.reduce((sum, r) => sum + r.totalRequests, 0);
    const avgRequestsPerTab = totalRequests / results.length;
    const overallAvgResponseTime = results.reduce((sum, r) => sum + r.averageResponseTime, 0) / results.length;
    
    return {
      tabs: results,
      summary: {
        totalTabs: results.length,
        totalRequests,
        averageRequestsPerTab: avgRequestsPerTab,
        overallAverageResponseTime: overallAvgResponseTime,
        efficiency: avgRequestsPerTab > 0 ? (1000 / overallAvgResponseTime) * avgRequestsPerTab : 0,
      },
    };
  }

  


  cleanup(): void {
    this.pollingIntervals.forEach(interval => clearInterval(interval));
    this.pollingIntervals = [];
  }
}
#!/usr/bin/env node

/**
 * Stress testing script for high-load scenarios
 * Usage: node scripts/stress-test.js [options]
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_CONFIG = {
  baseUrl: 'http://localhost:3000',
  scenarios: [
    {
      name: 'concurrent-users',
      users: 100,
      duration: 60, // seconds
      rampUp: 10, // seconds
    },
    {
      name: 'heavy-load',
      users: 500,
      duration: 120,
      rampUp: 30,
    },
    {
      name: 'spike-test',
      users: 1000,
      duration: 30,
      rampUp: 5,
    },
  ],
  endpoints: [
    '/dashboard',
    '/schedule',
    '/networking',
    '/polls',
  ],
  thresholds: {
    errorRate: 5, // percent
    avgResponseTime: 500, // ms
    p95ResponseTime: 1000, // ms
  },
};

class StressTester {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.results = [];
  }

  async runStressTests() {
    console.log('🔥 Starting stress tests...');
    
    // Ensure output directory exists
    await this.ensureOutputDir();
    
    // Start development server
    const server = await this.startServer();
    
    try {
      // Wait for server to be ready
      await this.waitForServer();
      
      // Run each scenario
      for (const scenario of this.config.scenarios) {
        console.log(`\n📊 Running scenario: ${scenario.name}`);
        const result = await this.runScenario(scenario);
        this.results.push(result);
      }
      
      // Generate reports
      await this.generateReports();
      
      console.log('\n✅ Stress tests completed successfully!');
      
    } catch (error) {
      console.error('\n❌ Stress tests failed:', error.message);
      process.exit(1);
    } finally {
      // Clean up server
      if (server) {
        server.kill();
      }
    }
  }

  async ensureOutputDir() {
    const outputPath = path.join(process.cwd(), 'stress-test-results');
    try {
      await fs.access(outputPath);
    } catch {
      await fs.mkdir(outputPath, { recursive: true });
    }
  }

  async startServer() {
    console.log('📦 Building application...');
    
    // Build the application
    const buildProcess = spawn('npm', ['run', 'build'], {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    
    await new Promise((resolve, reject) => {
      buildProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Build failed with code ${code}`));
        }
      });
    });
    
    console.log('🌐 Starting preview server...');
    
    // Start preview server
    const server = spawn('npm', ['run', 'preview'], {
      stdio: 'pipe',
      cwd: process.cwd(),
    });
    
    return server;
  }

  async waitForServer(timeout = 30000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(this.config.baseUrl);
        if (response.ok) {
          console.log('✅ Server is ready');
          return;
        }
      } catch {
        // Server not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error('Server failed to start within timeout');
  }

  async runScenario(scenario) {
    console.log(`  Users: ${scenario.users}, Duration: ${scenario.duration}s, Ramp-up: ${scenario.rampUp}s`);
    
    const startTime = Date.now();
    const endTime = startTime + (scenario.duration * 1000);
    const userPromises = [];
    
    // Spawn users gradually during ramp-up period
    for (let i = 0; i < scenario.users; i++) {
      const delay = (scenario.rampUp * 1000 / scenario.users) * i;
      
      const userPromise = new Promise(resolve => {
        setTimeout(async () => {
          const userResults = await this.simulateUser(i, endTime);
          resolve(userResults);
        }, delay);
      });
      
      userPromises.push(userPromise);
    }
    
    // Wait for all users to complete
    const allUserResults = await Promise.all(userPromises);
    const flatResults = allUserResults.flat();
    
    return this.analyzeResults(scenario, flatResults);
  }

  async simulateUser(userId, endTime) {
    const results = [];
    let requestCount = 0;
    
    while (Date.now() < endTime) {
      const endpoint = this.config.endpoints[requestCount % this.config.endpoints.length];
      const url = `${this.config.baseUrl}${endpoint}`;
      
      const startTime = Date.now();
      
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': `StressTester-User-${userId}`,
          },
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        results.push({
          userId,
          requestCount,
          endpoint,
          success: response.ok,
          statusCode: response.status,
          responseTime,
          timestamp: startTime,
        });
        
      } catch (error) {
        const endTime = Date.now();
        
        results.push({
          userId,
          requestCount,
          endpoint,
          success: false,
          error: error.message,
          responseTime: endTime - startTime,
          timestamp: startTime,
        });
      }
      
      requestCount++;
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    }
    
    return results;
  }

  analyzeResults(scenario, results) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    const responseTimes = successful.map(r => r.responseTime);
    responseTimes.sort((a, b) => a - b);
    
    const avgResponseTime = responseTimes.length > 0 ? 
      responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 0;
    
    const p95ResponseTime = responseTimes.length > 0 ? 
      responseTimes[Math.floor(responseTimes.length * 0.95)] : 0;
    
    const p99ResponseTime = responseTimes.length > 0 ? 
      responseTimes[Math.floor(responseTimes.length * 0.99)] : 0;
    
    const errorRate = (failed.length / results.length) * 100;
    
    const requestsPerSecond = results.length / scenario.duration;
    
    const analysis = {
      scenario: scenario.name,
      config: scenario,
      metrics: {
        totalRequests: results.length,
        successfulRequests: successful.length,
        failedRequests: failed.length,
        errorRate,
        avgResponseTime,
        minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
        maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
        p95ResponseTime,
        p99ResponseTime,
        requestsPerSecond,
      },
      thresholds: {
        errorRatePassed: errorRate <= this.config.thresholds.errorRate,
        avgResponseTimePassed: avgResponseTime <= this.config.thresholds.avgResponseTime,
        p95ResponseTimePassed: p95ResponseTime <= this.config.thresholds.p95ResponseTime,
      },
      passed: errorRate <= this.config.thresholds.errorRate && 
              avgResponseTime <= this.config.thresholds.avgResponseTime && 
              p95ResponseTime <= this.config.thresholds.p95ResponseTime,
    };
    
    console.log(`    Total Requests: ${analysis.metrics.totalRequests}`);
    console.log(`    Error Rate: ${errorRate.toFixed(2)}% (threshold: ${this.config.thresholds.errorRate}%)`);
    console.log(`    Avg Response Time: ${avgResponseTime.toFixed(0)}ms (threshold: ${this.config.thresholds.avgResponseTime}ms)`);
    console.log(`    P95 Response Time: ${p95ResponseTime.toFixed(0)}ms (threshold: ${this.config.thresholds.p95ResponseTime}ms)`);
    console.log(`    Requests/Second: ${requestsPerSecond.toFixed(1)}`);
    console.log(`    Result: ${analysis.passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    return analysis;
  }

  async generateReports() {
    console.log('\n📊 Generating stress test reports...');
    
    // Generate summary report
    const summary = {
      timestamp: new Date().toISOString(),
      config: this.config,
      results: this.results,
      overallPassed: this.results.every(r => r.passed),
    };
    
    await fs.writeFile(
      path.join('stress-test-results', 'summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    // Generate markdown report
    const markdownReport = this.generateMarkdownReport(summary);
    await fs.writeFile(
      path.join('stress-test-results', 'stress-test-report.md'),
      markdownReport
    );
    
    // Generate CSV for analysis
    const csvReport = this.generateCSVReport();
    await fs.writeFile(
      path.join('stress-test-results', 'metrics.csv'),
      csvReport
    );
    
    console.log('📁 Reports saved to stress-test-results/');
  }

  generateMarkdownReport(summary) {
    let report = `# Stress Test Report\n\n`;
    report += `**Generated:** ${new Date().toLocaleString()}\n`;
    report += `**Overall Result:** ${summary.overallPassed ? '✅ PASSED' : '❌ FAILED'}\n\n`;
    
    // Summary table
    report += `## Test Results Summary\n\n`;
    report += `| Scenario | Users | Duration | Requests | Error Rate | Avg Response | P95 Response | RPS | Result |\n`;
    report += `|----------|-------|----------|----------|------------|--------------|--------------|-----|--------|\n`;
    
    for (const result of this.results) {
      const { scenario, config, metrics, passed } = result;
      report += `| ${scenario} | ${config.users} | ${config.duration}s | ${metrics.totalRequests} | ${metrics.errorRate.toFixed(2)}% | ${metrics.avgResponseTime.toFixed(0)}ms | ${metrics.p95ResponseTime.toFixed(0)}ms | ${metrics.requestsPerSecond.toFixed(1)} | ${passed ? '✅' : '❌'} |\n`;
    }
    
    // Detailed results
    report += `\n## Detailed Results\n\n`;
    
    for (const result of this.results) {
      report += `### ${result.scenario}\n\n`;
      report += `**Configuration:**\n`;
      report += `- Users: ${result.config.users}\n`;
      report += `- Duration: ${result.config.duration} seconds\n`;
      report += `- Ramp-up: ${result.config.rampUp} seconds\n\n`;
      
      report += `**Metrics:**\n`;
      report += `- Total Requests: ${result.metrics.totalRequests}\n`;
      report += `- Successful Requests: ${result.metrics.successfulRequests}\n`;
      report += `- Failed Requests: ${result.metrics.failedRequests}\n`;
      report += `- Error Rate: ${result.metrics.errorRate.toFixed(2)}%\n`;
      report += `- Average Response Time: ${result.metrics.avgResponseTime.toFixed(0)}ms\n`;
      report += `- P95 Response Time: ${result.metrics.p95ResponseTime.toFixed(0)}ms\n`;
      report += `- P99 Response Time: ${result.metrics.p99ResponseTime.toFixed(0)}ms\n`;
      report += `- Requests per Second: ${result.metrics.requestsPerSecond.toFixed(1)}\n\n`;
      
      report += `**Threshold Results:**\n`;
      report += `- Error Rate: ${result.thresholds.errorRatePassed ? '✅' : '❌'} (${result.metrics.errorRate.toFixed(2)}% ≤ ${this.config.thresholds.errorRate}%)\n`;
      report += `- Avg Response Time: ${result.thresholds.avgResponseTimePassed ? '✅' : '❌'} (${result.metrics.avgResponseTime.toFixed(0)}ms ≤ ${this.config.thresholds.avgResponseTime}ms)\n`;
      report += `- P95 Response Time: ${result.thresholds.p95ResponseTimePassed ? '✅' : '❌'} (${result.metrics.p95ResponseTime.toFixed(0)}ms ≤ ${this.config.thresholds.p95ResponseTime}ms)\n\n`;
    }
    
    // Recommendations
    report += `## Recommendations\n\n`;
    
    const failedTests = this.results.filter(r => !r.passed);
    
    if (failedTests.length === 0) {
      report += `🎉 All stress tests passed! The application handles high load scenarios well.\n\n`;
    } else {
      report += `The following scenarios need attention:\n\n`;
      
      for (const test of failedTests) {
        report += `**${test.scenario}:**\n`;
        
        if (!test.thresholds.errorRatePassed) {
          report += `- High error rate (${test.metrics.errorRate.toFixed(2)}%) - investigate server capacity and error handling\n`;
        }
        
        if (!test.thresholds.avgResponseTimePassed) {
          report += `- Slow average response time (${test.metrics.avgResponseTime.toFixed(0)}ms) - optimize database queries and caching\n`;
        }
        
        if (!test.thresholds.p95ResponseTimePassed) {
          report += `- High P95 response time (${test.metrics.p95ResponseTime.toFixed(0)}ms) - investigate performance bottlenecks\n`;
        }
        
        report += `\n`;
      }
      
      report += `### General Optimization Suggestions\n\n`;
      report += `- Implement connection pooling and database optimization\n`;
      report += `- Add horizontal scaling capabilities\n`;
      report += `- Implement circuit breakers and rate limiting\n`;
      report += `- Optimize TanStack Query caching strategies\n`;
      report += `- Consider CDN for static assets\n`;
      report += `- Implement proper error handling and graceful degradation\n`;
    }
    
    return report;
  }

  generateCSVReport() {
    const headers = [
      'scenario',
      'users',
      'duration',
      'totalRequests',
      'successfulRequests',
      'failedRequests',
      'errorRate',
      'avgResponseTime',
      'p95ResponseTime',
      'p99ResponseTime',
      'requestsPerSecond',
      'passed',
    ];
    
    let csv = headers.join(',') + '\n';
    
    for (const result of this.results) {
      const row = [
        result.scenario,
        result.config.users,
        result.config.duration,
        result.metrics.totalRequests,
        result.metrics.successfulRequests,
        result.metrics.failedRequests,
        result.metrics.errorRate.toFixed(2),
        result.metrics.avgResponseTime.toFixed(0),
        result.metrics.p95ResponseTime.toFixed(0),
        result.metrics.p99ResponseTime.toFixed(0),
        result.metrics.requestsPerSecond.toFixed(1),
        result.passed,
      ];
      
      csv += row.join(',') + '\n';
    }
    
    return csv;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const config = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    
    switch (key) {
      case 'users':
        config.scenarios = [{ name: 'custom', users: parseInt(value), duration: 60, rampUp: 10 }];
        break;
      case 'duration':
        if (config.scenarios) {
          config.scenarios[0].duration = parseInt(value);
        }
        break;
      case 'url':
        config.baseUrl = value;
        break;
      default:
        console.warn(`Unknown option: ${key}`);
    }
  }
  
  const tester = new StressTester(config);
  await tester.runStressTests();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { StressTester };
#!/usr/bin/env node

/**
 * Performance testing script for automated benchmarking
 * Usage: node scripts/performance-test.js [options]
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_CONFIG = {
  urls: [
    'http://localhost:3000',
    'http://localhost:3000/dashboard',
    'http://localhost:3000/schedule',
    'http://localhost:3000/networking',
    'http://localhost:3000/polls',
  ],
  runs: 3,
  outputDir: 'performance-results',
  thresholds: {
    performance: 90,
    accessibility: 95,
    bestPractices: 80,
    seo: 80,
    fcp: 2000,
    lcp: 2500,
    tti: 3800,
    tbt: 200,
    cls: 0.1,
  },
};

class PerformanceTester {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.results = [];
  }

  async runTests() {
    console.log('🚀 Starting performance tests...');
    
    // Ensure output directory exists
    await this.ensureOutputDir();
    
    // Start development server
    const server = await this.startDevServer();
    
    try {
      // Wait for server to be ready
      await this.waitForServer();
      
      // Run Lighthouse tests
      await this.runLighthouseTests();
      
      // Generate reports
      await this.generateReports();
      
      console.log('✅ Performance tests completed successfully!');
      
    } catch (error) {
      console.error('❌ Performance tests failed:', error.message);
      process.exit(1);
    } finally {
      // Clean up server
      if (server) {
        server.kill();
      }
    }
  }

  async ensureOutputDir() {
    const outputPath = path.join(process.cwd(), this.config.outputDir);
    try {
      await fs.access(outputPath);
    } catch {
      await fs.mkdir(outputPath, { recursive: true });
    }
  }

  async startDevServer() {
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
        const response = await fetch('http://localhost:4173');
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

  async runLighthouseTests() {
    console.log('🔍 Running Lighthouse tests...');
    
    for (const url of this.config.urls) {
      console.log(`Testing ${url}...`);
      
      const results = await this.runLighthouseForUrl(url);
      this.results.push({
        url,
        ...results,
      });
    }
  }

  async runLighthouseForUrl(url) {
    const outputFile = path.join(
      this.config.outputDir,
      `lighthouse-${url.replace(/[^a-zA-Z0-9]/g, '-')}.json`
    );
    
    const lighthouseProcess = spawn('npx', [
      'lighthouse',
      url,
      '--output=json',
      `--output-path=${outputFile}`,
      '--chrome-flags=--headless --no-sandbox',
      '--quiet',
    ], {
      stdio: 'pipe',
    });
    
    await new Promise((resolve, reject) => {
      lighthouseProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Lighthouse failed for ${url} with code ${code}`));
        }
      });
    });
    
    // Read and parse results
    const resultsJson = await fs.readFile(outputFile, 'utf8');
    const results = JSON.parse(resultsJson);
    
    return this.extractMetrics(results);
  }

  extractMetrics(lighthouseResults) {
    const { categories, audits } = lighthouseResults;
    
    return {
      scores: {
        performance: Math.round(categories.performance.score * 100),
        accessibility: Math.round(categories.accessibility.score * 100),
        bestPractices: Math.round(categories['best-practices'].score * 100),
        seo: Math.round(categories.seo.score * 100),
      },
      metrics: {
        fcp: audits['first-contentful-paint'].numericValue,
        lcp: audits['largest-contentful-paint'].numericValue,
        tti: audits['interactive'].numericValue,
        tbt: audits['total-blocking-time'].numericValue,
        cls: audits['cumulative-layout-shift'].numericValue,
        speedIndex: audits['speed-index'].numericValue,
      },
      opportunities: audits['unused-javascript'] ? {
        unusedJavaScript: audits['unused-javascript'].numericValue,
        unusedCSS: audits['unused-css-rules'].numericValue,
        renderBlocking: audits['render-blocking-resources'].numericValue,
      } : {},
    };
  }

  async generateReports() {
    console.log('📊 Generating performance reports...');
    
    // Generate summary report
    const summary = this.generateSummaryReport();
    await fs.writeFile(
      path.join(this.config.outputDir, 'summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    // Generate markdown report
    const markdownReport = this.generateMarkdownReport(summary);
    await fs.writeFile(
      path.join(this.config.outputDir, 'performance-report.md'),
      markdownReport
    );
    
    // Generate CSV for analysis
    const csvReport = this.generateCSVReport();
    await fs.writeFile(
      path.join(this.config.outputDir, 'metrics.csv'),
      csvReport
    );
    
    console.log(`📁 Reports saved to ${this.config.outputDir}/`);
  }

  generateSummaryReport() {
    const summary = {
      timestamp: new Date().toISOString(),
      config: this.config,
      results: this.results,
      averages: this.calculateAverages(),
      thresholdResults: this.checkThresholds(),
    };
    
    return summary;
  }

  calculateAverages() {
    if (this.results.length === 0) return {};
    
    const averages = {
      scores: {},
      metrics: {},
    };
    
    // Calculate average scores
    for (const scoreType of ['performance', 'accessibility', 'bestPractices', 'seo']) {
      const scores = this.results.map(r => r.scores[scoreType]);
      averages.scores[scoreType] = Math.round(
        scores.reduce((sum, score) => sum + score, 0) / scores.length
      );
    }
    
    // Calculate average metrics
    for (const metricType of ['fcp', 'lcp', 'tti', 'tbt', 'cls', 'speedIndex']) {
      const metrics = this.results.map(r => r.metrics[metricType]);
      averages.metrics[metricType] = Math.round(
        metrics.reduce((sum, metric) => sum + metric, 0) / metrics.length
      );
    }
    
    return averages;
  }

  checkThresholds() {
    const averages = this.calculateAverages();
    const results = {};
    
    for (const [key, threshold] of Object.entries(this.config.thresholds)) {
      if (key in averages.scores) {
        results[key] = {
          value: averages.scores[key],
          threshold,
          passed: averages.scores[key] >= threshold,
        };
      } else if (key in averages.metrics) {
        results[key] = {
          value: averages.metrics[key],
          threshold,
          passed: averages.metrics[key] <= threshold,
        };
      }
    }
    
    return results;
  }

  generateMarkdownReport(summary) {
    const { averages, thresholdResults } = summary;
    
    let report = `# Performance Test Report\n\n`;
    report += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    
    // Summary scores
    report += `## Performance Scores\n\n`;
    report += `| Category | Score | Threshold | Status |\n`;
    report += `|----------|-------|-----------|--------|\n`;
    
    for (const [category, score] of Object.entries(averages.scores)) {
      const threshold = thresholdResults[category];
      const status = threshold?.passed ? '✅ Pass' : '❌ Fail';
      report += `| ${category} | ${score} | ${threshold?.threshold || 'N/A'} | ${status} |\n`;
    }
    
    // Core Web Vitals
    report += `\n## Core Web Vitals\n\n`;
    report += `| Metric | Value | Threshold | Status |\n`;
    report += `|--------|-------|-----------|--------|\n`;
    
    const webVitals = ['fcp', 'lcp', 'tti', 'tbt', 'cls'];
    for (const metric of webVitals) {
      const value = averages.metrics[metric];
      const threshold = thresholdResults[metric];
      const status = threshold?.passed ? '✅ Pass' : '❌ Fail';
      const unit = metric === 'cls' ? '' : 'ms';
      report += `| ${metric.toUpperCase()} | ${value}${unit} | ${threshold?.threshold || 'N/A'}${unit} | ${status} |\n`;
    }
    
    // Detailed results
    report += `\n## Detailed Results\n\n`;
    
    for (const result of this.results) {
      report += `### ${result.url}\n\n`;
      report += `**Performance:** ${result.scores.performance}/100\n`;
      report += `**Accessibility:** ${result.scores.accessibility}/100\n`;
      report += `**Best Practices:** ${result.scores.bestPractices}/100\n`;
      report += `**SEO:** ${result.scores.seo}/100\n\n`;
      
      report += `**Core Metrics:**\n`;
      report += `- FCP: ${result.metrics.fcp}ms\n`;
      report += `- LCP: ${result.metrics.lcp}ms\n`;
      report += `- TTI: ${result.metrics.tti}ms\n`;
      report += `- TBT: ${result.metrics.tbt}ms\n`;
      report += `- CLS: ${result.metrics.cls}\n\n`;
    }
    
    // Recommendations
    report += `## Recommendations\n\n`;
    
    const failedThresholds = Object.entries(thresholdResults)
      .filter(([, result]) => !result.passed);
    
    if (failedThresholds.length === 0) {
      report += `🎉 All performance thresholds are met! Great job!\n\n`;
    } else {
      report += `The following metrics need improvement:\n\n`;
      
      for (const [metric, result] of failedThresholds) {
        report += `- **${metric.toUpperCase()}**: ${result.value} (threshold: ${result.threshold})\n`;
      }
      
      report += `\n### Optimization Suggestions\n\n`;
      
      if (failedThresholds.some(([metric]) => ['fcp', 'lcp'].includes(metric))) {
        report += `- Optimize images with WebP/AVIF formats\n`;
        report += `- Implement code splitting and lazy loading\n`;
        report += `- Minimize render-blocking resources\n`;
      }
      
      if (failedThresholds.some(([metric]) => metric === 'tbt')) {
        report += `- Reduce JavaScript execution time\n`;
        report += `- Break up long tasks\n`;
        report += `- Use web workers for heavy computations\n`;
      }
      
      if (failedThresholds.some(([metric]) => metric === 'cls')) {
        report += `- Set explicit dimensions for images and videos\n`;
        report += `- Reserve space for dynamic content\n`;
        report += `- Avoid inserting content above existing content\n`;
      }
    }
    
    return report;
  }

  generateCSVReport() {
    const headers = [
      'url',
      'performance',
      'accessibility',
      'bestPractices',
      'seo',
      'fcp',
      'lcp',
      'tti',
      'tbt',
      'cls',
      'speedIndex',
    ];
    
    let csv = headers.join(',') + '\n';
    
    for (const result of this.results) {
      const row = [
        result.url,
        result.scores.performance,
        result.scores.accessibility,
        result.scores.bestPractices,
        result.scores.seo,
        result.metrics.fcp,
        result.metrics.lcp,
        result.metrics.tti,
        result.metrics.tbt,
        result.metrics.cls,
        result.metrics.speedIndex,
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
      case 'runs':
        config.runs = parseInt(value);
        break;
      case 'output':
        config.outputDir = value;
        break;
      case 'url':
        config.urls = [value];
        break;
      default:
        console.warn(`Unknown option: ${key}`);
    }
  }
  
  const tester = new PerformanceTester(config);
  await tester.runTests();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { PerformanceTester };
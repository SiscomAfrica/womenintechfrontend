#!/usr/bin/env node

/**
 * Simple benchmark script to test key performance scenarios
 */

import { performance } from 'perf_hooks';

class Benchmark {
  constructor() {
    this.results = [];
  }

  async run(name, fn, iterations = 1000) {
    console.log(`Running benchmark: ${name} (${iterations} iterations)`);
    
    const times = [];
    
    // Warm up
    for (let i = 0; i < 10; i++) {
      await fn();
    }
    
    // Actual benchmark
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      times.push(end - start);
    }
    
    const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const p95 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];
    
    const result = {
      name,
      iterations,
      average: avg,
      min,
      max,
      p95,
    };
    
    this.results.push(result);
    
    console.log(`  Average: ${avg.toFixed(2)}ms`);
    console.log(`  Min: ${min.toFixed(2)}ms`);
    console.log(`  Max: ${max.toFixed(2)}ms`);
    console.log(`  P95: ${p95.toFixed(2)}ms`);
    console.log('');
    
    return result;
  }

  report() {
    console.log('=== Benchmark Results ===');
    console.table(this.results);
  }
}

// Test scenarios
async function testArrayOperations() {
  const data = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    score: Math.random() * 100,
  }));
  
  return data.filter(item => item.score > 50).length;
}

async function testObjectCreation() {
  const objects = [];
  for (let i = 0; i < 100; i++) {
    objects.push({
      id: i,
      timestamp: Date.now(),
      data: new Array(10).fill(i),
    });
  }
  return objects.length;
}

async function testStringOperations() {
  let result = '';
  for (let i = 0; i < 100; i++) {
    result += `Item ${i} - ${Math.random().toString(36).substring(7)}\n`;
  }
  return result.length;
}

async function main() {
  const benchmark = new Benchmark();
  
  await benchmark.run('Array filtering (1000 items)', testArrayOperations, 1000);
  await benchmark.run('Object creation (100 objects)', testObjectCreation, 1000);
  await benchmark.run('String concatenation (100 strings)', testStringOperations, 1000);
  
  benchmark.report();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  performanceTester, 
  generatePerformanceReport, 
  calculatePerformanceScore,
  type LoadTestResult 
} from '@/utils/performance-testing';
import { Activity, Zap, Database, Gauge, Download, Clock } from 'lucide-react';

interface PerformanceMonitorProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export function PerformanceMonitor({ isVisible = false, onClose }: PerformanceMonitorProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<LoadTestResult | null>(null);
  const [virtualScrollResults, setVirtualScrollResults] = useState<any>(null);
  const [queryCacheResults, setQueryCacheResults] = useState<any>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>({});

  
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      const metrics = performanceTester.getMetrics();
      setRealTimeMetrics(metrics);
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const runPerformanceTest = async () => {
    setIsRunning(true);
    try {
      
      const testResults = await performanceTester.runPerformanceTest();
      setResults(testResults);

      
      const virtualResults = await performanceTester.testVirtualScrolling(1000);
      setVirtualScrollResults(virtualResults);

      
      const cacheResults = await performanceTester.testQueryCaching(100);
      setQueryCacheResults(cacheResults);

    } catch (error) {
      console.error('Performance test failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadReport = () => {
    if (!results || !virtualScrollResults || !queryCacheResults) return;

    const report = generatePerformanceReport(results, virtualScrollResults, queryCacheResults);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 90) return 'default';
    if (score >= 75) return 'secondary';
    return 'destructive';
  };

  if (!isVisible) return null;

  const scores = results ? calculatePerformanceScore(results) : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Performance Monitor
            </CardTitle>
            <CardDescription>
              Real-time performance metrics and comprehensive testing
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={runPerformanceTest}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              {isRunning ? 'Running Tests...' : 'Run Performance Test'}
            </Button>
            {results && (
              <Button
                onClick={downloadReport}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Report
              </Button>
            )}
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="realtime" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="realtime">Real-time</TabsTrigger>
              <TabsTrigger value="results">Test Results</TabsTrigger>
              <TabsTrigger value="virtual">Virtual Scrolling</TabsTrigger>
              <TabsTrigger value="caching">Query Caching</TabsTrigger>
            </TabsList>

            <TabsContent value="realtime" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      First Contentful Paint
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {realTimeMetrics.fcp ? `${realTimeMetrics.fcp.toFixed(0)}ms` : 'Measuring...'}
                    </div>
                    <Badge variant={realTimeMetrics.fcp && realTimeMetrics.fcp <= 1800 ? 'default' : 'destructive'}>
                      {realTimeMetrics.fcp && realTimeMetrics.fcp <= 1800 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Largest Contentful Paint
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {realTimeMetrics.lcp ? `${realTimeMetrics.lcp.toFixed(0)}ms` : 'Measuring...'}
                    </div>
                    <Badge variant={realTimeMetrics.lcp && realTimeMetrics.lcp <= 2500 ? 'default' : 'destructive'}>
                      {realTimeMetrics.lcp && realTimeMetrics.lcp <= 2500 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Cumulative Layout Shift</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {realTimeMetrics.cls ? realTimeMetrics.cls.toFixed(3) : 'Measuring...'}
                    </div>
                    <Badge variant={realTimeMetrics.cls && realTimeMetrics.cls <= 0.1 ? 'default' : 'destructive'}>
                      {realTimeMetrics.cls && realTimeMetrics.cls <= 0.1 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {isRunning && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Running comprehensive performance tests...</p>
                </div>
              )}

              {scores && results && (
                <div className="space-y-6">
                  {}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{scores.performance}</div>
                        <Progress value={scores.performance} className="mt-2" />
                        <Badge variant={getScoreBadgeVariant(scores.performance)} className="mt-2">
                          {scores.performance >= 90 ? 'Excellent' : scores.performance >= 75 ? 'Good' : 'Poor'}
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Accessibility</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{scores.accessibility}</div>
                        <Progress value={scores.accessibility} className="mt-2" />
                        <Badge variant={getScoreBadgeVariant(scores.accessibility)} className="mt-2">
                          {scores.accessibility >= 95 ? 'Excellent' : 'Good'}
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Best Practices</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{scores.bestPractices}</div>
                        <Progress value={scores.bestPractices} className="mt-2" />
                        <Badge variant={getScoreBadgeVariant(scores.bestPractices)} className="mt-2">
                          {scores.bestPractices >= 80 ? 'Good' : 'Poor'}
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">SEO</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{scores.seo}</div>
                        <Progress value={scores.seo} className="mt-2" />
                        <Badge variant={getScoreBadgeVariant(scores.seo)} className="mt-2">
                          Good
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Overall</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{scores.overall}</div>
                        <Progress value={scores.overall} className="mt-2" />
                        <Badge variant={getScoreBadgeVariant(scores.overall)} className="mt-2">
                          {scores.overall >= 90 ? 'Excellent' : scores.overall >= 75 ? 'Good' : 'Poor'}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>

                  {}
                  <Card>
                    <CardHeader>
                      <CardTitle>Core Web Vitals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">First Contentful Paint</div>
                          <div className="text-2xl font-bold">{results.firstContentfulPaint.toFixed(0)}ms</div>
                          <div className="text-sm text-muted-foreground">Target: &lt; 1.8s</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Largest Contentful Paint</div>
                          <div className="text-2xl font-bold">{results.largestContentfulPaint.toFixed(0)}ms</div>
                          <div className="text-sm text-muted-foreground">Target: &lt; 2.5s</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Time to Interactive</div>
                          <div className="text-2xl font-bold">{results.timeToInteractive.toFixed(0)}ms</div>
                          <div className="text-sm text-muted-foreground">Target: &lt; 3.8s</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {}
                  <Card>
                    <CardHeader>
                      <CardTitle>Bundle Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Bundle Size</div>
                          <div className="text-2xl font-bold">{(results.bundleSize / 1024).toFixed(0)} KB</div>
                          <div className="text-sm text-muted-foreground">Target: &lt; 500 KB</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Resource Count</div>
                          <div className="text-2xl font-bold">{results.resourceCount}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
                          <div className="text-2xl font-bold">{(results.cacheHitRate * 100).toFixed(1)}%</div>
                          <div className="text-sm text-muted-foreground">Target: &gt; 80%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="virtual" className="space-y-4">
              {virtualScrollResults && (
                <Card>
                  <CardHeader>
                    <CardTitle>Virtual Scrolling Performance (1000 items)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Render Time</div>
                        <div className="text-2xl font-bold">{virtualScrollResults.renderTime.toFixed(2)}ms</div>
                        <Badge variant={virtualScrollResults.renderTime <= 100 ? 'default' : 'destructive'}>
                          {virtualScrollResults.renderTime <= 100 ? 'Excellent' : 'Needs Optimization'}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Scroll Performance</div>
                        <div className="text-2xl font-bold">{virtualScrollResults.scrollPerformance.toFixed(2)}ms</div>
                        <Badge variant={virtualScrollResults.scrollPerformance <= 200 ? 'default' : 'destructive'}>
                          {virtualScrollResults.scrollPerformance <= 200 ? 'Smooth' : 'Needs Optimization'}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Memory Usage</div>
                        <div className="text-2xl font-bold">
                          {(virtualScrollResults.memoryUsage / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="caching" className="space-y-4">
              {queryCacheResults && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      TanStack Query Caching (100 queries)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
                        <div className="text-2xl font-bold">{(queryCacheResults.cacheHitRate * 100).toFixed(1)}%</div>
                        <Badge variant={queryCacheResults.cacheHitRate >= 0.7 ? 'default' : 'destructive'}>
                          {queryCacheResults.cacheHitRate >= 0.7 ? 'Efficient' : 'Needs Optimization'}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Average Query Time</div>
                        <div className="text-2xl font-bold">{queryCacheResults.averageQueryTime.toFixed(2)}ms</div>
                        <Badge variant={queryCacheResults.averageQueryTime <= 50 ? 'default' : 'secondary'}>
                          {queryCacheResults.averageQueryTime <= 50 ? 'Fast' : 'Acceptable'}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Memory Usage</div>
                        <div className="text-2xl font-bold">
                          {(queryCacheResults.memoryUsage / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
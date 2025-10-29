import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { 
  Activity, 
  Zap, 
  Database, 
  Gauge, 
  Download, 
  Clock,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface DevPerformancePanelProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export function DevPerformancePanel({ isVisible = false, onClose }: DevPerformancePanelProps) {
  const {
    metrics,
    testResults,
    performanceScore,
    isLoading,
    runComprehensiveTest,
    testVirtualScrollingPerformance,
    testQueryCachingEfficiency,
    measureLargeDatasetPerformance,
  } = usePerformanceMonitor({ enableLogging: true });

  const [customTestResults, setCustomTestResults] = useState<any>({});
  const [isRunningCustomTests, setIsRunningCustomTests] = useState(false);

  
  const [realtimeStats, setRealtimeStats] = useState({
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
  });

  useEffect(() => {
    if (!isVisible) return;

    
    const updateNetworkInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setRealtimeStats({
          connectionType: connection.type || 'unknown',
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
        });
      }
    };

    updateNetworkInfo();
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', updateNetworkInfo);
      
      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }
  }, [isVisible]);

  const runCustomTests = async () => {
    setIsRunningCustomTests(true);
    try {
      
      const virtualScrollTests = await Promise.all([
        testVirtualScrollingPerformance(100),
        testVirtualScrollingPerformance(500),
        testVirtualScrollingPerformance(1000),
        testVirtualScrollingPerformance(5000),
      ]);

      
      const queryCacheTests = await Promise.all([
        testQueryCachingEfficiency(10),
        testQueryCachingEfficiency(50),
        testQueryCachingEfficiency(100),
        testQueryCachingEfficiency(500),
      ]);

      
      const datasetTests = await Promise.all([
        measureLargeDatasetPerformance(100),
        measureLargeDatasetPerformance(500),
        measureLargeDatasetPerformance(1000),
        measureLargeDatasetPerformance(5000),
      ]);

      setCustomTestResults({
        virtualScrollTests,
        queryCacheTests,
        datasetTests,
      });
    } catch (error) {
      console.error('Custom tests failed:', error);
    } finally {
      setIsRunningCustomTests(false);
    }
  };

  const getMetricStatus = (value: number | null, thresholds: { good: number; poor: number }, reverse = false) => {
    if (value === null) return { status: 'unknown', color: 'gray' };
    
    const isGood = reverse ? value <= thresholds.good : value >= thresholds.good;
    const isPoor = reverse ? value >= thresholds.poor : value <= thresholds.poor;
    
    if (isGood) return { status: 'good', color: 'green' };
    if (isPoor) return { status: 'poor', color: 'red' };
    return { status: 'needs-improvement', color: 'yellow' };
  };

  const downloadDetailedReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      testResults,
      customTestResults,
      realtimeStats,
      performanceScore,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      memory: 'memory' in performance ? (performance as any).memory : null,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Development Performance Panel
            </CardTitle>
            <CardDescription>
              Real-time performance monitoring and comprehensive testing
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={runComprehensiveTest}
              disabled={testResults.isRunning}
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              {testResults.isRunning ? 'Running Tests...' : 'Run Full Test Suite'}
            </Button>
            <Button
              onClick={downloadDetailedReport}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="realtime" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="realtime">Real-time</TabsTrigger>
              <TabsTrigger value="core-vitals">Core Vitals</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="custom-tests">Custom Tests</TabsTrigger>
              <TabsTrigger value="system">System Info</TabsTrigger>
            </TabsList>

            <TabsContent value="realtime" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      Frame Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics.frameRate ? `${metrics.frameRate} FPS` : 'Measuring...'}
                    </div>
                    <Badge variant={metrics.frameRate && metrics.frameRate >= 55 ? 'default' : 'destructive'}>
                      {metrics.frameRate && metrics.frameRate >= 55 ? 'Smooth' : 'Needs Optimization'}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <HardDrive className="h-4 w-4" />
                      Memory Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics.memoryUsage ? `${metrics.memoryUsage.toFixed(1)} MB` : 'Measuring...'}
                    </div>
                    <Badge variant={metrics.memoryUsage && metrics.memoryUsage <= 100 ? 'default' : 'secondary'}>
                      {metrics.memoryUsage && metrics.memoryUsage <= 100 ? 'Efficient' : 'High Usage'}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Wifi className="h-4 w-4" />
                      Network
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium">
                      {realtimeStats.effectiveType.toUpperCase()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {realtimeStats.downlink > 0 && `${realtimeStats.downlink} Mbps`}
                      {realtimeStats.rtt > 0 && ` • ${realtimeStats.rtt}ms RTT`}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Gauge className="h-4 w-4" />
                      Performance Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{performanceScore}</div>
                    <Progress value={performanceScore} className="mt-2" />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="core-vitals" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { key: 'fcp', label: 'First Contentful Paint', icon: Zap, thresholds: { good: 1800, poor: 3000 }, unit: 'ms' },
                  { key: 'lcp', label: 'Largest Contentful Paint', icon: Clock, thresholds: { good: 2500, poor: 4000 }, unit: 'ms' },
                  { key: 'fid', label: 'First Input Delay', icon: Activity, thresholds: { good: 100, poor: 300 }, unit: 'ms' },
                  { key: 'cls', label: 'Cumulative Layout Shift', icon: AlertTriangle, thresholds: { good: 0.1, poor: 0.25 }, unit: '' },
                  { key: 'ttfb', label: 'Time to First Byte', icon: Database, thresholds: { good: 800, poor: 1800 }, unit: 'ms' },
                ].map(({ key, label, icon: Icon, thresholds, unit }) => {
                  const value = metrics[key as keyof typeof metrics] as number | null;
                  const status = getMetricStatus(value, thresholds, true);
                  
                  return (
                    <Card key={key}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {value !== null ? `${value.toFixed(key === 'cls' ? 3 : 0)}${unit}` : 'Measuring...'}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {status.status === 'good' && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {status.status === 'needs-improvement' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                          {status.status === 'poor' && <XCircle className="h-4 w-4 text-red-500" />}
                          <Badge variant={status.status === 'good' ? 'default' : status.status === 'poor' ? 'destructive' : 'secondary'}>
                            {status.status === 'good' ? 'Good' : status.status === 'poor' ? 'Poor' : 'Needs Improvement'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              {testResults.loadTest && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Load Test Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Load Time</div>
                          <div className="text-2xl font-bold">{testResults.loadTest.loadTime.toFixed(0)}ms</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Bundle Size</div>
                          <div className="text-2xl font-bold">{(testResults.loadTest.bundleSize / 1024).toFixed(0)} KB</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
                          <div className="text-2xl font-bold">{(testResults.loadTest.cacheHitRate * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {testResults.virtualScrollTest && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Virtual Scrolling Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Render Time</div>
                            <div className="text-2xl font-bold">{testResults.virtualScrollTest.renderTime.toFixed(2)}ms</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Scroll Performance</div>
                            <div className="text-2xl font-bold">{testResults.virtualScrollTest.scrollPerformance.toFixed(2)}ms</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Memory Usage</div>
                            <div className="text-2xl font-bold">
                              {(testResults.virtualScrollTest.memoryUsage / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="custom-tests" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Custom Performance Tests</h3>
                <Button
                  onClick={runCustomTests}
                  disabled={isRunningCustomTests}
                  className="flex items-center gap-2"
                >
                  <Activity className="h-4 w-4" />
                  {isRunningCustomTests ? 'Running...' : 'Run Custom Tests'}
                </Button>
              </div>

              {customTestResults.virtualScrollTests && (
                <Card>
                  <CardHeader>
                    <CardTitle>Virtual Scrolling Scalability</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {customTestResults.virtualScrollTests.map((test: any, index: number) => {
                        const itemCounts = [100, 500, 1000, 5000];
                        return (
                          <div key={index} className="flex justify-between items-center">
                            <span>{itemCounts[index]} items</span>
                            <div className="flex gap-4 text-sm">
                              <span>Render: {test.renderTime.toFixed(2)}ms</span>
                              <span>Scroll: {test.scrollPerformance.toFixed(2)}ms</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {customTestResults.datasetTests && (
                <Card>
                  <CardHeader>
                    <CardTitle>Large Dataset Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {customTestResults.datasetTests.map((test: any, index: number) => {
                        const dataSizes = [100, 500, 1000, 5000];
                        return (
                          <div key={index} className="flex justify-between items-center">
                            <span>{dataSizes[index]} items</span>
                            <div className="flex gap-4 text-sm">
                              <span>Filter: {test.filterTime.toFixed(2)}ms</span>
                              <span>Sort: {test.sortTime.toFixed(2)}ms</span>
                              <span>Search: {test.searchTime.toFixed(2)}ms</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Browser Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">User Agent:</span>
                      <div className="text-sm font-mono break-all">{navigator.userAgent}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Viewport:</span>
                      <div className="text-sm">{window.innerWidth} × {window.innerHeight}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Device Pixel Ratio:</span>
                      <div className="text-sm">{window.devicePixelRatio}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance API Support</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Performance Observer</span>
                      <Badge variant={'PerformanceObserver' in window ? 'default' : 'destructive'}>
                        {'PerformanceObserver' in window ? 'Supported' : 'Not Supported'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Memory API</span>
                      <Badge variant={'memory' in performance ? 'default' : 'destructive'}>
                        {'memory' in performance ? 'Supported' : 'Not Supported'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Network Information</span>
                      <Badge variant={'connection' in navigator ? 'default' : 'destructive'}>
                        {'connection' in navigator ? 'Supported' : 'Not Supported'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
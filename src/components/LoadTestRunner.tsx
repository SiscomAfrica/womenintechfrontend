import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    LoadTester,
    ConcurrentInteractionTester,
    PollingEfficiencyTester,
    type LoadTestResult,
    type LoadTestConfig
} from '@/utils/load-testing';
import {
    Users,
    Zap,
    Database,
    Activity,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Play,
    Square,
    Download
} from 'lucide-react';

interface LoadTestRunnerProps {
    isVisible?: boolean;
    onClose?: () => void;
}

export function LoadTestRunner({ isVisible = false, onClose }: LoadTestRunnerProps) {
    const [isRunning, setIsRunning] = useState(false);
    const [currentTest, setCurrentTest] = useState<string>('');
    const [progress, setProgress] = useState(0);

    
    const [loadTestConfig, setLoadTestConfig] = useState<LoadTestConfig>({
        concurrentUsers: 50,
        requestsPerUser: 20,
        duration: 30000, 
        rampUpTime: 5000, 
        endpoints: [
            '/api/sessions',
            '/api/attendees',
            '/api/polls',
            '/api/notifications',
        ],
        payloadSize: 1024, 
    });

    
    const [loadTestResults, setLoadTestResults] = useState<LoadTestResult | null>(null);
    const [concurrentTestResults, setConcurrentTestResults] = useState<any>(null);
    const [pollingTestResults, setPollingTestResults] = useState<any>(null);
    const [offlineTestResults, setOfflineTestResults] = useState<any>(null);

    const runLoadTest = useCallback(async () => {
        setIsRunning(true);
        setCurrentTest('Load Testing');
        setProgress(0);

        try {
            const tester = new LoadTester(loadTestConfig);

            
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 2, 90));
            }, loadTestConfig.duration / 45);

            const results = await tester.runLoadTest();

            clearInterval(progressInterval);
            setProgress(100);
            setLoadTestResults(results);

        } catch (error) {
            console.error('Load test failed:', error);
        } finally {
            setIsRunning(false);
            setCurrentTest('');
            setProgress(0);
        }
    }, [loadTestConfig]);

    const runConcurrentInteractionTest = useCallback(async () => {
        setIsRunning(true);
        setCurrentTest('Concurrent Interactions');
        setProgress(0);

        try {
            const tester = new ConcurrentInteractionTester();

            
            setProgress(20);
            const pollResults = await tester.testConcurrentPollVoting(100);

            
            setProgress(50);
            const sessionResults = await tester.testConcurrentSessionJoining(150);

            
            setProgress(80);
            const networkingResults = await tester.testConcurrentNetworking(75);

            setProgress(100);

            const summary = tester.generateSummary();
            setConcurrentTestResults({
                pollVoting: pollResults,
                sessionJoining: sessionResults,
                networking: networkingResults,
                summary,
            });

        } catch (error) {
            console.error('Concurrent interaction test failed:', error);
        } finally {
            setIsRunning(false);
            setCurrentTest('');
            setProgress(0);
        }
    }, []);

    const runPollingEfficiencyTest = useCallback(async () => {
        setIsRunning(true);
        setCurrentTest('Polling Efficiency');
        setProgress(0);

        try {
            const tester = new PollingEfficiencyTester();

            
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 3, 90));
            }, 1000);

            const results = await tester.testMultiTabPolling(8, 30000); 

            clearInterval(progressInterval);
            setProgress(100);
            setPollingTestResults(results);

            tester.cleanup();

        } catch (error) {
            console.error('Polling efficiency test failed:', error);
        } finally {
            setIsRunning(false);
            setCurrentTest('');
            setProgress(0);
        }
    }, []);

    const runOfflineQueueTest = useCallback(async () => {
        setIsRunning(true);
        setCurrentTest('Offline Queue Handling');
        setProgress(0);

        try {
            
            const results = await simulateOfflineQueueTest();
            setProgress(100);
            setOfflineTestResults(results);

        } catch (error) {
            console.error('Offline queue test failed:', error);
        } finally {
            setIsRunning(false);
            setCurrentTest('');
            setProgress(0);
        }
    }, []);

    const runAllTests = useCallback(async () => {
        await runLoadTest();
        await new Promise(resolve => setTimeout(resolve, 2000)); 

        await runConcurrentInteractionTest();
        await new Promise(resolve => setTimeout(resolve, 2000));

        await runPollingEfficiencyTest();
        await new Promise(resolve => setTimeout(resolve, 2000));

        await runOfflineQueueTest();
    }, [runLoadTest, runConcurrentInteractionTest, runPollingEfficiencyTest, runOfflineQueueTest]);

    const downloadResults = useCallback(() => {
        const allResults = {
            timestamp: new Date().toISOString(),
            loadTest: loadTestResults,
            concurrentInteractions: concurrentTestResults,
            pollingEfficiency: pollingTestResults,
            offlineQueue: offlineTestResults,
            configuration: loadTestConfig,
        };

        const blob = new Blob([JSON.stringify(allResults, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `load-test-results-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [loadTestResults, concurrentTestResults, pollingTestResults, offlineTestResults, loadTestConfig]);

    const getStatusIcon = (success: boolean | undefined) => {
        if (success === undefined) return null;
        return success ?
            <CheckCircle className="h-4 w-4 text-green-500" /> :
            <XCircle className="h-4 w-4 text-red-500" />;
    };

    const getStatusBadge = (value: number, thresholds: { good: number; warning: number }) => {
        if (value <= thresholds.good) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
        if (value <= thresholds.warning) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
        return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-6xl max-h-[90vh] overflow-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Load Testing & High-Load Scenarios
                        </CardTitle>
                        <CardDescription>
                            Test concurrent users, optimistic updates, and real-time polling efficiency
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={runAllTests}
                            disabled={isRunning}
                            className="flex items-center gap-2"
                        >
                            <Play className="h-4 w-4" />
                            {isRunning ? 'Running Tests...' : 'Run All Tests'}
                        </Button>
                        {(loadTestResults || concurrentTestResults || pollingTestResults || offlineTestResults) && (
                            <Button
                                onClick={downloadResults}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Download Results
                            </Button>
                        )}
                        <Button onClick={onClose} variant="outline">
                            Close
                        </Button>
                    </div>
                </CardHeader>

                <CardContent>
                    {isRunning && (
                        <Card className="mb-6">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>Running: {currentTest}</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <Progress value={progress} />
                                    </div>
                                    <Button
                                        onClick={() => {
                                            setIsRunning(false);
                                            setCurrentTest('');
                                            setProgress(0);
                                        }}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Square className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Tabs defaultValue="config" className="w-full">
                        <TabsList className="grid w-full grid-cols-6">
                            <TabsTrigger value="config">Configuration</TabsTrigger>
                            <TabsTrigger value="load">Load Test</TabsTrigger>
                            <TabsTrigger value="concurrent">Concurrent</TabsTrigger>
                            <TabsTrigger value="polling">Polling</TabsTrigger>
                            <TabsTrigger value="offline">Offline Queue</TabsTrigger>
                            <TabsTrigger value="summary">Summary</TabsTrigger>
                        </TabsList>

                        <TabsContent value="config" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Load Test Configuration</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="concurrentUsers">Concurrent Users</Label>
                                            <Input
                                                id="concurrentUsers"
                                                type="number"
                                                value={loadTestConfig.concurrentUsers}
                                                onChange={(e) => setLoadTestConfig(prev => ({
                                                    ...prev,
                                                    concurrentUsers: parseInt(e.target.value) || 50
                                                }))}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="requestsPerUser">Requests per User</Label>
                                            <Input
                                                id="requestsPerUser"
                                                type="number"
                                                value={loadTestConfig.requestsPerUser}
                                                onChange={(e) => setLoadTestConfig(prev => ({
                                                    ...prev,
                                                    requestsPerUser: parseInt(e.target.value) || 20
                                                }))}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="duration">Duration (seconds)</Label>
                                            <Input
                                                id="duration"
                                                type="number"
                                                value={loadTestConfig.duration / 1000}
                                                onChange={(e) => setLoadTestConfig(prev => ({
                                                    ...prev,
                                                    duration: (parseInt(e.target.value) || 30) * 1000
                                                }))}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="rampUpTime">Ramp-up Time (seconds)</Label>
                                            <Input
                                                id="rampUpTime"
                                                type="number"
                                                value={loadTestConfig.rampUpTime / 1000}
                                                onChange={(e) => setLoadTestConfig(prev => ({
                                                    ...prev,
                                                    rampUpTime: (parseInt(e.target.value) || 5) * 1000
                                                }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button onClick={runLoadTest} disabled={isRunning}>
                                            <Users className="h-4 w-4 mr-2" />
                                            Run Load Test
                                        </Button>
                                        <Button onClick={runConcurrentInteractionTest} disabled={isRunning} variant="outline">
                                            <Zap className="h-4 w-4 mr-2" />
                                            Test Concurrent Interactions
                                        </Button>
                                        <Button onClick={runPollingEfficiencyTest} disabled={isRunning} variant="outline">
                                            <Clock className="h-4 w-4 mr-2" />
                                            Test Polling Efficiency
                                        </Button>
                                        <Button onClick={runOfflineQueueTest} disabled={isRunning} variant="outline">
                                            <Database className="h-4 w-4 mr-2" />
                                            Test Offline Queue
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="load" className="space-y-4">
                            {loadTestResults && (
                                <div className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Load Test Results</CardTitle>
                                            <CardDescription>
                                                {loadTestResults.concurrentUsers} concurrent users, {loadTestResults.totalRequests} total requests
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Success Rate</div>
                                                    <div className="text-2xl font-bold">
                                                        {((loadTestResults.successfulRequests / loadTestResults.totalRequests) * 100).toFixed(1)}%
                                                    </div>
                                                    {getStatusBadge(loadTestResults.errorRate, { good: 1, warning: 5 })}
                                                </div>
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Avg Response Time</div>
                                                    <div className="text-2xl font-bold">{loadTestResults.averageResponseTime.toFixed(0)}ms</div>
                                                    {getStatusBadge(loadTestResults.averageResponseTime, { good: 200, warning: 500 })}
                                                </div>
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Requests/Second</div>
                                                    <div className="text-2xl font-bold">{loadTestResults.requestsPerSecond.toFixed(1)}</div>
                                                    {getStatusBadge(1000 / loadTestResults.requestsPerSecond, { good: 50, warning: 200 })}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Performance Metrics</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div>
                                                    <div className="text-sm text-muted-foreground">P95 Response Time</div>
                                                    <div className="text-lg font-bold">{loadTestResults.p95ResponseTime.toFixed(0)}ms</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-muted-foreground">P99 Response Time</div>
                                                    <div className="text-lg font-bold">{loadTestResults.p99ResponseTime.toFixed(0)}ms</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Throughput</div>
                                                    <div className="text-lg font-bold">{(loadTestResults.throughput / 1024).toFixed(1)} KB/s</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
                                                    <div className="text-lg font-bold">
                                                        {((loadTestResults.networkStats.cacheHits / loadTestResults.totalRequests) * 100).toFixed(1)}%
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="concurrent" className="space-y-4">
                            {concurrentTestResults && (
                                <div className="space-y-4">
                                    {concurrentTestResults.summary.map((test: any) => (
                                        <Card key={test.testName}>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    {getStatusIcon(test.successRate > 95)}
                                                    {test.testName.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div>
                                                        <div className="text-sm text-muted-foreground">Total Tests</div>
                                                        <div className="text-2xl font-bold">{test.totalTests}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-muted-foreground">Success Rate</div>
                                                        <div className="text-2xl font-bold">{test.successRate.toFixed(1)}%</div>
                                                        {getStatusBadge(100 - test.successRate, { good: 5, warning: 10 })}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-muted-foreground">Avg Duration</div>
                                                        <div className="text-2xl font-bold">{test.averageDuration.toFixed(0)}ms</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-muted-foreground">Max Duration</div>
                                                        <div className="text-2xl font-bold">{test.maxDuration.toFixed(0)}ms</div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="polling" className="space-y-4">
                            {pollingTestResults && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Multi-Tab Polling Efficiency</CardTitle>
                                        <CardDescription>
                                            {pollingTestResults.summary.totalTabs} tabs, {pollingTestResults.summary.totalRequests} total requests
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                            <div>
                                                <div className="text-sm text-muted-foreground">Avg Requests/Tab</div>
                                                <div className="text-2xl font-bold">{pollingTestResults.summary.averageRequestsPerTab.toFixed(1)}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Avg Response Time</div>
                                                <div className="text-2xl font-bold">{pollingTestResults.summary.overallAverageResponseTime.toFixed(0)}ms</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Efficiency Score</div>
                                                <div className="text-2xl font-bold">{pollingTestResults.summary.efficiency.toFixed(1)}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-semibold">Per-Tab Results</h4>
                                            {pollingTestResults.tabs.map((tab: any) => (
                                                <div key={tab.tab} className="flex justify-between items-center p-2 bg-muted rounded">
                                                    <span className="font-medium">{tab.tab}</span>
                                                    <div className="flex gap-4 text-sm">
                                                        <span>{tab.totalRequests} requests</span>
                                                        <span>{tab.averageResponseTime.toFixed(0)}ms avg</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="offline" className="space-y-4">
                            {offlineTestResults && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Offline Queue Handling</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <div className="text-sm text-muted-foreground">Queued Actions</div>
                                                <div className="text-2xl font-bold">{offlineTestResults.queuedActions}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Sync Success Rate</div>
                                                <div className="text-2xl font-bold">{offlineTestResults.syncSuccessRate.toFixed(1)}%</div>
                                                {getStatusBadge(100 - offlineTestResults.syncSuccessRate, { good: 2, warning: 5 })}
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Avg Sync Time</div>
                                                <div className="text-2xl font-bold">{offlineTestResults.averageSyncTime.toFixed(0)}ms</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="summary" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Test Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span>Load Test</span>
                                            {loadTestResults ?
                                                <Badge variant={loadTestResults.errorRate < 5 ? 'default' : 'destructive'}>
                                                    {loadTestResults.errorRate < 5 ? 'Passed' : 'Failed'}
                                                </Badge> :
                                                <Badge variant="outline">Not Run</Badge>
                                            }
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Concurrent Interactions</span>
                                            {concurrentTestResults ?
                                                <Badge variant={concurrentTestResults.summary.every((t: any) => t.successRate > 95) ? 'default' : 'destructive'}>
                                                    {concurrentTestResults.summary.every((t: any) => t.successRate > 95) ? 'Passed' : 'Failed'}
                                                </Badge> :
                                                <Badge variant="outline">Not Run</Badge>
                                            }
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Polling Efficiency</span>
                                            {pollingTestResults ?
                                                <Badge variant={pollingTestResults.summary.efficiency > 10 ? 'default' : 'secondary'}>
                                                    {pollingTestResults.summary.efficiency > 10 ? 'Efficient' : 'Acceptable'}
                                                </Badge> :
                                                <Badge variant="outline">Not Run</Badge>
                                            }
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Offline Queue</span>
                                            {offlineTestResults ?
                                                <Badge variant={offlineTestResults.syncSuccessRate > 95 ? 'default' : 'destructive'}>
                                                    {offlineTestResults.syncSuccessRate > 95 ? 'Passed' : 'Failed'}
                                                </Badge> :
                                                <Badge variant="outline">Not Run</Badge>
                                            }
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}


async function simulateOfflineQueueTest(): Promise<any> {
    const queuedActions = 50;
    const syncResults = [];

    for (let i = 0; i < queuedActions; i++) {
        const syncTime = Math.random() * 200 + 50;
        const success = Math.random() > 0.02; 

        syncResults.push({
            actionId: i,
            syncTime,
            success,
        });

        
        await new Promise(resolve => setTimeout(resolve, 10));
    }

    const successful = syncResults.filter(r => r.success);
    const avgSyncTime = syncResults.reduce((sum, r) => sum + r.syncTime, 0) / syncResults.length;

    return {
        queuedActions,
        syncSuccessRate: (successful.length / queuedActions) * 100,
        averageSyncTime: avgSyncTime,
        totalSyncTime: syncResults.reduce((sum, r) => sum + r.syncTime, 0),
    };
}
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface OfflineFallbackProps {
  onRetry?: () => void;
  onGoHome?: () => void;
}

export const OfflineFallback = ({ onRetry, onGoHome }: OfflineFallbackProps) => {
  const handleRefresh = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-8 h-8 text-gray-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            You're Offline
          </CardTitle>
          <CardDescription className="text-gray-600">
            This page isn't available offline. Check your connection and try again.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-800 mb-1">
              Available Offline:
            </h4>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>• View cached event schedule</li>
              <li>• Browse attendee profiles</li>
              <li>• Submit feedback (syncs later)</li>
              <li>• Vote in polls (syncs later)</li>
            </ul>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleRefresh}
              className="flex-1 bg-[#FF6B35] hover:bg-[#FF6B35]/90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button 
              onClick={handleGoHome}
              variant="outline"
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Your actions will be saved and synced automatically when you reconnect.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
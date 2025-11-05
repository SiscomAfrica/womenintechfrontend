import React, { Component, type ReactNode } from 'react';
import { OfflineFallback } from './OfflineFallback';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  isNetworkError: boolean;
}

export class OfflineErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isNetworkError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    
    const isNetworkError = 
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('offline') ||
      !navigator.onLine;

    return {
      hasError: true,
      isNetworkError,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('OfflineErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, isNetworkError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.state.isNetworkError || !navigator.onLine) {
        return (
          <OfflineFallback 
            onRetry={this.handleRetry}
          />
        );
      }

      
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-gradient-to-br from-purple-900/85 via-indigo-900/80 to-pink-900/85 text-white rounded-lg hover:from-purple-800/90 hover:via-indigo-800/85 hover:to-pink-800/90"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
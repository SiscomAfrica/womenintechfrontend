import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor"
import { useAccessibility } from "@/hooks/useAccessibility"
import { useAccessibilityTesting } from "@/utils/accessibility-testing"
import { SkipLinks } from "@/components/ui/accessible-navigation"

function App() {
  const { metrics, performanceScore, isLoading } = usePerformanceMonitor({
    enableLogging: process.env.NODE_ENV === 'development',
    enableReporting: false, 
  })

  const { announcementRef } = useAccessibility({
    enableFocusManagement: true,
    enableKeyboardNavigation: true,
    enableScreenReaderSupport: true,
  })

  const accessibilityReport = useAccessibilityTesting(process.env.NODE_ENV === 'development')

  return (
    <>
      <SkipLinks 
        links={[
          { href: "#main-content", label: "Skip to main content" },
          { href: "#navigation", label: "Skip to navigation" }
        ]} 
      />
      
      <div 
        className="flex min-h-screen flex-col items-center justify-center p-4"
        role="main"
        id="main-content"
        tabIndex={-1}
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-heading-lg">Event Networking Web App</CardTitle>
            <CardDescription>
              Modern React web application with Vite, TypeScript, and Shadcn UI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground" role="list">
              <div role="listitem">✅ Vite + React + TypeScript</div>
              <div role="listitem">✅ Shadcn UI + Tailwind CSS</div>
              <div role="listitem">✅ TanStack Query</div>
              <div role="listitem">✅ React Router</div>
              <div role="listitem">✅ Zustand + React Hook Form</div>
              <div role="listitem">✅ Lucide React Icons</div>
              <div role="listitem">✅ Performance Optimization</div>
              <div role="listitem">✅ Virtual Scrolling</div>
              <div role="listitem">✅ Image Optimization</div>
              <div role="listitem">✅ Accessibility Features</div>
              <div role="listitem">✅ WCAG 2.1 AA Compliance</div>
            </div>
            
            {process.env.NODE_ENV === 'development' && !isLoading && (
              <div className="text-xs text-muted-foreground border-t pt-2" role="region" aria-label="Development metrics">
                <div>Performance Score: {performanceScore}/100</div>
                {metrics.fcp && <div>FCP: {Math.round(metrics.fcp)}ms</div>}
                {metrics.lcp && <div>LCP: {Math.round(metrics.lcp)}ms</div>}
                {metrics.memoryUsage && <div>Memory: {Math.round(metrics.memoryUsage)}MB</div>}
                {accessibilityReport && (
                  <div>Accessibility Score: {accessibilityReport.score}/100</div>
                )}
              </div>
            )}
            
            <Button 
              className="w-full"
              aria-describedby="get-started-description"
            >
              Get Started
            </Button>
            <div id="get-started-description" className="sr-only">
              Navigate to the main application dashboard
            </div>
          </CardContent>
        </Card>
        
        {}
        <div ref={announcementRef} />
      </div>
    </>
  )
}

export default App

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Wifi, WifiOff, RefreshCw, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RealTimeStatus {
  isConnected: boolean
  lastUpdate: Date | null
  updateCount: number
}

interface RealTimeIndicatorProps {
  status: RealTimeStatus
  onForceUpdate?: () => void
  className?: string
  showDetails?: boolean
}

const RealTimeIndicator: React.FC<RealTimeIndicatorProps> = ({
  status,
  onForceUpdate,
  className,
  showDetails = true
}) => {
  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Never'
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    
    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else {
      return date.toLocaleTimeString()
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Connection Status Badge */}
      <Badge 
        variant={status.isConnected ? "default" : "destructive"}
        className={cn(
          "flex items-center gap-1 text-xs",
          status.isConnected 
            ? "bg-green-100 text-green-800 border-green-200" 
            : "bg-red-100 text-red-800 border-red-200"
        )}
      >
        {status.isConnected ? (
          <Wifi className="w-3 h-3" />
        ) : (
          <WifiOff className="w-3 h-3" />
        )}
        {status.isConnected ? 'Live' : 'Offline'}
      </Badge>

      {/* Update Details */}
      {showDetails && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatLastUpdate(status.lastUpdate)}</span>
          </div>
          
          {status.updateCount > 0 && (
            <span className="text-gray-400">
              ({status.updateCount} updates)
            </span>
          )}
        </div>
      )}

      {/* Force Update Button */}
      {onForceUpdate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onForceUpdate}
          className="h-6 px-2 text-xs"
          disabled={!status.isConnected}
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Refresh
        </Button>
      )}
    </div>
  )
}

export default RealTimeIndicator

import { SessionCard, SessionCardSkeleton } from './SessionCard'
import { Button } from '@/components/ui/button'
import { useSessions } from '@/hooks/useSessions'
import { type SessionFilters } from '@/services/sessions'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SessionsListProps {
  filters?: SessionFilters
  onSessionDetails?: (sessionId: string) => void
  className?: string
  enableInfiniteScroll?: boolean
}

export function SessionsList({ 
  filters = {}, 
  onSessionDetails, 
  className,
  enableInfiniteScroll = true // eslint-disable-line @typescript-eslint/no-unused-vars 
}: SessionsListProps) {
  const {
    data: sessions,
    error,
    isLoading,
    isError,
    refetch,
    isRefetching
  } = useSessions(filters)



  
  const sessionsList = (sessions as any)?.sessions ?? sessions ?? []
  const totalCount = (sessions as any)?.totalCount ?? sessionsList.length

  
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 6 }).map((_, index) => (
          <SessionCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  
  if (isError) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 space-y-4", className)}>
        <AlertCircle className="h-12 w-12 text-[#F38181]" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-[#333333]">Failed to load sessions</h3>
          <p className="text-[#666666] max-w-md">
            {error?.message || 'Something went wrong while loading the sessions. Please try again.'}
          </p>
        </div>
        <Button 
          onClick={() => refetch()} 
          disabled={isRefetching}
          className="bg-gradient-to-br from-purple-900/85 via-indigo-900/80 to-pink-900/85 hover:from-purple-800/90 hover:via-indigo-800/85 hover:to-pink-800/90"
        >
          {isRefetching ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </>
          )}
        </Button>
      </div>
    )
  }

  
  if (sessionsList.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 space-y-4", className)}>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-[#333333]">No sessions found</h3>
          <p className="text-[#666666] max-w-md">
            {Object.keys(filters).length > 0 
              ? 'Try adjusting your filters to see more sessions.'
              : 'There are no sessions available at the moment.'
            }
          </p>
        </div>
        {Object.keys(filters).length > 0 && (
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            className="border-[#E0E0E0] text-[#333333] hover:bg-[#F5F5F5]"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {}
      <div className="flex items-center justify-between">
        <p className="text-[14px] text-[#666666] font-medium">
          Showing {sessionsList.length} of {totalCount} sessions
        </p>
        {isRefetching && (
          <div className="flex items-center gap-2 text-[#666666]">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-[12px]">Updating...</span>
          </div>
        )}
      </div>

      {}
      <div className="space-y-3">
        {sessionsList.filter((session: any) => session && session.id).map((session: any, index: number) => (
          <SessionCard
            key={`${session.id}-${index}`}
            id={session.id}
            title={session.title}
            description={session.description}
            type={session.type}
            startTime={session.startTime}
            endTime={session.endTime}
            location={session.location}
            speaker={session.speaker}
            attendeeCount={session.attendeeCount}
            maxAttendees={session.maxAttendees}
            isAttending={session.isAttending}
            onViewDetails={onSessionDetails}
          />
        ))}
      </div>


    </div>
  )
}
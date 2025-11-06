import { useState, useMemo, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { AlertCircle, BarChart3, ChevronDown, ChevronUp } from 'lucide-react'
import { usePolls } from '@/hooks/usePolls'
import { PollCard } from '@/components/polls/PollCard'
import { PollResultsModal } from '@/components/polls/PollResultsModal'
import sessionsService from '@/services/sessions'
import type { Poll } from '@/types'
import { cn } from '@/lib/utils'

type FilterTab = 'all' | 'active' | 'ended'

interface SessionInfo {
  id: string
  title: string
  day?: number
}

export default function PollsPage() {
  const [selectedFilter, setSelectedFilter] = useState<FilterTab>('all')
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null)
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false)
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({})
  const [sessionsMap, setSessionsMap] = useState<Record<string, SessionInfo>>({})
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)

  // Fetch ALL polls for consistent counts
  const { data: allPollsData, isLoading: allPollsLoading, error: allPollsError, isFetching } = usePolls(undefined, undefined, 0, 100)
  
  const allPolls = allPollsData?.polls || []
  
  const shouldShowError = allPollsError && !allPolls.length && !isFetching
  
  const filteredPolls = useMemo(() => {
    if (selectedFilter === 'active') {
      return allPolls.filter(p => p.is_active)
    } else if (selectedFilter === 'ended') {
      return allPolls.filter(p => !p.is_active)
    }
    return allPolls
  }, [allPolls, selectedFilter])

  // Load session information
  useEffect(() => {
    const loadSessions = async () => {
      const sessionIds = [...new Set(allPolls.map(p => p.session_id))]
      if (sessionIds.length === 0) return
      
      setIsLoadingSessions(true)
      const sessions: Record<string, SessionInfo> = {}
      
      await Promise.all(
        sessionIds.map(async (sessionId) => {
          try {
            const session = await sessionsService.getSession(sessionId)
            sessions[sessionId] = {
              id: sessionId,
              title: session.title || 'Untitled Session',
              day: session.day
            }
          } catch (error) {
            sessions[sessionId] = {
              id: sessionId,
              title: 'Event Session',
            }
          }
        })
      )
      
      setSessionsMap(sessions)
      setIsLoadingSessions(false)
      
      // Auto-expand all sessions initially
      const expanded: Record<string, boolean> = {}
      sessionIds.forEach(id => {
        expanded[id] = true
      })
      setExpandedSessions(expanded)
    }
    
    if (allPolls.length > 0) {
      loadSessions()
    }
  }, [allPolls])

  const pollsBySession = useMemo(() => {
    const grouped: Record<string, Poll[]> = {}
    
    filteredPolls.forEach(poll => {
      const sessionId = poll.session_id || 'general'
      if (!grouped[sessionId]) {
        grouped[sessionId] = []
      }
      grouped[sessionId].push(poll)
    })
    
    return grouped
  }, [filteredPolls])

  const handleViewResults = (pollId: string) => {
    const poll = allPolls.find(p => p.id === pollId)
    if (poll) {
      setSelectedPoll(poll)
      setIsResultsModalOpen(true)
    }
  }

  const toggleSession = (sessionId: string) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }))
  }

  // Filter tabs with consistent counts
  const tabs: { value: FilterTab; label: string; count: number }[] = [
    { value: 'all', label: 'All Polls', count: allPolls.length },
    { value: 'active', label: 'Active', count: allPolls.filter(p => p.is_active).length },
    { value: 'ended', label: 'Ended', count: allPolls.filter(p => !p.is_active).length },
  ]

  // Show loading only on initial load, not on background refetches
  const isLoading = allPollsLoading && !allPolls.length
  const error = shouldShowError ? allPollsError : null

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 w-full">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Polls</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Share your opinion on event topics</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b w-full overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedFilter(tab.value)}
                className={cn(
                  "px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all flex-shrink-0",
                  selectedFilter === tab.value
                    ? "bg-[#60166b] text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn(
                    "ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold",
                    selectedFilter === tab.value
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 text-gray-600"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4 w-full">
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8 sm:py-12 px-4">
            <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Failed to load polls</h3>
            <p className="text-sm sm:text-base text-gray-600">{error.message}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredPolls.length === 0 && (
          <div className="text-center py-8 sm:py-12 px-4">
            <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {selectedFilter === 'active' && 'No active polls'}
              {selectedFilter === 'ended' && 'No ended polls'}
              {selectedFilter === 'all' && 'No polls available'}
            </h3>
            <p className="text-gray-600">
              {selectedFilter === 'active' && 'Check back later for new polls'}
              {selectedFilter === 'ended' && 'No polls have ended yet'}
              {selectedFilter === 'all' && 'Polls will appear here when available'}
            </p>
          </div>
        )}

        {/* Polls by Session */}
        {!isLoading && !error && filteredPolls.length > 0 && (
          <div className="space-y-4">
            {isLoadingSessions ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-3">
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-5 rounded" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-48 mb-1" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </Card>
                    {/* Poll Cards Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-0 md:pl-8">
                      <Skeleton className="h-64 w-full rounded-lg" />
                      <Skeleton className="h-64 w-full rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              Object.entries(pollsBySession).map(([sessionId, sessionPolls]) => {
                const isExpanded = expandedSessions[sessionId] !== false
                const sessionInfo = sessionsMap[sessionId]
                const sessionTitle = sessionInfo?.title || 'Loading...'
                
                return (
                  <div key={sessionId} className="space-y-3">
                    {/* Session Header - Collapsible */}
                    <Card 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => toggleSession(sessionId)}
                    >
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-gray-600" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                          <div>
                            {sessionInfo ? (
                              <>
                                <h3 className="text-base font-bold text-gray-900">
                                  {sessionTitle}
                                </h3>
                                {sessionInfo.day && (
                                  <p className="text-xs text-gray-500">
                                    Day {sessionInfo.day}
                                  </p>
                                )}
                              </>
                            ) : (
                              <Skeleton className="h-5 w-48" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">
                            {sessionPolls.length} {sessionPolls.length === 1 ? 'poll' : 'polls'}
                          </span>
                        </div>
                      </div>
                    </Card>

                    {/* Session Polls Grid */}
                    {isExpanded && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-0 md:pl-8">
                        {sessionPolls.map((poll) => (
                          <PollCard
                            key={poll.id}
                            poll={poll}
                            onViewResults={handleViewResults}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Results Modal */}
      <PollResultsModal
        poll={selectedPoll}
        isOpen={isResultsModalOpen}
        onClose={() => {
          setIsResultsModalOpen(false)
          setSelectedPoll(null)
        }}
      />
    </div>
  )
}

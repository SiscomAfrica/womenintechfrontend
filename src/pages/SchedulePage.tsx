import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Calendar, Clock, MapPin, Users as UsersIcon, Loader2, AlertTriangle } from "lucide-react"
import { useMySchedule } from "@/hooks/useSessions"
import { useLeaveSession } from "@/hooks/useAttendance"
import { useDebounce } from "@/hooks/useDebounce"
import { type SessionWithAttendance } from "@/services/sessions"
import { toast } from "sonner"

export default function SchedulePage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [sessionToLeave, setSessionToLeave] = useState<SessionWithAttendance | null>(null)
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const leaveSessionMutation = useLeaveSession()
  
  
  const { data: mySessions = [], isLoading } = useMySchedule()
  
  
  const filteredSessions = useMemo(() => {
    if (!debouncedSearchQuery) return mySessions
    
    const query = debouncedSearchQuery.toLowerCase()
    return mySessions.filter(session => {
      return (
        session.title.toLowerCase().includes(query) ||
        session.session_data?.description?.toLowerCase().includes(query) ||
        session.session_data?.speaker?.name?.toLowerCase().includes(query) ||
        session.session_data?.location?.toLowerCase().includes(query)
      )
    })
  }, [mySessions, debouncedSearchQuery])
  
  
  const { day1Sessions, day2Sessions } = useMemo(() => {
    const day1 = filteredSessions.filter(s => s.day === 1)
    const day2 = filteredSessions.filter(s => s.day === 2)
    return { day1Sessions: day1, day2Sessions: day2 }
  }, [filteredSessions])
  
  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString)
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    } catch (error) {
      return timeString
    }
  }
  
  const formatDate = (timeString: string) => {
    try {
      const date = new Date(timeString)
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return timeString
    }
  }

  const handleLeaveClick = (session: SessionWithAttendance, event: React.MouseEvent) => {
    event.stopPropagation() 
    setSessionToLeave(session)
    setIsLeaveDialogOpen(true)
  }

  const handleConfirmLeave = async () => {
    if (!sessionToLeave) return

    try {
      await leaveSessionMutation.mutateAsync(sessionToLeave.id)
      toast.success('Successfully left the session')
      setIsLeaveDialogOpen(false)
      setSessionToLeave(null)
    } catch (error) {
      toast.error('Failed to leave session. Please try again.')
    }
  }

  const handleCancelLeave = () => {
    setIsLeaveDialogOpen(false)
    setSessionToLeave(null)
  }
  
  
  const renderSession = (session: SessionWithAttendance) => (
    <Card 
      key={session.id} 
      className="transition-all hover:shadow-md cursor-pointer"
      onClick={() => navigate(`/session/${session.id}`, { state: { fromSchedule: true } })}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-50 text-purple-700">
                Day {session.day}
              </span>
              <span className="text-xs text-gray-600">
                {formatDate(session.start_time)}
              </span>
            </div>
            <h3 className="font-semibold text-lg mb-1 text-gray-900">
              {session.title}
            </h3>
            {session.session_data?.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {session.session_data.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
          </div>
          {session.session_data?.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{session.session_data.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <UsersIcon className="h-4 w-4" />
            <span>{session.attendee_count} attending</span>
          </div>
        </div>
        
        {session.session_data?.speaker?.name && (
          <div className="text-sm text-gray-600 mb-3 pb-3 border-b">
            <span className="font-medium">Speaker:</span> {session.session_data.speaker.name}
          </div>
        )}
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            View Details
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-300"
            onClick={(e) => handleLeaveClick(session, e)}
          >
            Leave Session
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 w-full">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">My Schedule</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Sessions you've joined • {mySessions.length} total
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 flex-shrink-0" />
            <Input
              placeholder="Search your schedule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="bg-white border-b w-full overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
            <Card className="w-full">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-[#60166b]">
                      {day1Sessions.length}
                    </div>
                    <div className="text-sm text-gray-600">Day 1</div>
                  </div>
                  <Calendar className="h-5 w-5 text-[#60166b]" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-500">
                      {day2Sessions.length}
                    </div>
                    <div className="text-sm text-gray-600">Day 2</div>
                  </div>
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {isLoading ? (
          <div className="flex justify-center py-8 sm:py-12">
            <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin text-[#60166b]" />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <Calendar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              No sessions in your schedule
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              {searchQuery 
                ? 'Try a different search term'
                : 'Browse available sessions and join them to see them here'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {day1Sessions.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Day 1 Sessions ({day1Sessions.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {day1Sessions.map(session => renderSession(session))}
                </div>
              </div>
            )}
            
            {day2Sessions.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Day 2 Sessions ({day2Sessions.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {day2Sessions.map(session => renderSession(session))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Leave Confirmation Dialog */}
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-purple-700" />
              </div>
              <DialogTitle className="text-xl">Leave Session?</DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              By leaving <span className="font-semibold text-gray-900">{sessionToLeave?.title}</span>, you will:
              <ul className="list-disc list-inside mt-3 space-y-2 text-gray-700">
                <li>Miss out on valuable content and networking opportunities</li>
                <li>Not be able to provide your valued feedback</li>
                <li>Need to rejoin if you change your mind</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancelLeave}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmLeave}
              disabled={leaveSessionMutation.isPending}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              {leaveSessionMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Leaving...
                </>
              ) : (
                'Proceed to Leave'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

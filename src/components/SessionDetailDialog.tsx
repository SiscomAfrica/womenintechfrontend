import { useState } from 'react'
import { Clock, MapPin, Users, Calendar, Loader2, X, Share2, Calendar as CalendarIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useSession } from '@/hooks/useSessions'

interface SessionDetailDialogProps {
  sessionId: string | null
  isOpen: boolean
  onClose: () => void
}

const sessionTypeConfig = {
  keynote: {
    color: 'bg-session-keynote',
    textColor: 'text-white',
    label: 'Keynote',
  },
  workshop: {
    color: 'bg-session-workshop',
    textColor: 'text-white',
    label: 'Workshop',
  },
  networking: {
    color: 'bg-session-networking',
    textColor: 'text-white',
    label: 'Networking',
  },
  panel: {
    color: 'bg-session-panel',
    textColor: 'text-white',
    label: 'Panel',
  },
  break: {
    color: 'bg-session-break',
    textColor: 'text-white',
    label: 'Break',
  },
}

function SessionDetailSkeleton() {
  return (
    <div className="space-y-6">
      {}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
      </div>

      {}
      <div className="space-y-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-28" />
      </div>

      {}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {}
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-14" />
      </div>

      {}
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
  )
}

export function SessionDetailDialog({ sessionId, isOpen, onClose }: SessionDetailDialogProps) {
  const [isSharing, setIsSharing] = useState(false)
  
  const { 
    data: session, 
    isLoading, 
    isError, 
    error 
  } = useSession(sessionId || '')
  
  // TODO: Implement toggle attendance functionality
  const toggleAttendance = { isPending: false, mutate: () => {} }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDate = (timeString: string) => {
    return new Date(timeString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleToggleAttendance = async () => {
    if (!session) return
    
    // TODO: Implement actual toggle attendance
    console.log('Toggle attendance for session:', session.id)
  }

  const handleShare = async () => {
    if (!session) return
    
    setIsSharing(true)
    try {
      if (navigator.share) {
        await navigator.share({
          title: session.title,
          text: session.session_data?.description || `Join me at "${session.title}"`,
          url: window.location.href,
        })
      } else {
        
        await navigator.clipboard.writeText(
          `${session.title}\n${session.session_data?.description || ''}\n${window.location.href}`
        )
        
        console.log('Session details copied to clipboard')
      }
    } catch (error) {
      console.error('Failed to share session:', error)
    } finally {
      setIsSharing(false)
    }
  }

  const handleAddToCalendar = () => {
    if (!session) return
    
    const startDate = new Date(session.start_time)
    const endDate = new Date(session.end_time)
    
    
    const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render')
    googleCalendarUrl.searchParams.set('action', 'TEMPLATE')
    googleCalendarUrl.searchParams.set('text', session.title)
    googleCalendarUrl.searchParams.set('dates', 
      `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
    )
    googleCalendarUrl.searchParams.set('details', session.session_data?.description || '')
    googleCalendarUrl.searchParams.set('location', session.session_data?.location || '')
    
    window.open(googleCalendarUrl.toString(), '_blank')
  }

  if (!sessionId) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="sr-only">Session Details</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-[#F5F5F5]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <SessionDetailSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-[#1A1A1A]">Unable to load session</h3>
              <p className="text-[#666666] mt-2">
                {error instanceof Error ? error.message : 'Something went wrong'}
              </p>
            </div>
            <Button 
              onClick={onClose}
              variant="outline"
              className="border-[#E0E0E0] text-[#333333] hover:bg-[#F5F5F5]"
            >
              Close
            </Button>
          </div>
        ) : session ? (
          <div className="space-y-6">
            {}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge 
                  className={cn(
                    sessionTypeConfig[session.session_data?.type as keyof typeof sessionTypeConfig || 'keynote'].color, 
                    sessionTypeConfig[session.session_data?.type as keyof typeof sessionTypeConfig || 'keynote'].textColor,
                    "text-[11px] font-bold px-3 py-1 rounded-lg uppercase tracking-wide"
                  )}
                >
                  {sessionTypeConfig[session.session_data?.type as keyof typeof sessionTypeConfig || 'keynote'].label}
                </Badge>
                {session.attendee_count !== undefined && session.session_data?.max_attendees && (
                  <div className="flex items-center gap-1 text-[#666666]">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {session.attendee_count}/{session.session_data?.max_attendees} attending
                    </span>
                  </div>
                )}
              </div>
              
              <h1 className="text-2xl font-bold text-[#1A1A1A] leading-tight">
                {session.title}
              </h1>
            </div>

            {}
            <div className="space-y-3 text-[#666666]">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-[#333333]">
                    {formatTime(session.start_time)} - {formatTime(session.end_time)}
                  </div>
                  <div className="text-sm">
                    {formatDate(session.start_time)}
                  </div>
                </div>
              </div>
              
              {session.session_data?.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium text-[#333333]">{session.session_data?.location}</span>
                </div>
              )}
              
              {session.session_data?.speaker && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium text-[#333333]">{session.session_data?.speaker?.name}</span>
                </div>
              )}
            </div>

            {}
            {session.session_data?.description && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[#1A1A1A]">About this session</h3>
                <p className="text-[#333333] leading-relaxed whitespace-pre-wrap">
                  {session.session_data?.description}
                </p>
              </div>
            )}

            {}
            {session.session_data?.tags && session.session_data?.tags.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[#1A1A1A]">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {session.session_data?.tags.map((tag: string) => (
                    <Badge
                      key={tag}
                      className="text-[12px] bg-[#F0F0F0] text-[#666666] hover:bg-[#E8E8E8] px-3 py-1 rounded-lg"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {}
            <div className="flex gap-3 pt-4 border-t border-[#F0F0F0]">
              <Button
                onClick={handleToggleAttendance}
                disabled={toggleAttendance.isPending}
                className={cn(
                  "flex-1 text-[16px] font-semibold h-12",
                  session.user_attendance?.is_attending 
                    ? "bg-[#E8F5E9] border border-[#4CAF50] text-[#4CAF50] hover:bg-[#E8F5E9]/80" 
                    : "bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
                )}
              >
                {toggleAttendance.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {session.user_attendance?.is_attending ? "Leaving..." : "Joining..."}
                  </>
                ) : (
                  session.user_attendance?.is_attending ? "Leave Session" : "Join Session"
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddToCalendar}
                className="h-12 w-12 p-0 border-[#E0E0E0] text-[#333333] hover:bg-[#F5F5F5]"
                title="Add to Calendar"
              >
                <CalendarIcon className="h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                disabled={isSharing}
                className="h-12 w-12 p-0 border-[#E0E0E0] text-[#333333] hover:bg-[#F5F5F5]"
                title="Share Session"
              >
                {isSharing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Share2 className="h-5 w-5" />
                )}
              </Button>
            </div>

            {}
            {session.attendee_count !== undefined && session.session_data?.max_attendees && (
              <div className="text-center text-sm text-[#666666] pt-2">
                {session.attendee_count} of {session.session_data?.max_attendees} spots filled
                {session.attendee_count >= (session.session_data?.max_attendees || 0) && (
                  <span className="text-[#FF6B35] font-medium"> • Session Full</span>
                )}
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
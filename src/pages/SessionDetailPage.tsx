import { useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2,
  MessageCircle,
  Edit2,
  Trash2,
  Star,
  Loader2,
  Eye
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSession } from "@/hooks/useSessions"
import { useJoinSession, useLeaveSession } from "@/hooks/useAttendance"
import { useUserFeedback } from "@/hooks/useFeedback"
import { useQueryClient } from "@tanstack/react-query"
import feedbackService from "@/services/feedback"
import sessionsService from "@/services/sessions"
import type { SessionWithAttendance } from "@/services/sessions"
import type { SessionFeedbackSummary } from "@/types"
import type { Attendee } from "@/services/sessions"

export default function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  
  const { data: session, isLoading } = useSession(sessionId!)
  const { data: userFeedback } = useUserFeedback(sessionId!)
  const joinSession = useJoinSession()
  const leaveSession = useLeaveSession()

  const [actionLoading, setActionLoading] = useState(false)
  const [showAllFeedback, setShowAllFeedback] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAttendees, setShowAttendees] = useState(false)
  const [feedbackSummary, setFeedbackSummary] = useState<SessionFeedbackSummary | null>(null)
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const [deletingFeedback, setDeletingFeedback] = useState(false)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [loadingAttendees, setLoadingAttendees] = useState(false)

  
  const fromSchedule = location.state?.fromSchedule

  const handleJoinToggle = async () => {
    if (!session) return

    const isAttending = session.user_attendance?.is_attending

    try {
      setActionLoading(true)
      if (isAttending) {
        await leaveSession.mutateAsync(session.id)
      } else {
        await joinSession.mutateAsync(session.id)
      }
    } catch (error) {
      console.error('Failed to toggle attendance:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return 'Time TBD'
    
    try {
      const date = new Date(timeString)
      if (isNaN(date.getTime())) {
        return timeString
      }
      
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    } catch (error) {
      return timeString || 'Time TBD'
    }
  }

  const formatDate = (timeString: string | undefined) => {
    if (!timeString) return ''
    
    try {
      const date = new Date(timeString)
      if (isNaN(date.getTime())) {
        return ''
      }
      
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    } catch (error) {
      return ''
    }
  }

  const isSessionEnded = (session: SessionWithAttendance): boolean => {
    const endTime = new Date(session.end_time)
    return endTime < new Date()
  }

  const handleViewAllFeedback = async () => {
    if (!sessionId) return
    
    setLoadingFeedback(true)
    setShowAllFeedback(true)
    
    try {
      const result = await feedbackService.getSessionFeedbackSummary(sessionId)
      if (result.success && result.data) {
        setFeedbackSummary(result.data)
      } else {
        console.error('Failed to load feedback:', result.message)
      }
    } catch (error) {
      console.error('Error loading feedback:', error)
    } finally {
      setLoadingFeedback(false)
    }
  }

  const handleDeleteFeedback = async () => {
    if (!sessionId) return
    
    setDeletingFeedback(true)
    
    try {
      const result = await feedbackService.deleteFeedback(sessionId)
      if (result.success) {
        
        queryClient.invalidateQueries({ queryKey: ['userFeedback', sessionId] })
        setShowDeleteConfirm(false)
      } else {
        console.error('Failed to delete feedback:', result.message)
        alert('Failed to delete feedback. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting feedback:', error)
      alert('An error occurred while deleting feedback.')
    } finally {
      setDeletingFeedback(false)
    }
  }

  const handleViewAttendees = async () => {
    if (!sessionId) return
    
    setLoadingAttendees(true)
    setShowAttendees(true)
    
    try {
      const result = await sessionsService.getSessionAttendees(sessionId)
      setAttendees(result.attendees)
    } catch (error) {
      console.error('Error loading attendees:', error)
      alert('Failed to load attendees. Please try again.')
    } finally {
      setLoadingAttendees(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-tertiary">
        {}
        <div className="bg-white border-b border-border-primary px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-text-primary">Session Details</h1>
          <div className="w-10" />
        </div>

        {}
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#60166b]" />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-bg-tertiary">
        {}
        <div className="bg-white border-b border-border-primary px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-text-primary">Session Details</h1>
          <div className="w-10" />
        </div>

        {}
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-text-tertiary">Session not found</p>
        </div>
      </div>
    )
  }

  const isAttending = session.user_attendance?.is_attending || false
  const sessionType = session.session_data?.type || 'session'
  const sessionEnded = isSessionEnded(session)

  return (
    <div className="min-h-screen bg-bg-tertiary pb-32 md:pb-24">
      {}
      <div className="bg-white border-b border-border-primary px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-text-primary">Session Details</h1>
        <div className="w-10" />
      </div>

      {}
      <div className="p-4 space-y-4">
        {}
        <div className="flex gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-[#60166b] text-white font-medium">
            {sessionType.toUpperCase()}
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-[#60166b]/10 text-[#60166b] font-medium">
            DAY {session.day}
          </span>
        </div>

        {}
        <h2 className="text-2xl font-bold text-text-primary">
          {session.title}
        </h2>

        {}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-[#60166b] flex-shrink-0" />
              <span className="text-text-secondary">{formatDate(session.start_time)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-[#60166b] flex-shrink-0" />
              <span className="text-text-secondary">
                {formatTime(session.start_time)} - {formatTime(session.end_time)}
              </span>
            </div>
            {session.session_data?.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#60166b] flex-shrink-0" />
                <span className="text-text-secondary">{session.session_data.location}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[#60166b] flex-shrink-0" />
              <div className="flex-1 flex items-center justify-between">
                <span className="text-text-secondary">
                  {session.attendee_count} attending
                  {session.session_data?.max_attendees && ` / ${session.session_data.max_attendees} capacity`}
                </span>
                {session.attendee_count > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewAttendees}
                    className="text-[#60166b] hover:text-[#4d1157] -mr-2"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {}
        {session.session_data?.description && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-text-primary mb-2">About this session</h3>
              <p className="text-text-secondary leading-relaxed">
                {session.session_data.description}
              </p>
            </CardContent>
          </Card>
        )}

        {}
        {session.session_data?.speaker && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-text-primary mb-3">Speaker</h3>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-[#60166b]/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-[#60166b]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary">
                    {session.session_data.speaker.name}
                  </h4>
                  {session.session_data.speaker.bio && (
                    <p className="text-sm text-text-tertiary mt-1">
                      {session.session_data.speaker.bio}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {}
        {session.session_data?.tags && session.session_data.tags.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-text-primary mb-3">Topics</h3>
              <div className="flex flex-wrap gap-2">
                {session.session_data.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="text-sm px-3 py-1 rounded-full bg-bg-tertiary text-text-secondary"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {}
        {sessionEnded && isAttending && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-text-primary mb-3">Session Feedback</h3>
              
              {userFeedback ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#60166b]">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Feedback Submitted</span>
                  </div>
                  
                  {userFeedback.responses?.rating && (
                    <div>
                      <p className="text-sm text-text-tertiary mb-2">Your Rating:</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              userFeedback.responses.rating >= star
                                ? 'fill-[#60166b] text-[#60166b]'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/feedback/${session.id}`)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Feedback
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 hover:text-red-700"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>

                  {}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleViewAllFeedback}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View All Feedback
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-between mb-3"
                    onClick={() => navigate(`/feedback/${session.id}`)}
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-[#60166b]" />
                      <span>Share Your Feedback</span>
                    </div>
                    <ArrowLeft className="h-5 w-5 rotate-180" />
                  </Button>

                  {}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleViewAllFeedback}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View All Feedback
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {}
      <Dialog open={showAllFeedback} onOpenChange={setShowAllFeedback}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Feedback</DialogTitle>
            <DialogDescription>
              {feedbackSummary?.session_title || 'Session Feedback'}
            </DialogDescription>
          </DialogHeader>

          {loadingFeedback ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#60166b]" />
            </div>
          ) : feedbackSummary ? (
            <div className="space-y-6">
              {}
              <div className="bg-bg-tertiary rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-tertiary">Total Responses</span>
                  <span className="text-lg font-semibold text-text-primary">
                    {feedbackSummary.total_responses}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-tertiary">Average Rating</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-text-primary">
                      {feedbackSummary.average_rating.toFixed(1)}
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            feedbackSummary.average_rating >= star
                              ? 'fill-[#60166b] text-[#60166b]'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {}
              <div>
                <h4 className="font-semibold text-text-primary mb-3">Rating Distribution</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = feedbackSummary.rating_distribution[String(rating)] || 0
                    const percentage = feedbackSummary.total_responses > 0 
                      ? (count / feedbackSummary.total_responses) * 100 
                      : 0
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-16">
                          <span className="text-sm text-text-secondary">{rating}</span>
                          <Star className="h-3 w-3 fill-[#60166b] text-[#60166b]" />
                        </div>
                        <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#60166b]"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-text-tertiary w-12 text-right">
                          {count}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {}
              {feedbackSummary.question_summaries && feedbackSummary.question_summaries.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-text-primary">Question Responses</h4>
                  {feedbackSummary.question_summaries.map((summary: any, index: number) => (
                    <div key={index} className="border border-border-primary rounded-lg p-4">
                      <p className="font-medium text-text-primary mb-3">{summary.question}</p>
                      
                      {summary.type === 'rating' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-tertiary">Average:</span>
                            <span className="font-semibold text-text-primary">
                              {summary.average_rating.toFixed(1)}/5
                            </span>
                          </div>
                          <div className="space-y-1">
                            {[5, 4, 3, 2, 1].map((rating) => {
                              const count = summary.rating_distribution?.[String(rating)] || 0
                              const percentage = summary.total_responses > 0 
                                ? (count / summary.total_responses) * 100 
                                : 0
                              return (
                                <div key={rating} className="flex items-center gap-2 text-xs">
                                  <span className="w-8 text-text-tertiary">{rating}★</span>
                                  <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-[#60166b]/60"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="w-8 text-right text-text-tertiary">{count}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {(summary.type === 'single_choice' || summary.type === 'multiple_choice') && (
                        <div className="space-y-2">
                          {Object.entries(summary.option_counts || {}).map(([option, count]: [string, any]) => (
                            <div key={option} className="flex items-center justify-between text-sm">
                              <span className="text-text-secondary">{option}</span>
                              <span className="font-semibold text-text-primary">{count}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {summary.type === 'text' && summary.sample_responses && (
                        <div className="space-y-2">
                          <p className="text-xs text-text-tertiary mb-2">
                            Showing {Math.min(summary.sample_responses.length, 5)} of {summary.total_responses} responses
                          </p>
                          {summary.sample_responses.slice(0, 5).map((response: string, idx: number) => (
                            <div key={idx} className="text-sm text-text-secondary italic bg-bg-tertiary p-2 rounded">
                              "{response}"
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-text-tertiary py-8">No feedback available yet.</p>
          )}
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Feedback</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your feedback? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deletingFeedback}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteFeedback}
              disabled={deletingFeedback}
            >
              {deletingFeedback ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Feedback'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attendees Dialog */}
      <Dialog open={showAttendees} onOpenChange={setShowAttendees}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader className="pb-3 border-b">
            <DialogTitle>Session Attendees</DialogTitle>
            <DialogDescription>
              {attendees.length > 0 ? (
                <span>{attendees.length} {attendees.length === 1 ? 'person' : 'people'} attending</span>
              ) : (
                <span>People attending this session</span>
              )}
            </DialogDescription>
          </DialogHeader>

          {loadingAttendees ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#60166b]" />
            </div>
          ) : attendees.length > 0 ? (
            <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-2">
              <div className="space-y-2">
                {attendees.map((attendee) => {
                  const displayName = attendee.profile?.name || attendee.email;
                  const profilePhoto = attendee.profile?.photo_url;
                  
                  return (
                    <div 
                      key={attendee.id} 
                      className="flex items-center gap-3 p-3 rounded-lg border border-border-primary hover:bg-bg-tertiary transition-colors"
                    >
                      {/* Profile Photo */}
                      <div className="w-10 h-10 rounded-full bg-[#60166b]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {profilePhoto ? (
                          <img 
                            src={profilePhoto} 
                            alt={displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[#60166b] font-semibold">
                            {displayName[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      {/* Attendee Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-text-primary truncate">
                          {displayName}
                        </h4>
                        <p className="text-sm text-text-tertiary truncate">
                          {attendee.email}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-center text-text-tertiary py-8">No attendees yet.</p>
          )}
        </DialogContent>
      </Dialog>

      {}
      {!fromSchedule && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border-primary p-4 z-50 md:bottom-0 mb-[60px] md:mb-0">
          <Button
            onClick={handleJoinToggle}
            disabled={actionLoading}
            className={`w-full ${
              isAttending
                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                : 'bg-[#60166b] text-white hover:bg-[#4d1157]'
            }`}
          >
            {actionLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                {isAttending ? 'Added to Schedule' : 'Add to Schedule'}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

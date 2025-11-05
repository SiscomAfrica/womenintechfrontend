import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  Check,
  X,
  Loader2,
  CalendarCheck,
  Send,
  Inbox,
} from 'lucide-react'
import {
  useMeetingRequests,
  useAcceptMeetingRequest,
  useDeclineMeetingRequest,
  useCancelMeetingRequest,
} from '@/hooks/useMeetings'
import type { MeetingRequest } from '@/services/meetings'
import { useAuthStore } from '@/stores/auth-store'

export default function MeetingsPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'accepted'>('received')
  
  // Fetch meeting requests based on active tab
  const { data: receivedData, isLoading: receivedLoading } = useMeetingRequests('pending', 'received')
  const { data: sentData, isLoading: sentLoading } = useMeetingRequests('pending', 'sent')
  const { data: acceptedData, isLoading: acceptedLoading } = useMeetingRequests('accepted', undefined)
  
  const acceptMeeting = useAcceptMeetingRequest()
  const declineMeeting = useDeclineMeetingRequest()
  const cancelMeeting = useCancelMeetingRequest()

  const getInitials = (name?: string) => {
    if (!name) return '??'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const dateOptions: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }
      const timeOptions: Intl.DateTimeFormatOptions = { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      }
      return {
        date: date.toLocaleDateString('en-US', dateOptions),
        time: date.toLocaleTimeString('en-US', timeOptions),
      }
    } catch (error) {
      return { date: 'Invalid date', time: '' }
    }
  }

  const handleAccept = async (meetingId: string) => {
    await acceptMeeting.mutateAsync({ meetingId })
  }

  const handleDecline = async (meetingId: string) => {
    await declineMeeting.mutateAsync({ meetingId })
  }

  const handleCancel = async (meetingId: string) => {
    await cancelMeeting.mutateAsync(meetingId)
  }

  const renderMeetingCard = (meeting: MeetingRequest, type: 'received' | 'sent' | 'accepted') => {
    // Determine the other user and meeting direction
    const isReceived = meeting.receiver_id === user?.id
    const otherUser = isReceived ? meeting.requester : meeting.receiver
    const { date, time } = formatDateTime(meeting.proposed_time)
    const isProcessing = acceptMeeting.isPending || declineMeeting.isPending || cancelMeeting.isPending

    // For accepted tab, show both sent and received
    const showDirection = type === 'accepted'
    const directionLabel = isReceived ? 'Meeting request from' : 'Meeting request to'

    return (
      <Card key={meeting.id} className="w-full border-l-4" style={{ borderLeftColor: isReceived ? '#10b981' : '#3b82f6' }}>
        <CardContent className="p-4 sm:p-5">
          {/* Direction Label for Accepted tab */}
          {showDirection && (
            <div className="mb-3 pb-3 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {directionLabel}
              </span>
            </div>
          )}

          <div className="flex items-start gap-4">
            {/* Avatar */}
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={otherUser?.photo_url} alt={otherUser?.name} />
              <AvatarFallback className="bg-gradient-to-br from-purple-900/85 via-indigo-900/80 to-pink-900/85 text-white text-sm font-semibold">
                {getInitials(otherUser?.name)}
              </AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* User Info & Status */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base text-gray-900 truncate">
                    {otherUser?.name || otherUser?.email}
                  </h3>
                  {otherUser?.job_title && (
                    <p className="text-sm text-gray-600 truncate mt-0.5">
                      {otherUser.job_title}
                      {otherUser.company && ` • ${otherUser.company}`}
                    </p>
                  )}
                </div>
                <Badge 
                  variant={meeting.status === 'accepted' ? 'default' : meeting.status === 'pending' ? 'secondary' : 'outline'}
                  className="flex-shrink-0 capitalize"
                >
                  {meeting.status}
                </Badge>
              </div>

              {/* Meeting Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  <span>{date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  <span>{time}</span>
                </div>
                {meeting.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{meeting.location}</span>
                  </div>
                )}
              </div>

              {/* Message */}
              {meeting.message && (
                <div className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed">{meeting.message}</p>
                </div>
              )}

              {/* Response Message */}
              {meeting.response_message && (
                <div className="mb-3 p-3 bg-blue-50 rounded-md border border-blue-100">
                  <p className="text-xs font-medium text-blue-900 mb-1">Response:</p>
                  <p className="text-sm text-blue-700 leading-relaxed">{meeting.response_message}</p>
                </div>
              )}

              {/* Actions for Received Pending */}
              {type === 'received' && meeting.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAccept(meeting.id)}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    {acceptMeeting.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleDecline(meeting.id)}
                    disabled={isProcessing}
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    size="sm"
                  >
                    {declineMeeting.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Decline
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Actions for Sent Pending */}
              {type === 'sent' && meeting.status === 'pending' && (
                <Button
                  onClick={() => handleCancel(meeting.id)}
                  disabled={isProcessing}
                  variant="outline"
                  className="w-full border-gray-300"
                  size="sm"
                >
                  {cancelMeeting.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-1" />
                      Cancel Request
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 w-full">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">My Meetings</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage your 1-on-1 meeting requests</p>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          {/* Simplified Tab List - No Icons on Mobile */}
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-gray-100">
            <TabsTrigger 
              value="received" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 px-2 sm:px-4"
            >
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm font-medium">Received</span>
                {receivedData && receivedData.pending_count > 0 && (
                  <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 text-xs">
                    {receivedData.pending_count}
                  </Badge>
                )}
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="sent" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 px-2 sm:px-4"
            >
              <span className="text-xs sm:text-sm font-medium">Sent</span>
            </TabsTrigger>
            <TabsTrigger 
              value="accepted" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 px-2 sm:px-4"
            >
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm font-medium">Accepted</span>
                {acceptedData && acceptedData.accepted_count > 0 && (
                  <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5 text-xs">
                    {acceptedData.accepted_count}
                  </Badge>
                )}
              </div>
            </TabsTrigger>
          </TabsList>

        {/* Received Requests */}
        <TabsContent value="received" className="space-y-3 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-1 rounded-full bg-green-500"></div>
            <p className="text-sm font-medium text-gray-700">
              Meeting requests you received (Green border)
            </p>
          </div>
          {receivedLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#60166b]" />
            </div>
          ) : receivedData && receivedData.requests.length > 0 ? (
            receivedData.requests.map((meeting) => renderMeetingCard(meeting, 'received'))
          ) : (
            <Card className="w-full border-dashed">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Inbox className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-base font-medium text-gray-900 mb-1">No pending requests</p>
                <p className="text-sm text-gray-500">You don't have any meeting requests at the moment</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Sent Requests */}
        <TabsContent value="sent" className="space-y-3 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-1 rounded-full bg-blue-500"></div>
            <p className="text-sm font-medium text-gray-700">
              Meeting requests you sent (Blue border)
            </p>
          </div>
          {sentLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#60166b]" />
            </div>
          ) : sentData && sentData.requests.length > 0 ? (
            sentData.requests.map((meeting) => renderMeetingCard(meeting, 'sent'))
          ) : (
            <Card className="w-full border-dashed">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Send className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-base font-medium text-gray-900 mb-1">No sent requests</p>
                <p className="text-sm text-gray-500">You haven't sent any meeting requests yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Accepted Meetings */}
        <TabsContent value="accepted" className="space-y-3 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-1 rounded-full bg-purple-500"></div>
            <p className="text-sm font-medium text-gray-700">
              All accepted meetings (Green = received, Blue = sent)
            </p>
          </div>
          {acceptedLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#60166b]" />
            </div>
          ) : acceptedData && acceptedData.requests.length > 0 ? (
            acceptedData.requests.map((meeting) => renderMeetingCard(meeting, 'accepted'))
          ) : (
            <Card className="w-full border-dashed">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <CalendarCheck className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-base font-medium text-gray-900 mb-1">No accepted meetings</p>
                <p className="text-sm text-gray-500">Once you accept or someone accepts your request, it will appear here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

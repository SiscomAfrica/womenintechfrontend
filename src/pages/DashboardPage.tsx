import { useState, useCallback, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/stores/auth-store"
import { useSessions } from "@/hooks/useSessions"
import { useJoinSession, useLeaveSession } from "@/hooks/useAttendance"
import { Search, Settings, User, LogOut, Calendar, Clock, MapPin, Users as UsersIcon, Loader2 } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"
import { type SessionWithAttendance } from "@/services/sessions"
import { useNavigate } from "react-router-dom"

export default function DashboardPage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const joinSession = useJoinSession()
  const leaveSession = useLeaveSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDay, setSelectedDay] = useState<number | undefined>(undefined)
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null)
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  
  
  const { data: sessions = [], isLoading, error: sessionsError } = useSessions({ day: selectedDay })
  
  
  useEffect(() => {
    console.log('[Dashboard] Sessions loaded:', sessions.length, 'sessions')
    if (sessionsError) console.error('[Dashboard] Error loading sessions:', sessionsError)
  }, [sessions, sessionsError])
  
  
  const filteredSessions = useMemo(() => {
    if (!debouncedSearchQuery) return sessions
    
    const query = debouncedSearchQuery.toLowerCase()
    return sessions.filter(session => {
      return (
        session.title.toLowerCase().includes(query) ||
        session.session_data?.description?.toLowerCase().includes(query) ||
        session.session_data?.speaker?.name?.toLowerCase().includes(query) ||
        session.session_data?.location?.toLowerCase().includes(query) ||
        session.session_data?.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    })
  }, [sessions, debouncedSearchQuery])
  
  
  const { day1Sessions, day2Sessions } = useMemo(() => {
    const day1 = filteredSessions.filter(s => s.day === 1)
    const day2 = filteredSessions.filter(s => s.day === 2)
    return { day1Sessions: day1, day2Sessions: day2 }
  }, [filteredSessions])
  
  const userInitials = useMemo(() => {
    const name = user?.profile?.name || user?.email
    if (!name) return "U"
    
    if (name.includes('@')) {
      return name.charAt(0).toUpperCase()
    }
    
    return name.split(" ").map(part => part[0]).join("").toUpperCase().slice(0, 2)
  }, [user?.profile?.name, user?.email])
  
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }, [])
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])
  
  const handleDayChange = useCallback((value: string) => {
    if (value === "all") {
      setSelectedDay(undefined)
    } else {
      setSelectedDay(parseInt(value))
    }
  }, [])
  
  const handleLogout = useCallback(async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }, [logout, navigate])
  
  const handleJoinToggle = useCallback(async (sessionId: string, isAttending: boolean, e: React.MouseEvent) => {
    e.stopPropagation() 
    
    setLoadingSessionId(sessionId)
    
    try {
      if (isAttending) {
        await leaveSession.mutateAsync(sessionId)
      } else {
        await joinSession.mutateAsync(sessionId)
      }
    } catch (error) {
      console.error('Failed to toggle attendance:', error)
    } finally {
      setLoadingSessionId(null)
    }
  }, [joinSession, leaveSession])
  
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
  
  
  const renderSession = (session: SessionWithAttendance) => (
    <Card 
      key={session.id} 
      className="transition-all hover:shadow-md cursor-pointer"
      onClick={() => navigate(`/session/${session.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1 text-[#333333]">
              {session.title}
            </h3>
            {session.session_data?.description && (
              <p className="text-sm text-[#666666] line-clamp-2">
                {session.session_data.description}
              </p>
            )}
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-[#60166b]/10 text-[#60166b]">
            Day {session.day}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-[#666666] mb-3">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
          </div>
          {session.session_data?.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{session.session_data.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <UsersIcon className="h-4 w-4" />
            <span>{session.attendee_count} attending</span>
          </div>
        </div>
        
        {session.session_data?.speaker?.name && (
          <div className="text-sm text-[#666666] mb-3">
            <span className="font-medium">Speaker:</span> {session.session_data.speaker.name}
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            variant={session.user_attendance?.is_attending ? "outline" : "default"}
            size="sm"
            className="flex-1"
            onClick={(e) => handleJoinToggle(session.id, session.user_attendance?.is_attending || false, e)}
            disabled={loadingSessionId === session.id}
          >
            {loadingSessionId === session.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : session.user_attendance?.is_attending ? (
              "Joined"
            ) : (
              "Join"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#60166b] truncate">
            {greeting}, {user?.profile?.name?.split(' ')[0] || user?.email?.split('@')[0] || "User"}!
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#666666]">
            Ready to network and learn today?
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 sm:w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-xs sm:text-sm font-medium truncate">{user?.profile?.name || user?.email?.split('@')[0]}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs sm:text-sm">
              <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs sm:text-sm">
              <Settings className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-xs sm:text-sm">
              <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666666] flex-shrink-0" />
        <Input
          placeholder="Search sessions..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-10"
        />
      </div>
      
      {}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedDay === undefined ? "default" : "outline"}
          onClick={() => handleDayChange("all")}
        >
          All Days
        </Button>
        <Button
          variant={selectedDay === 1 ? "default" : "outline"}
          onClick={() => handleDayChange("1")}
        >
          Day 1
        </Button>
        <Button
          variant={selectedDay === 2 ? "default" : "outline"}
          onClick={() => handleDayChange("2")}
        >
          Day 2
        </Button>
      </div>

      {}
      <Card className="bg-gradient-to-r from-[#60166b]/5 to-[#312e81]/5">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-2">Welcome to Women in Tech Summit 2025</h2>
          <p className="text-[#666666]">
            Connect, learn, and grow with fellow attendees.
          </p>
        </CardContent>
      </Card>

      {}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#60166b]">{sessions.length}</div>
                <div className="text-sm text-[#666666]">Total Sessions</div>
              </div>
              <Calendar className="h-5 w-5 text-[#60166b]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#4CAF50]">
                  {sessions.filter(s => s.user_attendance?.is_attending).length}
                </div>
                <div className="text-sm text-[#666666]">Joined</div>
              </div>
              <UsersIcon className="h-5 w-5 text-[#4CAF50]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#60166b]">{day1Sessions.length}</div>
                <div className="text-sm text-[#666666]">Day 1</div>
              </div>
              <Calendar className="h-5 w-5 text-[#60166b]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#007AFF]">{day2Sessions.length}</div>
                <div className="text-sm text-[#666666]">Day 2</div>
              </div>
              <Calendar className="h-5 w-5 text-[#007AFF]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      <Card>
        <CardHeader>
          <CardTitle>
            {searchQuery ? 'Search Results' : selectedDay ? `Day ${selectedDay} Sessions` : 'All Sessions'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} found
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#60166b]" />
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-[#666666]">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No sessions found</p>
            </div>
          ) : (
            <>
              {day1Sessions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-[#333333]">Day 1 Sessions</h3>
                  {day1Sessions.map(session => renderSession(session))}
                </div>
              )}
              {day2Sessions.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h3 className="font-semibold text-[#333333]">Day 2 Sessions</h3>
                  {day2Sessions.map(session => renderSession(session))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

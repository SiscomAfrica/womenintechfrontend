
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock, MapPin, Users, Calendar, Loader2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FeedbackForm } from './FeedbackForm';

interface SessionCardProps {
  id: string;
  title: string;
  description?: string;
  type: 'keynote' | 'workshop' | 'networking' | 'panel' | 'break';
  startTime: string;
  endTime: string;
  location?: string;
  speaker?: string;
  attendeeCount?: number;
  maxAttendees?: number;
  isAttending?: boolean;
  tags?: string[];
  onViewDetails?: (sessionId: string) => void;
  onToggleAttendance?: (isAttending: boolean) => void;
  showFeedbackButton?: boolean;
  className?: string;
  isLoading?: boolean;
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
};


export function SessionCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("transition-all duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-6 w-full mb-1" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-4">
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>

      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </CardContent>
    </Card>
  )
}

export function SessionCard({
  id,
  title,
  description,
  type,
  startTime,
  endTime,
  location,
  speaker,
  attendeeCount,
  maxAttendees,
  isAttending = false,
  tags,
  onViewDetails,
  onToggleAttendance,
  showFeedbackButton = false,
  className,
  isLoading = false,
}: SessionCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const typeConfig = sessionTypeConfig[type];
  
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleToggleAttendance = () => {
    onToggleAttendance?.(!isAttending);
  };

  const handleViewDetails = () => {
    onViewDetails?.(id);
  };

  const handleFeedbackClick = () => {
    setShowFeedbackDialog(true);
  };

  const handleFeedbackClose = () => {
    setShowFeedbackDialog(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  
  if (isLoading) {
    return <SessionCardSkeleton className={className} />
  }

  return (
    <Card 
      className={cn(
        "transition-all duration-200 cursor-pointer border-[#F0F0F0]",
        isHovered ? "shadow-elevated" : "shadow-sm hover:shadow-md",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                className={cn(
                  typeConfig.color, 
                  typeConfig.textColor,
                  "text-[11px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide"
                )}
              >
                {typeConfig.label}
              </Badge>
              {attendeeCount !== undefined && maxAttendees && (
                <div className="flex items-center gap-1 text-[#666666]">
                  <Users className="h-3 w-3" />
                  <span className="text-[11px] font-medium">
                    {attendeeCount}/{maxAttendees}
                  </span>
                </div>
              )}
            </div>
            <CardTitle className="text-[18px] font-bold text-[#1A1A1A] line-clamp-2 leading-6">
              {title}
            </CardTitle>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 text-[13px] text-[#666666]">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium">
              {formatTime(startTime)} - {formatTime(endTime)}
            </span>
          </div>
          
          {location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
          
          {speaker && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{speaker}</span>
            </div>
          )}
        </div>
      </CardHeader>

      {description && (
        <CardContent className="pt-0 pb-4">
          <p className="text-[14px] text-[#333333] line-clamp-2 leading-relaxed">
            {description}
          </p>
        </CardContent>
      )}

      {tags && tags.length > 0 && (
        <CardContent className="pt-0 pb-4">
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                className="text-[11px] bg-[#F0F0F0] text-[#666666] hover:bg-[#E8E8E8] px-2 py-1 rounded-lg"
              >
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge
                className="text-[11px] bg-[#F0F0F0] text-[#666666] px-2 py-1 rounded-lg"
              >
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>
      )}

      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewDetails}
            className="flex-1 border-[#E0E0E0] text-[#333333] hover:bg-[#F5F5F5] text-[14px] font-semibold"
          >
            View Details
          </Button>
          
          {showFeedbackButton ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleFeedbackClick}
              className="flex-1 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35]/5 text-[14px] font-semibold"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedback
            </Button>
          ) : (
            <Button
              variant={isAttending ? "outline" : "default"}
              size="sm"
              onClick={handleToggleAttendance}
              disabled={isLoading}
              className={cn(
                "flex-1 text-[14px] font-semibold",
                isAttending 
                  ? "bg-[#E8F5E9] border border-[#4CAF50] text-[#4CAF50] hover:bg-[#E8F5E9]/80" 
                  : "bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isAttending ? "Leaving..." : "Joining..."}
                </>
              ) : (
                isAttending ? "Attending" : "Join Session"
              )}
            </Button>
          )}
        </div>
      </CardContent>

      {}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1A1A1A]">
              Session Feedback
            </DialogTitle>
          </DialogHeader>
          
          <FeedbackForm
            sessionId={id}
            sessionTitle={title}
            onSuccess={handleFeedbackClose}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
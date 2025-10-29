import { useEffect, useRef, useCallback, useState } from 'react';
import { UserCard } from '@/components/UserCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useEnhancedAttendees, usePrefetchUserProfile, useConnectionRequest } from '@/hooks/useNetworking';
import type { AttendeeFilters, User } from '@/services/networking';

interface AttendeeGridProps {
  filters: AttendeeFilters;
  onUserSelect: (user: User) => void;
  className?: string;
}

export function AttendeeGrid({ filters, onUserSelect, className }: AttendeeGridProps) {
  const [connectingUsers, setConnectingUsers] = useState<Set<string>>(() => new Set<string>());
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useEnhancedAttendees(filters);

  const prefetchUserProfile = usePrefetchUserProfile();
  const connectionMutation = useConnectionRequest();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);

  
  const lastElementCallback = useCallback(
    (node: HTMLDivElement) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  
  useEffect(() => {
    if (lastElementRef.current) {
      lastElementCallback(lastElementRef.current);
    }
  }, [lastElementCallback]);

  
  const handleUserHover = (userId: string) => {
    prefetchUserProfile(userId);
  };

  
  const handleConnect = async (userId: string) => {
    setConnectingUsers(prev => new Set(prev).add(userId));
    
    try {
      await connectionMutation.mutateAsync({ userId });
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setConnectingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  
  const allUsers = data?.pages?.flatMap(page => page.attendees || []) || [];

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <AttendeeCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <AlertCircle className="h-12 w-12 text-text-tertiary" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-text-primary">
            Failed to load attendees
          </h3>
          <p className="text-text-tertiary max-w-md">
            {error instanceof Error ? error.message : 'Something went wrong while loading attendees.'}
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      </div>
    );
  }

  if (allUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-text-primary">
            No attendees found
          </h3>
          <p className="text-text-tertiary max-w-md">
            Try adjusting your search or filters to find more attendees.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allUsers.map((user, index) => {
          const isLast = index === allUsers.length - 1;
          
          // Safely extract interests and skills, ensuring they are arrays
          const userInterests = Array.isArray(user.interests) ? user.interests : 
                               Array.isArray(user.profile?.interests) ? user.profile.interests : [];
          const userSkills = Array.isArray(user.skills) ? user.skills : 
                            Array.isArray(user.profile?.skills) ? user.profile.skills : [];
          
          return (
            <div
              key={user.id}
              ref={isLast ? lastElementRef : undefined}
              onMouseEnter={() => handleUserHover(user.id)}
            >
              <UserCard
                id={user.id}
                name={user.displayName}
                title={user.jobTitle || user.profile?.job_title}
                company={user.company || user.profile?.company}
                bio={user.bio || user.profile?.bio}
                avatarUrl={user.profilePhoto || user.profile?.photo_url}
                matchPercentage={user.matchPercentage}
                interests={[...userInterests, ...userSkills]}
                connectionStatus={user.connectionStatus}
                isConnected={user.isConnected}
                isConnecting={connectingUsers.has(user.id)}
                onViewProfile={() => onUserSelect(user)}
                onConnect={() => handleConnect(user.id)}
                className="h-full"
              />
            </div>
          );
        })}
      </div>

      {}
      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-text-tertiary">
            <div className="h-5 w-5 border-2 border-primary-orange/30 border-t-primary-orange rounded-full animate-spin" />
            <span className="text-sm">Loading more attendees...</span>
          </div>
        </div>
      )}

      {}
      {!hasNextPage && allUsers.length > 0 && (
        <div className="flex justify-center py-8">
          <p className="text-sm text-text-tertiary">
            You've seen all {allUsers.length} attendees
          </p>
        </div>
      )}
    </div>
  );
}

// Skeleton component for loading state
function AttendeeCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-border-light p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>

      {/* Tags */}
      <div className="flex gap-1">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </div>
  );
}
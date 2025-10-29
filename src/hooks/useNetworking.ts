import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { networkingService } from '@/services/networking';
import type { User, AttendeeFilters, ConnectionRequest } from '@/services/networking';


export const networkingKeys = {
  all: ['networking'] as const,
  attendees: () => [...networkingKeys.all, 'attendees'] as const,
  attendeesList: (filters: AttendeeFilters) => [...networkingKeys.attendees(), 'list', filters] as const,
  attendeesInfinite: (filters: AttendeeFilters) => [...networkingKeys.attendees(), 'infinite', filters] as const,
  user: (id: string) => [...networkingKeys.all, 'user', id] as const,
  profile: () => [...networkingKeys.all, 'profile'] as const,
  connections: () => [...networkingKeys.all, 'connections'] as const,
  search: (query: string, filters?: AttendeeFilters) => [...networkingKeys.all, 'search', query, filters] as const,
};


export function useInfiniteAttendees(filters: AttendeeFilters = {}) {
  return useInfiniteQuery({
    queryKey: networkingKeys.attendeesInfinite(filters),
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const offset = pageParam;
      if (filters.search && filters.search.length > 0) {
        return networkingService.searchAttendees(filters.search, filters);
      }
      return networkingService.getAttendees(20, offset, filters.search);
    },
    initialPageParam: 0, 
    getNextPageParam: (lastPage: any) => {
      
      const currentOffset = lastPage.offset || 0;
      const currentLimit = lastPage.limit || 20;
      const total = lastPage.total || 0;
      
      if (currentOffset + currentLimit < total) {
        return currentOffset + currentLimit; 
      }
      return undefined; 
    },
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false,
  });
}


export function useSearchAttendees(query: string, filters?: AttendeeFilters) {
  return useQuery({
    queryKey: networkingKeys.search(query, filters),
    queryFn: () => networkingService.searchAttendees(query, filters),
    enabled: query.length >= 2, 
    staleTime: 30 * 1000, 
    refetchOnWindowFocus: false,
  });
}


export function useAttendees(limit: number = 20, offset: number = 0, search?: string) {
  return useQuery({
    queryKey: networkingKeys.attendeesList({ search }),
    queryFn: () => networkingService.getAttendees(limit, offset, search),
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false,
  });
}


export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: networkingKeys.user(userId),
    queryFn: () => networkingService.getUserProfile(userId),
    staleTime: 10 * 60 * 1000, 
    refetchOnWindowFocus: false,
  });
}


export function useMyProfile() {
  return useQuery({
    queryKey: networkingKeys.profile(),
    queryFn: () => networkingService.getMyProfile(),
    staleTime: 10 * 60 * 1000, 
    refetchOnWindowFocus: false,
  });
}


export function useConnections(page: number = 1, size: number = 20) {
  return useQuery({
    queryKey: networkingKeys.connections(),
    queryFn: () => networkingService.getConnections(page, size),
    staleTime: 2 * 60 * 1000, 
    refetchOnWindowFocus: false,
  });
}


export function useConnectionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, message }: ConnectionRequest) =>
      networkingService.sendConnectionRequest(userId, message),
    onMutate: async ({ userId }) => {
      
      await queryClient.cancelQueries({ queryKey: networkingKeys.attendees() });
      
      
      const previousAttendees = queryClient.getQueriesData({ queryKey: networkingKeys.attendees() });
      
      
      queryClient.setQueriesData({ queryKey: networkingKeys.attendees() }, (old: any) => {
        if (!old) return old;
        
        if (old.pages) {
          
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((user: any) => 
                user.id === userId 
                  ? { ...user, connectionStatus: 'pending' }
                  : user
              )
            }))
          };
        } else if (old.items) {
          
          return {
            ...old,
            items: old.items.map((user: any) => 
              user.id === userId 
                ? { ...user, connectionStatus: 'pending' }
                : user
            )
          };
        }
        
        return old;
      });
      
      return { previousAttendees };
    },
    onError: (_err, _variables, context) => {
      
      if (context?.previousAttendees) {
        context.previousAttendees.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: networkingKeys.connections() });
    },
    onSettled: () => {
      
      queryClient.invalidateQueries({ queryKey: networkingKeys.attendees() });
    },
  });
}


export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData: Partial<User>) =>
      networkingService.updateMyProfile(profileData),
    onSuccess: (updatedProfile) => {
      
      queryClient.setQueryData(networkingKeys.profile(), updatedProfile);
      
      queryClient.invalidateQueries({ queryKey: networkingKeys.attendees() });
    },
  });
}


export function useEnhancedAttendees(filters: AttendeeFilters = {}) {
  const { data: currentUser } = useMyProfile();
  const { data: connections } = useConnections();
  const attendeesQuery = useInfiniteAttendees(filters);

  
  const connectionStatusMap = new Map();
  connections?.items?.forEach(connection => {
    connectionStatusMap.set(connection.connectedUserId, connection.status);
  });

  const enhancedData = attendeesQuery.data ? {
    ...attendeesQuery.data,
    pages: attendeesQuery.data.pages?.map((page: any) => ({
      ...page,
      
      attendees: (page.attendees || []).map((attendee: any) => {
        // Safely extract profile data
        const profile = attendee.profile || {};
        const interests = Array.isArray(profile.interests) ? profile.interests : [];
        const skills = Array.isArray(profile.skills) ? profile.skills : [];
        
        return {
          ...attendee,
          // Flatten profile data for easier access
          displayName: profile.name || 'Unknown',
          initials: getInitials(profile.name || 'U'),
          jobTitle: profile.job_title,
          company: profile.company,
          bio: profile.bio,
          profilePhoto: profile.photo_url,
          interests,
          skills,
          // Calculate match percentage
          matchPercentage: currentUser 
            ? networkingService.calculateMatchPercentage(
                { ...attendee, interests, skills } as any, 
                currentUser
              )
            : Math.floor(Math.random() * 40) + 30,
          // Connection status
          connectionStatus: connectionStatusMap.get(attendee.id) || 'none',
          isConnected: connectionStatusMap.get(attendee.id) === 'accepted',
        };
      })
    }))
  } : undefined;

  return {
    ...attendeesQuery,
    data: enhancedData,
  };
}


function getInitials(name: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}


export function usePrefetchUserProfile() {
  const queryClient = useQueryClient();

  return (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: networkingKeys.user(userId),
      queryFn: () => networkingService.getUserProfile(userId),
      staleTime: 10 * 60 * 1000,
    });
  };
}
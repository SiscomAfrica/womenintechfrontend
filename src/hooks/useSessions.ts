
import { useQuery } from '@tanstack/react-query'
import sessionsService, { type SessionFilters } from '@/services/sessions'


export const sessionKeys = {
  all: ['sessions'] as const,
  schedule: () => [...sessionKeys.all, 'schedule'] as const,
  scheduleByDay: (day?: number) => [...sessionKeys.schedule(), day] as const,
  mySchedule: () => [...sessionKeys.all, 'my-schedule'] as const,
  details: () => [...sessionKeys.all, 'detail'] as const,
  detail: (id: string) => [...sessionKeys.details(), id] as const,
}





export function useSessions(filters: SessionFilters = {}) {
  return useQuery({
    queryKey: sessionKeys.scheduleByDay(filters.day),
    queryFn: () => sessionsService.getSchedule(filters.day),
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000, 
    refetchOnWindowFocus: true,
    retry: 3,
  })
}





export function useMySchedule() {
  return useQuery({
    queryKey: sessionKeys.mySchedule(),
    queryFn: () => sessionsService.getMySchedule(),
    staleTime: 2 * 60 * 1000, 
    gcTime: 10 * 60 * 1000, 
    refetchOnWindowFocus: true,
    retry: 3,
  })
}





export function useSession(sessionId: string) {
  return useQuery({
    queryKey: sessionKeys.detail(sessionId),
    queryFn: () => sessionsService.getSession(sessionId),
    staleTime: 10 * 60 * 1000, 
    gcTime: 30 * 60 * 1000, 
    enabled: !!sessionId,
    retry: 3,
  })
}





export function useSearchSessions(query: string) {
  return useQuery({
    queryKey: [...sessionKeys.all, 'search', query],
    queryFn: () => sessionsService.searchSessions(query),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: query.length > 0,
    retry: 3,
  })
}

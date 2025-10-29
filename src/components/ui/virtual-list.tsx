import React from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

interface VirtualListProps<T> {
  items: T[]
  height: number
  itemHeight: number | ((index: number) => number)
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  overscan?: number
  getItemKey?: (item: T, index: number) => string | number
  onScroll?: (scrollTop: number) => void
  estimateSize?: (index: number) => number
}

export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className = '',
  overscan = 5,
  getItemKey,
  onScroll,
  estimateSize,
}: VirtualListProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: estimateSize || (() => typeof itemHeight === 'number' ? itemHeight : 50),
    overscan,
    getItemKey: getItemKey ? (index) => getItemKey(items[index], index) : undefined,
  })

  const virtualItems = virtualizer.getVirtualItems()

  React.useEffect(() => {
    if (onScroll) {
      const element = parentRef.current
      if (!element) return

      const handleScroll = () => {
        onScroll(element.scrollTop)
      }

      element.addEventListener('scroll', handleScroll)
      return () => element.removeEventListener('scroll', handleScroll)
    }
  }, [onScroll])

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index]
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: virtualItem.size,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          )
        })}
      </div>
    </div>
  )
}


interface VirtualSessionListProps {
  sessions: any[]
  onSessionClick: (session: any) => void
  onJoinToggle: (sessionId: string, isAttending: boolean) => void
  className?: string
}

export function VirtualSessionList({
  sessions,
  onSessionClick,
  onJoinToggle,
  className,
}: VirtualSessionListProps) {
  const renderSession = (session: any) => (
    <div className="p-2">
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1 cursor-pointer" onClick={() => onSessionClick(session)}>
            <h3 className="font-semibold text-gray-900 mb-1">{session.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{session.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{session.startTime} - {session.endTime}</span>
              <span>{session.location}</span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onJoinToggle(session.id, !session.isAttending)
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              session.isAttending
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            {session.isAttending ? 'Joined' : 'Join'}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <VirtualList
      items={sessions}
      height={600}
      itemHeight={120}
      renderItem={renderSession}
      className={className}
      getItemKey={(session) => session.id}
      overscan={3}
    />
  )
}


interface VirtualAttendeeListProps {
  attendees: any[]
  onAttendeeClick: (attendee: any) => void
  className?: string
}

export function VirtualAttendeeList({
  attendees,
  onAttendeeClick,
  className,
}: VirtualAttendeeListProps) {
  const renderAttendee = (attendee: any) => (
    <div className="p-2">
      <div 
        className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onAttendeeClick(attendee)}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
            {attendee.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{attendee.name}</h3>
            <p className="text-sm text-gray-600 truncate">{attendee.jobTitle}</p>
            <p className="text-xs text-gray-500 truncate">{attendee.company}</p>
          </div>
          {attendee.matchPercentage && (
            <div className="text-xs font-medium text-orange-600">
              {attendee.matchPercentage}% match
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <VirtualList
      items={attendees}
      height={600}
      itemHeight={100}
      renderItem={renderAttendee}
      className={className}
      getItemKey={(attendee) => attendee.id}
      overscan={5}
    />
  )
}


export function useInfiniteVirtualList<T>({
  items,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: {
  items: T[]
  hasNextPage: boolean
  fetchNextPage: () => void
  isFetchingNextPage: boolean
}) {
  const handleScroll = React.useCallback(
    (scrollTop: number) => {
      
      const scrollPercentage = scrollTop / (items.length * 100) 
      if (scrollPercentage > 0.8 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [items.length, hasNextPage, fetchNextPage, isFetchingNextPage]
  )

  return { handleScroll }
}
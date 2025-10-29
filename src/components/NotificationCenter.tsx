import React, { useState, useEffect, useRef } from 'react'
import { Bell, X, Check, Clock, Users, Calendar, Megaphone, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNotificationStore, type Notification } from '@/stores/notification-store'
import { cn } from '@/lib/utils'

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'poll':
      return <Clock className="h-4 w-4 text-[#FF6B35]" />
    case 'connection_request':
      return <Users className="h-4 w-4 text-[#007AFF]" />
    case 'schedule_change':
      return <Calendar className="h-4 w-4 text-[#4CAF50]" />
    case 'announcement':
      return <Megaphone className="h-4 w-4 text-[#FF6B35]" />
    case 'system':
      return <Settings className="h-4 w-4 text-[#666666]" />
    default:
      return <Bell className="h-4 w-4 text-[#666666]" />
  }
}

const formatTimestamp = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return new Date(timestamp).toLocaleDateString()
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onRemove: (id: string) => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onRemove,
}) => {
  const handleMarkAsRead = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRemove(notification.id)
  }

  return (
    <div
      className={cn(
        "group relative p-3 sm:p-4 border-b border-[#F0F0F0] last:border-b-0 cursor-pointer hover:bg-[#F8F9FA] active:bg-[#F0F0F0] transition-all duration-150",
        !notification.read && "bg-[#FFF8F5] hover:bg-[#FFF3ED]"
      )}
      onClick={handleMarkAsRead}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5 w-8 h-8 flex items-center justify-center rounded-lg bg-white">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              "text-xs sm:text-sm font-medium text-[#1A1A1A] leading-tight",
              !notification.read && "font-semibold"
            )}>
              {notification.title}
            </h4>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              {!notification.read && (
                <div className="w-2 h-2 bg-[#FF6B35] rounded-full animate-pulse" />
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all rounded-md"
                onClick={handleRemove}
                aria-label="Remove notification"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <p className="text-xs sm:text-sm text-[#666666] mt-1 leading-snug">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] sm:text-xs text-[#999999] font-medium">
              {formatTimestamp(notification.timestamp)}
            </span>
            
            {notification.actionable && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="h-7 px-2 sm:px-3 text-xs bg-[#FF6B35] hover:bg-[#E55A2B] text-white rounded-lg transition-all duration-150"
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 sm:px-3 text-xs border-[#E0E0E0] text-[#666666] hover:bg-[#F5F5F5] rounded-lg transition-all duration-150"
                >
                  Decline
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotificationStore()

  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)

  const recentNotifications = notifications.slice(0, 10)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
      // Prevent body scroll when menu is open on mobile
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscapeKey)
        document.body.style.overflow = 'unset'
      }
    }
  }, [showNotifications])

  return (
    <div className="relative" ref={notificationRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setShowNotifications(!showNotifications)
        }}
        className="relative h-9 w-9 p-0 hover:bg-[#F5F5F5] rounded-lg transition-colors flex items-center justify-center"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={showNotifications}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5 text-[#666666]" />
        {unreadCount > 0 && (
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white hover:bg-red-600 border-2 border-white"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </button>

      {/* Backdrop for mobile */}
      {showNotifications && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm sm:hidden z-[9998]"
          onClick={() => setShowNotifications(false)}
          aria-hidden="true"
        />
      )}

      {/* Notification Dropdown */}
      {showNotifications && (
        <div 
          className="fixed sm:absolute top-14 sm:top-full right-3 sm:right-0 mt-1 sm:mt-2 w-[calc(100vw-1.5rem)] sm:w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-[#E0E0E0] z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ 
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1)',
          }}
          role="dialog"
          aria-label="Notifications"
        >
        <div className="border-b border-[#E5E7EB] p-4 bg-gradient-to-br from-[#F8F9FA] to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FFF8F5] rounded-lg flex items-center justify-center">
                <Bell className="h-4 w-4 text-[#FF6B35]" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-[#1A1A1A]">
                Notifications
              </h3>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-[#FF6B35] hover:text-[#E55A2B] hover:bg-[#FFF8F5] h-7 px-2 rounded-lg transition-all duration-150"
                onClick={markAllAsRead}
              >
                <Check className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Mark all read</span>
                <span className="sm:hidden">Mark read</span>
              </Button>
            )}
          </div>
          
          {unreadCount > 0 && (
            <p className="text-xs sm:text-sm text-[#666666] mt-2">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {recentNotifications.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="w-16 h-16 bg-[#F8F9FA] rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-[#CCCCCC]" />
              </div>
              <p className="text-sm sm:text-base font-medium text-[#666666]">No notifications yet</p>
              <p className="text-xs sm:text-sm text-[#999999] mt-2 max-w-xs mx-auto">
                You'll see updates about polls, connections, and schedule changes here
              </p>
            </div>
          ) : (
            <div>
              {recentNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onRemove={removeNotification}
                />
              ))}
            </div>
          )}
        </div>
        
        {notifications.length > 10 && (
          <div className="border-t border-[#E5E7EB] p-3 bg-[#F8F9FA]">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs sm:text-sm font-medium text-[#FF6B35] hover:text-[#E55A2B] hover:bg-[#FFF8F5] rounded-lg transition-all duration-150"
            >
              View all {notifications.length} notifications
            </Button>
          </div>
        )}
        </div>
      )}
    </div>
  )
}
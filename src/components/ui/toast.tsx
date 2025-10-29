import { useState, useEffect, createContext, useContext, type ReactNode } from 'react'
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const success = (message: string, title?: string) => {
    addToast({ type: 'success', message, title })
  }

  const error = (message: string, title?: string) => {
    addToast({ type: 'error', message, title, duration: 7000 })
  }

  const info = (message: string, title?: string) => {
    addToast({ type: 'info', message, title })
  }

  const warning = (message: string, title?: string) => {
    addToast({ type: 'warning', message, title })
  }

  return (
    <ToastContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      success,
      error,
      info,
      warning
    }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(toast.id), 150)
  }

  const icons = {
    success: CheckCircle,
    error: AlertTriangle,
    info: Info,
    warning: AlertTriangle
  }

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  }

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
    warning: 'text-yellow-600'
  }

  const Icon = icons[toast.type]

  return (
    <div
      className={cn(
        'border rounded-lg p-4 shadow-lg transition-all duration-150 transform',
        colors[toast.type],
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', iconColors[toast.type])} />
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="font-medium text-sm mb-1">{toast.title}</h4>
          )}
          <p className="text-sm">{toast.message}</p>
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={handleRemove}
          className="flex-shrink-0 p-1 hover:bg-black/5 rounded"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
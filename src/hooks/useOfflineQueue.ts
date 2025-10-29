import { useState, useEffect, useRef } from 'react'
import { useNetworkStatus } from './useNetworkStatus'

interface QueuedAction {
  id: string
  type: 'poll_vote' | 'feedback_submit' | 'profile_update' | 'connection_request'
  data: any
  timestamp: number
  retries: number
}

const STORAGE_KEY = 'offline-queue'
const MAX_RETRIES = 3

export const useOfflineQueue = () => {
  const [queue, setQueue] = useState<QueuedAction[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const isOnline = useNetworkStatus()
  const processingRef = useRef(false)

  
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedQueue = JSON.parse(stored)
        setQueue(parsedQueue)
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error)
    }
  }, [])

  
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
    } catch (error) {
      console.error('Failed to save offline queue:', error)
    }
  }, [queue])

  const addToQueue = (action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries'>) => {
    const queuedAction: QueuedAction = {
      ...action,
      id: `${action.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    }

    setQueue(prev => [...prev, queuedAction])
    console.log(`Added action to offline queue: ${queuedAction.type}`)
    
    return queuedAction.id
  }

  const removeFromQueue = (id: string) => {
    setQueue(prev => prev.filter(action => action.id !== id))
  }

  const processAction = async (action: QueuedAction): Promise<boolean> => {
    try {
      let response: Response

      switch (action.type) {
        case 'poll_vote':
          response = await fetch(`/api/polls/${action.data.pollId}/vote`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(action.data),
          })
          break

        case 'feedback_submit':
          response = await fetch(`/api/sessions/${action.data.sessionId}/feedback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(action.data),
          })
          break

        case 'profile_update':
          response = await fetch('/api/users/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(action.data),
          })
          break

        case 'connection_request':
          response = await fetch(`/api/networking/connect/${action.data.userId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(action.data),
          })
          break

        default:
          console.error('Unknown action type:', action.type)
          return false
      }

      if (response.ok) {
        console.log(`Successfully processed offline action: ${action.type}`)
        return true
      } else {
        console.error(`Failed to process offline action: ${action.type}`, response.status)
        return false
      }
    } catch (error) {
      console.error(`Error processing offline action: ${action.type}`, error)
      return false
    }
  }

  const processQueue = async () => {
    if (processingRef.current || !isOnline || queue.length === 0) {
      return
    }

    processingRef.current = true
    setIsProcessing(true)

    console.log(`Processing ${queue.length} queued actions`)

    const actionsToProcess = [...queue]
    const failedActions: QueuedAction[] = []

    for (const action of actionsToProcess) {
      const success = await processAction(action)
      
      if (success) {
        removeFromQueue(action.id)
      } else {
        const updatedAction = {
          ...action,
          retries: action.retries + 1,
        }

        if (updatedAction.retries < MAX_RETRIES) {
          failedActions.push(updatedAction)
        } else {
          console.error(`Max retries reached for action: ${action.type}`)
          removeFromQueue(action.id)
        }
      }
    }

    
    if (failedActions.length > 0) {
      setQueue(prev => prev.map(action => {
        const failedAction = failedActions.find(fa => fa.id === action.id)
        return failedAction || action
      }))
    }

    setIsProcessing(false)
    processingRef.current = false
  }

  
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      
      const timer = setTimeout(processQueue, 1000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, queue.length])

  const clearQueue = () => {
    setQueue([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    queue,
    queueLength: queue.length,
    isProcessing,
    addToQueue,
    removeFromQueue,
    processQueue,
    clearQueue,
  }
}
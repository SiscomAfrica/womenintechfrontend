import { useEffect, useState } from 'react'
import { useMySchedule } from '@/hooks/useSessions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function ScheduleDebugger() {
  const { data: mySessions, isLoading, error, refetch } = useMySchedule()
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    // Test direct API call
    const testDirectCall = async () => {
      try {
        const token = localStorage.getItem('token')
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        
        console.log('[ScheduleDebugger] Testing direct API call')
        console.log('[ScheduleDebugger] API URL:', apiUrl)
        console.log('[ScheduleDebugger] Has token:', !!token)
        
        const response = await fetch(`${apiUrl}/sessions/my-schedule`, {
          headers: {
            'Content-Type': 'application/json',
            'X-Client-App': 'womenintech',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        })
        
        console.log('[ScheduleDebugger] Direct call response:', response.status, response.statusText)
        
        if (response.ok) {
          const data = await response.json()
          console.log('[ScheduleDebugger] Direct call data:', data)
          setDebugInfo({
            status: 'success',
            data,
            url: `${apiUrl}/sessions/my-schedule`,
            hasToken: !!token
          })
        } else {
          const errorText = await response.text()
          console.log('[ScheduleDebugger] Direct call error:', errorText)
          setDebugInfo({
            status: 'error',
            error: errorText,
            statusCode: response.status,
            url: `${apiUrl}/sessions/my-schedule`,
            hasToken: !!token
          })
        }
      } catch (err) {
        console.log('[ScheduleDebugger] Direct call exception:', err)
        setDebugInfo({
          status: 'exception',
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    testDirectCall()
  }, [])

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Schedule Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold">React Query Hook Results:</h3>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify({
              isLoading,
              error: error?.message,
              dataLength: mySessions?.length,
              data: mySessions
            }, null, 2)}
          </pre>
        </div>
        
        <div>
          <h3 className="font-semibold">Direct API Call Results:</h3>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        
        <div>
          <h3 className="font-semibold">Environment:</h3>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify({
              VITE_API_URL: import.meta.env.VITE_API_URL,
              hasToken: !!localStorage.getItem('token'),
              tokenPreview: localStorage.getItem('token')?.substring(0, 20) + '...'
            }, null, 2)}
          </pre>
        </div>
        
        <Button onClick={() => refetch()}>
          Refetch My Schedule
        </Button>
      </CardContent>
    </Card>
  )
}
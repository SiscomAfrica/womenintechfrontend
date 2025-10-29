import React, { useState, useEffect } from 'react'
import { Plus, BarChart3, Play, Pause, Copy, Trash2, Eye, Zap } from 'lucide-react'
import AdminService, { type AdminPoll, type AdminPollResults } from '@/services/admin'
import { usePollRealTime } from '@/hooks/useRealtimeUpdates'
import RealTimeIndicator from '@/components/admin/RealTimeIndicator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface Session {
  id: string
  title: string
  start_time: string
  end_time: string
}

interface PollFormData {
  session_id: string
  title: string
  questions: Array<{
    id: string
    type: 'single_choice' | 'multiple_choice' | 'text' | 'rating'
    question: string
    options?: string[]
    required: boolean
    min_rating?: number
    max_rating?: number
  }>
  is_active: boolean
}

const AdminPollsPage: React.FC = () => {
  const [polls, setPolls] = useState<AdminPoll[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPoll, setSelectedPoll] = useState<AdminPoll | null>(null)
  const [pollResults, setPollResults] = useState<AdminPollResults | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showResultsDialog, setShowResultsDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  // Real-time updates for polls
  const pollRealTime = usePollRealTime(selectedPoll?.id, true)

  const [formData, setFormData] = useState<PollFormData>({
    session_id: '',
    title: '',
    questions: [],
    is_active: true
  })

  useEffect(() => {
    loadData()
  }, [])

  // Reload poll results when real-time updates occur and results dialog is open
  useEffect(() => {
    if (showResultsDialog && selectedPoll && pollRealTime.status.lastUpdate) {
      handleViewResults(selectedPoll)
    }
  }, [pollRealTime.status.lastUpdate, showResultsDialog, selectedPoll])

  const loadData = async () => {
    try {
      setLoading(true)
      const [pollsData, sessionsData] = await Promise.all([
        AdminService.getPolls(),
        fetchSessions()
      ])
      setPolls(pollsData)
      setSessions(sessionsData)
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load polls data')
    } finally {
      setLoading(false)
    }
  }

  const fetchSessions = async (): Promise<Session[]> => {
    // This would typically come from a sessions API endpoint
    // For now, return mock data
    return [
      { id: '1', title: 'Opening Keynote', start_time: '2024-01-15T09:00:00Z', end_time: '2024-01-15T10:00:00Z' },
      { id: '2', title: 'Tech Panel Discussion', start_time: '2024-01-15T10:30:00Z', end_time: '2024-01-15T11:30:00Z' },
      { id: '3', title: 'Networking Session', start_time: '2024-01-15T14:00:00Z', end_time: '2024-01-15T15:00:00Z' }
    ]
  }

  const handleCreatePoll = async () => {
    try {
      if (!formData.session_id || !formData.title || formData.questions.length === 0) {
        toast.error('Please fill in all required fields')
        return
      }

      const questionSchema = {
        questions: formData.questions
      }

      await AdminService.createPoll({
        session_id: formData.session_id,
        title: formData.title,
        question_schema: questionSchema,
        is_active: formData.is_active
      })

      toast.success('Poll created successfully')
      setShowCreateDialog(false)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Failed to create poll:', error)
      toast.error('Failed to create poll')
    }
  }

  const handleTogglePollStatus = async (poll: AdminPoll) => {
    try {
      if (poll.is_active) {
        await AdminService.deactivatePoll(poll.id)
        toast.success('Poll deactivated')
      } else {
        await AdminService.activatePoll(poll.id)
        toast.success('Poll activated')
      }
      loadData()
    } catch (error) {
      console.error('Failed to toggle poll status:', error)
      toast.error('Failed to update poll status')
    }
  }

  const handleDeletePoll = async (pollId: string) => {
    if (!confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return
    }

    try {
      await AdminService.deletePoll(pollId)
      toast.success('Poll deleted successfully')
      loadData()
    } catch (error) {
      console.error('Failed to delete poll:', error)
      toast.error('Failed to delete poll')
    }
  }

  const handleViewResults = async (poll: AdminPoll) => {
    try {
      setSelectedPoll(poll)
      const results = await AdminService.getPollResults(poll.id)
      setPollResults(results)
      setShowResultsDialog(true)
    } catch (error) {
      console.error('Failed to load poll results:', error)
      toast.error('Failed to load poll results')
    }
  }

  const addQuestion = () => {
    const newQuestion = {
      id: `q_${Date.now()}`,
      type: 'single_choice' as const,
      question: '',
      options: ['Option 1', 'Option 2'],
      required: true
    }
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }))
  }

  const updateQuestion = (index: number, updates: Partial<PollFormData['questions'][0]>) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === index ? { ...q, ...updates } : q)
    }))
  }

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
  }

  const resetForm = () => {
    setFormData({
      session_id: '',
      title: '',
      questions: [],
      is_active: true
    })
  }

  const filteredPolls = polls.filter(poll => {
    if (activeTab === 'active') return poll.is_active
    if (activeTab === 'inactive') return !poll.is_active
    return true
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-6 h-6 text-orange-600" />
            <h1 className="text-3xl font-bold tracking-tight">Poll Management</h1>
          </div>
          <p className="text-muted-foreground">
            Create and manage polls for sessions, view results and control poll status
          </p>
        </div>
        <div className="flex items-center gap-4">
          <RealTimeIndicator 
            status={pollRealTime.status}
            onForceUpdate={pollRealTime.forceUpdate}
            showDetails={false}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <div>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Poll
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Poll</DialogTitle>
              <DialogDescription>
                Create a new poll for a session with custom questions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session">Session</Label>
                  <Select value={formData.session_id} onValueChange={(value) => setFormData(prev => ({ ...prev, session_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.map(session => (
                        <SelectItem key={session.id} value={session.id}>
                          {session.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Poll Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter poll title"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="active">Activate poll immediately</Label>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Questions</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </div>

                {formData.questions.map((question, index) => (
                  <Card key={question.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label>Question Type</Label>
                                <Select
                                  value={question.type}
                                  onValueChange={(value: any) => updateQuestion(index, { type: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="single_choice">Single Choice</SelectItem>
                                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="rating">Rating</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={question.required}
                                  onCheckedChange={(checked) => updateQuestion(index, { required: checked })}
                                />
                                <Label>Required</Label>
                              </div>
                            </div>
                            <div>
                              <Label>Question Text</Label>
                              <Textarea
                                value={question.question}
                                onChange={(e) => updateQuestion(index, { question: e.target.value })}
                                placeholder="Enter your question"
                                rows={2}
                              />
                            </div>
                            {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
                              <div>
                                <Label>Options</Label>
                                {question.options?.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex gap-2 mt-2">
                                    <Input
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...(question.options || [])]
                                        newOptions[optionIndex] = e.target.value
                                        updateQuestion(index, { options: newOptions })
                                      }}
                                      placeholder={`Option ${optionIndex + 1}`}
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const newOptions = question.options?.filter((_, i) => i !== optionIndex)
                                        updateQuestion(index, { options: newOptions })
                                      }}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => {
                                    const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`]
                                    updateQuestion(index, { options: newOptions })
                                  }}
                                >
                                  Add Option
                                </Button>
                              </div>
                            )}
                            {question.type === 'rating' && (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label>Min Rating</Label>
                                  <Input
                                    type="number"
                                    value={question.min_rating || 1}
                                    onChange={(e) => updateQuestion(index, { min_rating: parseInt(e.target.value) })}
                                  />
                                </div>
                                <div>
                                  <Label>Max Rating</Label>
                                  <Input
                                    type="number"
                                    value={question.max_rating || 5}
                                    onChange={(e) => updateQuestion(index, { max_rating: parseInt(e.target.value) })}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeQuestion(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {formData.questions.length === 0 && (
                  <Alert>
                    <AlertDescription>
                      Add at least one question to create a poll.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePoll}>
                  Create Poll
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Polls ({polls.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({polls.filter(p => p.is_active).length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({polls.filter(p => !p.is_active).length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredPolls.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No polls found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {activeTab === 'all' 
                    ? 'Create your first poll to get started with gathering feedback from attendees.'
                    : `No ${activeTab} polls found. Try switching to a different tab.`
                  }
                </p>
                {activeTab === 'all' && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Poll
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredPolls.map((poll) => (
                <Card key={poll.id} className="relative">
                  {/* Live indicator for active polls */}
                  {poll.is_active && pollRealTime.status.isConnected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {poll.title}
                          <Badge variant={poll.is_active ? 'default' : 'secondary'}>
                            {poll.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {poll.is_active && (
                            <span className="text-xs text-green-600 font-medium">LIVE</span>
                          )}
                        </CardTitle>
                        <CardDescription>
                          Session: {poll.session_title || 'Unknown Session'} • 
                          Created: {new Date(poll.created_at).toLocaleDateString()} •
                          Responses: {poll.response_count || 0}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewResults(poll)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Results
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePollStatus(poll)}
                        >
                          {poll.is_active ? (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePoll(poll.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Questions: {poll.question_schema?.questions?.length || 0}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Results Dialog */}
      <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Poll Results: {selectedPoll?.title}</DialogTitle>
            <DialogDescription>
              Total Participants: {pollResults?.total_participants || 0}
            </DialogDescription>
          </DialogHeader>
          {pollResults && (
            <div className="space-y-6">
              {pollResults.question_results.map((result) => (
                <Card key={result.question_id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{result.question}</CardTitle>
                    <CardDescription>
                      Type: {result.question_type} • Responses: {result.total_responses}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {result.question_type === 'single_choice' || result.question_type === 'multiple_choice' ? (
                      <div className="space-y-2">
                        {Object.entries(result.results.option_counts || {}).map(([option, count]) => (
                          <div key={option} className="flex justify-between items-center">
                            <span>{option}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${result.total_responses > 0 ? ((count as number) / result.total_responses) * 100 : 0}%`
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium">{count} ({result.results.percentages?.[option]?.toFixed(1)}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : result.question_type === 'rating' ? (
                      <div className="space-y-2">
                        <div className="text-lg font-semibold">
                          Average Rating: {result.results.average_rating || 0}
                        </div>
                        <div className="space-y-1">
                          {Object.entries(result.results.rating_counts || {}).map(([rating, count]) => (
                            <div key={rating} className="flex justify-between items-center">
                              <span>{rating} stars</span>
                              <span className="text-sm">{count as number} responses</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Text Responses ({result.results.response_count || 0}):</div>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {(result.results.responses || []).map((response: string, index: number) => (
                            <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                              {response}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminPollsPage
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Users, CheckCircle, Star, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Poll, PollQuestion, QuestionResult } from '@/types'
import { usePollResults, useMyPollResponse, usePollVote } from '@/hooks/usePolls'
import { toast } from 'sonner'

interface PollCardProps {
  poll: Poll
  onViewResults?: (pollId: string) => void
}

export function PollCard({ poll, onViewResults }: PollCardProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: any }>({})
  
  const { data: pollResults } = usePollResults(poll.id)
  const { data: myResponse } = useMyPollResponse(poll.id)
  const pollVoteMutation = usePollVote()

  const questions: PollQuestion[] = poll.question_schema?.questions || []
  const hasVoted = Boolean(myResponse)
  const shouldShowResults = hasVoted || !poll.is_active

  // Load user's previous responses
  useEffect(() => {
    if (myResponse?.responses) {
      setSelectedAnswers(myResponse.responses)
    }
  }, [myResponse])

  const handleAnswerChange = (questionId: string, answer: any) => {
    if (hasVoted || !poll.is_active) return
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmitVote = async () => {
    if (hasVoted || !poll.is_active) return

    // Validate required questions
    const requiredQuestions = questions.filter(q => q.required)
    const missingAnswers = requiredQuestions.filter(q => !selectedAnswers[q.id])
    
    if (missingAnswers.length > 0) {
      toast.error('Please answer all required questions')
      return
    }

    try {
      await pollVoteMutation.mutateAsync({
        pollId: poll.id,
        responses: selectedAnswers
      })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const getQuestionResult = (questionId: string): QuestionResult | undefined => {
    return pollResults?.question_results.find(r => r.question_id === questionId)
  }

  const renderSingleChoice = (question: PollQuestion, result?: QuestionResult, userAnswer?: string) => {
    const options = question.options || []
    
    return (
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = userAnswer === option
          const percentage = result?.results?.percentages?.[option] || 0
          
          return (
            <button
              key={option}
              onClick={() => handleAnswerChange(question.id, option)}
              disabled={hasVoted || !poll.is_active}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all",
                "focus:outline-none focus:ring-2 focus:ring-orange-500/20",
                shouldShowResults && "cursor-default",
                !shouldShowResults && "cursor-pointer hover:border-orange-500/50 active:scale-[0.99]",
                isSelected && !hasVoted && "border-orange-500 bg-orange-50",
                isSelected && hasVoted && "border-green-500 bg-green-50",
                !isSelected && "border-gray-200 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {isSelected && hasVoted && (
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  )}
                  <span className={cn(
                    "text-sm font-medium",
                    isSelected && hasVoted ? "text-green-700" : "text-gray-900"
                  )}>
                    {option}
                  </span>
                </div>

                {shouldShowResults && result && (
                  <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
                    {Math.round(percentage)}%
                  </span>
                )}
              </div>

              {shouldShowResults && result && (
                <Progress value={percentage} className="h-1.5 mt-2" />
              )}
            </button>
          )
        })}
      </div>
    )
  }

  const renderMultipleChoice = (question: PollQuestion, result?: QuestionResult, userAnswer?: string[]) => {
    const options = question.options || []
    const selectedOptions = Array.isArray(userAnswer) ? userAnswer : []
    
    return (
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option)
          const percentage = result?.results?.percentages?.[option] || 0
          
          return (
            <button
              key={option}
              onClick={() => {
                if (hasVoted || !poll.is_active) return
                
                const newSelection = isSelected
                  ? selectedOptions.filter(o => o !== option)
                  : [...selectedOptions, option]
                
                handleAnswerChange(question.id, newSelection)
              }}
              disabled={hasVoted || !poll.is_active}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all",
                "focus:outline-none focus:ring-2 focus:ring-orange-500/20",
                shouldShowResults && "cursor-default",
                !shouldShowResults && "cursor-pointer hover:border-orange-500/50",
                isSelected && !hasVoted && "border-orange-500 bg-orange-50",
                isSelected && hasVoted && "border-green-500 bg-green-50",
                !isSelected && "border-gray-200"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={cn(
                    "w-4 h-4 border-2 rounded flex items-center justify-center flex-shrink-0",
                    isSelected 
                      ? hasVoted 
                        ? "border-green-600 bg-green-600" 
                        : "border-orange-500 bg-orange-500"
                      : "border-gray-300"
                  )}>
                    {isSelected && (
                      <CheckCircle className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    isSelected && hasVoted ? "text-green-700" : "text-gray-900"
                  )}>
                    {option}
                  </span>
                </div>

                {shouldShowResults && result && (
                  <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
                    {Math.round(percentage)}%
                  </span>
                )}
              </div>

              {shouldShowResults && result && (
                <Progress value={percentage} className="h-1.5 mt-2" />
              )}
            </button>
          )
        })}
      </div>
    )
  }

  const renderRating = (question: PollQuestion, result?: QuestionResult, userAnswer?: number) => {
    const minRating = question.min_rating || 1
    const maxRating = question.max_rating || 5
    const ratings = Array.from({ length: maxRating - minRating + 1 }, (_, i) => minRating + i)
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-1">
          {ratings.map((rating) => {
            const isSelected = userAnswer === rating
            
            return (
              <button
                key={rating}
                onClick={() => handleAnswerChange(question.id, rating)}
                disabled={hasVoted || !poll.is_active}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-orange-500/20",
                  isSelected
                    ? hasVoted
                      ? "text-green-600"
                      : "text-orange-500"
                    : "text-gray-300 hover:text-orange-400",
                  hasVoted || !poll.is_active ? "cursor-default" : "cursor-pointer"
                )}
              >
                <Star 
                  className={cn(
                    "h-6 w-6",
                    isSelected && "fill-current"
                  )} 
                />
              </button>
            )
          })}
        </div>
        
        {shouldShowResults && result && (
          <div className="text-center text-sm text-gray-600">
            Average: {result.results?.average_rating?.toFixed(1) || 0} • {result.results?.total_ratings || 0} ratings
          </div>
        )}
      </div>
    )
  }

  const renderText = (question: PollQuestion, result?: QuestionResult, userAnswer?: string) => {
    return (
      <div className="space-y-2">
        <textarea
          value={userAnswer || ''}
          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          disabled={hasVoted || !poll.is_active}
          placeholder="Type your response..."
          className={cn(
            "w-full p-3 border rounded-lg resize-none text-sm",
            "focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500",
            hasVoted || !poll.is_active
              ? "border-gray-200 bg-gray-50 cursor-default"
              : "border-gray-300"
          )}
          rows={3}
        />
        
        {shouldShowResults && result && (
          <div className="text-sm text-gray-600">
            {result.results?.response_count || 0} responses
          </div>
        )}
      </div>
    )
  }

  const renderQuestion = (question: PollQuestion) => {
    const questionResult = getQuestionResult(question.id)
    const userAnswer = selectedAnswers[question.id] || myResponse?.responses?.[question.id]

    switch (question.type) {
      case 'single_choice':
        return renderSingleChoice(question, questionResult, userAnswer)
      case 'multiple_choice':
        return renderMultipleChoice(question, questionResult, userAnswer)
      case 'rating':
        return renderRating(question, questionResult, userAnswer)
      case 'text':
        return renderText(question, questionResult, userAnswer)
      default:
        return null
    }
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b bg-gray-50/50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge 
                className={cn(
                  "text-xs font-medium",
                  poll.is_active 
                    ? "bg-green-500 hover:bg-green-500" 
                    : "bg-gray-400 hover:bg-gray-400"
                )}
              >
                {poll.is_active ? 'Active' : 'Ended'}
              </Badge>
              
              {hasVoted && (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs font-medium">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Voted
                </Badge>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
              {poll.title}
            </h3>
          </div>

          <div className="flex items-center gap-1 text-gray-600 flex-shrink-0">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">
              {pollResults?.total_participants || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="p-4 sm:p-6 space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-sm font-semibold text-orange-500 flex-shrink-0">
                {index + 1}.
              </span>
              <h4 className="text-sm font-semibold text-gray-900 leading-relaxed">
                {question.question}
                {question.required && (
                  <span className="text-orange-500 ml-1">*</span>
                )}
              </h4>
            </div>
            
            <div className="ml-6">
              {renderQuestion(question)}
            </div>
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          {!hasVoted && poll.is_active && (
            <Button
              onClick={handleSubmitVote}
              disabled={pollVoteMutation.isPending}
              className="w-full sm:flex-1 bg-[#60166b] hover:bg-[#60166b] text-white"
            >
              {pollVoteMutation.isPending ? 'Submitting...' : 'Submit Response'}
            </Button>
          )}

          {onViewResults && (shouldShowResults || hasVoted) && (
            <Button
              variant="outline"
              onClick={() => onViewResults(poll.id)}
              className="w-full sm:flex-1 border-gray-300 hover:bg-gray-50"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              View Detailed Results
            </Button>
          )}
        </div>

        {/* Thank You Message */}
        {hasVoted && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium text-center">
              Thank you for participating! Your response has been recorded.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

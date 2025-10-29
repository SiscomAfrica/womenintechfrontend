import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Users, CheckCircle, Star, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Poll, Question, QuestionResult } from '@/types'
import { usePoll, usePollResults, useMyPollResponse, usePollVote } from '@/hooks/usePolls'
import { toast } from 'sonner'

interface PollCardProps {
  poll: Poll
  className?: string
  showResults?: boolean
  onViewResults?: (pollId: string) => void
}

export function PollCard({
  poll,
  className,
  showResults = false,
  onViewResults,
}: PollCardProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: any }>({})
  
  
  usePoll(poll.id) 
  const { data: pollResults } = usePollResults(poll.id)
  const { data: myResponse } = useMyPollResponse(poll.id)
  const pollVoteMutation = usePollVote()

  const questions: Question[] = poll.question_schema?.questions || []
  const hasVoted = Boolean(myResponse)
  const shouldShowResults = showResults || hasVoted || !poll.is_active

  
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

    
    const requiredQuestions = questions.filter(q => q.required)
    const missingAnswers = requiredQuestions.filter(q => !selectedAnswers[q.id])
    
    if (missingAnswers.length > 0) {
      toast.error(`Please answer all required questions`)
      return
    }

    try {
      await pollVoteMutation.mutateAsync({
        pollId: poll.id,
        responses: selectedAnswers
      })
    } catch (error) {
      
    }
  }

  const handleViewResults = () => {
    onViewResults?.(poll.id)
  }

  const getQuestionResult = (questionId: string): QuestionResult | undefined => {
    return pollResults?.question_results.find(r => r.question_id === questionId)
  }

  const renderQuestion = (question: Question) => {
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

  const renderSingleChoice = (question: Question, result?: QuestionResult, userAnswer?: string) => {
    const options = question.options || []
    
    return (
      <div className="space-y-1.5 sm:space-y-2">
        {options.map((option) => {
          const isSelected = userAnswer === option
          const votes = result?.results?.option_counts?.[option] || 0
          const percentage = result?.results?.percentages?.[option] || 0
          
          return (
            <div key={option} className="relative">
              <button
                onClick={() => handleAnswerChange(question.id, option)}
                disabled={hasVoted || !poll.is_active}
                className={cn(
                  "w-full text-left p-2 sm:p-3 rounded-lg border-2 transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50",
                  shouldShowResults
                    ? "cursor-default"
                    : "cursor-pointer hover:border-[#FF6B35]/50 active:scale-[0.98]",
                  isSelected && !hasVoted
                    ? "border-[#FF6B35] bg-[#FF6B35]/5"
                    : "border-[#E0E0E0] bg-white",
                  isSelected && hasVoted && "border-[#4CAF50] bg-[#4CAF50]/5",
                  hasVoted || !poll.is_active ? "opacity-90" : ""
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                    {isSelected && hasVoted && (
                      <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#4CAF50] flex-shrink-0" />
                    )}
                    <span className={cn(
                      "text-xs sm:text-sm font-medium break-words",
                      isSelected && hasVoted ? "text-[#4CAF50]" : "text-[#1A1A1A]"
                    )}>
                      {option}
                    </span>
                  </div>

                  {shouldShowResults && result && (
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-semibold text-[#333333]">
                        {Math.round(percentage)}%
                      </span>
                      <span className="text-[10px] sm:text-xs text-[#666666]">
                        ({votes})
                      </span>
                    </div>
                  )}
                </div>

                {}
                {shouldShowResults && result && (
                  <div className="mt-2">
                    <Progress 
                      value={percentage} 
                      className={cn(
                        "h-2",
                        isSelected && hasVoted ? "bg-[#4CAF50]/20" : ""
                      )}
                    />
                  </div>
                )}
              </button>
            </div>
          )
        })}
      </div>
    )
  }

  const renderMultipleChoice = (question: Question, result?: QuestionResult, userAnswer?: string[]) => {
    const options = question.options || []
    const selectedOptions = Array.isArray(userAnswer) ? userAnswer : []
    
    return (
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option)
          const votes = result?.results?.option_counts?.[option] || 0
          const percentage = result?.results?.percentages?.[option] || 0
          
          return (
            <div key={option} className="relative">
              <button
                onClick={() => {
                  if (hasVoted || !poll.is_active) return
                  
                  const newSelection = isSelected
                    ? selectedOptions.filter(o => o !== option)
                    : [...selectedOptions, option]
                  
                  handleAnswerChange(question.id, newSelection)
                }}
                disabled={hasVoted || !poll.is_active}
                className={cn(
                  "w-full text-left p-3 rounded-lg border-2 transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50",
                  shouldShowResults
                    ? "cursor-default"
                    : "cursor-pointer hover:border-[#FF6B35]/50",
                  isSelected && !hasVoted
                    ? "border-[#FF6B35] bg-[#FF6B35]/5"
                    : "border-[#E0E0E0] bg-white",
                  isSelected && hasVoted && "border-[#4CAF50] bg-[#4CAF50]/5"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={cn(
                      "w-4 h-4 border-2 rounded flex-shrink-0",
                      isSelected 
                        ? hasVoted 
                          ? "border-[#4CAF50] bg-[#4CAF50]" 
                          : "border-[#FF6B35] bg-[#FF6B35]"
                        : "border-[#E0E0E0]"
                    )}>
                      {isSelected && (
                        <CheckCircle className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span className={cn(
                      "text-sm font-medium truncate",
                      isSelected && hasVoted ? "text-[#4CAF50]" : "text-[#1A1A1A]"
                    )}>
                      {option}
                    </span>
                  </div>

                  {shouldShowResults && result && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-semibold text-[#333333]">
                        {Math.round(percentage)}%
                      </span>
                      <span className="text-xs text-[#666666]">
                        ({votes})
                      </span>
                    </div>
                  )}
                </div>

                {shouldShowResults && result && (
                  <div className="mt-2">
                    <Progress value={percentage} className="h-2" />
                  </div>
                )}
              </button>
            </div>
          )
        })}
      </div>
    )
  }

  const renderRating = (question: Question, result?: QuestionResult, userAnswer?: number) => {
    const minRating = question.min_rating || 1
    const maxRating = question.max_rating || 5
    const ratings = Array.from({ length: maxRating - minRating + 1 }, (_, i) => minRating + i)
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2">
          {ratings.map((rating) => {
            const isSelected = userAnswer === rating
            
            return (
              <button
                key={rating}
                onClick={() => handleAnswerChange(question.id, rating)}
                disabled={hasVoted || !poll.is_active}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50",
                  isSelected
                    ? hasVoted
                      ? "text-[#4CAF50]"
                      : "text-[#FF6B35]"
                    : "text-[#E0E0E0] hover:text-[#FF6B35]",
                  hasVoted || !poll.is_active ? "cursor-default" : "cursor-pointer"
                )}
              >
                <Star 
                  className={cn(
                    "h-6 w-6",
                    isSelected ? "fill-current" : ""
                  )} 
                />
              </button>
            )
          })}
        </div>
        
        {shouldShowResults && result && (
          <div className="text-center">
            <div className="text-lg font-semibold text-[#1A1A1A]">
              Average: {result.results?.average_rating || 0}/5
            </div>
            <div className="text-sm text-[#666666]">
              {result.results?.total_ratings || 0} ratings
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderText = (question: Question, result?: QuestionResult, userAnswer?: string) => {
    return (
      <div className="space-y-2">
        <textarea
          value={userAnswer || ''}
          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          disabled={hasVoted || !poll.is_active}
          placeholder="Enter your response..."
          className={cn(
            "w-full p-3 border-2 rounded-lg resize-none",
            "focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50",
            hasVoted || !poll.is_active
              ? "border-[#E0E0E0] bg-[#F5F5F5] cursor-default"
              : "border-[#E0E0E0] bg-white focus:border-[#FF6B35]"
          )}
          rows={3}
        />
        
        {shouldShowResults && result && (
          <div className="text-sm text-[#666666]">
            {result.results?.response_count || 0} responses
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-lg", className)}>
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
              <Badge 
                className={cn(
                  "text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1",
                  poll.is_active 
                    ? "bg-[#4CAF50] text-white" 
                    : "bg-[#F5F5F5] text-[#666666]"
                )}
              >
                {poll.is_active ? 'Active' : 'Ended'}
              </Badge>
              
              {hasVoted && (
                <Badge className="bg-[#4CAF50]/10 text-[#4CAF50] text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1">
                  <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                  Voted
                </Badge>
              )}
            </div>

            <CardTitle className="text-sm sm:text-base lg:text-lg font-bold text-[#1A1A1A] leading-tight line-clamp-2">
              {poll.title}
            </CardTitle>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1 text-[#666666] flex-shrink-0">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm font-medium">
              {pollResults?.total_participants || 0}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4 sm:space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="space-y-2 sm:space-y-3">
            <div className="flex items-start gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-semibold text-[#FF6B35] flex-shrink-0 mt-0.5">
                {index + 1}.
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-semibold text-[#1A1A1A] leading-relaxed break-words">
                  {question.question}
                  {question.required && (
                    <span className="text-[#FF6B35] ml-1">*</span>
                  )}
                </h4>
              </div>
            </div>
            
            <div className="ml-4 sm:ml-6">
              {renderQuestion(question)}
            </div>
          </div>
        ))}

        {}
        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-6">
          {!hasVoted && poll.is_active && (
            <Button
              onClick={handleSubmitVote}
              disabled={pollVoteMutation.isPending}
              className="w-full sm:flex-1 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-xs sm:text-sm h-9 sm:h-10"
            >
              {pollVoteMutation.isPending ? 'Submitting...' : 'Submit Response'}
            </Button>
          )}

          {onViewResults && (shouldShowResults || hasVoted) && (
            <Button
              variant="outline"
              onClick={handleViewResults}
              className={cn(
                "w-full border-[#E0E0E0] text-[#333333] hover:bg-[#F5F5F5] text-xs sm:text-sm h-9 sm:h-10",
                hasVoted || !poll.is_active ? "sm:flex-1" : "sm:flex-shrink-0"
              )}
            >
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              <span className="truncate">View Results</span>
            </Button>
          )}
        </div>

        {hasVoted && (
          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-[#4CAF50]/10 border border-[#4CAF50]/20 rounded-lg">
            <p className="text-xs sm:text-sm text-[#4CAF50] font-medium text-center leading-relaxed">
              Thank you for participating! Your response has been recorded.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
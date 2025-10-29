import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { StarRating } from '@/components/ui/star-rating'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, CheckCircle, Send, Edit3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  useFeedbackSchema, 
  useUserFeedback, 
  useFeedbackSubmit, 
  useFeedbackUpdate 
} from '@/hooks/useFeedback'
import type { FeedbackQuestion } from '@/types'
import { toast } from 'sonner'

interface FeedbackFormProps {
  sessionId: string
  sessionTitle?: string
  onSuccess?: () => void
  className?: string
}

export function FeedbackForm({
  sessionId,
  sessionTitle,
  onSuccess,
  className,
}: FeedbackFormProps) {
  const [responses, setResponses] = useState<{ [key: string]: any }>({})
  
  
  const { data: schema, isLoading: schemaLoading, error: schemaError } = useFeedbackSchema(sessionId)
  const { data: existingFeedback, isLoading: feedbackLoading } = useUserFeedback(sessionId)
  
  
  const submitMutation = useFeedbackSubmit()
  const updateMutation = useFeedbackUpdate()
  
  const hasExistingFeedback = Boolean(existingFeedback)
  const isSubmitting = submitMutation.isPending || updateMutation.isPending

  
  useEffect(() => {
    if (existingFeedback?.responses) {
      setResponses(existingFeedback.responses)
    }
  }, [existingFeedback])

  const handleRatingChange = (value: number) => {
    setResponses(prev => ({
      ...prev,
      rating: value
    }))
  }

  const handleQuestionResponse = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      question_responses: {
        ...prev.question_responses,
        [questionId]: value
      }
    }))
  }

  const validateForm = (): string[] => {
    const errors: string[] = []
    
    
    if (!responses.rating || responses.rating < 1 || responses.rating > 5) {
      errors.push('Overall rating is required')
    }

    
    const questions = schema?.feedback_schema?.questions || []
    const questionResponses = responses.question_responses || {}
    
    questions.forEach((question: FeedbackQuestion) => {
      if (question.required && !questionResponses[question.id]) {
        errors.push(`Response to "${question.question}" is required`)
      }
    })

    return errors
  }

  const handleSubmit = async () => {
    const errors = validateForm()
    if (errors.length > 0) {
      toast.error(errors[0])
      return
    }

    try {
      if (hasExistingFeedback) {
        await updateMutation.mutateAsync({
          sessionId,
          responses
        })
      } else {
        await submitMutation.mutateAsync({
          sessionId,
          responses
        })
      }
      onSuccess?.()
    } catch (error) {
      
    }
  }

  const renderQuestion = (question: FeedbackQuestion) => {
    const questionResponses = responses.question_responses || {}
    const currentValue = questionResponses[question.id]

    switch (question.type) {
      case 'rating':
        return (
          <div className="space-y-2">
            <StarRating
              value={currentValue || 0}
              onChange={(value) => handleQuestionResponse(question.id, value)}
              max={question.max_rating || 5}
              size="md"
              showValue
            />
          </div>
        )

      case 'single_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <button
                key={option}
                onClick={() => handleQuestionResponse(question.id, option)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border-2 transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50",
                  currentValue === option
                    ? "border-[#FF6B35] bg-[#FF6B35]/5"
                    : "border-[#E0E0E0] bg-white hover:border-[#FF6B35]/50"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex-shrink-0",
                    currentValue === option
                      ? "border-[#FF6B35] bg-[#FF6B35]"
                      : "border-[#E0E0E0]"
                  )}>
                    {currentValue === option && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-[#1A1A1A]">
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )

      case 'multiple_choice':
        const selectedOptions = Array.isArray(currentValue) ? currentValue : []
        return (
          <div className="space-y-2">
            {question.options?.map((option) => {
              const isSelected = selectedOptions.includes(option)
              return (
                <button
                  key={option}
                  onClick={() => {
                    const newSelection = isSelected
                      ? selectedOptions.filter(o => o !== option)
                      : [...selectedOptions, option]
                    handleQuestionResponse(question.id, newSelection)
                  }}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border-2 transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50",
                    isSelected
                      ? "border-[#FF6B35] bg-[#FF6B35]/5"
                      : "border-[#E0E0E0] bg-white hover:border-[#FF6B35]/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-4 h-4 border-2 rounded flex-shrink-0",
                      isSelected
                        ? "border-[#FF6B35] bg-[#FF6B35]"
                        : "border-[#E0E0E0]"
                    )}>
                      {isSelected && (
                        <CheckCircle className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-[#1A1A1A]">
                      {option}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )

      case 'text':
        return (
          <textarea
            value={currentValue || ''}
            onChange={(e) => handleQuestionResponse(question.id, e.target.value)}
            placeholder="Enter your response..."
            className={cn(
              "w-full p-3 border-2 rounded-lg resize-none",
              "focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50",
              "border-[#E0E0E0] bg-white focus:border-[#FF6B35]"
            )}
            rows={4}
          />
        )

      default:
        return null
    }
  }

  if (schemaLoading || feedbackLoading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-5 w-5" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    )
  }

  if (schemaError) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-[#FF6B35] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
            Failed to load feedback form
          </h3>
          <p className="text-[#666666]">
            {schemaError.message || 'Something went wrong while loading the feedback form'}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!schema) {
    return null
  }

  const questions = schema.feedback_schema?.questions || []

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-[#1A1A1A]">
              Session Feedback
            </CardTitle>
            {sessionTitle && (
              <p className="text-sm text-[#666666] mt-1">
                {sessionTitle}
              </p>
            )}
          </div>
          
          {hasExistingFeedback && (
            <Badge className="bg-[#4CAF50]/10 text-[#4CAF50] text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Submitted
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-semibold text-[#1A1A1A]">
              Overall Session Rating
            </Label>
            <span className="text-[#FF6B35] text-sm">*</span>
          </div>
          <StarRating
            value={responses.rating || 0}
            onChange={handleRatingChange}
            size="lg"
            showValue
          />
        </div>

        {}
        {questions.map((question: FeedbackQuestion, index: number) => (
          <div key={question.id} className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-sm font-semibold text-[#FF6B35] flex-shrink-0">
                {index + 1}.
              </span>
              <div className="flex-1">
                <Label className="text-sm font-semibold text-[#1A1A1A] leading-relaxed">
                  {question.question}
                  {question.required && (
                    <span className="text-[#FF6B35] ml-1">*</span>
                  )}
                </Label>
              </div>
            </div>
            
            <div className="ml-6">
              {renderQuestion(question)}
            </div>
          </div>
        ))}

        {}
        <div className="pt-4 border-t border-[#E0E0E0]">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90"
          >
            {isSubmitting ? (
              'Submitting...'
            ) : hasExistingFeedback ? (
              <>
                <Edit3 className="h-4 w-4 mr-2" />
                Update Feedback
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </div>

        {hasExistingFeedback && (
          <div className="mt-4 p-3 bg-[#4CAF50]/10 border border-[#4CAF50]/20 rounded-lg">
            <p className="text-sm text-[#4CAF50] font-medium text-center">
              You have already submitted feedback for this session. You can update your responses above.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
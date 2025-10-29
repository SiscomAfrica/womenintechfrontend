import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  ArrowLeft, 
  Star,
  Loader2,
  Send,
  Circle
} from "lucide-react"
import { useFeedbackSchema, useUserFeedback, useFeedbackSubmit, useFeedbackUpdate } from "@/hooks/useFeedback"
import { toast } from "sonner"

export default function FeedbackPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  
  const { data: schemaResponse, isLoading: schemaLoading } = useFeedbackSchema(sessionId!)
  const { data: existingFeedback, isLoading: feedbackLoading } = useUserFeedback(sessionId!)
  const submitFeedback = useFeedbackSubmit()
  const updateFeedback = useFeedbackUpdate()
  
  const [rating, setRating] = useState(0)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isEditing = !!existingFeedback

  
  useEffect(() => {
    if (existingFeedback) {
      setRating(existingFeedback.responses?.rating || 0)
      setResponses(existingFeedback.responses?.question_responses || {})
    }
  }, [existingFeedback])

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleSubmit = async () => {
    if (!sessionId) return

    if (rating === 0) {
      toast.error('Required', {
        description: 'Please provide an overall rating',
      })
      return
    }

    
    const schema = schemaResponse?.feedback_schema
    if (schema?.questions) {
      const requiredQuestions = schema.questions.filter((q: any) => q.required)
      
      for (const q of requiredQuestions) {
        const response = responses[q.id]
        
        
        if (response === undefined || response === null || response === '') {
          toast.error('Required Field Missing', {
            description: `Please answer: ${q.question}`,
          })
          return
        }
        
        
        if (q.type === 'multiple_choice' && Array.isArray(response) && response.length === 0) {
          toast.error('Required Field Missing', {
            description: `Please select at least one option for: ${q.question}`,
          })
          return
        }
      }
    }

    try {
      setIsSubmitting(true)
      const allResponses = {
        rating,
        question_responses: responses,
      }

      if (isEditing) {
        await updateFeedback.mutateAsync({ sessionId, responses: allResponses })
        toast.success('Your feedback has been updated!')
      } else {
        await submitFeedback.mutateAsync({ sessionId, responses: allResponses })
        toast.success('Thank you for your feedback!')
      }
      
      navigate(-1)
    } catch (error: any) {
      toast.error('Failed to submit feedback', {
        description: error.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderQuestion = (question: any) => {
    const { id, question: questionText, type, options, required, min_rating, max_rating } = question

    switch (type) {
      case 'single_choice':
        return (
          <>
            <Label className="text-base font-medium">
              {questionText}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2 mt-3">
              {options?.map((option: string, index: number) => {
                const isSelected = responses[id] === option
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleResponseChange(id, option)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors flex items-center gap-2 ${
                      isSelected
                        ? 'border-[#FF6B35] bg-[#FF6B35]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Circle
                      className={`h-5 w-5 flex-shrink-0 ${
                        isSelected ? 'fill-[#FF6B35] text-[#FF6B35]' : 'text-gray-300'
                      }`}
                    />
                    <span className={isSelected ? 'text-[#FF6B35] font-medium' : ''}>
                      {option}
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        )

      case 'multiple_choice':
        const currentResponses = Array.isArray(responses[id]) ? responses[id] : []
        return (
          <>
            <Label className="text-base font-medium">
              {questionText}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <p className="text-sm text-text-tertiary mt-1">Select all that apply</p>
            <div className="space-y-2 mt-3">
              {options?.map((option: string, index: number) => {
                const isChecked = currentResponses.includes(option)
                return (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${id}-${index}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleResponseChange(id, [...currentResponses, option])
                        } else {
                          handleResponseChange(id, currentResponses.filter((v: string) => v !== option))
                        }
                      }}
                    />
                    <Label htmlFor={`${id}-${index}`} className="font-normal cursor-pointer">
                      {option}
                    </Label>
                  </div>
                )
              })}
            </div>
          </>
        )

      case 'rating':
        const minRatingValue = min_rating || 1
        const maxRatingValue = max_rating || 5
        const ratingValue = responses[id]

        return (
          <>
            <Label className="text-base font-medium">
              {questionText}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="flex gap-2 flex-wrap mt-3">
              {Array.from({ length: maxRatingValue - minRatingValue + 1 }).map((_, index) => {
                const value = minRatingValue + index
                const isSelected = ratingValue === value
                return (
                  <Button
                    key={value}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={isSelected ? "bg-[#FF6B35] hover:bg-[#E55A2B]" : ""}
                    onClick={() => handleResponseChange(id, value)}
                  >
                    {value}
                  </Button>
                )
              })}
            </div>
            {ratingValue && (
              <p className="text-sm text-text-tertiary mt-2">
                You rated this {ratingValue} out of {maxRatingValue}
              </p>
            )}
          </>
        )

      case 'text':
        return (
          <>
            <Label htmlFor={id} className="text-base font-medium">
              {questionText}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={id}
              placeholder="Enter your response..."
              value={responses[id] || ''}
              onChange={(e) => handleResponseChange(id, e.target.value)}
              rows={3}
              className="resize-none mt-3"
            />
          </>
        )

      default:
        return null
    }
  }

  if (schemaLoading || feedbackLoading) {
    return (
      <div className="min-h-screen bg-bg-tertiary">
        {}
        <div className="bg-white border-b border-border-primary px-4 py-4 flex items-center justify-between sticky top-0 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-text-primary">Feedback</h1>
          <div className="w-10" />
        </div>

        {}
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35]" />
        </div>
      </div>
    )
  }

  if (!schemaResponse) {
    return (
      <div className="min-h-screen bg-bg-tertiary">
        {}
        <div className="bg-white border-b border-border-primary px-4 py-4 flex items-center justify-between sticky top-0 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-text-primary">Feedback</h1>
          <div className="w-10" />
        </div>

        {}
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-text-tertiary">Feedback form not available</p>
        </div>
      </div>
    )
  }

  const schema = schemaResponse.feedback_schema
  const questions = schema?.questions || []

  return (
    <div className="min-h-screen bg-bg-tertiary pb-32 md:pb-24">
      {}
      <div className="bg-white border-b border-border-primary px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-text-primary">
          {isEditing ? 'Edit Feedback' : 'Share Feedback'}
        </h1>
        <div className="w-10" />
      </div>

      {}
      <div className="p-4 space-y-6">
        {}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold text-lg text-text-primary mb-1">
              {schemaResponse.session_title}
            </h2>
            <p className="text-sm text-text-tertiary">
              {isEditing ? 'Update your feedback below' : 'Please share your feedback'}
            </p>
          </CardContent>
        </Card>

        {}
        <Card>
          <CardContent className="p-4 space-y-3">
            <Label className="text-base font-medium">
              Overall Session Rating <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-colors"
                >
                  <Star
                    className={`h-10 w-10 ${
                      rating >= star
                        ? 'fill-[#FF6B35] text-[#FF6B35]'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-text-tertiary">
                You rated this session {rating} out of 5 stars
              </p>
            )}
          </CardContent>
        </Card>

        {}
        {questions.length > 0 && (
          <Card>
            <CardContent className="p-4 space-y-6">
              <div className="pb-3 border-b border-border-primary">
                <h3 className="font-semibold text-text-primary">Feedback Questions</h3>
                <p className="text-sm text-text-tertiary mt-1">
                  {questions.length} question{questions.length !== 1 ? 's' : ''} • 
                  <span className="text-red-500 ml-1">* Required</span>
                </p>
              </div>
              {questions.map((question: any, index: number) => (
                <div key={question.id} className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] text-sm font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      {renderQuestion(question)}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border-primary p-4 z-50 md:bottom-0 mb-[60px] md:mb-0">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
          className="w-full bg-[#FF6B35] text-white hover:bg-[#E55A2B]"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              {isEditing ? 'Update Feedback' : 'Submit Feedback'}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

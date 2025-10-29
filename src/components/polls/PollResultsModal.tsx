import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Users, TrendingUp, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Poll, QuestionResult } from '@/types'
import { usePollResults } from '@/hooks/usePolls'

interface PollResultsModalProps {
  poll: Poll | null
  isOpen: boolean
  onClose: () => void
}

export function PollResultsModal({ poll, isOpen, onClose }: PollResultsModalProps) {
  const { data: results, isLoading } = usePollResults(poll?.id || '')

  if (!poll) return null

  const renderQuestionResults = (questionResult: QuestionResult) => {
    const { question_type } = questionResult

    switch (question_type) {
      case 'single_choice':
      case 'multiple_choice':
        return renderChoiceResults(questionResult)
      case 'rating':
        return renderRatingResults(questionResult)
      case 'text':
        return renderTextResults(questionResult)
      default:
        return null
    }
  }

  const renderChoiceResults = (questionResult: QuestionResult) => {
    const { results: resultData } = questionResult
    const options = Object.keys(resultData?.option_counts || {})
    const percentages = resultData?.percentages || {}
    const counts = resultData?.option_counts || {}

    // Sort by percentage descending
    const sortedOptions = options.sort((a, b) => (percentages[b] || 0) - (percentages[a] || 0))

    return (
      <div className="space-y-3">
        {sortedOptions.map((option, index) => {
          const percentage = percentages[option] || 0
          const count = counts[option] || 0
          const isTopChoice = index === 0

          return (
            <div key={option} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {isTopChoice && (
                    <TrendingUp className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  )}
                  <span className={cn(
                    "text-sm font-medium truncate",
                    isTopChoice ? "text-orange-600" : "text-gray-700"
                  )}>
                    {option}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-bold text-gray-900">
                    {Math.round(percentage)}%
                  </span>
                  <span className="text-xs text-gray-500">
                    ({count} {count === 1 ? 'vote' : 'votes'})
                  </span>
                </div>
              </div>
              <Progress 
                value={percentage} 
                className={cn(
                  "h-2",
                  isTopChoice && "[&>div]:bg-orange-500"
                )}
              />
            </div>
          )
        })}
      </div>
    )
  }

  const renderRatingResults = (questionResult: QuestionResult) => {
    const { results: resultData } = questionResult
    const averageRating = resultData?.average_rating || 0
    const totalRatings = resultData?.total_ratings || 0
    const ratingCounts = resultData?.rating_counts || {}

    // Generate rating stars
    const ratings = [1, 2, 3, 4, 5]

    return (
      <div className="space-y-4">
        {/* Average Display */}
        <div className="flex items-center justify-center gap-3 p-4 bg-orange-50 rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-0.5 mt-1">
              {ratings.map((rating) => (
                <Star
                  key={rating}
                  className={cn(
                    "h-4 w-4",
                    rating <= Math.round(averageRating)
                      ? "text-orange-500 fill-orange-500"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {ratings.reverse().map((rating) => {
            const count = ratingCounts[rating] || 0
            const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0

            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16 flex-shrink-0">
                  <span className="text-sm font-medium text-gray-700">{rating}</span>
                  <Star className="h-3 w-3 text-gray-400 fill-gray-400" />
                </div>
                <div className="flex-1">
                  <Progress value={percentage} className="h-2" />
                </div>
                <span className="text-xs text-gray-600 w-12 text-right flex-shrink-0">
                  {count} ({Math.round(percentage)}%)
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderTextResults = (questionResult: QuestionResult) => {
    const { results: resultData } = questionResult
    const responseCount = resultData?.response_count || 0
    const topResponses = resultData?.top_responses || []

    return (
      <div className="space-y-3">
        <div className="text-sm text-gray-600">
          {responseCount} text {responseCount === 1 ? 'response' : 'responses'} received
        </div>

        {topResponses.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Sample Responses
            </div>
            {topResponses.slice(0, 5).map((response: string, index: number) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 italic">"{response}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 pr-8">
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
              </div>

              <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                {poll.title}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Participation Stats */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {results?.total_participants || 0}
                </div>
                <div className="text-xs text-gray-600">
                  Total Participants
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
              <p className="text-sm text-gray-600 mt-2">Loading results...</p>
            </div>
          )}

          {/* Question Results */}
          {!isLoading && results?.question_results && (
            <div className="space-y-6">
              {results.question_results.map((questionResult, index) => (
                <div key={questionResult.question_id} className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-orange-500 flex-shrink-0">
                      {index + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 leading-relaxed mb-1">
                        {questionResult.question}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {questionResult.total_responses} {questionResult.total_responses === 1 ? 'response' : 'responses'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="ml-6">
                    {renderQuestionResults(questionResult)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && (!results?.question_results || results.question_results.length === 0) && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600">No results available yet</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { StarRating } from '@/components/ui/star-rating'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import { Users, TrendingUp, MessageSquare, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSessionFeedbackSummary } from '@/hooks/useFeedback'

interface FeedbackSummaryProps {
  sessionId: string
  sessionTitle?: string
  className?: string
}

const COLORS = ['#FF6B35', '#007AFF', '#4CAF50', '#F38181', '#4ECDC4', '#95E1D3', '#A8E6CF']

export function FeedbackSummary({
  sessionId,
  sessionTitle,
  className,
}: FeedbackSummaryProps) {
  const { data: summary, isLoading, error } = useSessionFeedbackSummary(sessionId)

  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <Skeleton className="h-8 w-20 mx-auto" />
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-6 w-6" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-32 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-[#FF6B35] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
            Failed to load feedback summary
          </h3>
          <p className="text-[#666666]">
            {error.message || 'Something went wrong while loading the feedback summary'}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!summary) {
    return null
  }

  const renderRatingDistribution = () => {
    const chartData = Object.entries(summary.rating_distribution).map(([rating, count]) => ({
      rating: `${rating} Star${rating === '1' ? '' : 's'}`,
      value: count,
      percentage: summary.total_responses > 0 ? Math.round((count / summary.total_responses) * 100) : 0
    })).reverse() 

    return (
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Rating Distribution
        </h4>
        
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="rating" 
                tick={{ fontSize: 12 }}
                interval={0}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value, name) => [`${value} responses (${chartData.find(d => d.rating === name)?.percentage}%)`, 'Count']}
                labelStyle={{ color: '#1A1A1A' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          {chartData.map((item) => (
            <div key={item.rating} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#1A1A1A]">
                  {item.rating}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#333333]">
                    {item.percentage}%
                  </span>
                  <span className="text-xs text-[#666666]">
                    ({item.value})
                  </span>
                </div>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderQuestionSummary = (questionSummary: any) => {
    const { type, total_responses } = questionSummary

    switch (type) {
      case 'rating':
        const { average_rating, rating_distribution } = questionSummary
        return (
          <div className="space-y-3">
            <div className="text-center py-3 bg-[#F8F9FA] rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <StarRating
                  value={Math.round(average_rating)}
                  size="md"
                  disabled
                />
              </div>
              <div className="text-lg font-bold text-[#1A1A1A]">
                {average_rating.toFixed(1)}/5
              </div>
              <div className="text-sm text-[#666666]">
                Average from {total_responses} responses
              </div>
            </div>

            {rating_distribution && (
              <div className="space-y-2">
                {Object.entries(rating_distribution)
                  .sort(([a], [b]) => Number(b) - Number(a))
                  .map(([rating, count]) => {
                    const percentage = total_responses > 0 ? Math.round(((count as number) / total_responses) * 100) : 0
                    return (
                      <div key={rating} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#1A1A1A]">
                            {rating} Star{rating === '1' ? '' : 's'}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#333333]">
                              {percentage}%
                            </span>
                            <span className="text-xs text-[#666666]">
                              ({count as number})
                            </span>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-1.5" />
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        )

      case 'single_choice':
      case 'multiple_choice':
        const { option_counts } = questionSummary
        const totalVotes = Object.values(option_counts).reduce((sum: number, count: any) => sum + count, 0)
        
        return (
          <div className="space-y-3">
            {Object.entries(option_counts)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([option, count], index) => {
                const percentage = (totalVotes as number) > 0 ? Math.round(((count as number) / (totalVotes as number)) * 100) : 0
                return (
                  <div key={option} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium text-[#1A1A1A] truncate">
                          {option}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-semibold text-[#333333]">
                          {percentage}%
                        </span>
                        <span className="text-xs text-[#666666]">
                          ({count as number})
                        </span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
          </div>
        )

      case 'text':
        const { sample_responses } = questionSummary
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#666666]">
                Sample responses:
              </span>
              <Badge className="bg-[#F5F5F5] text-[#666666] text-xs">
                {total_responses} total
              </Badge>
            </div>
            
            {sample_responses && sample_responses.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {sample_responses.slice(0, 5).map((response: any, index: number) => (
                  <div 
                    key={index}
                    className="p-3 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0]"
                  >
                    <p className="text-sm text-[#1A1A1A] leading-relaxed">
                      "{response as string}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-[#666666]">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No text responses yet</p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-[#1A1A1A]">
              Feedback Summary
            </CardTitle>
            {sessionTitle && (
              <p className="text-sm text-[#666666] mt-1">
                {sessionTitle}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-[#666666] flex-shrink-0">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">
              {summary.total_responses} responses
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {}
        <div className="text-center py-4 bg-[#F8F9FA] rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <StarRating
              value={Math.round(summary.average_rating)}
              size="lg"
              disabled
            />
          </div>
          <div className="text-2xl font-bold text-[#1A1A1A]">
            {summary.average_rating.toFixed(1)}/5
          </div>
          <div className="text-sm text-[#666666]">
            Average rating from {summary.total_responses} responses
          </div>
        </div>

        {}
        {renderRatingDistribution()}

        {}
        {summary.question_summaries.map((questionSummary, index) => (
          <div key={questionSummary.question_id} className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-sm font-semibold text-[#FF6B35] flex-shrink-0">
                {index + 1}.
              </span>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-[#1A1A1A] leading-relaxed">
                  {questionSummary.question}
                </h4>
                <Badge className="bg-[#F5F5F5] text-[#666666] text-xs font-medium mt-1">
                  {questionSummary.type.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            
            <div className="ml-6">
              {renderQuestionSummary(questionSummary)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
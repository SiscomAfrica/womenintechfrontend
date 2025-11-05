import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Star, Users, TrendingUp } from 'lucide-react'
import type { QuestionResult } from '@/types'
import { cn } from '@/lib/utils'

interface PollResultsChartProps {
  questionResult: QuestionResult
  className?: string
}

const COLORS = ['#60166b', '#8b5cf6', '#a78bfa', '#c084fc', '#d8b4fe', '#e9d5ff', '#f3e8ff']

export function PollResultsChart({ questionResult, className }: PollResultsChartProps) {
  const renderChoiceResults = () => {
    const optionCounts = questionResult.results?.option_counts || {}
    const percentages = questionResult.results?.percentages || {}
    
    const chartData = Object.entries(optionCounts).map(([option, count], index) => ({
      name: option,
      value: count as number,
      percentage: Math.round((percentages[option] as number) || 0),
      color: COLORS[index % COLORS.length]
    }))

    const totalVotes = chartData.reduce((sum, item) => sum + item.value, 0)

    return (
      <div className="space-y-4">
        {}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value, name) => [`${value} votes (${chartData.find(d => d.name === name)?.percentage}%)`, 'Votes']}
                labelStyle={{ color: '#1A1A1A' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Detailed Breakdown
          </h4>
          
          {chartData
            .sort((a, b) => b.value - a.value)
            .map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-[#1A1A1A] truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold text-[#333333]">
                      {item.percentage}%
                    </span>
                    <span className="text-xs text-[#666666]">
                      ({item.value} votes)
                    </span>
                  </div>
                </div>
                <Progress 
                  value={item.percentage} 
                  className="h-2"
                  style={{ 
                    '--progress-background': item.color 
                  } as React.CSSProperties}
                />
              </div>
            ))}
        </div>

        {}
        <div className="flex items-center justify-between pt-2 border-t border-[#E0E0E0]">
          <div className="flex items-center gap-1 text-[#666666]">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">
              {totalVotes} total responses
            </span>
          </div>
          
          {chartData.length > 0 && (
            <Badge className="bg-[#60166b]/10 text-[#60166b] text-xs">
              Winner: {chartData[0].name}
            </Badge>
          )}
        </div>
      </div>
    )
  }

  const renderRatingResults = () => {
    const averageRating = questionResult.results?.average_rating || 0
    const ratingCounts = questionResult.results?.rating_counts || {}
    const totalRatings = questionResult.results?.total_ratings || 0

    const chartData = Object.entries(ratingCounts).map(([rating, count]) => ({
      rating: `${rating} Star${rating === '1' ? '' : 's'}`,
      value: count as number,
      percentage: totalRatings > 0 ? Math.round(((count as number) / totalRatings) * 100) : 0
    }))

    return (
      <div className="space-y-4">
        {}
        <div className="text-center py-4 bg-[#F8F9FA] rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-6 w-6",
                    star <= Math.round(averageRating)
                      ? "text-[#60166b] fill-current"
                      : "text-[#E0E0E0]"
                  )}
                />
              ))}
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1A1A1A]">
            {averageRating.toFixed(1)}/5
          </div>
          <div className="text-sm text-[#666666]">
            Average rating from {totalRatings} responses
          </div>
        </div>

        {}
        {chartData.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#1A1A1A]">
              Rating Distribution
            </h4>
            
            {chartData.reverse().map((item) => (
              <div key={item.rating} className="space-y-2">
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
        )}
      </div>
    )
  }

  const renderTextResults = () => {
    const responses = questionResult.results?.responses || []
    const responseCount = questionResult.results?.response_count || 0

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-[#1A1A1A]">
            Text Responses
          </h4>
          <Badge className="bg-[#F5F5F5] text-[#666666] text-xs">
            {responseCount} responses
          </Badge>
        </div>

        {responses.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {responses.slice(0, 10).map((response: string, index: number) => (
              <div 
                key={index}
                className="p-3 bg-[#F8F9FA] rounded-lg border border-[#E0E0E0]"
              >
                <p className="text-sm text-[#1A1A1A] leading-relaxed">
                  "{response}"
                </p>
              </div>
            ))}
            
            {responses.length > 10 && (
              <div className="text-center">
                <Badge className="bg-[#60166b]/10 text-[#60166b] text-xs">
                  +{responses.length - 10} more responses
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-[#666666]">
            <p className="text-sm">No text responses yet</p>
          </div>
        )}
      </div>
    )
  }

  const renderResults = () => {
    switch (questionResult.question_type) {
      case 'single_choice':
      case 'multiple_choice':
        return renderChoiceResults()
      case 'rating':
        return renderRatingResults()
      case 'text':
        return renderTextResults()
      default:
        return (
          <div className="text-center py-8 text-[#666666]">
            <p className="text-sm">No results available</p>
          </div>
        )
    }
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-[#1A1A1A] leading-tight">
          {questionResult.question}
        </CardTitle>
        
        <div className="flex items-center gap-2">
          <Badge className="bg-[#F5F5F5] text-[#666666] text-xs font-medium">
            {questionResult.question_type.replace('_', ' ')}
          </Badge>
          <span className="text-xs text-[#666666]">
            {questionResult.total_responses} responses
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {renderResults()}
      </CardContent>
    </Card>
  )
}
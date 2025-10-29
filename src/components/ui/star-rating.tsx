import * as React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  max?: number
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  showValue?: boolean
  className?: string
}

export function StarRating({
  value,
  onChange,
  max = 5,
  size = 'md',
  disabled = false,
  showValue = false,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null)

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const handleClick = (rating: number) => {
    if (!disabled && onChange) {
      onChange(rating)
    }
  }

  const handleMouseEnter = (rating: number) => {
    if (!disabled) {
      setHoverValue(rating)
    }
  }

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoverValue(null)
    }
  }

  const getStarState = (starIndex: number) => {
    const currentValue = hoverValue !== null ? hoverValue : value
    return starIndex <= currentValue
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: max }, (_, index) => {
          const starIndex = index + 1
          const isActive = getStarState(starIndex)
          
          return (
            <button
              key={starIndex}
              type="button"
              onClick={() => handleClick(starIndex)}
              onMouseEnter={() => handleMouseEnter(starIndex)}
              onMouseLeave={handleMouseLeave}
              disabled={disabled}
              className={cn(
                'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 rounded',
                disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110',
                isActive
                  ? disabled
                    ? 'text-[#E0E0E0]'
                    : hoverValue !== null
                    ? 'text-[#FF6B35]'
                    : 'text-[#FF6B35]'
                  : 'text-[#E0E0E0] hover:text-[#FF6B35]/50'
              )}
            >
              <Star 
                className={cn(
                  sizeClasses[size],
                  isActive ? 'fill-current' : ''
                )} 
              />
            </button>
          )
        })}
      </div>
      
      {showValue && (
        <span className="text-sm font-medium text-[#666666] ml-2">
          {value}/{max}
        </span>
      )}
    </div>
  )
}
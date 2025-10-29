import * as React from "react"
import { cn } from "@/lib/utils"

interface CodeInputProps {
  length?: number
  value: string[]
  onChange: (value: string[]) => void
  onComplete?: (code: string) => void
  disabled?: boolean
  className?: string
}

export function CodeInput({ 
  length = 6, 
  value, 
  onChange, 
  onComplete,
  disabled = false,
  className 
}: CodeInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  React.useEffect(() => {
    
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  React.useEffect(() => {
    
    if (value.every(digit => digit !== '') && onComplete) {
      onComplete(value.join(''))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const handleChange = (index: number, inputValue: string) => {
    
    if (inputValue.length > 1) {
      const pastedCode = inputValue.slice(0, length).split('')
      const newValue = [...value]
      pastedCode.forEach((char, i) => {
        if (index + i < length) {
          newValue[index + i] = char
        }
      })
      onChange(newValue)

      
      const nextIndex = Math.min(index + pastedCode.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
      return
    }

    
    const newValue = [...value]
    newValue[index] = inputValue
    onChange(newValue)

    
    if (inputValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className={cn("flex justify-center gap-3", className)}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(ref) => { inputRefs.current[index] = ref }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={length}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          disabled={disabled}
          className={cn(
            "w-12 h-14 text-center text-2xl font-bold",
            "border-2 border-border-dark rounded-app-md bg-bg-input",
            "text-text-primary placeholder:text-text-placeholder",
            "transition-all duration-200 outline-none",
            "focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 focus:bg-bg-primary",
            value[index] && "border-primary-orange bg-bg-primary",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  )
}
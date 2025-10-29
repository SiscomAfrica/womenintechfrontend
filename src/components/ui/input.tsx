import * as React from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  error?: string
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword = type === "password"
    const inputType = isPassword && showPassword ? "text" : type

    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">
            {icon}
          </div>
        )}
        <input
          type={inputType}
          data-slot="input"
          className={cn(
            
            "w-full h-14 px-4 py-3 text-base bg-bg-input border border-border-dark rounded-app-md",
            "text-text-primary placeholder:text-text-placeholder",
            "transition-all duration-200 outline-none",
            
            "focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20",
            
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-secondary",
            
            icon && "pl-12",
            
            isPassword && "pr-12",
            className
          )}
          ref={ref}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
          >
            {showPassword ? (
              <EyeOffIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }

import * as React from "react"
import { Label } from "./label"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label?: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function FormField({ 
  label, 
  error, 
  required, 
  children, 
  className 
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-base font-semibold text-text-secondary">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}